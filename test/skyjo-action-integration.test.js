import test from "node:test";
import assert from "node:assert/strict";
import {
  createRound,
  resolveSetupStarBonus,
  resolveStartTie,
  revealSetupCard,
} from "../src/js/skyjo-action-rules.js";
import { getTurnOptions, playTurn } from "../src/js/skyjo-action-turn.js";
import { chooseComputerDecision, chooseComputerTurn } from "../src/js/skyjo-action-ai.js";

function randomSeed(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function assertCardsConserved(state) {
  const gameCards = [
    ...state.gameDeck,
    ...state.gameDiscard,
    ...state.players.flatMap((player) => player.board.filter(Boolean)),
  ];
  const actionCards = [
    ...state.actionDeck,
    ...state.actionDiscard,
    ...state.actionOffer,
    ...state.players.flatMap((player) => player.actions),
  ];
  assert.equal(gameCards.length, 120);
  assert.equal(new Set(gameCards.map((card) => card.id)).size, 120);
  assert.equal(actionCards.length, 27);
  assert.equal(new Set(actionCards.map((card) => card.id)).size, 27);
}

test("complete seeded two-player rounds with legal choices", () => {
  for (let seed = 1; seed <= 30; seed++) {
    const random = randomSeed(seed);
    let state = createRound(random);
    while (state.phase === "setup") {
      if (state.pendingStarBonus !== null) {
        state = resolveSetupStarBonus(state, state.pendingStarBonus,
          state.actionOffer.length ? 0 : "skip", random);
      } else {
        const owner = state.setupPlayer;
        const index = state.players[owner].board.findIndex((card) => card.covered);
        state = revealSetupCard(state, owner, index);
      }
    }
    while (state.phase === "start-tie") state = resolveStartTie(state, random);
    assertCardsConserved(state);
    let turns = 0;
    while (state.phase === "turn" && turns < 500) {
      const owner = state.activePlayer;
      const options = getTurnOptions(state, owner);
      const move = owner === 1 ? chooseComputerTurn(state)
        : options.find((option) => option.value === "game-deck")?.value ?? options[0]?.value;
      assert.ok(move, `seed ${seed}: no legal turn`);
      const before = state;
      state = playTurn(state, owner, move,
        (request) => chooseComputerDecision(request, before), random);
      assertCardsConserved(state);
      turns++;
    }
    assert.equal(state.phase, "finished", `seed ${seed} did not finish in ${turns} turns`);
    assert.equal(state.result.scores.length, 2);
    assert.ok(state.result.scores.every(Number.isFinite));
  }
});

test("varied legal action sequences conserve cards and finish", () => {
  for (let seed = 41; seed <= 140; seed++) {
    const random = randomSeed(seed);
    let state = createRound(random);
    while (state.phase === "setup") {
      if (state.pendingStarBonus !== null) {
        state = resolveSetupStarBonus(state, state.pendingStarBonus,
          state.actionOffer.length ? 0 : "skip", random);
      } else {
        const owner = state.setupPlayer;
        state = revealSetupCard(state, owner, state.players[owner].board.findIndex((card) => card.covered));
      }
    }
    while (state.phase === "start-tie") state = resolveStartTie(state, random);
    let turns = 0;
    while (state.phase === "turn" && turns < 1000) {
      const owner = state.activePlayer;
      const options = getTurnOptions(state, owner);
      assert.ok(options.length, `seed ${seed}: no legal turn`);
      const preferred = options.find((option) => option.value === "game-deck");
      const move = preferred && random() < 0.4 ? preferred : options[Math.floor(random() * options.length)];
      state = playTurn(state, owner, move.value, ({ options: choices }) => {
        const play = choices.find((option) => option.value === "play");
        return play?.value ?? choices[Math.floor(random() * choices.length)].value;
      }, random);
      assertCardsConserved(state);
      turns++;
    }
    assert.equal(state.phase, "finished", `seed ${seed} did not finish in ${turns} turns`);
  }
});
