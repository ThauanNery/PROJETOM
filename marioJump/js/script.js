const mario = document.querySelector('.mario');
const gameBoard = document.querySelector('.game-board');
const gameOverScreen = document.querySelector('.game-over-screen');
const timeDisplay = document.getElementById('time-score');
const damageDisplay = document.getElementById('damage-score');

const enemies = []; const fireballs = []; const platforms = []; const keys = {};
let isGameOver = false; let positionX = 50; let positionY = 150; 
let velocityY = 0; let gravity = 0.8; let isJumping = false;
let lastPlatformX = 0; let lastPlatformY = 150;
let timePoints = 0; let damagePoints = 0;

// Cronômetro
const gameTimer = setInterval(() => {
    if (!isGameOver) { timePoints++; if(timeDisplay) timeDisplay.innerText = timePoints; }
}, 1000);

// Controles
document.addEventListener("keydown", (e) => {
    keys[e.code] = true;
    if (e.code === "KeyF") shoot();
    if (isGameOver && e.code === "KeyR") location.reload();
});
document.addEventListener("keyup", (e) => keys[e.code] = false);

function shoot() {
    if (isGameOver) return;
    const fb = document.createElement("div");
    fb.classList.add("hadouken");
    fb.style.left = (positionX + 40) + "px";
    fb.style.bottom = (positionY + 30) + "px";
    gameBoard.appendChild(fb);
    fireballs.push({ el: fb, x: positionX + 40, y: positionY + 30, speed: 12 });
}

function triggerGameOver() {
    if (isGameOver) return; isGameOver = true;
    mario.src = "./images/game-over.png";
    mario.style.animation = 'none';
    if (gameOverScreen) {
        gameOverScreen.innerHTML = 'GAME OVER<br><span style="font-size: 25px; color: white;">Aperte R para Reiniciar</span>';
        gameOverScreen.classList.add('show-game-over');
    }
    document.body.classList.add('game-over-active');
    clearInterval(gameTimer);
}

function createStars() {
    for (let i = 0; i < 150; i++) {
        const star = document.createElement("div");
        star.classList.add("star");
        star.style.left = Math.random() * 30000 + "px";
        star.style.top = Math.random() * 400 + "px";
        star.style.animationDelay = `${Math.random() * 2}s, 0s`;
        gameBoard.appendChild(star);
    }
}

function createPlatform() {
    let width = Math.random() > 0.7 ? 80 : 150;
    let x = lastPlatformX + (170 + Math.random() * 100);
    let y = Math.max(160, Math.min(lastPlatformY + (Math.random() * 140 - 70), 350)); 
    const p = document.createElement("div");
    p.classList.add("platform");
    p.style.width = width + "px"; p.style.left = x + "px"; p.style.bottom = y + "px";
    gameBoard.appendChild(p);
    platforms.push({ el: p, x, y, width });
    if (Math.random() > 0.6) createEnemy(platforms[platforms.length-1]);
    lastPlatformX = x + width; lastPlatformY = y;
}

function createEnemy(p) {
    const e = document.createElement("div");
    e.classList.add("enemy");
    let ex = p.x + (p.width / 4);
    e.style.left = ex + "px"; e.style.bottom = (p.y + 20) + "px";
    gameBoard.appendChild(e);
    enemies.push({ el: e, x: ex, y: p.y + 20, platform: p, direction: 1, speed: 2 });
}

function loop() {
    if (isGameOver) return;
    let oldY = positionY;
    if (keys["ArrowRight"]) positionX += 8;
    if (keys["ArrowLeft"]) positionX -= 8;
    if (positionX < gameBoard.scrollLeft) positionX = gameBoard.scrollLeft;
    if (keys["Space"] && !isJumping) { velocityY = 16; isJumping = true; }

    velocityY -= gravity; positionY += velocityY;
    let landed = false;
    platforms.forEach(p => {
        if (velocityY <= 0 && positionX + 30 > p.x && positionX < p.x + p.width - 10) {
            if (oldY >= p.y && positionY <= p.y) { positionY = p.y; velocityY = 0; isJumping = false; landed = true; }
        }
    });

    if (!landed && positionY <= 100) return triggerGameOver();
    if (positionX > lastPlatformX - 1200) createPlatform();

    enemies.forEach((en, enIdx) => {
        en.x += en.speed * en.direction;
        if (en.x <= en.platform.x || en.x + 35 >= en.platform.x + en.platform.width) en.direction *= -1;
        en.el.style.left = en.x + "px";
        if (positionX < en.x + 30 && positionX + 40 > en.x && positionY < en.y + 35 && positionY + 50 > en.y) triggerGameOver();
        
        fireballs.forEach((fb, fbIdx) => {
            if (fb.x < en.x + 40 && fb.x + 30 > en.x && fb.y < en.y + 40 && fb.y + 20 > en.y) {
                en.el.remove(); enemies.splice(enIdx, 1);
                fb.el.remove(); fireballs.splice(fbIdx, 1);
                damagePoints += 100; if(damageDisplay) damageDisplay.innerText = damagePoints;
            }
        });
    });

    fireballs.forEach((fb, idx) => {
        fb.x += fb.speed; fb.el.style.left = fb.x + "px";
        if (fb.x > positionX + 800) { fb.el.remove(); fireballs.splice(idx, 1); }
    });

    mario.style.bottom = positionY + "px"; mario.style.left = positionX + "px";
    if (positionX > 400) gameBoard.scrollLeft = positionX - 400;
    requestAnimationFrame(loop);
}

function initGame() {
    createStars();
    const startP = document.createElement("div");
    startP.classList.add("platform");
    startP.style.width = "300px"; startP.style.left = "0px"; startP.style.bottom = "150px";
    gameBoard.appendChild(startP);
    platforms.push({ el: startP, x: 0, y: 150, width: 300 });
    lastPlatformX = 300; for(let i = 0; i < 10; i++) createPlatform();
    loop();
}
initGame();