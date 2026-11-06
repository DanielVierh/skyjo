import test from "node:test";
import assert from "node:assert/strict";
import { createRound } from "../src/js/skyjo-action-rules.js";
import { getTurnOptions, playTurn } from "../src/js/skyjo-action-turn.js";
import { chooseComputerDecision, chooseComputerTurn } from "../src/js/skyjo-action-ai.js";

function fixture() {
  const state = createRound(() => 0.5);
  state.phase = "turn";
  state.activePlayer = 0;
  for (const [owner, player] of state.players.entries()) {
    player.board = Array.from({ length: 12 }, (_, index) => ({
      id: `${owner}-${index}`, type: "number", value: index, covered: index > 1,
    }));
    player.actions = [];
  }
  state.gameDeck = Array.from({ length: 15 }, (_, index) => ({
    id: `deck-${index}`, type: "number", value: index % 12,
  }));
  state.gameDiscard = [{ id: "discard", type: "number", value: 1 }];
  return state;
}

function decisions(...answers) {
  return ({ options, title }) => {
    const answer = answers.length ? answers.shift() : options.at(-1).value;
    assert.ok(options.some((option) => option.value === answer), `${title}: ${answer}`);
    return answer;
  };
}

const action = (type) => ({ id: `held-${type}`, type, availableAt: 0 });

test("drawing an open game card requires a swap", () => {
  const state = fixture();
  const next = playTurn(state, 0, "game-discard", decisions("swap", "2"));
  assert.equal(next.players[0].board[2].id, "discard");
  assert.equal(next.players[0].board[2].covered, false);
  assert.equal(next.gameDiscard.at(-1).id, "0-2");
  assert.equal(next.activePlayer, 1);
  assert.equal(state.players[0].board[2].id, "0-2");
  assert.throws(() => playTurn(state, 0, "game-discard", () => "discard"), /Ungültige Auswahl/);
});

test("discarding a concealed draw reveals an own card", () => {
  const state = fixture();
  const next = playTurn(state, 0, "game-deck", decisions("discard", "2"));
  assert.equal(next.players[0].board[2].covered, false);
  assert.equal(next.gameDiscard.at(-1).id, "deck-14");
  assert.equal(state.gameDeck.length, 15);
});

test("draw requests expose the drawn card and legal discard option", () => {
  for (const [source, id, canDiscard] of [
    ["game-deck", "deck-14", true],
    ["game-discard", "discard", false],
  ]) {
    const state = fixture();
    let request;
    playTurn(state, 0, source, (choice) => {
      if (choice.title === "Gezogene Spielkarte") {
        request = choice;
        return "swap";
      }
      return "2";
    });
    assert.equal(request.drawnCard.id, id);
    assert.equal(request.drawnFromDiscard, source === "game-discard");
    assert.equal(request.options.some((option) => option.value === "discard"), canDiscard);
  }
});

test("the computer takes a legal turn after a human draw", () => {
  const state = fixture();
  const human = playTurn(state, 0, "game-deck", decisions("discard", "2"));
  const move = chooseComputerTurn(human);
  assert.ok(getTurnOptions(human, 1).some((option) => option.value === move));
  const computer = playTurn(human, 1, move, (request) => chooseComputerDecision(request, human));
  assert.equal(computer.turnCounts[1], 1);
  assert.equal(computer.activePlayer, 0);
  assert.notDeepEqual(computer.players[1].board, human.players[1].board);
  assert.ok(computer.events.some((event) => event.startsWith("Computer:")));
});

test("taking an action uses the whole turn and delays its use", () => {
  const state = fixture();
  const id = state.actionOffer[0].id;
  const next = playTurn(state, 0, "action-draw", decisions("0"));
  assert.equal(next.players[0].actions[0].id, id);
  assert.equal(next.players[0].actions[0].availableAt, 1);
  assert.equal(next.actionOffer.length, 4);
  assert.equal(next.activePlayer, 1);
});

test("recycled action cards do not retain a former owner's theft restriction", () => {
  const state = fixture();
  state.actionDeck = [];
  state.actionDiscard = [
    { id: "recycled", type: "defense", availableAt: 8, availableAfterOpponent: 9 },
    action("double-turn"),
  ];
  const next = playTurn(state, 0, "action-draw", decisions("deck"), () => 0.5);
  assert.equal(next.players[0].actions[0].id, "recycled");
  assert.equal(next.players[0].actions[0].availableAt, 1);
  assert.equal(next.players[0].actions[0].availableAfterOpponent, undefined);
});

test("a completed numerical column is removed after the swap", () => {
  const state = fixture();
  state.players[0].board[0].value = 5;
  state.players[0].board[4] = { id: "column-4", type: "number", value: 5, covered: false };
  state.gameDiscard = [{ id: "incoming", type: "number", value: 5 }];
  const next = playTurn(state, 0, "game-discard", decisions("swap", "8", "3", "0", "0"));
  assert.deepEqual([next.players[0].board[0], next.players[0].board[4], next.players[0].board[8]], [null, null, null]);
  assert.equal(next.gameDiscard.at(-4).id, "0-8");
  assert.equal(next.gameDiscard.at(-1).id, "incoming");
});

test("double turn and defense grant the specified extra turns", () => {
  for (const [type, remaining] of [["double-turn", 1], ["defense", 0]]) {
    const state = fixture();
    state.players[0].actions = [action(type)];
    const next = playTurn(state, 0, "action-use", decisions("0", "play"));
    assert.equal(next.activePlayer, 0);
    assert.equal(next.extraTurns, remaining);
    assert.equal(next.actionDiscard.at(-1).type, type);
  }
});

test("own swap can change visibility and retains both positions", () => {
  const state = fixture();
  state.players[0].actions = [action("own-swap")];
  const next = playTurn(state, 0, "action-use", decisions("0", "play", "0", "2", "covered", "open"));
  assert.equal(next.players[0].board[0].id, "0-2");
  assert.equal(next.players[0].board[2].id, "0-0");
  assert.equal(next.players[0].board[0].covered, false);
  assert.equal(next.players[0].board[2].covered, true);
});

test("draw-three discards in the chosen order and flips a card", () => {
  const state = fixture();
  state.players[0].actions = [action("draw-three")];
  const next = playTurn(state, 0, "action-use", decisions("0", "play", "none", "0", "0", "2"));
  assert.equal(next.players[0].board[2].covered, false);
  assert.deepEqual(next.gameDiscard.slice(-3).map((card) => card.id), ["deck-14", "deck-13", "deck-12"]);
});

test("enlightenment reveals information without changing coverage", () => {
  const state = fixture();
  state.players[0].actions = [action("enlightenment")];
  let observed = "";
  const next = playTurn(state, 0, "action-use", (request) => {
    if (request.title.startsWith("Erleuchtung:")) observed = request.title;
    return request.options[0].value;
  });
  assert.match(observed, /3: 2/);
  assert.equal(next.players[0].board[2].covered, true);
});

test("reactivation plays a discarded effect and puts both cards on the discard pile", () => {
  const state = fixture();
  state.players[0].actions = [action("reactivation")];
  state.actionDiscard = [action("double-turn")];
  const next = playTurn(state, 0, "action-use", decisions("0", "play", "0"));
  assert.equal(next.activePlayer, 0);
  assert.equal(next.extraTurns, 1);
  assert.deepEqual(next.actionDiscard.map((card) => card.type), ["double-turn", "reactivation"]);
});

test("opponent swap is stopped by defense", () => {
  const state = fixture();
  state.players[0].actions = [action("opponent-swap")];
  state.players[1].actions = [action("defense")];
  const next = playTurn(state, 0, "action-use", decisions("0", "play"));
  assert.equal(next.players[1].actions.length, 0);
  assert.equal(next.players[1].board[0].id, "1-0");
  assert.deepEqual(next.actionDiscard.slice(-2).map((card) => card.type), ["defense", "opponent-swap"]);
});

test("board choices identify their owner and available card positions", () => {
  const state = fixture();
  state.players[0].actions = [action("opponent-swap")];
  const boardRequests = [];
  playTurn(state, 0, "action-use", (request) => {
    if (request.boardOwner !== undefined) boardRequests.push(request);
    if (request.title === "Aktionskarte wählen") return "0";
    if (request.options.some((option) => option.value === "play")) return "play";
    return request.options[0].value;
  });
  assert.deepEqual(boardRequests.map((request) => request.boardOwner), [0, 1]);
  assert.equal(boardRequests[0].options.length, 12);
  assert.ok(boardRequests[1].options.every((option) => !option.label.includes("undefined")));
});

test("thief steals an action and grants an extra turn", () => {
  const state = fixture();
  state.players[0].actions = [action("action-thief")];
  state.players[1].actions = [action("double-turn")];
  const next = playTurn(state, 0, "action-use", decisions("0", "play", "0"));
  assert.equal(next.players[0].actions[0].type, "double-turn");
  assert.equal(next.players[0].actions[0].availableAfterOpponent, 1);
  assert.equal(next.activePlayer, 0);
});

test("a stolen action cannot be played during the extra turn", () => {
  const state = fixture();
  state.players[0].actions = [action("action-thief")];
  state.players[1].actions = [action("double-turn")];
  const afterSteal = playTurn(state, 0, "action-use", decisions("0", "play", "0"));
  const before = structuredClone(afterSteal);
  assert.throws(() => playTurn(afterSteal, 0, "action-use",
    ({ title }) => title === "Aktionskarte wählen" ? "0" : "play"), /Ungültige Auswahl/);
  assert.deepEqual(afterSteal, before);
  const otherTurn = playTurn(afterSteal, 0, "game-deck", decisions("discard", "2"));
  const next = playTurn(otherTurn, 1, "game-deck", decisions("discard", "2"));
  const played = playTurn(next, 0, "action-use", decisions("0", "play"));
  assert.equal(played.activePlayer, 0);
});

test("meteor replaces an opponent card openly and returns the old card under the pile", () => {
  const state = fixture();
  state.players[0].actions = [action("meteor-shower")];
  const next = playTurn(state, 0, "action-use", decisions("0", "play", "board:2"));
  assert.equal(next.players[1].board[2].id, "deck-14");
  assert.equal(next.players[1].board[2].covered, false);
  assert.equal(next.gameDiscard[0].id, "1-2");
});

test("a star opened on the opponent board grants a usable card for their next turn", () => {
  const state = fixture();
  state.players[0].actions = [action("meteor-shower")];
  state.gameDeck.push({ id: "star-draw", type: "star" });
  const next = playTurn(state, 0, "action-use", decisions("0", "play", "board:2", "0"));
  assert.equal(next.players[1].board[2].type, "star");
  assert.equal(next.players[1].actions.length, 1);
  assert.equal(next.players[1].actions[0].availableAt, next.turnCounts[1]);
});

test("revealing an opponent's last card makes the acting player the closer", () => {
  const state = fixture();
  state.players[0].actions = [action("opponent-swap")];
  state.players[1].board.forEach((card) => { card.covered = false; });
  state.players[1].board[2].covered = true;
  const next = playTurn(state, 0, "action-use", decisions("0", "play", "0", "2", "open", "open"));
  assert.equal(next.closingPlayer, 0);
  assert.equal(next.activePlayer, 1);
  assert.equal(next.phase, "turn");
});

test("the closer gets no extra turn and the opponent gets exactly one", () => {
  const state = fixture();
  state.players[0].board.forEach((card) => { card.covered = false; });
  state.players[0].board[2].covered = true;
  state.extraTurns = 2;
  const next = playTurn(state, 0, "game-deck", decisions("discard", "2"));
  assert.equal(next.closingPlayer, 0);
  assert.equal(next.activePlayer, 1);
  assert.equal(next.extraTurns, 0);
  assert.throws(() => playTurn(next, 0, "game-deck", decisions()), /nicht am Zug/);
  const finished = playTurn(next, 1, "game-deck", decisions("discard", "2"));
  assert.equal(finished.phase, "finished");
  assert.throws(() => playTurn(finished, 1, "game-deck", decisions()), /nicht am Zug/);
});

test("last turn disallows actions and scores after revealing remaining cards", () => {
  const state = fixture();
  state.closingPlayer = 1;
  state.players[0].actions = [action("defense")];
  assert.ok(!getTurnOptions(state, 0).some((item) => item.value === "action-use"));
  const next = playTurn(state, 0, "game-deck", decisions("discard", "2"));
  assert.equal(next.phase, "finished");
  assert.ok(next.result.scores.every(Number.isFinite));
  assert.ok(next.players.every((player) => player.board.every((card) => !card || !card.covered)));
});

test("remaining complete star lines are scored and cannot be skipped", () => {
  const state = fixture();
  state.closingPlayer = 1;
  for (const index of [0, 1, 2, 3]) {
    state.players[0].board[index] = { id: `star-${index}`, type: "star", covered: false };
  }
  state.players[0].board[4].covered = true;
  let scoreChoiceSeen = false;
  const result = playTurn(state, 0, "game-deck", (request) => {
    if (request.title === "Gezogene Spielkarte") return "discard";
    if (request.title === "Verdeckte Karte aufdecken") return "4";
    if (request.title === "Reihen und Spalten") return "done";
    if (request.title === "Sternbonus bei der Wertung") {
      scoreChoiceSeen = true;
      assert.ok(!request.options.some((option) => option.value === "done"));
      return "0";
    }
    return request.options[0].value;
  });
  assert.equal(scoreChoiceSeen, true);
  assert.equal(result.result.breakdown[0].starBonus, -15);
});

test("an empty action deck leaves the offer smaller when it cannot be refilled", () => {
  const state = fixture();
  state.actionDeck = [];
  state.actionDiscard = [action("defense")];
  const next = playTurn(state, 0, "action-draw", decisions("0"));
  assert.equal(next.actionOffer.length, 3);
  assert.equal(next.actionDiscard.length, 1);
});

test("an exhausted game deck cannot be drawn without mutating state", () => {
  const state = fixture();
  state.gameDeck = [];
  state.gameDiscard = [{ id: "top", type: "number", value: 2 }];
  const before = structuredClone(state);
  assert.ok(!getTurnOptions(state, 0).some((option) => option.value === "game-deck"));
  assert.throws(() => playTurn(state, 0, "game-deck", decisions()), /nicht verfügbar/);
  assert.deepEqual(state, before);
});

test("invalid decisions and wrong-player actions do not alter state", () => {
  const state = fixture();
  const before = structuredClone(state);
  assert.throws(() => playTurn(state, 1, "game-deck", decisions()), /nicht am Zug/);
  assert.throws(() => playTurn(state, 0, "game-deck", () => "bad"), /Ungültige Auswahl/);
  assert.deepEqual(state, before);
});
