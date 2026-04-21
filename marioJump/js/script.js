const mario = document.querySelector('.mario');
const gameBoard = document.querySelector('.game-board');
const enemies = []; 
const fireballs = []; 

const GROUND_LEVEL = 100; 
let positionX = 200; 
let positionY = 150; 
let velocityY = 0;
let gravity = 0.8;
let isJumping = false;
const MARIO_WIDTH = 60; 

let lastPlatformX = 400;
let lastPlatformY = 150;
const platforms = [];
const keys = {};

let timePoints = 0;
let damagePoints = 0;
const timeDisplay = document.getElementById('time-score');
const damageDisplay = document.getElementById('damage-score');

setInterval(() => {
    timePoints++;
    if(timeDisplay) timeDisplay.innerText = timePoints;
}, 1000);

function registerStaticPlatforms() {
    const staticPlatforms = document.querySelectorAll('.platform');
    staticPlatforms.forEach(p => {
        const x = p.offsetLeft;
        const y = parseInt(p.style.bottom) || 150;
        const width = p.offsetWidth || 120;
        platforms.push({ el: p, x, y, width });
    });
}

function createPlatform() {
    let width = Math.random() > 0.7 ? 80 : 150;
    const gap = 160 + Math.random() * 100; 
    let x = lastPlatformX + gap;
    const maxStep = 70;
    let y = lastPlatformY + (Math.random() * maxStep * 2 - maxStep);
    y = Math.max(160, Math.min(y, 350)); 

    const p = document.createElement("div");
    p.classList.add("platform");
    p.style.width = width + "px";
    p.style.left = x + "px";
    p.style.bottom = y + "px";
    gameBoard.appendChild(p);

    const platformObj = { el: p, x, y, width };
    platforms.push(platformObj);

    if (Math.random() > 0.7) { 
        createEnemy(platformObj);
    }

    lastPlatformX = x + width; 
    lastPlatformY = y;
}

function createEnemy(platform) {
    const e = document.createElement("div");
    e.classList.add("enemy");
    let enemyX = platform.x + (platform.width / 4);
    let direction = 1; 

    e.style.left = enemyX + "px";
    e.style.bottom = (platform.y + 20) + "px"; 
    gameBoard.appendChild(e);

    enemies.push({
        el: e,
        x: enemyX,
        y: platform.y + 20,
        platform: platform,
        direction: direction,
        speed: 2
    });
}

function shoot() {
    const fb = document.createElement("div");
    fb.classList.add("hadouken");
    let fbX = positionX + 60; 
    let fbY = positionY + 30; 
    fb.style.left = fbX + "px";
    fb.style.bottom = fbY + "px";
    gameBoard.appendChild(fb);
    fireballs.push({ el: fb, x: fbX, y: fbY, speed: 12 });
}

registerStaticPlatforms();
for(let i = 0; i < 10; i++) createPlatform();

document.addEventListener("keydown", (e) => {
    keys[e.code] = true;
    if (e.code === "KeyF") shoot();
});
document.addEventListener("keyup", (e) => keys[e.code] = false);

function loop() {
    let oldY = positionY;
    
    if (keys["ArrowRight"]) positionX += 8;
    if (keys["ArrowLeft"]) positionX -= 8;

    if (positionX < gameBoard.scrollLeft) positionX = gameBoard.scrollLeft;

    if (keys["Space"] && !isJumping) {
        velocityY = 16;
        isJumping = true;
    }

    velocityY -= gravity;
    positionY += velocityY;

    let landed = false;
    if (velocityY <= 0) {
        platforms.forEach(p => {
            const isInsideX = (positionX + MARIO_WIDTH > p.x) && (positionX < p.x + p.width);
            const crossedTop = oldY >= p.y && positionY <= p.y;
            if (isInsideX && crossedTop) {
                positionY = p.y;
                velocityY = 0;
                isJumping = false;
                landed = true;
            }
        });
    }

    if (!landed && positionY <= GROUND_LEVEL) {
        alert("🔥 O CHÃO É LAVA! GAME OVER 🔥");
        location.reload();
        return;
    }

    if (positionX > lastPlatformX - 1200) createPlatform();

    enemies.forEach((en, index) => {
        en.x += en.speed * en.direction;
        if (en.x <= en.platform.x || en.x + 40 >= en.platform.x + en.platform.width) {
            en.direction *= -1;
        }
        en.el.style.left = en.x + "px";

        const hitX = positionX + 40 > en.x && positionX < en.x + 40;
        const hitY = positionY + 60 > en.y && positionY < en.y + 40;

        if (hitX && hitY) {
            alert("GAME OVER!");
            location.reload();
        }
    });

    fireballs.forEach((fb, fbIndex) => {
        fb.x += fb.speed;
        fb.el.style.left = fb.x + "px";

        if (fb.x > positionX + 1000) {
            fb.el.remove();
            fireballs.splice(fbIndex, 1);
            return;
        }

        enemies.forEach((en, enIndex) => {
            const shotX = fb.x + 30 > en.x && fb.x < en.x + 40;
            const shotY = fb.y + 20 > en.y && fb.y < en.y + 40;

            if (shotX && shotY) {
                en.el.remove();
                enemies.splice(enIndex, 1);
                fb.el.remove();
                fireballs.splice(fbIndex, 1);
                
                damagePoints += 100;
                if(damageDisplay) damageDisplay.innerText = damagePoints;
            }
        });
    });

    mario.style.bottom = positionY + "px";
    mario.style.left = positionX + "px";

    if (positionX > 400) {
        gameBoard.scrollLeft = positionX - 400;
    }

    requestAnimationFrame(loop);
}

loop();