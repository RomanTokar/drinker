let new_game = null;
let isDown = 0;
let slider_left = 0;
let cache_slider = null;
let time_block = document.querySelector('.time');
let win_block = document.querySelector('.winner');
let player1_board = document.querySelector('.player1');
let player2_board = document.querySelector('.player2');
let start_button = document.querySelector('.start');
let stop_button = document.querySelector('.stop');
let wrapper_speed = document.querySelector('.wrapper_speed');
let slider = document.querySelector('.slider');
slider.style.left = '0px';

function create_array_cards() {
    let array_cards = [];
    for (let i = 2; i <= 15; i++) {
        if (i === 15) {
            for (let j = 0; j < 2; j++) {
                array_cards.push(i);
            }
        } else {
            for (let j = 0; j < 4; j++) {
                array_cards.push(i);
            }
        }
    }
    return array_cards;
}

function click_to_start() {
    let array_cards = create_array_cards();
    if (new_game == null) {
        new_game = new Game(array_cards);
        new_game.start();
    } else {
        new_game.timer_begin = 1;
        new_game.time();
        new_game.fight();
    }
}

function click_to_stop() {
    if (new_game !== null) {
        new_game.stop();
    }
}

function spread(not_spread_cards) {
    let player_cards = {
        player1: [],
        player2: []
    };
    while (not_spread_cards.length) {
        add_card_player(player_cards.player1, not_spread_cards);
        add_card_player(player_cards.player2, not_spread_cards);
    }
    return player_cards;
}

function add_card_player(player_cards, not_spread_cards) {
    let random_number;
    random_number = random_number_array(not_spread_cards);
    player_cards.push(not_spread_cards[random_number]);
    not_spread_cards.splice(random_number, 1);
}

function random_number_array(array_cards) {
    return Math.floor(Math.random() * array_cards.length);
}

function event_handler(target, offsetX) {
    if (target === wrapper_speed) {
        slider_left = offsetX - 102;
    } else if (target === slider) {
        slider_left = parseInt(slider.style.left, 10) - (12 - offsetX);
    } else {
        slider_left = offsetX - 12;
    }
    if ((slider_left >= 0) && (slider_left <= 156)) {
        slider.style.left = `${slider_left}px`;
    } else if (slider_left < 0) {
        slider.style.left = `0px`;
    } else {
        slider.style.left = '156px';
    }
}

start_button.addEventListener('click', click_to_start);
stop_button.addEventListener('click', click_to_stop);

wrapper_speed.addEventListener('mousedown', (event) => {
    isDown = 1;
    event_handler(event.target, event.offsetX);
});
wrapper_speed.addEventListener('mouseup', () => {
    isDown = 0;
    new_game.interval = (1999 * (156 - slider_left) / 156) + 1;
});
wrapper_speed.addEventListener('mousemove', (event) => {
    if (isDown) {
        if (!cache_slider) {
            setTimeout(() => {
                event_handler(cache_slider.target, cache_slider.offsetX);
                cache_slider = null;
            }, 20)
        }
        cache_slider = event;
    }
});


class Game {
    constructor(array) {
        this.array_cards = array;
        this.seconds = 0;
        this.number_fight = 0;
        this.cards_back = [];
        this.interval = 2000 * (156 - parseInt(slider.style.left, 10)) /156;
        this.player1 = null;
        this.player2 = null;
        this.timer_begin = 1;
    }

    start() {
        let player_cards = spread(this.array_cards);
        this.player1 = new Player(player_cards.player1, player1_board);
        this.player2 = new Player(player_cards.player2, player2_board);
        win_block.innerHTML = 'Game started';
        this.render();
        this.time();
        this.fight();
    }

    fight() {
        setTimeout(() => {
            if(this.timer_begin){
                let player1_card = this.player1.cards[0];
                let player2_card = this.player2.cards[0];
                let player1_cards_back = [player1_card, player2_card];
                let player2_cards_back = [player2_card, player1_card];
                if (player1_card === undefined) {
                    this.end('Player2');
                } else if (player2_card === undefined) {
                    this.end('Player1');
                } else if ((player1_card === 2 && player2_card === 15) || (player1_card === 6 && player2_card === 14)) {
                    this.player_win('1', '2', player1_cards_back);
                } else if ((player1_card === 15 && player2_card === 2) || (player1_card === 14 && player2_card === 6)) {
                    this.player_win('2', '1', player2_cards_back);
                } else if (player1_card > player2_card) {
                    this.player_win('1', '2', player1_cards_back);
                } else if (player1_card < player2_card) {
                    this.player_win('2', '1', player2_cards_back);
                } else {
                    this.cards_back.push(...player1_cards_back);
                    this.player1.cards.shift();
                    this.player2.cards.shift();
                    this.render();
                    this.fight();
                }
            }
        }, this.interval)
    }

    player_win(winner, loser, cards_back) {
        this.cards_back.push(...cards_back);
        this[`player${winner}`].win_fight(this.cards_back);
        this[`player${loser}`].lose_fight();
        this.cards_back = [];
        this.number_fight++;
        this.render();
        this.fight();
        win_block.innerHTML = `Player${winner} leading`;
    }

    render() {
        player1_board.innerHTML = this.player1.cards.join(' ');
        player2_board.innerHTML = this.player2.cards.join(' ');
    }

    time() {
        setTimeout(() => {
            if (this.timer_begin) {
                time_block.innerHTML = `${++this.seconds}`;
                this.time();
            }
        }, this.interval / 2)
    }

    stop() {
        this.timer_begin = 0;
    }

    end(winner) {
        this.timer_begin = 0;
        new_game = null;
        win_block.innerHTML = `${winner} won! (${this.number_fight})`;
    }
}

class Player {
    constructor(cards, board) {
        this.cards = cards;
        this.board = board;
    }

    win_fight(cards_back) {
        this.cards.shift();
        this.cards = [...this.cards, ...cards_back];
        this.board.style.borderColor = 'lawngreen';
    }

    lose_fight() {
        this.cards.shift();
        this.board.style.borderColor = 'red';
    }
}
