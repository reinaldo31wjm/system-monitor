'use strict';

const os = require('os');
const { getNetworks } = require('./metrics');

const WARN_THRESHOLD = 60;
const CRIT_THRESHOLD = 85;
const REFRESH_INTERVAL_MS = 3000;
const CIRC = 2 * Math.PI * 54;
const LEVEL_LABEL = { ok: 'Normal', warn: 'Atenção', hot: 'Crítico' };

const SHOW_HOST_DETAILS = process.env.SHOW_HOST_DETAILS === 'true';

const ASSET_V = Date.now().toString(36);

const esc = (v) =>
  String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const level = (p) => (p >= CRIT_THRESHOLD ? 'hot' : p >= WARN_THRESHOLD ? 'warn' : 'ok');
const fmtMB = (mb) => (mb >= 1024 ? (mb / 1024).toFixed(1) + ' GB' : mb + ' MB');
const ringOffset = (p) => (CIRC * (1 - (p === null ? 0 : p) / 100)).toFixed(1);

function card(label, value, { id, cls = '', wide = false, sub = '' } = {}) {
  return `<div class="card${wide ? ' wide' : ''}"><span class="label">${esc(label)}</span><span class="value${cls}"${id ? ` id="${id}"` : ''}>${esc(value)}</span>${sub}</div>`;
}

function gauge(key, title, subtitle, pct, detail) {
  const lv = pct === null ? null : level(pct);
  return `
        <div class="gauge">
          <div class="ring">
            <svg viewBox="0 0 132 132" aria-hidden="true">
              <circle class="track" cx="66" cy="66" r="54"/>
              <circle class="fill${lv && lv !== 'ok' ? ' ' + lv : ''}" id="${key}Ring" cx="66" cy="66" r="54" style="stroke-dashoffset:${ringOffset(pct)}"/>
            </svg>
            <div class="center"><span class="num" id="${key}Pct">${pct === null ? '—' : pct + '%'}</span><span class="mood" id="${key}Mood">${pct === null ? 'N/D' : LEVEL_LABEL[lv]}</span></div>
          </div>
          <div>
            <h3>${esc(title)}</h3>
            <p>${esc(subtitle)}</p>
            <p class="detail">${detail}</p>
          </div>
        </div>`;
}

function chart(key, title, label) {
  const y = (t) => 100 - t;
  return `
        <div class="chart">
          <div class="chart-head"><h3>${title}</h3><span id="${key}Now">--</span></div>
          <svg viewBox="0 0 300 100" preserveAspectRatio="none" role="img" aria-label="${label}">
            <line class="grid-line" x1="0" y1="50" x2="300" y2="50"/>
            <line class="warn-line" x1="0" y1="${y(WARN_THRESHOLD)}" x2="300" y2="${y(WARN_THRESHOLD)}"/>
            <line class="crit-line" x1="0" y1="${y(CRIT_THRESHOLD)}" x2="300" y2="${y(CRIT_THRESHOLD)}"/>
            <polyline id="${key}Line" points=""/>
          </svg>
          <div class="chart-note">Últimos 3 minutos · linhas tracejadas: atenção (${WARN_THRESHOLD}%) e crítico (${CRIT_THRESHOLD}%)</div>
        </div>`;
}

const section = (n, title, id) =>
  `<div class="section-title"${id ? ` id="${id}"` : ''}><span class="n">#${n}</span> ${title}</div>`;

const strip = '<span>SYSTEM MONITOR</span>'.repeat(8);
const MARQUEE = `<div class="marquee" aria-hidden="true"><div class="track">${strip}${strip}</div></div>`;

const HERO = `
    <section class="hero">
      ${MARQUEE}
      <div class="hero-body">
        <div class="hero-left">
          <div class="top-row">
            <div class="dots" aria-hidden="true"><i></i><i></i><i></i></div>
            <span class="status" id="connStatus"><i></i> <span id="connText">Servidor ativo</span></span>
            <span class="weather" id="weather" data-weather="clear"><span class="w-ico" id="weatherIcon" aria-hidden="true">☾</span><span><span class="sr-only">Clima do servidor: </span><span id="weatherText">Céu Limpo</span></span></span>
          </div>
          <h1 class="title"><span class="t1">System</span><span class="t2">Monitor</span></h1>
          <nav class="tapes" aria-label="Atalhos">
            <a class="tape" href="#s-gauges">Indicadores</a>
            <a class="tape" href="#s-cores">Processador</a>
            <a class="tape" href="#s-net">Rede</a>
            <a class="tape" href="#s-sys">Sistema</a>
          </nav>
        </div>
        <div class="hero-right" aria-hidden="true">
          <div class="bubble">Monitoramento em tempo real</div>
          <div class="device">
            <div class="bezel"><div class="screen">
              <span id="heroState">Normal</span>
              <div class="readout"><i></i><i></i><i></i><span id="heroStats">RAM 0% · CPU 0%</span></div>
            </div></div>
          </div>
        </div>
      </div>
    </section>

    <div class="tab-bar" role="tablist" aria-label="Seções do painel">
      <button class="tab-btn" role="tab" id="tab-dashboard" aria-controls="dashboardTab" aria-selected="true" data-tab="dashboard">Visão geral</button>
      <button class="tab-btn" role="tab" id="tab-diag" aria-controls="diagTab" aria-selected="false" data-tab="diag" tabindex="-1">Diagnóstico</button>
    </div>

    <div class="toolbar">
      <button class="action-btn" id="refreshBtn" type="button">Atualizar agora</button>
      <button class="action-btn" id="pauseBtn" type="button" aria-pressed="false">Pausar atualização</button>
      <div class="rain-panel" role="group" aria-label="Controle de chuva">
        <span class="rain-label">Chuva</span>
        <div class="rain-modes">
          <button class="action-btn" type="button" data-rain="drizzle" aria-pressed="false">Garoa</button>
          <button class="action-btn" type="button" data-rain="rain" aria-pressed="false">Chuva</button>
          <button class="action-btn" type="button" data-rain="storm" aria-pressed="false">Tempestade</button>
          <button class="action-btn" type="button" data-rain="sync" aria-pressed="true" title="Segue o maior valor entre CPU e RAM">Sincronizado</button>
        </div>
        <label class="rain-slider"><span class="sr-only">Intensidade da chuva</span><input type="range" id="rainRange" min="0" max="100" step="1" value="50"><output id="rainOut" for="rainRange">50%</output></label>
        <span class="rain-note" id="rainNote" hidden>Movimento reduzido: animação pausada</span>
      </div>
      <span class="updated" id="updated">Aguardando primeira leitura</span>
      <span class="sr-only" id="connAnnounce" role="status" aria-live="polite"></span>
    </div>`;

const DIAG_TAB = `
    <div id="diagTab" class="tab-content" role="tabpanel" aria-labelledby="tab-diag">
      ${section(1, 'Histórico recente')}
      <div class="charts">${chart('cpu', 'Processador', 'Histórico de uso do processador')}${chart('ram', 'Memória', 'Histórico de uso de memória')}
      </div>

      ${section(2, 'Eventos de nível')}
      <ul class="events" id="events" aria-live="polite"><li class="empty">Nenhuma mudança de nível desde que a página foi aberta.</li></ul>
    </div>`;

const FOOTER = `
    <footer>
      <p>Painel de observabilidade · Atualização automática a cada ${REFRESH_INTERVAL_MS / 1000} segundos</p>
    </footer>`;

function renderPage(s) {
  const cpus = os.cpus();
  const nets = getNetworks();
  const localIP = (nets.find((n) => !n.internal) || { address: '127.0.0.1' }).address;
  const loadValue = (v) => (s.loadSupported ? v : 'Indisponível');
  const worst = Math.max(s.memUsagePercent, s.loadPercent, s.disk.available ? s.disk.percent : 0);
  const boot = { warn: WARN_THRESHOLD, crit: CRIT_THRESHOLD, refreshMs: REFRESH_INTERVAL_MS, labels: LEVEL_LABEL, stats: s };

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="dark">
<meta name="theme-color" content="#060a14">
<meta name="description" content="Painel de observabilidade de servidor em tempo real">
<title>System Monitor | Observabilidade</title>
<link rel="icon" href="data:,">
<link rel="stylesheet" href="/css/style.css?v=${ASSET_V}">
</head>
<body>
  <canvas id="rain" aria-hidden="true"></canvas>
  <main class="page">${HERO}

    <div id="dashboardTab" class="tab-content active" role="tabpanel" aria-labelledby="tab-dashboard">
      ${section(1, 'Indicadores principais', 's-gauges')}
      <div class="gauge-grid">
        ${gauge('ram', 'Memória utilizada', 'Memória RAM', s.memUsagePercent, `<span id="ramText">${fmtMB(s.usedMem)} de ${fmtMB(s.totalMem)}</span>`)}
        ${gauge('cpu', 'Uso do processador', 'Média de todos os núcleos agora', s.loadPercent, `Carga média (1 min): <span id="loadAvg">${esc(loadValue(s.load1))}</span>`)}
        ${gauge('disk', 'Armazenamento', 'Espaço em disco', s.disk.available ? s.disk.percent : null, `<span id="diskText">${s.disk.available ? s.disk.usedGB + ' GB de ' + s.disk.totalGB + ' GB' : 'Indisponível neste ambiente'}</span>`)}
      </div>

      <div class="grid gap-top">
        ${card('Estado do sistema', LEVEL_LABEL[level(worst)], { id: 'stateText', cls: ' ' + level(worst) })}
        ${card('Heap do processo Node.js', s.processMem + ' MB', { id: 'processMem', cls: ' highlight' })}
        ${card('Memória residente (RSS)', s.rss + ' MB', { id: 'rss' })}
        ${card('Memória disponível', fmtMB(s.freeMem), { id: 'freeMem', sub: '<span class="sub" id="memSource"></span>' })}
        ${card('Uptime do servidor', s.uptime, { id: 'uptime' })}
        ${card('Uptime da aplicação', s.processUptime, { id: 'procUptime' })}
      </div>

      ${section(2, 'Uso por núcleo', 's-cores')}
      <div class="cores">
        ${s.cores.map((u, i) => `<div class="core"><span class="name">Núcleo ${i + 1}</span><div class="bar"><div class="bar-fill" id="core${i}" style="width:${u}%"></div></div><span class="core-pct" id="corePct${i}">${u}%</span></div>`).join('')}
      </div>

      ${section(3, 'Carga do sistema')}
      <div class="grid">
        ${card('Carga em 1 minuto', loadValue(s.load1), { id: 'load1', cls: ' highlight' })}
        ${card('Carga em 5 minutos', loadValue(s.load5), { id: 'load5' })}
        ${card('Carga em 15 minutos', loadValue(s.load15), { id: 'load15' })}
        ${card('Horário do servidor', s.serverTime, { id: 'clock' })}
      </div>

      ${section(4, 'Processador')}
      <div class="grid">
        ${card('Modelo do processador', cpus[0] ? cpus[0].model.trim() : 'Não identificado', { wide: true })}
        ${card('Núcleos disponíveis', cpus.length)}
        ${card('Frequência', cpus[0] && cpus[0].speed ? cpus[0].speed + ' MHz' : 'N/D')}
      </div>

      ${section(5, 'Ambiente do host')}
      <div class="grid">
        ${card('Hostname', os.hostname(), { cls: ' highlight' })}
        ${card('IP local', localIP)}${SHOW_HOST_DETAILS ? `
        ${card('Usuário do processo', os.userInfo().username)}
        ${card('Diretório home', os.homedir(), { cls: ' small' })}` : ''}
      </div>

      ${section(6, 'Interfaces de rede', 's-net')}
      <div class="grid">
        ${nets.length
          ? nets.map((n) => card(n.name + (n.internal ? ' · interface local' : ' · interface externa'), n.address, { sub: SHOW_HOST_DETAILS ? `<span class="sub">MAC ${esc(n.mac)}</span>` : '' })).join('')
          : card('Interfaces de rede', 'Nenhuma interface IPv4 encontrada', { wide: true })}
      </div>

      ${section(7, 'Informações do sistema', 's-sys')}
      <div class="grid">
        ${card('Sistema operacional', os.type() + ' ' + os.release())}
        ${card('Arquitetura', os.arch())}
        ${card('Versão do Node.js', process.version)}
        ${card('PID da aplicação', process.pid)}
      </div>
    </div>

    ${DIAG_TAB}
${FOOTER}
  </main>

<script type="application/json" id="boot">${JSON.stringify(boot).replace(/</g, '\\u003c')}</script>
<script src="/js/rain.js?v=${ASSET_V}"></script>
<script src="/js/app.js?v=${ASSET_V}"></script>
</body>
</html>`;
}

module.exports = { renderPage };
