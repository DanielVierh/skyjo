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

const myBoard = document.getElementById('myBoard');
const point_label = document.getElementById('point_label');
const player1Board = document.getElementById('p1Board');
const player2Board = document.getElementById('p2Board');

const action_modal = document.getElementById('action_modal');
const action_modal_card_from_stack = document.getElementById('action_modal_card_from_stack');
const info_modal = document.getElementById('info_modal');

const btn_take_from_stack = document.getElementById('btn_take_from_stack');
const btn_swap_with_ablage = document.getElementById('btn_swap_with_ablage');
const btn_swap_with_ablage_after_new = document.getElementById('btn_swap_with_ablage_after_new');
const btn_take_from_stack_after_new = document.getElementById('btn_take_from_stack_after_new');

let player1;
let player2;
let cardStack = [];
let ablageStack = [];           // Top-Karte liegt bei index 0
let currentPlayer = 'player1';
let ki_player = true;           // Spieler 2 ist KI
let current_card = null;        // momentan „in der Hand“ (vom Stapel oder Ablage)
let is_Swap = false;            // wenn true: nächster Card-Click tauscht mit current_card
let cards = [];                 // DOM-Kartenknoten; wird in init() gefüllt

// --- KI-Tempo/Visual-Config ---
const KI_DELAY = {
  think: 600,     // „Denken“-Pause
  draw: 700,      // Ziehen vom Stapel
  swap: 700,      // Tauschen
  reveal: 600,    // Aufdecken
  step: 400       // kleine Schritte zwischen UI-Updates
};

// ==== Klassen ====

class Player {
  constructor(name, playerNumber) {
    this.name = name;
    this.cards = []; // Array<Card>
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
    this.value = value;   // number
    this.place = place;   // 'stack' | 'hand' | 'board'
    this.covered = covered;
  }
}

// ==== Kartendefinition (Anzahl je Wert) ====

const all_cards = {
  '-2': 5,
  '-1': 10,
  '0': 15,
  '1': 10,
  '2': 10,
  '3': 10,
  '4': 10,
  '5': 10,
  '6': 10,
  '7': 10,
  '8': 10,
  '9': 10,
  '10': 10,
  '11': 10,
  '12': 10,
};

// ==== Utils ====

function wait(ms) {
  const disable_area = document.getElementById('disable_area');
  if (disable_area) {
    disable_area.classList.add('active');
    setTimeout(() => disable_area.classList.remove('active'), ms);
  }
  return new Promise(resolve => setTimeout(resolve, ms));
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// DOM-Helfer
function setSlotDiscovered(slotId) {
  const el = document.getElementById(slotId);
  if (!el) return;
  el.classList.remove('covered');
  el.setAttribute('data-status', 'discovered');
}
function setSlotCovered(slotId) {
  const el = document.getElementById(slotId);
  if (!el) return;
  el.classList.add('covered');
  el.setAttribute('data-status', 'covered');
}
function highlightSlot(slotId, on = true) {
  const el = document.getElementById(slotId);
  if (!el) return;
  if (on) el.classList.add('highlight');
  else el.classList.remove('highlight');
}
function clearCardUI(slotId) {
  const host = document.getElementById(slotId);
  if (!host) return;
  host.innerHTML = '';
  host.classList.remove('green', 'red', 'yellow', 'lightblue', 'blue');
}

// Ablage-Helpers (verhindern Fehlerquellen)
function topAblage() {
  return ablageStack[0] ?? null;
}
function putOnAblage(card) {
  // Setzt die übergebene Karte als neue Top-Karte und aktualisiert UI
  ablageStack = [card];
  updateAblageUI();
}
function takeFromAblage() {
  if (!ablageStack.length) return null;
  const c = ablageStack.splice(0, 1)[0];
  updateAblageUI(); // UI ggf. leeren
  return c;
}
function updateAblageUI() {
  const slotId = 'player_card_ablage';
  if (topAblage()) {
    discover_card(topAblage(), slotId, true);
  } else {
    // Ablage leer → UI leeren/verdecken
    clearCardUI(slotId);
    setSlotCovered(slotId);
  }
}

function getPlayerAndIndexFromSlot(elOrId) {
  const el = typeof elOrId === 'string' ? document.getElementById(elOrId) : elOrId;
  if (!el) return null;
  const player = el.getAttribute('data-player');
  const index = parseInt(el.getAttribute('data-index'));
  return { player, index, id: el.id, el };
}

// ==== Initialisierung ====

window.onload = init;

function init() {
  create_player();
  create_cards();
  give_player_cards(player1);
  give_player_cards(player2);

  // Event-Listener für Karten erst jetzt binden
  cards = Array.from(document.querySelectorAll('.card'));
  cards.forEach(cardEl => {
    cardEl.addEventListener('click', () => onCardClick(cardEl));
  });

  // Buttons
  btn_take_from_stack?.addEventListener('click', onTakeFromStack);
  btn_swap_with_ablage?.addEventListener('click', onTakeFromAblage);
  btn_swap_with_ablage_after_new?.addEventListener('click', onDiscardDrawnAndRevealOne);
  btn_take_from_stack_after_new?.addEventListener('click', onKeepDrawnAndSwap);

  // Start
  updateAblageUI(); // leer
  show_current_player();

  // DEBUG
  helper_show_cards(player1);
  helper_show_cards(player2);
  count_points();
}

// ==== Setup: Kartenstapel erzeugen & austeilen ====

function create_cards() {
  cardStack.length = 0;
  for (let key in all_cards) {
    const amount = all_cards[key];
    for (let i = 0; i < amount; i++) {
      const card = new Card(parseInt(key, 10), 'stack', true);
      cardStack.push(card);
    }
  }
  shuffleArray(cardStack);
}

function give_player_cards(_player) {
  for (let i = 0; i < 12; i++) {
    const card = cardStack.splice(0, 1)[0]; // immer oberste Karte
    card.place = 'board';
    card.covered = true;
    _player.cards.push(card);
  }
}

// ==== Anzeige / Rendering einer Karte im Slot ====

function discover_card(cardObj, slotId, ignoreStatus = false) {
  if (!cardObj) return;

  if (!cardObj.covered && !ignoreStatus) {
    // bereits aufgedeckt und nicht erzwungen → nichts tun
    return;
  }

  setSlotDiscovered(slotId);
  cardObj.covered = false;
  set_attributes_to_Card(slotId, cardObj.value);
}

function set_attributes_to_Card(card_id, card_value) {
  const host = document.getElementById(card_id);
  if (!host) return;

  host.innerHTML = '';

  const vallabel = document.createElement('p');
  const before_label = document.createElement('p');
  const after_label = document.createElement('p');

  before_label.textContent = card_value;
  after_label.textContent = card_value;
  vallabel.textContent = card_value;

  before_label.classList.add('before-label');
  after_label.classList.add('after-label');
  vallabel.classList.add('val-label');

  if (card_value === 6 || card_value === 9) {
    vallabel.classList.add('underlined');
    before_label.classList.add('underlined');
    after_label.classList.add('underlined');
  }

  host.appendChild(vallabel);
  host.appendChild(before_label);
  host.appendChild(after_label);
  host.classList.add('card');

  // Farben aktualisieren
  host.classList.remove('green', 'red', 'yellow', 'lightblue', 'blue');

  if (card_value > 0 && card_value < 5) {
    host.classList.add('green');
  } else if (card_value >= 5 && card_value < 9) {
    host.classList.add('yellow');
  } else if (card_value >= 9 && card_value <= 12) {
    host.classList.add('red');
  } else if (card_value === 0) {
    host.classList.add('lightblue');
  } else if (card_value < 0) {
    host.classList.add('blue');
  }
}

// ==== Punkte (Debug) ====

function count_points() {
  const sum = (pl) => pl.cards.reduce((acc, c) => acc + parseInt(c.value, 10), 0);
  const p1 = sum(player1);
  const p2 = sum(player2);
  console.log(`P1: ${p1} Punkte || P2: ${p2} Punkte`);
}

// ==== Spieler anlegen ====

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

// ==== Info-Modal ====

function show_info_modal(player, headline, text, countdown) {
  const modal_info_headline = document.getElementById('modal_info_headline');
  const modal_info_text = document.getElementById('modal_info_text');
  if (!info_modal || !modal_info_headline || !modal_info_text) return;

  info_modal.classList.add('active');

  // Rotation/Position für Spieler 1
  if (player === 'player1') {
    if (!info_modal.classList.contains('p1')) {
      info_modal.classList.add('p1');
    }
  } else {
    info_modal.classList.remove('p1');
  }

  modal_info_headline.textContent = headline;
  modal_info_text.textContent = text;

  setTimeout(() => info_modal.classList.remove('active'), countdown);
}

// ==== Rundensteuerung ====

async function show_current_player() {
  if (currentPlayer === 'player1') {
    player2Board?.classList.remove('active');
    player2Board?.classList.add('deactivated');
    player1Board?.classList.remove('deactivated');
    player1Board?.classList.add('active');

    if (player1.firstRound) {
      // Erste Runde Spieler 1: 2 Karten aufdecken
      show_info_modal('player1', '2 Karten aufdecken', 'Decke 2 deiner 12 Karten auf, indem du sie anklickst.', 4000);
      action_modal?.classList.remove('active');
    } else {
      // Normale Runde: Aktion wählen
      current_card = null;
      is_Swap = false;
      action_modal?.classList.add('active');
    }
  } else {
    player1Board?.classList.remove('active');
    player1Board?.classList.add('deactivated');
    player2Board?.classList.remove('deactivated');
    player2Board?.classList.add('active');

    if (player2.firstRound) {
      // Erste Runde KI: 2 Karten zufällig aufdecken
      show_info_modal('player2', 'Computer ist am Zug', 'Computer deckt 2 seiner Karten auf.', 3000);
      await wait(KI_DELAY.think);
      await ki_discover_two_first_round();

      // Wer beginnt? Höhere Summe beginnt.
      await wait(KI_DELAY.step);
      const p1sum = player1.first_two_cards.sum;
      const p2sum = player2.first_two_cards.sum;

      if (p1sum > p2sum) {
        currentPlayer = 'player1';
        show_info_modal('player1', 'Du beginnst', 'Du hattest die höhere Summe.', 1800);
      } else {
        currentPlayer = 'player2';
        show_info_modal('player2', 'Computer beginnt', 'Er hatte die höhere Summe.', 1800);
        await wait(KI_DELAY.think);
        await ki_take_turn();
        currentPlayer = 'player1';
      }
      show_current_player();
    } else {
      // Normale KI-Runde
      await wait(KI_DELAY.think);
      await ki_take_turn();
      currentPlayer = 'player1';
      show_current_player();
    }
  }
}

// ==== Click auf Karten (vom Spieler 1) ====

function onCardClick(cardEl) {
  const meta = getPlayerAndIndexFromSlot(cardEl);
  if (!meta) return;

  // Nur Eingaben von Spieler 1 zulassen, wenn Spieler 1 dran ist
  if (meta.player === 'player1' && currentPlayer !== 'player1') return;
  // KI-Karten sollen vom Spieler nicht anklickbar sein
  if (meta.player === 'player2') return;

  const { index, id } = meta;
  const pCard = player1.cards[index];

  if (player1.firstRound) {
    // Erste Runde: max. 2 Karten aufdecken
    if (player1.first_two_cards.discovered >= 2) return;

    discover_card(pCard, id);
    player1.first_two_cards.discovered++;
    player1.first_two_cards.sum += parseInt(pCard.value, 10);

    if (player1.first_two_cards.discovered === 2) {
      player1.firstRound = false;
      // Nächster ist Spieler 2 (erste Runde)
      setTimeout(() => {
        currentPlayer = 'player2';
        show_current_player();
      }, 250);
    }
    return;
  }

  // Nicht erste Runde:
  if (is_Swap && current_card) {
    // Spieler hat eine Karte in der Hand und klickt Ziel zum Tauschen
    const old = player1.cards[index];

    // Alte Karte auf Ablage
    putOnAblage(old);

    // Neue Karte auf Board
    player1.cards[index] = current_card;
    player1.cards[index].place = 'board';
    player1.cards[index].covered = false;

    discover_card(player1.cards[index], id, true);
    setSlotDiscovered(id);

    // Hand leeren, Swap-Phase beenden
    current_card = null;
    is_Swap = false;

    // Zugende
    setTimeout(() => {
      currentPlayer = 'player2';
      action_modal?.classList.remove('active');
      show_current_player();
    }, 250);
    return;
  }

  // Ansonsten: normales Aufdecken (z. B. nach „lege gezogene Karte ab, decke eine Karte auf“)
  if (pCard.covered) {
    discover_card(pCard, id);
    setSlotDiscovered(id);
    // Zugende
    setTimeout(() => {
      currentPlayer = 'player2';
      action_modal?.classList.remove('active');
      show_current_player();
    }, 250);
  }
}

// ==== Buttons – Spieleraktionen ====

function onTakeFromStack() {
  // Karte vom Nachziehstapel ziehen (und entfernen)
  if (cardStack.length === 0) return;
  current_card = cardStack.splice(0, 1)[0];
  current_card.place = 'hand';
  current_card.covered = false;

  // Aktionsauswahl schließen, Karte anzeigen
  action_modal?.classList.remove('active');
  action_modal_card_from_stack?.classList.add('active');

  // Karte im Vorschau-Modal rendern
  set_attributes_to_Card('card_action', current_card.value);
}

function onTakeFromAblage() {
  const taken = takeFromAblage();
  if (!taken) {
    show_info_modal('player1', 'Ablagestapel leer', 'Es liegt noch keine Karte auf dem Ablagestapel.', 2000);
    return;
  }
  current_card = taken;
  current_card.place = 'hand';
  current_card.covered = false;

  // Aktionsauswahl schließen
  action_modal?.classList.remove('active');

  // Spieler muss jetzt eine Board-Karte zum Tauschen wählen
  show_info_modal('player1', 'Karte wählen', 'Klicke die Karte an, mit der getauscht werden soll.', 3000);
  is_Swap = true;
}

function onDiscardDrawnAndRevealOne() {
  // Gezogenes Blatt sofort auf Ablage legen, dann eine verdeckte Karte aufdecken
  if (!current_card) return;
  putOnAblage(current_card);

  current_card = null;
  is_Swap = false;

  action_modal_card_from_stack?.classList.remove('active');
  show_info_modal('player1', 'Eine Karte aufdecken', 'Klicke auf eine deiner verdeckten Karten, um sie aufzudecken.', 4000);
}

function onKeepDrawnAndSwap() {
  // Gezogene Karte behalten → mit einer Board-Karte tauschen
  if (!current_card) return;
  action_modal_card_from_stack?.classList.remove('active');
  show_info_modal('player1', 'Karte wählen', 'Klicke auf die Karte, mit der getauscht werden soll.', 4000);
  is_Swap = true;
}

// ==== KI ====

async function ki_discover_two_first_round() {
  // Wähle 2 zufällige verdeckte KI-Karten
  const p2Nodes = Array.from(document.querySelectorAll('.player2-card'));
  const covered = p2Nodes.filter(n => n.getAttribute('data-status') === 'covered');

  const howMany = Math.min(2, covered.length);
  shuffleArray(covered);

  for (let i = 0; i < howMany; i++) {
    await wait(KI_DELAY.reveal);
    const node = covered[i];
    const meta = getPlayerAndIndexFromSlot(node);
    if (!meta) continue;
    const { index, id } = meta;
    const card = player2.cards[index];

    highlightSlot(id, true);
    await wait(KI_DELAY.step);
    discover_card(card, id, true);
    setSlotDiscovered(id);
    highlightSlot(id, false);

    player2.first_two_cards.discovered++;
    player2.first_two_cards.sum += parseInt(card.value, 10);
  }

  if (player2.first_two_cards.discovered >= 2) {
    player2.firstRound = false;
  }
}

async function ki_take_turn() {
  // Sanity: KI hält niemals eine Spieler-Handkarte
  current_card = null;
  is_Swap = false;

  // 1) Prüfe Ablagestapel: gibt es eine bessere Karte als eine bereits aufgedeckte?
  const ablage = topAblage();
  if (ablage) {
    const p2Nodes = Array.from(document.querySelectorAll('.player2-card'));
    let discovered = [];
    for (const n of p2Nodes) {
      if (n.getAttribute('data-status') === 'discovered') {
        const meta = getPlayerAndIndexFromSlot(n);
        if (!meta) continue;
        discovered.push({
          index: meta.index,
          id: meta.id,
          value: player2.cards[meta.index].value,
        });
      }
    }
    // Absteigend (höchste zuerst)
    discovered.sort((a, b) => b.value - a.value);

    for (const d of discovered) {
      if (ablage.value < d.value) {
        // Swap: Ablage → Board, alte Boardkarte → Ablage
        await wait(KI_DELAY.think);
        highlightSlot('player_card_ablage', true);
        await wait(KI_DELAY.step);
        const abFromTop = takeFromAblage(); // exakt 1 Karte runternehmen
        highlightSlot('player_card_ablage', false);

        if (!abFromTop) break; // (sollte nicht passieren)

        await wait(KI_DELAY.swap);
        highlightSlot(d.id, true);

        const oldCard = player2.cards[d.index];
        player2.cards[d.index] = abFromTop;
        player2.cards[d.index].place = 'board';
        player2.cards[d.index].covered = false;

        putOnAblage(oldCard); // alte Karte auf Ablage (setzt UI korrekt)
        discover_card(player2.cards[d.index], d.id, true);
        setSlotDiscovered(d.id);

        await wait(KI_DELAY.step);
        highlightSlot(d.id, false);
        return; // KI-Zug beendet
      }
    }
  }

  // 2) Sonst: Karte vom Nachziehstapel
  if (cardStack.length === 0) return;
  await wait(KI_DELAY.draw);
  const drawn = cardStack.splice(0, 1)[0];
  drawn.place = 'hand';
  drawn.covered = false;

  // Kurze „zeige gezogene Karte“-Info
  show_info_modal('player2', 'KI zieht eine Karte', `Wert: ${drawn.value}`, 1200);
  await wait(KI_DELAY.step);

  if (drawn.value <= 4) {
    // Versuche, gegen eine aufgedeckte, höhere Karte zu tauschen
    const p2Nodes = Array.from(document.querySelectorAll('.player2-card'));
    let discovered = [];
    for (const n of p2Nodes) {
      if (n.getAttribute('data-status') === 'discovered') {
        const meta = getPlayerAndIndexFromSlot(n);
        if (!meta) continue;
        discovered.push({
          index: meta.index,
          id: meta.id,
          value: player2.cards[meta.index].value,
        });
      }
    }
    // Höchste zuerst prüfen
    discovered.sort((a, b) => b.value - a.value);

    for (const d of discovered) {
      if (drawn.value < d.value) {
        await wait(KI_DELAY.swap);
        highlightSlot(d.id, true);

        // Tauschen: gezogene Karte auf Board, alte Karte auf Ablage
        const old = player2.cards[d.index];
        player2.cards[d.index] = drawn;
        player2.cards[d.index].place = 'board';
        player2.cards[d.index].covered = false;

        putOnAblage(old);
        discover_card(player2.cards[d.index], d.id, true);
        setSlotDiscovered(d.id);

        await wait(KI_DELAY.step);
        highlightSlot(d.id, false);
        return;
      }
    }

    // Keine bessere gefunden → ablegen & eine verdeckte Karte aufdecken
    await wait(KI_DELAY.swap);
    highlightSlot('player_card_ablage', true);
    putOnAblage(drawn);
    await wait(KI_DELAY.step);
    highlightSlot('player_card_ablage', false);

    await ki_reveal_random_covered_one();
    return;
  } else {
    // >=5 → auf Ablage und eine verdeckte Karte aufdecken
    await wait(KI_DELAY.swap);
    highlightSlot('player_card_ablage', true);
    putOnAblage(drawn);
    await wait(KI_DELAY.step);
    highlightSlot('player_card_ablage', false);

    await ki_reveal_random_covered_one();
    return;
  }
}

async function ki_reveal_random_covered_one() {
  const p2Nodes = Array.from(document.querySelectorAll('.player2-card'));
  const covered = p2Nodes.filter(n => n.getAttribute('data-status') === 'covered');
  if (covered.length === 0) return;
  const randIndex = Math.floor(Math.random() * covered.length);
  const node = covered[randIndex];
  const meta = getPlayerAndIndexFromSlot(node);
  if (!meta) return;
  const { index, id } = meta;

  await wait(KI_DELAY.reveal);
  highlightSlot(id, true);
  discover_card(player2.cards[index], id, true);
  setSlotDiscovered(id);
  await wait(KI_DELAY.step);
  highlightSlot(id, false);
}

// ==== Hilfsanzeige in Konsole ====

function helper_show_cards(player) {
  let output = '';
  for (let i = 0; i < player.cards.length; i++) {
    if (i > 0 && i % 4 === 0) output += '\n';
    output += ' | ' + player.cards[i].value;
  }
  console.log(`${player.name} (${player.playerNumber})\n${output}`);
}
