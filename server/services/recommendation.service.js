// services/recommendation.service.js
// A deliberately rule-based (not ML) recommendation engine — easy to
// read, easy to explain in an interview, and fully deterministic.
//
// Logic:
//   1. Start from a fixed base list of topics for the user's skill level.
//   2. Look at topic-wise accuracy from their most recent quiz attempt.
//   3. Any topic below WEAK_THRESHOLD accuracy gets promoted to the TOP
//      of the list with a specific, personalized reason.
//   4. Topics already covered by the weak-topic step aren't duplicated
//      from the base list.

const WEAK_THRESHOLD = 0.5; // below 50% accuracy counts as "weak"

const BASE_RECOMMENDATIONS = {
  Beginner: [
    "Programming Fundamentals",
    "Basic DSA",
    "OOPs Fundamentals",
    "SQL Basics",
    "DBMS Basics",
    "OS Fundamentals",
    "CN Fundamentals",
    "Easy Coding Problems",
    "Basic Aptitude",
  ],
  "Beginner-Intermediate": [
    "Intermediate DSA",
    "OOPs",
    "SQL/DBMS",
    "Operating Systems",
    "Computer Networks",
    "Intermediate Coding",
    "Aptitude Practice",
    "Technical Interview Questions",
  ],
  Advanced: [
    "Advanced DSA",
    "Complex Problem Solving",
    "Advanced SQL/DBMS",
    "Advanced OOPs",
    "Advanced OS/CN",
    "Medium/Hard Coding Problems",
    "Technical Interview Preparation",
    "Mock Interviews",
  ],
};

/**
 * @param {string} skillLevel - "Beginner" | "Beginner-Intermediate" | "Advanced"
 * @param {Array<{topic: string, total: number, correct: number}>} topicPerformance
 * @returns {Array<{recommended_topic: string, reason: string}>}
 */
function buildRecommendations(skillLevel, topicPerformance = []) {
  const recommendations = [];
  const addedTopics = new Set();

  // Step 1: weak topics go first, each with a specific reason.
  topicPerformance
    .filter((t) => t.total > 0 && Number(t.correct) / Number(t.total) < WEAK_THRESHOLD)
    .forEach((t) => {
      const accuracy = Math.round((Number(t.correct) / Number(t.total)) * 100);
      recommendations.push({
        recommended_topic: t.topic,
        reason: `You scored ${accuracy}% in ${t.topic} in your last assessment — prioritize this topic.`,
      });
      addedTopics.add(t.topic.toLowerCase());
    });

  // Step 2: fill in the rest from the skill-level base list, skipping
  // anything already added as a weak topic.
  const baseList = BASE_RECOMMENDATIONS[skillLevel] || BASE_RECOMMENDATIONS.Beginner;
  baseList.forEach((topic) => {
    if (!addedTopics.has(topic.toLowerCase())) {
      recommendations.push({
        recommended_topic: topic,
        reason: `Recommended based on your current skill level (${skillLevel}).`,
      });
      addedTopics.add(topic.toLowerCase());
    }
  });

  return recommendations;
}

module.exports = { buildRecommendations, BASE_RECOMMENDATIONS, WEAK_THRESHOLD };
