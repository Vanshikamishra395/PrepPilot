// js/dashboard.js

function buildProgressCard(label, value) {
  return `
    <div class="card progress-card">
      <h3>${label}</h3>
      <div class="progress-value">${value}%</div>
      <div class="progress-bar-track">
        <div class="progress-bar-fill" style="width: ${value}%"></div>
      </div>
    </div>
  `;
}

function renderSkillBadge(skillLevel) {
  const wrapper = document.getElementById("skill-badge-wrapper");
  const summary = document.getElementById("skill-summary");
  const cta = document.getElementById("assessment-cta");

  if (!skillLevel) {
    wrapper.innerHTML = `<span class="skill-badge none">Not Assessed</span>`;
    summary.textContent = "You haven't taken the skill assessment yet.";
    cta.textContent = "Take Skill Assessment";
    return;
  }

  // CSS class names can't contain spaces, so convert "Beginner-Intermediate" safely.
  const cssClass = skillLevel.replace(/\s+/g, "-");
  wrapper.innerHTML = `<span class="skill-badge ${cssClass}">${skillLevel}</span>`;
  summary.textContent = `Your current level is ${skillLevel}, based on your latest assessment.`;
  cta.textContent = "Retake Assessment";
}

function renderRecommendations(recommendations) {
  const listEl = document.getElementById("recommendation-list");

  if (!recommendations || recommendations.length === 0) {
    listEl.innerHTML = `<li class="empty-state">Complete your skill assessment to get personalized recommendations.</li>`;
    return;
  }

  // Show the top 6 so the card doesn't grow too tall; the full list
  // still exists server-side if a dedicated "Recommendations" page is added later.
  listEl.innerHTML = recommendations
    .slice(0, 6)
    .map(
      (r) => `
      <li>
        <div class="rec-topic">${r.recommended_topic}</div>
        <div class="rec-reason">${r.reason}</div>
      </li>`
    )
    .join("");
}

async function loadRecommendations() {
  try {
    const res = await apiRequest("/recommendations", {}, true);
    renderRecommendations(res.data.recommendations);
  } catch (err) {
    console.error("Failed to load recommendations:", err.message);
  }
}

async function loadDashboard() {
  try {
    const res = await apiRequest("/user/dashboard", {}, true);
    const { user, skillLevel, progress } = res.data;

    document.getElementById("welcome-heading").textContent = `Welcome back, ${user.name.split(" ")[0]}`;

    document.getElementById("progress-cards").innerHTML =
      buildProgressCard("Coding", progress.coding) +
      buildProgressCard("Aptitude", progress.aptitude) +
      buildProgressCard("Technical Interview", progress.technical) +
      buildProgressCard("HR Interview", progress.hr);

    renderSkillBadge(skillLevel);
  } catch (err) {
    console.error("Failed to load dashboard:", err.message);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderNavbar("dashboard");
  loadDashboard();
  loadRecommendations();
});
