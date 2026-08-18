// js/chatbot.js

function appendBubble(role, text) {
  const window_ = document.getElementById("chat-window");
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${role}`;
  bubble.textContent = text;
  window_.appendChild(bubble);
  window_.scrollTop = window_.scrollHeight;
  return bubble;
}

function showTypingIndicator() {
  const window_ = document.getElementById("chat-window");
  const bubble = document.createElement("div");
  bubble.className = "chat-bubble assistant typing";
  bubble.id = "typing-indicator";
  bubble.textContent = "PrepPilot AI is typing...";
  window_.appendChild(bubble);
  window_.scrollTop = window_.scrollHeight;
}

function removeTypingIndicator() {
  const indicator = document.getElementById("typing-indicator");
  if (indicator) indicator.remove();
}

async function loadHistory() {
  try {
    const res = await apiRequest("/chat/history", {}, true);
    const history = res.data.history;

    if (history.length === 0) {
      appendBubble("assistant", "Hi! I'm your PrepPilot AI assistant. Ask me anything about coding, aptitude, interviews, or what to study next — I can see your progress and tailor my answers to you.");
      return;
    }

    history.forEach((h) => appendBubble(h.role, h.message));
  } catch (err) {
    console.error("Failed to load chat history:", err.message);
  }
}

async function sendMessage(text) {
  appendBubble("user", text);
  showTypingIndicator();

  const input = document.getElementById("chat-input");
  const sendBtn = document.getElementById("send-btn");
  input.disabled = true;
  sendBtn.disabled = true;

  try {
    const res = await apiRequest("/chat", { method: "POST", body: { message: text } }, true);
    removeTypingIndicator();
    appendBubble("assistant", res.data.reply);
  } catch (err) {
    removeTypingIndicator();
    appendBubble("assistant", "Sorry, I ran into an error: " + err.message);
  } finally {
    input.disabled = false;
    sendBtn.disabled = false;
    input.focus();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderNavbar("chatbot");
  loadHistory();

  document.getElementById("chat-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("chat-input");
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    sendMessage(text);
  });

  document.querySelectorAll(".suggested-prompt").forEach((btn) => {
    btn.addEventListener("click", () => {
      sendMessage(btn.dataset.prompt);
    });
  });
});
