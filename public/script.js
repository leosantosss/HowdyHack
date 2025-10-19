// Category data
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

// Wait for DOM to be ready
window.addEventListener('DOMContentLoaded', () => {
  
  // Function to update score display
  function updateScore(points) {
    score += points;
    document.getElementById('score-display').textContent = score;
  }

  // Function to handle time up
  function handleTimeUp() {
    if (currentCell && currentAnswers.length > 0) {
      updateScore(-currentPoints);
      showModal(false, currentPoints, currentAnswers);
      
      currentCell.classList.add('answered');
      document.getElementById('answer-input').value = "";
      currentCell = null;
      currentAnswers = [];
      currentPoints = 0;
    }
  }

  // Override timer.js functions with local versions that work with our game state
  window.beginQuestionTimer = function(penalty) {
    const timerLength = parseInt(localStorage.getItem('timerLength')) || 15;
    let timeRemaining = timerLength;
    
    const timerBar = document.getElementById('timer-bar');
    const timeLeftText = document.getElementById('time-left');
    const timer = document.getElementById('timer');
    
    if (!timerBar || !timeLeftText || !timer) return;
    
    // Reset visuals
    timer.classList.remove('low');
    timerBar.style.transform = 'scaleX(1)';
    timeLeftText.textContent = timeRemaining;
    
    // Clear any existing timer
    if (window.timerInterval) {
      clearInterval(window.timerInterval);
    }
    
    // Start countdown
    window.timerInterval = setInterval(() => {
      timeRemaining--;
      timeLeftText.textContent = timeRemaining;
      
      const progress = timeRemaining / timerLength;
      timerBar.style.transform = `scaleX(${progress})`;
      
      if (timeRemaining <= 5) {
        timer.classList.add('low');
      }
      
      if (timeRemaining <= 0) {
        clearInterval(window.timerInterval);
        handleTimeUp();
      }
    }, 1000);
  };

  window.cancelQuestionTimer = function() {
    if (window.timerInterval) {
      clearInterval(window.timerInterval);
      window.timerInterval = null;
    }
  };

  function checkAnswer() {
    if (!currentCell || currentAnswers.length === 0) {
      return;
    }

    const userAnswer = document.getElementById('answer-input').value.trim().toLowerCase();

    if (userAnswer === "") {
      alert('Please enter an answer!');
      return;
    }

    // Stop the timer
    window.cancelQuestionTimer();

    if (currentAnswers.includes(userAnswer)) {
      updateScore(currentPoints);
      showModal(true, currentPoints);
    } else {
      updateScore(-currentPoints);
      showModal(false, currentPoints, currentAnswers);
    }

    currentCell.classList.add('answered');
    document.getElementById('answer-input').value = "";
    currentCell = null;
    currentAnswers = [];
    currentPoints = 0;
  }

  function showModal(isCorrect, points, correctAnswersList = []) {
    const modal = document.getElementById('modal');
    const modalOverlay = document.getElementById('modal-overlay');
    
    modal.className = 'modal ' + (isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
      document.getElementById('modal-icon').textContent = '🎉';
      document.getElementById('modal-title').textContent = 'CORRECT!';
      document.getElementById('modal-points').textContent = '+$' + points;
      document.getElementById('modal-message').textContent = 'Great job, Aggie!';
      document.getElementById('correct-answers-section').style.display = 'none';
    } else {
      document.getElementById('modal-icon').textContent = '❌';
      document.getElementById('modal-title').textContent = 'INCORRECT';
      document.getElementById('modal-points').textContent = '-$' + points;
      document.getElementById('modal-message').textContent = 'Better luck next time!';
      document.getElementById('correct-answers-section').innerHTML = '<strong>Correct answers:</strong><br>' +
        correctAnswersList.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ');
      document.getElementById('correct-answers-section').style.display = 'block';
    }

    modalOverlay.classList.add('show');
  }

  // Add click event to all cells
  document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', function () {
      if (!this.classList.contains('flipped') && !this.classList.contains('answered')) {
        // If there's a previous cell that wasn't answered, flip it back
        if (currentCell && currentCell !== this) {
          currentCell.classList.remove('flipped');
        }

        this.classList.add('flipped');
        currentCell = this;

        // Start music when the first card is turned over
        startMusicIfNeeded();

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

  // Modal overlay click
  document.getElementById('modal-overlay').addEventListener('click', function (e) {
    if (e.target === this) {
      this.classList.remove('show');
    }
  });

  // Submit button
  document.getElementById('submit-answer').addEventListener('click', checkAnswer);

  // Enter key on input
  document.getElementById('answer-input').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
      checkAnswer();
    }
  });
});