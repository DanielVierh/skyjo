import test from "node:test";
import assert from "node:assert/strict";
import {
  ACTION_TYPES,
  applyClosingPenalty,
  calculateBaseScore,
  createDecks,
  createRound,
  findLines,
  resolveSetupStarBonus,
  resolveStartTie,
  revealSetupCard,
  shuffle,
} from "../src/js/skyjo-action-rules.js";

const number = (value, covered = false) => ({ type: "number", value, covered });
const star = (covered = false) => ({ type: "star", covered });
const emptyBoard = () => Array(12).fill(null);

test("official deck contains the expected card types and quantities", () => {
  const { gameCards, actionCards } = createDecks();
  assert.equal(gameCards.length, 120);
  assert.equal(actionCards.length, 27);
  assert.equal(gameCards.filter((card) => card.type === "star").length, 15);
  for (const [value, count] of [[-2, 3], [0, 11], [-1, 7]]) {
    assert.equal(gameCards.filter((card) => card.value === value).length, count);
  }
  for (let value = 1; value <= 12; value++) {
    assert.equal(gameCards.filter((card) => card.value === value).length, 7);
  }
  for (const type of ACTION_TYPES) {
    assert.equal(actionCards.filter((card) => card.type === type).length, 3);
  }
  assert.equal(new Set([...gameCards, ...actionCards].map((card) => card.id)).size, 147);
});

test("round setup deals two covered 4x3 boards and separate piles", () => {
  const round = createRound(() => 0.5);
  assert.deepEqual(round.players.map((player) => player.board.length), [12, 12]);
  assert.ok(round.players.every((player) => player.board.every((card) => card.covered)));
  assert.equal(round.gameDeck.length, 95);
  assert.equal(round.gameDiscard.length, 1);
  assert.equal(round.actionOffer.length, 4);
  assert.equal(round.actionDeck.length, 22);
  assert.equal(round.actionDiscard.length, 1);
  assert.equal(round.phase, "setup");
});

test("shuffle copies its input and rejects invalid random values", () => {
  const original = [1, 2, 3];
  assert.deepEqual(shuffle(original, () => 0), [2, 3, 1]);
  assert.deepEqual(original, [1, 2, 3]);
  assert.throws(() => shuffle(original, () => 1), RangeError);
});

test("setup enforces two reveals per player and resolves a star bonus", () => {
  let state = createRound(() => 0.5);
  state.players[0].board[0] = { ...star(true), id: "test-star" };
  state.players[0].board[1] = { ...number(7, true), id: "test-7" };
  state.players[1].board[0] = { ...number(2, true), id: "test-2" };
  state.players[1].board[1] = { ...number(3, true), id: "test-3" };
  state = revealSetupCard(state, 0, 0);
  assert.equal(state.pendingStarBonus, 0);
  assert.throws(() => revealSetupCard(state, 0, 1));
  const taken = state.actionOffer[0];
  state = resolveSetupStarBonus(state, 0, 0, () => 0.5);
  assert.equal(state.players[0].actions[0].id, taken.id);
  assert.equal(state.actionOffer.length, 4);
  state = revealSetupCard(state, 0, 1);
  assert.throws(() => revealSetupCard(state, 0, 2));
  state = revealSetupCard(state, 1, 0);
  state = revealSetupCard(state, 1, 1);
  assert.equal(state.phase, "turn");
  assert.equal(state.activePlayer, 0);
  assert.deepEqual(state.setupSums, [7, 5]);
});

test("invalid setup actions leave the original state unchanged", () => {
  const state = createRound(() => 0.5);
  const original = structuredClone(state);
  assert.throws(() => revealSetupCard(state, 1, 0));
  assert.deepEqual(state, original);
});

test("the last setup star bonus must be resolved before play starts", () => {
  let state = createRound(() => 0.5);
  for (const player of state.players) {
    player.board[0] = number(2, true);
    player.board[1] = number(3, true);
  }
  state.players[1].board[1] = star(true);
  for (const [player, index] of [[0, 0], [0, 1], [1, 0], [1, 1]]) {
    state = revealSetupCard(state, player, index);
  }
  assert.equal(state.phase, "setup");
  assert.equal(state.pendingStarBonus, 1);
  state = resolveSetupStarBonus(state, 1, "skip");
  assert.equal(state.phase, "turn");
  assert.equal(state.activePlayer, 0);
});

test("star bonus reshuffles the action discard except its top card", () => {
  let state = createRound(() => 0.5);
  state.players[0].board[0] = star(true);
  state = revealSetupCard(state, 0, 0);
  state.actionDiscard = [{ id: "recycled", type: "defense" }, { id: "top", type: "draw-three" }];
  state.actionDeck = [];
  state = resolveSetupStarBonus(state, 0, "deck", () => 0.5);
  assert.equal(state.players[0].actions[0].id, "recycled");
  assert.equal(state.actionDiscard[0].id, "top");
});

test("later rounds start with the previous closer", () => {
  let state = createRound(() => 0.5, 1);
  for (const player of state.players) {
    player.board[0] = number(5, true);
    player.board[1] = number(7, true);
  }
  for (const player of [0, 1]) {
    for (const index of [0, 1]) state = revealSetupCard(state, player, index);
  }
  assert.equal(state.phase, "turn");
  assert.equal(state.activePlayer, 1);
});

test("tied first-round start draws two cards per player and returns them", () => {
  let state = createRound(() => 0.5);
  for (const player of state.players) {
    player.board[0] = number(1, true);
    player.board[1] = number(1, true);
  }
  for (const player of [0, 1]) {
    for (const index of [0, 1]) state = revealSetupCard(state, player, index);
  }
  assert.equal(state.phase, "start-tie");
  state.gameDeck.splice(-4, 4, number(3), number(2), number(1), number(1));
  const before = state.gameDeck.length;
  state = resolveStartTie(state, () => 0.5);
  assert.equal(state.gameDeck.length, before);
  assert.deepEqual(state.lastTieBreak.sums, [5, 2]);
  assert.equal(state.activePlayer, 0);
  assert.equal(state.players.flatMap((player) => player.board).filter((card) => !card.covered).length, 4);
});

test("tied decision cards leave the start decision open", () => {
  const state = createRound(() => 0.5);
  state.phase = "start-tie";
  state.gameDeck.splice(-4, 4, number(3), number(2), number(1), number(4));
  const result = resolveStartTie(state, () => 0.5);
  assert.deepEqual(result.lastTieBreak.sums, [5, 5]);
  assert.equal(result.phase, "start-tie");
  assert.equal(result.activePlayer, null);
});

test("line detection respects coverage, removed positions and optional stars", () => {
  const board = emptyBoard();
  board[0] = number(4);
  board[4] = star();
  board[8] = number(4);
  assert.deepEqual(findLines(board), [{
    lineIndex: 3, indexes: [0, 4, 8], allStars: false, usesStars: true,
  }]);
  board[8].covered = true;
  assert.deepEqual(findLines(board), []);
  board[8].covered = false;
  board[1] = number(4);
  board[2] = number(4);
  assert.ok(findLines(board).some((line) => line.lineIndex === 0));
});

test("star scoring requires valid nonoverlapping lines", () => {
  const board = emptyBoard();
  for (const index of [0, 1, 2, 3, 4, 8]) board[index] = star();
  const player = { board, actions: [{}, {}] };
  assert.deepEqual(calculateBaseScore(player, [0]), {
    cardPoints: 0, actionPoints: 20, starBonus: -15, total: 5,
  });
  assert.equal(calculateBaseScore(player, [3]).starBonus, -10);
  assert.throws(() => calculateBaseScore(player, [0, 3]), /overlapping/);
  assert.throws(() => calculateBaseScore(player, [0, 0]), /overlapping/);
});

test("scoring rejects covered cards and preserves negative totals", () => {
  const board = emptyBoard();
  board[0] = number(-2, true);
  assert.throws(() => calculateBaseScore({ board, actions: [] }), /revealed/);
  board[0].covered = false;
  assert.equal(calculateBaseScore({ board, actions: [] }).total, -2);
});

test("closing player doubles positive points on a tie or worse score only", () => {
  assert.deepEqual(applyClosingPenalty([10, 10], 0), { scores: [20, 10], doubled: true });
  assert.deepEqual(applyClosingPenalty([10, 9], 0), { scores: [20, 9], doubled: true });
  assert.deepEqual(applyClosingPenalty([9, 10], 0), { scores: [9, 10], doubled: false });
  assert.deepEqual(applyClosingPenalty([-1, -2], 0), { scores: [-1, -2], doubled: false });
  assert.deepEqual(applyClosingPenalty([0, 0], 0), { scores: [0, 0], doubled: false });
});
