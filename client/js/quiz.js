// js/quiz.js

const QUIZ_DURATION_SECONDS = 15 * 60; // 15 minutes for a 10-question quiz

let currentQuiz = null; // { quizId, questions }
let currentAnswers = {}; // { questionId: selectedOption }
let currentQuestionIndex = 0;
let timerInterval = null;
let secondsRemaining = QUIZ_DURATION_SECONDS;

function showScreen(id) {
  ["level-select-screen", "quiz-runner-screen", "results-screen"].forEach((s) => {
    document.getElementById(s).classList.toggle("hidden", s !== id);
  });
}

// ---- Level selection ----
async function checkLevel2Availability() {
  try {
    await apiRequest("/quiz/level2", {}, true);
    // If this succeeds, Level 2 is unlocked — nothing to change visually
    // yet (we don't want to start it just by checking).
  } catch (err) {
    document.getElementById("level2-locked-note").classList.remove("hidden");
    document.getElementById("start-level2-btn").disabled = true;
  }
}

async function startQuiz(level) {
  try {
    const res = await apiRequest(`/quiz/${level}`, {}, true);
    currentQuiz = { quizId: res.data.quizId, questions: res.data.questions };
    currentAnswers = {};
    currentQuestionIndex = 0;
    secondsRemaining = QUIZ_DURATION_SECONDS;

    showScreen("quiz-runner-screen");
    renderQuestion();
    startTimer();
  } catch (err) {
    showToast("Could not start quiz: " + err.message, "error");
  }
}

// ---- Timer ----
function startTimer() {
  clearInterval(timerInterval);
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    secondsRemaining--;
    updateTimerDisplay();
    if (secondsRemaining <= 0) {
      clearInterval(timerInterval);
      submitQuiz();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  document.getElementById("quiz-timer").textContent =
    `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// ---- Question rendering & navigation ----
function renderQuestion() {
  const q = currentQuiz.questions[currentQuestionIndex];
  const total = currentQuiz.questions.length;

  document.getElementById("question-counter").textContent =
    `Question ${currentQuestionIndex + 1} of ${total}`;
  document.getElementById("quiz-question-text").textContent = q.question_text;

  const options = [
    { key: "A", text: q.option_a },
    { key: "B", text: q.option_b },
    { key: "C", text: q.option_c },
    { key: "D", text: q.option_d },
  ];

  const selected = currentAnswers[q.id];
  document.getElementById("quiz-options").innerHTML = options
    .map(
      (opt) => `
      <button class="quiz-option ${selected === opt.key ? "selected" : ""}" data-option="${opt.key}">
        ${opt.text}
      </button>`
    )
    .join("");

  document.querySelectorAll(".quiz-option").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentAnswers[q.id] = btn.dataset.option;
      renderQuestion(); // re-render to show selection + update jump grid
    });
  });

  renderQuestionJump();

  document.getElementById("prev-btn").disabled = currentQuestionIndex === 0;
  const isLast = currentQuestionIndex === total - 1;
  document.getElementById("next-btn").classList.toggle("hidden", isLast);
  document.getElementById("submit-quiz-btn").classList.toggle("hidden", !isLast);
}

function renderQuestionJump() {
  const jumpEl = document.getElementById("question-jump");
  jumpEl.innerHTML = currentQuiz.questions
    .map((q, idx) => {
      const isAnswered = currentAnswers[q.id] !== undefined;
      const isCurrent = idx === currentQuestionIndex;
      return `<button class="${isAnswered ? "answered" : ""} ${isCurrent ? "current" : ""}" data-idx="${idx}">${idx + 1}</button>`;
    })
    .join("");

  jumpEl.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentQuestionIndex = parseInt(btn.dataset.idx, 10);
      renderQuestion();
    });
  });
}

// ---- Submission ----
async function submitQuiz() {
  clearInterval(timerInterval);

  const answers = currentQuiz.questions.map((q) => ({
    questionId: q.id,
    selectedOption: currentAnswers[q.id] || null,
  }));

  try {
    const res = await apiRequest(
      "/quiz/submit",
      { method: "POST", body: { quizId: currentQuiz.quizId, answers } },
      true
    );
    renderResults(res.data);
  } catch (err) {
    showToast("Could not submit quiz: " + err.message, "error");
  }
}

function renderResults(data) {
  showScreen("results-screen");

  document.getElementById("results-score").textContent = `${data.score} / ${data.totalQuestions}`;
  document.getElementById("results-percentage").textContent = `${data.percentage}%`;

  const badge = document.getElementById("results-skill-badge");
  const cssClass = data.skillLevel.replace(/\s+/g, "-");
  badge.className = `skill-badge ${cssClass}`;
  badge.textContent = data.skillLevel;

  document.getElementById("topic-breakdown-list").innerHTML = data.topicPerformance
    .map(
      (t) => `
      <div class="topic-row">
        <span>${t.topic}</span>
        <span>${t.correct} / ${t.total} correct</span>
      </div>`
    )
    .join("");

  document.getElementById("review-list").innerHTML = data.breakdown
    .map(
      (b) => `
      <div class="card review-item ${b.isCorrect ? "correct" : "incorrect"}">
        <strong>${b.topic}</strong> —
        ${b.isCorrect ? "Correct" : `Incorrect (your answer: ${b.selectedOption || "skipped"}, correct: ${b.correctOption})`}
      </div>`
    )
    .join("");
}

// ---- Wire up ----
document.addEventListener("DOMContentLoaded", () => {
  renderNavbar("quiz");
  checkLevel2Availability();

  document.getElementById("start-level1-btn").addEventListener("click", () => startQuiz("level1"));
  document.getElementById("start-level2-btn").addEventListener("click", () => startQuiz("level2"));

  document.getElementById("prev-btn").addEventListener("click", () => {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      renderQuestion();
    }
  });
  document.getElementById("next-btn").addEventListener("click", () => {
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      currentQuestionIndex++;
      renderQuestion();
    }
  });
  document.getElementById("submit-quiz-btn").addEventListener("click", () => {
    if (confirm("Submit the assessment? You won't be able to change your answers after this.")) {
      submitQuiz();
    }
  });
  document.getElementById("back-to-levels-btn").addEventListener("click", () => {
    showScreen("level-select-screen");
    checkLevel2Availability();
  });
});
