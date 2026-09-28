function startGame() {
    // Gather game settings
    const word_length = document.querySelector(".wordlength").value;
    const attempts = document.querySelector(".attempts").value;

    localStorage.setItem('wordlength', word_length);
    localStorage.setItem('attempts', attempts);

    console.log("Starting game with " + word_length + " letter words, " + attempts + " attempts");

    fetch('wordlists/'+word_length+'.txt').then(response => {console.log(response)});

    // Hide main menu and show game div
    const main_menu = document.querySelector(".mainmenu");
    main_menu.style.visibility = "hidden";

    const game = document.querySelector(".game");
    game.style.visibility = "visible";

    // populate board
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

function guess() {
    const board = document.querySelector(".board");
    const attempt = localStorage.getItem('current_attempt');
    if (attempt >= board.children.length)
    {
        return;
    }
    const guess = board.children[attempt].children[0].value;

    if (guess.length < localStorage.getItem('wordlength'))
    {
        return;
    }

    localStorage.setItem('current_attempt', Number(attempt) + 1);
    enableAndSelectCurrent();
}
