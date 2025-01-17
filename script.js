
        
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

let ship = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 50,
    speed: 4,  // Reduced speed for better control
    dx: 0,
    health: 3,
    shield: false,
    shieldTimer: 0
};

let bullets = [];
let enemies = [];
let score = 0;
let highScore = 0;
let gameOver = false;
let specialAbilityAvailable = true;
let lastEnemySpawnTime = 0;

const enemyTypes = [
    { width: 40, height: 40, speed: 2, color: 'green', health: 1 },
    { width: 60, height: 60, speed: 1, color: 'red', health: 3 },
    { width: 30, height: 30, speed: 3, color: 'yellow', health: 2 }
];

function drawShip() {
    ctx.fillStyle = ship.shield ? 'cyan' : 'blue';
    ctx.fillRect(ship.x, ship.y, ship.width, ship.height);
    drawHealthBar(ship.x, ship.y);
}

function drawBullet(bullet) {
    ctx.fillStyle = 'red';
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
}

function drawEnemy(enemy) {
    ctx.fillStyle = enemy.color;
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    drawHealthBar(enemy.x, enemy.y, enemy.health);
}

function drawHealthBar(x, y, health = null) {
    let currentHealth = health !== null ? health : ship.health;
    ctx.fillStyle = 'white';
    ctx.fillRect(x - 5, y - 10, 60, 5);
    ctx.fillStyle = 'green';
    ctx.fillRect(x - 5, y - 10, 60 * (currentHealth / 3), 5);
}

function moveShip() {
    ship.x += ship.dx;
    if (ship.x < 0) ship.x = 0;
    if (ship.x + ship.width > canvas.width) ship.x = canvas.width - ship.width;
}

function moveBullets() {
    bullets.forEach((bullet, index) => {
        bullet.y -= bullet.speed;
        if (bullet.y < 0) {
            bullets.splice(index, 1);
        }
    });
}

function moveEnemies() {
    enemies.forEach((enemy, index) => {
        enemy.y += enemy.speed;
        if (enemy.y > canvas.height) {
            enemies.splice(index, 1);
            gameOver = true;
        }
    });
}

function detectCollisions() {
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {
                bullets.splice(bulletIndex, 1);
                enemy.health--;
                if (enemy.health <= 0) {
                    enemies.splice(enemyIndex, 1);
                    score += 10;
                    if (score > highScore) highScore = score;
                }
            }
        });
    });
    enemies.forEach((enemy, enemyIndex) => {
        if (ship.x < enemy.x + enemy.width &&
            ship.x + ship.width > enemy.x &&
            ship.y < enemy.y + enemy.height &&
            ship.y + ship.height > enemy.y) {
            if (ship.shield) {
                enemies.splice(enemyIndex, 1);
                ship.shield = false;
                ship.shieldTimer = 0;
            } else {
                ship.health--;
                enemies.splice(enemyIndex, 1);
                if (ship.health <= 0) {
                    gameOver = true;
                }
            }
        }
    });
}

function spawnEnemy() {
    let type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    let enemy = {
        x: Math.random() * (canvas.width - type.width),
        y: -type.height,
        width: type.width,
        height: type.height,
        speed: type.speed,
        color: type.color,
        health: type.health
    };
    enemies.push(enemy);
}

function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`High Score: ${highScore}`, 10, 60);
}

function useSpecialAbility() {
    if (specialAbilityAvailable && ship.shieldTimer === 0) {
        ship.shield = true;
        ship.shieldTimer = 5000;  // Shield lasts for 5 seconds
        specialAbilityAvailable = false;
    }
}

function gameLoop() {
    if (gameOver) {
        ctx.fillStyle = 'red';
        ctx.font = '40px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawShip();
    bullets.forEach(drawBullet);
    enemies.forEach(drawEnemy);
    drawScore();

    if (ship.shieldTimer > 0) {
        ship.shieldTimer -= 16;  // Decrease shield timer
    } else {
        ship.shield = false;
    }

    moveShip();
    moveBullets();
    moveEnemies();
    detectCollisions();

    if (Date.now() - lastEnemySpawnTime > 1000) {
        spawnEnemy();
        lastEnemySpawnTime = Date.now();
    }

    requestAnimationFrame(gameLoop);
}

function restartGame() {
    score = 0;
    bullets = [];
    enemies = [];
    ship.health = 3;
    ship.x = canvas.width / 2 - 25;
    ship.y = canvas.height - 60;
    ship.shield = false;
    ship.shieldTimer = 0;
    gameOver = false;
    specialAbilityAvailable = true;
    gameLoop();
}

document.getElementById('restartButton').addEventListener('click', restartGame);

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
        ship.dx = ship.speed;
    } else if (e.key === 'ArrowLeft') {
        ship.dx = -ship.speed;
    } else if (e.key === ' ') {
        bullets.push({
            x: ship.x + ship.width / 2 - 5,
            y: ship.y,
            width: 10,
            height: 20,
            speed: 5
        });
    } else if (e.key === 's') {
        useSpecialAbility();
    }
});

document.addEventListener('keyup', () => {
    ship.dx = 0;
});

// Mobile controls setup
function setupMobileControls() {
    const mobileControls = document.createElement('div');
    mobileControls.id = 'mobileControls';

    const leftButton = document.createElement('button');
    leftButton.innerHTML = '◀';
    leftButton.className = 'control-button';
    leftButton.addEventListener('touchstart', () => ship.dx = -ship.speed);
    leftButton.addEventListener('touchend', () => ship.dx = 0);

    const shootButton = document.createElement('button');
    shootButton.innerHTML = '⬆';
    shootButton.className = 'control-button';
    shootButton.addEventListener('touchstart', () => {
        bullets.push({
            x: ship.x + ship.width / 2 - 5,
            y: ship.y,
            width: 10,
            height: 20,
            speed: 5
        });
    });

    const rightButton = document.createElement('button');
    rightButton.innerHTML = '▶';
    rightButton.className = 'control-button';
    rightButton.addEventListener('touchstart', () => ship.dx = ship.speed);
    rightButton.addEventListener('touchend', () => ship.dx = 0);

    mobileControls.appendChild(leftButton);
    mobileControls.appendChild(shootButton);
    mobileControls.appendChild(rightButton);

    document.body.appendChild(mobileControls);
}

setupMobileControls();
restartGame();

    