const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const resultScreen = document.getElementById("result-screen");

const startButton = document.getElementById("start-button");
const restartButton = document.getElementById("restart-button");
const nextButton = document.getElementById("next-button");

const roundLabel = document.getElementById("round-label");
const timerLabel = document.getElementById("timer");
const playerScoreLabel = document.getElementById("player-score");
const robotScoreLabel = document.getElementById("robot-score");

const playerHand = document.getElementById("player-hand");
const robotHand = document.getElementById("robot-hand");
const message = document.getElementById("message");
const countdownMessage = document.getElementById("countdown-message");
const choices = document.getElementById("choices");

const finalEmoji = document.getElementById("final-emoji");
const finalTitle = document.getElementById("final-title");
const finalMessage = document.getElementById("final-message");
const finalPlayerScore = document.getElementById("final-player-score");
const finalRobotScore = document.getElementById("final-robot-score");

const moves = {
    rock: { name: "سنگ", emoji: "✊" },
    paper: { name: "کاغذ", emoji: "✋" },
    scissors: { name: "قیچی", emoji: "✌️" }
};

const moveNames = Object.keys(moves);

let round = 1;
let playerScore = 0;
let robotScore = 0;
let seconds = 5;
let timerId = null;
let roundFinished = false;

function toPersianNumber(number) {
    return String(number).replace(/\d/g, digit => "۰۱۲۳۴۵۶۷۸۹"[digit]);
}

function showScreen(screen) {
    startScreen.hidden = screen !== "start";
    gameScreen.hidden = screen !== "game";
    resultScreen.hidden = screen !== "result";
}

function updateScore() {
    playerScoreLabel.textContent = toPersianNumber(playerScore);
    robotScoreLabel.textContent = toPersianNumber(robotScore);
    roundLabel.textContent =`دور ${toPersianNumber(round)} از ۵`
}

function updateTimer() {
    timerLabel.textContent =`${toPersianNumber(seconds)} ثانیه`
    timerLabel.classList.toggle("urgent", seconds <= 2);
}

function stopTimer() {
    if (timerId !== null) {
        clearInterval(timerId);
        timerId = null;
    }
}

function randomMove() {
    const index = Math.floor(Math.random() * moveNames.length);
    return moveNames[index];
}

function setChoicesDisabled(disabled) {
    choices.querySelectorAll(".choice").forEach(button => {
        button.disabled = disabled;
    });
}

function resetRound() {
    stopTimer();

    seconds = 5;
    roundFinished = false;

    playerHand.textContent = "❔";
    robotHand.textContent = "🤖";
    message.textContent = "حرکتت رو انتخاب کن!";
    countdownMessage.textContent = "قبل از تمام شدن زمان انتخاب کن.";

    timerLabel.classList.remove("urgent");
    nextButton.hidden = true;

    choices.querySelectorAll(".choice").forEach(button => {
        button.classList.remove("selected");
    });

    setChoicesDisabled(false);
    updateScore();
    updateTimer();

    timerId = setInterval(() => {
        seconds--;
        updateTimer();

        if (seconds <= 0) {
            stopTimer();
            timeIsUp();
        }
    }, 1000);
}

function startGame() {
    round = 1;
    playerScore = 0;
    robotScore = 0;

    showScreen("game");
    resetRound();
}

function finishRound(playerMove, robotMove) {
    if (roundFinished) return;

    roundFinished = true;
    stopTimer();
    setChoicesDisabled(true);

    const player = moves[playerMove];
    const robot = moves[robotMove];

    playerHand.textContent = player.emoji;
    robotHand.textContent = robot.emoji;

    choices.querySelectorAll(".choice").forEach(button => {
        button.classList.toggle(
            "selected",
            button.dataset.move === playerMove
        );
    });

    if (playerMove === robotMove) {
        message.textContent = "مساوی شد! 🤝";
        countdownMessage.textContent =
           `هر دو ${player.name} رو انتخاب کردید.`
    } else if (
        (playerMove === "rock" && robotMove === "scissors") ||
        (playerMove === "paper" && robotMove === "rock") ||
        (playerMove === "scissors" && robotMove === "paper")
    ) {
        playerScore++;
        message.textContent = "این دور رو بردی! 🏆";
        countdownMessage.textContent =
           `${player.name}، ${robot.name} رو شکست داد.`
    } else {
        robotScore++;
        message.textContent = "این دور رو ربات برد! 🤖";
        countdownMessage.textContent =
           `${robot.name}، ${player.name} رو شکست داد.`
    }

    updateScore();
    nextButton.textContent =
        round === 5 ? "دیدن نتیجه نهایی" : "دور بعدی";
    nextButton.hidden = false;
}

function timeIsUp() {
    if (roundFinished) return;

    roundFinished = true;
    robotScore++;

    setChoicesDisabled(true);
    playerHand.textContent = "⏰";
    robotHand.textContent = "🤖";

    message.textContent = "زمان تموم شد!";
    countdownMessage.textContent =
        "این دور رو از دست دادی و یک امتیاز به ربات رسید.";

    updateScore();

    nextButton.textContent =
        round === 5 ? "دیدن نتیجه نهایی" : "دور بعدی";
    nextButton.hidden = false;
}

function nextRound() {
    if (!roundFinished) return;

    if (round >= 5) {
        showFinalResult();
        return;
    }

    round++;
    resetRound();
}

function showFinalResult() {
    stopTimer();
    showScreen("result");

    finalPlayerScore.textContent = toPersianNumber(playerScore);
    finalRobotScore.textContent = toPersianNumber(robotScore);

    if (playerScore > robotScore) {
        finalEmoji.textContent = "🏆";
        finalTitle.textContent = "تبریک! تو برنده شدی!";
        finalMessage.textContent =
            "آفرین! این رقابت رو از ربات بردی.";
    } else if (robotScore > playerScore) {
        finalEmoji.textContent = "🤖";
        finalTitle.textContent = "این بار ربات برنده شد!";
        finalMessage.textContent =
            "اشکالی نداره؛ دوباره تلاش کن!";
    } else {
        finalEmoji.textContent = "🤝";
        finalTitle.textContent = "بازی مساوی شد!";
        finalMessage.textContent =
            "تو و ربات امتیاز برابر گرفتید.";
    }
}

choices.querySelectorAll(".choice").forEach(button => {
    button.addEventListener("click", () => {
        if (roundFinished) return;

        const playerMove = button.dataset.move;
        const robotMove = randomMove();

        finishRound(playerMove, robotMove);
    });
});

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);
nextButton.addEventListener("click", nextRound);

// هنگام خروج از صفحه، تایمر متوقف می‌شود.
window.addEventListener("pagehide", stopTimer);

showScreen("start");
updateScore();