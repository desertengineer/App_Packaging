let board = [];
let score = 0;
let bestScore = localStorage.getItem('tileMasterBestScore') || 0;
let gameWon = false;
let gameLost = false;
let soundEnabled = true;

const newGameBtn = document.getElementById('new-game-btn');
const soundBtn = document.getElementById('sound-btn');
const tilesContainer = document.getElementById('tiles-container');
const scoreElement = document.getElementById('score');
const bestScoreElement = document.getElementById('best-score');
const overlay = document.getElementById('message-overlay');
const msgTitle = document.getElementById('message-title');
const msgSub = document.getElementById('message-subtitle');
const continueBtn = document.getElementById('continue-btn');
const overlayNewGameBtn = document.getElementById('overlay-new-game-btn');

const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

function initAudio() {
    if (!audioCtx) audioCtx = new AudioContext();
}

function playMergeSound() {
    if (!soundEnabled) return;
    initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}

function playMilestoneSound() {
    if (!soundEnabled) return;
    initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, index) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;

        const startTime = audioCtx.currentTime + (index * 0.1);
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.3);
    });
}

function initGame() {
    console.log("Initializing game...");
    if (!tilesContainer) return;

    board = [...Array(4)].map(() => Array(4).fill(0));
    score = 0;
    gameWon = false;
    gameLost = false;
    hideMessage();
    updateScore();

    let t1 = addRandomTile();
    let t2 = addRandomTile();

    renderBoard([t1, t2]);
}

function updateScore() {
    scoreElement.innerText = score;
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('tileMasterBestScore', bestScore);
    }
    bestScoreElement.innerText = bestScore;
}

function addRandomTile() {
    let emptyCells = [];
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (board[r][c] === 0) emptyCells.push({ r, c });
        }
    }
    if (emptyCells.length > 0) {
        let randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        board[randomCell.r][randomCell.c] = Math.random() < 0.9 ? 2 : 4;
        return randomCell;
    }
    return null;
}

function renderBoard(newTiles = [], mergedTiles = []) {
    tilesContainer.innerHTML = '';
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            let val = board[r][c];
            if (val !== 0) {
                let cellWrapper = document.createElement('div');
                cellWrapper.style.gridColumnStart = c + 1;
                cellWrapper.style.gridRowStart = r + 1;

                let tile = document.createElement('div');
                tile.className = `tile tile-${val > 2048 ? 2048 : val}`;
                tile.innerText = val;

                let isNew = newTiles.some(t => t.r === r && t.c === c);
                let isMerged = mergedTiles.some(t => t.r === r && t.c === c);

                if (isNew || isMerged) tile.classList.add('tile-new');

                if (isMerged) {
                    playMergeSound();
                    if (val >= 512) {
                        playMilestoneSound();
                        tile.classList.add('milestone-animation');
                    }
                }

                cellWrapper.appendChild(tile);
                tilesContainer.appendChild(cellWrapper);
            }
        }
    }
}

function slideAndMerge(row) {
    let filtered = row.filter(val => val !== 0);
    let newRow = [];
    let mergedIdxs = [];
    for (let i = 0; i < filtered.length; i++) {
        if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
            let newVal = filtered[i] * 2;
            newRow.push(newVal);
            score += newVal;
            mergedIdxs.push(newRow.length - 1);
            i++;
        } else {
            newRow.push(filtered[i]);
        }
    }
    while (newRow.length < 4) newRow.push(0);
    return { newRow, mergedIdxs };
}

function move(direction) {
    if ((gameWon && overlay.classList.contains('active')) || gameLost) return;

    let oldBoard = JSON.stringify(board);
    let mergedTiles = [];

    if (direction === 'left') {
        for (let r = 0; r < 4; r++) {
            let { newRow, mergedIdxs } = slideAndMerge(board[r]);
            board[r] = newRow;
            mergedIdxs.forEach(c => mergedTiles.push({ r, c }));
        }
    } else if (direction === 'right') {
        for (let r = 0; r < 4; r++) {
            let { newRow, mergedIdxs } = slideAndMerge([...board[r]].reverse());
            board[r] = newRow.reverse();
            mergedIdxs.forEach(c => mergedTiles.push({ r: r, c: 3 - c }));
        }
    } else if (direction === 'up') {
        for (let c = 0; c < 4; c++) {
            let col = [board[0][c], board[1][c], board[2][c], board[3][c]];
            let { newRow, mergedIdxs } = slideAndMerge(col);
            for (let r = 0; r < 4; r++) board[r][c] = newRow[r];
            mergedIdxs.forEach(r => mergedTiles.push({ r, c }));
        }
    } else if (direction === 'down') {
        for (let c = 0; c < 4; c++) {
            let col = [board[3][c], board[2][c], board[1][c], board[0][c]];
            let { newRow, mergedIdxs } = slideAndMerge(col);
            newRow.reverse();
            for (let r = 0; r < 4; r++) board[r][c] = newRow[r];
            mergedIdxs.forEach(r => mergedTiles.push({ r: 3 - r, c: c }));
        }
    }

    if (oldBoard !== JSON.stringify(board)) {
        let newTile = addRandomTile();
        renderBoard(newTile ? [newTile] : [], mergedTiles);
        updateScore();
        checkGameState();
    }
}

function checkGameState() {
    let won = false;
    let hasZero = false;
    let canMerge = false;

    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (board[r][c] === 2048) won = true;
            if (board[r][c] === 0) hasZero = true;
            if (c < 3 && board[r][c] === board[r][c + 1]) canMerge = true;
            if (r < 3 && board[r][c] === board[r + 1][c]) canMerge = true;
        }
    }

    if (won && !gameWon) {
        gameWon = true;
        showMessage("You Win!", "You reached 2048! Keep playing to increase your score.");
    } else if (!hasZero && !canMerge && !gameWon) {
        gameLost = true;
        showMessage("Game Over!", "No more moves available.");
    }
}

function showMessage(title, subtitle) {
    msgTitle.innerText = title;
    msgSub.innerText = subtitle;
    overlay.classList.add('active');

    if (title === "You Win!") {
        continueBtn.style.display = 'block';
    } else {
        continueBtn.style.display = 'none';
    }
}

function hideMessage() {
    overlay.classList.remove('active');
}

// Event Listeners
newGameBtn.addEventListener('click', initGame);
overlayNewGameBtn.addEventListener('click', initGame);
continueBtn.addEventListener('click', hideMessage);

const iconSoundOn = document.getElementById('icon-sound-on');
const iconSoundOff = document.getElementById('icon-sound-off');

soundBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;

    if (soundEnabled) {
        iconSoundOn.style.display = 'block';
        iconSoundOff.style.display = 'none';
        soundBtn.classList.remove('btn-muted');
        soundBtn.classList.add('btn-secondary');
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    } else {
        iconSoundOn.style.display = 'none';
        iconSoundOff.style.display = 'block';
        soundBtn.classList.remove('btn-secondary');
        soundBtn.classList.add('btn-muted');
    }
});

document.body.addEventListener('click', initAudio, { once: true });
document.body.addEventListener('touchstart', initAudio, { once: true });

document.addEventListener('keydown', (e) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
    switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': move('up'); break;
        case 'ArrowDown': case 's': case 'S': move('down'); break;
        case 'ArrowLeft': case 'a': case 'A': move('left'); break;
        case 'ArrowRight': case 'd': case 'D': move('right'); break;
    }
}, { passive: false });

let touchStartX = 0, touchStartY = 0;
const gridElement = document.getElementById('grid');

gridElement.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

gridElement.addEventListener("touchmove", (e) => {
    e.preventDefault();
}, { passive: false });

gridElement.addEventListener("touchend", (e) => {
    const diffX = e.changedTouches[0].screenX - touchStartX;
    const diffY = e.changedTouches[0].screenY - touchStartY;
    const threshold = 50;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > threshold) {
            if (diffX > 0) move('right'); else move('left');
        }
    } else {
        if (Math.abs(diffY) > threshold) {
            if (diffY > 0) move('down'); else move('up');
        }
    }
}, { passive: true });


window.addEventListener("load", () => {
    initGame();
});