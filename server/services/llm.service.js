// services/llm.service.js
// The only file in the whole app that talks to the LLM API.
// The API key lives in process.env (loaded from .env) and never
// leaves the backend — the frontend only ever calls our own
// POST /api/chat endpoint.

const env = require("../config/env");

const ANTHROPIC_VERSION = "2023-06-01";
const MAX_TOKENS = 1000;

// Builds a system prompt personalized to this specific user, using
// data already fetched from MySQL (skill level, weak topics, progress).
// This is what makes the chatbot's answers "aware" of the user.
function buildSystemPrompt({ userName, skillLevel, weakTopics, progress }) {
  const weakTopicsText =
    weakTopics && weakTopics.length > 0
      ? weakTopics.join(", ")
      : "no specific weak topics identified yet";

  return `You are the PrepPilot AI Placement Assistant, helping students prepare for campus placements.

You are currently talking to ${userName}.
Their current skill level: ${skillLevel || "Not yet assessed"}.
Their weak topics based on recent assessments: ${weakTopicsText}.
Their preparation progress — Coding: ${progress.coding}%, Aptitude: ${progress.aptitude}%, Technical: ${progress.technical}%, HR: ${progress.hr}%.

Guidelines:
- Give personalized, specific guidance using the context above whenever relevant.
- Help with coding doubts, aptitude concepts, technical/HR interview prep, and resume/project questions.
- Keep answers focused and practical — this is a student preparing for interviews, not writing an essay.
- If they ask what to study next, prioritize their weak topics.
- Be encouraging but honest about gaps in their preparation.`;
}

/**
 * Sends a message to the LLM and returns the assistant's reply text.
 * @param {string} userMessage
 * @param {object} userContext - { userName, skillLevel, weakTopics, progress }
 * @param {Array<{role: 'user'|'assistant', content: string}>} history - prior turns, oldest first
 */
async function getChatResponse(userMessage, userContext, history = []) {
  if (!env.LLM_API_KEY) {
    throw new Error("LLM_API_KEY is not configured on the server.");
  }

  const systemPrompt = buildSystemPrompt(userContext);

  const messages = [
    ...history.map((h) => ({ role: h.role, content: h.content })),
    { role: "user", content: userMessage },
  ];

  const response = await fetch(env.LLM_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.LLM_API_KEY,
      "anthropic-version": ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: env.LLM_MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`LLM API request failed (${response.status}): ${errText}`);
  }

  const data = await response.json();

  // The Messages API returns content as an array of blocks; we only
  // expect plain text blocks here.
  const textBlock = data.content.find((block) => block.type === "text");
  return textBlock ? textBlock.text : "I couldn't generate a response. Please try again.";
}

module.exports = { getChatResponse, buildSystemPrompt };
