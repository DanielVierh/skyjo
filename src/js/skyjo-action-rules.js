export const ACTION_TYPES = Object.freeze([
  "own-swap",
  "double-turn",
  "draw-three",
  "enlightenment",
  "reactivation",
  "defense",
  "opponent-swap",
  "action-thief",
  "meteor-shower",
]);

export const BOARD_LINES = Object.freeze([
  [0, 1, 2, 3],
  [4, 5, 6, 7],
  [8, 9, 10, 11],
  [0, 4, 8],
  [1, 5, 9],
  [2, 6, 10],
  [3, 7, 11],
].map((line) => Object.freeze(line)));

export function createDecks() {
  const gameCards = [];
  let nextId = 0;
  const addNumbers = (value, count) => {
    for (let i = 0; i < count; i++) {
      gameCards.push({ id: `game-${nextId++}`, type: "number", value });
    }
  };
  addNumbers(-2, 3);
  addNumbers(0, 11);
  addNumbers(-1, 7);
  for (let value = 1; value <= 12; value++) addNumbers(value, 7);
  for (let i = 0; i < 15; i++) {
    gameCards.push({ id: `game-${nextId++}`, type: "star" });
  }

  const actionCards = ACTION_TYPES.flatMap((type) =>
    Array.from({ length: 3 }, (_, index) => ({
      id: `action-${type}-${index}`,
      type,
    })),
  );
  return { gameCards, actionCards };
}

export function shuffle(cards, random = Math.random) {
  const result = [...cards];
  for (let i = result.length - 1; i > 0; i--) {
    const sample = random();
    if (!Number.isFinite(sample) || sample < 0 || sample >= 1) {
      throw new RangeError("Random value must be at least 0 and less than 1");
    }
    const j = Math.floor(sample * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function createRound(random = Math.random, previousCloser = null) {
  if (previousCloser !== null && previousCloser !== 0 && previousCloser !== 1) {
    throw new TypeError("Invalid previous closing player");
  }
  const decks = createDecks();
  const gameDeck = shuffle(decks.gameCards, random);
  const actionDeck = shuffle(decks.actionCards, random);
  const players = [0, 1].map(() => ({
    board: gameDeck.splice(0, 12).map((card) => ({ ...card, covered: true })),
    actions: [],
  }));
  const gameDiscard = [gameDeck.pop()];
  const actionDiscard = [actionDeck.pop()];
  const actionOffer = actionDeck.splice(0, 4);
  return {
    players,
    gameDeck,
    gameDiscard,
    actionDeck,
    actionDiscard,
    actionOffer,
    phase: "setup",
    setupPlayer: 0,
    setupReveals: [0, 0],
    setupSums: [0, 0],
    pendingStarBonus: null,
    previousCloser,
    activePlayer: null,
    lastTieBreak: null,
    turnCounts: [0, 0],
    extraTurns: 0,
    closingPlayer: null,
    result: null,
  };
}

export function drawFromDeck(deck, discard, random = Math.random) {
  if (deck.length === 0 && discard.length > 1) {
    const top = discard.pop();
    deck.push(...shuffle(discard.splice(0), random));
    discard.push(top);
  }
  if (deck.length === 0) throw new Error("Nachziehstapel ist leer");
  return deck.pop();
}

function finishSetup(state) {
  if (state.setupReveals[0] !== 2 || state.setupReveals[1] !== 2) return;
  if (state.previousCloser !== null) {
    state.activePlayer = state.previousCloser;
    state.phase = "turn";
  } else if (state.setupSums[0] !== state.setupSums[1]) {
    state.activePlayer = state.setupSums[0] > state.setupSums[1] ? 0 : 1;
    state.phase = "turn";
  } else {
    state.phase = "start-tie";
  }
}

export function revealSetupCard(state, playerIndex, cardIndex) {
  if (
    state.phase !== "setup" ||
    state.pendingStarBonus !== null ||
    playerIndex !== state.setupPlayer ||
    !Number.isInteger(cardIndex) ||
    cardIndex < 0 ||
    cardIndex >= 12
  ) {
    throw new Error("Diese Startkarte kann nicht aufgedeckt werden");
  }
  const card = state.players[playerIndex].board[cardIndex];
  if (!card || !card.covered) throw new Error("Karte ist nicht verdeckt");

  const next = structuredClone(state);
  const revealed = next.players[playerIndex].board[cardIndex];
  revealed.covered = false;
  next.setupReveals[playerIndex]++;
  if (revealed.type === "number") next.setupSums[playerIndex] += revealed.value;
  if (revealed.type === "star") next.pendingStarBonus = playerIndex;
  if (next.setupReveals[playerIndex] === 2 && playerIndex === 0) {
    next.setupPlayer = 1;
  }
  if (next.pendingStarBonus === null) finishSetup(next);
  return next;
}

export function resolveSetupStarBonus(state, playerIndex, choice, random = Math.random) {
  if (state.phase !== "setup" || state.pendingStarBonus !== playerIndex) {
    throw new Error("Kein Sternbonus verfügbar");
  }
  const next = structuredClone(state);
  if (choice === "deck") {
    next.players[playerIndex].actions.push(
      drawFromDeck(next.actionDeck, next.actionDiscard, random),
    );
  } else if (choice !== "skip") {
    if (!Number.isInteger(choice) || choice < 0 || choice >= next.actionOffer.length) {
      throw new Error("Aktionskarte nicht verfügbar");
    }
    next.players[playerIndex].actions.push(next.actionOffer.splice(choice, 1)[0]);
    if (next.actionDeck.length > 0 || next.actionDiscard.length > 1) {
      next.actionOffer.splice(
        choice, 0, drawFromDeck(next.actionDeck, next.actionDiscard, random),
      );
    }
  }
  next.pendingStarBonus = null;
  finishSetup(next);
  return next;
}

export function resolveStartTie(state, random = Math.random) {
  if (state.phase !== "start-tie") throw new Error("Kein Startgleichstand");
  if (state.gameDeck.length < 4) {
    throw new Error("Nicht genügend Karten für die Startentscheidung");
  }
  const next = structuredClone(state);
  const cards = next.gameDeck.splice(-4);
  const value = (card) => card.type === "star" ? 0 : card.value;
  const sums = [value(cards[0]) + value(cards[1]), value(cards[2]) + value(cards[3])];
  next.gameDeck.push(...cards);
  next.gameDeck = shuffle(next.gameDeck, random);
  next.lastTieBreak = { cards, sums };
  if (sums[0] !== sums[1]) {
    next.activePlayer = sums[0] > sums[1] ? 0 : 1;
    next.phase = "turn";
  }
  return next;
}

function assertBoard(board) {
  if (!Array.isArray(board) || board.length !== 12) {
    throw new TypeError("Board must contain exactly 12 positions");
  }
}

export function findLines(board) {
  assertBoard(board);
  return BOARD_LINES.flatMap((line, lineIndex) => {
    const indexes = line.filter((index) => board[index] !== null);
    if (indexes.length < 3 || indexes.some((index) => board[index].covered)) {
      return [];
    }
    const cards = indexes.map((index) => board[index]);
    if (cards.some((card) => card.type !== "number" && card.type !== "star")) {
      throw new TypeError("Invalid game card");
    }
    const values = new Set(
      cards.filter((card) => card.type === "number").map((card) => card.value),
    );
    if (values.size > 1) return [];
    return [{
      lineIndex,
      indexes,
      allStars: values.size === 0,
      usesStars: cards.some((card) => card.type === "star"),
    }];
  });
}

export function calculateBaseScore(player, starLines = []) {
  assertBoard(player.board);
  if (!Array.isArray(player.actions) || !Array.isArray(starLines)) {
    throw new TypeError("Invalid score inputs");
  }
  const eligible = new Map(
    findLines(player.board)
      .filter((line) => line.allStars)
      .map((line) => [line.lineIndex, line]),
  );
  const used = new Set();
  let starBonus = 0;
  for (const lineIndex of starLines) {
    const line = eligible.get(lineIndex);
    if (!line || line.indexes.some((index) => used.has(index))) {
      throw new Error("Invalid or overlapping star scoring line");
    }
    line.indexes.forEach((index) => used.add(index));
    starBonus += line.indexes.length === 4 ? -15 : -10;
  }
  let cardPoints = 0;
  for (const card of player.board) {
    if (!card) continue;
    if (card.covered) throw new Error("Cards must be revealed before scoring");
    if (card.type === "number" && Number.isFinite(card.value)) {
      cardPoints += card.value;
    } else if (card.type !== "star") {
      throw new TypeError("Invalid game card");
    }
  }
  const actionPoints = player.actions.length * 10;
  return {
    cardPoints,
    actionPoints,
    starBonus,
    total: cardPoints + actionPoints + starBonus,
  };
}

export function applyClosingPenalty(scores, closingPlayer) {
  if (
    !Array.isArray(scores) ||
    scores.length < 2 ||
    scores.some((score) => !Number.isFinite(score)) ||
    !Number.isInteger(closingPlayer) ||
    closingPlayer < 0 ||
    closingPlayer >= scores.length
  ) {
    throw new TypeError("Invalid scores or closing player");
  }
  const result = [...scores];
  const closingScore = scores[closingPlayer];
  const doubled = closingScore > 0 && scores.some(
    (score, index) => index !== closingPlayer && score <= closingScore,
  );
  if (doubled) result[closingPlayer] *= 2;
  return { scores: result, doubled };
}
