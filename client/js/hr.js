// js/hr.js

let progressMap = {};

async function loadProgress() {
  try {
    const res = await apiRequest("/interview/progress?type=HR", {}, true);
    progressMap = res.data.progressMap;
  } catch (err) {
    console.error("Failed to load progress:", err.message);
  }
}

async function loadResources() {
  const listEl = document.getElementById("resource-list");
  listEl.innerHTML = `<p class="empty-state">Loading questions...</p>`;

  try {
    const res = await apiRequest("/interview/hr");
    renderResources(res.data.resources);
  } catch (err) {
    listEl.innerHTML = `<p class="empty-state">Failed to load questions.</p>`;
  }
}

function renderResources(resources) {
  const listEl = document.getElementById("resource-list");

  if (resources.length === 0) {
    listEl.innerHTML = `<p class="empty-state">No HR questions available yet.</p>`;
    return;
  }

  listEl.innerHTML = resources
    .map((r) => {
      const isChecked = !!progressMap[r.id];
      return `
        <div class="card resource-item" data-id="${r.id}">
          <div class="resource-header">
            <div>
              <div class="resource-question">${r.question_text}</div>
              <div class="resource-meta">HR · ${r.difficulty}</div>
            </div>
            <label class="practiced-check" onclick="event.stopPropagation()">
              <input type="checkbox" data-id="${r.id}" ${isChecked ? "checked" : ""} />
              Practiced
            </label>
          </div>
          <div class="resource-answer">${r.answer_text}</div>
        </div>
      `;
    })
    .join("");

  document.querySelectorAll(".resource-header").forEach((header) => {
    header.addEventListener("click", () => {
      header.closest(".resource-item").classList.toggle("expanded");
    });
  });

  document.querySelectorAll(".practiced-check input").forEach((checkbox) => {
    checkbox.addEventListener("change", () => togglePracticed(checkbox));
  });
}

async function togglePracticed(checkbox) {
  const resourceId = checkbox.dataset.id;
  const isCompleted = checkbox.checked;

  checkbox.disabled = true;
  try {
    await apiRequest("/interview/progress", { method: "POST", body: { resourceId, isCompleted } }, true);
    progressMap[resourceId] = isCompleted;
  } catch (err) {
    checkbox.checked = !isCompleted;
    showToast("Could not update progress: " + err.message, "error");
  } finally {
    checkbox.disabled = false;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  renderNavbar("hr");
  await loadProgress();
  await loadResources();
});
