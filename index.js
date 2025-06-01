const gameBoard = document.querySelector('#gameBoard');
const ctx = gameBoard.getContext('2d');
const scoreText = document.querySelector('#scoreText');
const resetBtn = document.querySelector('#resetBtn');
const gameWrapper = document.querySelector('#gameWrapper'); 

// Costanti per lo sfondo stellare (dentro gameContainer)
const starBackgroundCanvas = document.querySelector('#starBackground');
const starCtx = starBackgroundCanvas.getContext('2d');

// Nuove costanti per l'animazione di sfondo del body
const bodyBackgroundCanvas = document.querySelector('#bodyBackgroundCanvas');
const bodyBgCtx = bodyBackgroundCanvas.getContext('2d');

const gameWidth = gameBoard.width;
const gameHeight = gameBoard.height;

// Colori migliorati per il gioco
const paddle1Color = '#00bcd4';   
const paddle2Color = '#ff4081';   
const paddleBorder = 'black';     
const ballColor = '#ffffff';      
const ballBorderColor = '#cccccc'; 

const ballRadius = 12.5;
const paddleSpeed = 5; 

let intervalId;
let ballSpeed; 
let ballX = gameWidth / 2; 
let ballY = gameHeight / 2; 
let ballXDirection = 0; 
let ballYDirection = 0; 
let player1Score = 0; 
let player2Score = 0; 
let paddle1 = {
  width: 25,
  height: 100,
  x: 0,
  y: 0
};
let paddle2 = {
  width: 25,
  height: 100,
  x: gameWidth - 25, 
  y: gameHeight - 100 
};

let keysPressed = {};

// Array per le stelle (dentro gameContainer)
const stars = [];
const numStars = 100; 
const starSpeed = 0.5; 

// Nuove costanti e array per le particelle di sfondo del body
const particles = [];
const numParticles = 50; 
const particleColor = 'rgba(100, 200, 255, 0.15)'; 
const particleSpeed = 0.08; 

// Modificato: Ora usa event.code per i tasti (soluzione al code smell)
window.addEventListener('keydown', (event) => {
  keysPressed[event.code] = true; 
});
window.addEventListener('keyup', (event) => {
  keysPressed[event.code] = false; 
});

resetBtn.addEventListener('click', resetGame);

window.addEventListener('resize', () => {
    scaleGameWrapper();
    resizeStarBackground(); 
    resizeBodyBackground(); 
});

window.addEventListener('load', () => {
    gameStart(); 
    scaleGameWrapper();

    initStars(); 
    animateStars(); 

    initParticles(); 
    animateParticles(); 
});

function gameStart(){
  CreateBall();
  nextTick();
};

function nextTick(){
  intervalId = setTimeout(()=>{
    clearBoard(); 
    drawPaddles();
    movePaddles(); 
    moveBall();
    drawBall(ballX, ballY);
    checkCollision();
    nextTick();
  }, 10);
};

function clearBoard(){
  ctx.clearRect(0, 0, gameWidth, gameHeight); 
};

function drawPaddles(){
  ctx.strokeStyle = paddleBorder;

  ctx.fillStyle = paddle1Color;
  ctx.fillRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height);
  ctx.strokeRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height);
  
  ctx.fillStyle = paddle2Color;
  ctx.fillRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height);
  ctx.strokeRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height);
};

function CreateBall(){
  ballSpeed = 2.5; 
  if(Math.round(Math.random()) == 1){
    ballXDirection = 1;
  }
  else{
    ballXDirection= -1
  }
  if(Math.round(Math.random()) == 1){
    ballYDirection = Math.random()*1;
  }
  else{
    ballYDirection= Math.random()*-1;
  }
  ballX = gameWidth / 2; 
  ballY = gameHeight / 2; 
  drawBall(ballX, ballY);
};

function moveBall(){
  ballX += (ballSpeed * ballXDirection);
  ballY += (ballSpeed * ballYDirection);
};

function drawBall(ballX, ballY){
  ctx.fillStyle = ballColor;
  ctx.strokeStyle = ballBorderColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fill();
};

function checkCollision(){
  if(ballY <= 0 + ballRadius){
    ballYDirection *= -1;
  }
  if(ballY >= gameHeight - ballRadius){
    ballYDirection *= -1;
  }
  if(ballX <= 0){
    player2Score += 1;
    updateScore();
    CreateBall();
    return;
  }
  if(ballX >= gameWidth){
    player1Score += 1;
    updateScore();
    CreateBall();
    return;
  }
  if(ballX <= (paddle1.x + paddle1.width + ballRadius)){
    if(ballY > paddle1.y && ballY < paddle1.y + paddle1.height){
      ballX = (paddle1.x + paddle1.width + ballRadius);
      ballXDirection *= -1;
    }
  }
  if(ballX >= (paddle2.x - ballRadius)){
    if(ballY > paddle2.y && ballY < paddle2.y + paddle2.height){
      ballX = paddle2.x - ballRadius;
      ballXDirection *= -1;
    }
  }
};

function movePaddles(){
  // Modificato: Ora usa event.code per i tasti (soluzione al code smell)
  const paddle1Up = 'KeyW'; 
  const paddle1Down = 'KeyS'; 
  const paddle2Up = 'ArrowUp'; 
  const paddle2Down = 'ArrowDown'; 

  if (keysPressed[paddle1Up] && paddle1.y > 0) {
    paddle1.y -= paddleSpeed;
  }
  if (keysPressed[paddle1Down] && paddle1.y < gameHeight - paddle1.height) {
    paddle1.y += paddleSpeed;
  }

  if (keysPressed[paddle2Up] && paddle2.y > 0) {
    paddle2.y -= paddleSpeed;
  }
  if (keysPressed[paddle2Down] && paddle2.y < gameHeight - paddle2.height) {
    paddle2.y += paddleSpeed;
  }
};

function updateScore(){
  scoreText.textContent = `${player1Score} : ${player2Score}`;
};

function resetGame(){
  player1Score = 0;
  player2Score = 0;
  paddle1.y = 0;
  paddle2.y = gameHeight - paddle2.height; 
  ballSpeed = 2.5; 
  ballX = gameWidth / 2; 
  ballY = gameHeight / 2; 
  ballXDirection = 0; 
  ballYDirection = 0; 
  keysPressed = {}; 
  updateScore();
  clearInterval(intervalId); 
  gameStart(); 
};

// Funzione per scalare l'intero wrapper del gioco per adattarsi allo schermo
function scaleGameWrapper() {
    const originalTransform = gameWrapper.style.transform;
    gameWrapper.style.transform = 'none'; 

    const idealGameWidth = gameWrapper.offsetWidth;
    const idealGameHeight = gameWrapper.offsetHeight;
    
    gameWrapper.style.transform = originalTransform;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const margin = 40; 
    const scaleX = (viewportWidth - margin) / idealGameWidth;
    const scaleY = (viewportHeight - margin) / idealGameHeight;

    const scaleFactor = Math.min(scaleX, scaleY); 

    gameWrapper.style.transform = `scale(${scaleFactor})`;
}

// --- Funzioni per l'animazione stellare (sfondo della BOARD) ---

function resizeStarBackground() {
    starBackgroundCanvas.width = gameBoard.width;
    starBackgroundCanvas.height = gameBoard.height;
}

function initStars() {
    resizeStarBackground(); 
    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * starBackgroundCanvas.width,
            y: Math.random() * starBackgroundCanvas.height,
            radius: Math.random() * 1.5 + 0.5, 
            alpha: Math.random(), 
            velocity: Math.random() * 0.5 + 0.1 
        });
    }
}

function drawStar(star) {
    starCtx.beginPath();
    starCtx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    starCtx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
    starCtx.fill();
}

function updateStars() {
    starCtx.clearRect(0, 0, starBackgroundCanvas.width, starBackgroundCanvas.height); 

    for (let i = 0; i < numStars; i++) {
        const star = stars[i];
        star.y += star.velocity * starSpeed; 
        if (star.y > starBackgroundCanvas.height) {
            star.y = 0;
            star.x = Math.random() * starBackgroundCanvas.width; 
        }
        star.alpha += (Math.random() - 0.5) * 0.05; 
        if (star.alpha > 1) star.alpha = 1;
        if (star.alpha < 0) star.alpha = 0;
        drawStar(star);
    }
}

function animateStars() {
    updateStars();
    requestAnimationFrame(animateStars); 
}

// --- Nuove funzioni per l'animazione di sfondo del BODY ---

function resizeBodyBackground() {
    bodyBackgroundCanvas.width = window.innerWidth;
    bodyBackgroundCanvas.height = window.innerHeight;
}

function initParticles() {
    resizeBodyBackground(); 
    for (let i = 0; i < numParticles; i++) {
        particles.push({
            x: Math.random() * bodyBackgroundCanvas.width,
            y: Math.random() * bodyBackgroundCanvas.height,
            radius: Math.random() * 20 + 10, 
            alpha: Math.random() * 0.5 + 0.1, 
            vx: (Math.random() - 0.5) * particleSpeed * 10, 
            vy: (Math.random() - 0.5) * particleSpeed * 10, 
            life: Math.random() * 100 + 50 
        });
    }
}

function drawParticle(particle) {
    bodyBgCtx.beginPath();
    bodyBgCtx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    bodyBgCtx.fillStyle = `rgba(100, 200, 255, ${particle.alpha * (particle.life / 150)})`; 
    bodyBgCtx.fill();
}

function updateParticles() {
    // Pulisce completamente il canvas di sfondo ad ogni frame per eliminare l'effetto "striscia" delle particelle.
    bodyBgCtx.clearRect(0, 0, bodyBackgroundCanvas.width, bodyBackgroundCanvas.height);

    for (let i = 0; i < numParticles; i++) {
        const particle = particles[i];

        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 0.5; 

        if (particle.life <= 0 || 
            particle.x < -particle.radius || particle.x > bodyBackgroundCanvas.width + particle.radius ||
            particle.y < -particle.radius || particle.y > bodyBackgroundCanvas.height + particle.radius) {
            
            particles[i] = {
                x: Math.random() * bodyBackgroundCanvas.width,
                y: Math.random() * bodyBackgroundCanvas.height,
                radius: Math.random() * 20 + 10,
                alpha: Math.random() * 0.5 + 0.1,
                vx: (Math.random() - 0.5) * particleSpeed * 10,
                vy: (Math.random() - 0.5) * particleSpeed * 10,
                life: Math.random() * 100 + 50
            };
        }

        drawParticle(particle);
    }
}

function animateParticles() {
    updateParticles();
    requestAnimationFrame(animateParticles); 
}
