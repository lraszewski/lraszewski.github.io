// global variables to store current prompt and its translation
let currentPrompt = "";
let currentTranslations = [];
let incorrectState = false;
let vocab = null
let test = []

// Get JSON data from vocab file
async function getVocab() {
    const response = await fetch('polish.json');
    const vocab = await response.json();
    return vocab;
}

// Populate the prompt randomly with polish
async function populatePrompt() {
    const randomIndex = Math.floor(Math.random() * test.length);
    currentPrompt = test[randomIndex].polish;
    currentTranslations = test[randomIndex].english;
    document.getElementById('prompt').textContent = currentPrompt;

    // remove item from list.
    test.splice(randomIndex, 1);
    if (test.length == 0) {
        // regenerate test
        selectedSets = getSelectedSets();
        test = generateTest(selectedSets);
    }
}

// Check the answer submitted
function checkAnswer() {
    const userAnswer = format(document.getElementById('answer').value);
    
    if (currentTranslations.map(format).includes(userAnswer)) {
        document.getElementById("answer").classList.add('correct');
        setTimeout(() => {
            document.getElementById("answer").classList.remove('correct');
            populatePrompt(); // Load a new prompt
            document.getElementById('answer').value = '';
        }, 500);
    } else {
        incorrectState = true
        document.getElementById("answer").classList.add('incorrect');
        document.getElementById("expectedAnswer").classList.remove("hidden");
        document.getElementById("expectedAnswer").innerHTML = joinAnswers(currentTranslations);
        document.getElementById("incorrectMessage").classList.remove("hidden");
    }
}

// Format text for a fair comparison
function format(item) {
    item = item.trim().toLowerCase()
    item = item.replace(/[.',\/#!$%\^&\*;:{}=\-_`~()]/g,"")
    item = item.replace(/\s+/g, " ")
    return item
}

// Listen for when the enter key is pressed
function handleKeyDown(event) {
    if (event.key === "Enter" && !incorrectState) {
        checkAnswer();
    }
    else if (event.key === "Enter") {
        incorrectState = false;
        document.getElementById("answer").classList.remove('incorrect');
        document.getElementById("expectedAnswer").classList.add("hidden");
        document.getElementById("incorrectMessage").classList.add("hidden");
        document.getElementById('answer').value = '';
        populatePrompt();
    }
}

// Returns a list of possible answers as a comma separated string
function joinAnswers(answers) {
    if (answers.length === 0) {
        return '';
    } else if (answers.length === 1) {
        return answers[0];
    } else if (answers.length === 2) {
        return answers.join(' or ');
    } else {
        const lastWord = words.pop();
        return answers.join(', ') + ', or ' + lastWord;
    }
}

// Returns a list of the selected vocab sets.
function getSelectedSets() {
    const form = document.getElementById('setsForm');
    const checkboxes = form.querySelectorAll('input[type="checkbox"]');
    const selectedSets = [];
    checkboxes.forEach(function(checkbox) {
        if (checkbox.checked) {
            selectedSets.push(checkbox.value);
        }
    });
    return selectedSets;
}

function selectAllSets() {
    const form = document.getElementById('setsForm');
    const checkboxes = form.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(function(checkbox) {
        checkbox.checked = true;
    });
}

function generateTest(selectedSets) {
    test = []
    selectedSets.forEach(set => {
        if (vocab.hasOwnProperty(set)) {
            test.push(...vocab[set]);
        }
    })
    return test
}

function handleSetsFormUpdate(event) {
    selectedSets = getSelectedSets();
    if (selectedSets.length == 0) {
        selectAllSets();
        selectedSets = getSelectedSets();
    }
    test = generateTest(selectedSets);
    populatePrompt();
}

window.onload = async function() {
    vocab = await getVocab();
    selectedSets = getSelectedSets();
    test = generateTest(selectedSets);
    populatePrompt();
    document.getElementById('answer').addEventListener('keydown', handleKeyDown);
    document.getElementById('setsForm').addEventListener('change', handleSetsFormUpdate);
};