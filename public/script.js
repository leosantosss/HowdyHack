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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const CATEGORIES = [
  {
    name: "Aggie Traditions",
    clues: [
      { points: 200, q: "Thumbs-up hand sign used by Aggies.", a: ["gig 'em", "gig em", "gig'em", "gigem", "gigem!", "gig 'em!"] },
      { points: 400, q: "The solemn campus ceremony honoring recently fallen students, held the first Tuesday of the month.", a: ["silver taps", "silvertaps"] },
      { points: 600, q: "Annual worldwide remembrance where Aggies answer 'Here' for the fallen.", a: ["aggie muster", "muster"] },
      { points: 800, q: "This coveted piece of jewelry symbolizes Aggie achievement and unity.", a: ["aggie ring", "the aggie ring", "ring"] },
      { points: 1000, q: "The late-night pep rally tradition held before big games.", a: ["midnight yell", "midnight yell practice", "yell practice"] },
    ]
  },
  {
    name: "Campus Landmarks",
    clues: [
      { points: 200, q: "Home stadium of Aggie Football.", a: ["kyle field"] },
      { points: 400, q: "Historic tree near the Academic Building known for proposals.", a: ["century tree", "the century tree"] },
      { points: 600, q: "Memorial site dedicated to the 1999 tragedy.", a: ["bonfire memorial", "aggie bonfire memorial", "bonfire"] },
      { points: 800, q: "This building's dome is an iconic symbol of campus.", a: ["academic building", "the academic building"] },
      { points: 1000, q: "This collie's residence is guarded by the Corps' Mascot Company.", a: ["reveille's dorm", "reveille dorm", "reveille's residence", "reveille residence", "reveille"] },
    ]
  },
  {
    name: "Yells & Lingo",
    clues: [
      { points: 200, q: "Official campus greeting.", a: ["howdy"] },
      { points: 400, q: "Exclamation traditionally reserved for juniors and seniors.", a: ["whoop", "whoop!"] },
      { points: 600, q: "Students who lead yells at games (not cheerleaders).", a: ["yell leaders", "yell leader"] },
      { points: 800, q: "Collective name Aggies use for the student body at games.", a: ["12th man", "the 12th man", "twelfth man"] },
      { points: 1000, q: "Group that preserves many traditions through disciplined leadership training.", a: ["corps of cadets", "the corps of cadets", "corps"] },
    ]
  },
  {
    name: "Sports & Spirit",
    clues: [
      { points: 200, q: "Conference Texas A&M currently competes in for most sports.", a: ["sec", "southeastern conference"] },
      { points: 400, q: "The live canine mascot of Texas A&M.", a: ["reveille"] },
      { points: 600, q: "Mass maroon-shirt crowd initiative first launched in 1998.", a: ["maroon out", "maroon-out", "maroonout"] },
      { points: 800, q: "Nickname for the dedicated standing student section at football games.", a: ["12th man", "the 12th man", "twelfth man"] },
      { points: 1000, q: "This drum line's booming cadence fires up Kyle Field.", a: ["fightin' texas aggie band", "fightin texas aggie band", "texas aggie band", "aggie band"] },
    ]
  },
  {
    name: "History & Alumni",
    clues: [
      { points: 200, q: "Year Texas A&M was founded (within 1 year).", a: ["1876", "1875", "1877"], type: "numeric" },
      { points: 400, q: "The 'A' and 'M' originally stood for this.", a: ["agricultural and mechanical", "agriculture and mechanical", "agricultural & mechanical"] },
      { points: 600, q: "This Aggie became the 41st U.S. President.", a: ["george h. w. bush", "george bush sr", "george herbert walker bush", "george hw bush"] },
      { points: 800, q: "Aggie astronaut who commanded the International Space Station (last name ok).", a: ["foale", "mike foale", "michael foale", "shannon walker", "walker"] },
      { points: 1000, q: "Legendary football training camp story tied to Bear Bryant.", a: ["junction boys", "the junction boys"] },
    ]
  },
  {
    name: "College Station Life",
    clues: [
      { points: 200, q: "City that, with Bryan, forms the metro area Aggies call home.", a: ["college station"] },
      { points: 400, q: "Major on-campus event where freshmen learn Aggie spirit before classes.", a: ["fish camp", "fishcamp"] },
      { points: 600, q: "On-campus transportation system used by many students.", a: ["aggie spirit bus", "aggie spirit", "bus", "transit", "aggie bus"] },
      { points: 800, q: "The academic calendar's big rivalry week nickname (two words).", a: ["beat week", "beat the hell outta", "beat the hell outta week"] },
      { points: 1000, q: "Organization that coordinates many game-day traditions (abbr. ok).", a: ["tamus", "texas a&m university system", "traditions council", "aggie traditions council"] },
    ]
  },
];

// Background music setup
const bgMusic = new Audio('jeopardy_theme.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.6;
bgMusic.preload = 'auto';

let _jeopardyMusicStarted = false;

function startMusicIfNeeded() {
  if (_jeopardyMusicStarted) return;
  if (localStorage.getItem('soundEnabled') === 'true') {
    _jeopardyMusicStarted = true;
    bgMusic.play().catch(() => {});
  }
}

function stopMusic() {
  if (!_jeopardyMusicStarted) return;
  bgMusic.pause();
  bgMusic.currentTime = 0;
  _jeopardyMusicStarted = false;
}

// Initialize game state
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

document.querySelectorAll('.cell').forEach(cell => {
  cell.addEventListener('click', function () {
    if (!this.classList.contains('flipped') && !this.classList.contains('answered')) {
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
    document.getElementById('answer-input').value = "";
    currentCell = null;
    currentAnswers = [];
    currentPoints = 0;

    checkGameOver();
  }

function checkAnswer() {
  if (!currentCell || currentAnswers.length === 0) {
    return;
  }

  stopTimer();

  const userAnswer = answerInput.value.trim().toLowerCase();

    modalOverlay.classList.add('show');
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

        // Get the point value from the cell
        const pointText = this.querySelector('.cell-front').textContent;
        currentPoints = parseInt(pointText.replace('$', ''));

        // Support multiple comma-separated answers
        currentAnswers = this.getAttribute('data-answer')
          .split(',')
          .map(a => a.trim().toLowerCase());

        // Start the timer with penalty
        window.beginQuestionTimer(currentPoints);
      }
    });
  });

  // Modal close button
  document.getElementById('modal-close').addEventListener('click', function () {
    document.getElementById('modal-overlay').classList.remove('show');
  });

function checkGameOver() {
  const allCells = document.querySelectorAll('.cell');
  const answeredCells = document.querySelectorAll('.cell.answered');

  if (allCells.length === answeredCells.length) {
    setTimeout(() => {
      saveScoreToLeaderboard();
    }, 1000);
  }
}

// ... (rest of your code before saveScoreToLeaderboard)


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

  // 1. CHECK ADDED: Ensure Firebase connection is ready
  if (!db || typeof db.collection !== 'function') {
      console.error('Firebase Firestore not initialized or available.');
      alert('Error: The database connection is not ready. Check Firebase setup.');
      return;
  }
  
  // The old 'if (score <= 0) { ... }' check has been REMOVED here.
  
  try {
    const docData = {
      name: playerName,
      score: score, // This will now save negative, zero, or positive scores
      timestamp: new Date()
    };
        
    console.log('Step 3: Adding to firestore...');
    const docRef = await db.collection('leaderboard').add(docData);
        
    console.log('Step 4: SUCCESS - Doc ID:', docRef.id);
    
    // 2. Alert and Redirection Logic
    const message = `Game over, ${playerName}! Your final score of ${score} has been recorded to the leaderboard.`;
    alert(message);
    
    console.log('Step 5: Redirecting...');
    setTimeout(() => {
        window.location.href = 'leaderboard.html';
    }, 0); 

  } catch (error) {
    console.error('=== ERROR DURING SAVE ===');
    console.error('Error object:', error);
    console.error('Error message:', error.message);
    alert(`Error saving score: ${error.message}. Please check console for details.`);
  }
}

// ... (rest of your code after saveScoreToLeaderboard)

submitButton.addEventListener('click', checkAnswer);

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