'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');

const MB = 1024 * 1024;
const SAMPLE_INTERVAL_MS = 2000;
const STATS_TTL_MS = 1000;
const DISK_TTL_MS = 15000;
const IS_WINDOWS = process.platform === 'win32';

function cached(ttl, fn) {
  let value;
  let at = 0;
  return () => {
    const now = Date.now();
    if (now - at >= ttl) {
      value = fn();
      at = now;
    }
    return value;
  };
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d > 0 ? d + 'd ' : ''}${h}h ${m}m ${s}s`;
}

function readFile(p) {
  try {
    return fs.readFileSync(p, 'utf8').trim();
  } catch {
    return null;
  }
}

const snapshot = () => os.cpus().map((c) => ({ ...c.times }));
let prevCpu = snapshot();
let coreUsage = prevCpu.map(() => 0);

function sampleCpu() {
  const cur = snapshot();
  coreUsage = cur.map((times, i) => {
    const prev = prevCpu[i] || {};
    let total = 0;
    for (const k of Object.keys(times)) total += times[k] - (prev[k] || 0);
    const idle = times.idle - (prev.idle || 0);
    return total > 0 ? Math.max(0, Math.min(100, Math.round((1 - idle / total) * 100))) : 0;
  });
  prevCpu = cur;
}

function startSampling() {
  setTimeout(sampleCpu, 500).unref();
  return setInterval(sampleCpu, SAMPLE_INTERVAL_MS).unref();
}

function getMemory() {
  const hostTotal = os.totalmem();
  let total = hostTotal;
  let available = null;
  let source = 'os';

  const cur2 = readFile('/sys/fs/cgroup/memory.current');
  const max2 = readFile('/sys/fs/cgroup/memory.max');
  if (cur2 !== null && max2 && max2 !== 'max') {
    const limit = Number(max2);
    if (limit > 0 && limit < hostTotal) {
      const m = (readFile('/sys/fs/cgroup/memory.stat') || '').match(/^inactive_file (\d+)/m);
      const used = Math.max(0, Number(cur2) - (m ? Number(m[1]) : 0));
      total = limit;
      available = Math.max(0, limit - used);
      source = 'cgroup';
    }
  }

  if (available === null) {
    const lim1 = Number(readFile('/sys/fs/cgroup/memory/memory.limit_in_bytes'));
    const use1 = Number(readFile('/sys/fs/cgroup/memory/memory.usage_in_bytes'));
    if (lim1 > 0 && lim1 < hostTotal && use1 >= 0) {
      total = lim1;
      available = Math.max(0, lim1 - use1);
      source = 'cgroup';
    }
  }

  if (available === null && process.platform === 'linux') {
    const m = (readFile('/proc/meminfo') || '').match(/^MemAvailable:\s+(\d+) kB/m);
    if (m) {
      available = Number(m[1]) * 1024;
      source = 'meminfo';
    }
  }

  if (available === null) available = os.freemem();

  available = Math.min(available, total);
  const used = total - available;
  return {
    totalMB: Math.round(total / MB),
    usedMB: Math.round(used / MB),
    availableMB: Math.round(available / MB),
    percent: total > 0 ? Math.round((used / total) * 100) : 0,
    source
  };
}

const DISK_FALLBACK = { available: false, totalGB: null, usedGB: null, percent: 0 };

const getDisk = cached(DISK_TTL_MS, () => {
  if (typeof fs.statfsSync !== 'function') return DISK_FALLBACK;
  const targets = [path.parse(process.cwd()).root, process.cwd(), os.tmpdir()];
  for (const target of targets) {
    try {
      const st = fs.statfsSync(target);
      const bsize = Number(st.bsize);
      const total = Number(st.blocks) * bsize;
      if (!Number.isFinite(total) || total <= 0) continue;
      const used = (Number(st.blocks) - Number(st.bfree)) * bsize;
      const usable = used + Number(st.bavail) * bsize;
      return {
        available: true,
        totalGB: (total / 1e9).toFixed(1),
        usedGB: (used / 1e9).toFixed(1),
        percent: usable > 0 ? Math.max(0, Math.min(100, Math.round((used / usable) * 100))) : 0
      };
    } catch {}
  }
  return DISK_FALLBACK;
});

const getStats = cached(STATS_TTL_MS, () => {
  const mem = getMemory();
  const [l1, l5, l15] = os.loadavg();
  const pm = process.memoryUsage();
  const now = new Date();
  return {
    timestamp: now.getTime(),
    serverTime: now.toLocaleString('pt-BR', { timeZoneName: 'short' }),
    uptime: formatUptime(os.uptime()),
    processUptime: formatUptime(process.uptime()),
    loadSupported: !IS_WINDOWS,
    load1: l1.toFixed(2),
    load5: l5.toFixed(2),
    load15: l15.toFixed(2),
    cores: coreUsage,
    loadPercent: Math.round(coreUsage.reduce((a, b) => a + b, 0) / (coreUsage.length || 1)),
    usedMem: mem.usedMB,
    freeMem: mem.availableMB,
    totalMem: mem.totalMB,
    memUsagePercent: mem.percent,
    memSource: mem.source,
    processMem: (pm.heapUsed / MB).toFixed(2),
    rss: (pm.rss / MB).toFixed(1),
    disk: getDisk()
  };
});

function getNetworks() {
  return Object.entries(os.networkInterfaces()).flatMap(([name, list]) =>
    (list || [])
      .filter((i) => i.family === 'IPv4' || i.family === 4)
      .map((i) => ({ name, address: i.address, mac: i.mac, internal: i.internal }))
  );
}

module.exports = { getStats, getNetworks, startSampling };
