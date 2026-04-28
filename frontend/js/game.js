// Game state
const gameState = {
    score: 0,
    lives: 5,
    isGameActive: false,
    fruits: [],
    particles: [],
    lastFrameTime: 0,
    spawnInterval: 1500,  // Default spawn interval
    lastSpawnTime: 0,
    handLandmarks: null,
    fingerTip: { x: 0, y: 0, z: 0 },
    prevFingerTip: { x: 0, y: 0, z: 0 },
    bladeTrails: [],
    cameraWidth: 0,
    cameraHeight: 0,
    // Add default values for difficulty parameters
    defaultSpawnInterval: 1500,
    defaultLives: 5,
    // Add spawn range parameters
    desktopSpawnRange: 24,   // From -15 to +15
    mobileSpawnRange: 14,     // From -10 to +10
    // Add frame counter for hand landmark drawing
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

// Set pixel ratio based on device
if (isMobileDevice()) {
    const lowerRatio = Math.min(0.5, window.devicePixelRatio * 0.5);
    renderer.setPixelRatio(lowerRatio);
} else {
    const desktopRatio = Math.min(window.devicePixelRatio, 2); 
    renderer.setPixelRatio(desktopRatio);
}

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

function isMobileDevice() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    const isAndroid = /android/i.test(userAgent);
    return isIOS || isAndroid;
}

// Fruit and bomb meshes
const fruitGeometries = [
    new THREE.SphereGeometry(1.8, 16, 16),
    new THREE.SphereGeometry(1.6, 16, 16),
    new THREE.SphereGeometry(2.0, 16, 16),
    new THREE.SphereGeometry(1.5, 16, 16),
];

const fruitMaterials = [
    new THREE.MeshLambertMaterial({ color: 0xff0000 }),
    new THREE.MeshLambertMaterial({ color: 0xff7f00 }),
    new THREE.MeshLambertMaterial({ color: 0x00cc00 }),
    new THREE.MeshLambertMaterial({ color: 0xffccaa }),
];

// MediaPipe Hands setup
let hands;
let cameraInstance;

async function setupHandTracking() {
    if (hands) return; // Already setup

    hands = new Hands({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
    });
    
    hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 0,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
    });
    
    hands.onResults(onHandResults);

    let width = 640;
    let height = 360;
    if (isMobileDevice()) {
        width = width * 0.5;
        height = height * 0.5;
    }
    
    cameraInstance = new Camera(videoElement, {
        onFrame: async () => {
            await hands.send({image: videoElement});
        },
        width: width,
        height: height,
    });
    
    return cameraInstance.start();
}

function onHandResults(results) {
    if (gameState.frameCount % 2 === 0) {
        handCtx.clearRect(0, 0, handCanvas.width, handCanvas.height);
    }
    
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        gameState.handLandmarks = results.multiHandLandmarks[0];
        if (gameState.frameCount % 2 === 0) {
            drawHandLandmarks(results.multiHandLandmarks[0]);
        }
        gameState.prevFingerTip = { ...gameState.fingerTip };
        const indexTip = gameState.handLandmarks[8];
        gameState.fingerTip = {
            x: 1 - indexTip.x, 
            y: indexTip.y,
            z: indexTip.z
        };
        const moveThreshold = 0.02;
        const distance = Math.sqrt(
            Math.pow(gameState.fingerTip.x - gameState.prevFingerTip.x, 2) +
            Math.pow(gameState.fingerTip.y - gameState.prevFingerTip.y, 2)
        );
        if (distance > moveThreshold && gameState.isGameActive) {
            createBladeTrail(
                (gameState.fingerTip.x * window.innerWidth * 0.5),
                gameState.fingerTip.y * window.innerHeight,
                (gameState.prevFingerTip.x * window.innerWidth * 0.5),
                gameState.prevFingerTip.y * window.innerHeight
            );
        }
    } else {
        gameState.handLandmarks = null;
    }
    gameState.frameCount++;
}

function drawHandLandmarks(landmarks) {
    const canvasWidth = handCanvas.width;
    const canvasHeight = handCanvas.height;
    const mirroredLandmarks = landmarks.map(landmark => {
        return { x: 1 - landmark.x, y: landmark.y, z: landmark.z };
    });
    const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4],
        [0, 5], [5, 6], [6, 7], [7, 8],
        [0, 9], [9, 10], [10, 11], [11, 12],
        [0, 13], [13, 14], [14, 15], [15, 16],
        [0, 17], [17, 18], [18, 19], [19, 20],
        [0, 5], [5, 9], [9, 13], [13, 17]
    ];
    handCtx.lineWidth = 3;
    handCtx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
    handCtx.beginPath();
    for (const [i, j] of connections) {
        const start = mirroredLandmarks[i];
        const end = mirroredLandmarks[j];
        handCtx.moveTo(start.x * canvasWidth, start.y * canvasHeight);
        handCtx.lineTo(end.x * canvasWidth, end.y * canvasHeight);
    }
    handCtx.stroke();
    handCtx.fillStyle = 'rgba(255, 0, 0, 0.8)';
    for (let i = 0; i < mirroredLandmarks.length; i++) {
        const x = mirroredLandmarks[i].x * canvasWidth;
        const y = mirroredLandmarks[i].y * canvasHeight;
        handCtx.beginPath();
        handCtx.arc(x, y, 5, 0, 2 * Math.PI);
        handCtx.fill();
    }
    const indexTip = mirroredLandmarks[8];
    handCtx.fillStyle = 'rgba(0, 0, 255, 0.8)';
    handCtx.beginPath();
    handCtx.arc(indexTip.x * canvasWidth, indexTip.y * canvasHeight, 8, 0, 2 * Math.PI);
    handCtx.fill();
}

function createBladeTrail(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    const trail = document.createElement('div');
    trail.className = 'blade-trail';
    trail.style.width = `${length}px`;
    trail.style.left = `${x1 + window.innerWidth * 0.5}px`;
    trail.style.top = `${y1}px`;
    trail.style.transform = `rotate(${angle}rad)`;
    const vibrantColors = ['rgba(0, 195, 255, 0.8)', 'rgba(255, 0, 128, 0.8)', 'rgba(0, 255, 128, 0.8)', 'rgba(255, 230, 0, 0.8)', 'rgba(128, 0, 255, 0.8)'];
    const randomColor = vibrantColors[Math.floor(Math.random() * vibrantColors.length)];
    trail.style.backgroundColor = randomColor;
    trail.style.boxShadow = `0 0 10px 2px ${randomColor}`;
    document.body.appendChild(trail);
    gameState.bladeTrails.push({ element: trail, timestamp: Date.now() });
}

function updateBladeTrails() {
    const now = Date.now();
    gameState.bladeTrails = gameState.bladeTrails.filter(trail => {
        const age = now - trail.timestamp;
        const trailDuration = 350;
        if (age > trailDuration) {
            trail.element.remove();
            return false;
        } else {
            trail.element.style.opacity = 1 - (age / trailDuration);
            return true;
        }
    });
}

function spawnObject() {
    if (quizState && quizState.questions && quizState.questions.length > 0) {
        if (quizState.answersSpawned) return;
        quizState.answersSpawned = true;
        const q = getCurrentQuestion();
        if (!q) return;
        const positions = [-12, -4, 4, 12];
        q.options.forEach((option, idx) => {
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 256;
            const ctx = canvas.getContext('2d');
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#4444ff');
            gradient.addColorStop(1, '#2222dd');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 8;
            ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const lines = [option]; // Simpler wrap logic
            ctx.fillText(option, canvas.width / 2, canvas.height / 2);
            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.MeshBasicMaterial({ map: texture });
            const geometry = new THREE.PlaneGeometry(6, 3);
            const card = new THREE.Mesh(geometry, material);
            card.position.set(positions[idx], -10, 0);
            gameState.fruits.push({ mesh: card, velocity: { x: 0, y: 10, z: 0, rotationX: 0, rotationY: 0, rotationZ: 0 }, sliced: false, type: 'answer', answer: option });
            scene.add(card);
        });
    } else {
        const fruitIndex = Math.floor(Math.random() * fruitGeometries.length);
        const fruit = new THREE.Mesh(fruitGeometries[fruitIndex], fruitMaterials[fruitIndex]);
        let xRange = isMobileDevice() ? gameState.mobileSpawnRange : gameState.desktopSpawnRange;
        fruit.position.set((Math.random() * xRange) - (xRange / 2), -10, 0);
        gameState.fruits.push({ mesh: fruit, velocity: { x: (Math.random() - 0.5) * 1.5, y: 12, z: 0, rotationX: 0.05, rotationY: 0.05, rotationZ: 0.05 }, sliced: false, type: 'fruit' });
        scene.add(fruit);
    }
}

function updateObjects(deltaTime) {
    gameState.fruits = gameState.fruits.filter(fruit => {
        fruit.velocity.y -= 8.0 * deltaTime;
        fruit.mesh.position.x += fruit.velocity.x * deltaTime;
        fruit.mesh.position.y += fruit.velocity.y * deltaTime;
        if (fruit.mesh.position.y < -12) {
            scene.remove(fruit.mesh);
            return false;
        }
        return true;
    });
}

function checkCollisions() {
    if (!gameState.handLandmarks) return;
    const fingerX = (gameState.fingerTip.x * 40) - 20;
    const fingerY = (0.5 - gameState.fingerTip.y) * 15;
    gameState.fruits.forEach(fruit => {
        if (!fruit.sliced) {
            const distance = Math.sqrt(Math.pow(fruit.mesh.position.x - fingerX, 2) + Math.pow(fruit.mesh.position.y - fingerY, 2));
            if (distance < 4) sliceFruit(fruit);
        }
    });
}

function sliceFruit(fruit) {
    fruit.sliced = true;
    if (fruit.type === 'answer') {
        const isCorrect = checkAnswer(fruit.answer);
        scoreElement.textContent = gameState.score;
        livesElement.textContent = gameState.lives;
        scene.remove(fruit.mesh);
        setTimeout(nextQuestion, 500);
    } else {
        gameState.score++;
        scoreElement.textContent = gameState.score;
        scene.remove(fruit.mesh);
    }
}

function gameLoop(timestamp) {
    if (!gameState.lastFrameTime) gameState.lastFrameTime = timestamp;
    const deltaTime = (timestamp - gameState.lastFrameTime) / 1000;
    gameState.lastFrameTime = timestamp;
    if (gameState.isGameActive) {
        if (timestamp - gameState.lastSpawnTime > gameState.spawnInterval) {
            spawnObject();
            gameState.lastSpawnTime = timestamp;
        }
        updateObjects(deltaTime);
        checkCollisions();
        updateBladeTrails();
        renderer.render(scene, camera);
        requestAnimationFrame(gameLoop);
    }
}

async function startGame() {
    // START CAMERA ON USER CLICK (Fixes permission on Vercel)
    loadingScreen.style.display = 'flex';
    try {
        await setupHandTracking();
    } catch (e) {
        alert("Camera access denied! Please allow camera to play.");
    }
    loadingScreen.style.display = 'none';

    gameState.score = quizState ? quizState.score : 0;
    gameState.lives = quizState ? quizState.lives : 5;
    gameState.isGameActive = true;
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    requestAnimationFrame(gameLoop);
}

function init() {
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
    window.addEventListener('resize', onWindowResize);
    handCanvas.width = window.innerWidth * 0.5;
    handCanvas.height = window.innerHeight;
    loadingScreen.style.display = 'none';
}

function onWindowResize() {
    camera.aspect = (window.innerWidth * 0.5) / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth * 0.5, window.innerHeight);
}

window.addEventListener('load', init);
