// global variables to store current prompt and its translation
let currentPrompt = "";
let currentTranslations = [];
let incorrectState = false;
let vocab = null

// test parameters
let test = []
let testType = "multipleChoice"
let testLanguage = "polishToEnglish"
let secondsPerWord = 0

// Check the answer submitted
function checkAnswer() {
    const userAnswer = format(document.getElementById('answer').value);
    
    correct = false
    if (Array.isArray(currentTranslations)) {
        if (currentTranslations.map(format).includes(userAnswer)) {
            correct = true;
        }
    }
    else {
        if (format(currentTranslations) == userAnswer) {
            correct = true;
        }
    }

    if (correct) {
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

    const progressBar = document.getElementById("testProgress");
    progressBar.value = progressBar.value + 1;
}

// Format text for a fair comparison
function format(item) {
    item = item.trim().toLowerCase()
    item = item.replace(/[.',\/#!$%\^&\*;:{}=\-_`~()]/g,"")
    item = item.replace(/\s+/g, " ")
    item = item.normalize("NFD").replace(/\p{Diacritic}/gu, "")
    return item
}

// Returns a list of possible answers as a comma separated string
function joinAnswers(answers) {
    if (!Array.isArray(answers)) {
        return answers;
    }
    return answers.join(', ')
}

// Get JSON data from vocab file
async function getVocab() {
    const response = await fetch('polish.json');
    return await response.json();
}

function selectAllVocabSets() {
    checkboxes = document.getElementsByName("vocabSets");
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
    });
}

function getVocabSets() {
    return Array.from(document.querySelectorAll("input[name='vocabSets']:checked")).map((elem) => elem.value)
}

function getTestSize() {
    return document.querySelector('input[name="testSize"]:checked').value;
}

function getTestType() {
    return document.querySelector('input[name="testType"]:checked').value;
}

function getTestLanguage() {
    return document.querySelector('input[name="testLanguage"]:checked').value;
}

function getSecondsPerWord() {
    return document.querySelector('input[name="secondsPerWord"]:checked').value;
}

// set all global test parameters
function generateTest() {

    // get test parameters
    vocabSets = getVocabSets();
    testSize = getTestSize();
    testType = getTestType();
    testLanguage = getTestLanguage();
    secondsPerWord = getSecondsPerWord();

    // check for empty vocab sets
    if (vocabSets.length == 0) {
        selectAllVocabSets();
        vocabSets = getVocabSets();
    }

    // build, shuffle and trim test vocab
    test = []
    while (test.length < testSize) {
        vocabSets.forEach(set => {
            if (vocab.hasOwnProperty(set)) {
                test.push(...vocab[set]);
            }
        })
    }
    test = test.sort(() => Math.random() - 0.5)
    test = test.slice(0, testSize);

    // reset test progress bar
    const progressBar = document.getElementById("testProgress");
    progressBar.setAttribute("max", testSize);
    progressBar.setAttribute("value", 0);
}

function populatePrompt() {

    // check if test is completed
    if (test.length == 0) {
        generateTest();
    }

    // grab a new question and populate
    question = test.pop();
    if (testLanguage == "polishToEnglish") {
        currentPrompt = question.polish;
        currentTranslations = question.english;
    }
    else {
        currentPrompt = question.english;
        currentTranslations = question.polish;
    }

    // handle prompts that are lists
    if (Array.isArray(currentPrompt)) {
        currentPrompt = joinAnswers(currentPrompt);
    }

    document.getElementById('prompt').textContent = currentPrompt;
}


// when an answer is submitted, check, or dismiss incorrect state
function handleKeyDown(event) {

    if (event.key != "Enter") {
        return;
    }

    if (!incorrectState) {
        checkAnswer();
        return;
    }

    incorrectState = false;
    document.getElementById("answer").classList.remove('incorrect');
    document.getElementById("expectedAnswer").classList.add("hidden");
    document.getElementById("incorrectMessage").classList.add("hidden");
    document.getElementById('answer').value = '';
    populatePrompt();
}

// when the test form changes, update the global test parameters and begin
function handleTestFormUpdate(event) {
    generateTest();
    populatePrompt();
}

window.onload = async function() {
    vocab = await getVocab();
    generateTest();
    populatePrompt();

    document.getElementById('answer').addEventListener('keydown', handleKeyDown);
    document.getElementById('testForm').addEventListener('change', handleTestFormUpdate);
};