// Firebase Configuration (Compatibility SDK - matches game script)
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

// Render Leaderboard from Firebase
async function renderLeaderboard() {
  const tbody = document.getElementById('leaderboard-body');
  const empty = document.getElementById('no-scores');

  tbody.innerHTML = '';

  try {
    const querySnapshot = await db.collection('leaderboard')
      .orderBy('score', 'desc')
      .limit(10)
      .get();

    if (querySnapshot.empty) {
      empty.style.display = 'block';
      return;
    }

    empty.style.display = 'none';
    let rank = 1;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const tr = document.createElement('tr');
      
      const date = data.timestamp ? data.timestamp.toDate() : new Date();
      
      tr.innerHTML = `
        <td class="rank">${rank}</td>
        <td class="player">${escapeHtml(data.name)}</td>
        <td class="score">$${data.score.toLocaleString()}</td>
        <td class="date">${date.toLocaleDateString()}</td>
      `;
      tbody.appendChild(tr);
      rank++;
    });
  } catch (error) {
    console.error("Error loading leaderboard:", error);
    empty.style.display = 'block';
    empty.textContent = 'Error loading leaderboard. Please try again.';
  }
}

// Sanitize text to prevent XSS
function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// Load leaderboard when page loads
document.addEventListener('DOMContentLoaded', renderLeaderboard);