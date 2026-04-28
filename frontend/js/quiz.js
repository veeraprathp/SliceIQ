// Quiz Ninja - LiteLLM Integration
let API_KEY = localStorage.getItem("sliceiq_api_key") || "";

let quizState = {
  questions: [],
  currentIndex: 0,
  topic: "",
  score: 0,
  lives: 10,
  answersSpawned: false,
  answers: []
};

// Initialize input from localStorage
window.addEventListener('load', () => {
    if (API_KEY) {
        document.getElementById("api-key-input").value = API_KEY;
    }
});

async function generateQuiz(topic) {
  const loadingText = document.getElementById("loading-text");
  const model = document.getElementById("model-select").value;
  const userApiKey = document.getElementById("api-key-input").value.trim();
  
  if (userApiKey) {
      localStorage.setItem("sliceiq_api_key", userApiKey);
      API_KEY = userApiKey;
  }

  loadingText.style.display = "block";

  try {
    let questions;
    
    // Mock for demo
    if (topic.toLowerCase().includes("german")) {
        questions = [{"q":"Capital of Germany?","options":["Berlin","Paris","London","Rome"],"answer":"Berlin"}];
    } else {
        const response = await fetch("/api/generate_quiz", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                api_key: userApiKey || API_KEY, 
                topic: topic,
                model: model 
            })
        });

        if (!response.ok) throw new Error("API Error");
        const data = await response.json();
        questions = data.questions;
    }

    if (!questions || questions.length === 0) throw new Error("No questions generated");

    quizState.questions = questions;
    quizState.currentIndex = 0;
    quizState.topic = topic;
    
    loadingText.style.display = "none";
    document.getElementById("topic-screen").style.display = "none";
    document.getElementById("start-screen").style.display = "block";
    displayQuestion();

  } catch (error) {
    console.error(error);
    alert("Generation failed: " + error.message);
    loadingText.style.display = "none";
  }
}

function displayQuestion() {
  const q = quizState.questions[quizState.currentIndex];
  document.getElementById("question-display").textContent = q.q;
  document.getElementById("game-question-display").textContent = q.q;
}

function getCurrentQuestion() {
  return quizState.questions[quizState.currentIndex];
}

function checkAnswer(selected) {
  const q = quizState.questions[quizState.currentIndex];
  const isCorrect = selected === q.answer;
  
  if (isCorrect) {
    quizState.score += 10;
  } else {
    quizState.lives--;
  }

  quizState.answers.push({ q: q.q, selected, isCorrect });
  return isCorrect;
}

function nextQuestion() {
  quizState.currentIndex++;
  quizState.answersSpawned = false;

  if (quizState.currentIndex < quizState.questions.length && quizState.lives > 0) {
    displayQuestion();
  } else {
    endGame();
  }
}

// Bind navigation buttons
document.getElementById("next-btn").addEventListener("click", () => {
    const key = document.getElementById("api-key-input").value.trim();
    if (!key && !localStorage.getItem("sliceiq_api_key")) {
        alert("Please enter an API key to continue!");
        return;
    }
    document.getElementById("setup-step-1").style.display = "none";
    document.getElementById("setup-step-2").style.display = "block";
});

document.getElementById("back-btn").addEventListener("click", () => {
    document.getElementById("setup-step-2").style.display = "none";
    document.getElementById("setup-step-1").style.display = "block";
});

// Bind generate button
document.getElementById("generate-btn").addEventListener("click", () => {
    const topic = document.getElementById("topic-input").value.trim();
    if (topic) generateQuiz(topic);
    else alert("Please enter a topic!");
});
