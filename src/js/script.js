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
let current_card = null;        // „in der Hand“
let is_Swap = false;            // wenn true: nächster Click tauscht mit current_card
let cards = [];                 // DOM-Kartenknoten; wird in init() gefüllt
let gameEnded = false;
let lastTurn = false;
let closingPlayer = null;

// --- KI-Tempo/Visual-Config ---
const KI_DELAY = {
  think: 700,
  draw: 800,
  swap: 800,
  reveal: 650,
  step: 400
};

// ==== Klassen ====

class Player {
  constructor(name, playerNumber) {
    this.name = name;
    this.cards = []; // Array<Card | null>
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

// ==== Kartendefinition ====

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

function hasAllCardsOpen(player) {
    return player.cards.every(c => c === null || !c.covered);
}

function countPoints(player) {
    let points = 0;
    for (let i = 0; i < player.cards.length; i++) {
        if (player.cards[i]) {
            points += parseInt(player.cards[i].value);
        }
    }
    return points;
}

function checkGameEnd() {
    if (gameEnded) return;

    const current = currentPlayer === "player1" ? player1 : player2;
    const other = currentPlayer === "player1" ? player2 : player1;

    // Falls alle Karten offen beim aktuellen Spieler
    if (hasAllCardsOpen(current)) {
        if (!lastTurn) {
            // anderer Spieler bekommt noch einen Zug
            lastTurn = true;
            closingPlayer = current;
            console.log(`${current.name} hat zugemacht! ${other.name} darf noch einen Zug machen.`);
        } else {
            // Spiel beenden
            endGame();
        }
    }
}

function endGame() {
    gameEnded = true;

    let points1 = countPoints(player1);
    let points2 = countPoints(player2);

    // Sonderregel: Verdopplung falls Schließender nicht der Beste ist
    if (closingPlayer) {
        if (closingPlayer === player1 && points1 > points2) {
            points1 *= 2;
        } else if (closingPlayer === player2 && points2 > points1) {
            points2 *= 2;
        }
    }

    let winner = "Unentschieden";
    if (points1 < points2) winner = player1.name;
    else if (points2 < points1) winner = player2.name;

    alert(`🎉 Spiel beendet!\n\n${player1.name}: ${points1} Punkte\n${player2.name}: ${points2} Punkte\n\n➡️ Gewinner: ${winner}`);
}

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
function setSlotRemoved(slotId) {
  const el = document.getElementById(slotId);
  if (!el) return;
  el.classList.add('removed');
  el.setAttribute('data-status', 'removed');
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

// Finde Board-Slot-Element per Spieler/Index (unterstützt zwei ID-Schemata)
function getBoardSlotElement(playerNumber, index) {
  const id1 = `player${playerNumber}_card_${index}`;
  let el = document.getElementById(id1);
  if (el) return el;
  const id2 = `p${playerNumber}_card_${index}`; // Fallback
  return document.getElementById(id2);
}
// Liefert die ID, wenn Element existiert
function getBoardSlotId(playerNumber, index) {
  const el = getBoardSlotElement(playerNumber, index);
  return el ? el.id : null;
}

// Ablage-Helpers (verhindern Fehlerquellen)
function topAblage() {
  return ablageStack[0] ?? null;
}
function putOnAblage(card) {
  ablageStack = [card];
  updateAblageUI();
}
function takeFromAblage() {
  if (!ablageStack.length) return null;
  const c = ablageStack.splice(0, 1)[0];
  updateAblageUI();
  return c;
}
function updateAblageUI() {
  const slotId = 'player_card_ablage';
  const top = topAblage();
  if (top) {
    discover_card(top, slotId, true);
  } else {
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
    const card = cardStack.splice(0, 1)[0]; // oberste Karte
    card.place = 'board';
    card.covered = true;
    _player.cards.push(card);
  }
}

// ==== Anzeige / Rendering einer Karte im Slot ====

function discover_card(cardObj, slotId, ignoreStatus = false) {
  if (!cardObj) return;

  if (!cardObj.covered && !ignoreStatus) {
    return;
  }

  setSlotDiscovered(slotId);
  cardObj.covered = false;
  set_attributes_to_Card(slotId, cardObj.value);

  // 👉 Nach jedem Aufdecken: Triple-Check für den betroffenen Spieler
  // Nur Board-Slots prüfen (nicht Ablage)
  const m = /^player([12])_card_(\d+)$/.exec(slotId) || /^p([12])_card_(\d+)$/.exec(slotId);
  if (m) {
    const pnum = parseInt(m[1], 10);
    const player = (pnum === 1) ? player1 : player2;
    check_and_remove_vertical_triples(player);
  }
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
  const sum = (pl) => pl.cards.reduce((acc, c) => acc + (c ? parseInt(c.value, 10) : 0), 0);
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
      show_info_modal('player1', '2 Karten aufdecken', 'Decke 2 deiner 12 Karten auf, indem du sie anklickst.', 4000);
      action_modal?.classList.remove('active');
    } else {
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
      show_info_modal('player2', 'Computer ist am Zug', 'Computer deckt 2 seiner Karten auf.', 3000);
      await wait(KI_DELAY.think);
      await ki_discover_two_first_round();

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

  // Nur wenn Spieler 1 dran ist
  if (meta.player === 'player1' && currentPlayer !== 'player1') return;
  if (meta.player === 'player2') return;

  const { index, id } = meta;
  const pCard = player1.cards[index];

  if (!pCard && !is_Swap) return; // Slot entfernt

  if (player1.firstRound) {
    if (player1.first_two_cards.discovered >= 2) return;
    discover_card(pCard, id);
    player1.first_two_cards.discovered++;
    player1.first_two_cards.sum += parseInt(pCard.value, 10);

    if (player1.first_two_cards.discovered === 2) {
      player1.firstRound = false;
      setTimeout(() => {
        currentPlayer = 'player2';
        show_current_player();
      }, 250);
    }
    return;
  }

  if (is_Swap && current_card) {
    const old = player1.cards[index];
    if (old) putOnAblage(old);

    player1.cards[index] = current_card;
    player1.cards[index].place = 'board';
    player1.cards[index].covered = false;

    discover_card(player1.cards[index], id, true);
    setSlotDiscovered(id);

    current_card = null;
    is_Swap = false;

    setTimeout(() => {
      currentPlayer = 'player2';
      action_modal?.classList.remove('active');
      show_current_player();
    }, 250);
    return;
  }

  if (pCard && pCard.covered) {
    discover_card(pCard, id);
    setSlotDiscovered(id);
    setTimeout(() => {
      currentPlayer = 'player2';
      action_modal?.classList.remove('active');
      show_current_player();
    }, 250);
  }
}

// ==== Buttons – Spieleraktionen ====

function onTakeFromStack() {
  if (cardStack.length === 0) return;
  current_card = cardStack.splice(0, 1)[0];
  current_card.place = 'hand';
  current_card.covered = false;

  action_modal?.classList.remove('active');
  action_modal_card_from_stack?.classList.add('active');

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

  action_modal?.classList.remove('active');
  show_info_modal('player1', 'Karte wählen', 'Klicke die Karte an, mit der getauscht werden soll.', 3000);
  is_Swap = true;
}

function onDiscardDrawnAndRevealOne() {
  if (!current_card) return;
  putOnAblage(current_card);

  current_card = null;
  is_Swap = false;

  action_modal_card_from_stack?.classList.remove('active');
  show_info_modal('player1', 'Eine Karte aufdecken', 'Klicke auf eine deiner verdeckten Karten, um sie aufzudecken.', 4000);
}

function onKeepDrawnAndSwap() {
  if (!current_card) return;
  action_modal_card_from_stack?.classList.remove('active');
  show_info_modal('player1', 'Karte wählen', 'Klicke auf die Karte, mit der getauscht werden soll.', 4000);
  is_Swap = true;
}

// ==== KI ====

async function ki_discover_two_first_round() {
  const p2Nodes = Array.from(document.querySelectorAll('.player2-card'));
  const covered = p2Nodes.filter(n => n.getAttribute('data-status') === 'covered');

  const howMany = Math.min(2, covered.length);
  shuffleArray(covered);

  for (let i = 0; i < howMany; i++) {
    await wait(KI_DELAY.reveal);
    const node = covered[i];
    const meta = getPlayerAndIndexFromSlot(node);
    if (!meta) continue;
    const { index } = meta;

    // null-Schutz (entfernte Slots überspringen)
    const slotId = getBoardSlotId(2, index);
    if (!slotId) continue;
    const card = player2.cards[index];
    if (!card) continue;

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
  current_card = null;
  is_Swap = false;

  // 1) Ablage nutzen?
  const ablage = topAblage();
  if (ablage) {
    const p2Nodes = Array.from(document.querySelectorAll('.player2-card'));
    let discovered = [];
    for (const n of p2Nodes) {
      if (n.getAttribute('data-status') === 'discovered') {
        const meta = getPlayerAndIndexFromSlot(n);
        if (!meta) continue;
        const card = player2.cards[meta.index];
        if (!card) continue; // entfernte Slots überspringen
        discovered.push({
          index: meta.index,
          value: card.value,
        });
      }
    }
    discovered.sort((a, b) => b.value - a.value);

    for (const d of discovered) {
      if (ablage.value < d.value) {
        await wait(KI_DELAY.think);
        const boardSlotId = getBoardSlotId(2, d.index);
        if (!boardSlotId) break;

        highlightSlot('player_card_ablage', true);
        await wait(KI_DELAY.step);
        const abFromTop = takeFromAblage();
        highlightSlot('player_card_ablage', false);
        if (!abFromTop) break;

        await wait(KI_DELAY.swap);
        highlightSlot(boardSlotId, true);

        const oldCard = player2.cards[d.index];
        player2.cards[d.index] = abFromTop;
        player2.cards[d.index].place = 'board';
        player2.cards[d.index].covered = false;

        putOnAblage(oldCard);
        discover_card(player2.cards[d.index], boardSlotId, true);
        setSlotDiscovered(boardSlotId);

        await wait(KI_DELAY.step);
        highlightSlot(boardSlotId, false);
        return;
      }
    }
  }

  // 2) Ziehen
  if (cardStack.length === 0) return;
  await wait(KI_DELAY.draw);
  const drawn = cardStack.splice(0, 1)[0];
  drawn.place = 'hand';
  drawn.covered = false;

  show_info_modal('player2', 'KI zieht eine Karte', `Wert: ${drawn.value}`, 1200);
  await wait(KI_DELAY.step);

  if (drawn.value <= 4) {
    const p2Nodes = Array.from(document.querySelectorAll('.player2-card'));
    let discovered = [];
    for (const n of p2Nodes) {
      if (n.getAttribute('data-status') === 'discovered') {
        const meta = getPlayerAndIndexFromSlot(n);
        if (!meta) continue;
        const card = player2.cards[meta.index];
        if (!card) continue;
        discovered.push({
          index: meta.index,
          value: card.value,
        });
      }
    }
    discovered.sort((a, b) => b.value - a.value);

    for (const d of discovered) {
      if (drawn.value < d.value) {
        await wait(KI_DELAY.swap);
        const boardSlotId = getBoardSlotId(2, d.index);
        if (!boardSlotId) break;
        highlightSlot(boardSlotId, true);

        const old = player2.cards[d.index];
        player2.cards[d.index] = drawn;
        player2.cards[d.index].place = 'board';
        player2.cards[d.index].covered = false;

        putOnAblage(old);
        discover_card(player2.cards[d.index], boardSlotId, true);
        setSlotDiscovered(boardSlotId);

        await wait(KI_DELAY.step);
        highlightSlot(boardSlotId, false);
        return;
      }
    }

    // keine sinnvolle Verbesserung → ablegen & verdeckte aufdecken
    await wait(KI_DELAY.swap);
    highlightSlot('player_card_ablage', true);
    putOnAblage(drawn);
    await wait(KI_DELAY.step);
    highlightSlot('player_card_ablage', false);

    await ki_reveal_random_covered_one();
    return;
  } else {
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
  const node = covered[Math.floor(Math.random() * covered.length)];
  const meta = getPlayerAndIndexFromSlot(node);
  if (!meta) return;
  const { index } = meta;

  const slotId = getBoardSlotId(2, index);
  if (!slotId) return;
  const card = player2.cards[index];
  if (!card) return;

  await wait(KI_DELAY.reveal);
  highlightSlot(slotId, true);
  discover_card(card, slotId, true);
  setSlotDiscovered(slotId);
  await wait(KI_DELAY.step);
  highlightSlot(slotId, false);
}

// ==== Vertikal-Triple-Check & Entfernen ====

function check_and_remove_vertical_triples(player) {
  // Spalten-Indexgruppen
  const columns = [
    [0, 4, 8],
    [1, 5, 9],
    [2, 6, 10],
    [3, 7, 11]
  ];

  for (const col of columns) {
    const c0 = player.cards[col[0]];
    const c1 = player.cards[col[1]];
    const c2 = player.cards[col[2]];

    // Bedingung: alle existieren, alle aufgedeckt, gleicher Wert
    if (
      c0 && c1 && c2 &&
      !c0.covered && !c1.covered && !c2.covered &&
      c0.value === c1.value && c1.value === c2.value
    ) {
      console.log(`🔥 Triple gefunden bei Spieler ${player.name}: Wert ${c0.value}`);

      // Karten entfernen (nullen) und UI leeren (ID-Schema tolerant)
      for (const idx of col) {
        player.cards[idx] = null;

        const slotId = getBoardSlotId(player.playerNumber, idx);
        if (!slotId) continue; // kein DOM-Element gefunden → weiter
        const el = document.getElementById(slotId);
        if (!el) continue;

        el.innerHTML = '';
        setSlotRemoved(slotId);
        // Optional: eine visuelle Info (z. B. „entfernt“)
        // el.textContent = ''; // bewusst leer gelassen
      }

      // Punkte neu berechnen (optional)
      count_points();
    }
  }
}

// ==== Hilfsanzeige in Konsole ====

function helper_show_cards(player) {
  let output = '';
  for (let i = 0; i < player.cards.length; i++) {
    if (i > 0 && i % 4 === 0) output += '\n';
    output += ' | ' + (player.cards[i] ? player.cards[i].value : '∅');
  }
  console.log(`${player.name} (${player.playerNumber})\n${output}`);
}

// ==== Dummy-/Kompatibilitätsfunktionen, falls dein Code sie aufruft ====

/**
 * swap_card – universell:
 *  - Variante A: swap_card(playerObj, boardIndex, newCard)
 *  - Variante B (verhindert Fehler, macht aber nichts Sinnvolles): swap_card(a, b)
 */
function swap_card(a, b, c) {
  if (arguments.length === 3) {
    const player = a, boardIndex = b, newCard = c;
    const old = player.cards[boardIndex];
    if (old) putOnAblage(old);
    player.cards[boardIndex] = newCard;
    player.cards[boardIndex].place = 'board';
    player.cards[boardIndex].covered = false;

    const slotId = getBoardSlotId(player.playerNumber, boardIndex);
    if (slotId) {
      discover_card(player.cards[boardIndex], slotId, true);
      setSlotDiscovered(slotId);
    }
    return;
  }
  // 2-Argumente: nichts tun, aber Fehler vermeiden
  console.warn('swap_card(a,b) aufgerufen – erwartetes Muster ist swap_card(player, index, newCard). Aufruf ignoriert.');
}

/**
 * end_turn – falls extern aufgerufen
 */
function end_turn() {
  current_player = (currentPlayer === 'player1') ? 'player2' : 'player1';
  show_current_player();
  checkGameEnd();
}
