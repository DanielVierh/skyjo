import {
  createRound,
  resolveSetupStarBonus,
  resolveStartTie,
  revealSetupCard,
} from "./skyjo-action-rules.js";
import { ACTION_LABELS, getTurnOptions, playTurn } from "./skyjo-action-turn.js";
import { chooseComputerDecision, chooseComputerTurn } from "./skyjo-action-ai.js";

const STORAGE_KEY = "skyjo_action_savegame";
const startButton = document.getElementById("btn_new_action_game");
const continueButton = document.getElementById("btn_continue_action_game");
const startModal = document.getElementById("start_modal");
let state = null;
let scores = [0, 0];
let root = null;
let busy = false;
let counted = false;
let matchFinished = false;
let message = "";
let boardDecision = null;

const ACTION_APPEARANCE = Object.freeze({
  "own-swap": ["↔", "Eigen"],
  "double-turn": ["2×", "Doppel"],
  "draw-three": ["3", "Ziehen"],
  enlightenment: ["◉", "Einblick"],
  reactivation: ["↶", "Zurück"],
  defense: ["◆", "Schutz"],
  "opponent-swap": ["⇄", "Fremd"],
  "action-thief": ["✋", "Dieb"],
  "meteor-shower": ["✦", "Meteor"],
});

function readSave() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const save = JSON.parse(raw);
  if (save.version !== 1 || !Array.isArray(save.scores) || save.scores.length !== 2 ||
      save.scores.some((score) => !Number.isFinite(score)) ||
      ![null, 0, 1].includes(save.previousCloser)) {
    throw new Error("Der Action-Spielstand ist ungültig");
  }
  return save;
}

function updateContinueButton() {
  try {
    continueButton.hidden = !readSave();
  } catch (error) {
    continueButton.hidden = true;
    console.error("Action-Spielstand konnte nicht geladen werden:", error);
  }
}

function saveRound(previousCloser) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, scores, previousCloser }));
  } catch (error) {
    message = `Spielstand konnte nicht gespeichert werden: ${error.message}`;
    console.error("Action-Spielstand konnte nicht gespeichert werden:", error);
  }
}

function button(text, onClick, disabled = false) {
  const element = document.createElement("button");
  element.type = "button";
  element.className = "sa-button";
  element.textContent = text;
  element.disabled = disabled;
  element.addEventListener("click", onClick);
  return element;
}

function makeRoot() {
  root = document.createElement("main");
  root.className = "skyjo-action";
  root.innerHTML = `
    <header class="sa-header">
      <button type="button" class="sa-home sa-button" id="sa-home" aria-label="Zum Hauptmenü" title="Hauptmenü">⌂</button>
      <div><h1>Skyjo Action</h1><p id="sa-status" aria-live="polite"></p><p id="sa-message" class="sa-message" role="status"></p></div>
    </header>
    <section class="sa-player" aria-labelledby="sa-computer-title">
      <div class="sa-player-heading"><h2 id="sa-computer-title">Computer</h2><div class="sa-hand" id="sa-computer-hand"></div></div>
      <div class="sa-board" id="sa-computer-board"></div>
    </section>
    <section class="sa-table" aria-label="Tischmitte">
      <div class="sa-piles" id="sa-piles"></div>
      <div class="sa-offer" id="sa-offer" aria-label="Aktionskarten"></div>
    </section>
    <section class="sa-player" aria-labelledby="sa-human-title">
      <div class="sa-board" id="sa-human-board"></div>
      <div class="sa-player-heading"><h2 id="sa-human-title">Du</h2><div class="sa-hand" id="sa-human-hand"></div></div>
    </section>
    <div id="sa-actions" class="sa-actions" role="status"></div>
    <section class="sa-results" id="sa-results" hidden aria-live="polite"></section>
    <dialog class="sa-dialog" id="sa-dialog" aria-labelledby="sa-dialog-title">
      <h2 id="sa-dialog-title"></h2>
      <div id="sa-dialog-options" class="sa-dialog-options"></div>
    </dialog>`;
  document.body.append(root);
  root.querySelector("#sa-home").addEventListener("click", () => window.location.reload());
}

function textForCard(card) {
  return card.type === "star" ? "★" : String(card.value);
}

function makeGameCard(card, onClick, disabled, label, extraClass = "") {
  const element = button("", onClick, disabled);
  element.className = `card sa-card ${extraClass}`;
  element.setAttribute("aria-label", label);
  element.title = label;
  if (!card) {
    element.classList.add("is-empty");
  } else if (card.covered) {
    element.classList.add("covered");
  } else {
    window.renderCardFace(element, card.type === "star" ? "★" : card.value);
    if (card.type === "star") element.classList.add("sa-card-star");
  }
  return element;
}

function makeActionCard(card, onClick, disabled, label, extraClass = "") {
  const element = button("", onClick, disabled);
  element.className = `card sa-action-card ${extraClass}`;
  element.setAttribute("aria-label", label);
  element.title = label;
  if (!card) {
    element.classList.add("covered", "card-stack");
  } else {
    const [symbol, shortLabel] = ACTION_APPEARANCE[card.type];
    const value = document.createElement("span");
    value.className = "sa-action-symbol";
    value.textContent = symbol;
    const name = document.createElement("span");
    name.className = "sa-action-name";
    name.textContent = shortLabel;
    element.append(value, name);
  }
  return element;
}

function turnAvailable(action) {
  return !busy && getTurnOptions(state, 0).some((option) => option.value === action);
}

function drawBoard(owner) {
  const board = root.querySelector(owner === 0 ? "#sa-human-board" : "#sa-computer-board");
  board.replaceChildren();
  state.players[owner].board.forEach((card, index) => {
    const isChoice = boardDecision?.owner === owner && boardDecision.values.has(String(index));
    const isSetup = !busy && card?.covered && owner === 0 && state.phase === "setup" &&
      state.setupPlayer === 0 && state.pendingStarBonus === null;
    const element = makeGameCard(card, () => {
      if (isChoice) {
        const resolve = boardDecision.resolve;
        boardDecision = null;
        resolve(String(index));
        return;
      }
      try {
        state = revealSetupCard(state, 0, index);
        message = "";
        render();
        void advance();
      } catch (error) {
        showError(error);
      }
    }, !isChoice && !isSetup,
    `Reihe ${Math.floor(index / 4) + 1}, Spalte ${index % 4 + 1}: ${!card ? "entfernt" : card.covered ? "verdeckte Karte" : textForCard(card)}`,
    isChoice || isSetup ? "sa-interactive" : "");
    board.append(element);
  });
}

function drawHand(owner) {
  const hand = root.querySelector(owner === 0 ? "#sa-human-hand" : "#sa-computer-hand");
  hand.replaceChildren();
  const title = document.createElement("strong");
  title.textContent = `Aktionen ${state.players[owner].actions.length}`;
  hand.append(title);
  state.players[owner].actions.forEach((card, index) => {
    const canPlay = owner === 0 && turnAvailable("action-use");
    hand.append(makeActionCard(card, () => void runHumanTurn("action-use", [String(index)]),
      !canPlay, `${owner === 0 ? "Deine Aktionskarte" : "Aktionskarte des Computers"}: ${ACTION_LABELS[card.type]}`,
      canPlay ? "sa-interactive" : ""));
  });
}

function render() {
  if (!root || !state) return;
  const status = root.querySelector("#sa-status");
  const phase = state.phase === "finished" ? "Runde beendet"
    : state.phase === "setup" ? "Start: je zwei Karten aufdecken"
    : state.phase === "start-tie" ? "Startentscheidung bei Gleichstand"
    : state.closingPlayer !== null ? `Letzter Zug – ${state.closingPlayer === 0 ? "du hast" : "der Computer hat"} die Runde beendet`
    : state.activePlayer === 0 ? "Du bist am Zug" : "Computer ist am Zug";
  status.textContent = `${phase} · ${scores[0]} : ${scores[1]}`;
  root.querySelector("#sa-message").textContent = boardDecision?.title || message;
  drawBoard(0);
  drawBoard(1);
  drawHand(0);
  drawHand(1);
  const piles = root.querySelector("#sa-piles");
  piles.replaceChildren();
  const canDraw = turnAvailable("game-deck");
  const canDiscard = turnAvailable("game-discard");
  piles.append(
    makeGameCard({ covered: true }, () => void runHumanTurn("game-deck"), !canDraw,
      `Spielkarten-Nachziehstapel: ${state.gameDeck.length} Karten`, `card-stack ${canDraw ? "sa-interactive" : ""}`),
    makeGameCard(state.gameDiscard.at(-1), () => void runHumanTurn("game-discard"), !canDiscard,
      `Spielkarten-Ablage: ${state.gameDiscard.length ? textForCard(state.gameDiscard.at(-1)) : "leer"}`,
      canDiscard ? "sa-interactive" : ""),
  );
  const offer = root.querySelector("#sa-offer");
  offer.replaceChildren();
  const canTakeAction = turnAvailable("action-draw");
  const canDrawAction = canTakeAction && (state.actionDeck.length > 0 || state.actionDiscard.length > 1);
  offer.append(makeActionCard(null, () => void runHumanTurn("action-draw", ["deck"]),
    !canDrawAction, `Aktionskarten-Nachziehstapel: ${state.actionDeck.length} Karten`,
    canDrawAction ? "sa-interactive" : ""));
  state.actionOffer.forEach((card, index) => {
    offer.append(makeActionCard(card, () => void runHumanTurn("action-draw", [String(index)]),
      !canTakeAction, `Aktionskarte nehmen: ${ACTION_LABELS[card.type]}`,
      canTakeAction ? "sa-interactive" : ""));
  });
  const topAction = state.actionDiscard.at(-1);
  if (topAction) {
    offer.append(makeActionCard(topAction, () => {}, true,
      `Aktionskarten-Ablage: ${ACTION_LABELS[topAction.type]}`, "sa-action-discard"));
  }
  const actions = root.querySelector("#sa-actions");
  actions.replaceChildren();
  if (state.phase === "turn" && state.activePlayer === 0) {
    const options = getTurnOptions(state, 0);
    if (!options.length) actions.append(document.createTextNode("Kein gültiger Zug verfügbar. Kehre zum Hauptmenü zurück."));
  }
  const results = root.querySelector("#sa-results");
  results.hidden = state.phase !== "finished";
  if (!results.hidden) renderResults(results);
}

function renderResults(results) {
  results.replaceChildren();
  const title = document.createElement("h2");
  title.textContent = matchFinished ? "Partie beendet" : "Rundenwertung";
  results.append(title);
  const closer = document.createElement("p");
  closer.textContent = `Rundenbeender: ${state.closingPlayer === 0 ? "Du" : "Computer"}.`;
  results.append(closer);
  state.result.breakdown.forEach((score, owner) => {
    const row = document.createElement("p");
    const doubled = state.result.doubled && state.closingPlayer === owner;
    row.textContent = `${owner === 0 ? "Du" : "Computer"}: Karten ${score.cardPoints}, Sternbonus ${score.starBonus}, Aktionskarten ${score.actionPoints} = ${score.total}${doubled ? `, verdoppelt auf ${state.result.scores[owner]}` : ""}. Gesamt: ${scores[owner]}.`;
    results.append(row);
  });
  if (matchFinished) {
    const winner = document.createElement("p");
    winner.textContent = scores[0] === scores[1] ? "Die Partie endet unentschieden."
      : scores[0] < scores[1] ? "Du hast die Partie gewonnen!" : "Der Computer hat die Partie gewonnen.";
    results.append(winner);
  } else {
    results.append(button("Nächste Runde", () => {
      state = createRound(Math.random, state.closingPlayer);
      counted = false;
      message = "";
      render();
      void advance();
    }, busy));
  }
}

function showError(error) {
  message = error instanceof Error ? error.message : String(error);
  console.error("Skyjo Action:", error);
  render();
}

class NeedChoice extends Error {
  constructor(request) {
    super("Spielentscheidung erforderlich");
    this.request = request;
  }
}

function requestChoice(request) {
  if (Number.isInteger(request.boardOwner)) {
    return new Promise((resolve) => {
      boardDecision = {
        owner: request.boardOwner,
        values: new Set(request.options.map((option) => option.value)),
        title: request.title,
        resolve,
      };
      render();
    });
  }
  const dialog = root.querySelector("#sa-dialog");
  const title = dialog.querySelector("#sa-dialog-title");
  const options = dialog.querySelector("#sa-dialog-options");
  title.textContent = request.title;
  options.replaceChildren();
  return new Promise((resolve) => {
    const finish = (answer) => {
      dialog.close();
      resolve(answer);
    };
    for (const option of request.options) {
      options.append(button(option.label, () => finish(option.value)));
    }
    dialog.oncancel = (event) => {
      event.preventDefault();
    };
    dialog.showModal();
  });
}

function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

async function executeTurn(actor, action, initialDecisions = []) {
  const decisions = [...initialDecisions];
  const seed = Math.floor(Math.random() * 4294967296);
  while (true) {
    let decisionIndex = 0;
    try {
      return playTurn(state, actor, action, (request) => {
        if (request.player === 1) return chooseComputerDecision(request, state);
        if (decisionIndex >= decisions.length) throw new NeedChoice(request);
        return decisions[decisionIndex++];
      }, seededRandom(seed));
    } catch (error) {
      if (!(error instanceof NeedChoice)) throw error;
      decisions.push(await requestChoice(error.request));
    }
  }
}

async function runHumanTurn(action, initialDecisions = []) {
  if (busy) return;
  busy = true;
  render();
  try {
    state = await executeTurn(0, action, initialDecisions);
    message = state.events.join(" ");
  } catch (error) {
    showError(error);
  } finally {
    busy = false;
    render();
  }
  void advance();
}

function setupBonusOptions() {
  const options = state.actionOffer.map((card, index) => ({
    value: String(index), label: ACTION_LABELS[card.type],
  }));
  if (state.actionDeck.length || state.actionDiscard.length > 1) options.push({ value: "deck", label: "Verdeckte Aktionskarte" });
  options.push({ value: "skip", label: "Keine Karte nehmen" });
  return options;
}

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function advance() {
  if (busy) return;
  busy = true;
  try {
    while (true) {
      render();
      if (state.phase === "setup") {
        if (state.pendingStarBonus !== null) {
          const owner = state.pendingStarBonus;
          const request = { player: owner, title: "Sternbonus: Aktionskarte nehmen", options: setupBonusOptions() };
          const selected = owner === 0 ? await requestChoice(request) : chooseComputerDecision(request, state);
          state = resolveSetupStarBonus(state, owner, selected === "deck" || selected === "skip" ? selected : Number(selected));
          message = `${owner === 0 ? "Du" : "Computer"}: Sternbonus ${selected === "skip" ? "nicht genutzt" : "genutzt"}.`;
          continue;
        }
        if (state.setupPlayer === 0) break;
        await pause(300);
        const index = state.players[1].board.findIndex((card) => card?.covered);
        state = revealSetupCard(state, 1, index);
        continue;
      }
      if (state.phase === "start-tie") {
        state = resolveStartTie(state);
        message = `Startentscheidung: Du ${state.lastTieBreak.sums[0]}, Computer ${state.lastTieBreak.sums[1]}${state.phase === "start-tie" ? " – erneuter Gleichstand." : "."}`;
        render();
        await pause(500);
        continue;
      }
      if (state.phase === "turn" && state.activePlayer === 1) {
        const action = chooseComputerTurn(state);
        if (!action) throw new Error("Der Computer hat keinen gültigen Zug. Bitte zum Hauptmenü zurückkehren.");
        const label = getTurnOptions(state, 1).find((option) => option.value === action).label;
        await pause(400);
        state = await executeTurn(1, action);
        message = [`Computer: ${label}.`, ...state.events].join(" ");
        continue;
      }
      if (state.phase === "finished" && !counted) {
        scores = scores.map((score, index) => score + state.result.scores[index]);
        counted = true;
        matchFinished = scores.some((score) => score >= 100);
        if (matchFinished) {
          try {
            localStorage.removeItem(STORAGE_KEY);
          } catch (error) {
            message = `Action-Spielstand konnte nicht gelöscht werden: ${error.message}`;
            console.error(message, error);
          }
        } else {
          saveRound(state.closingPlayer);
        }
      }
      break;
    }
  } catch (error) {
    showError(error);
  } finally {
    busy = false;
    render();
  }
}

function startAction(saved) {
  scores = saved ? [...saved.scores] : [0, 0];
  state = createRound(Math.random, saved?.previousCloser ?? null);
  counted = false;
  matchFinished = false;
  message = "";
  boardDecision = null;
  if (!root) makeRoot();
  startModal.classList.remove("active");
  for (const element of document.body.children) {
    if (element !== root) element.inert = true;
  }
  document.body.classList.add("skyjo-action-active");
  if (!saved) saveRound(null);
  render();
  void advance();
}

startButton.addEventListener("click", () => startAction(null));
continueButton.addEventListener("click", () => {
  try {
    const saved = readSave();
    if (!saved) throw new Error("Kein Action-Spielstand vorhanden");
    startAction(saved);
  } catch (error) {
    console.error("Action-Partie konnte nicht fortgesetzt werden:", error);
    window.alert(`Action-Partie konnte nicht fortgesetzt werden: ${error.message}`);
    updateContinueButton();
  }
});
updateContinueButton();
