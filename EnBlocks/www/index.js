// ==========================================
// Core Variables & Setup
// ==========================================
const BOARD_SIZE = 8;
const TARGET_VS_SCORE = 5000;
const TOTAL_LEVELS = 50;

const COLORS = {
    red: '#ff3b30',
    orange: '#ff9500',
    yellow: '#ffcc00',
    green: '#4cd964',
    lightblue: '#5ac8fa',
    blue: '#007aff',
    purple: '#5856d6',
    pink: '#ff2d55'
};
const COLOR_ARRAY = Object.values(COLORS);
const THEMES = [
    { top: '#1b63c6', bottom: '#124088' },
    { top: '#4a00e0', bottom: '#8e2de2' },
    { top: '#ff416c', bottom: '#ff4b2b' },
    { top: '#0f2027', bottom: '#2c5364' },
    { top: '#11998e', bottom: '#38ef7d' }
];

const SHAPES = [
    { m: [[1]] }, { m: [[1, 1], [1, 1]] }, { m: [[1, 1, 1], [1, 1, 1], [1, 1, 1]] },
    { m: [[1, 1]] }, { m: [[1], [1]] }, { m: [[1, 1, 1]] }, { m: [[1], [1], [1]] },
    { m: [[1, 1, 1, 1]] }, { m: [[1], [1], [1], [1]] }, { m: [[1, 1, 1, 1, 1]] }, { m: [[1], [1], [1], [1], [1]] },
    { m: [[1, 0], [1, 1]] }, { m: [[0, 1], [1, 1]] }, { m: [[1, 1], [1, 0]] }, { m: [[1, 1], [0, 1]] },
    { m: [[1, 0, 0], [1, 0, 0], [1, 1, 1]] }, { m: [[0, 0, 1], [0, 0, 1], [1, 1, 1]] },
    { m: [[1, 1, 1], [1, 0, 0], [1, 0, 0]] }, { m: [[1, 1, 1], [0, 0, 1], [0, 0, 1]] },
    { m: [[1, 1, 1], [0, 1, 0]] }, { m: [[0, 1, 0], [1, 1, 1]] }, { m: [[1, 0], [1, 1], [1, 0]] }, { m: [[0, 1], [1, 1], [0, 1]] },
    { m: [[1, 1, 0], [0, 1, 1]] }, { m: [[0, 1, 1], [1, 1, 0]] }
];
const GIANT_SHAPES = [
    { m: [[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]] },
    { m: [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]] }
];
const INTRO_SHAPES = [["01100110", "11111111", "11111111", "01111110", "00111100", "00011000", "00000000", "00000000"]];

let audioCtx = null;

let boardMeta = [];
let score = 0;
let comboCount = 0;
let dockPieces = [null, null, null];
let cellElements = [];
let isGameEnded = false;
let freeShufflesLeft = 1;
let videoRescuesUsed = 0;
let isRescueModalOpen = false;
let adTimerInterval = null;

let maxUnlockedLevel = parseInt(localStorage.getItem('BlitzMaxLevel')) || 1;
let currentAdventureLevel = 1;

let activeMod = null;
let lastPlayedMode = 'classic';

let isVsMode = false;
let robotDifficulty = 'easy';
let vsPlayerMeta = [], vsRobotMeta = [];
let vsPlayerCells = [], vsRobotCells = [];
let vsPlayerScore = 0, vsRobotScore = 0;
let vsPlayerDock = [null, null, null], vsRobotDock = [null, null, null];
let robotTurnTimeout = null;

// Pointer Events Unified Drag State
let isDragging = false;
let activePointerId = null;
let dragPieceObj = null;
let dragSlotIndex = -1;
let dragElement = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let hoverGridX = -1;
let hoverGridY = -1;
let boardCellSize = 0;

let musicVol = 0.5;
let sfxVol = 0.8;

// ==========================================
// Global Click Effect (Ripple)
// ==========================================
document.addEventListener('pointerdown', function (e) {
    let ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.left = e.clientX + 'px';
    ripple.style.top = e.clientY + 'px';
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
});

// ==========================================
// Shockwave Effect
// ==========================================
function createShockwave(x, y) {
    const wave = document.createElement('div');
    wave.className = 'placement-shockwave';
    wave.style.left = `${x}px`;
    wave.style.top = `${y}px`;
    document.body.appendChild(wave);
    setTimeout(() => wave.remove(), 600);
}

// ==========================================
// Audio
// ==========================================
function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playTone(freq, type, duration) {
    if (!audioCtx || sfxVol === 0) return;
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.1 * sfxVol, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) { }
}

function closeAudio() {
    if (audioCtx && audioCtx.state === 'running') {
        audioCtx.suspend().catch(() => { });
    }
}

// ==========================================
// Reset Data custom Confirm
// ==========================================
function confirmReset() { document.getElementById('reset-confirm-screen').classList.remove('hidden-screen'); }
function cancelReset() { document.getElementById('reset-confirm-screen').classList.add('hidden-screen'); }
function executeReset() { localStorage.clear(); location.reload(); }

// ==========================================
// UI Navigation
// ==========================================
window.onload = () => {
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden-screen');
        document.getElementById('start-screen').classList.remove('hidden-screen');
    }, 1000);
};

function applyTheme(index) {
    const root = document.documentElement;
    root.style.setProperty('--bg-color-top', THEMES[index].top);
    root.style.setProperty('--bg-color-bottom', THEMES[index].bottom);
}

function openSettings() { document.getElementById('settings-screen').classList.remove('hidden-screen'); }
function closeSettings() { document.getElementById('settings-screen').classList.add('hidden-screen'); }
function openRobotMenu() { document.getElementById('start-screen').classList.add('hidden-screen'); document.getElementById('robot-menu').classList.remove('hidden-screen'); }
function closeRobotMenu() { document.getElementById('robot-menu').classList.add('hidden-screen'); document.getElementById('start-screen').classList.remove('hidden-screen'); }

document.getElementById('music-slider').addEventListener('input', (e) => {
    musicVol = e.target.value / 100;
    document.getElementById('music-val').innerText = `${e.target.value}%`;
    e.target.setAttribute('aria-valuenow', e.target.value);
});
document.getElementById('sfx-slider').addEventListener('input', (e) => {
    sfxVol = e.target.value / 100;
    document.getElementById('sfx-val').innerText = `${e.target.value}%`;
    e.target.setAttribute('aria-valuenow', e.target.value);
    playTone(400, 'sine', 0.1);
});

function resetDragState() {
    isDragging = false;
    activePointerId = null;
    if (dragPieceObj && dragSlotIndex !== -1) {
        const slot = document.getElementById(`${getActiveDockPrefix()}-${dragSlotIndex}`);
        if (slot) slot.classList.remove('hidden-piece');
    }
    document.getElementById('drag-layer').innerHTML = '';
    dragElement = null;
    dragPieceObj = null;
    dragSlotIndex = -1;
    hoverGridX = -1;
    hoverGridY = -1;
    clearGhost();
}

function returnToMenu() {
    resetDragState();
    closeAudio();
    if (activeMod) activeMod.onEnd();

    if (robotTurnTimeout) {
        clearTimeout(robotTurnTimeout);
        robotTurnTimeout = null;
    }

    if (ModManager.mods.timeAttack.interval) {
        clearInterval(ModManager.mods.timeAttack.interval);
        ModManager.mods.timeAttack.interval = null;
    }

    if (adTimerInterval) {
        clearInterval(adTimerInterval);
        adTimerInterval = null;
    }

    const countdownInterval = document.getElementById('countdown-screen')?.intervalId;
    if (countdownInterval) clearInterval(countdownInterval);

    isVsMode = false;
    isGameEnded = true;
    isRescueModalOpen = false;
    document.getElementById('no-moves-modal').classList.add('hidden-screen');
    document.getElementById('game-over-screen').classList.add('hidden-screen');
    document.getElementById('level-complete-screen').classList.add('hidden-screen');
    document.getElementById('game-ui').classList.add('hidden');
    document.getElementById('game-ui').style.opacity = '0';
    document.getElementById('game-ui').style.pointerEvents = 'none';
    document.getElementById('vs-game-ui').classList.add('hidden');
    document.getElementById('vs-game-ui').style.opacity = '0';
    document.getElementById('vs-game-ui').style.pointerEvents = 'none';
    document.getElementById('start-screen').classList.remove('hidden-screen');
    applyTheme(0);
}

function retryCurrentMode() {
    document.getElementById('game-over-screen').classList.add('hidden-screen');
    if (isVsMode || lastPlayedMode === 'vs') {
        startVsMode(robotDifficulty);
    } else {
        startGame(lastPlayedMode);
    }
}

// ==========================================
// Mod Manager & Adventures
// ==========================================
function getLevelTarget(level) { return 1000 + (level * 500); }

function getAdventureLayout(level) {
    let layout = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill().map(() => ({ color: null, type: 'normal' })));
    if (level === 1) {
        layout[3][3] = { color: COLORS.lightblue, type: 'normal' };
        layout[4][4] = { color: COLORS.lightblue, type: 'normal' };
        return layout;
    }
    let seed = level % 5;
    if (seed === 2) {
        layout[0][0] = layout[0][7] = layout[7][0] = layout[7][7] = { color: COLORS.blue, type: 'normal' };
    } else if (seed === 3) {
        layout[3][3] = layout[3][4] = layout[4][3] = layout[4][4] = { color: COLORS.orange, type: 'normal' };
    } else if (seed === 4) {
        layout[2][2] = layout[2][5] = layout[5][2] = layout[5][5] = { color: COLORS.lightblue, type: 'normal' };
    } else {
        layout[1][1] = layout[1][6] = layout[6][1] = layout[6][6] = { color: COLORS.red, type: 'normal' };
    }
    if (level >= 5) {
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (layout[r][c].color) {
                    layout[r][c].type = 'ice';
                    layout[r][c].hp = 2;
                }
            }
        }
    }
    return layout;
}

const ModManager = {
    mods: {
        classic: {
            id: 'classic', name: 'Classic', icon: 'fa-cube', color: '#4cd964', desc: 'Original gameplay',
            onInit: () => { }, onPieceGenerated: (p) => p, onPlace: () => { }, onLineCleared: () => { }, onEnd: () => { }
        },
        adventure: {
            id: 'adventure', name: 'Adventure', icon: 'fa-compass', color: '#ff2d55', desc: 'Reach target score',
            onInit: function () {
                let target = getLevelTarget(currentAdventureLevel);
                document.getElementById('timer-ui').classList.remove('hidden');
                let label = document.getElementById('time-left');
                label.className = "flex flex-col items-center justify-center gap-1";
                label.innerHTML = `<div class="text-4xl md:text-5xl english-stroke text-white filter drop-shadow-lg">Level ${currentAdventureLevel}</div><div class="text-xl md:text-2xl english-stroke text-yellow-300 filter drop-shadow-md">Goal: ${target}</div>`;
            },
            onPieceGenerated: (p) => p,
            onPlace: function () {
                let target = getLevelTarget(currentAdventureLevel);
                if (score >= target && !isGameEnded) triggerLevelComplete();
            },
            onLineCleared: () => { },
            onEnd: () => {
                document.getElementById('timer-ui').classList.add('hidden');
                document.getElementById('time-left').innerHTML = "";
            }
        },
        lucky: {
            id: 'lucky', name: 'Lucky Blocks', icon: 'fa-star', color: '#ffcc00', desc: 'Mystery score bonuses!',
            onInit: () => { },
            onPieceGenerated: (p) => {
                if (Math.random() < 0.25) {
                    let r = Math.floor(Math.random() * p.matrix.length);
                    let c = Math.floor(Math.random() * p.matrix[0].length);
                    if (p.matrix[r][c]) {
                        if (!p.meta) p.meta = {};
                        p.meta[`${r},${c}`] = { type: 'lucky' };
                    }
                }
                return p;
            },
            onPlace: () => { },
            onLineCleared: (cells) => {
                let luckyFound = cells.filter(id => {
                    let [r, c] = id.split(',').map(Number);
                    return boardMeta[r][c] && boardMeta[r][c].type === 'lucky';
                }).length;
                if (luckyFound > 0) {
                    playTone(600, 'sine', 0.2);
                    showFloatingText(`Lucky! +${1000 * luckyFound}`, window.innerWidth / 2, window.innerHeight / 2, "txt-super");
                    addSingleScore(1000 * luckyFound);
                    applyTheme(Math.floor(Math.random() * THEMES.length));
                }
            },
            onEnd: () => { }
        },
        bomb: {
            id: 'bomb', name: 'Bombs', icon: 'fa-bomb', color: '#ff3b30', desc: 'Destroy before explode!',
            onInit: () => { },
            onPieceGenerated: (p) => {
                if (Math.random() < 0.15) {
                    let r = Math.floor(Math.random() * p.matrix.length);
                    let c = Math.floor(Math.random() * p.matrix[0].length);
                    if (p.matrix[r][c]) {
                        if (!p.meta) p.meta = {};
                        p.meta[`${r},${c}`] = { type: 'bomb', timer: 10 };
                    }
                }
                return p;
            },
            onPlace: () => {
                let exploded = false;
                for (let r = 0; r < BOARD_SIZE; r++) {
                    for (let c = 0; c < BOARD_SIZE; c++) {
                        let meta = boardMeta[r][c];
                        if (meta && meta.type === 'bomb') {
                            meta.timer--;
                            if (meta.timer <= 0) {
                                exploded = true;
                            } else {
                                let cEl = cellElements[r][c].querySelector('.bomb-counter');
                                if (cEl) cEl.innerText = meta.timer;
                            }
                        }
                    }
                }
                if (exploded) endSingleGame("Bomb Exploded!");
            },
            onLineCleared: (cells) => {
                let bombFound = cells.find(id => {
                    let [r, c] = id.split(',').map(Number);
                    return boardMeta[r][c] && boardMeta[r][c].type === 'bomb';
                });
                if (bombFound) {
                    playTone(150, 'sawtooth', 0.5);
                    addSingleScore(500);
                    showFloatingText(`Boom! +500`, window.innerWidth / 2, window.innerHeight / 2, "txt-blitz");
                    let [br, bc] = bombFound.split(',').map(Number);
                    for (let i = -1; i <= 1; i++) {
                        for (let j = -1; j <= 1; j++) {
                            let tr = br + i, tc = bc + j;
                            if (tr >= 0 && tr < BOARD_SIZE && tc >= 0 && tc < BOARD_SIZE && boardMeta[tr][tc].color) {
                                createPlaceParticles(cellElements[tr][tc], boardMeta[tr][tc].color);
                                boardMeta[tr][tc] = { color: null, type: 'normal' };
                            }
                        }
                    }
                }
            },
            onEnd: () => { }
        },
        timeAttack: {
            id: 'timeAttack', name: 'Time Attack', icon: 'fa-stopwatch', color: '#ff9500', desc: '3 minutes max score!',
            timeLeft: 180, interval: null,
            onInit: function () {
                document.getElementById('timer-ui').classList.remove('hidden');
                this.timeLeft = 180;
                this.updateUI();
                if (this.interval) clearInterval(this.interval);
                this.interval = setInterval(() => {
                    if (!isGameEnded && !isRescueModalOpen && document.getElementById('dock-shield').style.display !== 'block') {
                        this.timeLeft--;
                        this.updateUI();
                        if (this.timeLeft <= 0) endSingleGame("Time's Up!");
                    }
                }, 1000);
            },
            updateUI: function () {
                let label = document.getElementById('time-left');
                label.className = "text-4xl md:text-5xl english-stroke text-red-400 block";
                label.innerText = `${Math.floor(this.timeLeft / 60)}:${(this.timeLeft % 60).toString().padStart(2, '0')}`;
            },
            onPieceGenerated: (p) => p,
            onPlace: () => { },
            onLineCleared: () => { },
            onEnd: function () {
                if (this.interval) {
                    clearInterval(this.interval);
                    this.interval = null;
                }
                document.getElementById('timer-ui').classList.add('hidden');
            }
        },
        ice: {
            id: 'ice', name: 'Ice Age', icon: 'fa-snowflake', color: '#5ac8fa', desc: 'Clear twice!',
            onInit: () => { },
            onPieceGenerated: (p) => {
                if (Math.random() < 0.3) {
                    if (!p.meta) p.meta = {};
                    for (let r = 0; r < p.matrix.length; r++) {
                        for (let c = 0; c < p.matrix[0].length; c++) {
                            if (p.matrix[r][c]) p.meta[`${r},${c}`] = { type: 'ice', hp: 2 };
                        }
                    }
                }
                return p;
            },
            onPlace: () => { },
            onLineCleared: () => { },
            onEnd: () => { }
        },
        giant: {
            id: 'giant', name: 'Giants', icon: 'fa-maximize', color: '#ff2d55', desc: 'Giant blocks!',
            onInit: () => { }, onPieceGenerated: (p) => p, onPlace: () => { }, onLineCleared: () => { }, onEnd: () => { }
        }
    },
    getHighScore: function (id) { return parseInt(localStorage.getItem('BlitzScore_' + id)) || 0; },
    setHighScore: function (id, val) { localStorage.setItem('BlitzScore_' + id, val); }
};

// --- Menus Builders ---
function openLevelsMenu() {
    document.getElementById('start-screen').classList.add('hidden-screen');
    document.getElementById('levels-screen').classList.remove('hidden-screen');
    document.getElementById('unlocked-count').innerText = maxUnlockedLevel;
    let container = document.getElementById('levels-chain-container');
    container.innerHTML = '';
    let currentActiveNodeEl = null;

    for (let i = 1; i <= TOTAL_LEVELS; i++) {
        let row = document.createElement('div');
        row.className = 'level-node-row';
        let offsetClass = 'offset-center';
        let step = (i - 1) % 4;
        if (step === 1) offsetClass = 'offset-right';
        else if (step === 3) offsetClass = 'offset-left';

        let btn = document.createElement('button');
        let isUnlocked = i <= maxUnlockedLevel;
        let target = getLevelTarget(i);
        btn.className = `level-chain-btn ${offsetClass} ${isUnlocked ? 'level-unlocked' : 'level-locked'}`;

        if (isUnlocked) {
            btn.innerHTML = `<span class="english-stroke">${i}</span>`;
            let targetLbl = document.createElement('div');
            targetLbl.className = 'level-label-target';
            targetLbl.innerText = `Goal: ${target}`;
            btn.appendChild(targetLbl);
            if (i === maxUnlockedLevel) {
                let beacon = document.createElement('div');
                beacon.className = 'current-level-indicator';
                btn.appendChild(beacon);
                let badge = document.createElement('div');
                badge.className = 'current-tag-badge';
                badge.innerText = 'Play';
                btn.appendChild(badge);
                currentActiveNodeEl = row;
            }
            btn.onclick = () => {
                currentAdventureLevel = i;
                document.getElementById('levels-screen').classList.add('hidden-screen');
                startGame('adventure');
            };
        } else {
            btn.innerHTML = `<i class="fa-solid fa-lock text-gray-400"></i>`;
        }
        row.appendChild(btn);
        container.appendChild(row);
    }
    if (currentActiveNodeEl) {
        setTimeout(() => { currentActiveNodeEl.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 250);
    }
}

function returnToMenuFromLevels() {
    document.getElementById('levels-screen').classList.add('hidden-screen');
    document.getElementById('start-screen').classList.remove('hidden-screen');
}

function triggerLevelComplete() {
    isGameEnded = true;
    resetDragState();
    document.getElementById('dock-shield').style.display = 'block';
    playTone(523.25, 'sine', 0.15);
    setTimeout(() => playTone(1046.50, 'sine', 0.4), 300);
    if (currentAdventureLevel === maxUnlockedLevel && maxUnlockedLevel < TOTAL_LEVELS) {
        maxUnlockedLevel++;
        localStorage.setItem('BlitzMaxLevel', maxUnlockedLevel);
    }
    document.getElementById('level-final-score').innerText = score;
    setTimeout(() => { document.getElementById('level-complete-screen').classList.remove('hidden-screen'); }, 500);
}

function startNextLevel() {
    if (currentAdventureLevel < TOTAL_LEVELS) {
        currentAdventureLevel++;
        document.getElementById('level-complete-screen').classList.add('hidden-screen');
        startGame('adventure');
    } else {
        returnToMenu();
    }
}

function openModsMenu() {
    let container = document.getElementById('mods-grid-container');
    container.innerHTML = '';
    Object.values(ModManager.mods).forEach(mod => {
        if (mod.id === 'classic' || mod.id === 'adventure') return;
        let high = ModManager.getHighScore(mod.id);
        let card = document.createElement('div');
        card.className = 'mod-card';
        card.innerHTML = `<i class="fa-solid ${mod.icon} mod-icon" style="color: ${mod.color}"></i><span class="mod-title">${mod.name}</span><span class="mod-desc">${mod.desc}</span><span class="mod-score english-stroke">Best: ${high}</span>`;
        card.onclick = () => { closeModsMenu(); startGame(mod.id); };
        container.appendChild(card);
    });
    document.getElementById('start-screen').classList.add('hidden-screen');
    document.getElementById('mods-screen').classList.remove('hidden-screen');
}

function closeModsMenu() {
    document.getElementById('mods-screen').classList.add('hidden-screen');
    document.getElementById('start-screen').classList.remove('hidden-screen');
}

// ==========================================
// Single Player Engine (Classic/Adventure/Mods)
// ==========================================
function startGame(modId) {
    initAudio();
    resetDragState();
    isVsMode = false;
    isGameEnded = false;
    lastPlayedMode = modId;
    if (activeMod) activeMod.onEnd();
    activeMod = ModManager.mods[modId];

    document.getElementById('start-screen').classList.add('hidden-screen');
    document.getElementById('game-ui').classList.remove('hidden');
    document.getElementById('game-ui').style.opacity = '1';
    document.getElementById('game-ui').style.pointerEvents = 'auto';

    score = 0;
    comboCount = 0;
    freeShufflesLeft = 1;
    videoRescuesUsed = 0;
    isRescueModalOpen = false;
    updateShuffleUI();
    updateScoreDisplay();

    const targetLabelEl = document.getElementById('high-score-label');
    if (activeMod.id === 'adventure') {
        document.getElementById('high-score').innerText = getLevelTarget(currentAdventureLevel);
        if (targetLabelEl) targetLabelEl.innerText = "Goal";
    } else {
        document.getElementById('high-score').innerText = ModManager.getHighScore(activeMod.id);
        if (targetLabelEl) targetLabelEl.innerText = "Best Score";
    }

    boardMeta = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill().map(() => ({ color: null, type: 'normal' })));
    renderBoard(document.getElementById('game-board'), boardMeta, cellElements);

    dockPieces = [null, null, null];
    fillDock('slot', dockPieces);
    document.getElementById('dock-shield').style.display = 'block';

    setTimeout(() => { playDynamicIntroSequence(); }, 50);
}

async function playDynamicIntroSequence() {
    let color = COLOR_ARRAY[Math.floor(Math.random() * COLOR_ARRAY.length)];
    let shape = INTRO_SHAPES[0];
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (shape[r][c] === '1') boardMeta[r][c] = { color: color, type: 'normal' };
        }
    }
    renderBoard(document.getElementById('game-board'), boardMeta, cellElements);

    for (let i = 0; i < 3; i++) {
        setTimeout(() => playTone(300 + (i * 150), 'sine', 0.15), i * 150);
    }
    await new Promise(res => setTimeout(res, 600));
    if (isGameEnded) return;

    playTone(800, 'triangle', 0.3);
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (boardMeta[r][c].color) {
                let b = cellElements[r][c].querySelector('.block');
                if (b) b.classList.add('blasting');
                createPlaceParticles(cellElements[r][c], boardMeta[r][c].color);
                boardMeta[r][c] = { color: null, type: 'normal' };
            }
        }
    }
    await new Promise(res => setTimeout(res, 300));
    if (isGameEnded) return;

    if (activeMod.id === 'adventure') {
        boardMeta = getAdventureLayout(currentAdventureLevel);
        renderBoard(document.getElementById('game-board'), boardMeta, cellElements);
        let count = 0;
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (boardMeta[r][c].color) {
                    createPlaceParticles(cellElements[r][c], boardMeta[r][c].color);
                    count++;
                    setTimeout(() => playTone(600 + count * 20, 'sine', 0.04), count * 35);
                }
            }
        }
    } else {
        let blocksToScatter = [4, 10][Math.floor(Math.random() * 2)];
        for (let i = 0; i < blocksToScatter; i++) {
            let r = Math.floor(Math.random() * BOARD_SIZE);
            let c = Math.floor(Math.random() * BOARD_SIZE);
            if (!boardMeta[r][c].color) {
                boardMeta[r][c] = { color: COLOR_ARRAY[Math.floor(Math.random() * COLOR_ARRAY.length)], type: 'normal' };
                createPlaceParticles(cellElements[r][c], boardMeta[r][c].color);
                playTone(600 + i * 30, 'sine', 0.05);
            }
        }
        renderBoard(document.getElementById('game-board'), boardMeta, cellElements);
    }

    activeMod.onInit();
    await new Promise(res => setTimeout(res, 200));
    if (isGameEnded) return;

    dockPieces = [
        generateSmartPiece(boardMeta, false),
        generateSmartPiece(boardMeta, false),
        generateSmartPiece(boardMeta, false)
    ];
    fillDock('slot', dockPieces);
    document.getElementById('dock-shield').style.display = 'none';
}

function endSingleGame(reason = "No More Moves!") {
    if (isGameEnded) return;
    isGameEnded = true;
    resetDragState();

    if (activeMod) activeMod.onEnd();
    document.getElementById('dock-shield').style.display = 'block';
    playTone(180, 'sawtooth', 0.45);

    // Save best score if not in Adventure mode
    if (activeMod && activeMod.id !== 'adventure') {
        const best = ModManager.getHighScore(activeMod.id);
        if (score > best) {
            ModManager.setHighScore(activeMod.id, score);
            document.getElementById('high-score').innerText = score;
        }
    }

    document.getElementById('game-over-title').innerText = reason;
    document.getElementById('game-over-title').className = "text-5xl md:text-6xl bold-stroke mb-2 text-red-500";
    document.getElementById('game-over-sub').innerText = "Final Score";
    document.getElementById('final-score').innerText = score;

    setTimeout(() => {
        document.getElementById('game-over-screen').classList.remove('hidden-screen');
    }, 600);
}

// ==========================================
// VS Mode Engine
// ==========================================
function startVsMode(diff) {
    initAudio();
    resetDragState();
    robotDifficulty = diff;
    isVsMode = true;
    isGameEnded = false;
    lastPlayedMode = 'vs';
    activeMod = null;
    document.getElementById('robot-menu').classList.add('hidden-screen');

    const cdScreen = document.getElementById('countdown-screen');
    const cdText = document.getElementById('countdown-text');
    cdScreen.classList.remove('hidden-screen');
    let count = 3;
    cdText.innerText = count;
    playTone(400, 'square', 0.2);

    const iv = setInterval(() => {
        count--;
        if (count > 0) {
            cdText.innerText = count;
            playTone(400, 'square', 0.2);
        } else if (count === 0) {
            cdText.innerText = "GO!";
            cdText.style.color = "#4cd964";
            playTone(800, 'square', 0.4);
        } else {
            clearInterval(iv);
            cdScreen.classList.add('hidden-screen');
            cdText.style.color = "white";
            initVsGameplay();
        }
    }, 1000);

    cdScreen.intervalId = iv;
}

function initVsGameplay() {
    document.getElementById('vs-game-ui').classList.remove('hidden');
    document.getElementById('vs-game-ui').style.opacity = '1';
    document.getElementById('vs-game-ui').style.pointerEvents = 'auto';

    vsPlayerScore = 0;
    vsRobotScore = 0;
    updateVsScores();

    vsPlayerMeta = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill().map(() => ({ color: null, type: 'normal' })));
    vsRobotMeta = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill().map(() => ({ color: null, type: 'normal' })));

    vsPlayerCells = [];
    vsRobotCells = [];
    renderBoard(document.getElementById('vs-player-board'), vsPlayerMeta, vsPlayerCells);
    renderBoard(document.getElementById('vs-robot-board'), vsRobotMeta, vsRobotCells);

    vsPlayerDock = [generateSmartPiece(vsPlayerMeta, true), generateSmartPiece(vsPlayerMeta, true), generateSmartPiece(vsPlayerMeta, true)];
    vsRobotDock = [generateSmartPiece(vsRobotMeta, true), generateSmartPiece(vsRobotMeta, true), generateSmartPiece(vsRobotMeta, true)];

    fillDock('vs-slot', vsPlayerDock);
    document.getElementById('vs-dock-shield').style.display = 'none';
    triggerRobotTurn();
}

function updateVsScores() {
    document.getElementById('top-player-score').innerText = vsPlayerScore;
    document.getElementById('top-robot-score').innerText = vsRobotScore;

    const pScore = document.getElementById('top-player-score');
    pScore.classList.remove('score-shake');
    void pScore.offsetWidth;
    pScore.classList.add('score-shake');

    document.getElementById('player-progress').style.width = Math.min(100, (vsPlayerScore / TARGET_VS_SCORE) * 100) + '%';
    document.getElementById('robot-progress').style.width = Math.min(100, (vsRobotScore / TARGET_VS_SCORE) * 100) + '%';
}

function triggerRobotTurn() {
    if (!isVsMode || isGameEnded) return;
    let baseDelay = 2000;
    if (robotDifficulty === 'medium') baseDelay = 1200;
    if (robotDifficulty === 'pro') baseDelay = 700;
    if (robotDifficulty === 'hacker') baseDelay = 200;
    robotTurnTimeout = setTimeout(() => { executeRobotMove(); }, baseDelay + (Math.random() * baseDelay * 0.3));
    const thinkingEl = document.createElement('div');
    thinkingEl.className = 'robot-thinking';
    document.getElementById('vs-robot-board').parentElement.appendChild(thinkingEl);
}

function executeRobotMove() {
    const thinkingEl = document.querySelector('.robot-thinking');
    if (thinkingEl) thinkingEl.remove();
    if (!isVsMode || isGameEnded) return;
    let bestMove = getRobotMove();
    if (bestMove) {
        let piece = vsRobotDock[bestMove.idx];
        placePieceOnData(vsRobotMeta, vsRobotCells, piece, bestMove.r, bestMove.c, false);
        vsRobotDock[bestMove.idx] = null;

        if (vsRobotDock.every(p => p === null)) {
            vsRobotDock = [generateSmartPiece(vsRobotMeta, true), generateSmartPiece(vsRobotMeta, true), generateSmartPiece(vsRobotMeta, true)];
        }

        let cleared = checkLinesOnData(vsRobotMeta, vsRobotCells, false);
        let robBase = Math.floor(Math.random() * 100) + 10;
        vsRobotScore += robBase + cleared.score;
        updateVsScores();

        if (vsRobotScore >= TARGET_VS_SCORE) {
            endVsGame("Robot Wins!", vsRobotScore, "red");
            return;
        }
    } else {
        vsRobotMeta = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill().map(() => ({ color: null, type: 'normal' })));
        renderBoard(document.getElementById('vs-robot-board'), vsRobotMeta, vsRobotCells);
        vsRobotDock = [generateSmartPiece(vsRobotMeta, true), generateSmartPiece(vsRobotMeta, true), generateSmartPiece(vsRobotMeta, true)];
    }
    triggerRobotTurn();
}

function getRobotMove() {
    let moves = [];
    for (let i = 0; i < 3; i++) {
        let piece = vsRobotDock[i];
        if (!piece) continue;
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (canPlaceOnData(vsRobotMeta, piece, r, c)) {
                    moves.push({ idx: i, r: r, c: c, score: evaluateBoardState(vsRobotMeta, piece, r, c) });
                }
            }
        }
    }
    if (moves.length === 0) return null;
    moves.sort((a, b) => b.score - a.score);
    if (robotDifficulty === 'hacker') return moves[0];
    if (robotDifficulty === 'pro') return Math.random() > 0.15 ? moves[0] : moves[Math.floor(Math.random() * Math.min(3, moves.length))];
    if (robotDifficulty === 'medium') return Math.random() > 0.5 ? moves[0] : moves[Math.floor(Math.random() * moves.length)];
    return moves[Math.floor(Math.random() * moves.length)];
}

function evaluateBoardState(boardData, piece, r, c) {
    const tempBoard = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
        tempBoard[i] = [];
        for (let j = 0; j < BOARD_SIZE; j++) {
            tempBoard[i][j] = { color: boardData[i][j].color };
        }
    }
    for (let i = 0; i < piece.matrix.length; i++) {
        for (let j = 0; j < piece.matrix[0].length; j++) {
            if (piece.matrix[i][j]) tempBoard[r + i][c + j].color = piece.color;
        }
    }
    let lines = 0;
    for (let tr = 0; tr < BOARD_SIZE; tr++) if (tempBoard[tr].every(tc => tc.color !== null)) lines++;
    for (let tc = 0; tc < BOARD_SIZE; tc++) if (tempBoard.every(trow => trow[tc].color !== null)) lines++;
    let holes = 0;
    for (let tc = 0; tc < BOARD_SIZE; tc++) {
        let blockFound = false;
        for (let tr = 0; tr < BOARD_SIZE; tr++) {
            if (tempBoard[tr][tc].color) blockFound = true;
            else if (blockFound) holes++;
        }
    }
    return (lines * 100) - (holes * 20);
}

// ==========================================
// Common Board Logic & Pointer Events Drag-Drop
// ==========================================
function getActiveMeta() { return isVsMode ? vsPlayerMeta : boardMeta; }
function getActiveCells() { return isVsMode ? vsPlayerCells : cellElements; }
function getActiveBoardEl() { return isVsMode ? document.getElementById('vs-player-board') : document.getElementById('game-board'); }
function getActiveDock() { return isVsMode ? vsPlayerDock : dockPieces; }
function getActiveDockPrefix() { return isVsMode ? 'vs-slot' : 'slot'; }

function renderBoard(containerEl, dataArray, cellsArray) {
    containerEl.innerHTML = '';
    cellsArray.length = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
        let rowEls = [];
        for (let c = 0; c < BOARD_SIZE; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            let meta = dataArray[r][c];
            if (meta && meta.color) {
                const block = document.createElement('div');
                block.className = `block block-${meta.type || 'normal'} ${meta.hp === 1 && meta.type === 'ice' ? 'block-ice-cracked' : ''}`;
                block.style.backgroundColor = meta.color;
                if (meta.type === 'bomb') {
                    let counter = document.createElement('span');
                    counter.className = 'bomb-counter english-stroke';
                    counter.innerText = meta.timer;
                    block.appendChild(counter);
                }
                cell.appendChild(block);
            }
            containerEl.appendChild(cell);
            rowEls.push(cell);
        }
        cellsArray.push(rowEls);
    }
}

function generateSmartPiece(dataArray, isVs) {
    let validShapes = [];
    let emptyCount = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (!dataArray[r][c].color) emptyCount++;
        }
    }

    let isBoardDangerous = emptyCount < (BOARD_SIZE * BOARD_SIZE * 0.4);
    let shapeList = (!isVs && activeMod && activeMod.id === 'giant' && Math.random() < 0.2) ? GIANT_SHAPES : SHAPES;

    for (let shape of shapeList) {
        let canFit = false;
        let testPiece = { matrix: shape.m, color: 'test' };
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (canPlaceOnData(dataArray, testPiece, r, c)) {
                    canFit = true;
                    break;
                }
            }
            if (canFit) break;
        }
        if (canFit) validShapes.push(shape);
    }

    let selectedShape;
    if (validShapes.length > 0) {
        if (isBoardDangerous) {
            let smallShapes = validShapes.filter(s => s.m.length <= 2 && s.m[0].length <= 2);
            selectedShape = (smallShapes.length > 0 && Math.random() < 0.7)
                ? smallShapes[Math.floor(Math.random() * smallShapes.length)]
                : validShapes[Math.floor(Math.random() * validShapes.length)];
        } else {
            selectedShape = validShapes[Math.floor(Math.random() * validShapes.length)];
        }
    } else {
        selectedShape = SHAPES[0];
    }

    let finalPiece = {
        matrix: selectedShape.m,
        color: COLOR_ARRAY[Math.floor(Math.random() * COLOR_ARRAY.length)]
    };
    if (!isVs && activeMod) return activeMod.onPieceGenerated(finalPiece);
    return finalPiece;
}

function createPieceDOM(piece, isDock) {
    const cont = document.createElement('div');
    cont.className = 'piece-container';
    const r = piece.matrix.length, c = piece.matrix[0].length;
    cont.style.gridTemplateColumns = `repeat(${c}, 1fr)`;
    cont.style.gridTemplateRows = `repeat(${r}, 1fr)`;
    const sz = isDock ? (isVsMode ? 20 : 24) : boardCellSize;
    cont.style.width = `${c * sz + (c - 1) * 2}px`;
    for (let i = 0; i < r; i++) {
        for (let j = 0; j < c; j++) {
            const cell = document.createElement('div');
            cell.className = 'piece-cell';
            cell.style.width = `${sz}px`;
            cell.style.height = `${sz}px`;
            if (piece.matrix[i][j]) {
                cell.classList.add('block');
                cell.style.backgroundColor = piece.color;
                if (piece.meta && piece.meta[`${i},${j}`]) {
                    cell.classList.add('block-' + piece.meta[`${i},${j}`].type);
                }
            } else {
                cell.classList.add('empty');
            }
            cont.appendChild(cell);
        }
    }
    return cont;
}

function fillDock(prefix, dockArr) {
    for (let i = 0; i < 3; i++) {
        const slot = document.getElementById(`${prefix}-${i}`);
        if (!slot) continue;

        slot.innerHTML = '';
        slot.classList.remove('hidden-piece');
        if (dockArr[i]) {
            const dom = createPieceDOM(dockArr[i], true);
            dom.addEventListener('pointerdown', (e) => startDrag(e, i, dockArr, prefix));
            slot.appendChild(dom);
        }
    }
    if (!isVsMode) {
        highlightPlayableDockPieces();
        checkGameOverSingle();
    } else {
        checkGameOverVsPlayer();
    }
}

function canPieceFitAnywhere(dataArray, piece) {
    if (!piece) return false;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (canPlaceOnData(dataArray, piece, r, c)) return true;
        }
    }
    return false;
}

function highlightPlayableDockPieces() {
    if (isVsMode) return;
    for (let i = 0; i < 3; i++) {
        const slot = document.getElementById(`slot-${i}`);
        if (!slot) continue;
        const pieceEl = slot.querySelector('.piece-container');
        if (!pieceEl || !dockPieces[i]) continue;
        if (canPieceFitAnywhere(boardMeta, dockPieces[i])) {
            pieceEl.classList.remove('piece-unplayable');
        } else {
            pieceEl.classList.add('piece-unplayable');
        }
    }
}

function updateShuffleUI() {
    const badge = document.getElementById('shuffle-badge');
    const headerBtn = document.getElementById('header-shuffle-btn');
    const modalCount = document.getElementById('modal-shuffle-count');
    const modalBtn = document.getElementById('modal-shuffle-btn');

    if (badge) {
        badge.innerText = freeShufflesLeft;
        badge.className = freeShufflesLeft > 0
            ? "absolute -top-2 -right-2 bg-green-500 text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow"
            : "absolute -top-2 -right-2 bg-gray-500 text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow";
    }
    if (headerBtn) {
        headerBtn.style.opacity = freeShufflesLeft > 0 ? '1' : '0.55';
    }
    if (modalCount) modalCount.innerText = freeShufflesLeft;
    if (modalBtn) {
        if (freeShufflesLeft > 0) {
            modalBtn.disabled = false;
            modalBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            modalBtn.disabled = true;
            modalBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    }
}

function dealPlayableDockSet(clearCenterIfFull = false) {
    if (clearCenterIfFull) {
        // Ensure breathing space in the center 3x3 if board is heavily congested
        let emptyCells = 0;
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (!boardMeta[r][c].color) emptyCells++;
            }
        }
        if (emptyCells < 12) {
            for (let r = 3; r <= 5; r++) {
                for (let c = 3; c <= 5; c++) {
                    if (boardMeta[r][c].color) {
                        createPlaceParticles(cellElements[r][c], boardMeta[r][c].color, 3);
                        boardMeta[r][c] = { color: null, type: 'normal' };
                    }
                }
            }
            renderBoard(document.getElementById('game-board'), boardMeta, cellElements);
        }
    }

    dockPieces = [
        generateSmartPiece(boardMeta, false),
        generateSmartPiece(boardMeta, false),
        generateSmartPiece(boardMeta, false)
    ];
    fillDock('slot', dockPieces);
    playTone(520, 'triangle', 0.15);
    setTimeout(() => playTone(740, 'triangle', 0.2), 90);
}

function useHeaderShuffle() {
    if (isVsMode || isGameEnded || isRescueModalOpen) return;
    if (document.getElementById('dock-shield').style.display === 'block') return;
    if (freeShufflesLeft <= 0) {
        showFloatingText("No Free Shuffles!", window.innerWidth / 2, window.innerHeight / 2, "txt-cool");
        playTone(220, 'sawtooth', 0.15);
        return;
    }
    freeShufflesLeft--;
    updateShuffleUI();
    dealPlayableDockSet(false);
    showFloatingText("Shuffled!", window.innerWidth / 2, window.innerHeight / 2, "txt-super");
}

function openNoMovesModal() {
    if (isGameEnded || isRescueModalOpen) return;
    isRescueModalOpen = true;
    resetDragState();
    document.getElementById('dock-shield').style.display = 'block';
    updateShuffleUI();

    document.getElementById('ad-progress-box').classList.add('hidden');
    document.getElementById('rescue-actions').classList.remove('hidden');
    document.getElementById('no-moves-modal').classList.remove('hidden-screen');
    playTone(260, 'triangle', 0.25);
}

function closeNoMovesModal() {
    isRescueModalOpen = false;
    document.getElementById('no-moves-modal').classList.add('hidden-screen');
    document.getElementById('dock-shield').style.display = 'none';
}

function rescueWithFreeShuffle() {
    if (freeShufflesLeft <= 0) return;
    freeShufflesLeft--;
    updateShuffleUI();
    closeNoMovesModal();
    dealPlayableDockSet(false);
    showFloatingText("New Blocks!", window.innerWidth / 2, window.innerHeight / 2, "txt-super");
}

function rescueWithVideoAd() {
    const actionsEl = document.getElementById('rescue-actions');
    const progressBox = document.getElementById('ad-progress-box');
    const statusText = document.getElementById('ad-status-text');
    const progressFill = document.getElementById('ad-progress-fill');

    actionsEl.classList.add('hidden');
    progressBox.classList.remove('hidden');

    // Hook for external HTML5 Ad SDKs (e.g. Poki, CrazyGames, AdSense H5)
    if (typeof window.onRewardedAdRequest === 'function') {
        window.onRewardedAdRequest(() => {
            videoRescuesUsed++;
            closeNoMovesModal();
            dealPlayableDockSet(true);
            showFloatingText("Bonus Blocks!", window.innerWidth / 2, window.innerHeight / 2, "txt-blitz");
        });
        return;
    }

    let secondsLeft = 3;
    progressFill.style.width = '10%';
    statusText.innerText = `Watching Rewarded Video... ${secondsLeft}s`;

    if (adTimerInterval) clearInterval(adTimerInterval);
    adTimerInterval = setInterval(() => {
        secondsLeft--;
        const pct = Math.min(100, ((3 - secondsLeft) / 3) * 100);
        progressFill.style.width = `${pct}%`;

        if (secondsLeft > 0) {
            statusText.innerText = `Watching Rewarded Video... ${secondsLeft}s`;
            playTone(500, 'sine', 0.06);
        } else {
            clearInterval(adTimerInterval);
            adTimerInterval = null;
            videoRescuesUsed++;
            closeNoMovesModal();
            dealPlayableDockSet(true);
            showFloatingText("Video Reward!", window.innerWidth / 2, window.innerHeight / 2, "txt-blitz");
        }
    }, 1000);
}

function declineRescueAndEnd() {
    isRescueModalOpen = false;
    document.getElementById('no-moves-modal').classList.add('hidden-screen');
    endSingleGame("No More Moves!");
}

function updateBoardMeasurements() {
    let el = getActiveBoardEl();
    if (!el) return;
    const firstCell = el.querySelector('.cell');
    boardCellSize = firstCell ? firstCell.getBoundingClientRect().width : el.getBoundingClientRect().width / BOARD_SIZE;
}

// --- Unified Pointer Events Drag & Drop ---
function startDrag(e, index, dockArr, prefix) {
    if (isDragging || isGameEnded || !dockArr[index]) return;
    e.preventDefault();
    initAudio();
    updateBoardMeasurements();

    isDragging = true;
    activePointerId = e.pointerId;
    dragSlotIndex = index;
    dragPieceObj = dockArr[index];

    try {
        e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) { }

    dragElement = createPieceDOM(dragPieceObj, false);
    dragElement.style.position = 'fixed';
    dragElement.style.pointerEvents = 'none';
    dragElement.style.zIndex = '9999';
    dragElement.classList.add('piece-pickup-anim');
    playTone(600, 'triangle', 0.1);

    document.getElementById('drag-layer').appendChild(dragElement);

    dragOffsetX = (dragPieceObj.matrix[0].length * boardCellSize) / 2;
    dragOffsetY = isVsMode
        ? (dragPieceObj.matrix.length * boardCellSize) + 20
        : (dragPieceObj.matrix.length * boardCellSize) + 50;

    document.getElementById(`${prefix}-${index}`).classList.add('hidden-piece');
    updateDragPosition(e.clientX, e.clientY);
}

function onPointerMove(e) {
    if (!isDragging || e.pointerId !== activePointerId) return;
    if (e.cancelable) e.preventDefault();

    updateDragPosition(e.clientX, e.clientY);

    const boardEl = getActiveBoardEl();
    if (!boardEl) return;
    const rect = boardEl.getBoundingClientRect();
    let gap = isVsMode ? 1 : 2;
    let gX = Math.round(((e.clientX - dragOffsetX) - rect.left) / (boardCellSize + gap));
    let gY = Math.round(((e.clientY - dragOffsetY) - rect.top) / (boardCellSize + gap));

    let maxColOffset = BOARD_SIZE - dragPieceObj.matrix[0].length;
    let maxRowOffset = BOARD_SIZE - dragPieceObj.matrix.length;

    if (gX >= -1 && gX <= maxColOffset + 1 && gY >= -1 && gY <= maxRowOffset + 1) {
        if (gX < 0) gX = 0;
        if (gY < 0) gY = 0;
        if (gX > maxColOffset) gX = maxColOffset;
        if (gY > maxRowOffset) gY = maxRowOffset;
        if (gX !== hoverGridX || gY !== hoverGridY) {
            hoverGridX = gX;
            hoverGridY = gY;
            renderGhost();
        }
    } else {
        if (hoverGridX !== -1) {
            hoverGridX = -1;
            hoverGridY = -1;
            clearGhost();
        }
    }
}

function updateDragPosition(x, y) {
    if (dragElement) {
        dragElement.style.left = `${x - dragOffsetX}px`;
        dragElement.style.top = `${y - dragOffsetY}px`;
    }
}

function onPointerEnd(e) {
    if (!isDragging || e.pointerId !== activePointerId) return;
    isDragging = false;
    activePointerId = null;

    let meta = getActiveMeta();
    let cells = getActiveCells();
    let dock = getActiveDock();
    let prefix = getActiveDockPrefix();

    if (!isGameEnded && hoverGridX !== -1 && hoverGridY !== -1 && canPlaceOnData(meta, dragPieceObj, hoverGridY, hoverGridX)) {
        let baseScore = Math.floor(Math.random() * 150) + 1;

        showFloatingText(`+${baseScore}`, e.clientX, e.clientY - 30, "txt-addscore");

        let activeEl = getActiveBoardEl();
        activeEl.classList.remove('board-shake');
        void activeEl.offsetWidth;
        activeEl.classList.add('board-shake');
        createShockwave(e.clientX, e.clientY);
        playTone(200, 'square', 0.15);

        placePieceOnData(meta, cells, dragPieceObj, hoverGridY, hoverGridX, true);

        dock[dragSlotIndex] = null;
        document.getElementById(`${prefix}-${dragSlotIndex}`).innerHTML = '';

        let cleared = checkLinesOnData(meta, cells, true);
        let totalGained = baseScore + cleared.score;

        if (isVsMode) {
            vsPlayerScore += totalGained;
            updateVsScores();
            if (vsPlayerScore >= TARGET_VS_SCORE) {
                endVsGame("You Win!", vsPlayerScore, "green");
            } else if (dock.every(p => p === null)) {
                vsPlayerDock = [generateSmartPiece(vsPlayerMeta, true), generateSmartPiece(vsPlayerMeta, true), generateSmartPiece(vsPlayerMeta, true)];
                fillDock('vs-slot', vsPlayerDock);
            } else {
                checkGameOverVsPlayer();
            }
        } else {
            addSingleScore(totalGained);
            if (activeMod) activeMod.onPlace();
            if (!isGameEnded) {
                const clearDelay = cleared.lines > 0 ? 320 : 0;
                setTimeout(() => {
                    if (isGameEnded) return;
                    if (dock.every(p => p === null)) {
                        dockPieces = [
                            generateSmartPiece(boardMeta, false),
                            generateSmartPiece(boardMeta, false),
                            generateSmartPiece(boardMeta, false)
                        ];
                        fillDock('slot', dockPieces);
                    } else {
                        highlightPlayableDockPieces();
                        checkGameOverSingle();
                    }
                }, clearDelay);
            }
        }
    } else {
        const slot = document.getElementById(`${prefix}-${dragSlotIndex}`);
        if (slot) slot.classList.remove('hidden-piece');
    }

    document.getElementById('drag-layer').innerHTML = '';
    dragElement = null;
    dragPieceObj = null;
    dragSlotIndex = -1;
    hoverGridX = -1;
    hoverGridY = -1;
    clearGhost();
}

document.addEventListener('pointermove', onPointerMove, { passive: false });
document.addEventListener('pointerup', onPointerEnd);
document.addEventListener('pointercancel', onPointerEnd);

// --- Core Rules ---
function canPlaceOnData(dataArray, piece, r, c) {
    for (let i = 0; i < piece.matrix.length; i++) {
        for (let j = 0; j < piece.matrix[0].length; j++) {
            if (piece.matrix[i][j]) {
                let tr = r + i, tc = c + j;
                if (tr < 0 || tr >= BOARD_SIZE || tc < 0 || tc >= BOARD_SIZE || dataArray[tr][tc].color) return false;
            }
        }
    }
    return true;
}

function renderGhost() {
    clearGhost();
    if (!dragPieceObj || hoverGridX === -1) return;
    let meta = getActiveMeta();
    let cells = getActiveCells();
    let valid = canPlaceOnData(meta, dragPieceObj, hoverGridY, hoverGridX);

    for (let i = 0; i < dragPieceObj.matrix.length; i++) {
        for (let j = 0; j < dragPieceObj.matrix[0].length; j++) {
            if (dragPieceObj.matrix[i][j]) {
                let tr = hoverGridY + i, tc = hoverGridX + j;
                if (tr >= 0 && tr < BOARD_SIZE && tc >= 0 && tc < BOARD_SIZE && valid) {
                    cells[tr][tc].innerHTML = `<div class="block ghost-valid" style="background-color: ${dragPieceObj.color}; opacity: 0.5;"></div>`;
                }
            }
        }
    }
    if (valid) {
        let tempBoard = meta.map(row => row.map(cell => cell.color ? true : false));
        for (let i = 0; i < dragPieceObj.matrix.length; i++) {
            for (let j = 0; j < dragPieceObj.matrix[0].length; j++) {
                if (dragPieceObj.matrix[i][j]) tempBoard[hoverGridY + i][hoverGridX + j] = true;
            }
        }
        for (let r = 0; r < BOARD_SIZE; r++) {
            if (tempBoard[r].every(c => c)) {
                for (let c = 0; c < BOARD_SIZE; c++) cells[r][c].classList.add('line-clear-preview');
            }
        }
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (tempBoard.every(row => row[c])) {
                for (let r = 0; r < BOARD_SIZE; r++) cells[r][c].classList.add('line-clear-preview');
            }
        }
    }
}

function clearGhost() {
    let cells = getActiveCells();
    let meta = getActiveMeta();
    if (!cells || cells.length === 0) return;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            cells[r][c].classList.remove('line-clear-preview');
            if (!meta[r][c].color) cells[r][c].innerHTML = '';
        }
    }
}

function placePieceOnData(dataArray, cellsArray, piece, row, col, isHuman) {
    for (let i = 0; i < piece.matrix.length; i++) {
        for (let j = 0; j < piece.matrix[0].length; j++) {
            if (piece.matrix[i][j]) {
                let tr = row + i, tc = col + j;
                let customMeta = (piece.meta && piece.meta[`${i},${j}`]) ? { ...piece.meta[`${i},${j}`] } : { type: 'normal' };
                dataArray[tr][tc] = { color: piece.color, ...customMeta };
                if (isHuman) {
                    createPlaceParticles(cellsArray[tr][tc], piece.color, 4);
                }
            }
        }
    }
    renderBoard(
        isHuman && isVsMode
            ? document.getElementById('vs-player-board')
            : (isVsMode ? document.getElementById('vs-robot-board') : document.getElementById('game-board')),
        dataArray,
        cellsArray
    );
}

function checkLinesOnData(dataArray, cellsArray, isHuman) {
    let rowsToClear = [], colsToClear = [];
    for (let r = 0; r < BOARD_SIZE; r++) if (dataArray[r].every(c => c.color !== null)) rowsToClear.push(r);
    for (let c = 0; c < BOARD_SIZE; c++) if (dataArray.every(row => row[c].color !== null)) colsToClear.push(c);

    let totalLines = rowsToClear.length + colsToClear.length;
    let scoreToAdd = 0;

    if (totalLines > 0) {
        if (isHuman) {
            let baseFreq = 400 + (totalLines * 100);
            playTone(baseFreq, 'triangle', 0.1);
            setTimeout(() => playTone(baseFreq * 1.25, 'triangle', 0.2), 80);
            comboCount++;
        }

        let randomLineScore = 0;
        for (let l = 0; l < totalLines; l++) {
            randomLineScore += Math.floor(Math.random() * 151) + 150;
        }
        scoreToAdd = randomLineScore + (isHuman && comboCount > 1 ? comboCount * 50 : 0);

        if (isHuman) {
            let textWord = "COOL!";
            let textClass = "txt-cool";
            if (totalLines === 1) { textWord = "GOOD!"; textClass = "txt-good"; }
            if (totalLines === 2) { textWord = "SUPER!"; textClass = "txt-super"; }
            if (totalLines === 3) { textWord = "MEGA!"; textClass = "txt-mega"; }
            if (totalLines >= 4) { textWord = "BLITZ!"; textClass = "txt-blitz"; }

            const container = isVsMode ? document.getElementById('vs-floating-container') : document.getElementById('floating-text-container');
            showFloatingText(textWord, window.innerWidth / 2, window.innerHeight / 2 - 50, textClass, container);
        }

        let cellsToBlast = new Set();
        rowsToClear.forEach(r => { for (let c = 0; c < BOARD_SIZE; c++) cellsToBlast.add(`${r},${c}`); });
        colsToClear.forEach(c => { for (let r = 0; r < BOARD_SIZE; r++) cellsToBlast.add(`${r},${c}`); });

        if (isHuman && !isVsMode && activeMod) activeMod.onLineCleared(Array.from(cellsToBlast));

        cellsToBlast.forEach(id => {
            let [r, c] = id.split(',').map(Number);
            let meta = dataArray[r][c];
            if (!meta.color) return;
            if (meta.hp && meta.hp > 1) {
                meta.hp--;
                if (isHuman) createPlaceParticles(cellsArray[r][c], meta.color, 3);
            } else {
                if (isHuman) createPlaceParticles(cellsArray[r][c], meta.color, 3);
                let blockInside = cellsArray[r][c].querySelector('.block');
                if (blockInside) blockInside.classList.add('blasting');
                dataArray[r][c] = { color: null, type: 'normal' };
            }
        });

        setTimeout(() => {
            renderBoard(
                isHuman && isVsMode
                    ? document.getElementById('vs-player-board')
                    : (isVsMode ? document.getElementById('vs-robot-board') : document.getElementById('game-board')),
                dataArray,
                cellsArray
            );
        }, 300);
    } else {
        if (isHuman) comboCount = 0;
    }
    return { lines: totalLines, score: scoreToAdd };
}

// --- Visual Effects & Scores ---
function addSingleScore(amount) {
    score += amount;
    updateScoreDisplay();
    if (activeMod && activeMod.id !== 'adventure') {
        let best = ModManager.getHighScore(activeMod.id);
        if (score > best) {
            ModManager.setHighScore(activeMod.id, score);
            document.getElementById('high-score').innerText = score;
        }
    }
}

function updateScoreDisplay() {
    const scoreEl = document.getElementById('current-score');
    scoreEl.innerText = score;
    scoreEl.classList.remove('score-shake');
    void scoreEl.offsetWidth;
    scoreEl.classList.add('score-shake');
}

function createPlaceParticles(cellElement, color, density = 3) {
    if (!cellElement) return;
    const rect = cellElement.getBoundingClientRect();
    const startX = rect.left + rect.width / 2, startY = rect.top + rect.height / 2;
    for (let i = 0; i < density; i++) {
        const p = document.createElement('div');
        p.style.position = 'fixed';
        p.style.width = '8px';
        p.style.height = '8px';
        p.style.backgroundColor = color;
        p.style.borderRadius = '3px';
        p.style.pointerEvents = 'none';
        p.style.zIndex = '999';
        p.style.left = `${startX}px`;
        p.style.top = `${startY}px`;
        p.style.boxShadow = `0 0 8px ${color}`;
        document.body.appendChild(p);
        const angle = Math.random() * Math.PI * 2, distance = Math.random() * 35 + 15;
        p.animate([
            { transform: 'translate(-50%, -50%) scale(1.5)', opacity: 0.9 },
            { transform: `translate(calc(-50% + ${Math.cos(angle) * distance}px), calc(-50% + ${Math.sin(angle) * distance}px)) scale(0)`, opacity: 0 }
        ], { duration: 500, easing: 'ease-out', fill: 'forwards' });
        setTimeout(() => p.remove(), 500);
    }
}

function showFloatingText(text, x, y, className, container = document.body) {
    const el = document.createElement('div');
    el.className = `floating-text ${className}`;
    el.innerText = text;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    container.appendChild(el);

    setTimeout(() => {
        if (el && el.parentNode) {
            el.parentNode.removeChild(el);
        }
    }, 1200);
}

// --- Game Overs ---
function checkGameOverSingle() {
    if (isGameEnded || isRescueModalOpen) return;
    const remainingPieces = dockPieces.filter(p => p !== null);
    if (remainingPieces.length === 0) return;

    const canPlaceAny = remainingPieces.some(piece => canPieceFitAnywhere(boardMeta, piece));
    if (!canPlaceAny) {
        openNoMovesModal();
    }
}

function endVsGame(title, finalScore, colorClass) {
    isVsMode = false;
    isGameEnded = true;
    resetDragState();
    clearTimeout(robotTurnTimeout);
    document.getElementById('vs-dock-shield').style.display = 'block';
    document.getElementById('game-over-title').innerText = title;
    document.getElementById('game-over-title').className = `text-5xl md:text-6xl bold-stroke mb-2 text-${colorClass}-500`;
    document.getElementById('game-over-sub').innerText = "Score Achieved";
    document.getElementById('final-score').innerText = finalScore;
    setTimeout(() => { document.getElementById('game-over-screen').classList.remove('hidden-screen'); }, 1000);
}

function checkGameOverVsPlayer() {
    if (isGameEnded) return;
    let canPlaceAny = false;
    for (let i = 0; i < 3; i++) {
        let piece = vsPlayerDock[i];
        if (!piece) continue;
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (canPlaceOnData(vsPlayerMeta, piece, r, c)) {
                    canPlaceAny = true;
                    break;
                }
            }
            if (canPlaceAny) break;
        }
        if (canPlaceAny) break;
    }
    if (vsPlayerDock.some(p => p !== null) && !canPlaceAny) {
        playTone(150, 'sawtooth', 0.5);
        vsPlayerMeta = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill().map(() => ({ color: null, type: 'normal' })));
        vsPlayerScore = Math.max(0, vsPlayerScore - 200);
        updateVsScores();
        showFloatingText("-200 Penalty!", window.innerWidth / 2, window.innerHeight / 2, "txt-blitz");
        renderBoard(document.getElementById('vs-player-board'), vsPlayerMeta, vsPlayerCells);
        vsPlayerDock = [generateSmartPiece(vsPlayerMeta, true), generateSmartPiece(vsPlayerMeta, true), generateSmartPiece(vsPlayerMeta, true)];
        fillDock('vs-slot', vsPlayerDock);
    }
} 