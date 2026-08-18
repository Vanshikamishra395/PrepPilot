// services/skillClassification.service.js
// Single source of truth for turning a quiz score into a skill level.
// Used by both Level 1 and Level 2 quizzes so the rule never drifts
// between the two.
//
// Fixed classification (out of 10 marks):
//   0–4  -> Beginner
//   5    -> Beginner-Intermediate
//   6–10 -> Advanced

function classifySkill(score) {
  if (score <= 4) return "Beginner";
  if (score === 5) return "Beginner-Intermediate";
  return "Advanced";
}

module.exports = { classifySkill };
