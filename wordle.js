/*************** Classes and named functions **********************/
// CLASS: boardStatistics
function BoardStatistics()
{
    // initiatilize my members/attributes
    this.word = 0;
    this.active = true;
    this.nextWord = function() {
        this.word++;
    }
    this.gameOver = function() {
        this.active = false;
    }

}

function createWord(row) {
    let wordString = "<div class=\"word_container\">";
    
    for(let i = 0; i < 5; i++) {
        
        wordString += "<div class=\"game_letter color_white\" id=\"r" + row + "c" + i + "\"></div>";
    }
    wordString += "</div>";
    return wordString;
}

function createBoard() {
    
    // string we'll build to iinject into the game board space
    let boardString = ""

    // create all 6 'words'
    for(let i = 0; i < 6; i++) {
        boardString += createWord(i);
    }
    document.getElementById("game_board").innerHTML = boardString;

    // create a global 'answer' variable
    answer = wordArray[Math.floor(Math.random() * wordArray.length)];

    // debugging statement required by spec
    console.log(answer);
}

function createKeyboard() {
    let keyboardString = "";
    let KBRowsRaw = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
    let KBRows = KBRowsRaw.map(row => row.split(''));

    for (let i = 0; i < 3; i++) {
        keyboardString += "<div class=\"KB_row\">";
        for (let j = 0; j < KBRows[i].length; j++) {
            currLet = KBRows[i][j];
            keyboardString += "<div class=\"KB_letter color_white\" id=\"KB_" + currLet + "\">" + currLet + "</div>";
        }
        keyboardString += "</div>";
    }

    document.getElementById("keyboard_container").innerHTML = keyboardString;
}

// function takes an array of element(s), the class to be removed, the class to be added
// Purpose: helper function for my event handler
function changeClasses(elements, toAdd, toRemove) {
    for(let elmCt = 0; elmCt < elements.length; elmCt++) {
        let currElm = elements[elmCt]
        if (currElm.classList.contains(toRemove)) {
            currElm.classList.remove(toRemove);
        }
        if(!(currElm.classList.contains(toAdd))) {
            currElm.classList.add(toAdd);
        }
    }
}

/********************** objects and arrays ************************/

const wordArray = ['about', 'adept', 'anime', 'audio', 'basic', 
                    'brain', 'child', 'count', 'drone', 'error', 
                    'found', 'funny', 'gamut', 'grime', 'hello', 
                    'image', 'joust', 'kiosk', 'limit', 'mouse', 
                    'natal', 'opine', 'pilot', 'proud', 'pzzaz', 
                    'quiet', 'rapid', 'stone', 'trout', 'usual', 
                    'vapid', 'vital', 'wheel', 'xenon', 'young', 
                    'zaney'];

const boardStats = new BoardStatistics();

/***************** Event Handler and Game logic *******************/
document.getElementById('button').onclick = function() {
    let guess = document.getElementById('user_input').value.toLowerCase();

    // by default, clicking a submit button inside a form refreshes the page
    // we want the page details to remain post-click
    
    event.preventDefault();
    // console.log(guess);

    // change for data validation (end of the lecture vid)
    if (!boardStats.active) {
        // They've already enterd 6 words or have guessed the word
        alert('This round is over, click the button to play again!');
        // todo: rest of game winning code
    } else if (guess.length != 5) {
        alert("Your word must be 5 letters");
    } else if (!/^[a-z]+$/.test(guess)) { // test uses reg ex. Had to look all this up (and recall some of it from cs 170), were matching from the start to the end of the string (^ and $ respectively), and checking for [a-z]+ (one or more letters). if this doesnt match for the ENTIRE string, test will return false.
        alert("Your word must only contain letters");
    } else if (boardStats.active) {

        // return an array of all correct letters in the right place at
        // their respective index in user's guess, non-matching
        // letters are returned as empty strings in their respective 'guess' indecies
        let rightPlace = guess.split('').map((char, idx) => {
            if (char === answer[idx]) return char;
            else return "";
        });

        // remaining letters that we'll use to decide yellows
        let remainingLetters = answer.split('').map((char, idx) => {
            if (char !== guess[idx]) return char;
            else return "";
        }).join('');

        // return an array of all correct letters in the wrong place at
        // their respective index in user's guess, non-matching
        // letters are returned as empty strings in their respective 'guess' indecies
        // for duplicate letters, match the number of possible yellows to the number of 
        // remaining non-correct occurences of the letter in question
        let wrongPlace = guess.split('').map((char, idx) => {
            if (remainingLetters.includes(char)) {
                // will replace only the first instance of char found in the string, essentially 'using' it up
                remainingLetters = remainingLetters.replace(char, '');
                return char;
            } 
            else return "";
        });

        // console.log(rightPlace);
        // console.log(wrongPlace);

        for (let i = 0; i < 5; i++) {
            // get elements based on loop iteration and word number
            let currElement = document.getElementById(('r' + boardStats.word + 'c' + i));
            let currGuessLetter = guess[i];
            let currKey = document.getElementById('KB_' + currGuessLetter);
            let elemArray = [currElement, currKey];

            // 'add' the letter to the box
            currElement.innerHTML = currGuessLetter;

            if(rightPlace[i]) {
                // right letter, right place
                if(currKey.classList.contains("wrong_place")) {
                    // we've already seen this element and marked it
                    // as wrong, but correctness takes precidence on
                    // the keyboard. 
                    changeClasses(elemArray, "correct", "wrong_place");
                } else {
                    changeClasses(elemArray, "correct", "color_white");
                }
            } else if (wrongPlace[i]) {
                // Change the element class (and conditionally the key class if it is not already green)
                changeClasses((() => {
                    if (currKey.classList.contains("correct")) return [currElement];
                    else return elemArray;
                })(), "wrong_place", "color_white");
                
            } else {
                //the letter does not appear anywhere in the word (only change the key's class if it has not already been changed)
                changeClasses((() => {
                    if (currKey.classList.contains("correct") || currKey.classList.contains("wrong_place")) return [currElement];
                    else return elemArray;
                })(), "wrong_letter", "color_white");
            }
        }

        boardStats.nextWord();
    }

    // end game trigger/ condition. 
    if (guess === answer || boardStats.word > 5) {
        // Ensure the user cannot submit any other words
        boardStats.gameOver();

        // Display the play agian button
        let buttonSpace = document.getElementById("play_again");
        buttonSpace.innerHTML = "";
        const playAgainButton = document.createElement('button');
        playAgainButton.textContent = "Play Again";
        playAgainButton.addEventListener('click', function() {
            location.reload();
        });
        buttonSpace.appendChild(playAgainButton)
    }
}

window.onload = function() {
    createBoard();
    createKeyboard();

};
