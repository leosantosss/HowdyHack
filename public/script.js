// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDJHdY1EuULi38otKAWEEP8idtgUUdNrXs",
  authDomain: "texasamjeopardy.firebaseapp.com",
  projectId: "texasamjeopardy",
  storageBucket: "texasamjeopardy.firebasestorage.app",
  messagingSenderId: "188279865719",
  appId: "1:188279865719:web:c7773fd9559c65922e6172",
  measurementId: "G-VMJ3PLNDMF"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Background Music Setup
const bgMusic = new Audio('jeopardy_theme.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.3;
bgMusic.preload = 'auto';

let musicStarted = false;

function startMusicIfNeeded() {
  if (musicStarted) return;
  const soundEnabled = localStorage.getItem('soundEnabled');
  if (soundEnabled === 'true') {
    musicStarted = true;
    bgMusic.play().catch(err => {
      console.log('Music autoplay blocked by browser:', err);
    });
  }
}

function stopMusic() {
  if (!musicStarted) return;
  bgMusic.pause();
  bgMusic.currentTime = 0;
  musicStarted = false;
}

let score = 0;
let currentCell = null;
let currentAnswers = [];
let currentPoints = 0;
let timerInterval = null;
let timeRemaining = 15;
let totalTime = 15;

const modalOverlay = document.getElementById('modal-overlay');
const modal = document.getElementById('modal');
const modalIcon = document.getElementById('modal-icon');
const modalTitle = document.getElementById('modal-title');
const modalPoints = document.getElementById('modal-points');
const modalMessage = document.getElementById('modal-message');
const correctAnswersSection = document.getElementById('correct-answers-section');
const modalClose = document.getElementById('modal-close');

const answerInput = document.getElementById('answer-input');
const submitButton = document.getElementById('submit-answer');
const scoreDisplay = document.getElementById('score-display');

// Cell click handler
document.querySelectorAll('.cell').forEach(cell => {
  cell.addEventListener('click', function () {
    if (!this.classList.contains('flipped') && !this.classList.contains('answered')) {
      // Start music on first click
      startMusicIfNeeded();
      
      if (currentCell && currentCell !== this) {
        currentCell.classList.remove('flipped');
      }

      this.classList.add('flipped');
      currentCell = this;

      const pointText = this.querySelector('.cell-front').textContent;
      currentPoints = parseInt(pointText.replace('$', ''));

      currentAnswers = this.getAttribute('data-answer')
        .split(',')
        .map(a => a.trim().toLowerCase());

      startTimer();
    }
  });
});

function updateScore(points) {
  score += points;
  scoreDisplay.textContent = score;
}

function startTimer() {
  const savedTime = localStorage.getItem('timerLength');
  totalTime = savedTime ? parseInt(savedTime) : 15;
  timeRemaining = totalTime;

  document.getElementById('time-left').textContent = timeRemaining;
  document.getElementById('timer-bar').style.transform = 'scaleX(1)';
  document.getElementById('timer').classList.remove('low');

  if (timerInterval) {
    clearInterval(timerInterval);
  }

  timerInterval = setInterval(() => {
    timeRemaining--;
    document.getElementById('time-left').textContent = timeRemaining;

    const progress = timeRemaining / totalTime;
    document.getElementById('timer-bar').style.transform = `scaleX(${progress})`;

    if (timeRemaining <= 5) {
      document.getElementById('timer').classList.add('low');
    }

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      timeUp();
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function timeUp() {
  if (currentCell && currentAnswers.length > 0) {
    updateScore(-currentPoints);
    showModal(false, currentPoints, currentAnswers);

    currentCell.classList.add('answered');
    answerInput.value = "";
    currentCell = null;
    currentAnswers = [];
    currentPoints = 0;

    checkGameOver();
  }
}

function checkAnswer() {
  if (!currentCell || currentAnswers.length === 0) {
    return;
  }

  stopTimer();

  const userAnswer = answerInput.value.trim().toLowerCase();

  if (userAnswer === "") {
    showModal(false, 0, ['Please enter an answer!']);
    return;
  }

  if (currentAnswers.includes(userAnswer)) {
    updateScore(currentPoints);
    showModal(true, currentPoints);
  } else {
    updateScore(-currentPoints);
    showModal(false, currentPoints, currentAnswers);
  }

  currentCell.classList.add('answered');
  answerInput.value = "";
  currentCell = null;
  currentAnswers = [];
  currentPoints = 0;

  checkGameOver();
}

function showModal(isCorrect, points, correctAnswersList = []) {
  modal.className = 'modal ' + (isCorrect ? 'correct' : 'wrong');

  if (isCorrect) {
    modalIcon.textContent = '🎉';
    modalTitle.textContent = 'CORRECT!';
    modalPoints.textContent = '+$' + points;
    modalMessage.textContent = 'Great job, Aggie!';
    correctAnswersSection.style.display = 'none';
  } else {
    modalIcon.textContent = '❌';
    modalTitle.textContent = 'INCORRECT';
    modalPoints.textContent = '-$' + points;
    modalMessage.textContent = 'Better luck next time!';
    correctAnswersSection.innerHTML = '<strong>Correct answers:</strong><br>' +
      correctAnswersList.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ');
    correctAnswersSection.style.display = 'block';
  }

  modalOverlay.classList.add('show');
}

modalClose.addEventListener('click', function () {
  modalOverlay.classList.remove('show');
});

modalOverlay.addEventListener('click', function (e) {
  if (e.target === modalOverlay) {
    modalOverlay.classList.remove('show');
  }
});

function checkGameOver() {
  const allCells = document.querySelectorAll('.cell');
  const answeredCells = document.querySelectorAll('.cell.answered');

  if (allCells.length === answeredCells.length) {
    stopMusic(); // Stop music when game ends
    setTimeout(() => {
      saveScoreToLeaderboard();
    }, 1000);
  }
}

async function saveScoreToLeaderboard() {
  console.log('=== START SAVE ===');
  console.log('Score value:', score);

  let playerName = prompt('What is your name, Aggie?', 'Anonymous Aggie');

  if (playerName === null || playerName.trim() === '') {
    playerName = 'Anonymous Aggie';
  } else {
    playerName = playerName.trim();
  }

  console.log('Player name:', playerName);
  console.log('Saving score:', playerName, score);

  if (!db || typeof db.collection !== 'function') {
    console.error('Firebase Firestore not initialized');
    alert('Error: Database connection failed');
    return;
  }

  try {
    const docData = {
      name: playerName,
      score: score,
      timestamp: new Date()
    };

    console.log('Adding to firestore:', docData);
    const docRef = await db.collection('leaderboard').add(docData);

    console.log('SUCCESS - Doc ID:', docRef.id);
    alert(`Great game, ${playerName}! Your score of $${score} has been saved!`);

    window.location.href = 'leaderboard.html';
  } catch (error) {
    console.error('ERROR:', error);
    alert(`Error saving score: ${error.message}`);
  }
}

// Submit button click
submitButton.addEventListener('click', checkAnswer);

// Enter key
answerInput.addEventListener('keypress', function (event) {
  if (event.key === 'Enter') {
    checkAnswer();
  }
});

window.addEventListener('DOMContentLoaded', () => {
  const savedTime = localStorage.getItem('timerLength');
  if (savedTime) {
    totalTime = parseInt(savedTime);
    timeRemaining = totalTime;
    document.getElementById('time-left').textContent = savedTime;
  }
});