// leaderboard.js
const STORAGE_KEY = 'leaderboard'; // array of { name, score, ts }

// ---- Load & Save ----
function loadScores() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveScores(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// ---- Add Score ----
window.saveScore = function(name, score) {
  const list = loadScores();
  list.push({
    name: (name || 'Player').trim() || 'Player',
    score: Number(score) || 0,
    ts: Date.now()
  });
  saveScores(list);
};

// ---- Render Leaderboard ----
function renderLeaderboard() {
  const tbody = document.getElementById('leaderboard-body');
  const empty = document.getElementById('no-scores');
  const list = loadScores()
    .sort((a, b) => b.score - a.score || a.ts - b.ts)
    .slice(0, 10);

  tbody.innerHTML = '';

  if (list.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  list.forEach((row, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="rank">${i + 1}</td>
      <td class="player">${escapeHtml(row.name)}</td>
      <td class="score">$${row.score.toLocaleString()}</td>
      <td class="date">${new Date(row.ts).toLocaleDateString()}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ---- Sanitize text ----
function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// ---- Demo Button ----
document.getElementById('add-demo').addEventListener('click', () => {
  const name = prompt('Enter player name:') || 'Anonymous';
  const score = Math.floor(Math.random() * 10000) + 1000;
  saveScore(name, score);
  renderLeaderboard();
});

document.addEventListener('DOMContentLoaded', renderLeaderboard);
