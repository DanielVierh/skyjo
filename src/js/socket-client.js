(function () {
  let socket = null;
  let listenersBound = false;

  const eventHandlers = {
    roomReady: new Set(),
    stateUpdate: new Set(),
    playerDisconnected: new Set(),
    playerReconnected: new Set(),
    roomAbandoned: new Set(),
  };

  function ensureSocket() {
    if (socket) return socket;
    if (typeof io !== "function") {
      throw new Error("Socket.IO Client wurde nicht geladen.");
    }

    socket = io({
      transports: ["websocket", "polling"],
    });

    if (!listenersBound) {
      listenersBound = true;

      socket.on("room:ready", (payload) => {
        eventHandlers.roomReady.forEach((fn) => fn(payload));
      });

      socket.on("state:update", (payload) => {
        eventHandlers.stateUpdate.forEach((fn) => fn(payload));
      });

      socket.on("player:disconnected", (payload) => {
        eventHandlers.playerDisconnected.forEach((fn) => fn(payload));
      });

      socket.on("player:reconnected", (payload) => {
        eventHandlers.playerReconnected.forEach((fn) => fn(payload));
      });

      socket.on("room:abandoned", (payload) => {
        eventHandlers.roomAbandoned.forEach((fn) => fn(payload));
      });
    }

    return socket;
  }

  function emitWithAck(eventName, payload, timeoutMs = 7000) {
    return new Promise((resolve, reject) => {
      const activeSocket = ensureSocket();
      let settled = false;

      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        reject(new Error("Socket ACK Timeout"));
      }, timeoutMs);

      activeSocket.emit(eventName, payload, (response) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(response);
      });
    });
  }

  async function createRoom() {
    const response = await emitWithAck("room:create", {});
    if (!response?.ok)
      throw new Error(response?.error || "Raum konnte nicht erstellt werden.");
    return response;
  }

  async function joinRoom(roomCode, reconnectToken = "") {
    const response = await emitWithAck("room:join", {
      roomCode,
      reconnectToken,
    });
    if (!response?.ok)
      throw new Error(response?.error || "Raumbeitritt fehlgeschlagen.");
    return response;
  }

  async function syncState(roomCode, state) {
    const response = await emitWithAck("state:sync", {
      roomCode,
      state,
    });
    if (!response?.ok)
      throw new Error(
        response?.error || "Status konnte nicht synchronisiert werden.",
      );
    return response;
  }

  function on(eventName, callback) {
    const set = eventHandlers[eventName];
    if (!set) throw new Error(`Unbekanntes Event: ${eventName}`);
    set.add(callback);

    return () => {
      set.delete(callback);
    };
  }

  function isConnected() {
    return !!socket?.connected;
  }

  window.SkyjoSocket = {
    createRoom,
    joinRoom,
    syncState,
    on,
    isConnected,
    ensureSocket,
  };
})();
