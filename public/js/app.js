(function () {
  'use strict';

  const boot = JSON.parse(document.getElementById('boot').textContent);
  const WARN = boot.warn, CRIT = boot.crit, REFRESH_MS = boot.refreshMs, LABEL = boot.labels;
  const CIRC = 2 * Math.PI * 54;
  const WINDOW_MS = 180000;
  const FETCH_TIMEOUT_MS = 8000;
  const MEM_SOURCES = { cgroup: 'Limite do contêiner', meminfo: 'Estimativa do kernel (MemAvailable)', os: 'Memória livre do SO' };

  const cache = {};
  const $ = (id) => cache[id] || (cache[id] = document.getElementById(id));
  const setText = (id, text) => { const e = $(id); if (e.textContent !== text) e.textContent = text; };
  const level = (p) => (p >= CRIT ? 'hot' : p >= WARN ? 'warn' : 'ok');
  const fmtMB = (mb) => (mb >= 1024 ? (mb / 1024).toFixed(1) + ' GB' : mb + ' MB');
  const pad = (n) => (n < 10 ? '0' + n : '' + n);
  const clock = (d) => pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());

  const tabs = Array.from(document.querySelectorAll('.tab-btn'));
  function switchTab(name) {
    tabs.forEach((b) => {
      const on = b.dataset.tab === name;
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
    });
    $('dashboardTab').classList.toggle('active', name === 'dashboard');
    $('diagTab').classList.toggle('active', name === 'diag');
  }
  tabs.forEach((b, i) => {
    b.addEventListener('click', () => switchTab(b.dataset.tab));
    b.addEventListener('keydown', (e) => {
      const to = { ArrowRight: (i + 1) % tabs.length, ArrowLeft: (i + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 }[e.key];
      if (to === undefined) return;
      e.preventDefault();
      switchTab(tabs[to].dataset.tab);
      tabs[to].focus();
    });
  });
  document.querySelectorAll('.tape').forEach((a) => a.addEventListener('click', () => switchTab('dashboard')));

  function setRing(key, pct) {
    const ring = $(key + 'Ring');
    const host = ring.closest('.ring');
    if (pct === null) {
      ring.style.strokeDashoffset = CIRC.toFixed(1);
      ring.classList.remove('warn', 'hot');
      host.style.setProperty('--pulse', '3.2s');
      host.style.setProperty('--glow', '0px');
      setText(key + 'Pct', '—');
      setText(key + 'Mood', 'N/D');
      return;
    }
    const lv = level(pct);
    host.style.setProperty('--pulse', (3.2 - 2.6 * pct / 100).toFixed(2) + 's');
    host.style.setProperty('--glow', (3 + 11 * pct / 100).toFixed(1) + 'px');
    ring.style.strokeDashoffset = (CIRC * (1 - pct / 100)).toFixed(1);
    ring.classList.toggle('warn', lv === 'warn');
    ring.classList.toggle('hot', lv === 'hot');
    setText(key + 'Pct', pct + '%');
    setText(key + 'Mood', LABEL[lv]);
  }

  const series = { cpu: [], ram: [] };
  let lastStamp = 0;
  let lastLevels = null;
  let eventCount = 0;
  const eventsEl = $('events');

  function pushPoint(key, t, v) {
    const s = series[key];
    s.push([t, v]);
    while (s[0][0] < t - WINDOW_MS) s.shift();
    const x = (pt) => (300 - ((t - pt[0]) / WINDOW_MS) * 300).toFixed(1);
    $(key + 'Line').setAttribute('points', s.map((pt) => x(pt) + ',' + (100 - pt[1])).join(' '));
    setText(key + 'Now', v + '%');
  }

  function logEvent(text, lv) {
    if (eventCount++ === 0) eventsEl.textContent = '';
    const li = document.createElement('li');
    const t = document.createElement('time');
    t.textContent = clock(new Date());
    const span = document.createElement('span');
    span.className = lv;
    span.textContent = text;
    li.append(t, span);
    eventsEl.prepend(li);
    while (eventsEl.children.length > 30) eventsEl.lastChild.remove();
  }

  function trackLevels(d) {
    const cur = { 'Processador': level(d.loadPercent), 'Memória': level(d.memUsagePercent) };
    if (d.disk && d.disk.available) cur['Armazenamento'] = level(d.disk.percent);
    if (lastLevels) {
      for (const k of Object.keys(cur)) {
        if (lastLevels[k] !== undefined && lastLevels[k] !== cur[k]) {
          logEvent(k + ': ' + LABEL[lastLevels[k]] + ' → ' + LABEL[cur[k]], cur[k]);
        }
      }
    }
    lastLevels = cur;
  }

  const rain = window.Rain;
  const PRESETS = { drizzle: 20, rain: 50, storm: 100 };
  const TINTS = { ok: '150,215,255', warn: '255,196,110', hot: '255,110,140' };
  const STORE_KEY = 'sm-rain';
  const rainBtns = Array.from(document.querySelectorAll('[data-rain]'));
  const range = $('rainRange');
  const rainState = { mode: 'sync', value: 50 };
  let syncValue = 0;
  let weatherKey = '';

  function saveRain() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(rainState)); } catch (e) {}
  }

  function renderRain() {
    rainBtns.forEach((b) => {
      const on = b.dataset.rain === rainState.mode;
      b.setAttribute('aria-pressed', String(on));
      b.classList.toggle('on', on);
    });
    const v = rainState.mode === 'sync' ? syncValue : rainState.value;
    range.value = v;
    range.style.setProperty('--fill', v + '%');
    range.setAttribute('aria-valuetext', v + '%');
    setText('rainOut', v + '%');
    rain.setIntensity(v / 100);
    rain.setTint(TINTS[rainState.mode === 'sync' ? level(syncValue) : 'ok']);
  }

  function climate(p) {
    if (p < 25) return { key: 'clear', text: 'Céu Limpo', icon: '☾' };
    if (p < WARN) return { key: 'light', text: 'Chuva Leve', icon: '☁' };
    if (p < CRIT) return { key: 'heavy', text: 'Chuva Pesada', icon: '☂' };
    return { key: 'storm', text: 'Tempestade de Dados', icon: '⚡' };
  }

  function updateWeather(d) {
    syncValue = Math.max(d.loadPercent || 0, d.memUsagePercent || 0);
    const c = climate(syncValue);
    const weather = $('weather');
    weather.title = 'CPU ' + d.loadPercent + '% · RAM ' + d.memUsagePercent + '%';
    if (c.key !== weatherKey) {
      weatherKey = c.key;
      weather.dataset.weather = c.key;
      setText('weatherText', c.text);
      setText('weatherIcon', c.icon);
    }
    if (rain && rainState.mode === 'sync') renderRain();
  }

  if (rain) {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY));
      if (saved && (saved.mode === 'sync' || saved.mode === 'manual' || PRESETS[saved.mode] !== undefined)) {
        rainState.mode = saved.mode;
        rainState.value = Math.max(0, Math.min(100, Number(saved.value) || 50));
      }
    } catch (e) {}

    rainBtns.forEach((b) => b.addEventListener('click', () => {
      rainState.mode = b.dataset.rain;
      if (PRESETS[rainState.mode] !== undefined) rainState.value = PRESETS[rainState.mode];
      saveRain();
      renderRain();
    }));
    range.addEventListener('input', () => {
      rainState.mode = 'manual';
      rainState.value = Number(range.value);
      saveRain();
      renderRain();
    });
    const updateNote = () => { $('rainNote').hidden = !rain.isReduced(); };
    rain.onMotionChange(updateNote);
    updateNote();
    renderRain();
  } else {
    document.querySelector('.rain-panel').hidden = true;
  }

  function apply(d) {
    const load = (v) => (d.loadSupported !== false ? v : 'Indisponível');
    const diskOk = !!(d.disk && d.disk.available);

    setRing('ram', d.memUsagePercent);
    setRing('cpu', d.loadPercent);
    setRing('disk', diskOk ? d.disk.percent : null);
    setText('diskText', diskOk ? d.disk.usedGB + ' GB de ' + d.disk.totalGB + ' GB' : 'Indisponível neste ambiente');
    setText('ramText', fmtMB(d.usedMem) + ' de ' + fmtMB(d.totalMem));
    setText('loadAvg', load(d.load1));
    setText('processMem', d.processMem + ' MB');
    setText('rss', d.rss + ' MB');
    setText('freeMem', fmtMB(d.freeMem));
    setText('memSource', MEM_SOURCES[d.memSource] || '');
    setText('uptime', d.uptime);
    setText('procUptime', d.processUptime);
    setText('load1', load(d.load1));
    setText('load5', load(d.load5));
    setText('load15', load(d.load15));
    setText('clock', d.serverTime);

    d.cores.forEach((u, i) => {
      const bar = $('core' + i);
      if (bar) { bar.style.width = u + '%'; setText('corePct' + i, u + '%'); }
    });

    const lv = level(Math.max(d.memUsagePercent, d.loadPercent, diskOk ? d.disk.percent : 0));
    setText('stateText', LABEL[lv]);
    $('stateText').className = 'value ' + lv;
    setText('heroState', LABEL[lv]);
    $('heroState').className = lv;
    setText('heroStats', 'RAM ' + d.memUsagePercent + '% · CPU ' + d.loadPercent + '%');

    if (d.timestamp > lastStamp) {
      lastStamp = d.timestamp;
      pushPoint('cpu', d.timestamp, d.loadPercent);
      pushPoint('ram', d.timestamp, d.memUsagePercent);
    }
    trackLevels(d);
    updateWeather(d);
  }

  let online = true;
  function setConnection(ok) {
    $('connStatus').classList.toggle('offline', !ok);
    setText('connText', ok ? 'Servidor ativo' : 'Sem conexão com o servidor');
    $('updated').classList.toggle('error', !ok);
    setText('updated', ok ? 'Atualizado às ' + clock(new Date()) : 'Falha ao atualizar — nova tentativa em instantes');
    if (ok !== online) {
      online = ok;
      setText('connAnnounce', ok ? 'Conexão restabelecida' : 'Sem conexão com o servidor');
    }
  }

  let inflight = false;
  let paused = false;
  async function refresh() {
    if (inflight) return;
    inflight = true;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch('/api/stats', { cache: 'no-store', signal: ctrl.signal });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      apply(await res.json());
      setConnection(true);
    } catch (e) {
      console.warn('Falha ao atualizar:', e);
      setConnection(false);
    } finally {
      clearTimeout(timer);
      inflight = false;
    }
  }

  $('refreshBtn').addEventListener('click', refresh);
  $('pauseBtn').addEventListener('click', function () {
    paused = !paused;
    this.setAttribute('aria-pressed', String(paused));
    this.classList.toggle('on', paused);
    this.textContent = paused ? 'Retomar atualização' : 'Pausar atualização';
    if (paused) setText('updated', 'Atualização pausada');
    else refresh();
  });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && !paused) refresh(); });

  apply(boot.stats);
  setConnection(true);
  setInterval(() => { if (!paused && !document.hidden) refresh(); }, REFRESH_MS);
})();
