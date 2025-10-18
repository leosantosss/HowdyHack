// Track the currently selected cell
let currentCell = null;
let currentAnswer = "";

// Get input and button elements
const answerInput = document.getElementById('answer-input');
const submitButton = document.getElementById('submit-answer');

// Add click event to all cells
document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', function() {
        // Only flip if not already flipped
        if (!this.classList.contains('flipped')) {
            // If there's a previous cell that wasn't answered, flip it back
            if (currentCell && currentCell !== this) {
                currentCell.classList.remove('flipped');
            }
            
            this.classList.add('flipped');
            currentCell = this;
            currentAnswer = this.getAttribute('data-answer');
        }
    });
});

// Function to check answer
function checkAnswer() {
    if (!currentCell || !currentAnswer) {
        return; // No cell selected
    }
    
    const userAnswer = answerInput.value.trim();
    
    if (userAnswer === "") {
        alert("Please enter an answer!");
        return;
    }
    
    // Compare answers (case-insensitive)
    if (userAnswer.toLowerCase() === currentAnswer.toLowerCase()) {
        alert("Correct! 🎉");
        // You can add score logic here
    } else {
        alert(`Wrong! The correct answer was: ${currentAnswer}`);
    }
    
    // Clear input and reset current cell
    answerInput.value = "";
    currentCell = null;
    currentAnswer = "";
}

// Submit button click event
submitButton.addEventListener('click', checkAnswer);

// Enter key press event
answerInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        checkAnswer();
    }
});