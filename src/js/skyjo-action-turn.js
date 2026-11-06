import {
  applyClosingPenalty,
  calculateBaseScore,
  drawFromDeck,
  findLines,
} from "./skyjo-action-rules.js";

export const ACTION_LABELS = Object.freeze({
  "own-swap": "Eigene Karten tauschen",
  "double-turn": "Doppelter Spielzug",
  "draw-three": "Drei Karten ziehen",
  enlightenment: "Erleuchtung",
  reactivation: "Reaktivierung",
  defense: "Verteidigung + zusätzlicher Zug",
  "opponent-swap": "Kartentausch mit Mitspieler",
  "action-thief": "Aktionskarten-Dieb + zusätzlicher Zug",
  "meteor-shower": "Meteoritenschauer",
});

const cardText = (card) => card.type === "star" ? "Stern" : String(card.value);
const hasDraw = (deck, discard) => deck.length > 0 || discard.length > 1;
const hasBoard = (player) => player.board.some(Boolean);
const hasCovered = (player) => player.board.some((card) => card?.covered);

function choose(context, player, title, options, details = {}) {
  if (!options.length) throw new Error(`Keine Auswahl möglich: ${title}`);
  const answer = context.choose({ player, title, options, ...details });
  if (!options.some((option) => option.value === answer)) {
    throw new Error(`Ungültige Auswahl: ${title}`);
  }
  return answer;
}

function chooseIndex(context, player, title, indexes, label, details) {
  return Number(choose(context, player, title, indexes.map((index) => ({
    value: String(index),
    label: label(index),
  })), details));
}

function boardIndexes(board, predicate = () => true) {
  return board.flatMap((card, index) => card && predicate(card, index) ? [index] : []);
}

function boardLabel(board, index) {
  const card = board[index];
  return `Reihe ${Math.floor(index / 4) + 1}, Spalte ${index % 4 + 1}: ${
    card.covered ? "verdeckt" : cardText(card)
  }`;
}

function chooseBoard(context, chooser, owner, title, predicate) {
  const board = context.state.players[owner].board;
  return chooseIndex(context, chooser, title, boardIndexes(board, predicate),
    (index) => boardLabel(board, index), { boardOwner: owner });
}

function takeActionCard(context, player, source) {
  const { state, random } = context;
  let card;
  if (source === "deck") {
    card = drawFromDeck(state.actionDeck, state.actionDiscard, random);
  } else {
    const index = Number(source);
    if (!Number.isInteger(index) || index < 0 || index >= state.actionOffer.length) {
      throw new Error("Aktionskarte ist nicht verfügbar");
    }
    card = state.actionOffer.splice(index, 1)[0];
    if (hasDraw(state.actionDeck, state.actionDiscard)) {
      state.actionOffer.splice(index, 0,
        drawFromDeck(state.actionDeck, state.actionDiscard, random));
    }
  }
  state.players[player].actions.push({
    id: card.id,
    type: card.type,
    availableAt: state.turnCounts[player] + (player === context.actor ? 1 : 0),
  });
}

function actionSources(state, allowSkip = false) {
  const options = state.actionOffer.map((card, index) => ({
    value: String(index),
    label: ACTION_LABELS[card.type],
  }));
  if (hasDraw(state.actionDeck, state.actionDiscard)) {
    options.push({ value: "deck", label: "Verdeckte Aktionskarte" });
  }
  if (allowSkip || !options.length) options.push({ value: "skip", label: "Keine Karte nehmen" });
  return options;
}

function starBonus(context, player) {
  const source = choose(context, player, "Sternbonus: Aktionskarte nehmen", actionSources(context.state, true));
  if (source !== "skip") takeActionCard(context, player, source);
  context.events.push(`${player === 0 ? "Du" : "Computer"}: Sternbonus ${source === "skip" ? "nicht genutzt" : "genutzt"}.`);
}

function reveal(context, owner, index) {
  const card = context.state.players[owner].board[index];
  if (!card || !card.covered) throw new Error("Karte ist nicht verdeckt");
  card.covered = false;
  if (card.type === "star") starBonus(context, owner);
}

function replaceCard(context, owner, index, card) {
  const board = context.state.players[owner].board;
  if (!board[index]) throw new Error("Kartenposition ist nicht verfügbar");
  const old = board[index];
  context.state.gameDiscard.push({ ...old, covered: false });
  board[index] = { ...card, covered: false };
  if (card.type === "star") starBonus(context, owner);
}

function chooseVisibility(context, chooser, title) {
  return choose(context, chooser, title, [
    { value: "open", label: "Offen ablegen" },
    { value: "covered", label: "Verdeckt ablegen" },
  ]) === "covered";
}

function swapBoardCards(context, actor, firstOwner, secondOwner) {
  const first = chooseBoard(context, actor, firstOwner, "Erste Karte auswählen");
  const second = chooseBoard(context, actor, secondOwner, "Zweite Karte auswählen",
    (_, index) => firstOwner !== secondOwner || index !== first);
  const firstBoard = context.state.players[firstOwner].board;
  const secondBoard = context.state.players[secondOwner].board;
  const a = firstBoard[first];
  const b = secondBoard[second];
  const aCovered = chooseVisibility(context, actor, "Erste Karte am neuen Platz");
  const bCovered = chooseVisibility(context, actor, "Zweite Karte am neuen Platz");
  firstBoard[first] = { ...b, covered: bCovered };
  secondBoard[second] = { ...a, covered: aCovered };
  if (a.type === "star" && a.covered && !aCovered) starBonus(context, secondOwner);
  if (b.type === "star" && b.covered && !bCovered) starBonus(context, firstOwner);
}

function discardInChosenOrder(context, actor, cards, pile) {
  const remaining = [...cards];
  while (remaining.length) {
    const index = remaining.length === 1 ? 0 : chooseIndex(
      context, actor, "Welche Karte zuerst auf die Ablage?", remaining.map((_, i) => i),
      (i) => cardText(remaining[i]),
    );
    pile.push({ ...remaining.splice(index, 1)[0], covered: false });
  }
}

function chooseDrawnCard(context, actor, card, canDiscard) {
  const player = context.state.players[actor];
  const options = [{ value: "swap", label: `${cardText(card)} tauschen` }];
  if (canDiscard && hasCovered(player)) options.push({ value: "discard", label: `${cardText(card)} ablegen und eine Karte aufdecken` });
  const choice = choose(context, actor, "Gezogene Spielkarte", options);
  if (choice === "discard") {
    const index = chooseBoard(context, actor, actor, "Verdeckte Karte aufdecken", (item) => item.covered);
    context.state.gameDiscard.push({ ...card, covered: false });
    reveal(context, actor, index);
  } else {
    const index = chooseBoard(context, actor, actor, "Karte zum Tauschen wählen");
    replaceCard(context, actor, index, card);
  }
}

function protectedFromAttack(context, target) {
  const actions = context.state.players[target].actions;
  const index = actions.findIndex((card) => card.type === "defense");
  if (index < 0) return false;
  context.state.actionDiscard.push(actions.splice(index, 1)[0]);
  context.events.push(`${target === 0 ? "Deine" : "Die"} Verteidigung hat den Angriff abgewehrt.`);
  return true;
}

function canPlayEffect(state, actor, card, visited = new Set()) {
  const other = 1 - actor;
  const own = state.players[actor];
  const opponent = state.players[other];
  const protectedTarget = opponent.actions.some((item) => item.type === "defense");
  switch (card.type) {
    case "own-swap":
      return boardIndexes(own.board).length >= 2;
    case "draw-three":
      return hasBoard(own) && state.gameDeck.length + Math.max(0, state.gameDiscard.length - 1) >= 3;
    case "reactivation": {
      if (visited.has(card.id)) return false;
      const nextVisited = new Set(visited).add(card.id);
      return state.actionDiscard.some((item) => canPlayEffect(state, actor, item, nextVisited));
    }
    case "opponent-swap":
      return protectedTarget || (hasBoard(own) && hasBoard(opponent));
    case "action-thief":
      return protectedTarget || opponent.actions.length > 0;
    case "meteor-shower":
      return protectedTarget ||
        (hasBoard(opponent) && hasDraw(state.gameDeck, state.gameDiscard)) ||
        (opponent.actions.length > 0 && hasDraw(state.actionDeck, state.actionDiscard));
    case "double-turn":
    case "enlightenment":
    case "defense":
      return true;
    default:
      return false;
  }
}

function playEffect(context, actor, card) {
  const { state } = context;
  const other = 1 - actor;
  switch (card.type) {
    case "own-swap":
      swapBoardCards(context, actor, actor, actor);
      break;
    case "double-turn":
      state.extraTurns += 2;
      break;
    case "draw-three": {
      const drawn = Array.from({ length: 3 }, () =>
        drawFromDeck(state.gameDeck, state.gameDiscard, context.random));
      const options = drawn.map((item, index) => ({ value: String(index), label: cardText(item) }));
      if (hasCovered(state.players[actor])) options.push({ value: "none", label: "Keine behalten" });
      const selected = choose(context, actor, "Eine der drei Karten behalten?", options);
      if (selected === "none") {
        discardInChosenOrder(context, actor, drawn, state.gameDiscard);
        const index = chooseBoard(context, actor, actor, "Verdeckte Karte aufdecken", (item) => item.covered);
        reveal(context, actor, index);
      } else {
        const chosen = drawn.splice(Number(selected), 1)[0];
        const index = chooseBoard(context, actor, actor, "Karte zum Tauschen wählen");
        replaceCard(context, actor, index, chosen);
        discardInChosenOrder(context, actor, drawn, state.gameDiscard);
      }
      break;
    }
    case "enlightenment": {
      const options = [];
      for (const owner of [actor, other]) {
        for (let line = 0; line < 7; line++) {
          options.push({ value: `${owner}:${line}`, label: `${owner === actor ? "Eigene" : "Fremde"} ${line < 3 ? `Reihe ${line + 1}` : `Spalte ${line - 2}`}` });
        }
      }
      const [owner, line] = choose(context, actor, "Reihe oder Spalte anschauen", options).split(":").map(Number);
      const indexes = line < 3
        ? [0, 1, 2, 3].map((column) => line * 4 + column)
        : [0, 1, 2].map((row) => row * 4 + line - 3);
      const hidden = indexes.flatMap((index) => {
        const item = state.players[owner].board[index];
        return item?.covered ? [`${index + 1}: ${cardText(item)}`] : [];
      });
      choose(context, actor, `Erleuchtung: ${hidden.length ? hidden.join(", ") : "Keine verdeckten Karten"}`, [{ value: "ok", label: "Weiter" }]);
      break;
    }
    case "reactivation": {
      const options = state.actionDiscard.flatMap((item, index) =>
        canPlayEffect(state, actor, item) ? [{
          value: String(index), label: ACTION_LABELS[item.type],
        }] : []);
      const index = Number(choose(context, actor, "Aktionskarte reaktivieren", options));
      const restored = state.actionDiscard.splice(index, 1)[0];
      playEffect(context, actor, restored);
      state.actionDiscard.push(restored);
      break;
    }
    case "defense":
      state.extraTurns++;
      break;
    case "opponent-swap":
      if (!protectedFromAttack(context, other)) swapBoardCards(context, actor, actor, other);
      break;
    case "action-thief": {
      state.extraTurns++;
      if (protectedFromAttack(context, other)) break;
      const hand = state.players[other].actions;
      const index = chooseIndex(context, actor, "Aktionskarte stehlen", hand.map((_, i) => i),
        (i) => ACTION_LABELS[hand[i].type]);
      const stolen = hand.splice(index, 1)[0];
      state.players[actor].actions.push({
        id: stolen.id,
        type: stolen.type,
        availableAt: state.turnCounts[actor] + 1,
        availableAfterOpponent: state.turnCounts[other] + 1,
      });
      break;
    }
    case "meteor-shower": {
      if (protectedFromAttack(context, other)) break;
      const target = state.players[other];
      const options = [];
      if (hasDraw(state.gameDeck, state.gameDiscard)) {
        for (const index of boardIndexes(target.board)) {
          options.push({ value: `board:${index}`, label: boardLabel(target.board, index) });
        }
      }
      if (hasDraw(state.actionDeck, state.actionDiscard)) {
        target.actions.forEach((item, index) => options.push({
          value: `action:${index}`, label: ACTION_LABELS[item.type],
        }));
      }
      const [kind, indexText] = choose(context, actor, "Karte des Mitspielers entfernen", options).split(":");
      const index = Number(indexText);
      if (kind === "board") {
        state.gameDiscard.unshift({ ...target.board[index], covered: false });
        const replacement = drawFromDeck(state.gameDeck, state.gameDiscard, context.random);
        target.board[index] = { ...replacement, covered: false };
        if (replacement.type === "star") starBonus(context, other);
      } else {
        state.actionDiscard.unshift(target.actions.splice(index, 1)[0]);
        const replacement = drawFromDeck(state.actionDeck, state.actionDiscard, context.random);
        target.actions.push({
          id: replacement.id,
          type: replacement.type,
          availableAt: state.turnCounts[other],
        });
      }
      break;
    }
    default:
      throw new Error(`Unbekannte Aktionskarte: ${card.type}`);
  }
}

function resolveLines(context, owner) {
  const board = context.state.players[owner].board;
  while (true) {
    const lines = findLines(board);
    const mandatory = lines.filter((line) => !line.usesStars);
    const options = lines.map((line) => ({
      value: String(line.lineIndex),
      label: `${line.lineIndex < 3 ? `Reihe ${line.lineIndex + 1}` : `Spalte ${line.lineIndex - 2}`} (${line.indexes.map((index) => cardText(board[index])).join(", ")}) auflösen${line.usesStars ? " (optional)" : ""}`,
    }));
    if (!mandatory.length) options.push({ value: "done", label: "Keine weitere Reihe auflösen" });
    if (options.length === 1 && options[0].value === "done") break;
    const selected = choose(context, owner, "Reihen und Spalten", options);
    if (selected === "done") break;
    const line = lines.find((item) => item.lineIndex === Number(selected));
    const removed = line.indexes.map((index) => {
      const card = board[index];
      board[index] = null;
      return card;
    });
    discardInChosenOrder(context, owner, removed, context.state.gameDiscard);
  }
}

function selectStarLines(context, owner) {
  const board = context.state.players[owner].board;
  const used = new Set();
  const selected = [];
  while (true) {
    const lines = findLines(board).filter((line) =>
      line.allStars && !line.indexes.some((index) => used.has(index)));
    if (!lines.length) return selected;
    const options = lines.map((line) => ({
      value: String(line.lineIndex),
      label: `${line.lineIndex < 3 ? `Reihe ${line.lineIndex + 1}` : `Spalte ${line.lineIndex - 2}`}: ${line.indexes.length === 4 ? -15 : -10} Punkte`,
    }));
    const choice = choose(context, owner, "Sternbonus bei der Wertung", options);
    const line = lines.find((item) => item.lineIndex === Number(choice));
    selected.push(line.lineIndex);
    line.indexes.forEach((index) => used.add(index));
  }
}

function finishRound(context) {
  const { state } = context;
  for (const owner of [0, 1]) {
    for (const index of boardIndexes(state.players[owner].board, (card) => card.covered)) {
      reveal(context, owner, index);
    }
    resolveLines(context, owner);
  }
  const breakdown = state.players.map((player, owner) =>
    calculateBaseScore(player, selectStarLines(context, owner)));
  const penalty = applyClosingPenalty(breakdown.map((score) => score.total), state.closingPlayer);
  state.result = { breakdown, scores: penalty.scores, doubled: penalty.doubled };
  state.phase = "finished";
}

export function getTurnOptions(state, actor) {
  if (state.phase !== "turn" || state.activePlayer !== actor) return [];
  const player = state.players[actor];
  const options = [];
  if (hasBoard(player) && hasDraw(state.gameDeck, state.gameDiscard)) options.push({ value: "game-deck", label: "Spielkarte vom Nachziehstapel" });
  if (hasBoard(player) && state.gameDiscard.length) options.push({ value: "game-discard", label: `Spielkarte von der Ablage (${cardText(state.gameDiscard.at(-1))})` });
  if (state.actionOffer.length || hasDraw(state.actionDeck, state.actionDiscard)) options.push({ value: "action-draw", label: "Aktionskarte nehmen" });
  if (state.closingPlayer === null && player.actions.length) options.push({ value: "action-use", label: "Aktionskarte spielen oder abwerfen" });
  return options;
}

export function playTurn(state, actor, action, chooseAnswer, random = Math.random) {
  if (state.phase !== "turn" || state.activePlayer !== actor || typeof chooseAnswer !== "function") {
    throw new Error("Spieler ist nicht am Zug");
  }
  if (!getTurnOptions(state, actor).some((option) => option.value === action)) {
    throw new Error("Diese Zugoption ist nicht verfügbar");
  }
  const next = structuredClone(state);
  const context = { state: next, choose: chooseAnswer, random, actor, events: [] };
  const wasLastTurn = next.closingPlayer !== null;
  const player = next.players[actor];
  if (action === "game-deck") {
    const card = drawFromDeck(next.gameDeck, next.gameDiscard, random);
    chooseDrawnCard(context, actor, card, true);
  } else if (action === "game-discard") {
    chooseDrawnCard(context, actor, next.gameDiscard.pop(), false);
  } else if (action === "action-draw") {
    const source = choose(context, actor, "Aktionskarte wählen", actionSources(next));
    if (source === "skip") throw new Error("Keine Aktionskarte verfügbar");
    takeActionCard(context, actor, source);
  } else {
    const index = chooseIndex(context, actor, "Aktionskarte wählen",
      player.actions.map((_, i) => i), (i) => ACTION_LABELS[player.actions[i].type]);
    const card = player.actions[index];
    const other = 1 - actor;
    const available = (card.availableAt ?? 0) <= next.turnCounts[actor] &&
      (card.availableAfterOpponent ?? 0) <= next.turnCounts[other];
    const options = [{ value: "discard", label: "Ungespielt abwerfen" }];
    if (available && canPlayEffect(next, actor, card)) options.unshift({ value: "play", label: "Aktionskarte ausspielen" });
    const choice = choose(context, actor, ACTION_LABELS[card.type], options);
    player.actions.splice(index, 1);
    context.events.push(`${actor === 0 ? "Du" : "Computer"}: ${ACTION_LABELS[card.type]} ${choice === "play" ? "ausgespielt" : "abgeworfen"}.`);
    if (choice === "play") playEffect(context, actor, card);
    next.actionDiscard.push(card);
  }
  resolveLines(context, actor);
  next.turnCounts[actor]++;
  if (wasLastTurn) {
    finishRound(context);
  } else if (next.players.some((item) => !hasCovered(item))) {
    next.closingPlayer = actor;
    next.extraTurns = 0;
    next.activePlayer = 1 - actor;
  } else if (next.extraTurns > 0) {
    next.extraTurns--;
  } else {
    next.activePlayer = 1 - actor;
  }
  next.events = context.events;
  return next;
}
