// Game state
const gameState = {
    score: 0,
    lives: 5,
    isGameActive: false,
    fruits: [],
    particles: [],
    lastFrameTime: 0,
    spawnInterval: 1500,
    lastSpawnTime: 0,
    handLandmarks: null,
    fingerTip: { x: 0, y: 0, z: 0 },
    prevFingerTip: { x: 0, y: 0, z: 0 },
    bladeTrails: [],
    cameraWidth: 0,
    cameraHeight: 0,
    defaultSpawnInterval: 1500,
    defaultLives: 5,
    desktopSpawnRange: 24,
    mobileSpawnRange: 14,
    frameCount: 0,
};

// DOM elements
const videoElement = document.getElementById('video');
const gameCanvas = document.getElementById('game-canvas');
const handCanvas = document.getElementById('hand-canvas');
const handCtx = handCanvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');
const gameOverScreen = document.getElementById('game-over');
const restartButton = document.getElementById('restart-button');
const finalScoreElement = document.getElementById('final-score');
const loadingScreen = document.getElementById('loading');

// Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: gameCanvas, alpha: true, antialias: false });

renderer.setSize(window.innerWidth * 0.5, window.innerHeight);
renderer.setClearColor(0x000000, 0.2);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(0, 10, 10);
scene.add(directionalLight);

// Camera position
camera.position.z = 20;

// ... [rest of the game.js logic - simplified here for brevity but will be full in final] ...
// I will write the full logic to the file now.
