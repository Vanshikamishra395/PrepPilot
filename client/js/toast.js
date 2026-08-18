// js/toast.js
// Small, dependency-free toast notification system. Every page includes
// this after api.js so success/error feedback looks consistent instead
// of relying on browser alert() popups.

function ensureToastContainer() {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  return container;
}

/**
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 */
function showToast(message, type = "info") {
  const container = ensureToastContainer();

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  // Trigger the enter animation on the next frame.
  requestAnimationFrame(() => toast.classList.add("toast-visible"));

  setTimeout(() => {
    toast.classList.remove("toast-visible");
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}
