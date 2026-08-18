// js/navbar.js
// Injects a consistent navbar into every authenticated page.
// Usage: add <div id="navbar-placeholder"></div> near the top of <body>,
// include api.js before this file, then call renderNavbar("dashboard").

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", href: "dashboard.html" },
  { key: "quiz", label: "Assessment", href: "quiz.html" },
  { key: "coding", label: "Coding", href: "coding.html" },
  { key: "aptitude", label: "Aptitude", href: "aptitude.html" },
  { key: "technical", label: "Technical", href: "technical.html" },
  { key: "hr", label: "HR Prep", href: "hr.html" },
  { key: "chatbot", label: "AI Assistant", href: "chatbot.html" },
  { key: "search", label: "Search", href: "search.html" },
];

function renderNavbar(activeKey) {
  requireLogin();

  const user = getStoredUser();
  const placeholder = document.getElementById("navbar-placeholder");
  if (!placeholder) return;

  const linksHtml = NAV_ITEMS.map(
    (item) =>
      `<a href="${item.href}" class="${item.key === activeKey ? "active" : ""}">${item.label}</a>`
  ).join("");

  placeholder.innerHTML = `
    <nav class="app-navbar">
      <div class="container">
        <a href="dashboard.html" class="nav-logo">PrepPilot</a>
        <ul class="nav-links" id="nav-links">${linksHtml}</ul>
        <div class="nav-user">
          <span>${user ? user.name : ""}</span>
          <button class="btn btn-outline logout-btn" id="logout-btn">Logout</button>
          <button class="nav-toggle-btn" id="nav-toggle-btn" aria-label="Toggle menu">☰</button>
        </div>
      </div>
    </nav>
  `;

  document.getElementById("logout-btn").addEventListener("click", () => {
    clearToken();
    window.location.href = "login.html";
  });

  document.getElementById("nav-toggle-btn").addEventListener("click", () => {
    document.getElementById("nav-links").classList.toggle("open");
  });
}
