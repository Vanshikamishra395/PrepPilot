// js/auth.js
// Handles the register.html and login.html forms.

function showFormError(elementId, message) {
  const el = document.getElementById(elementId);
  el.textContent = message;
  el.classList.remove("hidden");
}

function clearFormError(elementId) {
  const el = document.getElementById(elementId);
  el.textContent = "";
  el.classList.add("hidden");
}

// ---- Register ----
function initRegisterForm() {
  const form = document.getElementById("register-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFormError("register-error");

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating account...";

    try {
      const res = await apiRequest("/auth/register", {
        method: "POST",
        body: { name, email, password, confirmPassword },
      });

      setToken(res.data.token);
      setStoredUser(res.data.user);
      window.location.href = "dashboard.html";
    } catch (err) {
      showFormError("register-error", err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Create Account";
    }
  });
}

// ---- Login ----
function initLoginForm() {
  const form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFormError("login-error");

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";

    try {
      const res = await apiRequest("/auth/login", {
        method: "POST",
        body: { email, password },
      });

      setToken(res.data.token);
      setStoredUser(res.data.user);
      window.location.href = "dashboard.html";
    } catch (err) {
      showFormError("login-error", err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Login";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // If an already-logged-in user lands on login/register, send them to the dashboard.
  if (isLoggedIn() && (document.getElementById("login-form") || document.getElementById("register-form"))) {
    window.location.href = "dashboard.html";
    return;
  }
  initRegisterForm();
  initLoginForm();
});
