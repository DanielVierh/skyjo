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
const lbl_game_points_ki = document.getElementById("lbl_game_points_ki");
const lbl_game_points_player = document.getElementById(
  "lbl_game_points_player",
);
const btn_next_game = document.getElementById("btn_next_game");
const mdl_endgame = document.getElementById("mdl_endgame");
const lbl_finishText = document.getElementById("lbl_finishText");
const point_label_ki = document.getElementById("point_label_ki");
const start_modal = document.getElementById("start_modal");
const btn_new_game = document.getElementById("btn_new_game");
const btn_new_game_no_help = document.getElementById("btn_new_game_no_help");
const btn_continue_game = document.getElementById("btn_continue_game");
const btn_multiplayer = document.getElementById("btn_multiplayer");
const player_card_stack = document.getElementById("player_card_stack");
const draw_pile_zone = document.getElementById("draw_pile_zone");
const discard_pile_zone = document.getElementById("discard_pile_zone");
const player_hand_panel = document.getElementById("player_hand_panel");
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

const PLAYER_PHASES = {
  WAITING: "waiting",
  FIRST_ROUND: "first-round",
  CHOOSE_ACTION: "choose-action",
  DRAWN_DECISION: "drawn-decision",
  MUST_SWAP: "must-swap",
  MUST_REVEAL: "must-reveal",
};

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

let save_object = {
  points_ki: 0,
  points_player: 0,
};

// Letzte Position der Spieler-Vorschaukarte aus dem Stack (für Start der Flugbahn)
let lastDrawnCardRect = null;

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
  lowCardBonus: 10,
  highCardPenalty: 8,
  discardHighValueBonus: 6,
  discardLowValuePenalty: 18,
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
  handHintText = text || "";
  if (player_hand_text) {
    player_hand_text.textContent = handHintText;
  }
}

function refreshPileInteractivity() {
  const canChooseAction =
    currentPlayer === "player1" &&
    !gameEnded &&
    !player1?.firstRound &&
    playerTurnPhase === PLAYER_PHASES.CHOOSE_ACTION;

  draw_pile_zone?.classList.toggle("is-interactive", canChooseAction);
  player_card_stack?.classList.toggle("is-interactive", canChooseAction);

  const canDiscardDrawn =
    currentPlayer === "player1" &&
    !gameEnded &&
    playerTurnPhase === PLAYER_PHASES.DRAWN_DECISION &&
    current_card_source === "stack" &&
    !!current_card;

  const canTakeDiscard =
    currentPlayer === "player1" &&
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

  if (currentPlayer !== "player1" || gameEnded) {
    refreshPileInteractivity();
    return;
  }

  if (player1?.firstRound || playerTurnPhase === PLAYER_PHASES.FIRST_ROUND) {
    player1.cards.forEach((card, index) => {
      if (card?.covered) {
        const slotId = getBoardSlotId(1, index);
        if (slotId) highlightSlot(slotId, true);
      }
    });
  } else if (
    playerTurnPhase === PLAYER_PHASES.MUST_SWAP ||
    (playerTurnPhase === PLAYER_PHASES.DRAWN_DECISION &&
      current_card_source === "stack" &&
      !!current_card)
  ) {
    player1.cards.forEach((card, index) => {
      if (card) {
        const slotId = getBoardSlotId(1, index);
        if (slotId) highlightSlot(slotId, true);
      }
    });
  } else if (playerTurnPhase === PLAYER_PHASES.MUST_REVEAL) {
    player1.cards.forEach((card, index) => {
      if (card?.covered) {
        const slotId = getBoardSlotId(1, index);
        if (slotId) highlightSlot(slotId, true);
      }
    });
  }

  refreshPileInteractivity();
}

function updateHandCardUI() {
  if (player_hand_panel) {
    player_hand_panel.classList.toggle("is-active", !!current_card);
    player_hand_panel.classList.toggle("is-no-guidance", noGuidanceMode);
  }
  if (player_hand_slot) {
    player_hand_slot.classList.toggle("has-card", !!current_card);
  }

  if (!current_card) {
    clearCardUI("card_action");
    const cardAction = document.getElementById("card_action");
    if (cardAction) {
      cardAction.classList.add("covered", "is-empty");
    }
    if (noGuidanceMode && currentPlayer === "player1" && !gameEnded) {
      if (player1?.firstRound) {
        setHandHint("Decke 2 deiner Karten auf.");
      } else if (playerTurnPhase === PLAYER_PHASES.MUST_REVEAL) {
        setHandHint("Decke jetzt genau eine verdeckte Karte auf.");
      } else if (playerTurnPhase === PLAYER_PHASES.CHOOSE_ACTION) {
        setHandHint("Wähle Nachziehstapel oder Ablagestapel.");
      }
    }
    return;
  }

  const cardAction = document.getElementById("card_action");
  if (cardAction) {
    cardAction.classList.remove("covered", "is-empty");
  }
  set_attributes_to_Card("card_action", current_card.value);

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
  if (!noGuidanceMode || currentPlayer !== "player1" || gameEnded) return;

  idleHintTimer = setTimeout(() => {
    if (currentPlayer !== "player1" || gameEnded) return;

    if (player1?.firstRound || playerTurnPhase === PLAYER_PHASES.FIRST_ROUND) {
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

function setGuidanceMode(enabled) {
  noGuidanceMode = enabled;
  document.body.classList.toggle("no-guidance-mode", enabled);
  closeActionModals();
  updateHandCardUI();
  updateBoardGuidance();
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
  // Statt die Seite neu zu laden, starte eine neue Runde ohne das Start-Modal wieder anzuzeigen
  if (mdl_endgame) mdl_endgame.classList.remove("active");
  startRoundWithoutModal(false);
});

// Starte eine neue Runde ohne Page-Reload. Wenn resetScores=true, werden
// die kumulierten Punktestände zurückgesetzt.
function startRoundWithoutModal(resetScores = false) {
  if (resetScores) {
    save_object.points_ki = 0;
    save_object.points_player = 0;
    save_Game_into_Storage();
  }

  // Reset globale Spielzustandsvariablen
  gameEnded = false;
  lastTurn = false;
  closingPlayer = null;
  current_card = null;
  current_card_source = null;
  is_Swap = false;
  clearIdleHintTimer();
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
  lbl_game_points_ki.innerHTML = save_object.points_ki;
  lbl_game_points_player.innerHTML = save_object.points_player;

  // Set current player and continue
  currentPlayer = "player1";
  show_current_player();

  // Debug helpers
  helper_show_cards(player1);
  helper_show_cards(player2);
  count_points_debug();
}

function endGame() {
  if (gameEnded) return;
  gameEnded = true;

  let points1 = countPoints(player1);
  let points2 = countPoints(player2);
  let origin_points = points1;
  //!Todo - show original points before double

  //*Sonderregel: Wenn der Schließende NICHT die wenigsten Punkte hat → verdoppeln
  if (closingPlayer) {
    if (closingPlayer === player1 && points1 > points2) {
      points1 *= 2;
    } else if (closingPlayer === player2 && points2 > points1) {
      points2 *= 2;
    }
  }

  const additionalText = `Du hattest ${origin_points} Punkte und hast das Spiel beendet. Da du mehr Punkte als die KI hattest, werden deine Punkte verdoppelt.`;

  let winner = "Unentschieden";
  if (points1 < points2) winner = "Du";
  else if (points2 < points1) winner = "Computer";
  reveal_all_cards();
  mdl_endgame.classList.add("active");
  lbl_finishText.innerHTML = `🎉 Spiel beendet!<br> <br> Deine Punkte: ${
    points1 > origin_points ? additionalText : ""
  } ${points1} Punkte <br> Computer: ${points2} Punkte<br> <br>➡️ Gewinner: ${winner}`;

  //* add points to sum and save
  save_object.points_ki += points2;
  save_object.points_player += points1;
  lbl_game_points_ki.innerHTML = save_object.points_ki;
  lbl_game_points_player.innerHTML = save_object.points_player;

  if (save_object.points_ki >= 100) {
    show_winner();
  } else if (save_object.points_player >= 100) {
    show_winner();
  } else {
    save_Game_into_Storage();
  }

  //*Optional: UI sperren
  do_disable_area();
}

//*ANCHOR - Show Winner of the game and reset local storage for new game
function show_winner() {
  if (save_object.points_ki > save_object.points_player) {
    mdl_endgame.classList.add("active");
    lbl_finishText.innerHTML = `Gewonnen 🏅 <br> Du hast das Spiel gewonnen`;
  } else {
    mdl_endgame.classList.add("active");
    lbl_finishText.innerHTML = `Game Over 🥵 <br> Der Computer hat das Spiel gewonnen`;
  }
  save_object.points_ki = 0;
  save_object.points_player = 0;
  save_Game_into_Storage();
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
      currentPlayer = otherKey;
      show_info_modal(
        otherKey,
        "Letzter Zug",
        `${otherPlayer.name} hat jetzt einen letzten Zug.`,
        2500,
      );
      show_current_player();
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
  currentPlayer = otherKey;
  show_current_player();
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
  const aiOpenCards = player2.cards.filter((card) => card && !card.covered).length;
  const opponentOpenCards = player1.cards.filter(
    (card) => card && !card.covered,
  ).length;

  return {
    opponentLikelyClosing:
      (lastTurn && closingPlayer === player1) || opponentOpenCards >= 10,
    aiLikelyClosing: (lastTurn && closingPlayer === player2) || aiOpenCards >= 10,
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

  if (sameOpenCount >= 2) {
    positiveScore += KI_WEIGHTS.tripleFinish;
  } else if (sameOpenCount === 1) {
    positiveScore += KI_WEIGHTS.tripleBuild;
    if (targetCard.covered) {
      positiveScore += KI_WEIGHTS.pairSupport;
    }
  }

  if (incomingValue <= 0) {
    positiveScore += KI_WEIGHTS.lowCardBonus;
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
  } else if (drawnValue <= 0) {
    score -=
      Math.abs(drawnValue - 1) * KI_WEIGHTS.discardLowValuePenalty;
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
  const fromEl = option.source === "ablage" ? "player_card_ablage" : getKiStackStartRect();

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
    const choice = column.coveredEntries[Math.floor(Math.random() * column.coveredEntries.length)];
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
  // lade gespeicherte Punkte, damit wir wissen, ob "Weiterspielen" sichtbar sein soll
  loadGameFromLocalStorage();

  if (btn_continue_game) {
    if (
      (!save_object.points_ki || save_object.points_ki === 0) &&
      (!save_object.points_player || save_object.points_player === 0)
    ) {
      btn_continue_game.style.display = "none";
    } else {
      btn_continue_game.style.display = "block";
    }
  }

  if (start_modal) start_modal.classList.add("active");

  btn_new_game?.addEventListener("click", () => {
    // Reset Scores und starte neues Spiel gegen KI
    save_object.points_ki = 0;
    save_object.points_player = 0;
    save_Game_into_Storage();
    if (start_modal) start_modal.classList.remove("active");
    ki_player = true;
    setGuidanceMode(false);
    init();
  });

  btn_new_game_no_help?.addEventListener("click", () => {
    save_object.points_ki = 0;
    save_object.points_player = 0;
    save_Game_into_Storage();
    if (start_modal) start_modal.classList.remove("active");
    ki_player = true;
    setGuidanceMode(true);
    init();
  });

  btn_continue_game?.addEventListener("click", () => {
    // Weiterspielen gegen KI mit bestehenden Punkten
    if (start_modal) start_modal.classList.remove("active");
    ki_player = true;
    setGuidanceMode(false);
    init();
  });

  btn_multiplayer?.addEventListener("click", () => {
    // Multiplayer starten
    if (start_modal) start_modal.classList.remove("active");
    ki_player = false;
    init();
  });
}

function init() {
  loadGameFromLocalStorage();
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
    const playername = "Player";
    if (i === 1) {
      player1 = new Player(playername, i);
    } else {
      player2 = new Player(playername, i);
    }
  }
}

//*==== Info-Modal ====

function show_info_modal(player, headline, text, countdown) {
  if (noGuidanceMode) {
    setHandHint(text || headline || "");
    scheduleIdleHint();
    return;
  }

  const modal_info_headline = document.getElementById("modal_info_headline");
  const modal_info_text = document.getElementById("modal_info_text");
  if (!info_modal || !modal_info_headline || !modal_info_text) return;

  info_modal.classList.add("active");

  if (player === "player1") {
    if (!info_modal.classList.contains("p1")) {
      info_modal.classList.add("p1");
    }
  } else {
    info_modal.classList.remove("p1");
  }

  modal_info_headline.textContent = headline;
  modal_info_text.textContent = text;

  setTimeout(() => info_modal.classList.remove("active"), countdown);
}

//*==== Rundensteuerung ====

async function show_current_player() {
  if (gameEnded) return;
  closeActionModals();
  clearIdleHintTimer();

  if (currentPlayer === "player1") {
    player2Board?.classList.remove("active");
    player2Board?.classList.add("deactivated");
    player1Board?.classList.remove("deactivated");
    player1Board?.classList.add("active");
    do_disable_area();
    if (player1.firstRound) {
      do_enable_area();
      setPlayerTurnPhase(
        PLAYER_PHASES.FIRST_ROUND,
        "Decke 2 deiner Karten auf.",
      );
      if (!noGuidanceMode) {
        show_info_modal(
          "player1",
          "2 Karten aufdecken",
          "Decke 2 deiner 12 Karten auf, indem du sie anklickst.",
          4000,
        );
      }
    } else {
      current_card = null;
      current_card_source = null;
      is_Swap = false;
      updateHandCardUI();
      setPlayerTurnPhase(
        PLAYER_PHASES.CHOOSE_ACTION,
        lastTurn
          ? "Letzter Zug: Wähle Nachziehstapel oder Ablagestapel."
          : "Wähle Nachziehstapel oder Ablagestapel.",
      );
      do_enable_area();
      if (!noGuidanceMode) {
        if (!lastTurn) {
          setTimeout(() => {
            action_modal?.classList.add("active");
          }, 1500);
        } else {
          action_modal?.classList.add("active");
        }
      }
    }
  } else {
    setPlayerTurnPhase(PLAYER_PHASES.WAITING, "Computer ist am Zug.");
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
          "Du beginnst",
          "Du hattest die höhere Summe.",
          1800,
        );
        show_current_player();
      } else {
        currentPlayer = "player2";
        show_info_modal(
          "player2",
          "Computer beginnt",
          "Er hatte die höhere Summe.",
          1800,
        );
        await wait(KI_DELAY.think);
        await ki_take_turn(); //*ruft am Ende end_of_turn('player2')
      }
    } else {
      await wait(KI_DELAY.think);
      await ki_take_turn(); //*ruft am Ende end_of_turn('player2')
    }
  }
}

//*==== Click auf Karten (vom Spieler 1) ====

async function onCardClick(cardEl) {
  if (gameEnded) return;

  const meta = getPlayerAndIndexFromSlot(cardEl);
  if (!meta) return;

  //*Nur wenn Spieler 1 dran ist
  if (meta.player === "player1" && currentPlayer !== "player1") return;
  if (meta.player === "player2") return;

  const { index, id } = meta;
  const pCard = player1.cards[index];

  //*⛔️ Slot entfernt? nix anklicken, nix belegen.
  if (isSlotRemoved(id)) return;

  //*⛔️ Slot leer (nur durch Entfernung möglich) ⇒ niemals belegbar – auch nicht im Swap
  if (!pCard) return;

  if (player1.firstRound) {
    if (player1.first_two_cards.discovered >= 2) return;
    discover_card(pCard, id);
    player1.first_two_cards.discovered++;
    player1.first_two_cards.sum += parseInt(pCard.value, 10);

    if (player1.first_two_cards.discovered === 2) {
      player1.firstRound = false;
      setPlayerTurnPhase(PLAYER_PHASES.WAITING, "Computer ist am Zug.");
      setTimeout(() => {
        currentPlayer = "player2";
        show_current_player();
      }, 250);
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
    setPlayerTurnPhase(PLAYER_PHASES.WAITING, "Computer ist am Zug.");
    setTimeout(() => {
      action_modal?.classList.remove("active");
      end_of_turn("player1");
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
      "Wähle eine deiner Karten, um mit der gezogenen Karte zu tauschen.",
    );
  }

  // === Swap mit animiertem Flug ===
  if (is_Swap && current_card) {
    if (isSlotRemoved(id)) return;

    const old = player1.cards[index];
    const boardSlotEl = document.getElementById(id);
    const ablageEl = document.getElementById("player_card_ablage");

    // Startrechteck je nach Quelle
    let fromRef = null;
    if (current_card_source === "ablage") {
      fromRef = ablageEl || "player_card_ablage";
    } else if (current_card_source === "stack") {
      fromRef =
        lastDrawnCardRect || rectOf("card_action") || viewportCenterRect();
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

    // Jetzt Datenmodell/DOM aktualisieren
    if (current_card_source === "ablage") {
      // tatsächlich von Ablage nehmen (entfernt UI-Top und aktualisiert)
      takeFromAblage();
    }

    if (old) putOnAblage(old);

    player1.cards[index] = current_card;
    player1.cards[index].place = "board";
    player1.cards[index].covered = false;

    discover_card(player1.cards[index], id, true);
    setSlotDiscovered(id);

    current_card = null;
    current_card_source = null;
    is_Swap = false;
    lastDrawnCardRect = null;
    setPlayerTurnPhase(PLAYER_PHASES.WAITING, "Computer ist am Zug.");

    setTimeout(() => {
      action_modal?.classList.remove("active");
      action_modal_card_from_stack?.classList.remove("active");
      do_enable_area();
      end_of_turn("player1");
    }, 200);
    return;
  }
}

//*==== Buttons – Spieleraktionen ====

function onTakeFromStack() {
  if (gameEnded) return;
  if (currentPlayer !== "player1") return;
  if (player1?.firstRound) return;
  if (playerTurnPhase !== PLAYER_PHASES.CHOOSE_ACTION) return;
  if (cardStack.length === 0 && !recycleDiscardIntoDrawPile()) {
    show_info_modal(
      "player1",
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
    action_modal_card_from_stack?.classList.add("active");
  }

  setPlayerTurnPhase(
    noGuidanceMode
      ? PLAYER_PHASES.DRAWN_DECISION
      : PLAYER_PHASES.DRAWN_DECISION,
    noGuidanceMode
      ? "Lege die Karte auf die Ablage oder tausche sie mit einer deiner Karten."
      : "Wähle, ob du die Karte behalten oder ablegen möchtest.",
  );

  // Startposition merken, solange sichtbar
  const ca = document.getElementById("card_action");
  if (ca) {
    const r = ca.getBoundingClientRect();
    lastDrawnCardRect = {
      left: r.left,
      top: r.top,
      width: r.width,
      height: r.height,
    };
  } else {
    lastDrawnCardRect = viewportCenterRect();
  }
}

function onTakeFromAblage() {
  if (gameEnded) return;
  if (currentPlayer !== "player1") return;
  if (player1?.firstRound) return;
  if (playerTurnPhase !== PLAYER_PHASES.CHOOSE_ACTION) return;
  do_enable_area();

  const top = topAblage();
  if (!top) {
    show_info_modal(
      "player1",
      "Ablagestapel leer",
      "Es liegt noch keine Karte auf dem Ablagestapel.",
      2000,
    );
    return;
  }

  // ❗️WICHTIG: Noch NICHT aus der Ablage entfernen, erst beim finalen Swap.
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
      "player1",
      "Karte wählen",
      "Klicke die Karte an, mit der getauscht werden soll.",
      3000,
    );
  }
}

async function onDiscardDrawnAndRevealOne() {
  if (gameEnded) return;
  if (currentPlayer !== "player1") return;
  if (!current_card) return;
  if (current_card_source !== "stack") return;

  const startRect =
    lastDrawnCardRect || rectOf("card_action") || viewportCenterRect();
  closeActionModals();
  setPlayerTurnPhase(PLAYER_PHASES.WAITING, "Lege Karte auf Ablage.");

  // animiert: card_action → ablage
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
    "Decke jetzt genau eine verdeckte Karte auf.",
  );
}

function onKeepDrawnAndSwap() {
  if (gameEnded) return;
  if (currentPlayer !== "player1") return;
  if (!current_card) return;

  // Merke letzte sichtbare Position der Vorschaukarte (vor dem Schließen)
  const ca = document.getElementById("card_action");
  if (ca) {
    const r = ca.getBoundingClientRect();
    lastDrawnCardRect = {
      left: r.left,
      top: r.top,
      width: r.width,
      height: r.height,
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
      "player1",
      "Karte wählen",
      "Klicke auf die Karte, mit der getauscht werden soll.",
      4000,
    );
  }
  // current_card_source bleibt 'stack'
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
    if (discardOption && discardOption.score >= KI_WEIGHTS.takeDiscardThreshold) {
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
  const sum = player1.cards.reduce(
    (acc, c) => acc + (c && !c.covered ? parseInt(c.value, 10) : 0),
    0,
  );
  point_label.innerHTML = `Summe ${sum}`;

  const ki_sum = player2.cards.reduce(
    (acc, c) => acc + (c && !c.covered ? parseInt(c.value, 10) : 0),
    0,
  );
  point_label_ki.innerHTML = `Summe ${ki_sum}`;
}

//*ANCHOR - Load Game from Local Storage
function loadGameFromLocalStorage() {
  const savedGame = localStorage.getItem("skyjo_savegame");
  if (savedGame) {
    save_object = JSON.parse(savedGame);
    save_object.points_ki = save_object.points_ki ?? 0;
    save_object.points_player = save_object.points_player ?? 0;
    lbl_game_points_ki.innerHTML = save_object.points_ki;
    lbl_game_points_player.innerHTML = save_object.points_player;
  } else {
    save_Game_into_Storage();
  }
}

//*ANCHOR - Save Game into Local Storage
function save_Game_into_Storage() {
  localStorage.setItem("skyjo_savegame", JSON.stringify(save_object));
}
