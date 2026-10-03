
/* ==========================================================================
   1. QUIZ CONFIGURATION (10 HIGH-HUMOR RIDDLES)
   ========================================================================== */
const QUIZ_QUESTIONS = [
  {
    question: "1. When you say 'I'm not hungry', what does that mathematically translate to?",
    options: ["I am actually full", "I want a tiny bite of yours", "I am starving but I want you to guess what I want", "I only want dessert"],
    correctAnswerIndex: 2
  },
  {
    question: "2. What is my absolute favorite part of our video calls?",
    options: ["Seeing your beautiful face", "Hearing your sweet voice", "When the WiFi freezes and your face gets stuck looking hilarious", "Having deep conversations"],
    correctAnswerIndex: 2
  },
  {
    question: "3. If you had a superpower, what would it realistically be?",
    options: ["Mind reading", "Adding items to an online cart without having to pay", "Teleporting into my room", "Invisibility"],
    correctAnswerIndex: 1 
  },
  {
    question: "4. In the rare event of an argument, who is universally and legally always right?",
    options: ["Me", "Logic and Reason", "Also Me", "Aditi, obviously"],
    correctAnswerIndex: 3
  },
  {
    question: "5. When you say 'I'll be ready in 5 minutes', how long does that actually take in Earth time?",
    options: ["Exactly 5 minutes", "15 minutes max", "45 minutes and 3 different outfit changes", "Tomorrow"],
    correctAnswerIndex: 2
  },
  {
    question: "6. What is the absolute hardest thing about us being long-distance?",
    options: ["Missing your hugs", "Not holding your hand", "Not being able to steal my hoodies", "Watching you eat something delicious on camera while I have nothing"],
    correctAnswerIndex: 3
  },
  {
    question: "7. What is the most likely reason I haven't replied to your text for 15 minutes?",
    options: ["I'm busy working hard", "I fell asleep mid-sentence", "I'm planning a romantic surprise", "I left my phone in another room"],
    correctAnswerIndex: 1
  },
  {
    question: "8. Since it's your birthday, you get one ultimate wish today. Choose very wisely.",
    options: ["Unlimited pizza for life", "Me not making any annoying jokes for a full 24 hours", "A million bucks", "World peace"],
    correctAnswerIndex: 1
  },
  {
    question: "9. How much do I actually love you?",
    options: ["A normal amount", "To the moon and back", "More than I love sleep", "More than you love annoying me (and that is A LOT)"],
    correctAnswerIndex: 3
  },
  {
    question: "10. Who is the most gorgeous, amazing, slightly-crazy birthday girl in the entire world?",
    options: ["Aditi", "Still Aditi", "Always Aditi", "Click literally any of these, you win"],
    correctAnswerIndex: 3 // Fun twist: all of them technically work, but make her click the last one!
  }
];
/* ==========================================================================
   2. AUDIO CONFIGURATION & VOLUME
   ========================================================================== */
const AUDIO_CONFIG = {
  level1Start: "assets/kbc-question.mp3",
  level1Bgm:   "assets/kbc-clock.mp3",
  level1Tap:   "assets/tap.mp3",
  level1Win:   "assets/kbc-right-answer.mp3",
  
  level2Start: "assets/mp3",
  level2Bgm:   "assets/spiderman-meme-song.mp3",
  level2Tap:   "assets/meow.mp3",
  level2Win:   "assets/kids-saying-yay-sound-effect_3.mp3",
  
  level3Start: "assets/start.mp3",
  level3Bgm:   "assets/ninja-hattori.mp3",      
  level3Jump:  "assets/maro-jump-sound-effect_1.mp3",
  level3Hit:   "assets/error.mp3",
  level3Die:   "assets/cat-laugh-meme-1.mp3",
  finaleWin:   "assets/musica-romantica.mp3"
};

const sounds = {};
for (const [key, path] of Object.entries(AUDIO_CONFIG)) {
  sounds[key] = new Audio(path);
  sounds[key].preload = "auto";
}

sounds.level1Bgm.loop = true;
sounds.level2Bgm.loop = true;
sounds.level3Bgm.loop = true;
sounds.finaleWin.loop = true;
sounds.level1Bgm.volume = 0.8;
sounds.level2Bgm.volume = 0.8;
sounds.level3Bgm.volume = 0.8;   
sounds.level1Tap.volume = 0.25;  
sounds.level2Tap.volume = 0.25;  
sounds.level3Jump.volume = 0.25; 
sounds.level3Hit.volume = 0.4;   

function playSound(audioKey) {
  const sound = sounds[audioKey];
  if (!sound) return;
  sound.currentTime = 0;
  const playPromise = sound.play();
  if (playPromise !== undefined) {
    playPromise.catch((err) => console.warn(`Audio issue:`, err));
  }
}

function stopSound(audioKey) {
  const sound = sounds[audioKey];
  if (!sound) return;
  sound.pause();
  sound.currentTime = 0;
}

/* ==========================================================================
   3. DOM ELEMENTS & STATE
   ========================================================================== */
const entryScreen       = document.getElementById("entry-screen");
const beginBtn          = document.getElementById("begin-btn");

const quizStage         = document.getElementById("quiz-stage");
const questionText      = document.getElementById("question-text");
const optionsContainer  = document.getElementById("options-container");

const ghostStage        = document.getElementById("ghost-stage");
const ghostBtnContainer = document.getElementById("ghost-buttons-container");

const rewardScreen      = document.getElementById("reward-screen");
const rewardTitle       = document.getElementById("reward-title");
const rewardText        = document.getElementById("reward-text");
const nextLevelBtn      = document.getElementById("next-level-btn");

const jumpStage         = document.getElementById("jump-stage");
const jumpStartOverlay  = document.getElementById("jump-start-overlay");
const startJumpBtn      = document.getElementById("start-jump-btn");
const livesDisplay      = document.getElementById("lives-display");
const scoreDisplay      = document.getElementById("score-display");
const jumpBtn           = document.getElementById("jump-btn");
const canvas            = document.getElementById("game-canvas");
const ctx               = canvas ? canvas.getContext("2d") : null;
const finalScreen       = document.getElementById("final-screen");

let currentLevel = 1;
const aditiFace = new Image();
aditiFace.onload = () => {
  if (!jumpStage.classList.contains("hidden") && !gameActive) {
    drawJumpPreview();
  }
};
aditiFace.onerror = () => {
  console.error("ERROR: Cannot find 'assets/aditi-face.png'. Check spelling and folder location!");
  alert("Dev Note: The image 'aditi-face.png' is missing or misspelled in your assets folder!");
};
aditiFace.src = "assets/aditi_face.png";

/* ==========================================================================
   4. LEVEL 1: QUIZ LOGIC
   ========================================================================== */
let currentQuestionIndex = 0;

function setupQuizStage() {
  quizStage.classList.remove("hidden");
  ghostStage.classList.add("hidden");
  jumpStage.classList.add("hidden");
  rewardScreen.classList.add("hidden");
  
  currentQuestionIndex = 0;
  loadQuestion();
}

function loadQuestion() {
  const qData = QUIZ_QUESTIONS[currentQuestionIndex];
  questionText.innerText = qData.question;
  optionsContainer.innerHTML = "";

  qData.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.className = "quiz-option";
    btn.innerText = opt;
    btn.onclick = () => handleQuizAnswer(idx, qData.correctAnswerIndex, btn);
    optionsContainer.appendChild(btn);
  });
}

function handleQuizAnswer(selectedIndex, correctIndex, btnElement) {
  if (selectedIndex === correctIndex) {
    playSound("level1Tap");
    currentQuestionIndex++;
    if (currentQuestionIndex < QUIZ_QUESTIONS.length) {
      loadQuestion();
    } else {
      completeStage(1);
    }
  } else {
    playSound("level3Hit"); 
    btnElement.classList.add("shake-anim");
    setTimeout(() => btnElement.classList.remove("shake-anim"), 300);
  }
}

/* ==========================================================================
   5. LEVEL 2: GHOST MODE & FALSE TAPS
   ========================================================================== */
let ghostTapCount = 0;
const ghostMaxTaps = 5;

function setupGhostStage() {
  quizStage.classList.add("hidden");
  rewardScreen.classList.add("hidden");
  ghostStage.classList.remove("hidden");
  
  ghostTapCount = 0;
  spawnGhostButtons();
}

function spawnGhostButtons() {
  ghostBtnContainer.innerHTML = ""; 
  
  const buttonsData = [
    { isReal: true, text: "Catch Me!" },
    { isReal: false, text: "Catch Me!" },
    { isReal: false, text: "Catch Me!" }
  ];
  buttonsData.sort(() => Math.random() - 0.5);

  const padding = 70;
  const maxX = window.innerWidth - 130 - padding;
  const maxY = window.innerHeight - 60 - padding;

  buttonsData.forEach(data => {
    const btn = document.createElement("button");
    btn.className = "tease-btn-dynamic ghost-appear";
    btn.innerText = data.text;
    
    btn.style.left = `${Math.max(padding, Math.floor(Math.random() * maxX))}px`;
    btn.style.top = `${Math.max(padding, Math.floor(Math.random() * maxY))}px`;

    btn.onpointerdown = (e) => {
      e.preventDefault();
      handleGhostTap(data.isReal, btn);
    };
    
    ghostBtnContainer.appendChild(btn);
  });
}

function handleGhostTap(isReal, btnElement) {
  if (isReal) {
    playSound("level2Tap");
    ghostTapCount++;
    
    const allBtns = document.querySelectorAll(".tease-btn-dynamic");
    allBtns.forEach(b => {
      b.classList.remove("ghost-appear");
      b.classList.add("ghost-vanish");
    });

    if (ghostTapCount >= ghostMaxTaps) {
      setTimeout(() => completeStage(2), 300);
    } else {
      setTimeout(spawnGhostButtons, 350);
    }
  } else {
    playSound("level3Hit");
    btnElement.classList.add("shake-anim");
    setTimeout(() => btnElement.classList.remove("shake-anim"), 300);
  }
}

/* ==========================================================================
   6. STAGE NAVIGATION & REWARDS
   ========================================================================== */
/* ==========================================================================
   6. STAGE NAVIGATION & REWARDS
   ========================================================================== */
beginBtn.addEventListener("click", () => {
  playSound("level1Start");
  
  // Delay the BGM by 1.2 seconds so it doesn't mix with the Start sound!
  setTimeout(() => {
    playSound("level1Bgm"); 
  }, 3500);
  
  entryScreen.classList.add("hidden");
  currentLevel = 1;
  setupQuizStage();
});

function completeStage(levelNum) {
  quizStage.classList.add("hidden");
  ghostStage.classList.add("hidden");
  rewardScreen.classList.remove("hidden");

  if (levelNum === 1) {
    stopSound("level1Bgm"); 
    playSound("level1Win"); 
    
    // Add sticky note style for Level 1
    rewardScreen.classList.add("sticky-note");
    
    rewardTitle.innerText = "Level 1 Cleared! ❤️";
    rewardText.innerText = "This is how you won that race as well and made it to this world 😂❤️";
    nextLevelBtn.innerText = "Start Level 2 ➡️";
  } else if (levelNum === 2) {
    stopSound("level2Bgm"); 
    playSound("level2Win"); 
    
    // Remove sticky note style for Level 2 (returns to normal card)
    rewardScreen.classList.remove("sticky-note");
    
    rewardTitle.innerText = "🎉 Level 2 Cleared! 🎉";
    rewardText.innerText = "You found the real you! Now for the final stage... ready to run?";
    nextLevelBtn.innerText = "Enter Level 3 🌲";
  }

  if (typeof confetti === "function") {
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
  }
}

nextLevelBtn.addEventListener("click", () => {
  if (currentLevel === 1) {
    currentLevel = 2;
    playSound("level2Start");
    
    // Delay the Level 2 BGM so it doesn't mix with the Level 2 Start sound
    setTimeout(() => {
      playSound("level2Bgm");
    }, 1000);
    
    setupGhostStage();
  } else if (currentLevel === 2) {
    currentLevel = 3;
    rewardScreen.classList.add("hidden");
    jumpStage.classList.remove("hidden");
    
    // Level 3 BGM can start immediately since it plays behind the Start overlay
    playSound("level3Bgm");
    prepareJumpStage();
  }
});

/* ==========================================================================
   7. LEVEL 3: JUMP GAME ENGINE
   ========================================================================== */
let gameLoopReq;
let player, obstacles, frames, score, lives;
let gameActive = false;

function prepareJumpStage() {
  if (!canvas) return;
  canvas.width = Math.min(window.innerWidth * 0.95, 500);
  canvas.height = 300;

  resetJumpGameState();
  drawJumpPreview();
  jumpStartOverlay.classList.remove("hidden");
}

startJumpBtn.addEventListener("click", () => {
  playSound("level3Start");
  jumpStartOverlay.classList.add("hidden");
  startGameLoop();
});

function startGameLoop() {
  function triggerJump(e) {
    if (e.cancelable) e.preventDefault();
    if (player && player.grounded && gameActive) {
      playSound("level3Jump");
      player.dy = player.jumpPower;
      player.grounded = false;
    }
  }

  jumpBtn.replaceWith(jumpBtn.cloneNode(true));
  const newJumpBtn = document.getElementById("jump-btn");
  newJumpBtn.addEventListener("touchstart", triggerJump, { passive: false });
  newJumpBtn.addEventListener("mousedown", triggerJump);
  canvas.onpointerdown = triggerJump;

  gameActive = true;
  if (gameLoopReq) cancelAnimationFrame(gameLoopReq);
  animateJumpGame();
}

function resetJumpGameState() {
  player = { x: 40, y: 200, w: 50, h: 50, dy: 0, gravity: 0.9, jumpPower: -16, grounded: true };
  obstacles = [];
  frames = 0;
  score = 0;
  lives = 3;
  updateHUD();
}

function updateHUD() {
  livesDisplay.innerText = "❤️".repeat(Math.max(0, lives));
  scoreDisplay.innerText = `Trees: ${score}/22`;
}

function drawJumpPreview() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#8B4513";
  ctx.fillRect(0, canvas.height - 15, canvas.width, 15);

  if (aditiFace.complete && aditiFace.naturalWidth !== 0) {
    ctx.drawImage(aditiFace, player.x, player.y, player.w, player.h);
  } else {
    ctx.fillStyle = "#e91e63";
    ctx.fillRect(player.x, player.y, player.w, player.h);
  }
}

function animateJumpGame() {
  if (!gameActive) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#8B4513";
  ctx.fillRect(0, canvas.height - 15, canvas.width, 15);

  player.dy += player.gravity;
  player.y += player.dy;

  if (player.y + player.h >= canvas.height - 15) {
    player.y = canvas.height - 15 - player.h;
    player.dy = 0;
    player.grounded = true;
  }

  if (aditiFace.complete && aditiFace.naturalWidth !== 0) {
    ctx.drawImage(aditiFace, player.x, player.y, player.w, player.h);
  } else {
    ctx.fillStyle = "#e91e63";
    ctx.fillRect(player.x, player.y, player.w, player.h);
  }

  if (frames % 90 === 0) {
    obstacles.push({ x: canvas.width, y: canvas.height - 55, w: 35, h: 40, passed: false });
  }

  for (let i = 0; i < obstacles.length; i++) {
    let obs = obstacles[i];
    obs.x -= 4.5;

    ctx.font = "40px Arial";
    ctx.fillText("🌲", obs.x - 5, obs.y + 35);

    const pPad = 12;
    const oPad = 10;

    if (
      player.x + pPad < obs.x + obs.w - oPad &&
      player.x + player.w - pPad > obs.x + oPad &&
      player.y + pPad < obs.y + obs.h - oPad &&
      player.y + player.h - pPad > obs.y + oPad
    ) {
      playSound("level3Hit");
      lives--;
      updateHUD();
      obstacles = [];

      if (lives <= 0) {
        gameActive = false;
        stopSound("level3Bgm");
        playSound("level3Die");

        setTimeout(() => {
          alert("Oh no! You tripped! Try again, Aditi.");
          playSound("level3Bgm");
          resetJumpGameState();
          jumpStartOverlay.classList.remove("hidden");
          drawJumpPreview();
        }, 800);
        return;
      }
      break;
    }

    if (!obs.passed && obs.x + obs.w < player.x) {
      obs.passed = true;
      score++;
      updateHUD();

      if (score >= 22) {
        gameActive = false;
        stopSound("level3Bgm");
        playSound("finaleWin");
        jumpStage.classList.add("hidden");
        finalScreen.classList.remove("hidden");
        fireMassiveConfetti();
        return;
      }
    }
  }

  obstacles = obstacles.filter((obs) => obs.x + obs.w > 0);
  frames++;

  if (gameActive) {
    gameLoopReq = requestAnimationFrame(animateJumpGame);
  }
}

/* ==========================================================================
   8. CONFETTI CELEBRATION
   ========================================================================== */
function fireMassiveConfetti() {
  if (typeof confetti !== "function") return;
  const duration = 3500;
  const end = Date.now() + duration;

  (function frame() {
    confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#e91e63', '#ffffff', '#ff4081'] });
    confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#e91e63', '#ffffff', '#ff4081'] });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
