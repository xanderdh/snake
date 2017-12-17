'use strict';

var canvas = document.getElementById('canvas');
var score = document.getElementById('score');
var speed = document.getElementById('speed');
var pos = document.getElementById('pos');
var steps = document.getElementById('steps');
var leng = document.getElementById('leng');
var context = canvas.getContext('2d');
var random;
var res = [];

var mouse = {x:0, y:0};

window.onmousemove = function(e){
    mouse.x = e.pageX;
    mouse.y = e.pageY;
};

var game = {
    elSize: 10,
    fieldSizeW: 40,
    fieldSizeH: 50,
    stat: 'MENU',
    speed: 4,
    score: 0,
    result: getLocalStorage('score')
};

var snake = {
    color: '#000',
    x: -1,
    y: -1,
    l: 5,
    step: 0,
    tail: [{x: -1, y: -1}],
    dir: 'RIGHT',
    move: function () {
        clearPoint(snake.tail[0].x * game.elSize, snake.tail[0].y * game.elSize);
        draw(snake.x, snake.y, snake.color);
        if (this.dir === 'UP') this.y--;
        if (this.dir === 'BOT') this.y++;
        if (this.dir === 'LEFT') this.x--;
        if (this.dir === 'RIGHT') this.x++;
        this.tail.push({x: this.x, y: this.y});
        if (this.tail.length > this.l + 1) this.tail.shift();
        if (this.x === food.x && this.y === food.y) {
            if (food.bonus) {
                food.exist = false;
                food.bonus = false;
                game.score += 5;
                this.color = getRandomColor();
            } else if (food.len) {
                if (game.speed > 9) {
                    food.exist = false;
                    food.len = false;
                    snake.l += 5;
                    game.speed--;
                } else {
                    food.exist = false;
                    food.len = false;
                    snake.l += 5;
                }
            } else {
                this.l++; //eating
                game.score++;
                game.speed += 0.1;
                food.exist = false;
            }
        }
        this.step++;
    },
    destroy: function () {
        context.fillStyle = 'red';
        context.fillRect(0, 0, canvas.width, canvas.height);
        for (var ind = 0; ind < this.tail.length - 1; ind++) {
            clearPoint(this.tail[ind].x * game.elSize, this.tail[ind].y * game.elSize);
        }
    }
};


var food = {x: 0, y: 0, exist: false, bonus: false, len: false};


canvas.width = game.elSize * game.fieldSizeW;
canvas.height = game.elSize * game.fieldSizeH;


window.onkeydown = function (e) {
  if (game.stat === "PLAY") {
    if (e.keyCode === 38 && snake.dir !== "BOT") snake.dir = 'UP';
    if (e.keyCode === 40 && snake.dir !== "UP") snake.dir = 'BOT';
    if (e.keyCode === 37 && snake.dir !== 'RIGHT') snake.dir = 'LEFT';
    if (e.keyCode === 39 && snake.dir !== 'LEFT') snake.dir = 'RIGHT';
    if (e.keyCode === 37 || e.keyCode === 38 || e.keyCode === 39 || e.keyCode === 40) snake.move();
  }
};

var getRandom = function (min, max) {
    var rand = min - 0.5 + Math.random() * (max - min + 1);
    rand = Math.round(rand);
    return rand;
};

var getRandomColor = function () {
    return 'rgb(' + getRandom(0, 255) + ', ' + getRandom(0, 255) + ',' + getRandom(0, 255) + ')'
};

var getRandomStart = function () {

    random = getRandom(0, 3);
    snake.color = getRandomColor();
    if (random === 0) {
        snake.dir = "UP";
        snake.y = game.fieldSizeH + 1;
        snake.x = getRandom(0, game.fieldSizeW - 1);
    }
    if (random === 1) {
        snake.dir = "BOT";
        snake.y = -1;
        snake.x = getRandom(0, game.fieldSizeW - 1);
    }
    if (random === 2) {
        snake.dir = "LEFT";
        snake.y = getRandom(0, game.fieldSizeH - 1);
        snake.x = game.fieldSizeW + 1;
    }
    if (random === 3) {
        snake.dir = "RIGHT";
        snake.y = getRandom(0, game.fieldSizeH - 1);
        snake.x = -1;
    }
};

var draw = function (x, y, c) {
    context.fillStyle = c;
    context.fillRect(x * game.elSize, y * game.elSize, game.elSize, game.elSize);
};

var clearPoint = function (x, y) {
    context.clearRect(x, y, game.elSize, game.elSize);
};

var gameResult = function () {
    if (game.result === null) game.result = 0;
    game.result = game.result + ' ' + game.score;
    setLocalStorage('score', game.result);
};

var writeResult = function () {
    if (getLocalStorage('score')) {
        res = getLocalStorage('score').split(' ');
        for (var i = 0; i < res.length; i++) res[i] = +res[i];
        res.sort(function (a, b) {
            if (a < b) return 1;
            if (a > b) return -1;
        });
        if (res.length > 10) {
            res.pop();
            game.result = res.join(' ');
        }


        var td = document.getElementsByClassName('td');

        for (var i = 0; i < td.length; i++) {
            td[i].innerHTML = res[i] || '0';
        }
    }
};

var gameStop = function () {
    console.log('stop');
    game.stat = 'MENU';
    //snake.destroy();
    gameResult();
    writeResult();
};

var gameCrashChecker = function () {
    if (snake.step > 2) {
        if (snake.x >= game.fieldSizeW || snake.x < 0) gameStop();
        if (snake.y >= game.fieldSizeH || snake.y < 0) gameStop();
        for (var i = 0; i < snake.tail.length - 1; i++) {
            if (snake.x == snake.tail[i].x && snake.y == snake.tail[i].y) gameStop();
        }
    }
};

var foodGen = function () {
    var foodColor = '#000000';
    if (!food.exist) {
        var foodRandom = getRandom(0, 15);
        if (foodRandom === 1 || foodRandom === 5) {
            food.bonus = true;
            foodColor = '#00FF36';
            setTimeout(function () {
                if (food.bonus) {
                    food.bonus = false;
                    food.exist = false;
                    clearPoint(food.x * game.elSize, food.y * game.elSize);
                }
            }, 5000)
        }

        if (foodRandom === 10) {
            food.len = true;
            foodColor = '#cc0000';
        }

        food.x = getRandom(0, game.fieldSizeW - 1);
        food.y = getRandom(0, game.fieldSizeH - 1);


        for (var i = 0; i < snake.tail.length - 1; i++) {
            if (food.x == snake.tail[i].x && food.y == snake.tail[i].y) {
                console.warn('FOOD ON SNAKE');
                return;
            }
        }
        draw(food.x, food.y, foodColor);
        food.exist = true;
    }
};


var gameRestart = function () {
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    game.stat = 'PLAY';
    snake.step = 0;
    food.exist = false;
    game.score = 0;
    game.speed = 4;
    snake.l = 5;
    snake.tail = [{x: -1, y: -1}];
    getRandomStart();
};


function setLocalStorage(key, value, funcExceed) {
    try {
        if ('localStorage' in window && window['localStorage'] !== null) {
            try {
                localStorage.setItem(key, value);
                return true;
            } catch (e) {
                if (e == QUOTA_EXCEEDED_ERR) {
                    if (funcExceed != udefined && typeof funcExceed == 'function') funcExceed();
                    return false;
                }
            }
        } else {
            return false;
        }
    } catch (e) {
        return false;
    }
}

function getLocalStorage(key) {
    try {
        if ('localStorage' in window && window['localStorage'] !== null) {
            return localStorage.getItem(key);
        } else {
            return undefined;
        }
    } catch (e) {
        return undefined;
    }
}

function clearLocalStorage(key) {
    try {
        if ('localStorage' in window && window['localStorage'] !== null) {
            if (key == undefined) {
                localStorage.clear();
            } else {
                localStorage.removeItem(key);
            }
        } else {
            return undefined;
        }
    } catch (e) {
        return undefined;
    }
}


var menu = function () {
    context.clearRect(0, 0, game.fieldSizeW * game.elSize, game.fieldSizeH * game.elSize);
    context.fillStyle = '#ccc';
    context.fillRect(0, 0, game.fieldSizeW * game.elSize, game.fieldSizeH * game.elSize);
    context.fillStyle = '#0c0';
    context.fillRect(100, 100, game.fieldSizeW * game.elSize - 200, 30);

    //score
    if(game.score) {
        context.fillStyle = '#c00';
        context.font = '20px sans-serif';
        context.fillText('Your score: ' + game.score, game.fieldSizeW * game.elSize / 2, 160);
    }


    context.fillStyle = '#fff';
    context.font = '18px sans-serif';
    context.textAlign = 'center';
    context.fillText('Top score: ' + res[0], game.fieldSizeW * game.elSize / 2, 180);


    //button
    context.fillStyle = '#fff';
    if (mouse.x > 110 && mouse.x < game.fieldSizeW * game.elSize - 100 && mouse.y > 110 && mouse.y < 140) context.fillStyle = '#B45A4A';
    context.font = '24px sans-serif';
    context.textAlign = 'center';
    context.fillText('START', game.fieldSizeW * game.elSize / 2, 124);

    //click button
    window.onmouseup = function (e) {
        if (e.pageX > 110 && e.pageX < game.fieldSizeW * game.elSize - 100 && e.pageY > 110 && e.pageY < 140) {
            gameRestart();
            window.onmouseup = null;
        }
    };

};

var gameLoop = function () {

    if (game.stat === 'PLAY') {
        gameCrashChecker();
        snake.move();
        foodGen();
    }
    if (game.stat === 'MENU') {
        menu()
    }


    score.value = 'Score: ' + game.score;
    speed.value = 'Speed: ' + game.speed;
    pos.value = 'Position: x = ' + snake.x + ' y = ' + snake.y;
    steps.value = 'Step: ' + snake.step;
    leng.value = 'Length: ' + snake.l;

    setTimeout(function () {
        requestAnimationFrame(gameLoop);
    }, 1000 / game.speed)
};

writeResult();
getRandomStart();
gameLoop();
