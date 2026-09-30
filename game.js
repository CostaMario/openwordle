function startGame() {
    // Gather game settings
    const word_length = document.querySelector(".wordlength").value;
    const attempts = document.querySelector(".attempts").value;
    const difficulty = document.querySelector(".difficulty").value;

    localStorage.setItem('wordlength', word_length);
    localStorage.setItem('attempts', attempts);

    console.log("Starting game with " + word_length + " letter words, " + attempts + " attempts");

    fetch('wordlists/' + word_length + '.txt')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            const wordlist = data.split('\n');

            localStorage.setItem("wordlist", wordlist);
            let words_to_include = wordlist.length;

            switch (difficulty) {
                case "0":
                    if (words_to_include > 250) {
                        words_to_include = 250;
                    }
                    break;
                case "1":
                    if (words_to_include > 1000) {
                        words_to_include = 1000;
                    }
                    break;
                case "2":
                    if (words_to_include > 2500) {
                        words_to_include = 2500;
                    }
                    break;
            }

            const secret_word = wordlist[Math.floor(Math.random() * words_to_include)];
            localStorage.setItem("secretword", secret_word.toUpperCase());
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });

    // Hide main menu and show game div
    const main_menu = document.querySelector(".mainmenu");
    main_menu.style.visibility = "hidden";

    const game = document.querySelector(".game");
    game.style.visibility = "visible";

    document.querySelector(".regularbuttons").style.visibility = "visible";
    document.querySelector(".endbuttons").style.visibility = "hidden";
    document.querySelector(".endscreen").style.visibility = "hidden";

    // populate board
    clearBoard();

    const board = document.querySelector(".board");

    for (let i = 0; i < attempts; i++) {
        const line = document.createElement("div");
        line.style.width = "500px";
        line.style.margin = "5px";

        const line_input = document.createElement("input");
        line_input.type = "text";
        line_input.maxLength = word_length;
        line_input.disabled = true;
        line_input.addEventListener('input', function(event) {
            line_input.value = line_input.value.toUpperCase();
            const pattern = line_input.value.match("^[a-zA-Z]*");
            if (!(pattern == null)) {
                line_input.value = pattern[0];
            }

            renderInput(i, line_input.value);
        });

        const line_display = document.createElement("div");
        line_display.style.display = "inline-block";

        line.appendChild(line_input);
        line.appendChild(line_display);

        for (let j = 0; j < word_length; j++) {
            const letter_slot = document.createElement("div")

            letter_slot.style.display = "inline";
            letter_slot.textContent = "[]";

            line_display.appendChild(letter_slot);
        }

        board.appendChild(line);
    }

    board.appendChild(prepareKeyboard());

    localStorage.setItem('current_attempt', 0);
    enableAndSelectCurrent();
}

function returnToMenu() {
    // Hide main menu and show game div
    const main_menu = document.querySelector(".mainmenu");
    main_menu.style.visibility = "visible";

    const game = document.querySelector(".game");
    game.style.visibility = "hidden";

    clearBoard();
}

function clearBoard() {
    const board = document.querySelector(".board");

    while (board.hasChildNodes()) {
        board.removeChild(board.firstChild);
    }
}

function renderInput(id, value) {
    const board = document.querySelector(".board");
    const line_display = board.children[id].children[1];

    for (let i = 0; i < line_display.children.length; i++) {
        if (i < value.length) {
            line_display.children[i].textContent = value[i];
        }
        else {
            line_display.children[i].textContent = "[]";
        }
    }
}

function prepareKeyboard() {
    const rows = [
        "QWERTYUIOP",
        "ASDFGHJKL",
        "ZXCVBNM"
    ];

    const keyboard = document.createElement("div");
    keyboard.className = "keyboard";

    for (let i = 0; i < rows.length; i++) {
        const current_row = document.createElement("div");
        //current_row.style.display = "inline-block";

        for (let j = 0; j < rows[i].length; j++) {
            const key = document.createElement("button");

            key.style.display = "inline";
            key.textContent = rows[i][j];
            key.type = "button";
            key.onclick = function() {
                const attempt = localStorage.getItem('current_attempt');
                const word_length = localStorage.getItem('wordlength');
                const line = document.querySelector(".board").children[attempt].children[0];
                if (line.value.length < word_length) {
                    line.value += rows[i][j];
                }

                renderInput(attempt, line.value);
            };

            current_row.appendChild(key);
        }
        keyboard.appendChild(current_row);
    }

    return keyboard;
}

function backspace() {
    const attempt = localStorage.getItem('current_attempt');
    const word_length = localStorage.getItem('wordlength');
    const line = document.querySelector(".board").children[attempt].children[0];

    if (line.value.length > 0) {
        line.value = line.value.slice(0, -1);
        renderInput(attempt, line.value);
    }
}

function enableAndSelectCurrent(input) {
    console.log(input)

    const board = document.querySelector(".board");
    const attempt = localStorage.getItem('current_attempt');

    for (let i = 0; i < board.children.length; i++) {
        let disable = true;
        if (i == attempt) {
            disable = false;
        }

        const line = board.children[i];
        line.children[0].disabled = disable;

        if (!(disable)) {
            line.children[0].focus();
        }
    }
}

function gradeGuess(guess) {
    const secret_word = localStorage.getItem("secretword");
    let grade = "";

    let letters_count = {};
    for (let i = 0; i < secret_word.length; i++) {
        if (secret_word[i] in letters_count) {
            letters_count[secret_word[i]]++;
        } else {
            letters_count[secret_word[i]] = 1;
        }
    }
    for (let i = 0; i < secret_word.length; i++) {
        if (guess[i] == secret_word[i]) {
            grade += "2";
            letters_count[guess[i]]--;
        }
        else {
            grade += "0";
        }
    }

    for (let i = 0; i < secret_word.length; i++) {
        if (grade[i] != "2" && guess[i] in letters_count && letters_count[guess[i]] > 0) {
            letters_count[guess[i]]--;
            grade[i] = "1";
        }
    }

    return grade;
}

function guess() {
    const board = document.querySelector(".board");
    const keyboard = document.querySelector(".keyboard");

    const attempt = localStorage.getItem('current_attempt');
    if (attempt >= board.children.length) {
        return;
    }

    const guess = board.children[attempt].children[0].value;
    const wordlist = localStorage.getItem("wordlist");

    if (!wordlist.includes(guess.toLowerCase())) {
        return;
    }

    if (guess.length < localStorage.getItem('wordlength')) {
        return;
    }

    const grade = gradeGuess(guess);

    for (let i = 0; i < grade.length; i++) {
        switch (grade[i]) {
            case "0":
                board.children[attempt].children[1].children[i].style.backgroundColor = "red";
                break;
            case "1":
                board.children[attempt].children[1].children[i].style.backgroundColor = "gold";
                break;
            case "2":
                board.children[attempt].children[1].children[i].style.backgroundColor = "green";
                break;
        }

        for (let r = 0; r < keyboard.children.length; r++) {
            for (let c = 0; c < keyboard.children[r].children.length; c++) {
                if (guess[i] == keyboard.children[r].children[c].textContent && grade[i] == "0") {
                    keyboard.children[r].children[c].disabled = true;
                }
            }
        }
    }

    if (!(grade.includes("0")) && !(grade.includes("1"))) {
        // Guessed right! Yay!
        board.children[attempt].children[0].disabled = true;
        console.log("Victory!");
        endGame(true);
    }
    else if (Number(attempt) + 1 >= localStorage.getItem('attempts')) {
        // Guessed wrong and ran out of attempts
        board.children[attempt].children[0].disabled = true;
        console.log("Defeat!");
        endGame(false);
    }
    else {
        // Guessed wrong, but there's still more attempts
        localStorage.setItem('current_attempt', Number(attempt) + 1);
        enableAndSelectCurrent();
    }
}

function endGame(won) {
    const endscreen = document.querySelector(".endscreen");
    document.querySelector(".keyboard").style.visiblity = "hidden";
    document.querySelector(".regularbuttons").style.visibility = "hidden";
    document.querySelector(".endbuttons").style.visibility = "visible";
    endscreen.style.visibility = "visible";

    if (won) {
        endscreen.children[0].textContent = "YOU WIN!";
    } else {
        endscreen.children[0].textContent = "YOU LOSE!";
    }

    const secret_word = localStorage.getItem("secretword");
    endscreen.children[1].textContent = "The secret word was " + secret_word;
}
