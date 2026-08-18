// js/aptitude.js

let questions = [];
let currentIndex = 0;
let sessionScore = 0;
let answeredCurrent = false;

async function loadCategory(category) {
  currentIndex = 0;
  sessionScore = 0;
  answeredCurrent = false;

  const area = document.getElementById("quiz-area");
  area.innerHTML = `<p class="empty-state" style="text-align:center;">Loading questions...</p>`;

  try {
    const res = await apiRequest(`/aptitude/questions?category=${category}`);
    questions = res.data.questions;
    renderQuestion();
  } catch (err) {
    area.innerHTML = `<p class="empty-state" style="text-align:center;">Failed to load questions.</p>`;
  }
}

function renderQuestion() {
  const area = document.getElementById("quiz-area");

  if (questions.length === 0) {
    area.innerHTML = `<p class="empty-state" style="text-align:center;">No questions available for this category yet.</p>`;
    return;
  }

  if (currentIndex >= questions.length) {
    area.innerHTML = `
      <div class="card score-summary">
        <p>You've completed this set!</p>
        <div class="big-score">${sessionScore} / ${questions.length}</div>
        <button class="btn btn-primary" id="retry-btn">Practice Again</button>
      </div>
    `;
    document.getElementById("retry-btn").addEventListener("click", () => {
      currentIndex = 0;
      sessionScore = 0;
      renderQuestion();
    });
    return;
  }

  const q = questions[currentIndex];
  answeredCurrent = false;

  area.innerHTML = `
    <div class="card question-card">
      <p style="color: var(--color-text-muted); font-size: 13px; margin-bottom: 8px;">
        Question ${currentIndex + 1} of ${questions.length}
      </p>
      <p class="question-text">${q.question_text}</p>
      <button class="option-btn" data-option="A">${q.option_a}</button>
      <button class="option-btn" data-option="B">${q.option_b}</button>
      <button class="option-btn" data-option="C">${q.option_c}</button>
      <button class="option-btn" data-option="D">${q.option_d}</button>
    </div>
    <div class="question-nav">
      <span></span>
      <button class="btn btn-primary" id="next-btn" disabled>Next</button>
    </div>
  `;

  document.querySelectorAll(".option-btn").forEach((btn) => {
    btn.addEventListener("click", () => selectOption(btn, q.id));
  });
  document.getElementById("next-btn").addEventListener("click", () => {
    currentIndex++;
    renderQuestion();
  });
}

async function selectOption(btn, questionId) {
  if (answeredCurrent) return;
  answeredCurrent = true;

  const selectedOption = btn.dataset.option;
  document.querySelectorAll(".option-btn").forEach((b) => (b.disabled = true));

  try {
    const res = await apiRequest("/aptitude/submit", {
      method: "POST",
      body: { questionId, selectedOption },
    }, true);

    const { isCorrect, correctOption } = res.data;
    if (isCorrect) sessionScore++;

    btn.classList.add(isCorrect ? "correct" : "incorrect");
    if (!isCorrect) {
      document.querySelector(`.option-btn[data-option="${correctOption}"]`).classList.add("correct");
    }

    document.getElementById("next-btn").disabled = false;
  } catch (err) {
    showToast("Could not submit answer: " + err.message, "error");
    answeredCurrent = false;
    document.querySelectorAll(".option-btn").forEach((b) => (b.disabled = false));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderNavbar("aptitude");

  document.querySelectorAll(".category-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".category-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      loadCategory(tab.dataset.category);
    });
  });

  loadCategory("Quantitative");
});
