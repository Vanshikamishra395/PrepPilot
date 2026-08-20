// services/llm.service.js
// The only file in the whole app that talks to the LLM API.
// The API key lives in process.env and never leaves the backend.

const env = require("../config/env");

const MAX_TOKENS = 1000;

// Builds a system prompt personalized to this specific user.
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
 * Sends a message to Gemini and returns the assistant's reply text.
 */
async function getChatResponse(userMessage, userContext, history = []) {
  if (!env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }

  const systemPrompt = buildSystemPrompt(userContext);

  const contents = [
    ...history.map((h) => ({
      role: h.role === "assistant" ? "model" : "user",
      parts: [{ text: h.content }],
    })),
    {
      role: "user",
      parts: [{ text: userMessage }],
    },
  ];

  const response = await fetch(env.LLM_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": env.GEMINI_API_KEY,
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents,
      generationConfig: {
        maxOutputTokens: MAX_TOKENS,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();

    throw new Error(
      `Gemini API request failed (${response.status}): ${errText}`
    );
  }

  const data = await response.json();

  const text =
    data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("") || "";

  return text || "I couldn't generate a response. Please try again.";
}

module.exports = {
  getChatResponse,
  buildSystemPrompt,
};