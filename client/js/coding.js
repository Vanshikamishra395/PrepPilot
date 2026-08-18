// js/coding.js

let userProgressMap = {};
let debounceTimer = null;

async function loadProgress() {
  try {
    const res = await apiRequest("/coding/progress", {}, true);
    userProgressMap = res.data.progressMap;
  } catch (err) {
    console.error("Failed to load coding progress:", err.message);
  }
}

async function loadProblems() {
  const search = document.getElementById("search-input").value.trim();
  const topic = document.getElementById("topic-filter").value;
  const difficulty = document.getElementById("difficulty-filter").value;

  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (topic) params.append("topic", topic);
  if (difficulty) params.append("difficulty", difficulty);

  const listEl = document.getElementById("problem-list");
  listEl.innerHTML = `<p class="empty-state">Loading problems...</p>`;

  try {
    const res = await apiRequest(`/coding/problems?${params.toString()}`);
    renderProblems(res.data.problems);
  } catch (err) {
    listEl.innerHTML = `<p class="empty-state">Failed to load problems.</p>`;
  }
}

function renderProblems(problems) {
  const listEl = document.getElementById("problem-list");

  if (problems.length === 0) {
    listEl.innerHTML = `<p class="empty-state">No problems match your filters.</p>`;
    return;
  }

  listEl.innerHTML = problems
    .map((p) => {
      const isCompleted = userProgressMap[p.id] === "Completed";
      return `
        <div class="card problem-row" data-id="${p.id}">
          <div class="problem-main">
            <div>
              <div class="problem-title">${p.title}</div>
              <div class="problem-topic">${p.topic}</div>
            </div>
            <span class="tag ${p.difficulty}">${p.difficulty}</span>
          </div>
          <button class="btn btn-outline status-toggle ${isCompleted ? "completed" : ""}" data-id="${p.id}">
            ${isCompleted ? "Completed ✓" : "Mark Complete"}
          </button>
        </div>
      `;
    })
    .join("");

  document.querySelectorAll(".status-toggle").forEach((btn) => {
    btn.addEventListener("click", () => toggleStatus(btn));
  });
}

async function toggleStatus(btn) {
  const problemId = btn.dataset.id;
  const isCurrentlyCompleted = btn.classList.contains("completed");
  const newStatus = isCurrentlyCompleted ? "Not Started" : "Completed";

  btn.disabled = true;
  try {
    await apiRequest("/coding/progress", { method: "POST", body: { problemId, status: newStatus } }, true);
    userProgressMap[problemId] = newStatus;
    btn.classList.toggle("completed");
    btn.textContent = newStatus === "Completed" ? "Completed ✓" : "Mark Complete";
    if (newStatus === "Completed") showToast("Nice work! Marked as completed.", "success");
  } catch (err) {
    showToast("Could not update progress: " + err.message, "error");
  } finally {
    btn.disabled = false;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  renderNavbar("coding");
  await loadProgress();
  await loadProblems();

  document.getElementById("search-input").addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(loadProblems, 350);
  });
  document.getElementById("topic-filter").addEventListener("change", loadProblems);
  document.getElementById("difficulty-filter").addEventListener("change", loadProblems);
});
