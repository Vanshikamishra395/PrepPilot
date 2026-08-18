// js/search.js

const SECTION_CONFIG = {
  coding: { title: "Coding Problems", link: (item) => `coding.html` },
  aptitude: { title: "Aptitude Questions", link: (item) => `aptitude.html` },
  technical: { title: "Technical Interview", link: (item) => `technical.html` },
  hr: { title: "HR Interview", link: (item) => `hr.html` },
};

function getResultLabel(type, item) {
  if (type === "coding") return item.title;
  if (type === "aptitude") return item.question_text;
  return item.question_text; // technical / hr
}

function getResultMeta(type, item) {
  if (type === "coding") return `${item.topic} · ${item.difficulty}`;
  if (type === "aptitude") return item.category;
  return item.topic;
}

async function runSearch(term) {
  const resultsEl = document.getElementById("search-results");
  resultsEl.innerHTML = `<div class="spinner"></div>`;

  try {
    const res = await apiRequest(`/search?q=${encodeURIComponent(term)}`);
    renderResults(res.data);
  } catch (err) {
    resultsEl.innerHTML = `<p class="empty-state">Search failed: ${err.message}</p>`;
  }
}

function renderResults(data) {
  const resultsEl = document.getElementById("search-results");
  const types = Object.keys(SECTION_CONFIG);
  const totalResults = types.reduce((sum, t) => sum + (data[t] ? data[t].length : 0), 0);

  if (totalResults === 0) {
    resultsEl.innerHTML = `<p class="empty-state">No results found. Try a different search term.</p>`;
    return;
  }

  resultsEl.innerHTML = types
    .filter((type) => data[type] && data[type].length > 0)
    .map((type) => {
      const config = SECTION_CONFIG[type];
      const items = data[type]
        .map(
          (item) => `
          <a href="${config.link(item)}" class="card search-result-item" style="display:flex;">
            <div>
              <div class="search-result-title">${getResultLabel(type, item)}</div>
              <div class="search-result-meta">${getResultMeta(type, item)}</div>
            </div>
          </a>`
        )
        .join("");
      return `<div class="search-section"><h2>${config.title}</h2>${items}</div>`;
    })
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  renderNavbar("search");

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get("q") || "";
  if (initialQuery) {
    document.getElementById("search-query").value = initialQuery;
    runSearch(initialQuery);
  }

  document.getElementById("search-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const term = document.getElementById("search-query").value.trim();
    if (!term) {
      showToast("Enter a search term first.", "error");
      return;
    }
    const newUrl = `${window.location.pathname}?q=${encodeURIComponent(term)}`;
    window.history.replaceState({}, "", newUrl);
    runSearch(term);
  });
});
