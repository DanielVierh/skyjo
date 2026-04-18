import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const PORT = process.env.PORT || 3000;
const RECONNECT_TIMEOUT_MS = 120000;
const CHAT_MAX_LENGTH = 300;
const CHAT_RATE_LIMIT_MS = 1000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
  transports: ["websocket", "polling"],
});

app.use(express.static(__dirname));
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const rooms = new Map();

function randomCode() {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
}

function randomToken() {
  return crypto.randomBytes(16).toString("hex");
}

function createRoom() {
  let roomCode = randomCode();
  while (rooms.has(roomCode)) {
    roomCode = randomCode();
  }

  const room = {
    roomCode,
    players: {
      player1: null,
      player2: null,
    },
    gameState: null,
    chatLastMessageAt: {
      player1: 0,
      player2: 0,
    },
  };

  rooms.set(roomCode, room);
  return room;
}

function getPlayerKeyBySocket(room, socketId) {
  if (room.players.player1?.socketId === socketId) return "player1";
  if (room.players.player2?.socketId === socketId) return "player2";
  return null;
}

function normalizeChatText(raw) {
  return String(raw || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, CHAT_MAX_LENGTH);
}

function normalizeChatName(raw, fallback) {
  const safe = String(raw || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 20);
  return safe || fallback;
}

function normalizePlayerName(raw, fallback = "Spieler") {
  const safe = String(raw || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 20);
  return safe || fallback;
}

function roomSnapshot(room) {
  return {
    roomCode: room.roomCode,
    connected: {
      player1: !!room.players.player1?.socketId,
      player2: !!room.players.player2?.socketId,
    },
    names: {
      player1: room.players.player1?.displayName || "Spieler 1",
      player2: room.players.player2?.displayName || "Spieler 2",
    },
    hasGameState: !!room.gameState,
  };
}

function isPublicJoinableRoom(room) {
  if (!room) return false;
  const hasHostConnected = !!room.players.player1?.socketId;
  const slot2IsFree =
    !room.players.player2?.socketId && !room.players.player2?.token;
  return hasHostConnected && slot2IsFree;
}

function emitRoomsUpdated() {
  io.emit("rooms:updated", { ts: Date.now() });
}

function getOpenRooms() {
  const openRooms = [];

  rooms.forEach((room) => {
    if (!room) return;
    const hasHostConnected = !!room.players.player1?.socketId;
    if (!hasHostConnected) return;

    const slot2Taken =
      !!room.players.player2?.socketId || !!room.players.player2?.token;
    const playerCount = 1 + (slot2Taken ? 1 : 0);

    openRooms.push({
      roomCode: room.roomCode,
      hasGameState: !!room.gameState,
      playerCount,
      isFull: slot2Taken,
      hostName: room.players.player1?.displayName || "Spieler 1",
    });
  });

  openRooms.sort((a, b) => a.roomCode.localeCompare(b.roomCode));
  return openRooms;
}

app.get("/api/rooms", (_req, res) => {
  res.json({ ok: true, rooms: getOpenRooms() });
});

function clearReconnectTimer(playerSlot) {
  if (playerSlot?.reconnectTimer) {
    clearTimeout(playerSlot.reconnectTimer);
    playerSlot.reconnectTimer = null;
  }
}

function assignPlayer(room, playerKey, socket, displayName = "") {
  const existing = room.players[playerKey];
  const token = existing?.token ?? randomToken();

  clearReconnectTimer(existing);

  room.players[playerKey] = {
    token,
    socketId: socket.id,
    reconnectTimer: null,
    displayName: normalizePlayerName(
      displayName,
      playerKey === "player1" ? "Spieler 1" : "Spieler 2",
    ),
  };

  socket.join(room.roomCode);
  socket.data.roomCode = room.roomCode;
  socket.data.playerKey = playerKey;

  return token;
}

function scheduleReconnectTimeout(roomCode, playerKey) {
  const room = rooms.get(roomCode);
  if (!room) return;

  const playerSlot = room.players[playerKey];
  if (!playerSlot || !playerSlot.token || playerSlot.socketId) return;

  clearReconnectTimer(playerSlot);
  playerSlot.reconnectTimer = setTimeout(() => {
    const activeRoom = rooms.get(roomCode);
    if (!activeRoom) return;

    const target = activeRoom.players[playerKey];
    if (!target || target.socketId) return;

    io.to(roomCode).emit("room:abandoned", {
      reason: "reconnect-timeout",
      loser: playerKey,
      winner: playerKey === "player1" ? "player2" : "player1",
    });

    rooms.delete(roomCode);
  }, RECONNECT_TIMEOUT_MS);
}

io.on("connection", (socket) => {
  socket.on("rooms:list", (_payload, ack) => {
    ack?.({ ok: true, rooms: getOpenRooms() });
  });

  socket.on("room:create", (_payload, ack) => {
    const room = createRoom();
    const displayName = normalizePlayerName(_payload?.playerName, "Spieler 1");
    const token = assignPlayer(room, "player1", socket, displayName);

    ack?.({
      ok: true,
      roomCode: room.roomCode,
      playerKey: "player1",
      reconnectToken: token,
      reconnectTimeoutMs: RECONNECT_TIMEOUT_MS,
      room: roomSnapshot(room),
    });

    emitRoomsUpdated();
  });

  socket.on("room:join", (payload, ack) => {
    const roomCode = String(payload?.roomCode || "")
      .trim()
      .toUpperCase();
    const reconnectToken = String(payload?.reconnectToken || "").trim();

    const room = rooms.get(roomCode);
    if (!room) {
      ack?.({ ok: false, error: "Raum nicht gefunden." });
      return;
    }

    let playerKey = null;

    if (
      reconnectToken &&
      room.players.player1?.token === reconnectToken &&
      !room.players.player1.socketId
    ) {
      playerKey = "player1";
    } else if (
      reconnectToken &&
      room.players.player2?.token === reconnectToken &&
      !room.players.player2.socketId
    ) {
      playerKey = "player2";
    } else if (
      !room.players.player2?.socketId &&
      !room.players.player2?.token
    ) {
      playerKey = "player2";
    }

    if (!playerKey) {
      ack?.({
        ok: false,
        error: "Raum ist voll oder Reconnect nicht möglich.",
      });
      return;
    }

    const displayName = normalizePlayerName(
      payload?.playerName,
      playerKey === "player1" ? "Spieler 1" : "Spieler 2",
    );
    const token = assignPlayer(room, playerKey, socket, displayName);

    ack?.({
      ok: true,
      roomCode,
      playerKey,
      reconnectToken: token,
      reconnectTimeoutMs: RECONNECT_TIMEOUT_MS,
      room: roomSnapshot(room),
      gameState: room.gameState,
    });

    io.to(roomCode).emit("room:ready", {
      roomCode,
      connected: roomSnapshot(room).connected,
      names: roomSnapshot(room).names,
    });

    io.to(roomCode).emit("player:reconnected", { playerKey });
    emitRoomsUpdated();
  });

  socket.on("state:sync", (payload, ack) => {
    const roomCode = String(payload?.roomCode || "")
      .trim()
      .toUpperCase();
    const room = rooms.get(roomCode);
    if (!room) {
      ack?.({ ok: false, error: "Raum existiert nicht." });
      return;
    }

    const senderKey = getPlayerKeyBySocket(room, socket.id);
    if (!senderKey) {
      ack?.({ ok: false, error: "Nicht Teil dieses Raums." });
      return;
    }

    room.gameState = payload?.state ?? null;

    socket.to(roomCode).emit("state:update", {
      state: room.gameState,
      by: senderKey,
    });

    ack?.({ ok: true });
  });

  socket.on("chat:send", (payload, ack) => {
    try {
      const roomCode = String(payload?.roomCode || "")
        .trim()
        .toUpperCase();
      const room = rooms.get(roomCode);
      if (!room) {
        ack?.({ ok: false, error: "Raum existiert nicht." });
        return;
      }

      const senderKey = getPlayerKeyBySocket(room, socket.id);
      if (!senderKey) {
        ack?.({ ok: false, error: "Nicht Teil dieses Raums." });
        return;
      }

      const text = normalizeChatText(payload?.text);
      if (!text) {
        ack?.({ ok: false, error: "Bitte gib eine Nachricht ein." });
        return;
      }

      if (!room.chatLastMessageAt) {
        room.chatLastMessageAt = { player1: 0, player2: 0 };
      }

      const now = Date.now();
      const lastAt = Number(room.chatLastMessageAt?.[senderKey] || 0);
      if (now - lastAt < CHAT_RATE_LIMIT_MS) {
        ack?.({
          ok: false,
          error: "Bitte warte kurz vor der naechsten Nachricht.",
        });
        return;
      }

      room.chatLastMessageAt[senderKey] = now;
      const fallbackName = senderKey === "player1" ? "Spieler 1" : "Spieler 2";
      const message = {
        id: `${now}_${Math.random().toString(16).slice(2, 8)}`,
        sender: senderKey,
        displayName: normalizeChatName(payload?.displayName, fallbackName),
        text,
        timestamp: now,
      };

      io.to(roomCode).emit("chat:message", message);
      ack?.({ ok: true, message });
    } catch (error) {
      console.error("chat:send failed", error);
      ack?.({
        ok: false,
        error: "Chatnachricht konnte nicht verarbeitet werden.",
      });
    }
  });

  socket.on("disconnect", () => {
    const roomCode = socket.data.roomCode;
    const playerKey = socket.data.playerKey;
    if (!roomCode || !playerKey) return;

    const room = rooms.get(roomCode);
    if (!room) return;

    const playerSlot = room.players[playerKey];
    if (!playerSlot) return;

    playerSlot.socketId = null;

    io.to(roomCode).emit("player:disconnected", {
      playerKey,
      reconnectTimeoutMs: RECONNECT_TIMEOUT_MS,
    });

    emitRoomsUpdated();

    scheduleReconnectTimeout(roomCode, playerKey);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Skyjo Online läuft auf Port ${PORT}`);
});
