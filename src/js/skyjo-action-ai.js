import { getTurnOptions } from "./skyjo-action-turn.js";

export function chooseComputerTurn(state) {
  const options = getTurnOptions(state, 1);
  const available = new Set(options.map((option) => option.value));
  const own = state.players[1];
  if (available.has("action-use") && own.actions.length) return "action-use";
  const top = state.gameDiscard.at(-1);
  const visible = own.board.filter((card) => card && !card.covered && card.type === "number");
  if (available.has("game-discard") && top &&
      (top.type === "star" || top.value <= 2 || visible.some((card) => card.value >= top.value + 3))) {
    return "game-discard";
  }
  if (available.has("action-draw") && !own.actions.length &&
      own.board.filter((card) => card?.covered).length > 4 &&
      state.turnCounts[1] % 4 === 2) return "action-draw";
  if (available.has("game-deck")) return "game-deck";
  return options[0]?.value ?? null;
}

export function chooseComputerDecision(request, state) {
  const { title, options } = request;
  const find = (value) => options.find((option) => option.value === value);
  if (title.startsWith("Sternbonus")) {
    const covered = state.players[1].board.filter((card) => card?.covered).length;
    if (covered <= 2 && find("skip")) return "skip";
    return options.find((item) => item.label.includes("Doppelter"))?.value ?? options[0].value;
  }
  if (title === "Gezogene Spielkarte") {
    const swap = find("swap");
    const value = swap?.label.match(/^(-?\d+)/)?.[1];
    if (find("discard") && value !== undefined && Number(value) >= 7) return "discard";
    return "swap";
  }
  if (title === "Eine der drei Karten behalten?") {
    const cards = options.filter((option) => option.value !== "none");
    const star = cards.find((option) => option.label === "Stern");
    if (star) return star.value;
    cards.sort((a, b) => Number(a.label) - Number(b.label));
    if (find("none") && Number(cards[0].label) >= 7) return "none";
    return cards[0].value;
  }
  if (title === "Reihen und Spalten") {
    return options.find((option) => option.value !== "done" && !option.label.includes("(optional)"))?.value
      ?? find("done")?.value ?? options[0].value;
  }
  if (title === "Sternbonus bei der Wertung") {
    return options.find((option) => option.label.includes("-15"))?.value
      ?? options.find((option) => option.value !== "done")?.value ?? "done";
  }
  if (title.includes("am neuen Platz")) return find("open")?.value ?? options[0].value;
  if (title === "Aktionskarte wählen" || title === "Aktionskarte stehlen" || title === "Aktionskarte reaktivieren") {
    return options.find((option) => option.label.includes("Doppelter"))?.value ?? options[0].value;
  }
  if (find("play")) return "play";
  if (title.includes("Karte zum Tauschen") || title.includes("Erste Karte") || title.includes("Zweite Karte")) {
    const visible = options.flatMap((option) => {
      const match = option.label.match(/: (-?\d+)$/);
      return match ? [{ value: option.value, points: Number(match[1]) }] : [];
    }).sort((a, b) => b.points - a.points);
    if (visible[0]?.points >= 5) return visible[0].value;
    return options.find((option) => option.label.includes("verdeckt"))?.value
      ?? visible[0]?.value ?? options[0].value;
  }
  return options[0].value;
}
