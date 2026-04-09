/**
 * Hangman Game Logic
 * Features: CSV Loading, Canvas Drawing, Modal UI, and Dual Input (Mouse + Keyboard)
 */

let words = [];
let selectedWord = "";
let guessedLetters = [];
let mistakes = 0;
let gameActive = false; // Prevents typing after game ends

const canvas = document.getElementById("hangman-canvas");
const ctx = canvas.getContext("2d");
const wordDisplay = document.getElementById("word-display");
const keyboard = document.getElementById("keyboard");
const modal = document.getElementById("game-modal");
const modalTitle = document.getElementById("modal-title");
const modalMessage = document.getElementById("modal-message");

const drawStage = [
    () => drawLine(10, 240, 190, 240), // Base
    () => drawLine(50, 240, 50, 20),   // Pole
    () => drawLine(50, 20, 150, 20),   // Beam
    () => drawLine(150, 20, 150, 50),  // Rope
    () => { ctx.beginPath(); ctx.arc(150, 70, 20, 0, Math.PI*2); ctx.stroke(); }, // Head
    () => drawLine(150, 90, 150, 170), // Body
    () => drawLine(150, 110, 120, 140),// L-Arm
    () => drawLine(150, 110, 180, 140),// R-Arm
    () => drawLine(150, 170, 120, 210),// L-Leg
    () => drawLine(150, 170, 180, 210) // R-Leg
];

function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

async function loadWords() {
    try {
        const response = await fetch('words.csv');
        const text = await response.text();
        words = text.split(',').map(w => w.trim().toUpperCase()).filter(w => w !== "");
        initGame();
    } catch (err) {
        wordDisplay.innerText = "Error: words.csv not found";
    }
}

function initGame() {
    if (words.length === 0) return;
    mistakes = 0;
    guessedLetters = [];
    selectedWord = words[Math.floor(Math.random() * words.length)];
    gameActive = true;
    
    modal.classList.add("hidden");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#34495e";

    renderWord();
    createKeyboard();
}

function renderWord() {
    const display = selectedWord.split("").map(l => guessedLetters.includes(l) ? l : "_").join(" ");
    wordDisplay.innerText = display;
    if (selectedWord && !display.includes("_")) showEndScreen(true);
}

function createKeyboard() {
    keyboard.innerHTML = "";
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(letter => {
        const btn = document.createElement("button");
        btn.innerText = letter;
        btn.id = `btn-${letter}`; // Assign ID for keyboard reference
        btn.onclick = () => handleInput(letter);
        keyboard.appendChild(btn);
    });
}

function handleInput(letter) {
    if (!gameActive || guessedLetters.includes(letter) || mistakes >= drawStage.length) return;

    // Find the onscreen button and disable it
    const btn = document.getElementById(`btn-${letter}`);
    if (btn) btn.disabled = true;

    if (selectedWord.includes(letter)) {
        if (!guessedLetters.includes(letter)) {
            guessedLetters.push(letter);
            renderWord();
        }
    } else {
        guessedLetters.push(letter); // Mark as guessed even if wrong
        if (drawStage[mistakes]) drawStage[mistakes]();
        mistakes++;
        if (mistakes >= drawStage.length) showEndScreen(false);
    }
}

function showEndScreen(isWin) {
    gameActive = false;
    modal.classList.remove("hidden");
    modalTitle.innerText = isWin ? "Victory!" : "Defeat!";
    modalTitle.style.color = isWin ? "#2ecc71" : "#e74c3c";
    modalMessage.innerText = isWin ? `You guessed it: ${selectedWord}` : `The correct word was: ${selectedWord}`;
}

/** * KEYBOARD INPUT SUPPORT
 * This listens for physical key presses on your keyboard.
 */
window.addEventListener("keydown", (event) => {
    const key = event.key.toUpperCase();
    
    // Check if the key is a single letter between A and Z
    if (key.length === 1 && key >= "A" && key <= "Z") {
        handleInput(key);
    }
    
    // Allow 'Enter' to restart when modal is visible
    if (event.key === "Enter" && !modal.classList.contains("hidden")) {
        initGame();
    }
});

document.getElementById("reset-btn").onclick = initGame;
document.getElementById("modal-reset-btn").onclick = initGame;

loadWords();