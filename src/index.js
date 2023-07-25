// imports
import './styles.css';
import { playGame } from './game.js';

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
localStorage.gameState = 'start';

// set up listeners on different buttons
document.body.addEventListener('click', clickHandler);

// handles clicks
function clickHandler(e) {
    if (localStorage.gameState === 'play') {
        return;
    }
    const target = e.target;
    if (target.classList.contains('playButton')) {
        // the play button was clicked, time to play the game
        // first set the active div to hidden
        if (localStorage.gameState === 'start') {
            document.getElementById('start').classList.replace('active', 'hidden');
        } else if (localStorage.gameState === 'modes') {
            document.getElementById('modes').classList.replace('active', 'hidden');
        } else if (localStorage.gameState === 'end') {
            document.getElementById('end').classList.replace('active', 'hidden');
        }
        // unhide the game canvas
        document.getElementById('canvas').classList.remove('hidden');
        // set the state to play
        localStorage.gameState = 'play';
        // play the game
        playGame();
        return;
    }
    if (target.classList.contains('modesButton')) {
        // the modes button was clicked, switch to the modes "screen"
        // first set the active div to hidden
        if (localStorage.gameState === 'start') {
            document.getElementById('start').classList.replace('active', 'hidden');
        } else if (localStorage.gameState === 'end') {
            document.getElementById('end').classList.replace('active', 'hidden');
        }
        // then set the state to modes
        localStorage.gameState = 'modes';
        // now show the modes screen
        document.getElementById('modes').classList.replace('hidden', 'active');
        // modify the buttons to show their proper state
        updateModesScreen();
    }
    // button logic specific to modes screen
    if (localStorage.gameState === 'modes') {
        // elements in the modes screen
        const shrinkOnButton = document.getElementById('shrinkOn');
        const shrinkOffButton = document.getElementById('shrinkOff');
        const shrinkModeText = document.getElementById('shrinkModeText');
        const ballShrunkenButton = document.getElementById('ballShrunken');
        const ballNormalButton = document.getElementById('ballNormal');
        const ballEnlargedButton = document.getElementById('ballEnlarged');
        const ballModeText = document.getElementById('ballModeText');
        if (target.id === 'shrinkOn') {
            // shrink mode enabled, update shrink buttons, shrink text, and shrinkMode
            target.className = 'buttonOn';
            shrinkOffButton.className = 'buttonOff';
            shrinkModeText.textContent = 'On';
            localStorage.shrinkMode = 'true';
        }
        if (target.id === 'shrinkOff') {
            // shrink mode disabled, update shrink buttons, shrink text, and shrinkMode
            target.className = 'buttonOn';
            shrinkOnButton.className = 'buttonOff';
            shrinkModeText.textContent = 'Off';
            localStorage.shrinkMode = 'false';
        }
        if (target.id === 'ballShrunken') {
            // ball mode is shrunken, update ball buttons, text, and ballMode
            target.className = 'buttonOn';
            ballNormalButton.className = 'buttonOff';
            ballEnlargedButton.className = 'buttonOff';
            ballModeText.textContent = 'Shrunken';
            localStorage.ballMode = 'shrunken';
        }
        if (target.id === 'ballNormal') {
            // ball mode is shrunken, update ball buttons, text, and ballMode
            target.className = 'buttonOn';
            ballShrunkenButton.className = 'buttonOff';
            ballEnlargedButton.className = 'buttonOff';
            ballModeText.textContent = 'Normal';
            localStorage.ballMode = 'normal';
        }
        if (target.id === 'ballEnlarged') {
            // ball mode is shrunken, update ball buttons, text, and ballMode
            target.className = 'buttonOn';
            ballNormalButton.className = 'buttonOff';
            ballShrunkenButton.className = 'buttonOff';
            ballModeText.textContent = 'Enlarged';
            localStorage.ballMode = 'enlarged';
        }
    }
    if (localStorage.gameState === 'end' && target.id === 'reset') {
        // reset button was pressed, reset Hiscore and update Hiscore text
        localStorage.hiscore = '0';
        document.getElementById('hiscoreText').textContent = 'Hiscore Reset!';
    }
}
// replace the default modes screen html with their proper states
function updateModesScreen() {
    // only care about updating if not in the default state of false
    if (localStorage.shrinkMode === 'true') {
        document.getElementById('shrinkOn').className = 'buttonOn';
        document.getElementById('shrinkOff').className = 'buttonOff';
        document.getElementById('shrinkModeText').textContent = 'On';
    }
    // only care about updating if not in the default state of normal
    if (localStorage.ballMode === 'shrunken') {
        document.getElementById('ballShrunken').className = 'buttonOn';
        document.getElementById('ballNormal').className = 'buttonOff';
        document.getElementById('ballModeText').textContent = 'Shrunken';
    } else if (localStorage.ballMode === 'enlarged') {
        document.getElementById('ballEnlarged').className = 'buttonOn';
        document.getElementById('ballNormal').className = 'buttonOff';
        document.getElementById('ballModeText').textContent = 'Enlarged';
    }
}