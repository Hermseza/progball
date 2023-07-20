// imports for webpack
import './styles.css';

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
const initialBallRadius = 10;
let ballRadius = initialBallRadius;
// starting x position of a ball
const ballSpawnX = canvas.width - ballRadius;
// used to keep track of the x position of a ball
let x = ballSpawnX;
// minimum possible y position of a ball
let yBallMin = 50 + ballRadius;
// maximum possible y position of a ball
let yBallMax = canvas.height - ballRadius;
// minimum position of the player
const yMin = 50;
// array used to store all current balls
let myBalls = [];
// add a starting ball
addBall(generateRandomY());
// initial velocity of a ball
const initialVelocity = -4;
let dx = initialVelocity;
// object representing the player's height and width
const initialPlayerHeight = 75;
const player = {
    height: initialPlayerHeight,
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
// set old hiscore if not defined
if (localStorage.oldHiscore === undefined) {
    localStorage.oldHiscore = '0';
}
// set shrinkMode if not defined
if (localStorage.shrinkMode === undefined) {
    localStorage.shrinkMode = 'false';
}
// set ballMode if not defined
if (localStorage.ballMode === undefined) {
    localStorage.ballMode = 'normal';
}
// keeps track of the game state to determine what to render to the canvas
// potential states:
// start - initial starting screen with instructions on how to play
// play - screen where the gmae is actually played
// end - screen showing game over, if a new hiscore was reached, and to play again
// modes - screen showing custom modes to choose from
let gameState = 'start';
// variables used to lock fps at 60
let msPrev = window.performance.now();
const fps = 60;
const msPerFrame = 1000 / fps;
// used to keep track of starting position that will be used for touchmove references
let touchStartY;

// event listeners

// listen for a keydown
document.addEventListener("keydown", keyDownHandler, false);
// listen for a keyup
document.addEventListener("keyup", keyUpHandler, false);
// listen for a mousedown
document.addEventListener("mousedown", mouseStartHandler, false);
// listen for a touchstart
document.addEventListener("touchstart", mouseStartHandler, false);
// listen for a touchmove
document.addEventListener("touchmove", touchMoveHandler, false);
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

    // if the game state is start or end and the modes buttons is pressed
    if ( (gameState === 'start' || gameState === 'end')
    && (relativeX < canvas.width && relativeX > canvas.width - 100)
    && (relativeY < canvas.height && relativeY > canvas.height - 100) ) {
        // switch to the modes state
        gameState = 'modes';
    } 
    // if the current state is start
    else if (gameState === 'start') {
        // if user clicked/touched the play button
        if( (relativeX < (canvas.width/2)+30 && relativeX > (canvas.width/2)-30)
        && (relativeY < 610 && relativeY > 550) ) {
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
        // if the user clicked/touched the up button
        } else if((relativeX < canvasWidth && relativeX > canvasWidth-50)
        && (relativeY < canvas.height-60 && relativeY > canvas.height-110)) {
            // mark it as pressed
            upPressed = true;
        // user clicked/touched somewhere else on the screen
        } else {
            // if it is a touchstart event
            if (e.type === 'touchstart') {
                // set the tracking value
                touchStartY = e.changedTouches[0].clientY + canvas.offsetTop;
            }
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
            ballRadius = initialBallRadius;
            x = ballSpawnX;
            addBall(generateRandomY());
            dx = initialVelocity;
            player.height = initialPlayerHeight;
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
    // if we are on the modes screen
    } else if (gameState === 'modes') {
        // if the shrinkMode off button is pressed
        if( (relativeX < 50 && relativeX > 0)
        && (relativeY < 270 && relativeY > 220) ) {
            // change the shrinkMode value
            localStorage.shrinkMode = 'false';
        }
        // if the shrinkMode on button is pressed
        if( (relativeX < 120 && relativeX > 70)
        && (relativeY < 270 && relativeY > 220) ) {
            // change the shrinkMode value
            localStorage.shrinkMode = 'true';
        }
        // if the shrunken button is pressed
        if( (relativeX < 100 && relativeX > 0)
        && (relativeY < 490 && relativeY > 390) ) {
            // change the ballMode value
            localStorage.ballMode = 'shrunken';
        }
        // if the normal button is pressed
        if( (relativeX < 220 && relativeX > 120)
        && (relativeY < 490 && relativeY > 390) ) {
            // change the ballMode value
            localStorage.ballMode = 'normal';
        }
        // if the enlarged button is pressed
        if( (relativeX < 340 && relativeX > 240)
        && (relativeY < 490 && relativeY > 390) ) {
            // change the ballMode value
            localStorage.ballMode = 'enlarged';
        }
        // if the play button is pressed
        if( (relativeX < (canvasWidth/2)+30 && relativeX > (canvasWidth/2)-30)
        && (relativeY < 610 && relativeY > 550) ) {
            // start a new game
            score = 0;
            level = 1;
            levelScore= 0;
            myBalls = [];
            ballRadius = initialBallRadius;
            x = ballSpawnX;
            addBall(generateRandomY());
            dx = initialVelocity;
            player.height = initialPlayerHeight;
            player.yPos = playerSpawnY;
            downPressed = false;
            upPressed = false;
            gameState = 'play';
        }
        // prevent both touch events and mouse click from firing at the same time
        e.preventDefault();
    }
}
// handle touchmove event
function touchMoveHandler(e) {
    // if the current state is play
    if (gameState === 'play') {
        // get y coordinate of the touch location
        const relativeY = e.changedTouches[0].clientY + canvas.offsetTop;
        // if user swiped down
        if (relativeY > touchStartY) {
            // if they were previously moving up, stop
            upPressed = false;
            // and move down
            downPressed = true;
        }
        // if user swiped up
        if(relativeY < touchStartY) {
            // if they were previously moving down, stop
            downPressed = false;
            // and move up
            upPressed = true;
        }
        // prevent default so users don't have unexpected situations
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
        // reset touchStartY position
        touchStartY = null;
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
        // keep track of the previous ball in the array
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
// draws the modes button
function drawModesButton() {
    // Modes button description
    ctx.font = "16px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "start";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("Press the Modes button for fun modes", 0, canvas.height-50);
    // Modes button
    ctx.beginPath();
    ctx.rect(canvas.width-100, canvas.height-100, 100, 100);
    ctx.fillStyle = "LightSlateGray";
    ctx.fill();
    ctx.closePath();
    // Modes button text
    ctx.beginPath();
    ctx.font = "16px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Modes", canvas.width-50, canvas.height-50);
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
    ctx.fillText("Mobile users can also press and hold", 0, 370);
    ctx.fillText("anywhere on the screen (starting point)", 0, 400);
    ctx.fillText("and move up/down from the starting point.", 0, 430);
    ctx.fillText("Release to stop moving.", 0, 460);
    ctx.fillText("Press the \"Play\" button to start dodging.", 0, 510);
    // play button
    ctx.beginPath()
    ctx.rect((canvas.width/2)-30, 550, 60, 60);
    ctx.fillStyle = "LightSlateGray";
    ctx.fill();
    ctx.closePath();
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Play", canvas.width/2, 580);
}
// draws the content for the modes screen
function drawModesContent() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // header text
    ctx.fillText("Modes", canvas.width/2, 35);
    // description
    ctx.textAlign = "start";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("Care to spice things up? Try a new mode!", 0, 80);
    ctx.fillText("Player progressively get smaller with", 0, 160);
    const shrinkModeText = localStorage.shrinkMode === 'true' ? "On" : "Off";
    ctx.fillText(`Shrink Mode: ${shrinkModeText}`, 0, 200);
    // shrink mode off button
    ctx.beginPath()
    ctx.rect(0, 220, 50, 50);
    ctx.fillStyle = localStorage.shrinkMode === 'true' ? "Crimson" : "SeaGreen";
    ctx.fill();
    ctx.closePath();
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Off", 25, 245);
    // shrink mode on button
    ctx.beginPath()
    ctx.rect(70, 220, 50, 50);
    ctx.fillStyle = localStorage.shrinkMode === 'true' ? "SeaGreen" : "Crimson";
    ctx.fill();
    ctx.closePath();
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("On", 95, 245);
    // render on/off button with text
    ctx.textAlign = "start";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("Balls get progressively bigger or smaller with", 0, 330);
    const ballModeText = localStorage.ballMode.charAt(0).toUpperCase() + localStorage.ballMode.slice(1);
    ctx.fillText(`Ball Mode: ${ballModeText}`, 0, 370);
    // ball mode buttons
    // shrunken
    ctx.beginPath()
    ctx.rect(0, 390, 100, 100);
    ctx.fillStyle = localStorage.ballMode === 'shrunken' ? "SeaGreen" : "Crimson";
    ctx.fill();
    ctx.closePath();
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Shrunken", 50, 440);
    // normal
    ctx.beginPath()
    ctx.rect(120, 390, 100, 100);
    ctx.fillStyle = localStorage.ballMode === 'normal' ? "SeaGreen" : "Crimson";
    ctx.fill();
    ctx.closePath();
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Normal", 170, 440);
    // enlarged
    ctx.beginPath()
    ctx.rect(240, 390, 100, 100);
    ctx.fillStyle = localStorage.ballMode === 'enlarged' ? "SeaGreen" : "Crimson";
    ctx.fill();
    ctx.closePath();
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Enlarged", 290, 440);
    // play button
    ctx.beginPath()
    ctx.rect((canvas.width/2)-30, 550, 60, 60);
    ctx.fillStyle = "LightSlateGray";
    ctx.fill();
    ctx.closePath();
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Play", canvas.width/2, 580);
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
    // draw modes button
    drawModesButton();
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
            if ( (myBalls[i] >= player.yPos && myBalls[i] <= player.yPos + player.height)
            || (myBalls[i] + ballRadius >= player.yPos && myBalls[i] + ballRadius <= player.yPos + player.height)
            || (myBalls[i] - ballRadius >= player.yPos && myBalls[i] - ballRadius <= player.yPos + player.height) ) {
                // change to the end game state
                gameState = 'end';
                return;
            }
        }
        // player dodged all balls, spawn a new ball and increase score/level
        score += myBalls.length;
        levelScore++;
        // can tweak this numbmer to whatever for increment
        if ( levelScore === (level * 5) ) {
            level++;
            levelScore = 0;
            // adjust for modes
            // check for shrinkMode
            if (localStorage.shrinkMode === 'true') {
                // the potential new player height
                const newHeight = player.height - 5;
                // make sure the player still has height
                if (newHeight > 1) {
                    // adjust player height
                    player.height = newHeight;
                }
            }
            // check for ballMode
            // enlarged mode increases ballRadius
            if (localStorage.ballMode === 'enlarged') {
                // the potential new ball radius
                const newBallRadius = ballRadius + 1;
                // make sure player still has room to dodge
                if (canvas.height - 50 - newBallRadius > player.height) {
                    // adjust ballRadius and related variables
                    ballRadius = newBallRadius;
                    yBallMin = 50 + ballRadius;
                    yBallMax = canvas.height - ballRadius;
                }
            // shrunken mode decreases ball radius
            } else if (localStorage.ballMode === 'shrunken') {
                // the potential new ball radius
                const newBallRadius = ballRadius - 1;
                // make sure the ball still has a radius
                if (newBallRadius > 1) {
                    // adjust ballRadius and related variables
                    ballRadius = newBallRadius;
                    yBallMin = 50 + ballRadius;
                    yBallMax = canvas.height - ballRadius;
                }
            }
        }
        // reset balls array
        myBalls = [];
        // reset ball's x position
        x = ballSpawnX;
        // add necessary balls, can tweak levels accordingly
        for (let i = 0; i < level; i++) {
            addBall(generateRandomY());
        }
        // change velocity, can tweak as needed
        dx = -3 - level;
    }

    // if the user is pressing up
    if(upPressed && player.yPos > yMin) {
        // move the player up
        player.yPos -= 7;
        // ensure player doesn't go above the top border
        if (player.yPos < yMin) {
            player.yPos = yMin;
        }
    }
    // if the user is pressing down
    else if(downPressed && player.yPos < canvas.height - player.height) {
        // move the player down
        player.yPos += 7;
        // ensure player doesn't go below the screen
        if (player.yPos > canvas.height - player.height) {
            player.yPos = canvas.height - player.height;
        }
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
    // draw modes button
    drawModesButton();
    // draw game over
    drawGameOver();
}
// draw the modes state
function drawModes() {
    // clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // draw background
    drawBackground();
    // draw modes content
    drawModesContent();
}

// main draw loop
function draw() {
    // constantly draw the current state
    window.requestAnimationFrame(draw);
    
    // keep track of frames to lock at 60 fps
    let msNow = window.performance.now();
    let msPassed = msNow - msPrev;

    if (msPassed > msPerFrame) {

        let excessTime = msPassed % msPerFrame;
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
        // if the play state is modes
        } else if (gameState === 'modes') {
            // draw the modes state
            drawModes();
        }
    }
}

// start it up
draw();
