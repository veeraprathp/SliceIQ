// Quiz Ninja - Claude API Integration
// Set your Groq API key here (starts with "gsk_") or Anthropic key (starts with "sk-ant-")
// Get a free Groq key at: https://console.groq.com
let API_KEY = "YOUR_API_KEY_HERE";
let quizState = {
  questions: [],
  currentIndex: 0,
  topic: "",
  score: 0,
  lives: 10,  // Increased from 3 to 10
  answersSpawned: false,
  answers: []  // Track all answers (correct/wrong)
};

// German Quiz - Level 1 (EASY) - Basic Geography & History
const MOCK_GERMAN_LEVEL1 = [
  {"q": "Was ist die Hauptstadt von Deutschland?", "options": ["Berlin", "München", "Hamburg", "Köln"], "answer": "Berlin"},
  {"q": "Welcher Fluss fließt durch Berlin?", "options": ["Donau", "Spree", "Rhein", "Main"], "answer": "Spree"},
  {"q": "In welchem Jahr fiel die Berliner Mauer?", "options": ["1987", "1989", "1991", "1985"], "answer": "1989"},
  {"q": "Wer war der erste Bundeskanzler der BRD?", "options": ["Willy Brandt", "Konrad Adenauer", "Helmut Kohl", "Angela Merkel"], "answer": "Konrad Adenauer"},
  {"q": "Wie viele Bundesländer hat Deutschland?", "options": ["14", "15", "16", "17"], "answer": "16"},
  {"q": "Was ist die längste Fluss Deutschlands?", "options": ["Main", "Donau", "Rhein", "Elbe"], "answer": "Rhein"},
  {"q": "In welcher Stadt findest du das Schloss Neuschwanstein?", "options": ["Berlin", "Hohenschwangau", "München", "Bamberg"], "answer": "Hohenschwangau"},
  {"q": "Welche Farben hat die deutsche Flagge?", "options": ["Rot-Weiß-Gold", "Schwarz-Rot-Gold", "Blau-Weiß-Rot", "Rot-Grün-Weiß"], "answer": "Schwarz-Rot-Gold"},
  {"q": "Welcher Berg ist der höchste in Deutschland?", "options": ["Feldberg", "Zugspitze", "Brocken", "Arber"], "answer": "Zugspitze"},
  {"q": "In welcher Stadt findet man das Oktoberfest?", "options": ["Berlin", "München", "Köln", "Stuttgart"], "answer": "München"},
  {"q": "Welcher berühmte deutsche Komponist war taub?", "options": ["Mozart", "Ludwig van Beethoven", "Johann Sebastian Bach", "Felix Mendelssohn"], "answer": "Ludwig van Beethoven"},
  {"q": "In welchem Jahr wurde die Deutsche Demokratische Republik gegründet?", "options": ["1949", "1950", "1951", "1952"], "answer": "1949"},
  {"q": "Wer schrieb das Gedicht 'Der Erlkönig'?", "options": ["Goethe", "Schiller", "Heine", "Rilke"], "answer": "Goethe"},
  {"q": "Welcher See ist der größte in Deutschland?", "options": ["Neusiedler See", "Bodensee", "Chiemsee", "Müggelsee"], "answer": "Bodensee"},
  {"q": "Wie heißt die Hauptstadt von Bayern?", "options": ["Nürnberg", "Augsburg", "München", "Regensburg"], "answer": "München"},
  {"q": "Wer war der erste Präsident der Bundesrepublik Deutschland?", "options": ["Theodor Heuss", "Heinrich Lübke", "Konrad Adenauer", "Willy Brandt"], "answer": "Theodor Heuss"},
  {"q": "In welcher Stadt steht das berühmte Kölner Dom?", "options": ["Düsseldorf", "Köln", "Bonn", "Aachen"], "answer": "Köln"},
  {"q": "Welche Farben hat die bayerische Flagge?", "options": ["Schwarz-Gold", "Weiß-Blau", "Rot-Weiß", "Blau-Weiß"], "answer": "Weiß-Blau"},
  {"q": "Wie viele Menschen sprechen Deutsch als Muttersprache?", "options": ["75 Millionen", "95 Millionen", "130 Millionen", "150 Millionen"], "answer": "95 Millionen"},
  {"q": "Welcher deutsche Erfinder entwickelte den Buchdruck?", "options": ["Johann Gutenberg", "Albrecht Dürer", "Martin Luther", "Andreas Schlüter"], "answer": "Johann Gutenberg"}
];

// German Quiz - Level 2 (MEDIUM) - Culture, Famous People, Literature
const MOCK_GERMAN_LEVEL2 = [
  {"q": "Welcher deutsche Philosoph schrieb 'Kritik der reinen Vernunft'?", "options": ["Immanuel Kant", "Georg Hegel", "Arthur Schopenhauer", "Friedrich Nietzsche"], "answer": "Immanuel Kant"},
  {"q": "Wer schrieb den Roman 'Die Blechtrommel'?", "options": ["Günter Grass", "Heinrich Böll", "Christa Wolf", "Uwe Johnson"], "answer": "Günter Grass"},
  {"q": "In welchem Jahr endete die Weimarer Republik?", "options": ["1932", "1933", "1934", "1935"], "answer": "1933"},
  {"q": "Welcher deutsche Komponist schrieb '9. Sinfonie'?", "options": ["Ludwig van Beethoven", "Richard Wagner", "Johannes Brahms", "Felix Mendelssohn"], "answer": "Ludwig van Beethoven"},
  {"q": "Wer war der Gründer von Bauhaus?", "options": ["Walter Gropius", "Paul Klee", "Wassily Kandinsky", "Herbert Bayer"], "answer": "Walter Gropius"},
  {"q": "Welcher deutsche Autor schrieb 'Der Zauberberg'?", "options": ["Thomas Mann", "Hermann Hesse", "Rainer Maria Rilke", "Stefan George"], "answer": "Thomas Mann"},
  {"q": "In welchem Jahr wurde die Berliner Philharmonie gegründet?", "options": ["1882", "1892", "1902", "1912"], "answer": "1882"},
  {"q": "Welcher deutsche Physiker gewann den Nobelpreis für Relativitätstheorie?", "options": ["Albert Einstein", "Max Planck", "Werner Heisenberg", "Erwin Schrödinger"], "answer": "Albert Einstein"},
  {"q": "Wer malte 'Wanderer über dem Nebelmeer'?", "options": ["Caspar David Friedrich", "Philipp Otto Runge", "Franz Marc", "Ernst Ludwig Kirchner"], "answer": "Caspar David Friedrich"},
  {"q": "In welcher Stadt findest du die Meißner Porzellanmanufaktur?", "options": ["Meißen", "Dresden", "Leipzig", "Chemnitz"], "answer": "Meißen"},
  {"q": "Welcher deutsche Komponist schrieb 'Tristan und Isolde'?", "options": ["Richard Wagner", "Giuseppe Verdi", "Georges Bizet", "Jacques Offenbach"], "answer": "Richard Wagner"},
  {"q": "Wer war der Schöpfer von Dürer's 'Selbstporträt'?", "options": ["Albrecht Dürer", "Lucas Cranach", "Hans Burgkmair", "Matthias Grünewald"], "answer": "Albrecht Dürer"},
  {"q": "In welchem Jahr starb Goethe?", "options": ["1832", "1833", "1834", "1835"], "answer": "1832"},
  {"q": "Welcher deutsche Schriftsteller schrieb 'Faust'?", "options": ["Johann Wolfgang von Goethe", "Friedrich Schiller", "Heinrich Heine", "Johann Christoph Friedrich"], "answer": "Johann Wolfgang von Goethe"},
  {"q": "Wer gründete das Sinfonieorchester Berlin?", "options": ["Arthur Nikisch", "Hans von Bülow", "Wilhelm Furtwängler", "Sergei Koussevitzky"], "answer": "Arthur Nikisch"},
  {"q": "In welchem Jahr wurde die Reformation eingeleitet?", "options": ["1515", "1517", "1519", "1521"], "answer": "1517"},
  {"q": "Welcher deutsche Maler schuf das Gemälde 'Nightlife'?", "options": ["Otto Dix", "George Grosz", "Max Beckmann", "Oskar Kokoschka"], "answer": "Otto Dix"},
  {"q": "Wer schrieb das Gedicht 'Das Lied der Glocke'?", "options": ["Friedrich Schiller", "Johann Wolfgang von Goethe", "Heinrich Heine", "Joseph von Eichendorff"], "answer": "Friedrich Schiller"},
  {"q": "In welchem Jahr wurde das Neue Palais in Potsdam erbaut?", "options": ["1763", "1769", "1775", "1781"], "answer": "1769"},
  {"q": "Welcher deutsche Politiker war bekannt für die 'Realpolitik'?", "options": ["Otto von Bismarck", "Wilhelm I", "Friedrich Wilhelm III", "Leopold von Ranke"], "answer": "Otto von Bismarck"}
];

// German Quiz - Level 3 (HARD) - Advanced & Challenging
const MOCK_GERMAN_LEVEL3 = [
  {"q": "Welcher Philosoph prägte den Begriff 'Übermensch'?", "options": ["Friedrich Nietzsche", "Arthur Schopenhauer", "Georg Hegel", "Karl Jaspers"], "answer": "Friedrich Nietzsche"},
  {"q": "In welchem Jahr fand der Wiener Kongress statt?", "options": ["1814-1815", "1815-1816", "1816-1817", "1813-1814"], "answer": "1814-1815"},
  {"q": "Welcher deutsche Chemiker entdeckte das Benzol?", "options": ["Friedrich August Kekulé", "Justus von Liebig", "August Wilhelm von Hofmann", "Emil Fischer"], "answer": "Friedrich August Kekulé"},
  {"q": "Wer war der erste deutsche Nobelpreisträger?", "options": ["Wilhelm Röntgen", "Otto Warburg", "Max Planck", "Paul Ehrlich"], "answer": "Wilhelm Röntgen"},
  {"q": "In welchem Jahr wurde die Paulskirche gebaut?", "options": ["1833", "1836", "1839", "1842"], "answer": "1833"},
  {"q": "Welcher deutsche Maler war Mitbegründer des Expressionismus?", "options": ["Ernst Ludwig Kirchner", "Franz Marc", "Otto Dix", "Egon Schiele"], "answer": "Ernst Ludwig Kirchner"},
  {"q": "Welcher Reformator prägte die protestantische Bewegung?", "options": ["Martin Luther", "Huldrych Zwingli", "Jean Calvin", "John Knox"], "answer": "Martin Luther"},
  {"q": "Welcher deutsche Psychologe entwickelte die Gestaltpsychologie?", "options": ["Max Wertheimer", "Wolfgang Köhler", "Kurt Koffka", "Kurt Lewin"], "answer": "Max Wertheimer"},
  {"q": "Welcher Schriftsteller schrieb 'Buddenbrooks'?", "options": ["Thomas Mann", "Alfred Döblin", "Hermann Broch", "Robert Musil"], "answer": "Thomas Mann"},
  {"q": "Welcher deutsche Mathematiker bewies den Fundamentalsatz der Algebra?", "options": ["Carl Friedrich Gauß", "Bernhard Riemann", "Leopold Kronecker", "David Hilbert"], "answer": "Carl Friedrich Gauß"},
  {"q": "In welchem Jahr wurde die Frankfurter Schule gegründet?", "options": ["1923", "1924", "1925", "1926"], "answer": "1924"},
  {"q": "Welcher deutsche Dichter schrieb 'Die Leiden des jungen Werthers'?", "options": ["Johann Wolfgang von Goethe", "Friedrich Schiller", "Johann Gottfried Herder", "Karl Philipp Moritz"], "answer": "Johann Wolfgang von Goethe"},
  {"q": "Wer war der Gründer der modernen Soziologie in Deutschland?", "options": ["Max Weber", "Georg Simmel", "Ferdinand Tönnies", "Werner Sombart"], "answer": "Max Weber"},
  {"q": "In welchem Jahr fand die Märzrevolution statt?", "options": ["1848", "1849", "1850", "1851"], "answer": "1848"},
  {"q": "Welcher deutsche Komponist schrieb 'Licht', eine Opernzyklus?", "options": ["Karlheinz Stockhausen", "Pierre Schaeffer", "Olivier Messiaen", "Luciano Berio"], "answer": "Karlheinz Stockhausen"},
  {"q": "Welcher Architekt entwarf die Neuschwanstein Schlossanlage?", "options": ["Eduard Riedel", "Georg Dollmann", "Eugen Drollinger", "Friedrich Intze"], "answer": "Eduard Riedel"},
  {"q": "In welchem Jahr wurde die Allgemeine Relativitätstheorie veröffentlicht?", "options": ["1905", "1911", "1915", "1919"], "answer": "1915"},
  {"q": "Welcher deutsche Kunsthistoriker prägte den Begriff 'Kunstgeschichte'?", "options": ["Johann Joachim Winckelmann", "Heinrich Wölfflin", "Alois Riegl", "Wilhelm Worringer"], "answer": "Johann Joachim Winckelmann"},
  {"q": "Welcher Schriftsteller schrieb 'Der Mann ohne Eigenschaften'?", "options": ["Robert Musil", "Hermann Broch", "Elias Canetti", "Alfred Döblin"], "answer": "Robert Musil"},
  {"q": "In welchem Jahr erfolgte die Reichsgründung unter Bismarck?", "options": ["1870", "1871", "1872", "1873"], "answer": "1871"}
];

async function generateQuiz(topic) {
  const loadingText = document.getElementById("loading-text");
  loadingText.style.display = "block";

  try {
    let questions;
    let level = "LEVEL 1";

    // Use hardcoded German questions for demo with difficulty levels
    const topicLower = topic.toLowerCase();
    if (topicLower.includes("german") || topicLower.includes("deutschland")) {
      if (topicLower.includes("level 3") || topicLower.includes("hard") || topicLower.includes("schwer")) {
        questions = MOCK_GERMAN_LEVEL3;
        level = "LEVEL 3 (HARD)";
        loadingText.textContent = "Loading German Level 3 Quiz...";
      } else if (topicLower.includes("level 2") || topicLower.includes("medium") || topicLower.includes("mittel")) {
        questions = MOCK_GERMAN_LEVEL2;
        level = "LEVEL 2 (MEDIUM)";
        loadingText.textContent = "Loading German Level 2 Quiz...";
      } else {
        questions = MOCK_GERMAN_LEVEL1;
        level = "LEVEL 1 (EASY)";
        loadingText.textContent = "Loading German Level 1 Quiz...";
      }
    } else {
      // Try API call for other topics
      const response = await fetch("http://localhost:8001/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: API_KEY, topic: topic })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      questions = data.questions;
    }

    quizState.questions = questions;
    quizState.currentIndex = 0;
    quizState.topic = topic;
    quizState.level = level;
    quizState.score = 0;
    quizState.lives = 10;
    quizState.answersSpawned = false;
    quizState.answers = [];

    loadingText.style.display = "none";
    document.getElementById("topic-screen").style.display = "none";
    document.getElementById("start-screen").style.display = "block";
    displayQuestion();

    return questions;
  } catch (error) {
    console.error("Error generating quiz:", error);
    loadingText.style.display = "none";
    alert("Failed to generate quiz. Try 'German' or 'Deutschland' for demo questions!");
  }
}

function displayQuestion() {
  if (quizState.currentIndex >= quizState.questions.length) {
    endQuiz();
    return;
  }
  const q = quizState.questions[quizState.currentIndex];
  const questionText = `[${quizState.level}] Q${quizState.currentIndex + 1}/20: ${q.q}`;

  // Update both displays (in case both exist)
  const displayEl = document.getElementById("question-display");
  if (displayEl) displayEl.textContent = questionText;

  const gameDisplayEl = document.getElementById("game-question-display");
  if (gameDisplayEl) gameDisplayEl.textContent = questionText;

  // Force spawn cards immediately for next question
  if (gameState && gameState.lastSpawnTime) {
    gameState.lastSpawnTime = 0; // Reset to force immediate spawn
  }
}

function getCurrentQuestion() {
  return quizState.questions[quizState.currentIndex];
}

function checkAnswer(selectedOption) {
  const q = getCurrentQuestion();
  const isCorrect = selectedOption.trim() === q.answer.trim();

  // Track answer
  quizState.answers.push({
    question: quizState.currentIndex + 1,
    isCorrect: isCorrect
  });

  if (isCorrect) {
    quizState.score += 100;
    showFeedback('✓', true);
    return true;
  } else {
    quizState.lives -= 1;
    showFeedback('✗', false);
    return false;
  }
}

function showFeedback(mark, isCorrect) {
  // Show big animated checkmark/cross
  const feedbackEl = document.getElementById('feedback-container');
  feedbackEl.textContent = mark;
  feedbackEl.style.color = isCorrect ? '#00ff00' : '#ff0000';
  feedbackEl.style.display = 'block';

  setTimeout(() => {
    feedbackEl.style.display = 'none';
  }, 600);

  // Add answer mark to history
  const marksEl = document.getElementById('answer-marks');
  const mark_el = document.createElement('div');
  mark_el.className = `answer-mark ${isCorrect ? 'correct' : 'wrong'}`;
  mark_el.textContent = isCorrect ? '✓' : '✗';
  marksEl.appendChild(mark_el);

  // Keep only last 10 marks visible
  const marks = marksEl.querySelectorAll('.answer-mark');
  if (marks.length > 10) {
    marks[0].remove();
  }
}

function nextQuestion() {
  quizState.currentIndex++;
  quizState.answersSpawned = false; // Reset for new question

  // Clear all remaining cards from previous question
  if (gameState && gameState.fruits) {
    gameState.fruits.forEach(fruit => {
      if (fruit.type === 'answer') {
        scene.remove(fruit.mesh);
      }
    });
    gameState.fruits = gameState.fruits.filter(fruit => fruit.type !== 'answer');
  }

  if (quizState.currentIndex < quizState.questions.length) {
    displayQuestion();
  } else {
    endQuiz();
  }
}

function endQuiz() {
  // Stop the game loop
  if (gameState) {
    gameState.isGameActive = false;
  }

  setTimeout(() => {
    // Let endGame() from game.js handle the display
    if (gameState && gameState.isGameActive === false) {
      endGame();
    }
  }, 500);
}

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("generate-btn").addEventListener("click", function() {
    const topic = document.getElementById("topic-input").value.trim();
    if (topic) {
      generateQuiz(topic);
    } else {
      alert("Please enter a topic!");
    }
  });

  document.getElementById("topic-input").addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
      const topic = this.value.trim();
      if (topic) generateQuiz(topic);
    }
  });

  document.getElementById("restart-button").addEventListener("click", function() {
    location.reload();
  });
});
