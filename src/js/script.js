const myBoard = document.getElementById('myBoard');
const point_label = document.getElementById('point_label');
const cards = document.querySelectorAll('.card');
let player1;
let player2;

const all_card_with_amount = {
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

class Player {
    constructor(name, playerNumber) {
        this.name = name;
        this.card = [];
        this.points = 0;
        this.firstRound = true;
        this.playerNumber = playerNumber
    }
}

let cardStack = [];
let player1_cards = [];

window.onload = init();

function init() {
    create_card_stack();
    render_board();
    //count_points();
    create_player();
}


//*ANCHOR - Create Stack
function create_card_stack() {
    for (let key in all_card_with_amount) {
        for (let i = 0; i < all_card_with_amount[key]; i++) {
            cardStack.push(key);
        }
    }
    cardStack = shuffleArray(cardStack)
    console.log('cardStack', cardStack.length, cardStack);
}

//*ANCHOR - Shuffle
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

//*ANCHOR - Render 
function render_board() {
    let counter = 1;
    //* Create cards for player 1
    //TODO - Remove from cardStack
    for (let i = 1; i < cardStack.length + 1; i++) {
        if (counter <= 12) {
            const card = document.getElementById(`player1_card_${i}`)
            create_card(cardStack[i], card);
            player1_cards.push(cardStack[i])
            counter++;
        } else {
            break;
        }
    }
}


function create_card(_card_value, _card) {
    const data_status = _card.getAttribute('data-status');
    if (data_status === 'covered') {
        return
    } else {
        _card.classList.remove('covered')
    }

    let vallabel = document.createElement('p');
    let before_label = document.createElement('p');
    let after_label = document.createElement('p');
    before_label.innerHTML = _card_value;
    before_label.classList.add('before-label');
    after_label.classList.add('after-label');
    if (_card_value == 6 || _card_value == 9) {
        vallabel.classList.add('underlined')
        before_label.classList.add('underlined')
        after_label.classList.add('underlined')
    }
    after_label.innerHTML = _card_value;
    vallabel.innerHTML = _card_value;
    vallabel.classList.add('val-label')
    _card.appendChild(vallabel);
    _card.appendChild(before_label);
    _card.appendChild(after_label);
    _card.classList.add('card');
    if (_card_value > 0 && _card_value < 5) {
        _card.classList.add('green');
    } else if (_card_value >= 5 && _card_value < 9) {
        _card.classList.add('yellow');
    } else if (_card_value >= 9 && _card_value <= 12) {
        _card.classList.add('red');
    } else if (_card_value == 0) {
        _card.classList.add('lightblue');
    } else if (_card_value == -1) {
        _card.classList.add('blue');
    } else if (_card_value == -2) {
        _card.classList.add('blue');
    }
}

function count_points() {
    let points_player1 = 0;

    for (let i = 0; i < player1_cards.length; i++) {
        points_player1 = points_player1 += parseInt(player1_cards[i]);
    }

    point_label.innerHTML = `${points_player1} Punkte`;
}


//* Click Event for cards

cards.forEach((card) => {
    card.addEventListener('click', () => {
        console.log(card);
    })
})

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
    console.log(player1);
    console.log(player2);
}