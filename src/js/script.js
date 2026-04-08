/**
 * Ablauf:
 *
 * Vor dem Spiel
 * -Es wird der Stack gebildet.
 * -Dabei wird zu jeder Karte aus dem Objekt all_cards ein Objekt der Klasse Karte
 * erstellt.
 * -Die erstellten Karten werden in ein Array namens cardStack gepusht
 * -cardStack wird gemischt
 * Es werden je 12 Karten verteilt. Erst für Spieler 1 dann für 2
 * Der Index der Karten und des Stapels muss gleich sein
 *
 *
 * Es werden zwei Spieler erstellt. Hierzu gibt es die Klasse Player.
 * Spieler haben ein Cards Array
 * Spieler haben eine Punkteanzahl, die nach jeder Runde erhöht wird
 * Spieler haben einen index Wert (Player 1 bzw. 2)
 *
 *
 * Rundenbasiert
 * -Es beginnt immer Spieler 1
 * -Nach jeder Runde wird markiert, wer dran ist
 *
 * Runde 0
 * -Es können zwei Karten umgedreht werden.
 * -Zuerst fängt Spieler 1 an. Dann Spieler 2
 * -Bei diesem Zug kann keine Karte aus dem Stack gezogen werden
 * -Der Spieler mit der höheren Punktzahl beginnt
 *
 * Runde 1
 *
 * -Man Zieht vom Nachziehstapel oder vom Ablagestapel
 * -Wenn man Karte vom Ablagestapel zieht, kann man entscheiden,
 * ob man diese durch eine aufgedeckte Karte tauscht oder durch
 * eine verdeckte Karte oder die Karte auf den Ablagestapel
 * ablegt und dafür eine noch nicht aufgedeckte Karte aufdeckt.
 *
 * Für KI heißt das, Check 1, Karte von Ablegestapel mit aufgedeckten
 * abgleichen. Wenn Karte niedgiger, mit höchster wechseln
 *
 * Wenn Karte höher, vom Stapel nehmen. Wenn Karte höher als die
 * aufgedeckten, dann ablegen und random eine nicht aufgedeckte
 * aufdecken
 *
 *
 * Wichtige Fixes:
 * - Karten werden als Card-Objekte gespeichert (nicht mehr als [Card] Arrays)
 * - Kartenverteilung nutzt splice(0,1)[0] (nicht splice(i,1))
 * - Aufrufe player.cards[i][0] → player.cards[i]
 * - Ziehen vom Stapel entfernt Karte wirklich aus cardStack
 * - KI-Logik: Auswahl- und Array-Index-Fixes, saubere Swaps
 * - Click-Events werden nach init() gebunden
 */
/**
 * Skyjo (vereinfachter Clone) – Vollständige, gefixte Version
 *
 * Fixes:
 * - Kapselung Ablagestapel (putOnAblage / takeFromAblage / updateAblageUI)
 * - Keine verschachtelten Kartenarrays mehr (Card-Objekte direkt)
 * - Sicheres Ziehen (splice(0,1)[0]) und korrektes Entfernen
 * - KI-Schritte mit Delays/„Animationen“ (KI_DELAY)
 * - Robuste Swaps (Spieler & KI), saubere DOM-Updates
 */
/**
 * Skyjo – vollständige, robuste Version mit
 * - Ablagestapel-Kapselung
 * - KI-Delays/„Animationen“
 * - Vertikal-Triple-Entfernung (0/4/8, 1/5/9, 2/6/10, 3/7/11)
 * - Null-sichere Punkte- & KI-Logik
 * - swap_card / end_turn Dummy-Implementierungen
/**
 * Skyjo – vollständige, robuste Version mit animierten Kartenflügen
 * - Karten fliegen zwischen Stack/Ablage/Board (Spieler & KI)
 * - Ablagestapel-Kapselung
 * - KI-Delays/„Animationen“
 * - Vertikal-Triple-Entfernung (0/4/8, 1/5/9, 2/6/10, 3/7/11)
 * - Null-sichere Punkte- & KI-Logik
 * - swap_card / end_turn Dummy-Implementierungen
 */

//*==== DOM-Referenzen ====
const myBoard = document.getElementById("myBoard");
const point_label = document.getElementById("point_label");
const player1Board = document.getElementById("p1Board");
const player2Board = document.getElementById("p2Board");

const action_modal = document.getElementById("action_modal");
const action_modal_card_from_stack = document.getElementById(
  "action_modal_card_from_stack",
);
const info_modal = document.getElementById("info_modal");

const btn_take_from_stack = document.getElementById("btn_take_from_stack");
const btn_swap_with_ablage = document.getElementById("btn_swap_with_ablage");
const btn_swap_with_ablage_after_new = document.getElementById(
  "btn_swap_with_ablage_after_new",
);
const btn_take_from_stack_after_new = document.getElementById(
  "btn_take_from_stack_after_new",
);
const lbl_game_points_opponent_title = document.getElementById(
  "lbl_game_points_opponent_title",
);
const lbl_game_points_player_title = document.getElementById(
  "lbl_game_points_player_title",
);
const lbl_game_points_ki = document.getElementById("lbl_game_points_ki");
const lbl_game_points_player = document.getElementById(
  "lbl_game_points_player",
);
const btn_next_game = document.getElementById("btn_next_game");
const mdl_endgame = document.getElementById("mdl_endgame");
const mdl_endgame_winner = document.getElementById("mdl_endgame_winner");
const lbl_finishText = document.getElementById("lbl_finishText");
const lbl_endgame_winner_title = document.getElementById(
  "lbl_endgame_winner_title",
);
const lbl_endgame_winner_text = document.getElementById(
  "lbl_endgame_winner_text",
);
const btn_endgame_winner_ok = document.getElementById("btn_endgame_winner_ok");
const endgame_stats = document.getElementById("endgame_stats");
const point_label_ki = document.getElementById("point_label_ki");
const start_modal = document.getElementById("start_modal");
const btn_new_game = document.getElementById("btn_new_game");
const btn_new_game_no_help = document.getElementById("btn_new_game_no_help");
const btn_continue_game = document.getElementById("btn_continue_game");
const btn_multiplayer = document.getElementById("btn_multiplayer");
const btn_online_multiplayer = document.getElementById(
  "btn_online_multiplayer",
);
const btn_settings = document.getElementById("btn_settings");
const online_modal = document.getElementById("online_modal");
const btn_online_create_room = document.getElementById(
  "btn_online_create_room",
);
const btn_online_start_game = document.getElementById("btn_online_start_game");
const btn_online_join_room = document.getElementById("btn_online_join_room");
const btn_online_copy_room_id = document.getElementById(
  "btn_online_copy_room_id",
);
const btn_close_online_modal = document.getElementById(
  "btn_close_online_modal",
);
const inp_online_room_code = document.getElementById("inp_online_room_code");
const lbl_online_room_id = document.getElementById("lbl_online_room_id");
const lbl_online_modal_status = document.getElementById(
  "lbl_online_modal_status",
);
const theme_modal = document.getElementById("theme_modal");
const btn_close_theme_modal = document.getElementById("btn_close_theme_modal");
const theme_option_modern = document.getElementById("theme_option_modern");
const theme_option_classic = document.getElementById("theme_option_classic");
const chk_show_round_points = document.getElementById("chk_show_round_points");
const theme_original_stylesheet = document.getElementById(
  "theme_original_stylesheet",
);
const btn_continue_game_title = document.getElementById(
  "btn_continue_game_title",
);
const btn_continue_game_subtitle = document.getElementById(
  "btn_continue_game_subtitle",
);
const player_card_stack = document.getElementById("player_card_stack");
const draw_pile_zone = document.getElementById("draw_pile_zone");
const discard_pile_zone = document.getElementById("discard_pile_zone");
const player_hand_panel = document.getElementById("player_hand_panel");
const player_turn_badge = document.getElementById("player_turn_badge");
const player_hand_title = document.getElementById("player_hand_title");
const player_hand_text = document.getElementById("player_hand_text");
const player_hand_slot = document.getElementById("player_hand_slot");

//*==== Spielzustand ====
let player1;
let player2;
let cardStack = [];
let ablageStack = []; //*Top-Karte bei Index 0
let currentPlayer = "player1";
let ki_player = true; //*Spieler 2 ist KI
let current_card = null; //*gezogene/aus Ablage genommene Karte „in der Hand“
let current_card_source = null; // 'stack' | 'ablage' | null
let is_Swap = false; //*true: nächster Klick tauscht mit current_card
let cards = []; //*DOM-Karten; wird in init() gefüllt
let noGuidanceMode = false;
let playerTurnPhase = "waiting";
let uiEventsBound = false;
let idleHintTimer = null;
let handHintText = "Wähle Nachziehstapel oder Ablagestapel.";

const SAVEGAME_STORAGE_KEY = "skyjo_savegame";
const GUIDANCE_MODE_STORAGE_KEY = "skyjo_no_guidance_mode";
const THEME_STORAGE_KEY = "skyjo_theme";
const ROUND_POINTS_VISIBILITY_STORAGE_KEY = "skyjo_show_round_points";

const PLAYER_PHASES = {
  WAITING: "waiting",
  FIRST_ROUND: "first-round",
  CHOOSE_ACTION: "choose-action",
  DRAWN_DECISION: "drawn-decision",
  MUST_SWAP: "must-swap",
  MUST_REVEAL: "must-reveal",
};

const PLAYER2_MODES = {
  KI: "ki",
  HUMAN: "human",
};

const CARD_ACTION_IDS = ["card_action_hand", "card_action_modal"];

//*Spielende-Status
let gameEnded = false;
let lastTurn = false; //*wurde „zugemacht“, und der andere hat noch genau einen Zug
let closingPlayer = null; //*wer hat zugemacht

//*KI-Tempo
const KI_DELAY = {
  think: 700,
  draw: 500, // etwas schneller, da die Fluganimation sichtbar ist
  swap: 400,
  reveal: 450,
  step: 300,
};

//* Animations-Parameter
const ANIM = {
  fly: 600,
  ease: "cubic-bezier(.22,.61,.36,1)", // smooth „Material“-Kurve
  z: 99999,
};

const ENDGAME_REVEAL_SETTLE_MS = 760;
const ENDGAME_MODAL_DELAY_MS = 1150;
const ENDGAME_ANIMATION_MULTIPLIER = 2;

function scaleEndgameAnimationMs(ms) {
  return Math.round(ms * ENDGAME_ANIMATION_MULTIPLIER);
}

const TURN_TRANSITION_MS = 360;

let save_object = {
  points_ki: 0,
  points_player: 0,
  no_guidance_mode: false,
  player2_mode: PLAYER2_MODES.KI,
};

// Letzte Position der Spieler-Vorschaukarte aus dem Stack (für Start der Flugbahn)
let lastDrawnCardRect = null;
let turnTransitionTimer = null;
let pendingEndgameSummary = null;
let pendingEndgameResetScores = false;
let showRoundPointsInLabels = true;
let onlineRoundResult = null;
let lastRenderedOnlineRoundResultId = null;
let lastAnnouncedOnlineTurnKey = null;
let infoModalTimeoutId = null;
let onlineRoundRestartTimerId = null;
let onlineScheduledRestartRoundId = null;

const ONLINE_RECONNECT_TOKEN_PREFIX = "skyjo_online_reconnect_";

const onlineSession = {
  active: false,
  roomCode: "",
  playerKey: null,
  reconnectToken: "",
  host: false,
  listenersBound: false,
  started: false,
  connectedPlayers: {
    player1: false,
    player2: false,
  },
};

let onlineApplyInProgress = false;

function clearRoundScoreOverlay() {
  document.getElementById("endgame_round_score_layer")?.remove();
}

function isMultiplayerMode() {
  return !ki_player;
}

function isOnlineMode() {
  return onlineSession.active;
}

function getSocketApi() {
  return window.SkyjoSocket ?? null;
}

function getReconnectStorageKey(roomCode) {
  return `${ONLINE_RECONNECT_TOKEN_PREFIX}${String(roomCode || "").toUpperCase()}`;
}

function storeReconnectToken(roomCode, token) {
  if (!roomCode || !token) return;
  localStorage.setItem(getReconnectStorageKey(roomCode), token);
}

function getStoredReconnectToken(roomCode) {
  if (!roomCode) return "";
  return localStorage.getItem(getReconnectStorageKey(roomCode)) || "";
}

function resetOnlineSession() {
  onlineSession.active = false;
  onlineSession.roomCode = "";
  onlineSession.playerKey = null;
  onlineSession.reconnectToken = "";
  onlineSession.host = false;
  onlineSession.started = false;
  onlineSession.connectedPlayers = {
    player1: false,
    player2: false,
  };
  lastAnnouncedOnlineTurnKey = null;
  if (onlineRoundRestartTimerId) {
    clearTimeout(onlineRoundRestartTimerId);
    onlineRoundRestartTimerId = null;
  }
  onlineScheduledRestartRoundId = null;
}

function scheduleHostOnlineRoundRestart(roundId, shouldResetScores, delayMs) {
  if (!isOnlineMode() || !onlineSession.host) return;
  if (!roundId) return;
  if (onlineScheduledRestartRoundId === roundId && onlineRoundRestartTimerId) {
    return;
  }

  if (onlineRoundRestartTimerId) {
    clearTimeout(onlineRoundRestartTimerId);
  }

  onlineScheduledRestartRoundId = roundId;
  onlineRoundRestartTimerId = setTimeout(() => {
    onlineRoundRestartTimerId = null;
    onlineScheduledRestartRoundId = null;
    startRoundWithoutModal(shouldResetScores);
  }, delayMs);
}

function maybeAnnounceOnlineTurn() {
  if (!isOnlineMode() || !onlineSession.started || gameEnded) return;
  if (!onlineSession.playerKey) return;
  if (currentPlayer === lastAnnouncedOnlineTurnKey) return;

  lastAnnouncedOnlineTurnKey = currentPlayer;
  const isMyTurn = currentPlayer === onlineSession.playerKey;
  show_info_modal(
    onlineSession.playerKey,
    isMyTurn ? "Du bist dran" : "Gegner ist dran",
    isMyTurn ? "Jetzt bist du am Zug." : "Bitte warte auf den Zug des Gegners.",
    1400,
    { forceModal: true, compact: true },
  );
}

function isHumanPlayer(playerKey) {
  return playerKey === "player1" || isMultiplayerMode();
}

function isHumanTurn() {
  if (isOnlineMode()) {
    return currentPlayer === onlineSession.playerKey;
  }
  return isHumanPlayer(currentPlayer);
}

function getPlayerByKey(playerKey) {
  return playerKey === "player1" ? player1 : player2;
}

function getCurrentPlayerObject() {
  return getPlayerByKey(currentPlayer);
}

function getCurrentPlayerNumber() {
  return currentPlayer === "player1" ? 1 : 2;
}

function getOtherPlayerKey(playerKey = currentPlayer) {
  return playerKey === "player1" ? "player2" : "player1";
}

function getPlayerDisplayName(playerKey) {
  if (isMultiplayerMode()) {
    return playerKey === "player1" ? "Spieler 1" : "Spieler 2";
  }
  return playerKey === "player1" ? "Du" : "Computer";
}

function getScoreLabel(playerKey) {
  if (isOnlineMode()) {
    return playerKey === onlineSession.playerKey ? "Du" : "Gegner";
  }
  if (isMultiplayerMode()) {
    return getPlayerDisplayName(playerKey);
  }
  return playerKey === "player1" ? "Du" : "KI";
}

function getPerspectiveRoundValues() {
  const player1Round = player1
    ? player1.cards.reduce(
        (acc, c) => acc + (c && !c.covered ? parseInt(c.value, 10) : 0),
        0,
      )
    : 0;
  const player2Round = player2
    ? player2.cards.reduce(
        (acc, c) => acc + (c && !c.covered ? parseInt(c.value, 10) : 0),
        0,
      )
    : 0;

  if (isOnlineMode() && onlineSession.playerKey === "player2") {
    return {
      playerRoundSum: player2Round,
      opponentRoundSum: player1Round,
    };
  }

  return {
    playerRoundSum: player1Round,
    opponentRoundSum: player2Round,
  };
}

function getPerspectiveGameValues() {
  const player1Game = save_object.points_player ?? 0;
  const player2Game = save_object.points_ki ?? 0;

  if (isOnlineMode() && onlineSession.playerKey === "player2") {
    return {
      playerGameSum: player2Game,
      opponentGameSum: player1Game,
    };
  }

  return {
    playerGameSum: player1Game,
    opponentGameSum: player2Game,
  };
}

function refreshGameScoreLayers() {
  const { playerGameSum, opponentGameSum } = getPerspectiveGameValues();
  if (lbl_game_points_player) {
    lbl_game_points_player.innerHTML = playerGameSum;
  }
  if (lbl_game_points_ki) {
    lbl_game_points_ki.innerHTML = opponentGameSum;
  }
}

function getWaitingTurnHint(playerKey = currentPlayer) {
  return `${getPlayerDisplayName(playerKey)} ist am Zug.`;
}

function formatHintForPlayer(text, playerKey = currentPlayer) {
  if (!text) return "";
  if (!isMultiplayerMode()) return text;
  return `${getPlayerDisplayName(playerKey)}: ${text}`;
}

function loadStoredPlayer2Mode() {
  return save_object.player2_mode === PLAYER2_MODES.HUMAN
    ? PLAYER2_MODES.HUMAN
    : PLAYER2_MODES.KI;
}

function updateModeLabels() {
  const mirroredPerspective =
    isOnlineMode() && onlineSession.playerKey === "player2";
  const visualTurnKey = mirroredPerspective
    ? currentPlayer === "player1"
      ? "player2"
      : "player1"
    : currentPlayer;

  document.body.classList.toggle("multiplayer-mode", isMultiplayerMode());
  document.body.classList.toggle("turn-player1", visualTurnKey === "player1");
  document.body.classList.toggle("turn-player2", visualTurnKey === "player2");
  document.body.classList.toggle(
    "online-perspective-player2",
    mirroredPerspective,
  );

  if (lbl_game_points_opponent_title) {
    if (isOnlineMode()) {
      lbl_game_points_opponent_title.textContent = "Gegner";
    } else {
      lbl_game_points_opponent_title.textContent = getScoreLabel("player2");
    }
  }
  if (lbl_game_points_player_title) {
    if (isOnlineMode()) {
      lbl_game_points_player_title.textContent = "Du";
    } else {
      lbl_game_points_player_title.textContent = getScoreLabel("player1");
    }
  }
  refreshGameScoreLayers();
  if (player_hand_title) {
    player_hand_title.textContent = isHumanTurn()
      ? `Handkarte ${getPlayerDisplayName(currentPlayer)}`
      : "Gezogene Karte";
  }
  if (player_turn_badge) {
    if (isMultiplayerMode()) {
      player_turn_badge.textContent = `Aktiver Zug: ${getPlayerDisplayName(currentPlayer)}`;
    } else {
      player_turn_badge.textContent = isHumanTurn()
        ? "Dein Zug"
        : "Computerzug";
    }
  }
}

function setModalPlayerContext(playerKey) {
  const isPlayer1 = playerKey === "player1";
  [action_modal, action_modal_card_from_stack, info_modal].forEach((modal) => {
    modal?.classList.toggle("p1", isPlayer1);
  });
}

function setPlayer2Mode(mode, options = {}) {
  const { persist = true } = options;

  ki_player = mode !== PLAYER2_MODES.HUMAN;
  save_object.player2_mode = ki_player ? PLAYER2_MODES.KI : PLAYER2_MODES.HUMAN;
  updateModeLabels();

  if (persist) {
    save_Game_into_Storage();
  }
}

function updateStartMenuCopy() {
  const savedMode = loadStoredPlayer2Mode();
  const hasSave = !!save_object.points_ki || !!save_object.points_player;

  if (btn_continue_game) {
    btn_continue_game.style.display = hasSave ? "block" : "none";
  }

  if (btn_continue_game_title) {
    btn_continue_game_title.textContent =
      savedMode === PLAYER2_MODES.HUMAN
        ? "Zwei-Spieler-Partie fortsetzen"
        : "Partie fortsetzen";
  }

  if (btn_continue_game_subtitle) {
    btn_continue_game_subtitle.textContent =
      savedMode === PLAYER2_MODES.HUMAN
        ? "Setzt eure letzte lokale Hotseat-Runde mit dem gleichen Modus fort."
        : "Laedt den zuletzt gespeicherten Stand gegen die KI.";
  }
}

function triggerTurnTransition() {
  updateModeLabels();
  if (!document.body) return;

  document.body.classList.remove("is-turn-transition");
  if (turnTransitionTimer) {
    clearTimeout(turnTransitionTimer);
  }

  void document.body.offsetWidth;
  document.body.classList.add("is-turn-transition");
  turnTransitionTimer = setTimeout(() => {
    document.body.classList.remove("is-turn-transition");
    turnTransitionTimer = null;
  }, TURN_TRANSITION_MS);
}

function switchToPlayer(playerKey) {
  currentPlayer = playerKey;
  show_current_player();
  maybeBroadcastOnlineState("switch-player");
}

function serializeCard(card) {
  if (!card) return null;
  return {
    value: Number(card.value),
    place: card.place,
    covered: !!card.covered,
  };
}

function serializePlayer(player) {
  return {
    name: player.name,
    playerNumber: player.playerNumber,
    points: player.points,
    firstRound: !!player.firstRound,
    first_two_cards: {
      discovered: player.first_two_cards?.discovered ?? 0,
      sum: player.first_two_cards?.sum ?? 0,
    },
    cards: player.cards.map((card) => serializeCard(card)),
  };
}

function deserializeCard(cardLike) {
  if (!cardLike) return null;
  return new Card(Number(cardLike.value), cardLike.place, !!cardLike.covered);
}

function deserializePlayer(playerLike, fallbackName, fallbackNumber) {
  const player = new Player(
    playerLike?.name || fallbackName,
    Number(playerLike?.playerNumber ?? fallbackNumber),
  );
  player.points = Number(playerLike?.points ?? 0);
  player.firstRound = !!playerLike?.firstRound;
  player.first_two_cards = {
    discovered: Number(playerLike?.first_two_cards?.discovered ?? 0),
    sum: Number(playerLike?.first_two_cards?.sum ?? 0),
  };
  player.cards = Array.isArray(playerLike?.cards)
    ? playerLike.cards.map((card) => deserializeCard(card))
    : [];
  return player;
}

function clearSlotState(slotId) {
  const slot = document.getElementById(slotId);
  if (!slot) return;
  slot.classList.remove("removed", "discover-effect");
  slot.style.pointerEvents = "";
  slot.style.cursor = "";
  slot.setAttribute("data-status", "covered");
  clearCardUI(slotId);
  setSlotCovered(slotId);
}

function renderPlayerBoardFromState(playerObj) {
  if (!playerObj) return;
  for (let i = 0; i < 12; i++) {
    const slotId = getBoardSlotId(playerObj.playerNumber, i);
    if (!slotId) continue;

    clearSlotState(slotId);
    const card = playerObj.cards[i];
    if (!card) {
      setSlotRemoved(slotId);
      continue;
    }

    if (card.covered) {
      setSlotCovered(slotId);
      continue;
    }

    discover_card(card, slotId, true);
    setSlotDiscovered(slotId);
  }
}

function exportOnlineState() {
  return {
    player1: serializePlayer(player1),
    player2: serializePlayer(player2),
    cardStack: cardStack.map((card) => serializeCard(card)),
    ablageStack: ablageStack.map((card) => serializeCard(card)),
    currentPlayer,
    playerTurnPhase,
    currentCard: serializeCard(current_card),
    currentCardSource: current_card_source,
    isSwap: !!is_Swap,
    gameEnded: !!gameEnded,
    lastTurn: !!lastTurn,
    closingPlayerKey:
      closingPlayer === player1
        ? "player1"
        : closingPlayer === player2
          ? "player2"
          : null,
    saveObject: {
      points_ki: Number(save_object.points_ki ?? 0),
      points_player: Number(save_object.points_player ?? 0),
      no_guidance_mode: !!save_object.no_guidance_mode,
      player2_mode: PLAYER2_MODES.HUMAN,
    },
    onlineRoundResult,
  };
}

function applyOnlineState(state) {
  if (!state) return;

  onlineApplyInProgress = true;
  try {
    player1 = deserializePlayer(state.player1, "Spieler 1", 1);
    player2 = deserializePlayer(state.player2, "Spieler 2", 2);
    cardStack = Array.isArray(state.cardStack)
      ? state.cardStack.map((card) => deserializeCard(card))
      : [];
    ablageStack = Array.isArray(state.ablageStack)
      ? state.ablageStack.map((card) => deserializeCard(card))
      : [];
    currentPlayer = state.currentPlayer === "player2" ? "player2" : "player1";
    current_card = deserializeCard(state.currentCard);
    current_card_source = state.currentCardSource || null;
    is_Swap = !!state.isSwap;
    gameEnded = !!state.gameEnded;
    lastTurn = !!state.lastTurn;
    closingPlayer =
      state.closingPlayerKey === "player2"
        ? player2
        : state.closingPlayerKey === "player1"
          ? player1
          : null;

    save_object.points_ki = Number(state.saveObject?.points_ki ?? 0);
    save_object.points_player = Number(state.saveObject?.points_player ?? 0);
    save_object.player2_mode = PLAYER2_MODES.HUMAN;
    save_object.no_guidance_mode = true;
    onlineRoundResult = state.onlineRoundResult ?? null;

    refreshGameScoreLayers();

    renderPlayerBoardFromState(player1);
    renderPlayerBoardFromState(player2);
    updateAblageUI();
    refreshDrawPileUI();
    setPlayerTurnPhase(
      state.playerTurnPhase || PLAYER_PHASES.WAITING,
      getWaitingTurnHint(currentPlayer),
    );
    updateHandCardUI();
    updateModeLabels();
    refresh_point_label();

    if (
      onlineRoundResult?.id &&
      gameEnded &&
      onlineRoundResult.id !== lastRenderedOnlineRoundResultId
    ) {
      lastRenderedOnlineRoundResultId = onlineRoundResult.id;
      void playEndRoundScoreAnimation([
        {
          playerKey: "player2",
          label: getPlayerDisplayName("player2"),
          boardEl: player2Board,
          basePoints: Number(onlineRoundResult.basePoints2 ?? 0),
          finalPoints: Number(onlineRoundResult.finalPoints2 ?? 0),
          isDoubled: onlineRoundResult.doubledPlayerKey === "player2",
        },
        {
          playerKey: "player1",
          label: getPlayerDisplayName("player1"),
          boardEl: player1Board,
          basePoints: Number(onlineRoundResult.basePoints1 ?? 0),
          finalPoints: Number(onlineRoundResult.finalPoints1 ?? 0),
          isDoubled: onlineRoundResult.doubledPlayerKey === "player1",
        },
      ]);
    }

    if (gameEnded && onlineRoundResult?.id) {
      const shouldResetScores =
        save_object.points_ki >= 100 || save_object.points_player >= 100;
      scheduleHostOnlineRoundRestart(
        onlineRoundResult.id,
        shouldResetScores,
        scaleEndgameAnimationMs(ENDGAME_MODAL_DELAY_MS),
      );
    }

    show_current_player();
  } finally {
    onlineApplyInProgress = false;
  }
}

async function maybeBroadcastOnlineState(reason = "") {
  if (!isOnlineMode()) return;
  if (onlineApplyInProgress) return;
  if (!onlineSession.started) return;

  const socketApi = getSocketApi();
  if (!socketApi) return;

  try {
    await socketApi.syncState(onlineSession.roomCode, {
      reason,
      state: exportOnlineState(),
    });
  } catch (error) {
    console.warn("Online-Sync fehlgeschlagen:", error?.message || error);
  }
}

function ensureOnlineListenersBound() {
  if (onlineSession.listenersBound) return;
  const socketApi = getSocketApi();
  if (!socketApi) return;

  socketApi.on("roomReady", (payload) => {
    if (!onlineSession.active) return;

    const wasPlayer2Connected = !!onlineSession.connectedPlayers.player2;

    onlineSession.connectedPlayers = {
      player1: !!payload?.connected?.player1,
      player2: !!payload?.connected?.player2,
    };

    if (!wasPlayer2Connected && onlineSession.connectedPlayers.player2) {
      show_info_modal(
        onlineSession.playerKey,
        "Spieler verbunden",
        "Spieler 2 ist dem Raum beigetreten.",
        2200,
        { forceModal: true, compact: true },
      );
    }

    if (onlineSession.host && !onlineSession.started) {
      if (btn_online_start_game) {
        btn_online_start_game.hidden = false;
        btn_online_start_game.disabled = false;
      }

      if (onlineSession.connectedPlayers.player2) {
        setOnlineModalStatus(
          "Mitspieler verbunden. Du kannst jetzt das Spiel starten.",
          "success",
        );
      } else {
        setOnlineModalStatus("Warte auf einen Mitspieler...", "info");
      }
    }
  });

  socketApi.on("stateUpdate", (payload) => {
    if (!onlineSession.active) return;
    const rawState = payload?.state?.state ?? payload?.state;
    applyOnlineState(rawState);
    onlineSession.started = true;
  });

  socketApi.on("playerDisconnected", (payload) => {
    if (!onlineSession.active) return;
    const disconnectedPlayer =
      payload?.playerKey === "player2" ? "Spieler 2" : "Spieler 1";
    show_info_modal(
      onlineSession.playerKey,
      "Verbindung unterbrochen",
      `${disconnectedPlayer} ist getrennt. Reconnect-Zeitfenster: 120 Sekunden.`,
      3500,
      { forceModal: true, compact: true },
    );

    if (onlineSession.host && !onlineSession.started) {
      onlineSession.connectedPlayers.player2 = false;
      if (btn_online_start_game) {
        btn_online_start_game.disabled = false;
      }
      setOnlineModalStatus(
        "Mitspieler getrennt. Warte auf Reconnect...",
        "info",
      );
    }
  });

  socketApi.on("playerReconnected", (payload) => {
    if (!onlineSession.active) return;
    const reconnectedPlayer =
      payload?.playerKey === "player2" ? "Spieler 2" : "Spieler 1";
    show_info_modal(
      onlineSession.playerKey,
      "Wieder verbunden",
      `${reconnectedPlayer} ist wieder online.`,
      2200,
      { forceModal: true, compact: true },
    );
  });

  socketApi.on("roomAbandoned", (payload) => {
    if (!onlineSession.active) return;
    const winnerKey = payload?.winner === "player2" ? "player2" : "player1";
    show_info_modal(
      onlineSession.playerKey,
      "Match beendet",
      `${getPlayerDisplayName(winnerKey)} gewinnt durch Verbindungsabbruch.`,
      4000,
      { forceModal: true, compact: true },
    );
    resetOnlineSession();
  });

  onlineSession.listenersBound = true;
}

function setOnlineModalStatus(text, kind = "info") {
  if (!lbl_online_modal_status) return;
  lbl_online_modal_status.textContent = text || "";
  lbl_online_modal_status.classList.remove(
    "status-info",
    "status-error",
    "status-success",
  );
  lbl_online_modal_status.classList.add(
    kind === "error"
      ? "status-error"
      : kind === "success"
        ? "status-success"
        : "status-info",
  );
}

function resetOnlineModalState() {
  if (lbl_online_room_id) {
    lbl_online_room_id.textContent = "-";
  }
  if (btn_online_copy_room_id) {
    btn_online_copy_room_id.disabled = true;
  }
  if (inp_online_room_code) {
    inp_online_room_code.value = "";
  }
  if (btn_online_start_game) {
    btn_online_start_game.hidden = true;
    btn_online_start_game.disabled = false;
  }
  setOnlineModalStatus("", "info");
}

function closeOnlineModal() {
  online_modal?.classList.remove("active");
}

function openOnlineModal() {
  resetOnlineModalState();
  online_modal?.classList.add("active");
}

async function copyRoomCodeToClipboard() {
  const roomCode = String(lbl_online_room_id?.textContent || "").trim();
  if (!roomCode || roomCode === "-") return;

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(roomCode);
      setOnlineModalStatus("Raumcode wurde kopiert.", "success");
      return;
    }

    if (inp_online_room_code) {
      inp_online_room_code.value = roomCode;
      inp_online_room_code.focus();
      inp_online_room_code.select();
      document.execCommand("copy");
      setOnlineModalStatus("Raumcode wurde kopiert.", "success");
      return;
    }
  } catch (error) {
    setOnlineModalStatus(
      `Kopieren fehlgeschlagen: ${error?.message || error}`,
      "error",
    );
  }
}

async function handleOnlineCreateRoom() {
  const socketApi = getSocketApi();
  if (!socketApi) {
    setOnlineModalStatus("Socket.IO wurde nicht geladen.", "error");
    return;
  }

  setOnlineModalStatus("Raum wird erstellt...", "info");

  try {
    const created = await socketApi.createRoom();

    onlineSession.active = true;
    onlineSession.roomCode = created.roomCode;
    onlineSession.playerKey = created.playerKey;
    onlineSession.reconnectToken = created.reconnectToken;
    onlineSession.host = true;
    onlineSession.started = false;
    onlineSession.connectedPlayers = {
      player1: true,
      player2: false,
    };
    storeReconnectToken(created.roomCode, created.reconnectToken);

    setPlayer2Mode(PLAYER2_MODES.HUMAN, { persist: false });
    setGuidanceMode(true, { persist: false });

    if (lbl_online_room_id) {
      lbl_online_room_id.textContent = created.roomCode;
    }
    if (btn_online_copy_room_id) {
      btn_online_copy_room_id.disabled = false;
    }
    if (btn_online_start_game) {
      btn_online_start_game.hidden = false;
      btn_online_start_game.disabled = false;
    }

    setOnlineModalStatus(
      "Raum erstellt. Teile die ID und warte auf einen Mitspieler.",
      "success",
    );
  } catch (error) {
    resetOnlineSession();
    setOnlineModalStatus(
      `Online-Start fehlgeschlagen: ${error?.message || error}`,
      "error",
    );
  }
}

async function handleOnlineJoinRoom() {
  const socketApi = getSocketApi();
  if (!socketApi) {
    setOnlineModalStatus("Socket.IO wurde nicht geladen.", "error");
    return;
  }

  const roomCode = String(inp_online_room_code?.value || "")
    .trim()
    .toUpperCase();
  if (!roomCode) {
    setOnlineModalStatus("Bitte gib einen Raumcode ein.", "error");
    inp_online_room_code?.focus();
    return;
  }

  setOnlineModalStatus("Beitreten...", "info");

  try {
    const storedToken = getStoredReconnectToken(roomCode);
    const joined = await socketApi.joinRoom(roomCode, storedToken);

    onlineSession.active = true;
    onlineSession.roomCode = joined.roomCode;
    onlineSession.playerKey = joined.playerKey;
    onlineSession.reconnectToken = joined.reconnectToken;
    onlineSession.host = joined.playerKey === "player1";
    onlineSession.started = !!joined.gameState;
    onlineSession.connectedPlayers = {
      player1: !!joined?.room?.connected?.player1,
      player2: !!joined?.room?.connected?.player2,
    };
    storeReconnectToken(joined.roomCode, joined.reconnectToken);

    setPlayer2Mode(PLAYER2_MODES.HUMAN, { persist: false });
    setGuidanceMode(true, { persist: false });

    closeOnlineModal();
    if (start_modal) start_modal.classList.remove("active");
    init();

    if (joined.gameState?.state) {
      applyOnlineState(joined.gameState.state);
    } else {
      show_info_modal(
        onlineSession.playerKey,
        "Raum beigetreten",
        "Warte, bis der Host die Partie startet.",
        2600,
      );
    }
  } catch (error) {
    resetOnlineSession();
    setOnlineModalStatus(
      `Beitritt fehlgeschlagen: ${error?.message || error}`,
      "error",
    );
  }
}

async function handleOnlineStartGame() {
  if (!onlineSession.active || !onlineSession.host) {
    setOnlineModalStatus("Nur der Host kann das Spiel starten.", "error");
    return;
  }

  if (onlineSession.started) {
    setOnlineModalStatus("Spiel wurde bereits gestartet.", "info");
    return;
  }

  onlineSession.started = true;
  lastAnnouncedOnlineTurnKey = null;
  if (!onlineSession.connectedPlayers.player2) {
    setOnlineModalStatus(
      "Spiel gestartet. Warte, bis ein Mitspieler beitritt.",
      "info",
    );
  }
  closeOnlineModal();
  if (start_modal) start_modal.classList.remove("active");
  init();
  maybeBroadcastOnlineState("match-start");
}

async function startOnlineMultiplayerFlow() {
  const socketApi = getSocketApi();
  if (!socketApi) {
    setOnlineModalStatus("Socket.IO wurde nicht geladen.", "error");
    return;
  }

  socketApi.ensureSocket();
  ensureOnlineListenersBound();
  openOnlineModal();
}

function countOpenCards(player) {
  return player.cards.filter((card) => card && !card.covered).length;
}

function countCoveredCards(player) {
  return player.cards.filter((card) => card && card.covered).length;
}

function countRemovedCards(player) {
  return player.cards.filter((card) => !card).length;
}

function renderEndgameStats(stats) {
  if (!endgame_stats) return;

  if (!stats) {
    endgame_stats.innerHTML = "";
    endgame_stats.classList.add("is-empty");
    return;
  }

  const playerCard = ({
    label,
    roundPoints,
    totalPoints,
    openCards,
    coveredCards,
    removedCards,
    isDoubled,
  }) => `
    <section class="endgame-stat-card">
      <h4>${label}</h4>
      <div class="endgame-stat-row"><span>Rundenpunkte</span><strong>${roundPoints}</strong></div>
      <div class="endgame-stat-row"><span>Spielstand nach Runde</span><strong>${totalPoints}</strong></div>
      <div class="endgame-stat-row"><span>Offene Karten</span><strong>${openCards}</strong></div>
      <div class="endgame-stat-row"><span>Verdeckte Karten</span><strong>${coveredCards}</strong></div>
      <div class="endgame-stat-row"><span>Entfernte Karten</span><strong>${removedCards}</strong></div>
      <div class="endgame-stat-row"><span>Verdopplung</span><strong>${isDoubled ? "Ja" : "Nein"}</strong></div>
    </section>`;

  const ruleText = stats.doubledPlayerKey
    ? `${getPlayerDisplayName(stats.doubledPlayerKey)} hat die Runde geschlossen, aber nicht die wenigsten Punkte erzielt. Deshalb wurden die Rundenpunkte verdoppelt.`
    : stats.closingPlayerKey
      ? `${getPlayerDisplayName(stats.closingPlayerKey)} hat die Runde geschlossen und die Verdopplungsregel nicht ausgeloest.`
      : "Die Runde endete ohne Schliesser. Es wurde keine Verdopplung angewendet.";

  const orderedStatCards = isMultiplayerMode()
    ? `${playerCard(stats.player2)}${playerCard(stats.player1)}`
    : `${playerCard(stats.player1)}${playerCard(stats.player2)}`;

  endgame_stats.innerHTML = `
    ${orderedStatCards}
    <section class="endgame-rule-card">
      <h4>Rundenregel</h4>
      <p>${ruleText}</p>
    </section>`;
  endgame_stats.classList.remove("is-empty");
}

function hideEndgameOverlays() {
  mdl_endgame?.classList.remove("active", "is-summary");
  mdl_endgame_winner?.classList.remove("active");
}

function resetEndgameFlowState() {
  pendingEndgameSummary = null;
  pendingEndgameResetScores = false;
  clearRoundScoreOverlay();
  hideEndgameOverlays();
}

function showEndgameSummary() {
  if (!pendingEndgameSummary || !mdl_endgame || !lbl_finishText) return;

  mdl_endgame_winner?.classList.remove("active");
  mdl_endgame.classList.add("active", "is-summary");
  lbl_finishText.innerHTML = pendingEndgameSummary.headline;
  renderEndgameStats(pendingEndgameSummary.stats);
  btn_next_game.textContent = pendingEndgameResetScores
    ? "Neues Spiel"
    : "Weiter";
  do_enable_area();
}

function queueEndgameFlow({
  winnerTitle,
  winnerText,
  summaryHeadline,
  stats,
  resetScores = false,
  initialDelayMs = 900,
}) {
  pendingEndgameSummary = {
    headline: summaryHeadline,
    stats,
  };
  pendingEndgameResetScores = resetScores;

  hideEndgameOverlays();
  renderEndgameStats(null);
  btn_next_game.textContent = resetScores ? "Neues Spiel" : "Weiter";

  if (lbl_endgame_winner_title) {
    lbl_endgame_winner_title.textContent = winnerTitle;
  }
  if (lbl_endgame_winner_text) {
    lbl_endgame_winner_text.textContent = winnerText;
  }

  setTimeout(() => {
    mdl_endgame_winner?.classList.add("active");
    do_enable_area();
  }, initialDelayMs);
}

//*==== Klassen ====

class Player {
  constructor(name, playerNumber) {
    this.name = name;
    this.cards = []; //*Array<Card | null>
    this.points = 0;
    this.firstRound = true;
    this.playerNumber = playerNumber;
    this.first_two_cards = {
      discovered: 0,
      sum: 0,
    };
  }
}

class Card {
  constructor(value, place, covered = false) {
    this.value = value; //*number
    this.place = place; //*'stack' | 'hand' | 'board'
    this.covered = covered;
  }
}

//*==== Kartendefinition ====

const all_cards = {
  "-2": 5,
  "-1": 10,
  0: 15,
  1: 10,
  2: 10,
  3: 10,
  4: 10,
  5: 10,
  6: 10,
  7: 10,
  8: 10,
  9: 10,
  10: 10,
  11: 10,
  12: 10,
};

const COLUMN_GROUPS = [
  [0, 4, 8],
  [1, 5, 9],
  [2, 6, 10],
  [3, 7, 11],
];

const KI_WEIGHTS = {
  visibleImprovement: 9,
  visibleRegression: 7,
  coveredPlacementBase: 16,
  coveredHighPenalty: 3,
  tripleFinish: 160,
  tripleBuild: 48,
  pairSupport: 20,
  negativeSetPenalty: 42,
  lowCardBonus: 10,
  zeroCardBonus: 32,
  highCardPenalty: 8,
  discardHighValueBonus: 6,
  discardLowValuePenalty: 18,
  discardZeroPenalty: 42,
  opponentTripleThreat: 140,
  opponentSetThreat: 28,
  revealPairColumn: 38,
  revealTripleChance: 26,
  revealStructuredColumn: 20,
  revealHighCardPressure: 4,
  revealFreshColumn: 6,
  revealSingleCoveredBonus: 6,
  takeDiscardThreshold: 30,
  drawSwapThreshold: 12,
  lastTurnAggression: 1.35,
  closingDefense: 1.25,
};

//*==== Spielende-Helfer ====

function hasAllCardsOpen(player) {
  //*alle Slots sind entweder entfernt (null) oder offen (!covered)
  return player.cards.every((c) => c === null || !c.covered);
}

function countPoints(player) {
  let points = 0;
  for (let i = 0; i < player.cards.length; i++) {
    if (player.cards[i]) {
      points += parseInt(player.cards[i].value, 10);
    }
  }
  return points;
}

function closeActionModals() {
  action_modal?.classList.remove("active");
  action_modal_card_from_stack?.classList.remove("active");
  info_modal?.classList.remove("active");
}

function clearIdleHintTimer() {
  if (idleHintTimer) {
    clearTimeout(idleHintTimer);
    idleHintTimer = null;
  }
}

function resetHighlights() {
  document.querySelectorAll(".highlight").forEach((el) => {
    el.classList.remove("highlight");
  });
}

function setHandHint(text) {
  handHintText = formatHintForPlayer(text || "");
  if (player_hand_text) {
    player_hand_text.textContent = handHintText;
  }
}

function getActionCardElements() {
  return CARD_ACTION_IDS.map((id) => document.getElementById(id)).filter(
    Boolean,
  );
}

function clearActionCardUI() {
  getActionCardElements().forEach((el) => {
    clearCardUI(el.id);
    el.classList.add("covered", "is-empty");
  });
}

function renderActionCard(value) {
  getActionCardElements().forEach((el) => {
    el.classList.remove("covered", "is-empty");
    set_attributes_to_Card(el.id, value);
  });
}

function getVisibleActionCardRect() {
  const visibleActionCard = getActionCardElements().find((el) => {
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  });

  return visibleActionCard ? rectOf(visibleActionCard) : null;
}

function refreshPileInteractivity() {
  const activePlayer = getCurrentPlayerObject();
  const canChooseAction =
    isHumanTurn() &&
    !gameEnded &&
    !activePlayer?.firstRound &&
    playerTurnPhase === PLAYER_PHASES.CHOOSE_ACTION;

  draw_pile_zone?.classList.toggle("is-interactive", canChooseAction);
  player_card_stack?.classList.toggle("is-interactive", canChooseAction);

  const canDiscardDrawn =
    isHumanTurn() &&
    !gameEnded &&
    playerTurnPhase === PLAYER_PHASES.DRAWN_DECISION &&
    current_card_source === "stack" &&
    !!current_card;

  const canTakeDiscard =
    isHumanTurn() &&
    !gameEnded &&
    playerTurnPhase === PLAYER_PHASES.CHOOSE_ACTION &&
    !!topAblage();

  const discardInteractive = canDiscardDrawn || canTakeDiscard;
  discard_pile_zone?.classList.toggle("is-interactive", discardInteractive);
  const ablageEl = document.getElementById("player_card_ablage");
  ablageEl?.classList.toggle("is-interactive", discardInteractive);
}

function updateBoardGuidance() {
  resetHighlights();

  if (!isHumanTurn() || gameEnded) {
    refreshPileInteractivity();
    return;
  }

  const activePlayer = getCurrentPlayerObject();
  const activePlayerNumber = getCurrentPlayerNumber();

  if (
    activePlayer?.firstRound ||
    playerTurnPhase === PLAYER_PHASES.FIRST_ROUND
  ) {
    activePlayer.cards.forEach((card, index) => {
      if (card?.covered) {
        const slotId = getBoardSlotId(activePlayerNumber, index);
        if (slotId) highlightSlot(slotId, true);
      }
    });
  } else if (
    playerTurnPhase === PLAYER_PHASES.MUST_SWAP ||
    (playerTurnPhase === PLAYER_PHASES.DRAWN_DECISION &&
      current_card_source === "stack" &&
      !!current_card)
  ) {
    activePlayer.cards.forEach((card, index) => {
      if (card) {
        const slotId = getBoardSlotId(activePlayerNumber, index);
        if (slotId) highlightSlot(slotId, true);
      }
    });
  } else if (playerTurnPhase === PLAYER_PHASES.MUST_REVEAL) {
    activePlayer.cards.forEach((card, index) => {
      if (card?.covered) {
        const slotId = getBoardSlotId(activePlayerNumber, index);
        if (slotId) highlightSlot(slotId, true);
      }
    });
  }

  refreshPileInteractivity();
}

function updateHandCardUI() {
  updateModeLabels();

  if (player_hand_panel) {
    player_hand_panel.classList.toggle("is-active", !!current_card);
    player_hand_panel.classList.toggle("is-no-guidance", noGuidanceMode);
  }
  if (player_hand_slot) {
    player_hand_slot.classList.toggle("has-card", !!current_card);
  }

  if (!current_card) {
    clearActionCardUI();
    if (noGuidanceMode && isHumanTurn() && !gameEnded) {
      const activePlayer = getCurrentPlayerObject();
      if (activePlayer?.firstRound) {
        setHandHint("Decke 2 deiner Karten auf.");
      } else if (playerTurnPhase === PLAYER_PHASES.MUST_REVEAL) {
        setHandHint("Decke jetzt genau eine verdeckte Karte auf.");
      } else if (playerTurnPhase === PLAYER_PHASES.CHOOSE_ACTION) {
        setHandHint("Wähle Nachziehstapel oder Ablagestapel.");
      }
    }
    return;
  }

  renderActionCard(current_card.value);

  if (playerTurnPhase === PLAYER_PHASES.DRAWN_DECISION) {
    setHandHint(
      "Lege die Karte auf die Ablage oder tausche sie mit einer deiner Karten.",
    );
  } else if (playerTurnPhase === PLAYER_PHASES.MUST_SWAP) {
    setHandHint("Wähle jetzt genau eine deiner Karten zum Tauschen.");
  }
}

function scheduleIdleHint() {
  clearIdleHintTimer();
  if (!noGuidanceMode || !isHumanTurn() || gameEnded) return;

  idleHintTimer = setTimeout(() => {
    if (!isHumanTurn() || gameEnded) return;

    if (
      getCurrentPlayerObject()?.firstRound ||
      playerTurnPhase === PLAYER_PHASES.FIRST_ROUND
    ) {
      setHandHint(
        "Tipp: Decke 2 verdeckte Karten auf, um die Runde zu starten.",
      );
    } else if (playerTurnPhase === PLAYER_PHASES.CHOOSE_ACTION) {
      setHandHint(
        "Tipp: Klicke auf den Nachziehstapel oder nimm die offene Karte vom Ablagestapel.",
      );
    } else if (playerTurnPhase === PLAYER_PHASES.DRAWN_DECISION) {
      setHandHint(
        "Tipp: Lege die gezogene Karte auf die Ablage oder tausche sie direkt mit einer eigenen Karte.",
      );
    } else if (playerTurnPhase === PLAYER_PHASES.MUST_SWAP) {
      setHandHint(
        "Tipp: Du musst die Karte jetzt mit genau einer eigenen Karte tauschen.",
      );
    } else if (playerTurnPhase === PLAYER_PHASES.MUST_REVEAL) {
      setHandHint(
        "Tipp: Decke jetzt eine verdeckte Karte auf, damit dein Zug endet.",
      );
    }

    updateBoardGuidance();
  }, 6500);
}

function setPlayerTurnPhase(phase, hintText = null) {
  playerTurnPhase = phase;
  if (hintText !== null) {
    setHandHint(hintText);
  }
  updateHandCardUI();
  updateBoardGuidance();
  scheduleIdleHint();
}

function setGuidanceMode(enabled, options = {}) {
  const { persist = true } = options;
  const nextEnabled = isMultiplayerMode() ? true : enabled;

  noGuidanceMode = nextEnabled;
  save_object.no_guidance_mode = nextEnabled;
  document.body.classList.toggle("no-guidance-mode", nextEnabled);
  closeActionModals();
  updateHandCardUI();
  updateBoardGuidance();

  localStorage.setItem(GUIDANCE_MODE_STORAGE_KEY, String(nextEnabled));

  if (persist) {
    save_Game_into_Storage();
  }
}

function loadStoredGuidanceMode() {
  const storedMode = localStorage.getItem(GUIDANCE_MODE_STORAGE_KEY);
  if (storedMode === null) {
    return save_object.no_guidance_mode ?? false;
  }

  return storedMode === "true";
}

function refreshDrawPileUI() {
  if (!player_card_stack) return;
  if (cardStack.length > 0) {
    player_card_stack.classList.add("covered");
    player_card_stack.classList.remove("is-empty");
  } else {
    player_card_stack.classList.remove("covered");
    player_card_stack.classList.add("is-empty");
  }
}

function recycleDiscardIntoDrawPile() {
  if (cardStack.length > 0) return true;
  if (ablageStack.length <= 1) return false;

  const topCard = ablageStack.shift();
  const recycled = ablageStack.map((card) => {
    card.covered = true;
    card.place = "stack";
    return card;
  });

  cardStack = shuffleArray(recycled);
  ablageStack = topCard ? [topCard] : [];
  updateAblageUI();
  refreshDrawPileUI();
  return cardStack.length > 0;
}

function bindUIActions() {
  if (uiEventsBound) return;
  uiEventsBound = true;

  btn_take_from_stack?.addEventListener("click", onTakeFromStack);
  btn_swap_with_ablage?.addEventListener("click", onTakeFromAblage);
  btn_swap_with_ablage_after_new?.addEventListener(
    "click",
    onDiscardDrawnAndRevealOne,
  );
  btn_take_from_stack_after_new?.addEventListener("click", onKeepDrawnAndSwap);

  player_card_stack?.addEventListener("click", () => {
    if (!noGuidanceMode) return;
    onTakeFromStack();
  });

  discard_pile_zone?.addEventListener("click", () => {
    if (!noGuidanceMode) return;
    if (
      playerTurnPhase === PLAYER_PHASES.DRAWN_DECISION &&
      current_card_source === "stack" &&
      current_card
    ) {
      onDiscardDrawnAndRevealOne();
      return;
    }
    onTakeFromAblage();
  });
}

btn_next_game.addEventListener("click", () => {
  if (isOnlineMode() && !onlineSession.host) {
    return;
  }

  const shouldResetScores = pendingEndgameResetScores;
  resetEndgameFlowState();
  startRoundWithoutModal(shouldResetScores);
});

btn_endgame_winner_ok?.addEventListener("click", () => {
  showEndgameSummary();
});

// Starte eine neue Runde ohne Page-Reload. Wenn resetScores=true, werden
// die kumulierten Punktestände zurückgesetzt.
function startRoundWithoutModal(resetScores = false) {
    if (onlineRoundRestartTimerId) {
      clearTimeout(onlineRoundRestartTimerId);
      onlineRoundRestartTimerId = null;
    }
    onlineScheduledRestartRoundId = null;

  if (resetScores) {
    save_object.points_ki = 0;
    save_object.points_player = 0;
    save_Game_into_Storage();
  }

  // Reset globale Spielzustandsvariablen
  gameEnded = false;
  onlineRoundResult = null;
  lastTurn = false;
  closingPlayer = null;
  current_card = null;
  current_card_source = null;
  is_Swap = false;
  clearIdleHintTimer();
  resetEndgameFlowState();
  renderEndgameStats(null);
  setPlayerTurnPhase(PLAYER_PHASES.WAITING, "Warte auf den nächsten Zug.");

  // Clear stacks
  ablageStack = [];
  cardStack = [];

  // Remove flying effects layer if present
  const fx = document.getElementById("fx-layer");
  if (fx) fx.remove();

  // Clear board UI slots (player boards + ablage)
  const slotEls = Array.from(
    document.querySelectorAll(".grid-card, .card.grid-card"),
  );
  slotEls.forEach((el) => {
    el.innerHTML = "";
    el.classList.remove(
      "green",
      "red",
      "yellow",
      "lightblue",
      "blue",
      "discover-effect",
      "removed",
    );
    if (!el.classList.contains("covered")) el.classList.add("covered");
    el.setAttribute("data-status", "covered");
    el.style.pointerEvents = "";
    el.style.cursor = "";
  });

  // Ablage UI
  clearCardUI("player_card_ablage");
  setSlotCovered("player_card_ablage");

  // Recreate players and deal new cards
  create_player();
  create_cards();
  give_player_cards(player1);
  give_player_cards(player2);

  // Put one card to ablage to start (like in init)
  if (cardStack.length > 0) {
    const startDiscard = cardStack.splice(0, 1)[0];
    startDiscard.covered = false;
    putOnAblage(startDiscard);
  } else {
    updateAblageUI();
  }
  refreshDrawPileUI();

  // Update cumulative score labels
  refreshGameScoreLayers();
  refresh_point_label();

  // Set current player and continue
  currentPlayer = "player1";
  show_current_player();

  if (isOnlineMode() && onlineSession.host && !onlineApplyInProgress) {
    maybeBroadcastOnlineState("round-restart");
  }

  // Debug helpers
  helper_show_cards(player1);
  helper_show_cards(player2);
  count_points_debug();
}

async function endGame() {
  if (gameEnded) return;
  gameEnded = true;
  do_disable_area();

  const basePoints1 = countPoints(player1);
  const basePoints2 = countPoints(player2);
  let points1 = basePoints1;
  let points2 = basePoints2;
  let doubledPlayerKey = null;
  const player1OpenCards = countOpenCards(player1);
  const player1CoveredCards = countCoveredCards(player1);
  const player1RemovedCards = countRemovedCards(player1);
  const player2OpenCards = countOpenCards(player2);
  const player2CoveredCards = countCoveredCards(player2);
  const player2RemovedCards = countRemovedCards(player2);

  //*Sonderregel: Wenn der Schließende NICHT die wenigsten Punkte hat → verdoppeln
  if (closingPlayer) {
    if (closingPlayer === player1 && points1 > points2) {
      points1 *= 2;
      doubledPlayerKey = "player1";
    } else if (closingPlayer === player2 && points2 > points1) {
      points2 *= 2;
      doubledPlayerKey = "player2";
    }
  }

  const closingPlayerKey =
    closingPlayer === player1
      ? "player1"
      : closingPlayer === player2
        ? "player2"
        : null;

  let winner = "Unentschieden";
  if (points1 < points2) winner = getPlayerDisplayName("player1");
  else if (points2 < points1) winner = getPlayerDisplayName("player2");

  const totalAfterRoundPlayer1 = (save_object.points_player ?? 0) + points1;
  const totalAfterRoundPlayer2 = (save_object.points_ki ?? 0) + points2;

  const endgameStats = {
    player1: {
      label: getPlayerDisplayName("player1"),
      roundPoints: points1,
      totalPoints: totalAfterRoundPlayer1,
      openCards: player1OpenCards,
      coveredCards: player1CoveredCards,
      removedCards: player1RemovedCards,
      isDoubled: doubledPlayerKey === "player1",
    },
    player2: {
      label: getPlayerDisplayName("player2"),
      roundPoints: points2,
      totalPoints: totalAfterRoundPlayer2,
      openCards: player2OpenCards,
      coveredCards: player2CoveredCards,
      removedCards: player2RemovedCards,
      isDoubled: doubledPlayerKey === "player2",
    },
    closingPlayerKey,
    doubledPlayerKey,
  };

  //* add points to sum and save
  save_object.points_ki += points2;
  save_object.points_player += points1;
  refreshGameScoreLayers();
  refresh_point_label();

  reveal_all_cards();
  await playEndRoundScoreAnimation([
    {
      playerKey: "player2",
      label: getPlayerDisplayName("player2"),
      boardEl: player2Board,
      basePoints: basePoints2,
      finalPoints: points2,
      isDoubled: doubledPlayerKey === "player2",
    },
    {
      playerKey: "player1",
      label: getPlayerDisplayName("player1"),
      boardEl: player1Board,
      basePoints: basePoints1,
      finalPoints: points1,
      isDoubled: doubledPlayerKey === "player1",
    },
  ]);

  if (isOnlineMode()) {
    onlineRoundResult = {
      id: Date.now(),
      basePoints1: basePoints1,
      basePoints2: basePoints2,
      finalPoints1: points1,
      finalPoints2: points2,
      doubledPlayerKey,
    };

    const shouldResetScores =
      save_object.points_ki >= 100 || save_object.points_player >= 100;
    const nextRoundDelay = scaleEndgameAnimationMs(ENDGAME_MODAL_DELAY_MS);
    if (onlineSession.host) {
      scheduleHostOnlineRoundRestart(
        onlineRoundResult.id,
        shouldResetScores,
        nextRoundDelay,
      );
    }

    do_disable_area();
    maybeBroadcastOnlineState("end-game-auto-next-round");
    return;
  }

  if (save_object.points_ki >= 100) {
    show_winner({
      initialDelayMs: scaleEndgameAnimationMs(ENDGAME_MODAL_DELAY_MS),
    });
  } else if (save_object.points_player >= 100) {
    show_winner({
      initialDelayMs: scaleEndgameAnimationMs(ENDGAME_MODAL_DELAY_MS),
    });
  } else {
    save_Game_into_Storage();
    queueEndgameFlow({
      winnerTitle: "Rundensieger",
      winnerText:
        winner === "Unentschieden"
          ? "Die Runde endet unentschieden."
          : `${winner} hat die Runde gewonnen.`,
      summaryHeadline: doubledPlayerKey
        ? `${winner}<br><span class="endgame-note">${getPlayerDisplayName(doubledPlayerKey)} hat die Verdopplungsregel ausgeloest.</span>`
        : `${winner}`,
      stats: endgameStats,
      initialDelayMs: scaleEndgameAnimationMs(ENDGAME_MODAL_DELAY_MS),
    });
  }

  //*Optional: UI sperren
  do_disable_area();
  maybeBroadcastOnlineState("end-game");
}

//*ANCHOR - Show Winner of the game and reset local storage for new game
function show_winner(options = {}) {
  const { initialDelayMs = 900 } = options;
  const isPlayer1Winner = save_object.points_ki > save_object.points_player;
  const winnerKey = isPlayer1Winner ? "player1" : "player2";
  const finalStats = {
    player1: {
      label: getPlayerDisplayName("player1"),
      roundPoints: countPoints(player1),
      totalPoints: save_object.points_player,
      openCards: countOpenCards(player1),
      coveredCards: countCoveredCards(player1),
      removedCards: countRemovedCards(player1),
      isDoubled: false,
    },
    player2: {
      label: getPlayerDisplayName("player2"),
      roundPoints: countPoints(player2),
      totalPoints: save_object.points_ki,
      openCards: countOpenCards(player2),
      coveredCards: countCoveredCards(player2),
      removedCards: countRemovedCards(player2),
      isDoubled: false,
    },
    closingPlayerKey: null,
    doubledPlayerKey: null,
  };

  save_object.points_ki = 0;
  save_object.points_player = 0;
  save_Game_into_Storage();
  refresh_point_label();

  queueEndgameFlow({
    winnerTitle: "Spielsieger",
    winnerText: `${getPlayerDisplayName(winnerKey)} hat das Spiel gewonnen.`,
    summaryHeadline: `${getPlayerDisplayName(winnerKey)} gewinnt das Spiel`,
    stats: finalStats,
    resetScores: true,
    initialDelayMs,
  });
}

function do_disable_area() {
  const disable_area = document.getElementById("disable_area");
  if (disable_area) disable_area.classList.add("active");
}

function do_enable_area() {
  const disable_area = document.getElementById("disable_area");
  if (disable_area) disable_area.classList.remove("active");
}

//*Einheitlicher Turn-Abschluss – MUSS am Ende JEDES ZUGES aufgerufen werden
function end_of_turn(finished = null) {
  if (gameEnded) return;

  //*Wer hat den Zug gerade beendet?
  const finishedPlayer =
    finished === "player1"
      ? player1
      : finished === "player2"
        ? player2
        : currentPlayer === "player1"
          ? player1
          : player2;

  const otherPlayer = finishedPlayer === player1 ? player2 : player1;
  const otherKey = finishedPlayer === player1 ? "player2" : "player1";

  //*Hat der gerade beendende Spieler alle Karten offen/entfernt?
  if (hasAllCardsOpen(finishedPlayer)) {
    if (!lastTurn) {
      //*Er hat „zugemacht“ → anderer Spieler bekommt GENAU EINEN Zug
      lastTurn = true;
      closingPlayer = finishedPlayer;
      show_info_modal(
        otherKey,
        "Letzter Zug",
        `${otherPlayer.name} hat jetzt einen letzten Zug.`,
        2500,
      );
      switchToPlayer(otherKey);
      return;
    } else {
      //*Es war bereits der letzte Zug → jetzt endet das Spiel
      endGame();
      return;
    }
  }

  //*Falls schon „lastTurn“ aktiv ist und nun der andere (nicht Schließender) fertig ist → Spielende
  if (lastTurn && finishedPlayer !== closingPlayer) {
    endGame();
    return;
  }

  //*Normaler Spielerwechsel
  switchToPlayer(otherKey);
  maybeBroadcastOnlineState("end-turn");
}

//*(kompatibler Alias, falls dein Code irgendwo end_turn() aufruft)
function end_turn() {
  end_of_turn(currentPlayer);
}

//*==== Utils ====

function wait(ms) {
  const disable_area = document.getElementById("disable_area");
  if (disable_area) {
    disable_area.classList.add("active");
    setTimeout(() => disable_area.classList.remove("active"), ms);
  }
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

//*==== DOM-Helfer ====

function setSlotDiscovered(slotId) {
  const el = document.getElementById(slotId);
  if (!el) return;
  //*entfernte Slots bleiben gesperrt
  if (el.getAttribute("data-status") === "removed") return;

  el.classList.remove("covered");
  el.setAttribute("data-status", "discovered");
  if (el.style.pointerEvents === "none") {
    //*Falls durch externe Styles gesetzt wurde: nur reaktivieren, wenn nicht removed
    el.style.pointerEvents = "";
    el.style.cursor = "";
  }
}

function setSlotCovered(slotId) {
  const el = document.getElementById(slotId);
  if (!el) return;
  if (el.getAttribute("data-status") === "removed") return;

  el.classList.add("covered");
  el.setAttribute("data-status", "covered");
  if (el.style.pointerEvents === "none") {
    el.style.pointerEvents = "";
    el.style.cursor = "";
  }
}

function setSlotRemoved(slotId) {
  const el = document.getElementById(slotId);
  if (!el) return;
  el.classList.add("removed");
  el.setAttribute("data-status", "removed");

  //*🔒 Hard-Block: nicht anklickbar, nichts drauflegbar
  el.style.pointerEvents = "none";
  el.style.cursor = "not-allowed";
}

function isSlotRemoved(elOrId) {
  const el =
    typeof elOrId === "string" ? document.getElementById(elOrId) : elOrId;
  if (!el) return false;
  return el.getAttribute("data-status") === "removed";
}

function highlightSlot(slotId, on = true) {
  const el = document.getElementById(slotId);
  if (!el) return;
  if (on) el.classList.add("highlight");
  else el.classList.remove("highlight");
}

function clearCardUI(slotId) {
  const host = document.getElementById(slotId);
  if (!host) return;
  host.innerHTML = "";
  host.classList.remove("green", "red", "yellow", "lightblue", "blue");
}

//*Finde Board-Slot-Element per Spieler/Index (unterstützt zwei ID-Schemata)
function getBoardSlotElement(playerNumber, index) {
  const id1 = `player${playerNumber}_card_${index}`;
  let el = document.getElementById(id1);
  if (el) return el;
  const id2 = `p${playerNumber}_card_${index}`; //*Fallback
  return document.getElementById(id2);
}
//*Liefert die ID, wenn Element existiert
function getBoardSlotId(playerNumber, index) {
  const el = getBoardSlotElement(playerNumber, index);
  return el ? el.id : null;
}

//*Ablage-Helpers
function topAblage() {
  return ablageStack[0] ?? null;
}
function putOnAblage(card) {
  card.covered = false;
  card.place = "ablage";
  ablageStack.unshift(card);
  updateAblageUI();
}
function takeFromAblage() {
  if (!ablageStack.length) return null;
  const c = ablageStack.shift();
  updateAblageUI();
  return c;
}
function updateAblageUI() {
  const slotId = "player_card_ablage";
  const top = topAblage();
  if (top) {
    //*discover_card prüft via Regex, dass Ablage NICHT Triple-Check auslöst
    discover_card(top, slotId, true);
  } else {
    clearCardUI(slotId);
    setSlotCovered(slotId);
  }
}

function getPlayerAndIndexFromSlot(elOrId) {
  const el =
    typeof elOrId === "string" ? document.getElementById(elOrId) : elOrId;
  if (!el) return null;
  const player = el.getAttribute("data-player");
  const index = parseInt(el.getAttribute("data-index"));
  return { player, index, id: el.id, el };
}

/* -----------------------------------------------------------
   ✨ Animations-Helfer: fliegende Karten (Stack/Ablage ↔ Board)
------------------------------------------------------------ */

function ensureFxLayer() {
  let layer = document.getElementById("fx-layer");
  if (!layer) {
    layer = document.createElement("div");
    layer.id = "fx-layer";
    layer.style.position = "fixed";
    layer.style.left = "0";
    layer.style.top = "0";
    layer.style.width = "100vw";
    layer.style.height = "100vh";
    layer.style.pointerEvents = "none";
    layer.style.zIndex = String(ANIM.z);
    document.body.appendChild(layer);
  }
  return layer;
}

function rectOf(elOrRect) {
  if (!elOrRect) return null;
  if (typeof elOrRect === "object" && "left" in elOrRect && "top" in elOrRect) {
    return elOrRect; // schon ein Rect
  }
  const el =
    typeof elOrRect === "string" ? document.getElementById(elOrRect) : elOrRect;
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}

function viewportCenterRect(w = 72, h = 104) {
  const vw = Math.max(
    document.documentElement.clientWidth,
    window.innerWidth || 0,
  );
  const vh = Math.max(
    document.documentElement.clientHeight,
    window.innerHeight || 0,
  );
  return {
    left: (vw - w) / 2,
    top: (vh - h) / 2,
    width: w,
    height: h,
  };
}

function uniqueId(prefix = "flycard") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now()}`;
}

// Erzeugt einen fliegenden Karten-Klon mit richtiger Farbe/Labels
function makeFlyingCard(value, fromRect) {
  const layer = ensureFxLayer();
  const host = document.createElement("div");
  const id = uniqueId("fly");
  host.id = id;
  host.style.position = "fixed";
  host.style.left = (fromRect?.left ?? 0) + "px";
  host.style.top = (fromRect?.top ?? 0) + "px";
  host.style.width = (fromRect?.width ?? 72) + "px";
  host.style.height = (fromRect?.height ?? 104) + "px";
  host.style.willChange = "transform";
  host.style.transform = "translate(0,0) scale(1)";
  host.style.pointerEvents = "none";
  host.style.filter = "drop-shadow(0 6px 18px rgba(0,0,0,.25))";
  host.style.borderRadius = "10px";
  host.style.backfaceVisibility = "hidden";

  layer.appendChild(host);
  // nutzt deine bestehende Farblogik/Markup
  set_attributes_to_Card(id, value);
  return host;
}

// Karte von A → B fliegen lassen; Start/End können auch DOMRects sein
async function flyCardBetween({
  value,
  from,
  to,
  duration = ANIM.fly,
  easing = ANIM.ease,
}) {
  const fromRect = rectOf(from) || viewportCenterRect();
  const toRect = rectOf(to) || viewportCenterRect();

  const fly = makeFlyingCard(value, fromRect);

  const dx = toRect.left - fromRect.left;
  const dy = toRect.top - fromRect.top;
  const sx = toRect.width / fromRect.width;
  const sy = toRect.height / fromRect.height;

  const anim = fly.animate(
    [
      { transform: "translate(0px,0px) scale(1,1)", opacity: 1 },
      {
        transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`,
        opacity: 1,
      },
    ],
    { duration, easing, fill: "forwards" },
  );

  await anim.finished.catch(() => {});
  fly.remove();
}

// Zwei Flüge für einen Swap (neu A→B, alt B→Ablage) parallel ausführen
async function flySwap({
  newValue,
  fromEl,
  toEl,
  oldValue,
  ablageEl = "player_card_ablage",
  duration = ANIM.fly,
}) {
  const fromRect = rectOf(fromEl);
  const toRect = rectOf(toEl);
  const abRect = rectOf(ablageEl);

  const tasks = [];
  if (newValue != null && fromRect && toRect) {
    tasks.push(
      flyCardBetween({ value: newValue, from: fromRect, to: toRect, duration }),
    );
  }
  if (oldValue != null && toRect && abRect) {
    tasks.push(
      flyCardBetween({ value: oldValue, from: toRect, to: abRect, duration }),
    );
  }
  await Promise.all(tasks);
}

// UI kurz blockieren, während Animationen laufen
async function withUIBlocked(promise) {
  do_disable_area();
  try {
    return await promise;
  } finally {
    do_enable_area();
  }
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function formatRoundScoreValue(value) {
  return value > 0 ? `+${value}` : `${value}`;
}

function ensureRoundScoreLayer() {
  let layer = document.getElementById("endgame_round_score_layer");
  if (!layer) {
    layer = document.createElement("div");
    layer.id = "endgame_round_score_layer";
    layer.className = "endgame-round-score-layer";
    document.body.appendChild(layer);
  }
  return layer;
}

function getBoardAnchorPosition(boardEl, playerKey) {
  const fallback = viewportCenterRect();
  if (!boardEl) {
    return {
      left: fallback.left + fallback.width / 2,
      top: fallback.top,
    };
  }

  const rect = boardEl.getBoundingClientRect();
  const isPlayer1 = playerKey === "player1";
  return {
    left: rect.left + rect.width / 2,
    top: isPlayer1
      ? rect.top + rect.height * 0.32
      : rect.top + rect.height * 0.68,
  };
}

function createRoundScoreChip({ playerKey, label, top, left }) {
  const chip = document.createElement("section");
  chip.className = `endgame-round-score-chip ${playerKey}`;
  chip.style.left = `${left}px`;
  chip.style.top = `${top}px`;
  chip.style.setProperty("--chip-y", playerKey === "player1" ? "-56%" : "-44%");

  const labelEl = document.createElement("div");
  labelEl.className = "endgame-round-score-label";
  labelEl.textContent = label;

  const valueEl = document.createElement("div");
  valueEl.className = "endgame-round-score-value";
  valueEl.textContent = "0";

  const multiplierEl = document.createElement("div");
  multiplierEl.className = "endgame-round-score-multiplier";
  multiplierEl.textContent = "x2";

  chip.appendChild(labelEl);
  chip.appendChild(valueEl);
  chip.appendChild(multiplierEl);

  return { chip, valueEl, multiplierEl };
}

function animateRoundScoreValue(valueEl, from, to, duration = 900) {
  return new Promise((resolve) => {
    const start = performance.now();
    const startValue = Number.isFinite(from) ? from : 0;
    const targetValue = Number.isFinite(to) ? to : 0;

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeOutCubic(progress);
      const value = Math.round(startValue + (targetValue - startValue) * eased);
      valueEl.textContent = formatRoundScoreValue(value);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        valueEl.textContent = formatRoundScoreValue(targetValue);
        resolve();
      }
    }

    requestAnimationFrame(step);
  });
}

async function runRoundScoreChipAnimation({
  chip,
  valueEl,
  multiplierEl,
  basePoints,
  finalPoints,
  isDoubled,
  staggerMs = 0,
}) {
  await new Promise((resolve) =>
    setTimeout(resolve, scaleEndgameAnimationMs(staggerMs)),
  );
  chip.classList.add("is-visible");

  const baseDuration = Math.max(
    scaleEndgameAnimationMs(700),
    Math.min(
      scaleEndgameAnimationMs(1300),
      scaleEndgameAnimationMs(820 + Math.abs(basePoints) * 16),
    ),
  );
  await animateRoundScoreValue(valueEl, 0, basePoints, baseDuration);

  if (isDoubled && basePoints !== finalPoints) {
    multiplierEl.classList.add("is-active");
    chip.classList.add("is-doubling");
    await new Promise((resolve) =>
      setTimeout(resolve, scaleEndgameAnimationMs(520)),
    );
    await animateRoundScoreValue(
      valueEl,
      basePoints,
      finalPoints,
      scaleEndgameAnimationMs(760),
    );
    chip.classList.remove("is-doubling");
  }
}

async function playEndRoundScoreAnimation(entries = []) {
  if (!Array.isArray(entries) || entries.length === 0) return;

  await new Promise((resolve) =>
    setTimeout(resolve, scaleEndgameAnimationMs(ENDGAME_REVEAL_SETTLE_MS)),
  );

  const layer = ensureRoundScoreLayer();
  layer.classList.remove("active", "is-exit");
  layer.innerHTML = "";

  const chips = entries.map((entry) => {
    const anchor = getBoardAnchorPosition(entry.boardEl, entry.playerKey);
    const created = createRoundScoreChip({
      playerKey: entry.playerKey,
      label: entry.label,
      left: anchor.left,
      top: anchor.top,
    });
    layer.appendChild(created.chip);
    return { ...created, ...entry };
  });

  requestAnimationFrame(() => layer.classList.add("active"));

  await Promise.all(
    chips.map((chipData, index) =>
      runRoundScoreChipAnimation({
        ...chipData,
        staggerMs: 280 * index,
      }),
    ),
  );

  await new Promise((resolve) =>
    setTimeout(resolve, scaleEndgameAnimationMs(620)),
  );
  layer.classList.add("is-exit");
  await new Promise((resolve) =>
    setTimeout(resolve, scaleEndgameAnimationMs(380)),
  );
  layer.remove();
}

// Zieh-Startrechteck für KI (falls kein Stack-Element vorhanden)
function getKiStackStartRect() {
  // 1) Gibt es ein sichtbares Stack-Element?
  const el = document.getElementById("player_card_stack");
  const r = rectOf(el);
  if (r && r.width > 0 && r.height > 0) return r;
  // 2) Nimm Info-Modal oder Ablage als Näherung
  const info = rectOf(info_modal);
  if (info) return info;
  const ab = rectOf("player_card_ablage");
  if (ab)
    return {
      left: ab.left,
      top: ab.top - 80,
      width: ab.width,
      height: ab.height,
    };
  // 3) Fallback: Bildschirmmitte
  return viewportCenterRect();
}

function getColumnIndexForSlot(slotIndex) {
  return COLUMN_GROUPS.findIndex((column) => column.includes(slotIndex));
}

function getPlayerColumnStates(player) {
  return COLUMN_GROUPS.map((indices, columnIndex) => {
    const entries = indices.map((index) => ({
      index,
      card: player.cards[index],
    }));
    const activeEntries = entries.filter((entry) => entry.card !== null);
    const openEntries = activeEntries.filter((entry) => !entry.card.covered);
    const coveredEntries = activeEntries.filter((entry) => entry.card.covered);

    return {
      columnIndex,
      indices,
      entries,
      activeEntries,
      openEntries,
      coveredEntries,
      removedCount: entries.length - activeEntries.length,
      openValues: openEntries.map((entry) => entry.card.value),
      openSum: openEntries.reduce((sum, entry) => sum + entry.card.value, 0),
    };
  });
}

function getOpponentNeedScore(opponent, cardValue) {
  if (cardValue == null) return 0;

  return getPlayerColumnStates(opponent).reduce((score, column) => {
    const sameVisible = column.openEntries.filter(
      (entry) => entry.card.value === cardValue,
    ).length;

    if (sameVisible >= 2) {
      return score + KI_WEIGHTS.opponentTripleThreat;
    }
    if (sameVisible === 1) {
      return score + KI_WEIGHTS.opponentSetThreat;
    }
    return score;
  }, 0);
}

function getKiStrategicContext() {
  const aiOpenCards = player2.cards.filter(
    (card) => card && !card.covered,
  ).length;
  const opponentOpenCards = player1.cards.filter(
    (card) => card && !card.covered,
  ).length;

  return {
    opponentLikelyClosing:
      (lastTurn && closingPlayer === player1) || opponentOpenCards >= 10,
    aiLikelyClosing:
      (lastTurn && closingPlayer === player2) || aiOpenCards >= 10,
  };
}

function evaluateKiSwap(player, opponent, incomingValue, slotIndex, context) {
  const targetCard = player.cards[slotIndex];
  if (!targetCard) return Number.NEGATIVE_INFINITY;

  const columnIndex = getColumnIndexForSlot(slotIndex);
  const column = getPlayerColumnStates(player)[columnIndex];
  if (!column) return Number.NEGATIVE_INFINITY;

  const otherOpenEntries = column.openEntries.filter(
    (entry) => entry.index !== slotIndex,
  );
  const sameOpenCount = otherOpenEntries.filter(
    (entry) => entry.card.value === incomingValue,
  ).length;
  const avoidsNegativeCollection = incomingValue < 0;

  let positiveScore = 0;
  let negativeScore = 0;

  if (!targetCard.covered) {
    const delta = targetCard.value - incomingValue;
    if (delta >= 0) {
      positiveScore += delta * KI_WEIGHTS.visibleImprovement;
    } else {
      negativeScore += Math.abs(delta) * KI_WEIGHTS.visibleRegression;
    }
  } else {
    positiveScore +=
      KI_WEIGHTS.coveredPlacementBase -
      Math.max(0, incomingValue) * KI_WEIGHTS.coveredHighPenalty;
  }

  if (!avoidsNegativeCollection) {
    if (sameOpenCount >= 2) {
      positiveScore += KI_WEIGHTS.tripleFinish;
    } else if (sameOpenCount === 1) {
      positiveScore += KI_WEIGHTS.tripleBuild;
      if (targetCard.covered) {
        positiveScore += KI_WEIGHTS.pairSupport;
      }
    }
  } else if (sameOpenCount > 0) {
    negativeScore += sameOpenCount * KI_WEIGHTS.negativeSetPenalty;
  }

  if (incomingValue <= 0) {
    positiveScore += KI_WEIGHTS.lowCardBonus;
  }
  if (incomingValue === 0) {
    positiveScore += KI_WEIGHTS.zeroCardBonus;
  }
  if (incomingValue >= 8) {
    negativeScore += (incomingValue - 7) * KI_WEIGHTS.highCardPenalty;
  }

  if (!targetCard.covered) {
    negativeScore += getOpponentNeedScore(opponent, targetCard.value);
  }

  if (context.opponentLikelyClosing) {
    positiveScore *= KI_WEIGHTS.lastTurnAggression;
  }
  if (context.aiLikelyClosing) {
    negativeScore *= KI_WEIGHTS.closingDefense;
  }

  return positiveScore - negativeScore;
}

function getBestKiSwapOption(incomingValue, source, context) {
  let bestOption = null;

  for (let index = 0; index < player2.cards.length; index++) {
    const targetCard = player2.cards[index];
    if (!targetCard) continue;

    const score = evaluateKiSwap(
      player2,
      player1,
      incomingValue,
      index,
      context,
    );

    if (!bestOption || score > bestOption.score) {
      bestOption = { index, score, source };
    }
  }

  return bestOption;
}

function getSmartRevealChoice(player, context) {
  const columns = getPlayerColumnStates(player);
  let bestChoice = null;

  for (const column of columns) {
    for (const entry of column.coveredEntries) {
      let score = 0;

      if (column.openEntries.length >= 2) {
        score += KI_WEIGHTS.revealPairColumn;
        const distinctOpenValues = new Set(column.openValues);
        if (distinctOpenValues.size === 1) {
          score += KI_WEIGHTS.revealTripleChance;
        }
      } else if (column.openEntries.length === 1) {
        score += KI_WEIGHTS.revealStructuredColumn;
        score +=
          Math.max(0, column.openEntries[0].card.value) *
          KI_WEIGHTS.revealHighCardPressure;
      } else {
        score += KI_WEIGHTS.revealFreshColumn;
      }

      if (column.coveredEntries.length === 1) {
        score += KI_WEIGHTS.revealSingleCoveredBonus;
      }

      if (context.opponentLikelyClosing) {
        score *= KI_WEIGHTS.lastTurnAggression;
      }

      if (!bestChoice || score > bestChoice.score) {
        bestChoice = { index: entry.index, score };
      }
    }
  }

  return bestChoice;
}

function evaluateKiDiscardAndReveal(drawnValue, revealChoice, context) {
  let score = revealChoice ? revealChoice.score : 0;

  if (drawnValue >= 7) {
    score += drawnValue * KI_WEIGHTS.discardHighValueBonus;
  } else if (drawnValue === 0) {
    score -= KI_WEIGHTS.discardZeroPenalty;
  } else if (drawnValue < 0) {
    score -= Math.abs(drawnValue - 1) * KI_WEIGHTS.discardLowValuePenalty;
  }

  let opponentRisk = getOpponentNeedScore(player1, drawnValue);
  if (context.aiLikelyClosing) {
    opponentRisk *= KI_WEIGHTS.closingDefense;
  }

  return score - opponentRisk;
}

async function ki_reveal_index(index) {
  if (index == null) return;

  const slotId = getBoardSlotId(2, index);
  if (!slotId || isSlotRemoved(slotId)) return;

  const card = player2.cards[index];
  if (!card) return;

  await wait(KI_DELAY.reveal);
  highlightSlot(slotId, true);
  discover_card(card, slotId, true);
  setSlotDiscovered(slotId);
  await wait(KI_DELAY.step);
  highlightSlot(slotId, false);
}

async function ki_execute_swap(option, incomingCard) {
  if (!option || !incomingCard) return false;

  const boardSlotId = getBoardSlotId(2, option.index);
  if (!boardSlotId || isSlotRemoved(boardSlotId)) return false;

  const boardSlotEl = document.getElementById(boardSlotId);
  const oldCard = player2.cards[option.index];
  const fromEl =
    option.source === "ablage" ? "player_card_ablage" : getKiStackStartRect();

  await withUIBlocked(
    flySwap({
      newValue: incomingCard.value,
      fromEl,
      toEl: boardSlotEl,
      oldValue: oldCard ? oldCard.value : null,
      ablageEl: "player_card_ablage",
      duration: ANIM.fly,
    }),
  );

  let appliedCard = incomingCard;
  if (option.source === "ablage") {
    appliedCard = takeFromAblage();
    if (!appliedCard) return false;
  }

  player2.cards[option.index] = appliedCard;
  player2.cards[option.index].place = "board";
  player2.cards[option.index].covered = false;

  if (oldCard) {
    putOnAblage(oldCard);
  }

  discover_card(player2.cards[option.index], boardSlotId, true);
  setSlotDiscovered(boardSlotId);
  return true;
}

async function ki_discard_drawn_and_reveal(drawnCard, revealChoice) {
  await withUIBlocked(
    flyCardBetween({
      value: drawnCard.value,
      from: getKiStackStartRect(),
      to: "player_card_ablage",
      duration: ANIM.fly,
    }),
  );

  putOnAblage(drawnCard);

  if (revealChoice) {
    await ki_reveal_index(revealChoice.index);
    return;
  }

  await ki_reveal_random_covered_one();
}

function getKiFirstRoundRevealIndices() {
  const columns = shuffleArray([...getPlayerColumnStates(player2)]);
  const selected = [];

  for (const column of columns) {
    if (!column.coveredEntries.length) continue;
    const choice =
      column.coveredEntries[
        Math.floor(Math.random() * column.coveredEntries.length)
      ];
    selected.push(choice.index);
    if (selected.length === 2) break;
  }

  if (selected.length < 2) {
    const fallbackCovered = player2.cards
      .map((card, index) => ({ card, index }))
      .filter(({ card, index }) => card?.covered && !selected.includes(index));
    shuffleArray(fallbackCovered);
    while (selected.length < 2 && fallbackCovered.length > 0) {
      selected.push(fallbackCovered.shift().index);
    }
  }

  return selected;
}

/* ===========================
   ===== Initialisierung =====
   =========================== */

window.onload = showStartModalWrapper;

function showStartModalWrapper() {
  setRoundPointsVisibility(loadStoredRoundPointsVisibility(), {
    persist: false,
  });

  // lade gespeicherte Punkte, damit wir wissen, ob "Weiterspielen" sichtbar sein soll
  loadGameFromLocalStorage();
  setPlayer2Mode(loadStoredPlayer2Mode(), { persist: false });
  setGuidanceMode(ki_player ? loadStoredGuidanceMode() : true, {
    persist: false,
  });
  resetEndgameFlowState();
  renderEndgameStats(null);
  updateStartMenuCopy();
  applyTheme(loadStoredTheme(), { persist: false });

  if (start_modal) start_modal.classList.add("active");

  btn_new_game?.addEventListener("click", () => {
    resetOnlineSession();
    closeOnlineModal();
    // Reset Scores und starte neues Spiel gegen KI
    save_object.points_ki = 0;
    save_object.points_player = 0;
    setPlayer2Mode(PLAYER2_MODES.KI, { persist: false });
    setGuidanceMode(false, { persist: false });
    save_Game_into_Storage();
    if (start_modal) start_modal.classList.remove("active");
    init();
  });

  btn_new_game_no_help?.addEventListener("click", () => {
    resetOnlineSession();
    closeOnlineModal();
    save_object.points_ki = 0;
    save_object.points_player = 0;
    setPlayer2Mode(PLAYER2_MODES.KI, { persist: false });
    setGuidanceMode(true, { persist: false });
    save_Game_into_Storage();
    if (start_modal) start_modal.classList.remove("active");
    init();
  });

  btn_continue_game?.addEventListener("click", () => {
    resetOnlineSession();
    closeOnlineModal();
    if (start_modal) start_modal.classList.remove("active");
    loadGameFromLocalStorage();
    setPlayer2Mode(loadStoredPlayer2Mode(), { persist: false });
    setGuidanceMode(ki_player ? loadStoredGuidanceMode() : true, {
      persist: false,
    });
    init();
  });

  btn_multiplayer?.addEventListener("click", () => {
    resetOnlineSession();
    closeOnlineModal();
    save_object.points_ki = 0;
    save_object.points_player = 0;
    setPlayer2Mode(PLAYER2_MODES.HUMAN, { persist: false });
    setGuidanceMode(true, { persist: false });
    save_Game_into_Storage();
    if (start_modal) start_modal.classList.remove("active");
    init();
  });

  btn_online_multiplayer?.addEventListener("click", async () => {
    await startOnlineMultiplayerFlow();
  });

  btn_online_create_room?.addEventListener("click", async () => {
    await handleOnlineCreateRoom();
  });

  btn_online_start_game?.addEventListener("click", async () => {
    await handleOnlineStartGame();
  });

  btn_online_join_room?.addEventListener("click", async () => {
    await handleOnlineJoinRoom();
  });

  inp_online_room_code?.addEventListener("keydown", async (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    await handleOnlineJoinRoom();
  });

  btn_online_copy_room_id?.addEventListener("click", async () => {
    await copyRoomCodeToClipboard();
  });

  btn_close_online_modal?.addEventListener("click", () => {
    closeOnlineModal();
  });

  btn_settings?.addEventListener("click", () => {
    updateThemeSelectionUI();
    theme_modal?.classList.add("active");
  });

  btn_close_theme_modal?.addEventListener("click", () => {
    theme_modal?.classList.remove("active");
  });

  theme_option_modern?.addEventListener("click", () => {
    applyTheme("modern");
    updateThemeSelectionUI();
  });

  theme_option_classic?.addEventListener("click", () => {
    applyTheme("classic");
    updateThemeSelectionUI();
  });

  chk_show_round_points?.addEventListener("change", () => {
    setRoundPointsVisibility(!!chk_show_round_points.checked);
  });
}

function loadStoredRoundPointsVisibility() {
  const stored = localStorage.getItem(ROUND_POINTS_VISIBILITY_STORAGE_KEY);
  if (stored === null) return true;
  return stored !== "false";
}

function updateRoundPointsCheckboxUI() {
  if (chk_show_round_points) {
    chk_show_round_points.checked = showRoundPointsInLabels;
  }
}

function setRoundPointsVisibility(enabled, { persist = true } = {}) {
  showRoundPointsInLabels = !!enabled;
  updateRoundPointsCheckboxUI();

  if (persist) {
    localStorage.setItem(
      ROUND_POINTS_VISIBILITY_STORAGE_KEY,
      String(showRoundPointsInLabels),
    );
  }

  refresh_point_label();
}

function loadStoredTheme() {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "classic") return "classic";
  return "modern";
}

function applyTheme(themeName, { persist = true } = {}) {
  const safeTheme = themeName === "classic" ? "classic" : "modern";
  const useClassicTheme = safeTheme === "classic";

  document.body.classList.remove("theme-modern", "theme-classic");
  document.body.classList.add(`theme-${safeTheme}`);
  document.body.dataset.theme = safeTheme;

  if (theme_original_stylesheet) {
    theme_original_stylesheet.disabled = !useClassicTheme;
  }

  if (persist) {
    localStorage.setItem(THEME_STORAGE_KEY, safeTheme);
  }
}

function updateThemeSelectionUI() {
  const activeTheme = document.body.classList.contains("theme-classic")
    ? "classic"
    : "modern";

  theme_option_modern?.classList.toggle(
    "is-selected",
    activeTheme === "modern",
  );
  theme_option_classic?.classList.toggle(
    "is-selected",
    activeTheme === "classic",
  );
}

function init() {
  if (!isOnlineMode()) {
    loadGameFromLocalStorage();
    setPlayer2Mode(loadStoredPlayer2Mode(), { persist: false });
    setGuidanceMode(ki_player ? loadStoredGuidanceMode() : true, {
      persist: false,
    });
  } else {
    setPlayer2Mode(PLAYER2_MODES.HUMAN, { persist: false });
    setGuidanceMode(true, { persist: false });
  }
  resetEndgameFlowState();
  create_player();
  create_cards();
  give_player_cards(player1);
  give_player_cards(player2);

  //*Event-Listener für Karten erst jetzt binden
  cards = Array.from(document.querySelectorAll(".card"));
  cards.forEach((cardEl) => {
    if (cardEl.dataset.boundCardClick === "true") return;
    cardEl.dataset.boundCardClick = "true";
    cardEl.addEventListener("click", () => onCardClick(cardEl));
  });

  bindUIActions();

  //*Start: oberste Karte offen auf Ablage legen (optional ohne Flug)
  if (cardStack.length > 0) {
    const startDiscard = cardStack.splice(0, 1)[0]; // oberste Karte vom Nachziehstapel
    startDiscard.covered = false; // soll offen liegen
    putOnAblage(startDiscard); // setzt ablageStack=[karte] + UI-Update
  } else {
    updateAblageUI();
  }

  refreshDrawPileUI();
  updateHandCardUI();

  show_current_player();

  if (isOnlineMode() && onlineSession.host) {
    onlineSession.started = true;
    maybeBroadcastOnlineState("host-init");
  }

  //*DEBUG
  helper_show_cards(player1);
  helper_show_cards(player2);
  count_points_debug();
}

//*==== Setup: Kartenstapel erzeugen & austeilen ====

function create_cards() {
  cardStack.length = 0;
  for (let key in all_cards) {
    const amount = all_cards[key];
    for (let i = 0; i < amount; i++) {
      const card = new Card(parseInt(key, 10), "stack", true);
      cardStack.push(card);
    }
  }
  shuffleArray(cardStack);
}

function give_player_cards(_player) {
  for (let i = 0; i < 12; i++) {
    const card = cardStack.splice(0, 1)[0]; //*oberste Karte
    card.place = "board";
    card.covered = true;
    _player.cards.push(card);
  }
}

//*==== Anzeige / Rendering einer Karte im Slot ====

function discover_card(cardObj, slotId, ignoreStatus = false) {
  if (!cardObj) return;

  //*⛔️ nie auf entfernten Slots rendern
  if (isSlotRemoved(slotId)) return;

  if (!cardObj.covered && !ignoreStatus) {
    return;
  }
  //* Show card turn around effect
  const el = document.getElementById(slotId);
  if (el) el.classList.add("discover-effect");

  setSlotDiscovered(slotId);
  cardObj.covered = false;
  set_attributes_to_Card(slotId, cardObj.value);

  //*👉 Nach jedem Aufdecken: Triple-Check für den betroffenen Spieler (nicht für Ablage)
  const m =
    /^player([12])_card_(\d+)$/.exec(slotId) ||
    /^p([12])_card_(\d+)$/.exec(slotId);
  if (m) {
    const pnum = parseInt(m[1], 10);
    const player = pnum === 1 ? player1 : player2;
    check_and_remove_vertical_triples(player);
  }

  refresh_point_label();
}

function set_attributes_to_Card(card_id, card_value) {
  const host = document.getElementById(card_id);
  if (!host) return;

  host.innerHTML = "";

  const vallabel = document.createElement("p");
  const before_label = document.createElement("p");
  const after_label = document.createElement("p");

  before_label.textContent = card_value;
  after_label.textContent = card_value;
  vallabel.textContent = card_value;

  before_label.classList.add("before-label");
  after_label.classList.add("after-label");
  vallabel.classList.add("val-label");

  if (card_value === 6 || card_value === 9) {
    vallabel.classList.add("underlined");
    before_label.classList.add("underlined");
    after_label.classList.add("underlined");
  }

  host.appendChild(vallabel);
  host.appendChild(before_label);
  host.appendChild(after_label);
  host.classList.add("card");

  //*Farben aktualisieren
  host.classList.remove("green", "red", "yellow", "lightblue", "blue");

  if (card_value > 0 && card_value < 5) {
    host.classList.add("green");
  } else if (card_value >= 5 && card_value < 9) {
    host.classList.add("yellow");
  } else if (card_value >= 9 && card_value <= 12) {
    host.classList.add("red");
  } else if (card_value === 0) {
    host.classList.add("lightblue");
  } else if (card_value < 0) {
    host.classList.add("blue");
  }
}

//*==== Punkte (Debug) ====

function count_points_debug() {
  const sum = (pl) =>
    pl.cards.reduce((acc, c) => acc + (c ? parseInt(c.value, 10) : 0), 0);
  const p1 = sum(player1);
  const p2 = sum(player2);
  console.log(`P1: ${p1} Punkte || P2: ${p2} Punkte`);
}

//*==== Spieler anlegen ====

function create_player() {
  for (let i = 1; i <= 2; i++) {
    const playerKey = i === 1 ? "player1" : "player2";
    const playername = getPlayerDisplayName(playerKey);
    if (i === 1) {
      player1 = new Player(playername, i);
    } else {
      player2 = new Player(playername, i);
    }
  }
}

//*==== Info-Modal ====

function show_info_modal(player, headline, text, countdown, options = {}) {
  const { forceModal = false, compact = false } = options;

  if (noGuidanceMode && !forceModal) {
    setHandHint(text || headline || "");
    scheduleIdleHint();
    return;
  }

  const modal_info_headline = document.getElementById("modal_info_headline");
  const modal_info_text = document.getElementById("modal_info_text");
  if (!info_modal || !modal_info_headline || !modal_info_text) return;

  if (infoModalTimeoutId) {
    clearTimeout(infoModalTimeoutId);
    infoModalTimeoutId = null;
  }

  info_modal.classList.toggle("force-visible", forceModal);
  info_modal.classList.toggle("compact", compact);
  info_modal.classList.add("active");
  setModalPlayerContext(player);

  modal_info_headline.textContent = headline;
  modal_info_text.textContent = text;

  infoModalTimeoutId = setTimeout(() => {
    info_modal.classList.remove("active", "force-visible", "compact");
    infoModalTimeoutId = null;
  }, countdown);
}

//*==== Rundensteuerung ====

function prepareHumanTurn(playerKey) {
  const activePlayer = getPlayerByKey(playerKey);
  const activeBoard = playerKey === "player1" ? player1Board : player2Board;
  const otherBoard = playerKey === "player1" ? player2Board : player1Board;

  setModalPlayerContext(playerKey);
  otherBoard?.classList.remove("active");
  otherBoard?.classList.add("deactivated");
  activeBoard?.classList.remove("deactivated");
  activeBoard?.classList.add("active");

  do_disable_area();
  if (activePlayer.firstRound) {
    do_enable_area();
    setPlayerTurnPhase(
      PLAYER_PHASES.FIRST_ROUND,
      isMultiplayerMode()
        ? "Decke 2 deiner eigenen Karten auf."
        : "Decke 2 deiner Karten auf.",
    );
    if (!noGuidanceMode) {
      show_info_modal(
        playerKey,
        "2 Karten aufdecken",
        "Decke 2 deiner 12 Karten auf, indem du sie anklickst.",
        4000,
      );
    }
    return;
  }

  current_card = null;
  current_card_source = null;
  is_Swap = false;
  updateHandCardUI();
  setPlayerTurnPhase(
    PLAYER_PHASES.CHOOSE_ACTION,
    lastTurn
      ? "Letzter Zug: Wähle Nachziehstapel oder Ablagestapel für diesen Zug."
      : "Wähle Nachziehstapel oder Ablagestapel für deinen Zug.",
  );
  do_enable_area();
  if (!noGuidanceMode) {
    if (!lastTurn) {
      setTimeout(() => {
        setModalPlayerContext(playerKey);
        action_modal?.classList.add("active");
      }, 1500);
    } else {
      setModalPlayerContext(playerKey);
      action_modal?.classList.add("active");
    }
  }
}

async function show_current_player() {
  if (gameEnded) return;
  closeActionModals();
  clearIdleHintTimer();
  triggerTurnTransition();

  if (isHumanTurn()) {
    prepareHumanTurn(currentPlayer);
    maybeAnnounceOnlineTurn();
    return;
  }

  if (isOnlineMode()) {
    setPlayerTurnPhase(
      PLAYER_PHASES.WAITING,
      getWaitingTurnHint(currentPlayer),
    );
    setModalPlayerContext(currentPlayer);
    if (currentPlayer === "player1") {
      player2Board?.classList.remove("active");
      player2Board?.classList.add("deactivated");
      player1Board?.classList.remove("deactivated");
      player1Board?.classList.add("active");
    } else {
      player1Board?.classList.remove("active");
      player1Board?.classList.add("deactivated");
      player2Board?.classList.remove("deactivated");
      player2Board?.classList.add("active");
    }
    do_disable_area();
    maybeAnnounceOnlineTurn();
    return;
  }

  setPlayerTurnPhase(PLAYER_PHASES.WAITING, getWaitingTurnHint("player2"));
  setModalPlayerContext("player2");
  player1Board?.classList.remove("active");
  player1Board?.classList.add("deactivated");
  player2Board?.classList.remove("deactivated");
  player2Board?.classList.add("active");

  if (player2.firstRound) {
    await wait(KI_DELAY.think);
    await ki_discover_two_first_round();

    await wait(KI_DELAY.step);
    const p1sum = player1.first_two_cards.sum;
    const p2sum = player2.first_two_cards.sum;

    if (p1sum > p2sum) {
      currentPlayer = "player1";
      show_info_modal(
        "player1",
        `${getPlayerDisplayName("player1")} beginnt`,
        `${getPlayerDisplayName("player1")} hatte die höhere Summe.`,
        1800,
      );
      show_current_player();
    } else {
      currentPlayer = "player2";
      show_info_modal(
        "player2",
        `${getPlayerDisplayName("player2")} beginnt`,
        `${getPlayerDisplayName("player2")} hatte die höhere Summe.`,
        1800,
      );
      await wait(KI_DELAY.think);
      await ki_take_turn();
    }
  } else {
    await wait(KI_DELAY.think);
    await ki_take_turn();
  }
}

//*==== Click auf Karten (vom aktiven Menschen) ====

async function onCardClick(cardEl) {
  if (gameEnded) return;

  const meta = getPlayerAndIndexFromSlot(cardEl);
  if (!meta) return;

  if (!isHumanTurn()) return;
  if (meta.player !== currentPlayer) return;

  const activePlayer = getCurrentPlayerObject();
  const { index, id } = meta;
  const pCard = activePlayer.cards[index];

  if (isSlotRemoved(id)) return;
  if (!pCard) return;

  if (activePlayer.firstRound) {
    if (activePlayer.first_two_cards.discovered >= 2) return;
    if (!pCard.covered) return;
    discover_card(pCard, id);
    activePlayer.first_two_cards.discovered++;
    activePlayer.first_two_cards.sum += parseInt(pCard.value, 10);

    if (activePlayer.first_two_cards.discovered === 2) {
      activePlayer.firstRound = false;

      if (currentPlayer === "player1") {
        setPlayerTurnPhase(
          PLAYER_PHASES.WAITING,
          getWaitingTurnHint(getOtherPlayerKey("player1")),
        );
        setTimeout(() => {
          switchToPlayer("player2");
        }, 250);
      } else {
        const p1sum = player1.first_two_cards.sum;
        const p2sum = player2.first_two_cards.sum;

        const nextPlayer = p1sum > p2sum ? "player1" : "player2";

        if (isMultiplayerMode()) {
          setTimeout(() => {
            switchToPlayer(nextPlayer);
          }, 250);
        } else {
          currentPlayer = nextPlayer;
          show_info_modal(
            currentPlayer,
            `${getPlayerDisplayName(currentPlayer)} beginnt`,
            `${getPlayerDisplayName(currentPlayer)} hatte die höhere Summe.`,
            1800,
          );
          setTimeout(() => {
            show_current_player();
          }, 250);
        }
      }
    }
    return;
  }

  if (playerTurnPhase === PLAYER_PHASES.MUST_REVEAL) {
    if (!pCard.covered) {
      if (noGuidanceMode) {
        setHandHint("Du musst eine verdeckte Karte aufdecken.");
        scheduleIdleHint();
      }
      return;
    }

    discover_card(pCard, id);
    setSlotDiscovered(id);
    current_card = null;
    current_card_source = null;
    is_Swap = false;
    lastDrawnCardRect = null;
    setPlayerTurnPhase(
      PLAYER_PHASES.WAITING,
      getWaitingTurnHint(getOtherPlayerKey(currentPlayer)),
    );
    setTimeout(() => {
      action_modal?.classList.remove("active");
      end_of_turn(currentPlayer);
    }, 250);
    return;
  }

  const canSwapHeldCard =
    !!current_card &&
    (playerTurnPhase === PLAYER_PHASES.MUST_SWAP ||
      (noGuidanceMode &&
        playerTurnPhase === PLAYER_PHASES.DRAWN_DECISION &&
        current_card_source === "stack"));

  if (!canSwapHeldCard) {
    if (noGuidanceMode) {
      scheduleIdleHint();
    }
    return;
  }

  if (
    noGuidanceMode &&
    playerTurnPhase === PLAYER_PHASES.DRAWN_DECISION &&
    current_card_source === "stack"
  ) {
    is_Swap = true;
    setPlayerTurnPhase(
      PLAYER_PHASES.MUST_SWAP,
      "Wähle eine deiner offenen oder verdeckten Karten für den Tausch.",
    );
  }

  if (is_Swap && current_card) {
    if (isSlotRemoved(id)) return;

    const old = activePlayer.cards[index];
    const boardSlotEl = document.getElementById(id);
    const ablageEl = document.getElementById("player_card_ablage");

    let fromRef = null;
    if (current_card_source === "ablage") {
      fromRef = ablageEl || "player_card_ablage";
    } else if (current_card_source === "stack") {
      fromRef =
        lastDrawnCardRect || getVisibleActionCardRect() || viewportCenterRect();
    } else {
      fromRef = viewportCenterRect();
    }

    await withUIBlocked(
      flySwap({
        newValue: current_card.value,
        fromEl: fromRef,
        toEl: boardSlotEl,
        oldValue: old ? old.value : null,
        ablageEl: ablageEl,
      }),
    );

    if (current_card_source === "ablage") {
      takeFromAblage();
    }

    if (old) putOnAblage(old);

    activePlayer.cards[index] = current_card;
    activePlayer.cards[index].place = "board";
    activePlayer.cards[index].covered = false;

    discover_card(activePlayer.cards[index], id, true);
    setSlotDiscovered(id);

    current_card = null;
    current_card_source = null;
    is_Swap = false;
    lastDrawnCardRect = null;
    setPlayerTurnPhase(
      PLAYER_PHASES.WAITING,
      getWaitingTurnHint(getOtherPlayerKey(currentPlayer)),
    );

    setTimeout(() => {
      action_modal?.classList.remove("active");
      action_modal_card_from_stack?.classList.remove("active");
      do_enable_area();
      end_of_turn(currentPlayer);
    }, 200);
  }
}

//*==== Buttons – Spieleraktionen ====

function onTakeFromStack() {
  const activePlayer = getCurrentPlayerObject();

  if (gameEnded) return;
  if (!isHumanTurn()) return;
  if (activePlayer?.firstRound) return;
  if (playerTurnPhase !== PLAYER_PHASES.CHOOSE_ACTION) return;
  if (cardStack.length === 0 && !recycleDiscardIntoDrawPile()) {
    show_info_modal(
      currentPlayer,
      "Nachziehstapel leer",
      "Es kann keine neue Karte gezogen werden.",
      2000,
    );
    return;
  }

  current_card = cardStack.splice(0, 1)[0];
  current_card.place = "hand";
  current_card.covered = false;
  current_card_source = "stack";
  refreshDrawPileUI();
  is_Swap = false;

  if (!noGuidanceMode) {
    action_modal?.classList.remove("active");
    setModalPlayerContext(currentPlayer);
    action_modal_card_from_stack?.classList.add("active");
  }

  setPlayerTurnPhase(
    PLAYER_PHASES.DRAWN_DECISION,
    noGuidanceMode
      ? "Lege die gezogene Karte ab oder tausche sie mit einer deiner Karten."
      : "Entscheide, ob du die gezogene Karte behältst oder ablegst.",
  );

  const actionCardRect = getVisibleActionCardRect();
  if (actionCardRect) {
    lastDrawnCardRect = {
      left: actionCardRect.left,
      top: actionCardRect.top,
      width: actionCardRect.width,
      height: actionCardRect.height,
    };
  } else {
    lastDrawnCardRect = viewportCenterRect();
  }
}

function onTakeFromAblage() {
  const activePlayer = getCurrentPlayerObject();

  if (gameEnded) return;
  if (!isHumanTurn()) return;
  if (activePlayer?.firstRound) return;
  if (playerTurnPhase !== PLAYER_PHASES.CHOOSE_ACTION) return;
  do_enable_area();

  const top = topAblage();
  if (!top) {
    show_info_modal(
      currentPlayer,
      "Ablagestapel leer",
      "Es liegt noch keine Karte auf dem Ablagestapel.",
      2000,
    );
    return;
  }

  current_card = top;
  current_card.place = "hand";
  current_card.covered = false;
  current_card_source = "ablage";

  is_Swap = true;
  action_modal?.classList.remove("active");
  setPlayerTurnPhase(
    PLAYER_PHASES.MUST_SWAP,
    "Wähle eine deiner Karten, um mit der Ablagekarte zu tauschen.",
  );
  if (!noGuidanceMode) {
    show_info_modal(
      currentPlayer,
      "Karte wählen",
      "Klicke die Karte an, mit der getauscht werden soll.",
      3000,
    );
  }
}

async function onDiscardDrawnAndRevealOne() {
  if (gameEnded) return;
  if (!isHumanTurn()) return;
  if (!current_card) return;
  if (current_card_source !== "stack") return;

  const startRect =
    lastDrawnCardRect || getVisibleActionCardRect() || viewportCenterRect();
  closeActionModals();
  setPlayerTurnPhase(PLAYER_PHASES.WAITING, "Lege Karte auf Ablage.");

  await withUIBlocked(
    flyCardBetween({
      value: current_card.value,
      from: startRect,
      to: "player_card_ablage",
      duration: ANIM.fly,
    }),
  );

  putOnAblage(current_card);

  current_card = null;
  current_card_source = null;
  is_Swap = false;
  lastDrawnCardRect = null;

  action_modal_card_from_stack?.classList.remove("active");
  do_enable_area();
  setPlayerTurnPhase(
    PLAYER_PHASES.MUST_REVEAL,
    "Decke jetzt genau eine verdeckte Karte auf, um den Zug zu beenden.",
  );
}

function onKeepDrawnAndSwap() {
  if (gameEnded) return;
  if (!isHumanTurn()) return;
  if (!current_card) return;

  const actionCardRect = getVisibleActionCardRect();
  if (actionCardRect) {
    lastDrawnCardRect = {
      left: actionCardRect.left,
      top: actionCardRect.top,
      width: actionCardRect.width,
      height: actionCardRect.height,
    };
  }

  is_Swap = true;
  action_modal_card_from_stack?.classList.remove("active");
  do_enable_area();
  setPlayerTurnPhase(
    PLAYER_PHASES.MUST_SWAP,
    "Wähle eine deiner Karten, um mit der gezogenen Karte zu tauschen.",
  );
  if (!noGuidanceMode) {
    show_info_modal(
      currentPlayer,
      "Karte wählen",
      "Klicke auf die Karte, mit der getauscht werden soll.",
      4000,
    );
  }
}

//*==== KI ====

async function ki_discover_two_first_round() {
  const revealIndices = getKiFirstRoundRevealIndices();

  for (const index of revealIndices) {
    const slotId = getBoardSlotId(2, index);
    if (!slotId) continue;
    const card = player2.cards[index];
    if (!card) continue;

    await wait(KI_DELAY.reveal);
    highlightSlot(slotId, true);
    await wait(KI_DELAY.step);
    discover_card(card, slotId, true);
    setSlotDiscovered(slotId);
    highlightSlot(slotId, false);

    player2.first_two_cards.discovered++;
    player2.first_two_cards.sum += parseInt(card.value, 10);
  }

  if (player2.first_two_cards.discovered >= 2) {
    player2.firstRound = false;
  }
}

async function ki_take_turn() {
  if (gameEnded) return;

  if (cardStack.length === 0) {
    recycleDiscardIntoDrawPile();
  }

  current_card = null;
  current_card_source = null;
  is_Swap = false;
  const context = getKiStrategicContext();

  //*1) Ablage nutzen?
  const ablage = topAblage();
  if (ablage) {
    const discardOption = getBestKiSwapOption(ablage.value, "ablage", context);

    // Eine offene 0 ist in Skyjo fast immer wertvoll: direkt nehmen.
    if (ablage.value === 0 && discardOption) {
      await wait(KI_DELAY.think);
      const swapped = await ki_execute_swap(discardOption, ablage);
      if (swapped) {
        return end_of_turn("player2");
      }
    }

    if (
      discardOption &&
      discardOption.score >= KI_WEIGHTS.takeDiscardThreshold
    ) {
      await wait(KI_DELAY.think);
      const swapped = await ki_execute_swap(discardOption, ablage);
      if (swapped) {
        return end_of_turn("player2");
      }
    }
  }

  //*2) Ziehen
  if (cardStack.length > 0 || recycleDiscardIntoDrawPile()) {
    await wait(KI_DELAY.draw);
    const drawn = cardStack.splice(0, 1)[0];
    refreshDrawPileUI();
    drawn.place = "hand";
    drawn.covered = false;

    await wait(KI_DELAY.step);

    const drawSwapOption = getBestKiSwapOption(drawn.value, "stack", context);
    const revealChoice = getSmartRevealChoice(player2, context);
    const discardScore = evaluateKiDiscardAndReveal(
      drawn.value,
      revealChoice,
      context,
    );

    if (
      drawSwapOption &&
      drawSwapOption.score >= KI_WEIGHTS.drawSwapThreshold &&
      drawSwapOption.score >= discardScore
    ) {
      const swapped = await ki_execute_swap(drawSwapOption, drawn);
      if (swapped) {
        return end_of_turn("player2");
      }
    }

    await ki_discard_drawn_and_reveal(drawn, revealChoice);
    return end_of_turn("player2");
  }

  //*Falls Stapel leer war (sehr selten) → trotzdem Zug beenden
  return end_of_turn("player2");
}

async function ki_reveal_random_covered_one() {
  const revealChoice = getSmartRevealChoice(player2, getKiStrategicContext());
  if (!revealChoice) return;
  await ki_reveal_index(revealChoice.index);
}

//*==== Vertikal-Triple-Check & Entfernen ====

function check_and_remove_vertical_triples(player) {
  for (const col of COLUMN_GROUPS) {
    const c0 = player.cards[col[0]];
    const c1 = player.cards[col[1]];
    const c2 = player.cards[col[2]];

    if (
      c0 &&
      c1 &&
      c2 &&
      !c0.covered &&
      !c1.covered &&
      !c2.covered &&
      c0.value === c1.value &&
      c1.value === c2.value
    ) {
      console.log(
        `🔥 Triple gefunden bei Spieler ${player.name}: Wert ${c0.value}`,
      );

      //*Karten entfernen und UI leeren
      for (const idx of col) {
        player.cards[idx] = null;

        const slotId = getBoardSlotId(player.playerNumber, idx);
        if (!slotId) continue;
        const el = document.getElementById(slotId);
        if (!el) continue;

        el.innerHTML = "";
        setSlotRemoved(slotId); //*blockiert den Slot zuverlässig
      }

      //*Optional: Punkteanzeige aktualisieren
      count_points_debug();
    }
  }
}

//*==== Hilfsanzeige in Konsole ====

function helper_show_cards(player) {
  let output = "";
  for (let i = 0; i < player.cards.length; i++) {
    if (i > 0 && i % 4 === 0) output += "\n";
    output += " | " + (player.cards[i] ? player.cards[i].value : "∅");
  }
  console.log(`${player.name} (${player.playerNumber})\n${output}`);
}

//*==== Kompatibilitätsfunktion swap_card – falls extern genutzt ====

function swap_card(a, b, c) {
  //*Erwartet: swap_card(playerObj, boardIndex, newCard)
  if (arguments.length === 3) {
    const player = a,
      boardIndex = b,
      newCard = c;

    const slotId = getBoardSlotId(player.playerNumber, boardIndex);
    if (!slotId || isSlotRemoved(slotId)) {
      console.warn(
        "swap_card: Zielslot ist entfernt/blockiert – Operation verworfen.",
      );
      return;
    }

    const old = player.cards[boardIndex];
    if (old) putOnAblage(old);

    player.cards[boardIndex] = newCard;
    player.cards[boardIndex].place = "board";
    player.cards[boardIndex].covered = false;

    if (slotId) {
      discover_card(player.cards[boardIndex], slotId, true);
      setSlotDiscovered(slotId);
    }
    return;
  }
  console.warn(
    "swap_card(a,b) aufgerufen – erwartetes Muster ist swap_card(player, index, newCard). Aufruf ignoriert.",
  );
}

//*ANCHOR - Discover all cards
function reveal_all_cards() {
  [player1, player2].forEach((player) => {
    for (let i = 0; i < player.cards.length; i++) {
      const card = player.cards[i];
      if (card && card.covered) {
        const slotId = getBoardSlotId(player.playerNumber, i);
        if (slotId && !isSlotRemoved(slotId)) {
          discover_card(card, slotId, true);
          setSlotDiscovered(slotId);
        }
      }
    }
  });
}
//*ANCHOR - Show current points from discovered cards
function refresh_point_label() {
  const { playerRoundSum, opponentRoundSum } = getPerspectiveRoundValues();
  const { playerGameSum, opponentGameSum } = getPerspectiveGameValues();

  point_label.innerHTML = showRoundPointsInLabels
    ? `Runde ${playerRoundSum} | Spiel ${playerGameSum}`
    : `Spiel ${playerGameSum}`;
  point_label_ki.innerHTML = showRoundPointsInLabels
    ? `Runde ${opponentRoundSum} | Spiel ${opponentGameSum}`
    : `Spiel ${opponentGameSum}`;
}

//*ANCHOR - Load Game from Local Storage
function loadGameFromLocalStorage() {
  if (isOnlineMode()) {
    save_object.points_ki = 0;
    save_object.points_player = 0;
    save_object.player2_mode = PLAYER2_MODES.HUMAN;
    save_object.no_guidance_mode = true;
    return;
  }

  const savedGame = localStorage.getItem(SAVEGAME_STORAGE_KEY);
  if (savedGame) {
    save_object = JSON.parse(savedGame);
    save_object.points_ki = save_object.points_ki ?? 0;
    save_object.points_player = save_object.points_player ?? 0;
    save_object.player2_mode = save_object.player2_mode ?? PLAYER2_MODES.KI;
    save_object.no_guidance_mode =
      save_object.no_guidance_mode ?? loadStoredGuidanceMode();
    refreshGameScoreLayers();
    setPlayer2Mode(loadStoredPlayer2Mode(), { persist: false });
    refresh_point_label();
  } else {
    save_object.player2_mode = PLAYER2_MODES.KI;
    save_object.no_guidance_mode = loadStoredGuidanceMode();
    save_Game_into_Storage();
  }
}

//*ANCHOR - Save Game into Local Storage
function save_Game_into_Storage() {
  if (isOnlineMode()) return;

  save_object.player2_mode = ki_player ? PLAYER2_MODES.KI : PLAYER2_MODES.HUMAN;
  save_object.no_guidance_mode = noGuidanceMode;
  localStorage.setItem(
    GUIDANCE_MODE_STORAGE_KEY,
    String(save_object.no_guidance_mode),
  );
  localStorage.setItem(SAVEGAME_STORAGE_KEY, JSON.stringify(save_object));
}
