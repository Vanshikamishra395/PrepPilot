-- schema.sql
-- PrepPilot database schema.
-- Run this after creating the database:
--   CREATE DATABASE preppilot;
--   USE preppilot;
--   SOURCE schema.sql;

CREATE DATABASE IF NOT EXISTS preppilot;
USE preppilot;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tracks each user's current overall skill classification.
-- Updated after every quiz attempt.
CREATE TABLE user_skill_levels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  skill_level ENUM('Beginner', 'Beginner-Intermediate', 'Advanced') NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_skill (user_id)
);

-- ============================================================
-- QUIZ / SKILL ASSESSMENT
-- ============================================================
CREATE TABLE quizzes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  level ENUM('Level1', 'Level2') NOT NULL,
  title VARCHAR(150) NOT NULL
);

CREATE TABLE quiz_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id INT NOT NULL,
  question_text TEXT NOT NULL,
  option_a VARCHAR(255) NOT NULL,
  option_b VARCHAR(255) NOT NULL,
  option_c VARCHAR(255) NOT NULL,
  option_d VARCHAR(255) NOT NULL,
  correct_option ENUM('A', 'B', 'C', 'D') NOT NULL,
  topic VARCHAR(50) NOT NULL,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

CREATE TABLE quiz_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  quiz_id INT NOT NULL,
  score INT NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  skill_level_result VARCHAR(30) NOT NULL,
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

CREATE TABLE quiz_answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  attempt_id INT NOT NULL,
  question_id INT NOT NULL,
  selected_option ENUM('A', 'B', 'C', 'D') NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
);

-- ============================================================
-- CODING PRACTICE
-- ============================================================
CREATE TABLE coding_problems (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  difficulty ENUM('Easy', 'Medium', 'Hard') NOT NULL,
  topic VARCHAR(50) NOT NULL
);

CREATE TABLE coding_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  problem_id INT NOT NULL,
  status ENUM('Not Started', 'Completed') NOT NULL DEFAULT 'Not Started',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (problem_id) REFERENCES coding_problems(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_problem (user_id, problem_id)
);

-- ============================================================
-- APTITUDE
-- ============================================================
CREATE TABLE aptitude_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category ENUM('Quantitative', 'Logical', 'Verbal', 'DataInterpretation') NOT NULL,
  question_text TEXT NOT NULL,
  option_a VARCHAR(255) NOT NULL,
  option_b VARCHAR(255) NOT NULL,
  option_c VARCHAR(255) NOT NULL,
  option_d VARCHAR(255) NOT NULL,
  correct_option ENUM('A', 'B', 'C', 'D') NOT NULL
);

CREATE TABLE aptitude_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  question_id INT NOT NULL,
  selected_option ENUM('A', 'B', 'C', 'D') NOT NULL,
  is_correct BOOLEAN NOT NULL,
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES aptitude_questions(id) ON DELETE CASCADE
);

-- ============================================================
-- INTERVIEW RESOURCES (Technical + HR share one table)
-- ============================================================
CREATE TABLE interview_resources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('Technical', 'HR') NOT NULL,
  topic VARCHAR(50) NOT NULL,
  question_text TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  difficulty ENUM('Easy', 'Medium', 'Hard') NOT NULL DEFAULT 'Medium'
);

CREATE TABLE user_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  resource_id INT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (resource_id) REFERENCES interview_resources(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_resource (user_id, resource_id)
);

-- ============================================================
-- RECOMMENDATIONS
-- ============================================================
CREATE TABLE recommendations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  recommended_topic VARCHAR(50) NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- AI CHATBOT HISTORY
-- ============================================================
CREATE TABLE chat_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  role ENUM('user', 'assistant') NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
