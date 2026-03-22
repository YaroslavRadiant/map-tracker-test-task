import express from "express";
import cors from "cors";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import path from "path";
import { fileURLToPath } from "url";

const HTTP_PORT = Number(process.env.PORT) || 3001;

const MAX_ACTIVE_OBJECTS = 220;
const INITIAL_OBJECTS_COUNT = 150;

const CENTER_LAT = 48.282;
const CENTER_LNG = 37.181;

const LAT_SPREAD = 1.2;
const LNG_SPREAD = 1.6;

const SERVER_STALE_TIMEOUT_MS = 10_000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_PATH = path.resolve(__dirname, "../dist");

const app = express();
app.use(cors());

function parseApiKey(key) {
  try {
    const decoded = Buffer.from(key.trim(), "base64").toString("utf-8");
    const parts = decoded.split(":");

    if (parts.length !== 2) return null;

    const [prefix, seed] = parts;

    const isValidPrefix = prefix === "access";
    const isValidSeed = /^\d{4,8}$/.test(seed);

    if (!isValidPrefix || !isValidSeed) return null;

    return { seed };
  } catch {
    return null;
  }
}

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

let sequence = 1;

function randomBool() {
  return Math.random() > 0.5;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function createObject() {
  return {
    id: `obj-${sequence++}`,
    lat: CENTER_LAT + (Math.random() - 0.5) * LAT_SPREAD,
    lng: CENTER_LNG + (Math.random() - 0.5) * LNG_SPREAD,
    direction: Math.random() * 360,
    isOwn: randomBool(),
    lastSentAt: Date.now(),
  };
}

const objects = new Map();

for (let i = 0; i < INITIAL_OBJECTS_COUNT; i++) {
  const obj = createObject();
  objects.set(obj.id, obj);
}

function updateActiveObjectsMovement() {
  for (const obj of objects.values()) {
    const speedMultiplier = obj.isOwn ? 1 : 1.15;

    obj.lat += (Math.random() - 0.5) * 0.01 * speedMultiplier;
    obj.lng += (Math.random() - 0.5) * 0.012 * speedMultiplier;
    obj.direction = (obj.direction + (Math.random() - 0.5) * 14 + 360) % 360;

    obj.lat = clamp(
      obj.lat,
      CENTER_LAT - LAT_SPREAD / 2,
      CENTER_LAT + LAT_SPREAD / 2,
    );

    obj.lng = clamp(
      obj.lng,
      CENTER_LNG - LNG_SPREAD / 2,
      CENTER_LNG + LNG_SPREAD / 2,
    );
  }
}

function maybeAddNewObjects() {
  if (objects.size >= MAX_ACTIVE_OBJECTS) return;

  if (Math.random() <= 0.55) return;

  const count = Math.random() > 0.75 ? 2 : 1;

  for (let i = 0; i < count; i++) {
    if (objects.size >= MAX_ACTIVE_OBJECTS) break;

    const obj = createObject();
    objects.set(obj.id, obj);
  }
}

function buildVisibleObjectsAndRemoveStale() {
  const now = Date.now();
  const visible = [];
  const toDelete = [];

  for (const obj of objects.values()) {
    const shouldSend = Math.random() > 0.6;

    if (shouldSend) {
      obj.lastSentAt = now;

      visible.push({
        id: obj.id,
        lat: obj.lat,
        lng: obj.lng,
        direction: obj.direction,
        isOwn: obj.isOwn,
      });

      continue;
    }

    if (now - obj.lastSentAt > SERVER_STALE_TIMEOUT_MS) {
      toDelete.push(obj.id);
    }
  }

  for (const id of toDelete) {
    objects.delete(id);
  }

  return visible;
}

const httpServer = createServer(app);

const wss = new WebSocketServer({
  server: httpServer,
  path: "/ws",
});

wss.on("connection", (ws, req) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  const apiKey = requestUrl.searchParams.get("key");
  const profile = apiKey ? parseApiKey(apiKey) : null;

  if (!profile) {
    ws.close(1008, "Unauthorized");
    return;
  }

  ws.send(
    JSON.stringify({
      type: "connected",
    }),
  );
});

setInterval(() => {
  updateActiveObjectsMovement();
  maybeAddNewObjects();

  const items = buildVisibleObjectsAndRemoveStale();

  const payload = JSON.stringify({
    type: "objects",
    items,
    timestamp: Date.now(),
  });

  for (const client of wss.clients) {
    if (client.readyState === 1) {
      client.send(payload);
    }
  }
}, 1000);

app.use(express.static(DIST_PATH));

app.get("/{*splat}", (_req, res) => {
  res.sendFile(path.join(DIST_PATH, "index.html"));
});

httpServer.listen(HTTP_PORT, () => {
  console.log(`Server running on http://localhost:${HTTP_PORT}`);
});
