// local imports
import './styles.css';
import { playGame } from './game.js';

// firebase imports
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile  } from "firebase/auth";
import { getDatabase, ref, set, child, get, orderByChild, limitToLast, query } from "firebase/database";

// firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAEFbPo6oq3sS_q9wZ_9Bq4j8fuXlwWFtQ",
  authDomain: "progball-fa6f5.firebaseapp.com",
  databaseURL: "https://progball-fa6f5-default-rtdb.firebaseio.com",
  projectId: "progball-fa6f5",
  storageBucket: "progball-fa6f5.appspot.com",
  messagingSenderId: "389757949662",
  appId: "1:389757949662:web:c58be8533a713b9375544f",
  measurementId: "G-TGTSS1GBCN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const db = getDatabase(app);

// set localStorage
const localStorage = window.localStorage;

// set initial hiscore if not defined
if (localStorage.hiscore === undefined) {
    localStorage.hiscore = '0';
}
// set initial free mode hiscore if not defined
if (localStorage.hiscoreFree === undefined) {
    localStorage.hiscoreFree = '0';
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
// set gameMode if not defined
// gameMode is used to determine which hiscore to use, and if the
// score is eligible to be added to the leaderboard
// current supported gameModes are classic (for leaderboards)
// and free (no leaderboards)
if (localStorage.gameMode === undefined) {
    localStorage.gameMode = 'classic';
}
// keeps track of the game state to determine what to render to the canvas
// potential states:
// login - login screen where a user can create an account or sign in
// start - initial starting screen with instructions on how to play
// play - screen where the gmae is actually played
// end - screen showing game over, if a new hiscore was reached, and to play again
// modes - screen showing custom modes to choose from
localStorage.gameState = 'login';

// set up listeners on different buttons
document.body.addEventListener('click', clickHandler);

// handles clicks
function clickHandler(e) {
    if (localStorage.gameState === 'play') {
        return;
    }
    const target = e.target;
    if (localStorage.gameState === 'login') {
        // login page specific logic
        if (target.id === 'signupButton') {
            // we are wanting to create a new account
            // hide the initial buttons and show the creation div
            document.getElementById('loginButtons').classList.add('hidden');
            document.getElementById('createAccount').classList.remove('hidden');
        }
        if (target.id === 'loginButton') {
            // we are wanting to login to an existing account
            // first check to see if the user is already logged in
            const auth = getAuth();
            const user = auth.currentUser;
            if (user) {
                // user is already logged in, bypass logging in and bring them to start screen
                // hide the login screen, show the start screen, and change gameState
                document.getElementById('login').classList.replace('active', 'hidden');
                document.getElementById('start').classList.replace('hidden', 'active');
                localStorage.gameState = 'start';
                return;
            } else {
                // user is not currently logged in
                // hide the initial buttons and show the login div
                document.getElementById('loginButtons').classList.add('hidden');
                document.getElementById('existingAccount').classList.remove('hidden');
            }
        }
        if (target.id === 'createNewAccountButton') {
            // we are attempting to create a new account
            const email = document.getElementById('newEmail').value;
            const password = document.getElementById('newPassword').value;
            const auth = getAuth();
            createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                // hide the creation screen and show username screen
                document.getElementById('createAccount').classList.add('hidden');
                document.getElementById('newUsername').classList.remove('hidden');
            })
            .catch((error) => {
                // login failed, log the error
                const errorCode = error.code;
                const errorMessage = error.message;
                document.getElementById('createError').textContent = `${errorCode}: ${errorMessage}`;
                document.getElementById('createError').classList.remove('hidden');
            });
        }
        if (target.id === 'loginExistingAccountButton') {
            // we are attempting to log in to an existing account
            const email = document.getElementById('existingEmail').value;
            const password = document.getElementById('existingPassword').value;
            const auth = getAuth();
            signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                // set the localStorage hiscore to the hiscore from the database for the user
                const dbRef = ref(getDatabase());
                get(child(dbRef, `users/${user.displayName}/hiscore`)).then((snapshot) => {
                    if (snapshot.exists()) {
                        localStorage.hiscore = `${snapshot.val()}`;
                    }
                }).catch((error) => {
                    console.error(error);
                });
                // hide the login screen, show the start screen, and change gameState
                document.getElementById('login').classList.replace('active', 'hidden');
                document.getElementById('start').classList.replace('hidden', 'active');
                localStorage.gameState = 'start';
                return;
            })
            .catch((error) => {
                // login failed, log the error
                const errorCode = error.code;
                const errorMessage = error.message;
                document.getElementById('loginError').textContent = `${errorCode}: ${errorMessage}`;
                document.getElementById('loginError').classList.remove('hidden');
            });
        }
        if (target.id === 'addUser') {
            document.getElementById('usernameInvalidFormatError').classList.add('hidden');
            document.getElementById('usernameError').classList.add('hidden');
            // we are attempting to create a new username
            // check to see if username already exists
            const username = document.getElementById('username').value;
            // first check to make sure username is a valid format
            const valid = /^[a-zA-Z][a-zA-Z0-9_]+$/.test(username);
            if (!valid) {
                // username is not valid format, show an error
                document.getElementById('usernameInvalidFormatError').classList.remove('hidden');
                return;
            }
            const dbRef = ref(getDatabase());
            get(child(dbRef, `users/${username}`)).then((snapshot) => {
                if (snapshot.exists()) {
                    // if the username already exists, show the error message
                    document.getElementById('usernameError').classList.remove('hidden');
                    return;
                } else {
                    // username is available
                    // associate the user with the new username
                    const auth = getAuth();
                    // add the username as the displayName for the user
                    updateProfile(auth.currentUser, {
                        displayName: `${username}`
                    }).then(() => {
                        // add their hiscore to the database
                        // reset their localStorage hiscore to 0 since it's a fresh account
                        localStorage.hiscore = '0';
                        set(ref(db, `users/${username}`), {
                            hiscore: parseInt(localStorage.hiscore)
                        });
                        // hide the login page, show the start screen, and change gameState
                        document.getElementById('login').classList.replace('active', 'hidden');
                        document.getElementById('start').classList.replace('hidden', 'active');
                        localStorage.gameState = 'start';
                        return;
                    }).catch((error) => {
                        console.error(error);
                    });
                }
            }).catch((error) => {
                console.error(error);
            });
        }
        if (target.classList.contains('backToLoginButton')) {
            // back to login button was pressed, hide the current div, then set login as active
            document.getElementById('createAccount').className = 'hidden';
            document.getElementById('existingAccount').className = 'hidden';
            document.getElementById('loginButtons').classList.replace('hidden', 'active');
        }
    }
    if (target.classList.contains('playButton')) {
        // the play button was clicked, time to play the game
        // first set the active div to hidden
        if (localStorage.gameState === 'start') {
            document.getElementById('start').classList.replace('active', 'hidden');
        } else if (localStorage.gameState === 'modes') {
            document.getElementById('modes').classList.replace('active', 'hidden');
        } else if (localStorage.gameState === 'hiscores') {
            document.getElementById('hiscores').classList.replace('active', 'hidden');
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
        } else if (localStorage.gameState === 'hiscores') {
            document.getElementById('hiscores').classList.replace('active', 'hidden');
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
    if (target.classList.contains('hiscoresButton')) {
        // the hiscores button was clicked, switch to the hiscores "screen"
        // first set the active div to hidden
        if (localStorage.gameState === 'start') {
            document.getElementById('start').classList.replace('active', 'hidden');
        } else if (localStorage.gameState === 'end') {
            document.getElementById('end').classList.replace('active', 'hidden');
        } else if (localStorage.gameState === 'modes') {
            document.getElementById('modes').classList.replace('active', 'hidden');
        }
        // then set the state to hiscores
        localStorage.gameState = 'hiscores';
        // now show the hiscores screen
        document.getElementById('hiscores').classList.replace('hidden', 'active');
        // render the leaderboard
        updateHiscoresScreen();
    }
    // button logic specific to modes screen
    if (localStorage.gameState === 'modes') {
        // elements in the modes screen
        const classicModeButton = document.getElementById('classicModeButton');
        const freeModeButton = document.getElementById('freeModeButton');
        const classicFreeFlavorText = document.getElementById('classicFreeFlavorText');
        const freeModeOptions = document.getElementById('freeModeOptions');
        const shrinkOnButton = document.getElementById('shrinkOn');
        const shrinkOffButton = document.getElementById('shrinkOff');
        const shrinkModeText = document.getElementById('shrinkModeText');
        const ballShrunkenButton = document.getElementById('ballShrunken');
        const ballNormalButton = document.getElementById('ballNormal');
        const ballEnlargedButton = document.getElementById('ballEnlarged');
        const ballModeText = document.getElementById('ballModeText');
        if (target.id === 'classicModeButton') {
            // classic mode enabled, switch gameMode to classic
            localStorage.gameMode = 'classic';
            // adjust classic/free button styles
            target.className = 'buttonOn';
            freeModeButton.className = 'buttonOff';
            // hide the freeModeOptions section
            freeModeOptions.className = 'hidden';
            // hide the flavor text
            classicFreeFlavorText.className = 'hidden';
        }
        if (target.id === 'freeModeButton') {
            // free mode enabled, switch gameMode to free
            localStorage.gameMode = 'free';
            // adjust classic/free button styles
            target.className = 'buttonOn';
            classicModeButton.className = 'buttonOff';
            // show the freeModeOptions section
            freeModeOptions.className = '';
            // hide the flavor text
            classicFreeFlavorText.className = 'hidden';
        }
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
        if (localStorage.gameMode === 'classic') {
            localStorage.hiscore = '0';
            const auth = getAuth();
            const username = auth.currentUser.displayName;
            set(ref(db, `users/${username}`), {
                hiscore: parseInt(localStorage.hiscore)
            });
        } else if (localStorage.gameMode === 'free') {
            localStorage.hiscoreFree = '0';
        }
        document.getElementById('hiscoreText').textContent = 'Hiscore Reset!';
    }
}
// replace the default modes screen html with their proper states
function updateModesScreen() {
    if (localStorage.gameMode === 'free') {
        document.getElementById('freeModeButton').className = 'buttonOn';
        document.getElementById('classicModeButton').className = 'buttonOff';
        document.getElementById('freeModeOptions').className = '';
    }
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
// adjust the hiscores html to display leaderboard data
function updateHiscoresScreen() {
    let firstQuery = query(ref(db, "users"), orderByChild("hiscore"));
    let secondQuery = query(firstQuery, limitToLast(10));
    // array to keep the top 10 usernames in order
    let usernames = [];
    // array to keep the top 10 scores in order
    let scores = [];
    // get the data back from the database
    get(secondQuery).then((snapshot)=>{
        snapshot.forEach(childSnapshot => {
            usernames.push(childSnapshot.key);
            scores.push(childSnapshot.val())
        });
        usernames.reverse();
        scores.reverse();
        // update the html with the username/score data
        for (let i = 0; i < usernames.length; i++) {
            document.getElementById(`username${i+1}`).textContent = `${usernames[i]}`;
            document.getElementById(`score${i+1}`).textContent = `${scores[i].hiscore}`;
            document.getElementById(`row${i+1}`).classList.remove('hidden');
        }
    });
}