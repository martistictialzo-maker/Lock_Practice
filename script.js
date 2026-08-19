// ======================================================
// BEIJING LOCK MATCHING PRACTICE
// ======================================================


// ======================================================
// CONFIGURATION
// ======================================================

const TOTAL_SETS = 5;

const LOCK_COUNT = 10;

const PENALTY_SECONDS = 3;

const TOTAL_LOCK_IMAGES = 18;


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

let penaltyTime = 0;

let completedTimes = [];

let gameFinished = false;

let acceptingClicks = false;

let countdownRunning = false;


// ======================================================
// GET LOCK IMAGE
// ======================================================

function getLockImage(number) {

    return `images/Lock${number}.png`;

}


// ======================================================
// CREATE RANDOM LOCK SET
// ======================================================

function createLockSet() {

    /*
        10 TOTAL CARDS

        9 different lock images
        +
        1 duplicate

        Example:

        Lock3
        Lock7
        Lock12
        Lock3  <-- matching pair
        Lock1
        Lock15
        Lock5
        Lock9
        Lock18
        Lock2
    */


    const available =
        Array.from(
            {
                length: TOTAL_LOCK_IMAGES
            },
            (_, index) => index + 1
        );


    // Shuffle all available locks

    shuffleArray(available);


    // Pick 9 unique images

    const selected =
        available.slice(0, 9);


    // Randomly choose which image gets duplicated

    const pairIndex =
        Math.floor(
            Math.random() * selected.length
        );


    const pairLock =
        selected[pairIndex];


    // 9 unique + 1 duplicate = 10 cards

    const cards = [
        ...selected,
        pairLock
    ];


    // Randomize their positions

    shuffleArray(cards);


    return {
        cards: cards,
        pairLock: pairLock
    };

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
// START GAME
// ======================================================

function startGame() {

    currentSet = 1;

    completedTimes = [];

    gameFinished = false;

    acceptingClicks = true;

    penaltyTime = 0;

    selectedLocks = [];

    setTimes.innerHTML = "";

    finalResult.style.display = "none";

    timerDisplay.textContent = "0.00";

    startSet();

}


// ======================================================
// START SET
// ======================================================

function startSet() {

    clearInterval(timerInterval);

    selectedLocks = [];

    penaltyTime = 0;

    acceptingClicks = true;

    gameFinished = false;


    // Update set number

    setNumberDisplay.textContent =
        currentSet;


    // Reset message

    message.textContent =
        "Find the matching pair!";

    message.classList.remove(
        "penalty"
    );


    // Generate new lock set

    const generated =
        createLockSet();


    currentPairId =
        generated.pairLock;


    // Clear old locks

    lockBoard.innerHTML = "";


    // Create all 10 lock cards

    generated.cards.forEach(
        (lockNumber, index) => {

            const card =
                document.createElement("button");


            card.type = "button";


            card.className =
                "lockCard";


            card.dataset.lock =
                lockNumber;


            card.dataset.index =
                index;


            // Create image

            const image =
                document.createElement("img");


            image.src =
                getLockImage(lockNumber);


            image.alt =
                `Lock ${lockNumber}`;


            // Add image to card

            card.appendChild(image);


            // Add card to board

            lockBoard.appendChild(card);


            // Click event

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


    const displayedTime =
        elapsed + penaltyTime;


    timerDisplay.textContent =
        displayedTime.toFixed(2);

}


// ======================================================
// SELECT LOCK
// ======================================================

function selectLock(card) {

    // BLOCK ALL CLICKING
    // during wrong-pair penalty

    if (!acceptingClicks) {
        return;
    }


    // Ignore if already selected

    if (
        selectedLocks.includes(card)
    ) {
        return;
    }


    // Ignore completed pair

    if (
        card.classList.contains("correct")
    ) {
        return;
    }


    // Select card

    card.classList.add(
        "selected"
    );


    selectedLocks.push(card);


    // Wait for second card

    if (
        selectedLocks.length < 2
    ) {

        return;

    }


    // Two cards selected

    checkPair();

}


// ======================================================
// CHECK PAIR
// ======================================================

function checkPair() {

    // Immediately block additional clicks

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
    // CORRECT PAIR
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


        // Calculate set time

        const elapsed =
            (
                performance.now()
                -
                setStartTime
            ) / 1000;


        const finalSetTime =
            elapsed + penaltyTime;


        // Save result

        completedTimes.push(
            finalSetTime
        );


        addSetResult(
            currentSet,
            finalSetTime
        );


        // Move to next set

        setTimeout(
            () => {

                if (
                    currentSet >= TOTAL_SETS
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
    // WRONG PAIR
    // ==================================================

    first.classList.add(
        "wrong"
    );


    second.classList.add(
        "wrong"
    );


    message.textContent =
        `✗ Wrong! +${PENALTY_SECONDS} seconds penalty`;


    message.classList.add(
        "penalty"
    );


    // Add 3-second penalty

    penaltyTime +=
        PENALTY_SECONDS;


    // ==================================================
    // IMPORTANT
    // ==================================================
    //
    // NO CLICKING IS ALLOWED
    // DURING THE FULL 3 SECONDS.
    //

    acceptingClicks = false;


    // Wait exactly 3 seconds

    setTimeout(
        () => {

            first.classList.remove(
                "selected",
                "wrong"
            );


            second.classList.remove(
                "selected",
                "wrong"
            );


            selectedLocks = [];


            // Allow clicking again

            acceptingClicks = true;


            message.textContent =
                "Try again!";


            message.classList.remove(
                "penalty"
            );

        },
        PENALTY_SECONDS * 1000
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


    // Calculate total

    const total =
        completedTimes.reduce(
            (sum, time) =>
                sum + time,
            0
        );


    // Calculate average

    const average =
        total /
        completedTimes.length;


    // Display average in timer

    timerDisplay.textContent =
        average.toFixed(2);


    // Message

    message.textContent =
        "🏆 All 5 sets completed!";


    // Final results

    finalTotal.textContent =
        `Total: ${total.toFixed(2)} seconds`;


    finalAverage.textContent =
        `Average: ${average.toFixed(2)} seconds`;


    finalResult.style.display =
        "block";

}


// ======================================================
// COUNTDOWN
// ======================================================

function runCountdown() {

    if (countdownRunning) {
        return;
    }


    countdownRunning = true;

    acceptingClicks = false;


    // Hide start screen

    startScreen.style.display =
        "none";


    // Show countdown

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


                // GO

                countdown.textContent =
                    "GO!";


                clearInterval(
                    countdownInterval
                );


                // Short GO display

                setTimeout(
                    () => {

                        countdown.style.display =
                            "none";


                        countdownRunning =
                            false;


                        // Create locks
                        // and start timer

                        startGame();

                    },
                    500
                );

            },
            1000
        );

}


// ======================================================
// START BUTTON
// ======================================================

startButton.addEventListener(
    "click",
    () => {

        runCountdown();

    }
);


// ======================================================
// RESET BUTTON
// ======================================================

resetButton.addEventListener(
    "click",
    () => {

        // Stop timer

        clearInterval(
            timerInterval
        );


        // Reset everything

        currentSet = 1;

        selectedLocks = [];

        completedTimes = [];

        penaltyTime = 0;

        gameFinished = false;

        acceptingClicks = false;


        // Clear board

        lockBoard.innerHTML = "";


        // Reset display

        timerDisplay.textContent =
            "0.00";


        setNumberDisplay.textContent =
            "1";


        message.textContent =
            "Find the matching pair!";


        message.classList.remove(
            "penalty"
        );


        setTimes.innerHTML =
            "";


        finalResult.style.display =
            "none";


        // Show START screen

        startScreen.style.display =
            "flex";


        countdown.style.display =
            "none";


        countdownRunning =
            false;

    }
);