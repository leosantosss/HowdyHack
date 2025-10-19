// timer.js
let timerInterval = null;
let timeRemaining = 0;
let timerLength = 15; // default

function readTimerSeconds() {
  // Prefer the shared store if present
  if (typeof window.getSettings === 'function') {
    const s = window.getSettings() || {};
    return Number(s.timerSeconds) || 15;
  }
  // Fallbacks: try the keys directly
  try {
    const rawJ = localStorage.getItem('jeopardy_settings');
    if (rawJ) {
      const s = JSON.parse(rawJ);
      return Number(s.timerSeconds) || 15;
    }
  } catch {}
  try {
    const raw = localStorage.getItem('settings');
    if (raw) {
      const s = JSON.parse(raw);
      return Number(s.timerSeconds) || 15;
    }
  } catch {}
  return 15;
}

function loadTimerSettings() {
  timerLength = readTimerSeconds();
}

function startTimer(onTimeout) {
  loadTimerSettings();

  clearInterval(timerInterval);
  timeRemaining = timerLength;

  const timerBar = document.getElementById("timer-bar");
  const timeLeftText = document.getElementById("time-left");
  const timer = document.getElementById("timer");

  if (!timerBar || !timeLeftText || !timer) return;

  // reset visuals
  timerBar.style.transition = "none";
  timerBar.style.width = "100%";
  timerBar.style.backgroundColor = "linear-gradient(90deg, #caa052, #f0c978)"; // will be overridden below
  timer.classList.remove('low'); // if you added .low styles

  // fallback: set explicit color (since linear-gradient via style prop is tricky)
  timerBar.style.background = "linear-gradient(90deg, #e5b75d, #caa052)";
  timeLeftText.textContent = timeRemaining;

  // animate to zero over N seconds
  // small timeout to allow the browser to apply the "100%" first
  setTimeout(() => {
    timerBar.style.transition = `width ${timerLength}s linear`;
    timerBar.style.width = "0%";
  }, 10);

  // tick text every second
  timerInterval = setInterval(() => {
    timeRemaining--;
    timeLeftText.textContent = Math.max(0, timeRemaining);

    if (timeRemaining <= 5) {
      timerBar.style.background = "#e74c3c";
      timer.classList.add('low');
    }

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      timerBar.style.width = "0%";
      if (typeof onTimeout === 'function') onTimeout();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  const timerBar = document.getElementById("timer-bar");
  const timeLeftText = document.getElementById("time-left");
  if (timerBar) {
    timerBar.style.transition = "none";
    timerBar.style.width = "100%";
    timerBar.style.background = "linear-gradient(90deg, #e5b75d, #caa052)";
  }
  if (timeLeftText) timeLeftText.textContent = readTimerSeconds();
  const timer = document.getElementById("timer");
  timer?.classList.remove('low');
}

/* === Public API used by script.js === */
window.beginQuestionTimer = function(pointPenalty = 0) {
  startTimer(() => {
    // time’s up callback
    if (typeof window.adjustScore === 'function') {
      window.adjustScore(-Math.abs(pointPenalty));
    }
    alert("⏰ Time’s up!");
    stopTimer(); // reset UI to full with saved seconds
  });
};

window.cancelQuestionTimer = function() {
  stopTimer();
};

// Initialize UI on load so it shows the saved seconds before any question
document.addEventListener('DOMContentLoaded', () => {
  stopTimer();
});