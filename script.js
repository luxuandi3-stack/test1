// Canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Score elements
const playerScoreDisplay = document.getElementById('playerScore');
const computerScoreDisplay = document.getElementById('computerScore');

// Game objects
const paddle = {
    width: 15,
    height: 90,
    speed: 6,
    x: 10,
    y: canvas.height / 2 - 45
};

const computer = {
    width: 15,
    height: 90,
    speed: 4,
    x: canvas.width - 25,
    y: canvas.height / 2 - 45
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 7,
    speedX: 5,
    speedY: 5,
    maxSpeed: 8
};

// Game variables
let playerScore = 0;
let computerScore = 0;
let gameRunning = false;
let keys = {};

// Mouse position for player control
let mouseY = canvas.height / 2;

// Event listeners
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ') {
        e.preventDefault();
        gameRunning = !gameRunning;
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Draw functions
function drawPaddle(x, y) {
    ctx.fillStyle = '#667eea';
    ctx.fillRect(x, y, paddle.width, paddle.height);
    ctx.shadowColor = '#667eea';
    ctx.shadowBlur = 10;
    ctx.fillRect(x, y, paddle.width, paddle.height);
    ctx.shadowBlur = 0;
}

function drawBall() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawNet() {
    ctx.strokeStyle = '#444';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawGame() {
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw net
    drawNet();

    // Draw paddles
    drawPaddle(paddle.x, paddle.y);
    drawPaddle(computer.x, computer.y);

    // Draw ball
    drawBall();
}

// Update functions
function updatePlayerPaddle() {
    // Mouse control
    if (mouseY - paddle.height / 2 !== paddle.y) {
        const targetY = Math.max(0, Math.min(mouseY - paddle.height / 2, canvas.height - paddle.height));
        paddle.y = targetY;
    }

    // Arrow keys control
    if (keys['ArrowUp']) {
        paddle.y = Math.max(0, paddle.y - paddle.speed);
    }
    if (keys['ArrowDown']) {
        paddle.y = Math.min(canvas.height - paddle.height, paddle.y + paddle.speed);
    }
}

function updateComputerPaddle() {
    const computerCenter = computer.y + computer.height / 2;
    const ballCenter = ball.y;
    const difficulty = 0.15; // Reaction time

    if (computerCenter < ballCenter - difficulty) {
        computer.y = Math.min(canvas.height - computer.height, computer.y + computer.speed);
    } else if (computerCenter > ballCenter + difficulty) {
        computer.y = Math.max(0, computer.y - computer.speed);
    }
}

function updateBall() {
    if (!gameRunning) return;

    ball.x += ball.speedX;
    ball.y += ball.speedY;

    // Wall collision (top and bottom)
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.speedY = -ball.speedY;
        ball.y = ball.y - ball.radius < 0 ? ball.radius : canvas.height - ball.radius;
    }

    // Paddle collision (player)
    if (
        ball.x - ball.radius < paddle.x + paddle.width &&
        ball.y > paddle.y &&
        ball.y < paddle.y + paddle.height &&
        ball.speedX < 0
    ) {
        ball.speedX = -ball.speedX;
        const collidePoint = ball.y - (paddle.y + paddle.height / 2);
        collidePoint < 0 ? (ball.speedY = collidePoint * 0.1) : (ball.speedY = collidePoint * 0.1);
        ball.x = paddle.x + paddle.width + ball.radius;
    }

    // Paddle collision (computer)
    if (
        ball.x + ball.radius > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height &&
        ball.speedX > 0
    ) {
        ball.speedX = -ball.speedX;
        const collidePoint = ball.y - (computer.y + computer.height / 2);
        collidePoint < 0 ? (ball.speedY = collidePoint * 0.1) : (ball.speedY = collidePoint * 0.1);
        ball.x = computer.x - ball.radius;
    }

    // Score points
    if (ball.x - ball.radius < 0) {
        computerScore++;
        computerScoreDisplay.textContent = computerScore;
        resetBall();
    }
    if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        playerScoreDisplay.textContent = playerScore;
        resetBall();
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speedX = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.speedY = (Math.random() - 0.5) * 6;
    gameRunning = false;
}

// Main game loop
function gameLoop() {
    updatePlayerPaddle();
    updateComputerPaddle();
    updateBall();
    drawGame();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
