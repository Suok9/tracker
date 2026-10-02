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
  return String(value || 'asset-vehicle-01');
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

io.on('connection', (socket) => {
  socket.on('dashboard:subscribe', () => {
    socket.emit('fleet:state', Array.from(assets.values()));
  });

  socket.on('transponder:register', ({ id } = {}) => {
    const assetId = normalizeAssetId(id);

    if (!assets.has(assetId)) {
      assets.set(assetId, {
        id: assetId,
        lat: 0,
        lng: 0,
        speed: 0,
        timestamp: Date.now(),
        history: []
      });
    }

    socket.emit('fleet:state', Array.from(assets.values()));
  });

  socket.on('transponder:position', (payload) => {
    const normalized = buildAssetRecord(payload || {});
    if (!normalized) {
      return;
    }

    assets.set(normalized.id, normalized);
    io.emit('fleet:update', normalized);
    io.emit('fleet:state', Array.from(assets.values()));
  });

  socket.on('disconnect', () => {
    // no-op; asset state remains until replaced or cleared
  });
});

server.listen(PORT, () => {
  console.log(`Tracker server running on http://localhost:${PORT}`);
});
