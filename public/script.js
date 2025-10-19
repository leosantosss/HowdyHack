// Category data
const CATEGORIES = [
  {
    name: "Aggie Traditions",
    clues: [
      { points:200, q:"Thumbs-up hand sign used by Aggies.", a:["gig 'em","gig em","gig'em","gigem","gigem!","gig 'em!"] },
      { points:400, q:"The solemn campus ceremony honoring recently fallen students, held the first Tuesday of the month.", a:["silver taps","silvertaps"] },
      { points:600, q:"Annual worldwide remembrance where Aggies answer 'Here' for the fallen.", a:["aggie muster","muster"] },
      { points:800, q:"This coveted piece of jewelry symbolizes Aggie achievement and unity.", a:["aggie ring","the aggie ring","ring"] },
      { points:1000,q:"The late-night pep rally tradition held before big games.", a:["midnight yell","midnight yell practice","yell practice"] },
    ]
  },
  {
    name: "Campus Landmarks",
    clues: [
      { points:200, q:"Home stadium of Aggie Football.", a:["kyle field"] },
      { points:400, q:"Historic tree near the Academic Building known for proposals.", a:["century tree","the century tree"] },
      { points:600, q:"Memorial site dedicated to the 1999 tragedy.", a:["bonfire memorial","aggie bonfire memorial","bonfire"] },
      { points:800, q:"This building's dome is an iconic symbol of campus.", a:["academic building","the academic building"] },
      { points:1000,q:"This collie's residence is guarded by the Corps' Mascot Company.", a:["reveille's dorm","reveille dorm","reveille's residence","reveille residence","reveille"] },
    ]
  },
  {
    name: "Yells & Lingo",
    clues: [
      { points:200, q:"Official campus greeting.", a:["howdy"] },
      { points:400, q:"Exclamation traditionally reserved for juniors and seniors.", a:["whoop","whoop!"] },
      { points:600, q:"Students who lead yells at games (not cheerleaders).", a:["yell leaders","yell leader"] },
      { points:800, q:"Collective name Aggies use for the student body at games.", a:["12th man","the 12th man","twelfth man"] },
      { points:1000,q:"Group that preserves many traditions through disciplined leadership training.", a:["corps of cadets","the corps of cadets","corps"] },
    ]
  },
  {
    name: "Sports & Spirit",
    clues: [
      { points:200, q:"Conference Texas A&M currently competes in for most sports.", a:["sec","southeastern conference"] },
      { points:400, q:"The live canine mascot of Texas A&M.", a:["reveille"] },
      { points:600, q:"Mass maroon-shirt crowd initiative first launched in 1998.", a:["maroon out","maroon-out","maroonout"] },
      { points:800, q:"Nickname for the dedicated standing student section at football games.", a:["12th man","the 12th man","twelfth man"] },
      { points:1000,q:"This drum line's booming cadence fires up Kyle Field.", a:["fightin' texas aggie band","fightin texas aggie band","texas aggie band","aggie band"] },
    ]
  },
  {
    name: "History & Alumni",
    clues: [
      { points:200, q:"Year Texas A&M was founded (within 1 year).", a:["1876","1875","1877"], type:"numeric" },
      { points:400, q:"The 'A' and 'M' originally stood for this.", a:["agricultural and mechanical","agriculture and mechanical","agricultural & mechanical"] },
      { points:600, q:"This Aggie became the 41st U.S. President.", a:["george h. w. bush","george bush sr","george herbert walker bush","george hw bush"] },
      { points:800, q:"Aggie astronaut who commanded the International Space Station (last name ok).", a:["foale","mike foale","michael foale","shannon walker","walker"] },
      { points:1000,q:"Legendary football training camp story tied to Bear Bryant.", a:["junction boys","the junction boys"] },
    ]
  },
  {
    name: "College Station Life",
    clues: [
      { points:200, q:"City that, with Bryan, forms the metro area Aggies call home.", a:["college station"] },
      { points:400, q:"Major on-campus event where freshmen learn Aggie spirit before classes.", a:["fish camp","fishcamp"] },
      { points:600, q:"On-campus transportation system used by many students.", a:["aggie spirit bus","aggie spirit","bus","transit","aggie bus"] },
      { points:800, q:"The academic calendar's big rivalry week nickname (two words).", a:["beat week","beat the hell outta","beat the hell outta week"] },
      { points:1000,q:"Organization that coordinates many game-day traditions (abbr. ok).", a:["tamus","texas a&m university system","traditions council","aggie traditions council"] },
    ]
  },
];


// Track the currently selected cell
let currentCell = null;
let currentAnswers = [];

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
            
            // ✅ Support multiple comma-separated answers
            currentAnswers = this.getAttribute('data-answer')
                .split(',')
                .map(a => a.trim().toLowerCase());
        }
    });
});

// Function to check answer
function checkAnswer() {
    if (!currentCell || currentAnswers.length === 0) {
        return; // No cell selected
    }
    
    const userAnswer = answerInput.value.trim().toLowerCase();
    
    if (userAnswer === "") {
        alert("Please enter an answer!");
        return;
    }
    
    // ✅ Check if the user's answer matches any of the valid ones
    if (currentAnswers.includes(userAnswer)) {
        alert("Correct! 🎉");
        // You can add score logic here
    } else {
        alert(`Wrong! The correct answers were: ${currentAnswers.join(', ')}`);
    }
    
    // Clear input and reset current cell
    answerInput.value = "";
    currentCell = null;
    currentAnswers = [];
}

// Submit button click event
submitButton.addEventListener('click', checkAnswer);

// Enter key press event
answerInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        checkAnswer();
    }
});