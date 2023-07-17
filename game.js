// variables

// canvas element we will be drawing on
const canvas = document.getElementById("canvas");
// set width of the canvas to the available width
canvas.width = window.innerWidth;
// set height of the canvas to the availabe height
canvas.height = window.innerHeight;
// context used to draw on the canvas
const ctx = canvas.getContext("2d");
// radius of the ball object
const ballRadius = 10;
// used to keep track of the x position of a ball
let x = canvas.width - ballRadius;
// starting x position of a ball
const ballSpawnX = canvas.width-ballRadius;
// minimum possible y position of a ball
const yBallMin = 50 + ballRadius;
// maximum possible y position of a ball
const yBallMax = canvas.height-ballRadius;
// minimum position of the player
const yMin = 50;
// array used to store all current balls
let myBalls = [];
// add a starting ball
addBall(generateRandomY());
// initial velocity of a ball
let dx = -5;
// object representing the player's height and width
const player = {
    height: 75,
    width: 10
};
// player's y spawn position, in the middle of the y axis
const playerSpawnY = (canvas.height - player.height) / 2;
// y position of the player
player.yPos = playerSpawnY;
// keeps track of user input for the up button/key
let upPressed = false;
// keeps track of user input for the down button/key
let downPressed = false;
// keeps track of the current score
let score = 0;
// keeps track of the current level score, used for increasing level
let levelScore = 0;
// keeps track of current level
let level = 1;
// set localStorage
const localStorage = window.localStorage;
// set initial hiscore if not defined
if (localStorage.hiscore === undefined) {
    localStorage.hiscore = '0';
}
if (localStorage.oldHiscore === undefined) {
    localStorage.oldHiscore = '0';
}
// keeps track of the game state to determine what to render to the canvas
// potential states:
// start - initial starting screen with instructions on how to play
// play - screen where the gmae is actually played
// end - screen showing game over, if a new hiscore was reached, and to play again
let gameState = 'start';
// variables used to lock fps at 60
let msPrev = window.performance.now();
const fps = 60;
const msPerFrame = 1000 / fps;

// event listeners

// listen for a keydown
document.addEventListener("keydown", keyDownHandler, false);
// listen for a keyup
document.addEventListener("keyup", keyUpHandler, false);
// listen for a mousedown
document.addEventListener("mousedown", mouseStartHandler, false);
// listen for a touchstart
document.addEventListener("touchstart", mouseStartHandler, false);
// listen for a mouseup
document.addEventListener("mouseup", mouseEndHandler, false);
// listen for a touchend
document.addEventListener("touchend", mouseEndHandler, false);

// observer for window resizing
const observer = new ResizeObserver((entries) => {
    // reset canvas width/height when window is resized
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
observer.observe(canvas);

// event handlers

// handle keydown event
function keyDownHandler(e) {
    // if the current state is play
    if (gameState === 'play') {
        // if the user is pressing the up arrow
        if (e.code  == "ArrowUp") {
            // mark it as pressed
            upPressed = true;
        }
        // if the user is pressing the down arrow
        else if (e.code == 'ArrowDown') {
            // mark it as pressed
            downPressed = true;
        }
        // prevent default so user doesn't scroll down the page
        e.preventDefault();
    }
}
// handle keyup event
function keyUpHandler(e) {
    // if the current state is play
    if (gameState === 'play') {
        // if the user is releasing the up arrow
        if (e.code == 'ArrowUp') {
            // mark it as not pressed
            upPressed = false;
        }
        // if the user is releasing the down arrow
        else if (e.code == 'ArrowDown') {
            // mark it as not pressed
            downPressed = false;
        }
        // prevent default so user doesn't scroll down the page
        e.preventDefault();
    }
}
// handle mousestart event
function mouseStartHandler(e) {
    // get x and y coordinates of the mouse/touch location
    let relativeX;
    let relativeY;
    const canvasWidth = canvas.offsetWidth;
    if (e.type === 'touchstart') {
        relativeX = e.changedTouches[0].clientX + canvas.offsetLeft;
        relativeY = e.changedTouches[0].clientY + canvas.offsetTop;
    } else {
        relativeX = e.clientX + canvas.offsetLeft;
        relativeY = e.clientY + canvas.offsetTop;
    }

    // if the current state is start
    if (gameState === 'start') {
        // if user clicked/touched the play button
        if( (relativeX < (canvas.width/2)+30 && relativeX > (canvas.width/2)-30)
        && (relativeY < 510 && relativeY > 450) ) {
            // start a new game
            gameState = 'play';
        }
    // if the current state is play
    } else if (gameState === 'play') {
        // if user clicked/touched the down button
        if((relativeX < canvasWidth && relativeX > canvasWidth-50)
        && (relativeY < canvas.height && relativeY > canvas.height-50)) {
            // mark it as pressed
            downPressed = true;
        }
        // if the user clicked/touched the up button
        if((relativeX < canvasWidth && relativeX > canvasWidth-50)
        && (relativeY < canvas.height-60 && relativeY > canvas.height-110)) {
            // mark it as pressed
            upPressed = true;
        }
        // prevent default so users don't have unexpected situations
        e.preventDefault();
    } else if (gameState === 'end') {
        // if user clicked/touched the play again button
        if( (relativeX < (canvasWidth/2)+50 && relativeX > (canvasWidth/2)-50)
        && (relativeY < 400 && relativeY > 300) ) {
            // start a new game
            score = 0;
            level = 1;
            levelScore= 0;
            myBalls = [];
            x = ballSpawnX;
            addBall(generateRandomY());
            dx = -5;
            player.yPos = playerSpawnY;
            downPressed = false;
            upPressed = false;
            gameState = 'play';
        }
        // if user clicked/touched the reset button
        if( (relativeX < (canvasWidth/2)+30 && relativeX > (canvasWidth/2)-30)
        && (relativeY < 560 && relativeY > 500) ) {
            localStorage.hiscore = '0';
        }
        e.preventDefault();
    }
}
// handle mouseend event
function mouseEndHandler(e) {
    // if the current state is play
    if (gameState === 'play') {
        // mark buttons as no longer being pressed
        downPressed = false;
        upPressed = false;
        // prevent default so users don't have unexpected situations
        e.preventDefault();
    }
}

// generate a random y value between the minimum and maximum play area
function generateRandomY() {
    return Math.floor(Math.random() * (yBallMax - yBallMin + 1) + yBallMin)
}
// checks to see if the passed in value can be added to the current list of balls.
// value is valid if there is still a large enough gap for the player to go through.
function addBall(yToAdd) {
    // if the array is emmpty
    if (myBalls.length < 1) {
        // add the ball to the array
        myBalls.push(yToAdd);
    } else {
        // keep track of largest gap between balls/walls
        let wiggleRoom = 0;
        // copy the current array of balls
        let sortedBalls = myBalls.slice();
        // add the maximum possible y value to the array
        sortedBalls.push(yBallMax);
        // add the minimum possible y value to the array
        sortedBalls.unshift(yBallMin);
        // add the potential new ball to the array
        sortedBalls.push(yToAdd);
        // sort the array so we can go in order of y positoin
        sortedBalls.sort(function(a, b){return a - b});
        // keey track of the previous ball in the array
        let previousBall = sortedBalls[0];
        // iterate through all balls, starting with the second
        for (let i = 1; i < sortedBalls.length; i++) {
            // find the difference in y value between the current ball and previous
            const currentDiff = Math.abs(sortedBalls[i] - previousBall);
            // if the current difference is larger than the current largest gap
            if (currentDiff > wiggleRoom) {
                // make the current difference the largest gap
                wiggleRoom = currentDiff;
            }
            // make the current ball the previous ball for the next iteration
            previousBall = sortedBalls[i];
        }
        // after we've gone through every ball, check if the largest gap is
        // more than the player height, so we always have room to dodge
        if (wiggleRoom > player.height) {
            // if we have room, add the ball to the array
            myBalls.push(yToAdd);
        } else {
            // if we don't have enough room, try again
            addBall(generateRandomY());
        }
    }
}

// drawing helpers

// draws all balls
function drawBalls() {
    for (let i = 0; i < myBalls.length; i++) {
        ctx.beginPath();
        ctx.arc(x, myBalls[i], ballRadius, 0, Math.PI*2);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.closePath();
    }
}
// draws the player
function drawPlayer() {
    ctx.beginPath();
    ctx.rect(0, player.yPos, player.width, player.height);
    ctx.fillStyle = "LightSeaGreen";
    ctx.fill();
    ctx.closePath();
}
// draws the top border
function drawTopBorder() {
    ctx.beginPath();
    ctx.font = "16px Arial";
    ctx.rect(0, 0, canvas.width, 50);
    ctx.fillStyle = "SteelBlue";
    ctx.fill();
    ctx.closePath();
}
// draws the current score and hiscore
function drawScores() {
    // draw hiscore
    ctx.font = "16px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "start";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(`Hiscore: ${localStorage.hiscore}`, 8, 20);
    // draw current score
    ctx.fillText(`Score: ${score}`, 8, 43);
}
// draws the current level
function drawLevel() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`Level ${level}`, canvas.width-50, 25);
}
// draws the border text
function drawTopBorderText() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText('Welcome to Progball!', canvas.width/2, 25);
}
// draws the up and down buttons
function drawUpDownButtons() {
    // Down button
    ctx.beginPath();
    ctx.rect(canvas.width-50, canvas.height-50, 50, 50);
    ctx.fillStyle = "SteelBlue";
    ctx.fill();
    ctx.closePath();
    // Down button text
    ctx.beginPath();
    ctx.font = "16px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Down", canvas.width-25, canvas.height-25);
    ctx.closePath();
    // Up button
    ctx.beginPath();
    ctx.rect(canvas.width-50, canvas.height-110, 50, 50);
    ctx.fillStyle = "SteelBlue";
    ctx.fill();
    ctx.closePath();
    // Up button text
    ctx.beginPath();
    ctx.font = "16px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Up", canvas.width-25, canvas.height-85);
    ctx.closePath();
}
// draws the background
function drawBackground() {
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "SteelBlue";
    ctx.fill();
    ctx.closePath();
}
// draws the introduction
function drawIntroduction() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // header text
    ctx.fillText("Welcome to Progball!", canvas.width/2, 35);
    // description
    ctx.textAlign = "start";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("Description:", 0, 80);
    ctx.fillText("Progball is a Souls-like bullet-hell dodging sim.", 0, 110);
    ctx.fillText("Progressively more balls spawn.", 0, 140);
    ctx.fillText("Progressively balls get faster.", 0, 170);
    ctx.fillText("Score corresponds to number of balls dodged.", 0, 200);
    // controls
    ctx.fillText("Controls:", 0, 280);
    ctx.fillText("Press the up/down arrow keys to move up/down.", 0, 310);
    ctx.fillText("Or press the on-screen up/down buttons.", 0, 340);
    ctx.fillText("Press the \"Play\" button to start dodging.", 0, 400);
    // play button
    ctx.beginPath()
    ctx.rect((canvas.width/2)-30, 450, 60, 60);
    ctx.fillStyle = "LightSlateGray";
    ctx.fill();
    ctx.closePath();
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Play", canvas.width/2, 480);
}
// draws the game over screen
function drawGameOver() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // header text
    ctx.fillText("Oh dear, you are dead.", canvas.width/2, 50);
    ctx.fillText("Jk, but your dodging skills have failed you.", canvas.width/2, 80);
    // score/hiscore notification
    if (score > parseInt(localStorage.oldHiscore)) {
        ctx.fillText("New Hiscore!", canvas.width/2, 110);
        ctx.fillText(`Previous Hiscore: ${localStorage.oldHiscore}`, canvas.width/2, 140);
        ctx.fillText(`New Hiscore: ${score}`, canvas.width/2, 170);
        localStorage.hiscore = `${score}`;
    } else {
        ctx.fillText("Not quite a new Hiscore, bummer.", canvas.width/2, 110);
        ctx.fillText(`Score: ${score}`, canvas.width/2, 140);
        ctx.fillText(`Hiscore: ${localStorage.hiscore}`, canvas.width/2, 170);
    }
    // play again
    ctx.fillText("Press \"Play Again\" to dodge some more.", canvas.width/2, 240);
    ctx.beginPath();
    ctx.rect((canvas.width/2)-50, 300, 100, 100);
    ctx.fillStyle = "LightSlateGray";
    ctx.fill();
    ctx.closePath();
    ctx.fillStyle = "white";
    ctx.fillText("Play Again", canvas.width/2, 350);
    ctx.fillText("Reset your Hiscore with the \"Reset\" button.", canvas.width/2, 450);
    ctx.beginPath();
    ctx.rect((canvas.width/2)-30, 500, 60, 60);
    ctx.fillStyle = "LightSlateGray";
    ctx.fill();
    ctx.closePath();
    ctx.fillStyle = "white";
    ctx.fillText("Reset", canvas.width/2, 530);
}

// state drawers

// draw the start state
function drawStart() {
    // clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // draw background
    drawBackground();
    // draw introduction
    drawIntroduction();
}
// draws the play state
function drawPlay() {
    // clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // update oldHiscore
    localStorage.oldHiscore = localStorage.hiscore;
    // draw balls
    drawBalls();
    // draw player
    drawPlayer();
    // draw top border
    drawTopBorder();
    // draw top border text
    drawTopBorderText();
    // draw score and hiscore
    drawScores();
    // draw level
    drawLevel();
    // draw up and down buttons
    drawUpDownButtons();

    // if the ball has cleared the screen
    if (x + dx < ballRadius) {
        // loop through all balls in play
        for (let i = 0; i < myBalls.length; i++) {
            // ball hit the player, game over
            if (myBalls[i] > player.yPos && myBalls[i] < player.yPos + player.height) {
                // change to the end game state
                gameState = 'end';
                return;
            }
        }
        // player dodged all balls, spawn a new ball and increase score/level
        score += myBalls.length;
        levelScore++;
        // can tweak this numbmer to whatever for increment
        if ( (level === 1 && levelScore === 5) || levelScore === 10 ) {
            level++;
            levelScore = 0;
        }
        // reset bals array
        myBalls = [];
        // reset x balls x position
        x = ballSpawnX;
        // add necessary balls, can tweak levels accordingly
        for (let i = 0; i < level; i++) {
            addBall(generateRandomY());
        }
        // change velocity, can tweak as needed
        if (level > 1) {
            dx = -3 * level;
        }
    }

    // if the user is pressing up
    if(upPressed && player.yPos > yMin) {
        // move the player up
        player.yPos -= 7;
    }
    // if the user is pressing down
    else if(downPressed && player.yPos < canvas.height-player.height) {
        // move the player down
        player.yPos += 7;
    }
    // move the ball
    x += dx;
}
// draw the end state
function drawEnd() {
    // clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // draw background
    drawBackground();
    // draw introduction
    drawGameOver();
}

// main draw loop
function draw() {
    // keep track of frames to lock at 60 fps
    const msNow = window.performance.now();
    const msPassed = msNow - msPrev;

    if (msPassed < msPerFrame) return;

    const excessTime = msPassed % msPerFrame;
    msPrev = msNow - excessTime;
    
    // if the game state is start
    if (gameState === 'start') {
        // draw the start state
        drawStart();
    // if the game state is play
    } else if (gameState === 'play') {
        // draw the play state
        drawPlay();
    // if the play state is end
    } else if (gameState === 'end') {
        // draw the end state
        drawEnd();
    }
    // constantly draw the current state
    window.requestAnimationFrame(draw);
}

// start it up
draw();
