// ==========================================
// Core Variables & Setup
// ==========================================
const BOARD_SIZE = 8;
const TARGET_VS_SCORE = 5000;
const TOTAL_LEVELS = 50;

const COLORS = { red: '#ff3b30', orange: '#ff9500', yellow: '#ffcc00', green: '#4cd964', lightblue: '#5ac8fa', blue: '#007aff', purple: '#5856d6', pink: '#ff2d55' };
const COLOR_ARRAY = Object.values(COLORS);
const THEMES = [{ top: '#1b63c6', bottom: '#124088' }, { top: '#4a00e0', bottom: '#8e2de2' }, { top: '#ff416c', bottom: '#ff4b2b' }, { top: '#0f2027', bottom: '#2c5364' }, { top: '#11998e', bottom: '#38ef7d' }];

const SHAPES = [
    { m: [[1]] }, { m: [[1, 1], [1, 1]] }, { m: [[1, 1, 1], [1, 1, 1], [1, 1, 1]] }, { m: [[1, 1]] }, { m: [[1], [1]] }, { m: [[1, 1, 1]] }, { m: [[1], [1], [1]] },
    { m: [[1, 1, 1, 1]] }, { m: [[1], [1], [1], [1]] }, { m: [[1, 1, 1, 1, 1]] }, { m: [[1], [1], [1], [1], [1]] },
    { m: [[1, 0], [1, 1]] }, { m: [[0, 1], [1, 1]] }, { m: [[1, 1], [1, 0]] }, { m: [[1, 1], [0, 1]] },
    { m: [[1, 0, 0], [1, 0, 0], [1, 1, 1]] }, { m: [[0, 0, 1], [0, 0, 1], [1, 1, 1]] }, { m: [[1, 1, 1], [1, 0, 0], [1, 0, 0]] }, { m: [[1, 1, 1], [0, 0, 1], [0, 0, 1]] },
    { m: [[1, 1, 1], [0, 1, 0]] }, { m: [[0, 1, 0], [1, 1, 1]] }, { m: [[1, 0], [1, 1], [1, 0]] }, { m: [[0, 1], [1, 1], [0, 1]] },
    { m: [[1, 1, 0], [0, 1, 1]] }, { m: [[0, 1, 1], [1, 1, 0]] }
];
const GIANT_SHAPES = [{ m: [[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]] }, { m: [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]] }];
const INTRO_SHAPES = [["01100110", "11111111", "11111111", "01111110", "00111100", "00011000", "00000000", "00000000"]];

let audioCtx = null;

let boardMeta = [];
let score = 0; let comboCount = 0;
let dockPieces = [null, null, null];
let cellElements = [];

let maxUnlockedLevel = parseInt(localStorage.getItem('BlitzMaxLevel')) || 1;
let currentAdventureLevel = 1;

let activeMod = null;

let isVsMode = false;
let robotDifficulty = 'easy';
let vsPlayerMeta = [], vsRobotMeta = [];
let vsPlayerCells = [], vsRobotCells = [];
let vsPlayerScore = 0, vsRobotScore = 0;
let vsPlayerDock = [null, null, null], vsRobotDock = [null, null, null];
let robotTurnTimeout = null;

let isDragging = false, dragPieceObj = null, dragSlotIndex = -1, dragElement = null;
let dragOffsetX = 0, dragOffsetY = 0, hoverGridX = -1, hoverGridY = -1, boardCellSize = 0;

let musicVol = 0.5; let sfxVol = 0.8;

// Safe helper to obtain Capacitor AdMob Plugin instance in Vanilla JS
const getAdMob = () => {
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdMob) {
        return window.Capacitor.Plugins.AdMob;
    }
    return null;
};

// AdMob Enums for Vanilla JS context
const BannerAdSize = {
    BANNER: 'BANNER',
    FULL_BANNER: 'FULL_BANNER',
    LARGE_BANNER: 'LARGE_BANNER',
    LEADERBOARD: 'LEADERBOARD',
    MEDIUM_RECTANGLE: 'MEDIUM_RECTANGLE',
    SMART_BANNER: 'SMART_BANNER',
    ADAPTIVE_BANNER: 'ADAPTIVE_BANNER'
};

const BannerAdPosition = {
    TOP_CENTER: 'TOP_CENTER',
    CENTER: 'CENTER',
    BOTTOM_CENTER: 'BOTTOM_CENTER'
};

const RewardAdPluginEvents = {
    Loaded: 'onRewardedAdLoaded',
    FailedToLoad: 'onRewardedAdFailedToLoad',
    Showed: 'onRewardedAdShowed',
    FailedToShow: 'onRewardedAdFailedToShow',
    Dismissed: 'onRewardedAdDismissed',
    Rewarded: 'onRewardedAdReward'
};

// AdMob Test / Production Unit IDs
const ADMOB_UNITS = {
    banner: 'ca-app-pub-3940256099942544/2934735716',
    interstitial: 'ca-app-pub-3940256099942544/4411468910',
    rewarded: 'ca-app-pub-3940256099942544/5224354917'
};

let isAdMobInitialized = false;
let isBannerShowing = false;
let isInterstitialLoaded = false;
let isRewardedLoaded = false;

/**
 * Initialize AdMob SDK safely
 */
async function initEnBlocksMonetization() {
    const AdMob = getAdMob();
    if (!AdMob) {
        console.warn('Capacitor AdMob native plugin is not available in current environment.');
        return;
    }

    try {
        await AdMob.initialize({
            requestTrackingAuthorization: true,
            testingDevices: [],
            initializeForTesting: true
        });
        isAdMobInitialized = true;
        console.log('AdMob SDK initialized successfully.');

        // Attach listeners for auto-reloading ads
        attachAdEventListeners();

        // Preload initial ads
        preloadInterstitialAd();
        preloadRewardedAd();
        showBannerAd();
    } catch (err) {
        console.error('AdMob initialization error:', err);
    }
}

/**
 * Display Banner Ad at the bottom of the screen
 */
async function showBannerAd() {
    const AdMob = getAdMob();
    if (!AdMob || isBannerShowing) return;

    try {
        await AdMob.showBanner({
            adId: ADMOB_UNITS.banner,
            adSize: BannerAdSize.ADAPTIVE_BANNER,
            position: BannerAdPosition.BOTTOM_CENTER,
            margin: 0
        });
        isBannerShowing = true;
        console.log('Banner ad displayed.');
    } catch (err) {
        console.error('Failed to show banner ad:', err);
    }
}

/**
 * Preload Interstitial Ad
 */
async function preloadInterstitialAd() {
    const AdMob = getAdMob();
    if (!AdMob) return;

    try {
        await AdMob.prepareInterstitial({
            adId: ADMOB_UNITS.interstitial
        });
        isInterstitialLoaded = true;
        console.log('Interstitial ad preloaded.');
    } catch (err) {
        console.error('Failed to prepare interstitial ad:', err);
        isInterstitialLoaded = false;
    }
}

/**
 * Show Interstitial Ad if available
 */
async function showInterstitialAd() {
    const AdMob = getAdMob();
    if (!AdMob) return;

    if (isInterstitialLoaded) {
        try {
            await AdMob.showInterstitial();
            isInterstitialLoaded = false;
            preloadInterstitialAd();
        } catch (err) {
            console.error('Error showing interstitial ad:', err);
        }
    } else {
        preloadInterstitialAd();
    }
}

/**
 * Preload Rewarded Video Ad
 */
async function preloadRewardedAd() {
    const AdMob = getAdMob();
    if (!AdMob) return;

    try {
        await AdMob.prepareRewardVideo({
            adId: ADMOB_UNITS.rewarded
        });
        isRewardedLoaded = true;
        console.log('Rewarded ad preloaded.');
    } catch (err) {
        console.error('Failed to prepare rewarded ad:', err);
        isRewardedLoaded = false;
    }
}

/**
 * Show Rewarded Ad and execute callback on reward
 */
async function showRewardedAd(onRewardGrantedCallback) {
    const AdMob = getAdMob();
    if (!AdMob) {
        if (typeof onRewardGrantedCallback === 'function') onRewardGrantedCallback();
        return;
    }

    if (isRewardedLoaded) {
        try {
            const rewardListener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward) => {
                console.log('User earned reward:', reward);
                if (typeof onRewardGrantedCallback === 'function') {
                    onRewardGrantedCallback(reward);
                }
                if (rewardListener && typeof rewardListener.remove === 'function') {
                    rewardListener.remove();
                }
            });

            await AdMob.showRewardVideo();
            isRewardedLoaded = false;
            preloadRewardedAd();
        } catch (err) {
            console.error('Error showing rewarded ad:', err);
            if (typeof onRewardGrantedCallback === 'function') onRewardGrantedCallback();
        }
    } else {
        console.log('Rewarded ad not ready yet.');
        preloadRewardedAd();
        if (typeof onRewardGrantedCallback === 'function') onRewardGrantedCallback();
    }
}

// Attach functions to the global window object for HTML event listeners
window.initEnBlocksMonetization = initEnBlocksMonetization;
window.showBannerAd = showBannerAd;
window.showInterstitialAd = showInterstitialAd;
window.showRewardedAd = showRewardedAd;

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('EnBlocks web application loaded.');
    if (window.Capacitor) {
        document.addEventListener('deviceready', initEnBlocksMonetization, false);
        // Fallback initialization
        setTimeout(initEnBlocksMonetization, 1000);
    }
});

/**
 * Internal Event Listeners & Auto-Reload Loops
 */
async function attachAdEventListeners() {
    const AdMob = getAdMob();
    if (!AdMob) return;

    // Interstitial Listeners
    await AdMob.addListener('onInterstitialAdLoaded', () => { isInterstitialLoaded = true; });
    await AdMob.addListener('onInterstitialAdDismissed', () => {
        isInterstitialLoaded = false;
        preloadInterstitialAd();
    });

    // Rewarded Video Listeners
    await AdMob.addListener(RewardAdPluginEvents.Loaded, () => { isRewardedLoaded = true; });
    await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
        isRewardedLoaded = false;
        preloadRewardedAd();
    });
}

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
function initAudio() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); if (audioCtx.state === 'suspended') audioCtx.resume(); }
function playTone(freq, type, duration) {
    if (!audioCtx || sfxVol === 0) return;
    try {
        const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
        osc.type = type; osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.1 * sfxVol, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
        osc.connect(gain); gain.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + duration);
    } catch (e) { }
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

document.getElementById('music-slider').addEventListener('input', (e) => { musicVol = e.target.value / 100; document.getElementById('music-val').innerText = `${e.target.value}%`; });
document.getElementById('sfx-slider').addEventListener('input', (e) => { sfxVol = e.target.value / 100; document.getElementById('sfx-val').innerText = `${e.target.value}%`; playTone(400, 'sine', 0.1); });

function returnToMenu() {
    if (activeMod) activeMod.onEnd();
    isVsMode = false;
    clearTimeout(robotTurnTimeout);
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

// ==========================================
// Mod Manager & Adventures
// ==========================================
function getLevelTarget(level) { return 1000 + (level * 500); }

function getAdventureLayout(level) {
    let layout = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill().map(() => ({ color: null, type: 'normal' })));
    if (level === 1) { layout[3][3] = { color: COLORS.lightblue, type: 'normal' }; layout[4][4] = { color: COLORS.lightblue, type: 'normal' }; return layout; }
    let seed = level % 5;
    if (seed === 2) { layout[0][0] = layout[0][7] = layout[7][0] = layout[7][7] = { color: COLORS.blue, type: 'normal' }; }
    else if (seed === 3) { layout[3][3] = layout[3][4] = layout[4][3] = layout[4][4] = { color: COLORS.orange, type: 'normal' }; }
    else if (seed === 4) { layout[2][2] = layout[2][5] = layout[5][2] = layout[5][5] = { color: COLORS.lightblue, type: 'normal' }; }
    else { layout[1][1] = layout[1][6] = layout[6][1] = layout[6][6] = { color: COLORS.red, type: 'normal' }; }
    if (level >= 5) { for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) if (layout[r][c].color) layout[r][c].type = 'ice'; }
    return layout;
}

const ModManager = {
    mods: {
        classic: { id: 'classic', name: 'Classic', icon: 'fa-cube', color: '#4cd964', desc: 'Original gameplay', onInit: () => { }, onPieceGenerated: (p) => p, onPlace: () => { }, onLineCleared: () => { }, onEnd: () => { } },
        adventure: {
            id: 'adventure', name: 'Adventure', icon: 'fa-compass', color: '#ff2d55', desc: 'Reach target score',
            onInit: function () {
                let target = getLevelTarget(currentAdventureLevel);
                document.getElementById('timer-ui').classList.remove('hidden');
                let label = document.getElementById('time-left');
                label.className = "flex flex-col items-center justify-center gap-1";
                label.innerHTML = `<div class="text-6xl english-stroke text-white filter drop-shadow-lg">Level ${currentAdventureLevel}</div><div class="text-3xl english-stroke text-yellow-300 filter drop-shadow-md">Goal: ${target}</div>`;
            },
            onPieceGenerated: (p) => p,
            onPlace: function () {
                let target = getLevelTarget(currentAdventureLevel);
                if (score >= target && document.getElementById('dock-shield').style.display !== 'block') triggerLevelComplete();
            },
            onLineCleared: () => { },
            onEnd: () => { document.getElementById('timer-ui').classList.add('hidden'); document.getElementById('time-left').innerHTML = ""; }
        },
        lucky: {
            id: 'lucky', name: 'Lucky Blocks', icon: 'fa-star', color: '#ffcc00', desc: 'Mystery score bonuses!',
            onInit: () => { },
            onPieceGenerated: (p) => {
                if (Math.random() < 0.25) {
                    let r = Math.floor(Math.random() * p.matrix.length); let c = Math.floor(Math.random() * p.matrix[0].length);
                    if (p.matrix[r][c]) { if (!p.meta) p.meta = {}; p.meta[`${r},${c}`] = { type: 'lucky' }; }
                }
                return p;
            },
            onPlace: () => { },
            onLineCleared: (cells) => {
                let luckyFound = cells.filter(id => { let [r, c] = id.split(',').map(Number); return boardMeta[r][c] && boardMeta[r][c].type === 'lucky'; }).length;
                if (luckyFound > 0) { playTone(600, 'sine', 0.2); showFloatingText(`Lucky! +${1000 * luckyFound}`, window.innerWidth / 2, window.innerHeight / 2, "txt-super"); addSingleScore(1000 * luckyFound); applyTheme(Math.floor(Math.random() * THEMES.length)); }
            },
            onEnd: () => { }
        },
        bomb: {
            id: 'bomb', name: 'Bombs', icon: 'fa-bomb', color: '#ff3b30', desc: 'Destroy before explode!',
            onInit: () => { },
            onPieceGenerated: (p) => {
                if (Math.random() < 0.15) {
                    let r = Math.floor(Math.random() * p.matrix.length); let c = Math.floor(Math.random() * p.matrix[0].length);
                    if (p.matrix[r][c]) { if (!p.meta) p.meta = {}; p.meta[`${r},${c}`] = { type: 'bomb', timer: 10 }; }
                } return p;
            },
            onPlace: () => {
                let exploded = false;
                for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) {
                    let meta = boardMeta[r][c];
                    if (meta && meta.type === 'bomb') {
                        meta.timer--; if (meta.timer <= 0) exploded = true;
                        else { let cEl = cellElements[r][c].querySelector('.bomb-counter'); if (cEl) cEl.innerText = meta.timer; }
                    }
                }
                if (exploded) endSingleGame("Bomb Exploded!");
            },
            onLineCleared: (cells) => {
                let bombFound = cells.find(id => { let [r, c] = id.split(',').map(Number); return boardMeta[r][c] && boardMeta[r][c].type === 'bomb'; });
                if (bombFound) {
                    playTone(150, 'sawtooth', 0.5); addSingleScore(500); showFloatingText(`Boom! +500`, window.innerWidth / 2, window.innerHeight / 2, "txt-blitz");
                    let [br, bc] = bombFound.split(',').map(Number);
                    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
                        let tr = br + i, tc = bc + j;
                        if (tr >= 0 && tr < BOARD_SIZE && tc >= 0 && tc < BOARD_SIZE && boardMeta[tr][tc].color) {
                            createPlaceParticles(cellElements[tr][tc], boardMeta[tr][tc].color);
                            boardMeta[tr][tc] = { color: null, type: 'normal' };
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
                document.getElementById('timer-ui').classList.remove('hidden'); this.timeLeft = 180; this.updateUI();
                this.interval = setInterval(() => {
                    if (document.getElementById('dock-shield').style.display !== 'block') {
                        this.timeLeft--; this.updateUI(); if (this.timeLeft <= 0) endSingleGame("Time's Up!");
                    }
                }, 1000);
            },
            updateUI: function () {
                let label = document.getElementById('time-left'); label.className = "text-5xl english-stroke text-red-400 block";
                label.innerText = `${Math.floor(this.timeLeft / 60)}:${(this.timeLeft % 60).toString().padStart(2, '0')}`;
            },
            onPieceGenerated: (p) => p, onPlace: () => { }, onLineCleared: () => { },
            onEnd: function () { clearInterval(this.interval); document.getElementById('timer-ui').classList.add('hidden'); }
        },
        ice: {
            id: 'ice', name: 'Ice Age', icon: 'fa-snowflake', color: '#5ac8fa', desc: 'Clear twice!',
            onInit: () => { }, onPieceGenerated: (p) => {
                if (Math.random() < 0.3) {
                    if (!p.meta) p.meta = {}; for (let r = 0; r < p.matrix.length; r++) for (let c = 0; c < p.matrix[0].length; c++) if (p.matrix[r][c]) p.meta[`${r},${c}`] = { type: 'ice', hp: 2 };
                } return p;
            }, onPlace: () => { }, onLineCleared: () => { }, onEnd: () => { }
        },
        giant: {
            id: 'giant', name: 'Giants', icon: 'fa-maximize', color: '#ff2d55', desc: 'Giant blocks!',
            onInit: () => { }, onPieceGenerated: (p) => p, onPlace: () => { }, onLineCleared: () => { }, onEnd: () => { }
        }
    },
    getHighScore: function (id) { return localStorage.getItem('BlitzScore_' + id) || 0; },
    setHighScore: function (id, val) { localStorage.setItem('BlitzScore_' + id, val); }
};

// --- Menus Builders ---
function openLevelsMenu() {
    document.getElementById('start-screen').classList.add('hidden-screen'); document.getElementById('levels-screen').classList.remove('hidden-screen');
    document.getElementById('unlocked-count').innerText = maxUnlockedLevel;
    let container = document.getElementById('levels-chain-container'); container.innerHTML = '';
    let currentActiveNodeEl = null;

    for (let i = 1; i <= TOTAL_LEVELS; i++) {
        let row = document.createElement('div'); row.className = 'level-node-row';
        let offsetClass = 'offset-center'; let step = (i - 1) % 4;
        if (step === 1) offsetClass = 'offset-right'; else if (step === 3) offsetClass = 'offset-left';

        let btn = document.createElement('button'); let isUnlocked = i <= maxUnlockedLevel; let target = getLevelTarget(i);
        btn.className = `level-chain-btn ${offsetClass} ${isUnlocked ? 'level-unlocked' : 'level-locked'}`;

        if (isUnlocked) {
            btn.innerHTML = `<span class="english-stroke">${i}</span>`;
            let targetLbl = document.createElement('div'); targetLbl.className = 'level-label-target'; targetLbl.innerText = `Goal: ${target}`; btn.appendChild(targetLbl);
            if (i === maxUnlockedLevel) {
                let beacon = document.createElement('div'); beacon.className = 'current-level-indicator'; btn.appendChild(beacon);
                let badge = document.createElement('div'); badge.className = 'current-tag-badge'; badge.innerText = 'Play'; btn.appendChild(badge);
                currentActiveNodeEl = row;
            }
            btn.onclick = () => { currentAdventureLevel = i; document.getElementById('levels-screen').classList.add('hidden-screen'); startGame('adventure'); };
        } else { btn.innerHTML = `<i class="fa-solid fa-lock text-gray-400"></i>`; }
        row.appendChild(btn); container.appendChild(row);
    }
    if (currentActiveNodeEl) setTimeout(() => { currentActiveNodeEl.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 250);
}

function returnToMenuFromLevels() { document.getElementById('levels-screen').classList.add('hidden-screen'); document.getElementById('start-screen').classList.remove('hidden-screen'); }
function triggerLevelComplete() {
    document.getElementById('dock-shield').style.display = 'block';
    playTone(523.25, 'sine', 0.15); setTimeout(() => playTone(1046.50, 'sine', 0.4), 300);
    if (currentAdventureLevel === maxUnlockedLevel && maxUnlockedLevel < TOTAL_LEVELS) { maxUnlockedLevel++; localStorage.setItem('BlitzMaxLevel', maxUnlockedLevel); }
    document.getElementById('level-final-score').innerText = score;
    setTimeout(() => { document.getElementById('level-complete-screen').classList.remove('hidden-screen'); }, 500);
}
function startNextLevel() {
    if (currentAdventureLevel < TOTAL_LEVELS) { currentAdventureLevel++; document.getElementById('level-complete-screen').classList.add('hidden-screen'); startGame('adventure'); }
    else { returnToMenu(); }
}

function openModsMenu() {
    let container = document.getElementById('mods-grid-container'); container.innerHTML = '';
    Object.values(ModManager.mods).forEach(mod => {
        if (mod.id === 'classic' || mod.id === 'adventure') return;
        let high = ModManager.getHighScore(mod.id);
        let card = document.createElement('div'); card.className = 'mod-card';
        card.innerHTML = `<i class="fa-solid ${mod.icon} mod-icon" style="color: ${mod.color}"></i><span class="mod-title">${mod.name}</span><span class="mod-desc">${mod.desc}</span><span class="mod-score english-stroke">Best: ${high}</span>`;
        card.onclick = () => { closeModsMenu(); startGame(mod.id); }; container.appendChild(card);
    });
    document.getElementById('start-screen').classList.add('hidden-screen'); document.getElementById('mods-screen').classList.remove('hidden-screen');
}
function closeModsMenu() { document.getElementById('mods-screen').classList.add('hidden-screen'); document.getElementById('start-screen').classList.remove('hidden-screen'); }

// ==========================================
// Single Player Engine (Classic/Adventure/Mods)
// ==========================================
function startGame(modId) {
    initAudio(); isVsMode = false; activeMod = ModManager.mods[modId];
    document.getElementById('start-screen').classList.add('hidden-screen');
    document.getElementById('game-ui').classList.remove('hidden'); document.getElementById('game-ui').style.opacity = '1'; document.getElementById('game-ui').style.pointerEvents = 'auto';

    score = 0; comboCount = 0; updateScoreDisplay();

    const targetLabelEl = document.getElementById('high-score-label');
    if (activeMod.id === 'adventure') { document.getElementById('high-score').innerText = getLevelTarget(currentAdventureLevel); if (targetLabelEl) targetLabelEl.innerText = "Goal"; }
    else { document.getElementById('high-score').innerText = ModManager.getHighScore(activeMod.id); if (targetLabelEl) targetLabelEl.innerText = "Best Score"; }

    boardMeta = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill().map(() => ({ color: null, type: 'normal' })));
    renderBoard(document.getElementById('game-board'), boardMeta, cellElements);

    dockPieces = [null, null, null]; fillDock('slot', dockPieces);
    document.getElementById('dock-shield').style.display = 'block';

    setTimeout(() => { playDynamicIntroSequence(); }, 50);
}

async function playDynamicIntroSequence() {
    let color = COLOR_ARRAY[Math.floor(Math.random() * COLOR_ARRAY.length)];
    let shape = INTRO_SHAPES[0];
    for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) if (shape[r][c] === '1') boardMeta[r][c] = { color: color, type: 'normal' };
    renderBoard(document.getElementById('game-board'), boardMeta, cellElements);

    for (let i = 0; i < 3; i++) { setTimeout(() => playTone(300 + (i * 150), 'sine', 0.15), i * 150); }
    await new Promise(res => setTimeout(res, 600));

    playTone(800, 'triangle', 0.3);
    for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) if (boardMeta[r][c].color) {
        let b = cellElements[r][c].querySelector('.block'); if (b) b.classList.add('blasting');
        createPlaceParticles(cellElements[r][c], boardMeta[r][c].color); boardMeta[r][c] = { color: null, type: 'normal' };
    }
    await new Promise(res => setTimeout(res, 300));

    if (activeMod.id === 'adventure') {
        boardMeta = getAdventureLayout(currentAdventureLevel); renderBoard(document.getElementById('game-board'), boardMeta, cellElements);
        let count = 0;
        for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) if (boardMeta[r][c].color) {
            createPlaceParticles(cellElements[r][c], boardMeta[r][c].color); count++; setTimeout(() => playTone(600 + count * 20, 'sine', 0.04), count * 35);
        }
    } else {
        let blocksToScatter = [4, 10][Math.floor(Math.random() * 2)];
        for (let i = 0; i < blocksToScatter; i++) {
            let r = Math.floor(Math.random() * BOARD_SIZE); let c = Math.floor(Math.random() * BOARD_SIZE);
            if (!boardMeta[r][c].color) {
                boardMeta[r][c] = { color: COLOR_ARRAY[Math.floor(Math.random() * COLOR_ARRAY.length)], type: 'normal' };
                createPlaceParticles(cellElements[r][c], boardMeta[r][c].color); playTone(600 + i * 30, 'sine', 0.05);
            }
        }
        renderBoard(document.getElementById('game-board'), boardMeta, cellElements);
    }

    activeMod.onInit();
    await new Promise(res => setTimeout(res, 200));
    dockPieces = [generateSmartPiece(boardMeta, false), generateSmartPiece(boardMeta, false), generateSmartPiece(boardMeta, false)];
    fillDock('slot', dockPieces);
    document.getElementById('dock-shield').style.display = 'none';
}

// ==========================================
// VS Mode Engine
// ==========================================
function startVsMode(diff) {
    initAudio(); robotDifficulty = diff; isVsMode = true; activeMod = null;
    document.getElementById('robot-menu').classList.add('hidden-screen');

    const cdScreen = document.getElementById('countdown-screen'); const cdText = document.getElementById('countdown-text');
    cdScreen.classList.remove('hidden-screen');
    let count = 3; cdText.innerText = count; playTone(400, 'square', 0.2);

    let iv = setInterval(() => {
        count--;
        if (count > 0) { cdText.innerText = count; playTone(400, 'square', 0.2); }
        else if (count === 0) { cdText.innerText = "GO!"; cdText.style.color = "#4cd964"; playTone(800, 'square', 0.4); }
        else { clearInterval(iv); cdScreen.classList.add('hidden-screen'); cdText.style.color = "white"; initVsGameplay(); }
    }, 1000);
}

function initVsGameplay() {
    document.getElementById('vs-game-ui').classList.remove('hidden'); document.getElementById('vs-game-ui').style.opacity = '1'; document.getElementById('vs-game-ui').style.pointerEvents = 'auto';

    vsPlayerScore = 0; vsRobotScore = 0; updateVsScores();

    vsPlayerMeta = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill().map(() => ({ color: null, type: 'normal' })));
    vsRobotMeta = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill().map(() => ({ color: null, type: 'normal' })));

    vsPlayerCells = []; vsRobotCells = [];
    renderBoard(document.getElementById('vs-player-board'), vsPlayerMeta, vsPlayerCells);
    renderBoard(document.getElementById('vs-robot-board'), vsRobotMeta, vsRobotCells);

    vsPlayerDock = [generateSmartPiece(vsPlayerMeta, true), generateSmartPiece(vsPlayerMeta, true), generateSmartPiece(vsPlayerMeta, true)];
    vsRobotDock = [generateSmartPiece(vsRobotMeta, true), generateSmartPiece(vsRobotMeta, true), generateSmartPiece(vsRobotMeta, true)];

    fillDock('vs-slot', vsPlayerDock); document.getElementById('vs-dock-shield').style.display = 'none';
    triggerRobotTurn();
}

function updateVsScores() {
    document.getElementById('top-player-score').innerText = vsPlayerScore;
    document.getElementById('top-robot-score').innerText = vsRobotScore;

    const pScore = document.getElementById('top-player-score');
    pScore.classList.remove('score-shake'); void pScore.offsetWidth; pScore.classList.add('score-shake');

    document.getElementById('player-progress').style.width = Math.min(100, (vsPlayerScore / TARGET_VS_SCORE) * 100) + '%';
    document.getElementById('robot-progress').style.width = Math.min(100, (vsRobotScore / TARGET_VS_SCORE) * 100) + '%';
}

function triggerRobotTurn() {
    if (!isVsMode) return;
    let baseDelay = 2000; if (robotDifficulty === 'medium') baseDelay = 1200; if (robotDifficulty === 'pro') baseDelay = 700; if (robotDifficulty === 'hacker') baseDelay = 200;
    robotTurnTimeout = setTimeout(() => { executeRobotMove(); }, baseDelay + (Math.random() * baseDelay * 0.3));
}

function executeRobotMove() {
    if (!isVsMode) return;
    let bestMove = getRobotMove();
    if (bestMove) {
        let piece = vsRobotDock[bestMove.idx];
        placePieceOnData(vsRobotMeta, vsRobotCells, piece, bestMove.r, bestMove.c, false);
        vsRobotDock[bestMove.idx] = null;

        if (vsRobotDock.every(p => p === null)) vsRobotDock = [generateSmartPiece(vsRobotMeta, true), generateSmartPiece(vsRobotMeta, true), generateSmartPiece(vsRobotMeta, true)];

        let cleared = checkLinesOnData(vsRobotMeta, vsRobotCells, false);
        let robBase = Math.floor(Math.random() * 100) + 10;
        vsRobotScore += robBase + cleared.score;
        updateVsScores();

        if (vsRobotScore >= TARGET_VS_SCORE) { endVsGame("Robot Wins!", vsRobotScore, "red"); return; }
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
        let piece = vsRobotDock[i]; if (!piece) continue;
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (canPlaceOnData(vsRobotMeta, piece, r, c)) moves.push({ idx: i, r: r, c: c, score: evaluateBoardState(vsRobotMeta, piece, r, c) });
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
    let tempBoard = boardData.map(row => row.map(cell => ({ color: cell.color })));
    for (let i = 0; i < piece.matrix.length; i++) for (let j = 0; j < piece.matrix[0].length; j++) if (piece.matrix[i][j]) tempBoard[r + i][c + j].color = piece.color;
    let lines = 0;
    for (let tr = 0; tr < BOARD_SIZE; tr++) if (tempBoard[tr].every(tc => tc.color !== null)) lines++;
    for (let tc = 0; tc < BOARD_SIZE; tc++) if (tempBoard.every(trow => trow[tc].color !== null)) lines++;
    let holes = 0;
    for (let tc = 0; tc < BOARD_SIZE; tc++) { let blockFound = false; for (let tr = 0; tr < BOARD_SIZE; tr++) { if (tempBoard[tr][tc].color) blockFound = true; else if (blockFound) holes++; } }
    return (lines * 100) - (holes * 20);
}

// ==========================================
// Common Board Logic & Drag Drop
// ==========================================
function getActiveMeta() { return isVsMode ? vsPlayerMeta : boardMeta; }
function getActiveCells() { return isVsMode ? vsPlayerCells : cellElements; }
function getActiveBoardEl() { return isVsMode ? document.getElementById('vs-player-board') : document.getElementById('game-board'); }
function getActiveDock() { return isVsMode ? vsPlayerDock : dockPieces; }
function getActiveDockPrefix() { return isVsMode ? 'vs-slot' : 'slot'; }

function renderBoard(containerEl, dataArray, cellsArray) {
    containerEl.innerHTML = ''; cellsArray.length = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
        let rowEls = [];
        for (let c = 0; c < BOARD_SIZE; c++) {
            const cell = document.createElement('div'); cell.className = 'cell';
            let meta = dataArray[r][c];
            if (meta && meta.color) {
                const block = document.createElement('div');
                block.className = `block block-${meta.type || 'normal'} ${meta.hp === 1 && meta.type === 'ice' ? 'block-ice-cracked' : ''}`;
                block.style.backgroundColor = meta.color;
                if (meta.type === 'bomb') { let counter = document.createElement('span'); counter.className = 'bomb-counter english-stroke'; counter.innerText = meta.timer; block.appendChild(counter); }
                cell.appendChild(block);
            }
            containerEl.appendChild(cell); rowEls.push(cell);
        }
        cellsArray.push(rowEls);
    }
}

function generateSmartPiece(dataArray, isVs) {
    let validShapes = []; let emptyCount = 0;
    for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) if (!dataArray[r][c].color) emptyCount++;

    let isBoardDangerous = emptyCount < (BOARD_SIZE * BOARD_SIZE * 0.4);
    let shapeList = (!isVs && activeMod && activeMod.id === 'giant' && Math.random() < 0.2) ? GIANT_SHAPES : SHAPES;

    for (let shape of shapeList) {
        let canFit = false; let testPiece = { matrix: shape.m, color: 'test' };
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) { if (canPlaceOnData(dataArray, testPiece, r, c)) { canFit = true; break; } }
            if (canFit) break;
        }
        if (canFit) validShapes.push(shape);
    }

    let selectedShape;
    if (validShapes.length > 0) {
        if (isBoardDangerous) {
            let smallShapes = validShapes.filter(s => s.m.length <= 2 && s.m[0].length <= 2);
            selectedShape = (smallShapes.length > 0 && Math.random() < 0.7) ? smallShapes[Math.floor(Math.random() * smallShapes.length)] : validShapes[Math.floor(Math.random() * validShapes.length)];
        } else { selectedShape = validShapes[Math.floor(Math.random() * validShapes.length)]; }
    } else { selectedShape = SHAPES[0]; }

    let finalPiece = { matrix: selectedShape.m, color: COLOR_ARRAY[Math.floor(Math.random() * COLOR_ARRAY.length)] };
    if (!isVs && activeMod) return activeMod.onPieceGenerated(finalPiece);
    return finalPiece;
}

function createPieceDOM(piece, isDock) {
    const cont = document.createElement('div'); cont.className = 'piece-container';
    const r = piece.matrix.length, c = piece.matrix[0].length;
    cont.style.gridTemplateColumns = `repeat(${c}, 1fr)`; cont.style.gridTemplateRows = `repeat(${r}, 1fr)`;
    const sz = isDock ? (isVsMode ? 20 : 24) : boardCellSize;
    cont.style.width = `${c * sz + (c - 1) * 2}px`;
    for (let i = 0; i < r; i++) {
        for (let j = 0; j < c; j++) {
            const cell = document.createElement('div'); cell.className = 'piece-cell';
            cell.style.width = `${sz}px`; cell.style.height = `${sz}px`;
            if (piece.matrix[i][j]) {
                cell.classList.add('block'); cell.style.backgroundColor = piece.color;
                if (piece.meta && piece.meta[`${i},${j}`]) cell.classList.add('block-' + piece.meta[`${i},${j}`].type);
            } else cell.classList.add('empty');
            cont.appendChild(cell);
        }
    } return cont;
}

function fillDock(prefix, dockArr) {
    for (let i = 0; i < 3; i++) {
        const slot = document.getElementById(`${prefix}-${i}`); if (!slot) continue;
        slot.innerHTML = ''; slot.classList.remove('hidden-piece');
        if (dockArr[i]) {
            const dom = createPieceDOM(dockArr[i], true);
            dom.addEventListener('mousedown', (e) => startDrag(e, i, dockArr, prefix));
            dom.addEventListener('touchstart', (e) => startDrag(e, i, dockArr, prefix), { passive: false });
            slot.appendChild(dom);
        }
    }
    if (!isVsMode) checkGameOverSingle(); else checkGameOverVsPlayer();
}

function updateBoardMeasurements() {
    let el = getActiveBoardEl(); if (!el) return;
    const firstCell = el.querySelector('.cell');
    boardCellSize = firstCell ? firstCell.getBoundingClientRect().width : el.getBoundingClientRect().width / BOARD_SIZE;
}

// --- Drag Events ---
function startDrag(e, index, dockArr, prefix) {
    e.preventDefault(); initAudio(); updateBoardMeasurements();
    isDragging = true; dragSlotIndex = index; dragPieceObj = dockArr[index];

    let clientX = e.touches ? e.touches[0].clientX : e.clientX, clientY = e.touches ? e.touches[0].clientY : e.clientY;

    dragElement = createPieceDOM(dragPieceObj, false);
    dragElement.style.position = 'fixed'; dragElement.style.pointerEvents = 'none'; dragElement.style.zIndex = '9999';

    dragElement.classList.add('piece-pickup-anim');
    playTone(600, 'triangle', 0.1);

    document.getElementById('drag-layer').appendChild(dragElement);

    dragOffsetX = (dragPieceObj.matrix[0].length * boardCellSize) / 2;
    dragOffsetY = isVsMode ? (dragPieceObj.matrix.length * boardCellSize) + 20 : (dragPieceObj.matrix.length * boardCellSize) + 50;

    document.getElementById(`${prefix}-${index}`).classList.add('hidden-piece');
    updateDragPosition(clientX, clientY);
}

function onMove(e) {
    if (!isDragging) return; if (e.cancelable) e.preventDefault();
    let clientX = e.touches ? e.touches[0].clientX : e.clientX, clientY = e.touches ? e.touches[0].clientY : e.clientY;
    updateDragPosition(clientX, clientY);

    const rect = getActiveBoardEl().getBoundingClientRect();
    let gap = isVsMode ? 1 : 2;
    let gX = Math.round(((clientX - dragOffsetX) - rect.left) / (boardCellSize + gap));
    let gY = Math.round(((clientY - dragOffsetY) - rect.top) / (boardCellSize + gap));

    let maxColOffset = BOARD_SIZE - dragPieceObj.matrix[0].length, maxRowOffset = BOARD_SIZE - dragPieceObj.matrix.length;

    if (gX >= -1 && gX <= maxColOffset + 1 && gY >= -1 && gY <= maxRowOffset + 1) {
        if (gX < 0) gX = 0; if (gY < 0) gY = 0; if (gX > maxColOffset) gX = maxColOffset; if (gY > maxRowOffset) gY = maxRowOffset;
        if (gX !== hoverGridX || gY !== hoverGridY) { hoverGridX = gX; hoverGridY = gY; renderGhost(); }
    } else { if (hoverGridX !== -1) { hoverGridX = -1; hoverGridY = -1; clearGhost(); } }
}

function updateDragPosition(x, y) { if (dragElement) { dragElement.style.left = `${x - dragOffsetX}px`; dragElement.style.top = `${y - dragOffsetY}px`; } }

function onEnd(e) {
    if (!isDragging) return; isDragging = false;
    let meta = getActiveMeta(); let cells = getActiveCells(); let dock = getActiveDock(); let prefix = getActiveDockPrefix();

    if (hoverGridX !== -1 && hoverGridY !== -1 && canPlaceOnData(meta, dragPieceObj, hoverGridY, hoverGridX)) {
        let baseScore = Math.floor(Math.random() * 150) + 1;

        let clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
        let clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;

        showFloatingText(`+${baseScore}`, clientX, clientY - 30, "txt-addscore");

        let activeEl = getActiveBoardEl();
        activeEl.classList.remove('board-shake');
        void activeEl.offsetWidth;
        activeEl.classList.add('board-shake');
        createShockwave(clientX, clientY);
        playTone(200, 'square', 0.15);

        placePieceOnData(meta, cells, dragPieceObj, hoverGridY, hoverGridX, true);

        dock[dragSlotIndex] = null; document.getElementById(`${prefix}-${dragSlotIndex}`).innerHTML = '';

        let cleared = checkLinesOnData(meta, cells, true); let totalGained = baseScore + cleared.score;

        if (isVsMode) {
            vsPlayerScore += totalGained; updateVsScores();
            if (vsPlayerScore >= TARGET_VS_SCORE) { endVsGame("You Win!", vsPlayerScore, "green"); return; }
            if (dock.every(p => p === null)) { vsPlayerDock = [generateSmartPiece(vsPlayerMeta, true), generateSmartPiece(vsPlayerMeta, true), generateSmartPiece(vsPlayerMeta, true)]; fillDock('vs-slot', vsPlayerDock); }
            else checkGameOverVsPlayer();
        } else {
            addSingleScore(totalGained);
            if (activeMod) activeMod.onPlace();
            if (dock.every(p => p === null)) { dockPieces = [generateSmartPiece(boardMeta, false), generateSmartPiece(boardMeta, false), generateSmartPiece(boardMeta, false)]; fillDock('slot', dockPieces); }
            else checkGameOverSingle();
        }
    } else { document.getElementById(`${prefix}-${dragSlotIndex}`).classList.remove('hidden-piece'); }

    document.getElementById('drag-layer').innerHTML = ''; dragElement = null; dragPieceObj = null; hoverGridX = -1; hoverGridY = -1; clearGhost();
}

document.addEventListener('mousemove', onMove, { passive: false }); document.addEventListener('touchmove', onMove, { passive: false });
document.addEventListener('mouseup', onEnd); document.addEventListener('touchend', onEnd);

// --- Core Rules ---
function canPlaceOnData(dataArray, piece, r, c) {
    for (let i = 0; i < piece.matrix.length; i++) for (let j = 0; j < piece.matrix[0].length; j++) if (piece.matrix[i][j]) {
        let tr = r + i, tc = c + j; if (tr < 0 || tr >= BOARD_SIZE || tc < 0 || tc >= BOARD_SIZE || dataArray[tr][tc].color) return false;
    } return true;
}

function renderGhost() {
    clearGhost(); if (!dragPieceObj || hoverGridX === -1) return;
    let meta = getActiveMeta(); let cells = getActiveCells();
    let valid = canPlaceOnData(meta, dragPieceObj, hoverGridY, hoverGridX);

    for (let i = 0; i < dragPieceObj.matrix.length; i++) for (let j = 0; j < dragPieceObj.matrix[0].length; j++) if (dragPieceObj.matrix[i][j]) {
        let tr = hoverGridY + i, tc = hoverGridX + j;
        if (tr >= 0 && tr < BOARD_SIZE && tc >= 0 && tc < BOARD_SIZE) if (valid) cells[tr][tc].innerHTML = `<div class="block ghost-valid" style="background-color: ${dragPieceObj.color}; opacity: 0.5;"></div>`;
    }
    if (valid) {
        let tempBoard = meta.map(row => row.map(cell => cell.color ? true : false));
        for (let i = 0; i < dragPieceObj.matrix.length; i++) for (let j = 0; j < dragPieceObj.matrix[0].length; j++) if (dragPieceObj.matrix[i][j]) tempBoard[hoverGridY + i][hoverGridX + j] = true;
        for (let r = 0; r < BOARD_SIZE; r++) if (tempBoard[r].every(c => c)) for (let c = 0; c < BOARD_SIZE; c++) cells[r][c].classList.add('line-clear-preview');
        for (let c = 0; c < BOARD_SIZE; c++) if (tempBoard.every(row => row[c])) for (let r = 0; r < BOARD_SIZE; r++) cells[r][c].classList.add('line-clear-preview');
    }
}

function clearGhost() {
    let cells = getActiveCells(); let meta = getActiveMeta(); if (!cells || cells.length === 0) return;
    for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) {
        cells[r][c].classList.remove('line-clear-preview');
        if (!meta[r][c].color) cells[r][c].innerHTML = '';
    }
}

function placePieceOnData(dataArray, cellsArray, piece, row, col, isHuman) {
    for (let i = 0; i < piece.matrix.length; i++) {
        for (let j = 0; j < piece.matrix[0].length; j++) {
            if (piece.matrix[i][j]) {
                let tr = row + i, tc = col + j;
                let customMeta = (piece.meta && piece.meta[`${i},${j}`]) ? piece.meta[`${i},${j}`] : { type: 'normal' };
                dataArray[tr][tc] = { color: piece.color, ...customMeta };
                if (isHuman) {
                    createPlaceParticles(cellsArray[tr][tc], piece.color, 4);
                }
            }
        }
    }
    renderBoard(isHuman && isVsMode ? document.getElementById('vs-player-board') : (isVsMode ? document.getElementById('vs-robot-board') : document.getElementById('game-board')), dataArray, cellsArray);
}

function checkLinesOnData(dataArray, cellsArray, isHuman) {
    let rowsToClear = [], colsToClear = [];
    for (let r = 0; r < BOARD_SIZE; r++) if (dataArray[r].every(c => c.color !== null)) rowsToClear.push(r);
    for (let c = 0; c < BOARD_SIZE; c++) if (dataArray.every(row => row[c].color !== null)) colsToClear.push(c);

    let totalLines = rowsToClear.length + colsToClear.length; let scoreToAdd = 0;

    if (totalLines > 0) {
        if (isHuman) { let baseFreq = 400 + (totalLines * 100); playTone(baseFreq, 'triangle', 0.1); setTimeout(() => playTone(baseFreq * 1.25, 'triangle', 0.2), 80); comboCount++; }

        let randomLineScore = 0;
        for (let l = 0; l < totalLines; l++) { randomLineScore += Math.floor(Math.random() * 151) + 150; }
        scoreToAdd = randomLineScore + (isHuman && comboCount > 1 ? comboCount * 50 : 0);

        if (isHuman) {
            let textWord = "COOL!"; let textClass = "txt-cool";
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
            let [r, c] = id.split(',').map(Number); let meta = dataArray[r][c]; if (!meta.color) return;
            if (meta.hp && meta.hp > 1) { meta.hp--; if (isHuman) createPlaceParticles(cellsArray[r][c], meta.color, 3); }
            else {
                if (isHuman) createPlaceParticles(cellsArray[r][c], meta.color, 3);
                let blockInside = cellsArray[r][c].querySelector('.block'); if (blockInside) blockInside.classList.add('blasting');
                dataArray[r][c] = { color: null, type: 'normal' };
            }
        });

        setTimeout(() => { renderBoard(isHuman && isVsMode ? document.getElementById('vs-player-board') : (isVsMode ? document.getElementById('vs-robot-board') : document.getElementById('game-board')), dataArray, cellsArray); }, 300);
    } else { if (isHuman) comboCount = 0; }
    return { lines: totalLines, score: scoreToAdd };
}

// --- Visual Effects & Scores ---
function addSingleScore(amount) {
    score += amount; updateScoreDisplay();
    if (activeMod && activeMod.id !== 'adventure') { let best = ModManager.getHighScore(activeMod.id); if (score > best) { ModManager.setHighScore(activeMod.id, score); document.getElementById('high-score').innerText = score; } }
}
function updateScoreDisplay() {
    const scoreEl = document.getElementById('current-score'); scoreEl.innerText = score;
    scoreEl.classList.remove('score-shake'); void scoreEl.offsetWidth; scoreEl.classList.add('score-shake');
}

function createPlaceParticles(cellElement, color, density = 3) {
    if (!cellElement) return; const rect = cellElement.getBoundingClientRect(); const startX = rect.left + rect.width / 2, startY = rect.top + rect.height / 2;
    for (let i = 0; i < density; i++) {
        const p = document.createElement('div'); p.style.position = 'fixed'; p.style.width = '8px'; p.style.height = '8px'; p.style.backgroundColor = color; p.style.borderRadius = '3px'; p.style.pointerEvents = 'none'; p.style.zIndex = '999'; p.style.left = `${startX}px`; p.style.top = `${startY}px`; p.style.boxShadow = `0 0 8px ${color}`; document.body.appendChild(p);
        const angle = Math.random() * Math.PI * 2, distance = Math.random() * 35 + 15;
        p.animate([{ transform: 'translate(-50%, -50%) scale(1.5)', opacity: 0.9 }, { transform: `translate(calc(-50% + ${Math.cos(angle) * distance}px), calc(-50% + ${Math.sin(angle) * distance}px)) scale(0)`, opacity: 0 }], { duration: 500, easing: 'ease-out', fill: 'forwards' });
        setTimeout(() => p.remove(), 500);
    }
}
function showFloatingText(text, x, y, className, container = document.body) {
    const el = document.createElement('div'); el.className = `floating-text ${className}`; el.innerText = text; el.style.left = `${x}px`; el.style.top = `${y}px`; container.appendChild(el); setTimeout(() => el.remove(), 1200);
}

// --- Game Overs ---
function endSingleGame(reasonStr) {
    document.getElementById('dock-shield').style.display = 'block';
    playTone(300, 'sawtooth', 0.3); setTimeout(() => playTone(250, 'sawtooth', 0.3), 200); setTimeout(() => playTone(200, 'sawtooth', 0.5), 400);
    document.getElementById('game-over-title').innerText = reasonStr; document.getElementById('game-over-title').className = "text-6xl bold-stroke mb-2 text-red-500";
    document.getElementById('game-over-sub').innerText = "Final Score"; document.getElementById('final-score').innerText = score;
    setTimeout(() => { document.getElementById('game-over-screen').classList.remove('hidden-screen'); }, 800);
}

function checkGameOverSingle() {
    let canPlaceAny = false;
    for (let i = 0; i < 3; i++) {
        let piece = dockPieces[i]; if (!piece) continue;
        for (let r = 0; r < BOARD_SIZE; r++) { for (let c = 0; c < BOARD_SIZE; c++) { if (canPlaceOnData(boardMeta, piece, r, c)) { canPlaceAny = true; break; } } if (canPlaceAny) break; }
        if (canPlaceAny) break;
    }
    if (dockPieces.some(p => p !== null) && !canPlaceAny) endSingleGame("No More Moves!");
}

function endVsGame(title, finalScore, colorClass) {
    isVsMode = false; clearTimeout(robotTurnTimeout); document.getElementById('vs-dock-shield').style.display = 'block';
    document.getElementById('game-over-title').innerText = title; document.getElementById('game-over-title').className = `text-6xl bold-stroke mb-2 text-${colorClass}-500`;
    document.getElementById('game-over-sub').innerText = "Score Achieved"; document.getElementById('final-score').innerText = finalScore;
    setTimeout(() => { document.getElementById('game-over-screen').classList.remove('hidden-screen'); }, 1000);
}

function checkGameOverVsPlayer() {
    let canPlaceAny = false;
    for (let i = 0; i < 3; i++) {
        let piece = vsPlayerDock[i]; if (!piece) continue;
        for (let r = 0; r < BOARD_SIZE; r++) { for (let c = 0; c < BOARD_SIZE; c++) { if (canPlaceOnData(vsPlayerMeta, piece, r, c)) { canPlaceAny = true; break; } } if (canPlaceAny) break; }
        if (canPlaceAny) break;
    }
    if (vsPlayerDock.some(p => p !== null) && !canPlaceAny) {
        playTone(150, 'sawtooth', 0.5); vsPlayerMeta = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill().map(() => ({ color: null, type: 'normal' })));
        vsPlayerScore = Math.max(0, vsPlayerScore - 200); updateVsScores(); showFloatingText("-200 Penalty!", window.innerWidth / 2, window.innerHeight / 2, "txt-blitz");
        renderBoard(document.getElementById('vs-player-board'), vsPlayerMeta, vsPlayerCells);
        vsPlayerDock = [generateSmartPiece(vsPlayerMeta, true), generateSmartPiece(vsPlayerMeta, true), generateSmartPiece(vsPlayerMeta, true)]; fillDock('vs-slot', vsPlayerDock);
    }
} 