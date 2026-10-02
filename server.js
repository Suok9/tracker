const express = require('express');
const http = require('http');
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
let nextAssetNumber = 1;

app.use(express.static(__dirname));

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'tracker-transponder',
    assets: Array.from(assets.keys())
  });
});

function generateAssetId() {
  let id;
  do {
    id = `A${String(nextAssetNumber++).padStart(2, '0')}`;
  } while (assets.has(id));
  return id;
}

function normalizeAssetId(value) {
  if (typeof value !== 'string') return null;
  const id = value.trim();
  return id && id.length <= 64 ? id : null;
}

function parseCoordinate(value, min, max) {
  if (value == null || typeof value === 'boolean' ||
      (typeof value === 'string' && !value.trim())) return null;
  const coordinate = Number(value);
  return Number.isFinite(coordinate) && coordinate >= min && coordinate <= max
    ? coordinate
    : null;
}

function buildAssetRecord(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const id = normalizeAssetId(data.id);
  const lat = parseCoordinate(data.lat, -90, 90);
  const lng = parseCoordinate(data.lng, -180, 180);
  const speed = data.speed == null ? 0 : Number(data.speed);

  if (!id || lat === null || lng === null || !Number.isFinite(speed) || speed < 0) {
    return null;
  }

  const existing = assets.get(id) || { id, history: [] };

  const next = {
    id,
    lat,
    lng,
    speed,
    timestamp: Number.isFinite(Number(data.timestamp)) ? Number(data.timestamp) : Date.now(),
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
  socket.on('asset:remove', (payload = {}) => {
    const assetId = payload && typeof payload === 'object' ? normalizeAssetId(payload.id) : null;
    if (!assetId) return;
    assets.delete(assetId);
    emitFleetState();
  });

  socket.on('asset:set-location', (payload = {}) => {
    if (!payload || typeof payload !== 'object') return;
    const assetId = normalizeAssetId(payload.id);
    const latValue = parseCoordinate(payload.lat, -90, 90);
    const lngValue = parseCoordinate(payload.lng, -180, 180);

    if (!assetId || latValue === null || lngValue === null) {
      return;
    }

   const existing = assets.get(assetId);
   if (!existing) return;
   const updated = {
     ...existing,
     id: assetId,
     label: existing.label || assetId,
     lat: latValue,
     lng: lngValue,
     speed: Number.isFinite(existing.speed) && existing.speed >= 0 ? existing.speed : 0,
      timestamp: Date.now(),
      history: Array.isArray(existing.history) ? existing.history.slice() : []
    };

    updated.history.push([latValue, lngValue]);
    if (updated.history.length > 120) {
      updated.history.shift();
    }

    assets.set(assetId, updated);
    emitFleetState();
  });

  socket.on('dashboard:subscribe', () => {
    socket.emit('fleet:state', Array.from(assets.values()));
  });

  socket.on('transponder:register', (payload = {}, acknowledge) => {
    const registration = payload && typeof payload === 'object' ? payload : {};
    const assetId = normalizeAssetId(registration.id) || generateAssetId();
    const label = typeof registration.label === 'string'
      ? registration.label.trim().slice(0, 100)
      : '';

    if (!assets.has(assetId)) {
      assets.set(assetId, {
        id: assetId,
        label: label || assetId,
        lat: null,
        lng: null,
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
    if (typeof acknowledge === 'function') acknowledge({ ok: true, id: assetId });
  });

  socket.on('transponder:position', (payload) => {
    const normalized = buildAssetRecord(payload || {});
    if (!normalized) {
      return;
    }

    const existing = assets.get(normalized.id) || { id: normalized.id, label: normalized.id, history: [] };
    const label = typeof payload.label === 'string' ? payload.label.trim().slice(0, 100) : '';
    const updated = {
      ...existing,
      ...normalized,
      label: label || existing.label || normalized.id,
      history: normalized.history
    };

    assets.set(normalized.id, updated);
    emitFleetState();
  });

});

server.listen(PORT, () => {
  console.log(`Tracker server running on http://localhost:${PORT}`);
});
