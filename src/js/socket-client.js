(function () {
  let socket = null;
  let listenersBound = false;

  const eventHandlers = {
    roomReady: new Set(),
    stateUpdate: new Set(),
    playerDisconnected: new Set(),
    playerReconnected: new Set(),
    roomAbandoned: new Set(),
    roomsUpdated: new Set(),
    chatMessage: new Set(),
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

      socket.on("disconnect", (reason) => {
        alert("Verbindung zum Server getrennt: " + reason);
      });

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

      socket.on("rooms:updated", (payload) => {
        eventHandlers.roomsUpdated.forEach((fn) => fn(payload));
      });

      socket.on("chat:message", (payload) => {
        eventHandlers.chatMessage.forEach((fn) => fn(payload));
      });
    }

    return socket;
  }

  function waitForConnection(timeoutMs = 7000) {
    const activeSocket = ensureSocket();
    if (activeSocket.connected) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      let settled = false;

      const cleanup = () => {
        activeSocket.off("connect", onConnect);
        activeSocket.off("connect_error", onConnectError);
      };

      const onConnect = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        cleanup();
        resolve();
      };

      const onConnectError = (error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        cleanup();
        reject(error || new Error("Socket Verbindung fehlgeschlagen"));
      };

      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(new Error("Socket Verbindung Timeout"));
      }, timeoutMs);

      activeSocket.on("connect", onConnect);
      activeSocket.on("connect_error", onConnectError);
    });
  }

  async function emitWithAck(eventName, payload, timeoutMs = 7000) {
    await waitForConnection(timeoutMs);

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

  async function createRoom(playerName = "") {
    const response = await emitWithAck("room:create", { playerName });
    if (!response?.ok)
      throw new Error(response?.error || "Raum konnte nicht erstellt werden.");
    return response;
  }

  async function joinRoom(roomCode, reconnectToken = "", playerName = "") {
    const response = await emitWithAck("room:join", {
      roomCode,
      reconnectToken,
      playerName,
    });
    if (!response?.ok)
      throw new Error(response?.error || "Raumbeitritt fehlgeschlagen.");
    return response;
  }

  async function listRooms() {
    const response = await emitWithAck("rooms:list", {});
    if (!response?.ok)
      throw new Error(
        response?.error || "Offene Raeume konnten nicht geladen werden.",
      );
    return Array.isArray(response.rooms) ? response.rooms : [];
  }

  async function syncState(roomCode, state) {
    const response = await emitWithAck(
      "state:sync",
      {
        roomCode,
        state,
      },
      3000,
    );
    if (!response?.ok)
      throw new Error(
        response?.error || "Status konnte nicht synchronisiert werden.",
      );
    return response;
  }

  async function sendChatMessage(roomCode, text, displayName = "") {
    const response = await emitWithAck("chat:send", {
      roomCode,
      text,
      displayName,
    });
    if (!response?.ok)
      throw new Error(
        response?.error || "Nachricht konnte nicht gesendet werden.",
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
    listRooms,
    syncState,
    sendChatMessage,
    on,
    isConnected,
    ensureSocket,
  };
})();
