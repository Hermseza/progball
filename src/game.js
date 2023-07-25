
export function playGame() {

    // variables

    // canvas element we will be drawing on
    const canvas = document.getElementById('canvas');
    // focus the canvas so that keydown handlers work properly
    canvas.focus();
    // set width of the canvas to the available width
    canvas.width = window.innerWidth;
    // set height of the canvas to the availabe height
    canvas.height = window.innerHeight;
    // context used to draw on the canvas
    const ctx = canvas.getContext('2d');
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
    const initialVelocity = -(Math.round(window.innerWidth/100));
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
    // variables used to lock fps at 60
    let msPrev = window.performance.now();
    const fps = 60;
    const msPerFrame = 1000 / fps;
    // used to keep track of starting position that will be used for touchmove references
    let touchStartY;

    // event listeners

    // listen for a keydown
    canvas.addEventListener("keydown", keyDownHandler, false);
    // listen for a keyup
    canvas.addEventListener("keyup", keyUpHandler, false);
    // listen for a mousedown
    canvas.addEventListener("mousedown", mouseStartHandler, false);
    // listen for a touchstart
    canvas.addEventListener("touchstart", mouseStartHandler, false);
    // listen for a touchmove
    canvas.addEventListener("touchmove", touchMoveHandler, false);
    // listen for a mouseup
    canvas.addEventListener("mouseup", mouseEndHandler, false);
    // listen for a touchend
    canvas.addEventListener("touchend", mouseEndHandler, false);

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
    // handle keyup event
    function keyUpHandler(e) {
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
    }
    // handle touchmove event
    function touchMoveHandler(e) {
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
    // handle mouseend event
    function mouseEndHandler(e) {
        // mark buttons as no longer being pressed
        downPressed = false;
        upPressed = false;
        // reset touchStartY position
        touchStartY = null;
        // prevent default so users don't have unexpected situations
        e.preventDefault();
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

    // state drawers

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
                    // potentially update hiscore
                    if (score > parseInt(localStorage.oldHiscore)) {
                        // new hiscore, update everything
                        document.getElementById('scoreFlavorText').textContent = 'New Hiscore!';
                        document.getElementById('scoreText').textContent = `Previous Hiscore: ${localStorage.oldHiscore}`;
                        document.getElementById('hiscoreText').textContent = `New Hiscore: ${score}`;
                        localStorage.hiscore = `${score}`;
                    } else {
                        // not a new hiscore, update score and hiscore
                        document.getElementById('scoreText').textContent = `Score: ${score}`;
                        document.getElementById('hiscoreText').textContent = `Hiscore: ${localStorage.hiscore}`;
                    }
                    score = 0;
                    level = 1;
                    levelScore = 0;
                    myBalls = [];
                    ballRadius = initialBallRadius;
                    x = ballSpawnX;
                    addBall(generateRandomY());
                    dx = initialVelocity;
                    player.height = initialPlayerHeight;
                    player.yPos = playerSpawnY;
                    downPressed = false;
                    upPressed = false;
                    // set end screen as active and play screen (canvas) as hidden
                    canvas.className = 'hidden';
                    document.getElementById('end').classList.replace('hidden', 'active');
                    // change to the end game state
                    localStorage.gameState = 'end';
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
            dx = initialVelocity - ((level * initialVelocity) / initialVelocity);
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

    // main draw loop
    function draw() {
        // only draw when we are playing
        if (localStorage.gameState === 'play') {
            // constantly draw the current state
            window.requestAnimationFrame(draw);
            
            // keep track of frames to lock at 60 fps
            let msNow = window.performance.now();
            let msPassed = msNow - msPrev;

            if (msPassed > msPerFrame) {

                let excessTime = msPassed % msPerFrame;
                msPrev = msNow - excessTime;
                // draw the play state
                drawPlay();
            }
        }
    }

    // start it up
    draw();
}