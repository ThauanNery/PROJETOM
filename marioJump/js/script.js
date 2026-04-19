const mario = document.querySelector('.mario');

let positionX = 50;
let positionY = 100;

let velocity = 0;
let velocityX = 0; // 👈 FALTAVA ISSO
let gravity = 1.5;
let isJumping = false;

const groundLevel = 100;

const platforms = [
    { x: 200, y: 150 },
    { x: 400, y: 220 },
    { x: 650, y: 180 }
];

document.addEventListener("keydown", (e) => {

    if(e.code === "ArrowRight") positionX += 10;
    if(e.code === "ArrowLeft") positionX -= 10;

    if(e.code === "ArrowRight") jumpDirection = 1;
    if(e.code === "ArrowLeft") jumpDirection = -1;

    if(e.code === "Space" && !isJumping){
        velocity = 20;
        velocityX = 4 * jumpDirection; // 👈 AQUI É A MÁGICA
        isJumping = true;
    }

    mario.style.left = positionX + "px";
});
let currentGround = groundLevel;

function checkPlatformCollision(){

    let landed = false;

    platforms.forEach(p => {

        const isInsideX =
            positionX + 80 > p.x &&
            positionX < p.x + 120;

        const isLanding =
            positionY <= p.y &&
            positionY >= p.y - 10;

        if(isInsideX && isLanding && velocity <= 0){

            currentGround = p.y;
            landed = true;
        }
    });

    if(!landed){
        currentGround = groundLevel;
    }
}

function loop(){

    velocity -= gravity;
    positionY += velocity;

    positionX += velocityX;
    velocityX *= 0.95;

    if(positionY <= currentGround){
        positionY = currentGround;
        velocity = 0;
        isJumping = false;
    }

    checkPlatformCollision();

    mario.style.bottom = positionY + "px";
    mario.style.left = positionX + "px";

    requestAnimationFrame(loop);
}

loop(); // 👈 FALTAVA ISSO