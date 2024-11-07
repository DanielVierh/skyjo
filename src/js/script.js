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
 * 
 * 
 */

const myBoard = document.getElementById('myBoard');
const point_label = document.getElementById('point_label');
const cards = document.querySelectorAll('.card');
const player1Board = document.getElementById('p1Board');
const player2Board = document.getElementById('p2Board');
const action_modal = document.getElementById('action_modal');
const action_modal_card_from_stack = document.getElementById('action_modal_card_from_stack');
const info_modal = document.getElementById('info_modal');
const btn_take_from_stack = document.getElementById('btn_take_from_stack');
const btn_swap_with_ablage = document.getElementById('btn_swap_with_ablage');


let player1;
let player2;
let cardStack = [];
let ablageStack = [];
let currentPlayer = 'player1';
let action_Amount = 1;
let ki_player = true;


//*ANCHOR - Player Class

class Player {
    constructor(name, playerNumber) {
        this.name = name;
        this.cards = [];
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
        this.value = value;
        this.place = place;
        this.covered = covered;
    }
}

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


function wait(ms) {
    console.log('wait for', ms);
    
    //* add area to disable cards etc.
    const disable_area = document.getElementById('disable_area');
    disable_area.classList.add('active');

    setTimeout(() => {
        disable_area.classList.remove('active');
    }, ms);
    return new Promise(resolve => setTimeout(resolve, ms));
}



window.onload = init();

function init() {
    create_player();
    create_cards();
    give_player_cards(player1);
    give_player_cards(player2);
    show_current_player();


    //*DEBUG
    count_points();
}


//*ANCHOR - Create Stack
function create_cards() {
    for (let key in all_cards) {
        for (let i = 0; i < all_cards[key]; i++) {
            const card = new Card(key, 'stack', true)
            cardStack.push(card);
        }
    }
    cardStack = shuffleArray(cardStack)
}

//*ANCHOR - Shuffle
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

//*ANCHOR - Give 12 Cards to player
function give_player_cards(_player) {
    for (let i = 0; i < 12; i++) {
        const card = cardStack.splice(i, 1);
        _player.cards.push(card);
    }
}

//*ANCHOR - The actual visual discovery of the card
function discover_card(_card, _cardSlot, ignoreStatus = false) {
    const data_status = _card.covered;
    if (data_status === false && ignoreStatus === false) {
        return
    } else {
        try {
            document.getElementById(_cardSlot).classList.remove('covered');
        } catch (error) {
            console.log(error);
        }
    }


    set_attributes_to_Card(_cardSlot, _card.value);
}

function set_attributes_to_Card(card_id, card_value) {

    document.getElementById(card_id).innerHTML = ''
    let vallabel = document.createElement('p');
    let before_label = document.createElement('p');
    let after_label = document.createElement('p');
    before_label.innerHTML = card_value;
    before_label.classList.add('before-label');
    after_label.classList.add('after-label');
    if (card_value == 6 || card_value == 9) {
        vallabel.classList.add('underlined')
        before_label.classList.add('underlined')
        after_label.classList.add('underlined')
    }
    after_label.innerHTML = card_value;
    vallabel.innerHTML = card_value;
    vallabel.classList.add('val-label')
    document.getElementById(card_id).appendChild(vallabel);
    document.getElementById(card_id).appendChild(before_label);
    document.getElementById(card_id).appendChild(after_label);
    document.getElementById(card_id).classList.add('card');

    const card = document.getElementById(card_id);
    if (card_value > 0 && card_value < 5) {
        card.classList.add('green');
    } else if (card_value >= 5 && card_value < 9) {
        card.classList.add('yellow');
    } else if (card_value >= 9 && card_value <= 12) {
        card.classList.add('red');
    } else if (card_value == 0) {
        card.classList.add('lightblue');
    } else if (card_value == -1) {
        card.classList.add('blue');
    } else if (card_value == -2) {
        card.classList.add('blue');
    }
}

//* ANCHOR - Count Points Function

function count_points() {
    let points_player1 = 0;
    let points_player2 = 0;

    for (let i = 0; i < player1.cards.length; i++) {
        points_player1 = points_player1 += parseInt(player1.cards[i][0].value);
    }
    for (let i = 0; i < player2.cards.length; i++) {
        points_player2 = points_player2 += parseInt(player2.cards[i][0].value);
    }

    console.log(`P1: ${points_player1} Punkte || P2: ${points_player2} Punkte `);
}


//*ANCHOR - Click Event for cards

cards.forEach((card) => {
    card.addEventListener('click', () => {
        card_discover(card)
    })
})

function card_discover(card) {

    const card_slot_id = card.id;
    const card_index = card.getAttribute("data-index");
    const player = card.getAttribute("data-player");
    let player_card

    if (player === 'player1') {
        player_card = player1.cards[card_index][0];
        if (player1.firstRound && player1.first_two_cards.discovered <= 1) {
            player1.first_two_cards.discovered++;
            player1.first_two_cards.sum = player1.first_two_cards.sum += parseInt(player_card.value);
            if (player1.first_two_cards.discovered === 2) {
                player1.firstRound = false;
                setTimeout(() => {
                    currentPlayer = 'player2';
                    show_current_player();
                }, 200);
            }
        }
        discover_card(player_card, card_slot_id);
        player1.cards[card_index][0].covered = false;
        document.getElementById(card_slot_id).setAttribute('data-status', 'discovered')

    } else {
        player_card = player2.cards[card_index][0];
        if (player2.firstRound && player2.first_two_cards.discovered <= 1) {
            player2.first_two_cards.discovered++;
            player2.first_two_cards.sum = player2.first_two_cards.sum += parseInt(player_card.value);
            if (player2.first_two_cards.discovered === 2) {
                player2.firstRound = false;
                setTimeout(() => {
                    currentPlayer = 'player1';
                    show_current_player();
                }, 200);
            }
        }
        discover_card(player_card, card_slot_id);
        player2.cards[card_index][0].covered = false;
        document.getElementById(card_slot_id).setAttribute('data-status', 'discovered')
    }
}

//*ANCHOR - Create Player 

function create_player() {
    for (let i = 1; i <= 2; i++) {
        // const playername = window.prompt(`Name für Spieler ${i} eingeben:`)
        const playername = "Player"
        if (playername !== '') {
            if (i === 1) {
                player1 = new Player(playername, i);
            } else {
                player2 = new Player(playername, i);
            }
        }
    }
}



//*ANCHOR - Show current player
async function show_current_player() {
    if (currentPlayer === 'player1') {

        player2Board.classList.remove('active');
        player2Board.classList.add('deactivated');
        player1Board.classList.remove('deactivated');
        player1Board.classList.add('active');

        if (player1.firstRound === true) {
            //* First Round
            show_info_modal('player1', '2 Karten aufdecken', 'Decke 2 der 12 Karten vor dir auf, indem du sie anklickst.', 5000);
        } else {
            //* NOT first round
            await wait(5000);
            action_modal.classList.add('active');
        }

    } else {
        player1Board.classList.remove('active');
        player1Board.classList.add('deactivated');
        player2Board.classList.remove('deactivated');
        player2Board.classList.add('active');
        let moves = 1;

        if (player2.firstRound === true) {
            moves = 2;
            //* First Round
            show_info_modal('player1', '2 Karten aufdecken', 'Computer deckt 2 der 12 Karten auf.', 5000)

            if (ki_player) {
                //* First Round
                await wait(3000);
                //*Checks if card is covered or not
                //* Fill available cards into array
                //* Shuffle it and discoveres two cards

                const player2_cards = document.querySelectorAll('.player2-card');
                let available_cards = [];

                for (let i = 0; i < player2_cards.length; i++) {
                    const p2_card = player2_cards[i];
                    const card_status = p2_card.getAttribute('data-status');

                    if (card_status === 'covered') {
                        available_cards.push(p2_card);
                    }
                }
                available_cards = shuffleArray(available_cards);

                for (let i = 1; i <= moves; i++) {
                    await wait(1000);
                    //* Take and Remove random card
                    const randomCard = available_cards[Math.floor(Math.random() * available_cards.length)];
                    available_cards.splice(randomCard, 1);
                    //* Discover
                    card_discover(randomCard);
                }

                //* Decision, who starts
                await wait(1000);

                const sum_of_first_two_p1 = player1.first_two_cards.sum;
                const sum_of_first_two_p2 = player2.first_two_cards.sum;

                if (sum_of_first_two_p1 > sum_of_first_two_p2) {
                    show_info_modal('player1', 'Spieler 1 begint', '', 5000);
                    await wait(5000);
                    currentPlayer = 'player1';
                    show_current_player();
                } else {
                    show_info_modal('player1', 'Spieler 2 begint', '', 5000);
                    await wait(5000);
                    currentPlayer = 'player2';
                    show_current_player();
                }

            }
        } else {
            //* Not first Round

            //* Test card
            // ablageStack.push(new Card(1,'stack',false))
            await wait(2000);
            //*KI Move
            if (ki_player) {
                await wait(2000);
                //* get all discovered card indexes
                const player2_cards = document.querySelectorAll('.player2-card');
                let discovered_cards = [];
                let covered_cards = [];

                for (let i = 0; i < player2_cards.length; i++) {
                    const p2_card = player2_cards[i];
                    const card_status = p2_card.getAttribute('data-status');
                    const card_index = p2_card.getAttribute('data-index');

                    if (card_status === 'discovered') {
                        const discovered_card_with_index = {
                            card: player2.cards[card_index],
                            index: card_index
                        };
                        discovered_cards.push(discovered_card_with_index);

                    } else {
                        const covered_card_with_index = {
                            card: player2.cards[card_index],
                            index: card_index
                        };
                        covered_cards.push(covered_card_with_index);
                    }
                }

                let took_action = false;
                //* Check ablagestapel
                const card_on_ablage = ablageStack[0];

                if (card_on_ablage !== undefined) {
                    for (let i = 0; i < discovered_cards.length; i++) {
                        const card = discovered_cards[i].card[0];
                        const index = parseInt(discovered_cards[i].index);

                        //* Change ablagecard with card
                        if (parseInt(card_on_ablage.value) < parseInt(card.value)) {

                            const cardAblage_to_p2 = ablageStack.splice(0, 1);
                            const cardP2_to_ablage = player2.cards[index];

                            ablageStack.push(cardP2_to_ablage[0]);
                            player2.cards[index] = cardAblage_to_p2;

                            discover_card(ablageStack[0], 'player_card_ablage', true);
                            discover_card(player2.cards[index][0], `player2_card_${index}`, true)

                            took_action = true;
                            break;
                        }
                    }
                } else {
                    //TODO - delete else
                }

                //* Take card from stack

                if (took_action === false) {
                    const card_in_ki_hand = cardStack.splice(0, 1);

                    //* -if value <= 4 change with a hiegher number of ki board or with a random unvovered card 
                    if (card_in_ki_hand[0].value <= 4) {
                        for (let i = 0; i < discovered_cards.length; i++) {
                            const card = discovered_cards[i].card[0];
                            const index = parseInt(discovered_cards[i].index);

                            if (parseInt(card_in_ki_hand[0].value) < parseInt(card.value)) {

                                const cardInHand_to_P2 = card_in_ki_hand;
                                const cardP2_to_ablage = player2.cards[index];

                                ablageStack.push(cardP2_to_ablage[0]);
                                player2.cards[index] = cardInHand_to_P2;

                                discover_card(ablageStack[0], 'player_card_ablage', true);
                                discover_card(player2.cards[index][0], `player2_card_${index}`, true)

                                took_action = true;
                                break;
                            }
                        }

                    } else if (card_in_ki_hand[0].value >= 5) {
                        //TODO - check, if there is the same card discovered in a column, but over the value of 4

                        //* -if not, and if value >4 put card to ablage and turn one card from ki board
                        const cardInHand_to_P2 = card_in_ki_hand;
                        ablageStack.push(cardInHand_to_P2[0]);

                        const randomNumb = Math.random() * covered_cards.length;
                        const randomCard = covered_cards[randomNumb].card[0];
                        const randomCardIndex = covered_cards[randomNumb].index;

                        discover_card(ablageStack[0], 'player_card_ablage', true);
                        discover_card(randomCard, `player2_card_${randomCardIndex}`, true)
                    }

                    //* put card from ki board to ablage and discover one random card
                }
            }
        }
    }
}


//*ANCHOR - Info Modal
function show_info_modal(player, headline, text, countdown) {
    const modal_info_headline = document.getElementById('modal_info_headline');
    const modal_info_text = document.getElementById('modal_info_text');

    info_modal.classList.add('active');

    //* rotation class
    if (player === 'player1') {
        if (!info_modal.classList.contains('p1')) {
            info_modal.classList.add('p1');
        }
    } else {
        info_modal.classList.remove('p1');
    }

    modal_info_headline.innerHTML = headline;
    modal_info_text.innerHTML = text;

    setTimeout(() => {
        info_modal.classList.remove('active');
    }, countdown);

}


//* ANCHOR - Take card from stack
btn_take_from_stack.addEventListener('click', () => {
    //* Take card from stack
    const card_from_stack = cardStack[0];

    //* Hide Action Modal
    action_modal.classList.remove('active');
    //* Show Modal with card
    action_modal_card_from_stack.classList.add('active');

    set_attributes_to_Card('card_action', card_from_stack.value);

})

