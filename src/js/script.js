const myBoard = document.getElementById('myBoard');

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

window.onload = init();

function init() {
    create_card_stack();
    render_board();
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

    for(let i = 0; i < cardStack.length; i++) {
        if(counter <= 12) {
            const card = create_card(cardStack[i]);

            myBoard.appendChild(card);
            counter++;
        }else {
            break;
        }
    }
}


function create_card(_card_value) {
    let card = document.createElement('div');
    card.innerHTML = _card_value;
    card.classList.add('card');

    return card;
}