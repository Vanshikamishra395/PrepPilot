// controllers/quiz.controller.js
const quizModel = require("../models/quiz.model");
const userModel = require("../models/user.model");
const recommendationModel = require("../models/recommendation.model");
const { classifySkill } = require("../services/skillClassification.service");
const { buildRecommendations } = require("../services/recommendation.service");
const { success, error } = require("../utils/response.util");

// GET /api/quiz/level1  (protected)
async function getLevel1(req, res, next) {
  try {
    const quiz = await quizModel.getQuizByLevel("Level1");
    if (!quiz) return error(res, 404, "Level 1 quiz has not been set up yet.");

    const questions = await quizModel.getQuestionsForClient(quiz.id);
    return success(res, 200, "Level 1 quiz fetched.", { quizId: quiz.id, title: quiz.title, questions });
  } catch (err) {
    next(err);
  }
}

// GET /api/quiz/level2  (protected) — requires a completed Level 1 attempt
async function getLevel2(req, res, next) {
  try {
    const completedLevel1 = await quizModel.hasCompletedLevel1(req.userId);
    if (!completedLevel1) {
      return error(res, 403, "Complete Level 1 before attempting Level 2.");
    }

    const quiz = await quizModel.getQuizByLevel("Level2");
    if (!quiz) return error(res, 404, "Level 2 quiz has not been set up yet.");

    const questions = await quizModel.getQuestionsForClient(quiz.id);
    return success(res, 200, "Level 2 quiz fetched.", { quizId: quiz.id, title: quiz.title, questions });
  } catch (err) {
    next(err);
  }
}

// POST /api/quiz/submit  (protected)
// body: { quizId, answers: [{ questionId, selectedOption }] }
async function submitQuiz(req, res, next) {
  try {
    const { quizId, answers } = req.body;

    if (!quizId || !Array.isArray(answers)) {
      return error(res, 400, "quizId and an answers array are required.");
    }

    const answerKey = await quizModel.getQuestionsForGrading(quizId);
    if (answerKey.length === 0) {
      return error(res, 404, "Quiz not found.");
    }

    // Map for quick lookup: questionId -> { correct_option, topic }
    const keyMap = {};
    answerKey.forEach((q) => {
      keyMap[q.id] = q;
    });

    // Grade every submitted answer against the answer key.
    let score = 0;
    const gradedAnswers = answers.map((a) => {
      const correctQuestion = keyMap[a.questionId];
      const isCorrect = !!correctQuestion && correctQuestion.correct_option === a.selectedOption;
      if (isCorrect) score++;
      return {
        questionId: a.questionId,
        selectedOption: a.selectedOption || null,
        isCorrect,
      };
    });

    const totalQuestions = answerKey.length;
    const percentage = Math.round((score / totalQuestions) * 10000) / 100; // 2 decimal places
    const skillLevelResult = classifySkill(score);

    const attemptId = await quizModel.saveAttempt({
      userId: req.userId,
      quizId,
      score,
      percentage,
      skillLevelResult,
      gradedAnswers,
    });

    // The user's overall dashboard skill level always reflects their
    // most recent attempt (Level 1 or Level 2).
    await userModel.upsertSkillLevel(req.userId, skillLevelResult);

    const topicPerformance = await quizModel.getTopicPerformance(attemptId);

    // Regenerate this user's recommendations using the skill level just
    // computed and the topic-wise performance from THIS attempt.
    const newRecommendations = buildRecommendations(skillLevelResult, topicPerformance);
    await recommendationModel.replaceRecommendations(req.userId, newRecommendations);

    // Build a correct/incorrect breakdown per question, useful for
    // showing the user exactly what they got wrong.
    const breakdown = gradedAnswers.map((a) => ({
      questionId: a.questionId,
      selectedOption: a.selectedOption,
      correctOption: keyMap[a.questionId] ? keyMap[a.questionId].correct_option : null,
      isCorrect: a.isCorrect,
      topic: keyMap[a.questionId] ? keyMap[a.questionId].topic : null,
    }));

    return success(res, 200, "Quiz submitted successfully.", {
      attemptId,
      score,
      totalQuestions,
      percentage,
      skillLevel: skillLevelResult,
      topicPerformance,
      breakdown,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/quiz/history  (protected)
async function getHistory(req, res, next) {
  try {
    const attempts = await quizModel.getUserAttempts(req.userId);
    return success(res, 200, "Quiz history fetched.", { attempts });
  } catch (err) {
    next(err);
  }
}

module.exports = { getLevel1, getLevel2, submitQuiz, getHistory };
