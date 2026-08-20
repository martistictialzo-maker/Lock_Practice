// ======================================================
// BEIJING LOCK MATCHING PRACTICE
// ======================================================


// ======================================================
// CONFIGURATION
// ======================================================

const TOTAL_SETS = 5;

const LOCK_COUNT = 10;

const WRONG_COOLDOWN_SECONDS = 3;

const TOTAL_LOCK_IMAGES = 20;


// ======================================================
// ELEMENTS
// ======================================================

const lockBoard =
    document.getElementById("lockBoard");

const timerDisplay =
    document.getElementById("timer");

const setNumberDisplay =
    document.getElementById("setNumber");

const message =
    document.getElementById("message");

const setTimes =
    document.getElementById("setTimes");

const resetButton =
    document.getElementById("resetButton");

const finalResult =
    document.getElementById("finalResult");

const finalTotal =
    document.getElementById("finalTotal");

const finalAverage =
    document.getElementById("finalAverage");

const startScreen =
    document.getElementById("startScreen");

const startButton =
    document.getElementById("startButton");

const countdown =
    document.getElementById("countdown");


// ======================================================
// GAME VARIABLES
// ======================================================

let currentSet = 1;

let selectedLocks = [];

let currentPairId = null;

let setStartTime = 0;

let timerInterval = null;

let completedTimes = [];

let gameFinished = false;

let acceptingClicks = false;

let countdownRunning = false;

let wrongCooldownTimeout = null;


// ======================================================
// GET LOCK IMAGE
// ======================================================

function getLockImage(number) {

    return `images/Lock${number}.png`;

}


// ======================================================
// SHUFFLE
// ======================================================

function shuffleArray(array) {

    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            array[i],
            array[j]
        ] =
        [
            array[j],
            array[i]
        ];

    }

}


// ======================================================
// CREATE LOCK SET
// ======================================================

function createLockSet() {

    /*
        10 total cards.

        9 different lock images.

        1 of those 9 is duplicated.
    */


    const available =
        Array.from(
            {
                length: TOTAL_LOCK_IMAGES
            },
            (_, index) => index + 1
        );


    // Shuffle all 20 locks

    shuffleArray(available);


    // Take 9 unique locks

    const selected =
        available.slice(0, 9);


    // Pick one to duplicate

    const pairIndex =
        Math.floor(
            Math.random() *
            selected.length
        );


    const pairLock =
        selected[pairIndex];


    // Create 10 cards

    const cards = [
        ...selected,
        pairLock
    ];


    // Shuffle card positions

    shuffleArray(cards);


    return {

        cards: cards,

        pairLock: pairLock

    };

}


// ======================================================
// START BUTTON
// ======================================================

startButton.addEventListener(
    "click",
    startCountdown
);


// ======================================================
// COUNTDOWN
// ======================================================

function startCountdown() {

    if (countdownRunning) {
        return;
    }


    countdownRunning = true;


    startScreen.style.display =
        "none";


    countdown.style.display =
        "flex";


    let count = 3;


    countdown.textContent =
        count;


    const countdownInterval =
        setInterval(
            () => {

                count--;


                if (count > 0) {

                    countdown.textContent =
                        count;

                    return;

                }


                if (count === 0) {

                    countdown.textContent =
                        "GO!";

                    return;

                }

            },
            1000
        );


    setTimeout(
        () => {

            clearInterval(
                countdownInterval
            );


            countdown.style.display =
                "none";


            countdownRunning =
                false;


            startGame();

        },
        4000
    );

}


// ======================================================
// START GAME
// ======================================================

function startGame() {

    clearInterval(
        timerInterval
    );


    if (wrongCooldownTimeout) {

        clearTimeout(
            wrongCooldownTimeout
        );

        wrongCooldownTimeout =
            null;

    }


    currentSet = 1;

    completedTimes = [];

    gameFinished = false;

    acceptingClicks = false;

    selectedLocks = [];

    setTimes.innerHTML = "";

    finalResult.style.display =
        "none";


    timerDisplay.textContent =
        "0.00";


    startSet();

}


// ======================================================
// START SET
// ======================================================

function startSet() {

    clearInterval(
        timerInterval
    );


    if (wrongCooldownTimeout) {

        clearTimeout(
            wrongCooldownTimeout
        );

        wrongCooldownTimeout =
            null;

    }


    selectedLocks = [];

    acceptingClicks = true;

    gameFinished = false;


    setNumberDisplay.textContent =
        currentSet;


    message.textContent =
        "Find the matching pair!";


    message.classList.remove(
        "penalty"
    );


    // Generate cards

    const generated =
        createLockSet();


    currentPairId =
        generated.pairLock;


    // Clear old cards

    lockBoard.innerHTML = "";


    // Create the 10 cards

    generated.cards.forEach(
        (lockNumber, index) => {

            const card =
                document.createElement(
                    "button"
                );


            card.type =
                "button";


            card.className =
                "lockCard";


            card.dataset.lock =
                lockNumber;


            card.dataset.index =
                index;


            const image =
                document.createElement(
                    "img"
                );


            image.src =
                getLockImage(
                    lockNumber
                );


            image.alt =
                `Lock ${lockNumber}`;


            card.appendChild(
                image
            );


            lockBoard.appendChild(
                card
            );


            card.addEventListener(
                "click",
                () => {

                    selectLock(card);

                }
            );

        }
    );


    // Start timer

    setStartTime =
        performance.now();


    timerDisplay.textContent =
        "0.00";


    timerInterval =
        setInterval(
            updateTimer,
            10
        );

}


// ======================================================
// TIMER
// ======================================================

function updateTimer() {

    if (gameFinished) {
        return;
    }


    const elapsed =
        (
            performance.now()
            -
            setStartTime
        ) / 1000;


    // NO PENALTY TIME IS ADDED.
    // Wrong guesses simply cause a 3-second
    // period where the player cannot click.

    timerDisplay.textContent =
        elapsed.toFixed(2);

}


// ======================================================
// SELECT LOCK
// ======================================================

function selectLock(card) {

    // Completely block clicks during cooldown

    if (!acceptingClicks) {
        return;
    }


    // Don't select same card twice

    if (
        selectedLocks.includes(card)
    ) {

        return;

    }


    // Don't select completed card

    if (
        card.classList.contains(
            "correct"
        )
    ) {

        return;

    }


    // Select card

    card.classList.add(
        "selected"
    );


    selectedLocks.push(
        card
    );


    // Wait for second card

    if (
        selectedLocks.length < 2
    ) {

        return;

    }


    checkPair();

}


// ======================================================
// CHECK PAIR
// ======================================================

function checkPair() {

    // Lock board immediately

    acceptingClicks = false;


    const first =
        selectedLocks[0];


    const second =
        selectedLocks[1];


    const firstLock =
        Number(
            first.dataset.lock
        );


    const secondLock =
        Number(
            second.dataset.lock
        );


    // ==================================================
    // CORRECT
    // ==================================================

    if (
        firstLock === secondLock
    ) {

        first.classList.remove(
            "selected"
        );


        second.classList.remove(
            "selected"
        );


        first.classList.add(
            "correct"
        );


        second.classList.add(
            "correct"
        );


        message.textContent =
            "✓ Correct!";


        // Stop timer

        clearInterval(
            timerInterval
        );


        const elapsed =
            (
                performance.now()
                -
                setStartTime
            ) / 1000;


        const finalSetTime =
            elapsed;


        completedTimes.push(
            finalSetTime
        );


        addSetResult(
            currentSet,
            finalSetTime
        );


        // Next set

        setTimeout(
            () => {

                if (
                    currentSet >=
                    TOTAL_SETS
                ) {

                    finishGame();

                    return;

                }


                currentSet++;

                startSet();

            },
            700
        );


        return;

    }


    // ==================================================
    // WRONG
    // ==================================================

    first.classList.add(
        "wrong"
    );


    second.classList.add(
        "wrong"
    );


    message.textContent =
        `✗ Wrong! Wait ${WRONG_COOLDOWN_SECONDS} seconds`;


    message.classList.add(
        "penalty"
    );


    /*
        IMPORTANT:

        The two wrong cards stay dark.

        The player cannot click ANYTHING
        for exactly 3 seconds.

        The timer DOES NOT receive +3 seconds.
    */


    wrongCooldownTimeout =
        setTimeout(
            () => {

                // Remove dark/wrong appearance

                first.classList.remove(
                    "selected",
                    "wrong"
                );


                second.classList.remove(
                    "selected",
                    "wrong"
                );


                // Clear the previous selection

                selectedLocks = [];


                // Allow clicking again

                acceptingClicks = true;


                // Reset message

                message.textContent =
                    "Find the matching pair!";


                message.classList.remove(
                    "penalty"
                );


                wrongCooldownTimeout =
                    null;

            },
            WRONG_COOLDOWN_SECONDS * 1000
        );

}


// ======================================================
// ADD SET RESULT
// ======================================================

function addSetResult(
    set,
    time
) {

    const result =
        document.createElement(
            "div"
        );


    result.className =
        "resultItem";


    result.textContent =
        `Set ${set}: ${time.toFixed(2)}s`;


    setTimes.appendChild(
        result
    );

}


// ======================================================
// FINISH GAME
// ======================================================

function finishGame() {

    gameFinished = true;

    acceptingClicks = false;


    clearInterval(
        timerInterval
    );


    const total =
        completedTimes.reduce(
            (sum, time) =>
                sum + time,
            0
        );


    const average =
        total /
        completedTimes.length;


    timerDisplay.textContent =
        average.toFixed(2);


    message.textContent =
        "🏆 All 5 sets completed!";


    finalTotal.textContent =
        `Total: ${total.toFixed(2)} seconds`;


    finalAverage.textContent =
        `Average: ${average.toFixed(2)} seconds`;


    finalResult.style.display =
        "block";

}


// ======================================================
// RESET
// ======================================================

resetButton.addEventListener(
    "click",
    () => {

        clearInterval(
            timerInterval
        );


        if (wrongCooldownTimeout) {

            clearTimeout(
                wrongCooldownTimeout
            );

            wrongCooldownTimeout =
                null;

        }


        lockBoard.innerHTML =
            "";


        startScreen.style.display =
            "flex";


        countdown.style.display =
            "none";


        timerDisplay.textContent =
            "0.00";


        message.textContent =
            "Find the matching pair!";


        message.classList.remove(
            "penalty"
        );


        currentSet = 1;

        completedTimes = [];

        selectedLocks = [];

        acceptingClicks = false;

        gameFinished = false;

        countdownRunning = false;

        setTimes.innerHTML = "";

        finalResult.style.display =
            "none";

    }
);