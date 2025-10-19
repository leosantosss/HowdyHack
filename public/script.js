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

// Initialize score
let score = 0;

// Track the currently selected cell
let currentCell = null;
let currentAnswers = [];
let currentPoints = 0;

let timerInterval = null;
let timeRemaining = 15; // default 15 seconds
let totalTime = 15;



const modalOverlay = document.getElementById('modal-overlay');
const modal = document.getElementById('modal');
const modalIcon = document.getElementById('modal-icon');
const modalTitle = document.getElementById('modal-title');
const modalPoints = document.getElementById('modal-points');
const modalMessage = document.getElementById('modal-message');
const correctAnswersSection = document.getElementById('correct-answers-section');
const modalClose = document.getElementById('modal-close')

// Get input and button elements
const answerInput = document.getElementById('answer-input');
const submitButton = document.getElementById('submit-answer');
const scoreDisplay = document.getElementById('score-display');

// Add click event to all cells
document.querySelectorAll('.cell').forEach(cell => {
  cell.addEventListener('click', function () {
    // Only flip if not already flipped or answered
    if (!this.classList.contains('flipped') && !this.classList.contains('answered')) {
      // If there's a previous cell that wasn't answered, flip it back
      if (currentCell && currentCell !== this) {
        currentCell.classList.remove('flipped');
      }

      this.classList.add('flipped');
      currentCell = this;

      // Get the point value from the cell
      const pointText = this.querySelector('.cell-front').textContent;
      currentPoints = parseInt(pointText.replace('$', ''));

      // Support multiple comma-separated answers
      currentAnswers = this.getAttribute('data-answer')
        .split(',')
        .map(a => a.trim().toLowerCase());

      // Start the timer
      startTimer();
    }
  });
});

// Function to update score display
function updateScore(points) {
  score += points;
  scoreDisplay.textContent = score;
}

function startTimer() {
  // Get timer length from settings (if you have settings stored)
  const savedTime = localStorage.getItem('timerLength');
  totalTime = savedTime ? parseInt(savedTime) : 15;
  timeRemaining = totalTime;

  // Update display
  document.getElementById('time-left').textContent = timeRemaining;
  document.getElementById('timer-bar').style.transform = 'scaleX(1)';
  document.getElementById('timer').classList.remove('low');

  // Clear any existing timer
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  // Start countdown
  timerInterval = setInterval(() => {
    timeRemaining--;
    document.getElementById('time-left').textContent = timeRemaining;

    // Update progress bar
    const progress = timeRemaining / totalTime;
    document.getElementById('timer-bar').style.transform = `scaleX(${progress})`;

    // Add "low" class when under 5 seconds
    if (timeRemaining <= 5) {
      document.getElementById('timer').classList.add('low');
    }

    // Time's up!
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      timeUp();
    }
  }, 1000);
}

// Stop the timer
function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// When time runs out
function timeUp() {
  if (currentCell && currentAnswers.length > 0) {
    updateScore(-currentPoints);
    showModal(false, currentPoints, currentAnswers);

    currentCell.classList.add('answered');
    answerInput.value = "";
    currentCell = null;
    currentAnswers = [];
    currentPoints = 0;
  }
}

// Function to check answer
function checkAnswer() {
  if (!currentCell || currentAnswers.length === 0) {
    return; // No cell selected
  }

  // Stop the timer
  stopTimer();

  const userAnswer = answerInput.value.trim().toLowerCase();

  if (userAnswer === "") {
    showModal(false, 0, ['Please enter an answer!']);
    return;
  }

  // Check if the user's answer matches any of the valid ones
  if (currentAnswers.includes(userAnswer)) {
    updateScore(currentPoints);
    showModal(true, currentPoints);
  } else {
    updateScore(-currentPoints);
    showModal(false, currentPoints, currentAnswers);
  }

  currentCell.classList.add('answered');

  // Clear input and reset current cell
  answerInput.value = "";
  currentCell = null;
  currentAnswers = [];
  currentPoints = 0;
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

// Submit button click event
submitButton.addEventListener('click', checkAnswer);

// Enter key press event
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

