const myBoard = document.getElementById('myBoard');
const point_label = document.getElementById('point_label');

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

let cardStack = [];
let player1_cards = [];

window.onload = init();

function init() {
    create_card_stack();
    render_board();
    count_points()
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
    for(let i = 0; i < cardStack.length; i++) {
        if(counter <= 12) {
            const card = create_card(cardStack[i]);
            player1_cards.push(cardStack[i])
            myBoard.appendChild(card);
            counter++;
        }else {
            break;
        }
    }
}


function create_card(_card_value) {
    let card = document.createElement('div');
    let vallabel = document.createElement('p');
    let before_label = document.createElement('p');
    let after_label = document.createElement('p');
    before_label.innerHTML = _card_value;
    before_label.classList.add('before-label');
    after_label.classList.add('after-label');
    if(_card_value == 6 || _card_value == 9) {
        vallabel.classList.add('underlined')
        before_label.classList.add('underlined')
        after_label.classList.add('underlined')
    }
    after_label.innerHTML = _card_value;
    vallabel.innerHTML = _card_value;
    vallabel.classList.add('val-label')
    card.appendChild(vallabel);
    card.appendChild(before_label);
    card.appendChild(after_label);
    card.classList.add('card');
    if(_card_value > 0 && _card_value < 5) {
        card.classList.add('green');
    }else if(_card_value >= 5 && _card_value < 9) {
        card.classList.add('yellow');
    }else if(_card_value >= 9 && _card_value <= 12) {
        card.classList.add('red');
    }else if(_card_value == 0) {
        card.classList.add('lightblue');
    }else if(_card_value == -1) {
        card.classList.add('blue');
    }else if(_card_value == -2) {
        card.classList.add('blue');
    }

    return card;
}

function count_points() {
    let points_player1 = 0;

    for(let i = 0; i < player1_cards.length; i++) {
        points_player1 = points_player1 += parseInt(player1_cards[i]);
    }

    point_label.innerHTML = `${points_player1} Punkte`;
}