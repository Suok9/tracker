const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;
const assets = new Map();

app.use(express.static(__dirname));

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'tracker-transponder',
    assets: Array.from(assets.keys())
  });
});

function normalizeAssetId(value) {
  const raw = String(value || '').trim();
  if (!raw) return `asset-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  return raw;
}

function buildAssetRecord(data) {
  const id = normalizeAssetId(data.id);
  const lat = Number(data.lat);
  const lng = Number(data.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  const existing = assets.get(id) || {
    id,
    history: []
  };

  const next = {
    id,
    lat,
    lng,
    speed: Number(data.speed) || 0,
    timestamp: data.timestamp || Date.now(),
    history: existing.history || []
  };

  next.history.push([lat, lng]);
  if (next.history.length > 120) {
    next.history.shift();
  }

  return next;
}

function emitFleetState() {
  io.emit('fleet:state', Array.from(assets.values()));
}

io.on('connection', (socket) => {
  socket.on('dashboard:subscribe', () => {
    socket.emit('fleet:state', Array.from(assets.values()));
  });

  socket.on('transponder:register', ({ id, label } = {}) => {
    const assetId = normalizeAssetId(id);

    if (!assets.has(assetId)) {
      assets.set(assetId, {
        id: assetId,
        label: label || assetId,
        lat: 0,
        lng: 0,
        speed: 0,
        timestamp: Date.now(),
        history: []
      });
    } else {
      const current = assets.get(assetId);
      current.label = label || current.label || assetId;
      assets.set(assetId, current);
    }

    emitFleetState();
  });

  socket.on('transponder:position', (payload) => {
    const normalized = buildAssetRecord(payload || {});
    if (!normalized) {
      return;
    }

    const existing = assets.get(normalized.id) || { id: normalized.id, label: normalized.id, history: [] };
    const updated = {
      ...existing,
      ...normalized,
      label: payload.label || existing.label || normalized.id,
      history: normalized.history
    };

    assets.set(normalized.id, updated);
    emitFleetState();
  });

  socket.on('disconnect', () => {
    // no-op
  });
});

server.listen(PORT, () => {
  console.log(`Tracker server running on http://localhost:${PORT}`);
});
