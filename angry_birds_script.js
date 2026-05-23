// Canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI Elements
const scoreDisplay = document.getElementById('score');
const birdsLeftDisplay = document.getElementById('birdsLeft');
const levelDisplay = document.getElementById('level');
const gameOverModal = document.getElementById('gameOver');
const gameOverTitle = document.getElementById('gameOverTitle');
const gameOverMessage = document.getElementById('gameOverMessage');
const finalScoreDisplay = document.getElementById('finalScore');

// Game Variables
let score = 0;
let birdsLeft = 3;
let currentLevel = 1;
let gameState = 'aiming'; // 'aiming', 'launched', 'levelComplete', 'gameOver'
let gameRunning = true;

// Physics
const gravity = 0.5;
const damping = 0.99;
const friction = 0.98;

// Bird Object
const bird = {
    x: 100,
    y: canvas.height - 100,
    vx: 0,
    vy: 0,
    radius: 15,
    dragging: false,
    launched: false,
    active: true
};

// Slingshot
const slingshot = {
    x: 100,
    y: canvas.height - 100,
    radius: 20
};

// Mouse position
let mouse = { x: 0, y: 0 };
let aimLine = { x1: 0, y1: 0, x2: 0, y2: 0 };

// Pigs array
let pigs = [];

// Platforms/Blocks
let blocks = [];

// Event Listeners
document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;

    if (bird.dragging && gameState === 'aiming') {
        bird.x = Math.max(50, Math.min(mouse.x, 150));
        bird.y = Math.max(canvas.height - 150, Math.min(mouse.y, canvas.height - 50));
    }
});

document.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const dist = Math.hypot(mouseX - bird.x, mouseY - bird.y);
    if (dist < bird.radius * 2 && gameState === 'aiming' && bird.active) {
        bird.dragging = true;
    }
});

document.addEventListener('mouseup', () => {
    if (bird.dragging && gameState === 'aiming') {
        bird.dragging = false;
        bird.vx = (slingshot.x - bird.x) * 0.15;
        bird.vy = (slingshot.y - bird.y) * 0.15;
        bird.launched = true;
        bird.active = false;
        gameState = 'launched';
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
        resetLevel();
    }
    if (e.key === ' ') {
        nextLevel();
    }
});

// Initialize Level
function initLevel() {
    pigs = [];
    blocks = [];
    bird.x = 100;
    bird.y = canvas.height - 100;
    bird.vx = 0;
    bird.vy = 0;
    bird.launched = false;
    bird.active = true;
    gameState = 'aiming';

    // Create pigs based on level
    const pigCount = 3 + currentLevel;
    for (let i = 0; i < pigCount; i++) {
        pigs.push({
            x: 600 + Math.random() * 250,
            y: canvas.height - 100 - Math.random() * 150,
            radius: 12,
            health: 1,
            vx: 0,
            vy: 0
        });
    }

    // Create blocks
    const blockRows = 2 + Math.floor(currentLevel / 2);
    for (let row = 0; row < blockRows; row++) {
        for (let col = 0; col < 3; col++) {
            blocks.push({
                x: 600 + col * 60,
                y: canvas.height - 150 - row * 60,
                width: 50,
                height: 50,
                health: 1,
                vx: 0,
                vy: 0,
                rotation: 0
            });
        }
    }
}

// Draw functions
function drawBird() {
    ctx.save();
    ctx.fillStyle = '#FF6B35';
    ctx.beginPath();
    ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(bird.x + 5, bird.y - 3, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawSlingshot() {
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(slingshot.x - 15, slingshot.y - 40);
    ctx.lineTo(slingshot.x, slingshot.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(slingshot.x + 15, slingshot.y - 40);
    ctx.lineTo(slingshot.x, slingshot.y);
    ctx.stroke();

    // Base
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(slingshot.x - 30, slingshot.y, 60, 20);
}

function drawPigs() {
    pigs.forEach(pig => {
        ctx.save();
        ctx.translate(pig.x, pig.y);
        ctx.fillStyle = '#90EE90';
        ctx.beginPath();
        ctx.arc(0, 0, pig.radius, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-5, -3, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(5, -3, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

function drawBlocks() {
    blocks.forEach(block => {
        ctx.save();
        ctx.translate(block.x, block.y);
        ctx.rotate(block.rotation);
        ctx.fillStyle = '#CD853F';
        ctx.fillRect(-block.width / 2, -block.height / 2, block.width, block.height);
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        ctx.strokeRect(-block.width / 2, -block.height / 2, block.width, block.height);
        ctx.restore();
    });
}

function drawAimLine() {
    if (bird.dragging && gameState === 'aiming') {
        const dist = Math.hypot(bird.x - slingshot.x, bird.y - slingshot.y);
        const angle = Math.atan2(bird.y - slingshot.y, bird.x - slingshot.x);

        ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(slingshot.x, slingshot.y);
        ctx.lineTo(slingshot.x + Math.cos(angle) * dist * 1.5, slingshot.y + Math.sin(angle) * dist * 1.5);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

function drawScore() {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`Score: ${score}`, 20, 30);
}

// Physics update
function updateBird() {
    if (bird.launched && bird.active) {
        bird.vy += gravity;
        bird.x += bird.vx;
        bird.y += bird.vy;

        bird.vx *= damping;
        bird.vy *= damping;

        // Stop bird if it's slow and low
        if (Math.hypot(bird.vx, bird.vy) < 0.5 && bird.y > canvas.height - 50) {
            bird.active = false;
            birdsLeft--;
            birdsLeftDisplay.textContent = birdsLeft;
            if (birdsLeft <= 0 && pigs.length > 0) {
                endGame();
            } else {
                setTimeout(() => {
                    if (gameState !== 'levelComplete' && gameState !== 'gameOver') {
                        initLevel();
                    }
                }, 500);
            }
        }

        // Boundary check
        if (bird.x > canvas.width || bird.y > canvas.height) {
            bird.active = false;
            birdsLeft--;
            birdsLeftDisplay.textContent = birdsLeft;
            if (birdsLeft <= 0 && pigs.length > 0) {
                endGame();
            } else {
                setTimeout(() => {
                    if (gameState !== 'levelComplete' && gameState !== 'gameOver') {
                        initLevel();
                    }
                }, 500);
            }
        }
    }
}

// Collision detection
function checkCollisions() {
    // Bird vs Pigs
    pigs.forEach((pig, pigIndex) => {
        const dist = Math.hypot(bird.x - pig.x, bird.y - pig.y);
        if (dist < bird.radius + pig.radius && bird.active) {
            pigs.splice(pigIndex, 1);
            score += 100;
            scoreDisplay.textContent = score;
        }
    });

    // Bird vs Blocks
    blocks.forEach((block, blockIndex) => {
        if (circleRectCollision(bird, block) && bird.active) {
            block.health -= 1;
            bird.vx *= -0.5;
            bird.vy *= -0.5;
            if (block.health <= 0) {
                blocks.splice(blockIndex, 1);
                score += 50;
                scoreDisplay.textContent = score;
            }
        }
    });

    // Check level complete
    if (pigs.length === 0 && gameState === 'launched') {
        gameState = 'levelComplete';
        setTimeout(nextLevel, 1000);
    }
}

function circleRectCollision(circle, rect) {
    const closestX = Math.max(rect.x - rect.width / 2, Math.min(circle.x, rect.x + rect.width / 2));
    const closestY = Math.max(rect.y - rect.height / 2, Math.min(circle.y, rect.y + rect.height / 2));
    const dist = Math.hypot(circle.x - closestX, circle.y - closestY);
    return dist < circle.radius;
}

// Draw game
function drawGame() {
    // Background
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ground
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

    // Draw elements
    drawBlocks();
    drawPigs();
    drawSlingshot();
    drawBird();
    drawAimLine();
    drawScore();

    // Level info
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`Level: ${currentLevel}`, canvas.width - 150, 30);
    ctx.fillText(`Birds: ${birdsLeft}`, canvas.width - 150, 55);
}

// Game loop
function gameLoop() {
    updateBird();
    checkCollisions();
    drawGame();
    requestAnimationFrame(gameLoop);
}

// Level functions
function resetLevel() {
    initLevel();
    gameState = 'aiming';
}

function nextLevel() {
    currentLevel++;
    levelDisplay.textContent = currentLevel;
    initLevel();
}

function endGame() {
    gameState = 'gameOver';
    gameOverTitle.textContent = '🎮 Game Over!';
    gameOverMessage.textContent = `Final Score: ${score}`;
    finalScoreDisplay.textContent = score;
    gameOverModal.classList.remove('hidden');
}

// Start game
initLevel();
gameLoop();
