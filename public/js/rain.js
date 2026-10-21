(function () {
  'use strict';

  const canvas = document.getElementById('rain');
  const ctx = canvas && canvas.getContext && canvas.getContext('2d');
  if (!ctx) return;
  const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');

  const LAYERS = [
    { z: 0.35, n: 150, len: [8, 14],  spd: [380, 480],  w: 0.6, a: 0.22, hit: false },
    { z: 0.65, n: 110, len: [12, 20], spd: [620, 760],  w: 0.9, a: 0.38, hit: true },
    { z: 1.0,  n: 70,  len: [18, 30], spd: [900, 1100], w: 1.3, a: 0.6,  hit: true }
  ];
  const SURFACES = '.hero, .card, .gauge, .chart, .core, .events';
  const MAX_SPLASH = 160;
  const IDLE = 0.005;

  let w = 0, h = 0, dpr = 0, density = 1;
  let target = 0.5, current = 0.5;
  let color = '150,215,255';
  const rects = [];
  let rectsAt = 0, rectsDirty = true;
  const splashes = [];
  let running = false, raf = 0, last = 0, time = 0;

  const rnd = (a, b) => a + Math.random() * (b - a);

  function spawn(d, L, anywhere) {
    d.x = rnd(-260, w + 40);
    d.y = anywhere ? rnd(0, h) : rnd(-80, -L.len[1]);
    d.len = rnd(L.len[0], L.len[1]);
    d.v = rnd(L.spd[0], L.spd[1]);
  }

  const layers = LAYERS.map((cfg) => ({
    cfg,
    drops: Array.from({ length: cfg.n }, () => ({ x: 0, y: 0, len: 0, v: 0 }))
  }));

  function resize() {
    const nw = window.innerWidth, nh = window.innerHeight;
    const nd = Math.min(window.devicePixelRatio || 1, 2);
    if (nw === w && nh === h && nd === dpr) return;
    const widthChanged = nw !== w;
    w = nw; h = nh; dpr = nd;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    density = Math.max(0.45, Math.min(1, (w * h) / (1280 * 720)));
    if (widthChanged) layers.forEach((l) => l.drops.forEach((d) => spawn(d, l.cfg, true)));
    rectsDirty = true;
  }

  function refreshRects() {
    rects.length = 0;
    const nodes = document.querySelectorAll(SURFACES);
    for (let i = 0; i < nodes.length; i++) {
      const r = nodes[i].getBoundingClientRect();
      if (r.width > 20 && r.height > 10 && r.top > 0 && r.top < h && r.bottom > 0) {
        rects.push({ top: r.top, left: r.left, right: r.right });
      }
    }
    rectsDirty = false;
    rectsAt = time;
  }

  function splash(x, y, z, wind) {
    const n = z > 0.9 ? 3 : 2;
    for (let k = 0; k < n && splashes.length < MAX_SPLASH; k++) {
      splashes.push({ x, y, vx: rnd(-60, 60) * z + wind * 0.08, vy: -rnd(90, 200) * z, life: 0, ttl: rnd(0.25, 0.45), z });
    }
  }

  function step(dt) {
    current += (target - current) * Math.min(1, dt * 2.5);
    const I = current;
    ctx.clearRect(0, 0, w, h);
    if (I < IDLE && !splashes.length) return false;

    const speedK = 0.55 + 0.9 * I;
    const gust = 0.75 + 0.25 * Math.sin(time * 0.45) + 0.1 * Math.sin(time * 1.3);
    const wind = I * 220 * gust;

    if (rectsDirty || time - rectsAt > 0.6) refreshRects();

    ctx.lineCap = 'round';
    for (let li = 0; li < layers.length; li++) {
      const L = layers[li].cfg, drops = layers[li].drops;
      const active = I < IDLE ? 0 : Math.round(L.n * I * density);
      const vx = wind * L.z;
      ctx.strokeStyle = 'rgba(' + color + ',' + (L.a * (0.55 + 0.45 * I)).toFixed(3) + ')';
      ctx.lineWidth = L.w;
      ctx.beginPath();
      for (let i = 0; i < active; i++) {
        const d = drops[i];
        const vy = d.v * speedK;
        const prevY = d.y;
        d.y += vy * dt;
        d.x += vx * dt;

        let landed = false;
        if (d.y >= h - 2) {
          landed = true;
          if (L.hit) splash(d.x, h - 2, L.z, wind);
        } else if (L.hit) {
          for (let r = 0; r < rects.length; r++) {
            const s = rects[r];
            if (prevY < s.top && d.y >= s.top && d.x >= s.left && d.x <= s.right) {
              splash(d.x, s.top, L.z, wind);
              landed = true;
              break;
            }
          }
        }
        if (landed || d.x > w + 60) { spawn(d, L, false); continue; }

        const sp = Math.hypot(vx, vy);
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - (vx / sp) * d.len, d.y - (vy / sp) * d.len);
      }
      ctx.stroke();
    }

    if (splashes.length) {
      ctx.fillStyle = 'rgb(' + color + ')';
      for (let k = splashes.length - 1; k >= 0; k--) {
        const p = splashes[k];
        p.life += dt;
        if (p.life >= p.ttl) { splashes[k] = splashes[splashes.length - 1]; splashes.pop(); continue; }
        p.vy += 900 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        ctx.globalAlpha = (1 - p.life / p.ttl) * 0.75 * p.z;
        ctx.fillRect(p.x, p.y, 1 + p.z, 1 + p.z);
      }
      ctx.globalAlpha = 1;
    }
    return true;
  }

  function frame(ts) {
    const dt = Math.min(0.05, (ts - last) / 1000);
    last = ts;
    time += dt;
    if (step(dt)) raf = requestAnimationFrame(frame);
    else running = false;
  }

  function start() {
    if (running || document.hidden || reduceMq.matches) return;
    resize();
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  function syncState() {
    if (reduceMq.matches) { stop(); ctx.clearRect(0, 0, w, h); return; }
    if (document.hidden) stop(); else start();
  }

  let resizeQueued = false;
  window.addEventListener('resize', () => {
    if (resizeQueued) return;
    resizeQueued = true;
    requestAnimationFrame(() => { resizeQueued = false; resize(); });
  });
  window.addEventListener('scroll', () => { rectsDirty = true; }, { passive: true });
  document.addEventListener('visibilitychange', syncState);
  reduceMq.addEventListener('change', syncState);

  window.Rain = {
    setIntensity(v) {
      target = Math.max(0, Math.min(1, v));
      if (target >= IDLE) start();
    },
    setTint(rgb) { color = rgb || '150,215,255'; },
    isReduced() { return reduceMq.matches; },
    onMotionChange(fn) { reduceMq.addEventListener('change', fn); }
  };

  resize();
  syncState();
})();
