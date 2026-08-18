# PrepPilot API Documentation

Base URL: `http://localhost:5000/api`

All responses follow this shape:
```json
{ "success": true | false, "message": "...", "data": { ... } }
```

Protected routes require a header: `Authorization: Bearer <token>`
(token is returned from `/auth/register` or `/auth/login`)

---

## Auth

### POST /auth/register
Body: `{ "name": "Jane Doe", "email": "jane@example.com", "password": "secret123", "confirmPassword": "secret123" }`
Response `201`: `{ data: { token, user: { id, name, email } } }`
Errors: `400` (validation), `409` (email already registered)

### POST /auth/login
Body: `{ "email": "jane@example.com", "password": "secret123" }`
Response `200`: `{ data: { token, user } }`
Errors: `400`, `401` (invalid credentials — generic message either way)

---

## User

### GET /user/profile 🔒
Response: `{ data: { user: {id, name, email, created_at}, skillLevel } }`

### GET /user/dashboard 🔒
Response: `{ data: { user, skillLevel, progress: { coding, aptitude, technical, hr, overall } } }` (all percentages)

---

## Quiz / Skill Assessment

### GET /quiz/level1 🔒
Response: `{ data: { quizId, title, questions: [{ id, question_text, option_a..d, topic }] } }`
(No `correct_option` is ever sent to the client.)

### GET /quiz/level2 🔒
Same shape as Level 1. Returns `403` if the user hasn't completed Level 1 yet:
`{ success: false, message: "Complete Level 1 before attempting Level 2." }`

### POST /quiz/submit 🔒
Body: `{ "quizId": 1, "answers": [{ "questionId": 1, "selectedOption": "B" }, ...] }`
Response:
```json
{
  "data": {
    "attemptId": 5,
    "score": 7,
    "totalQuestions": 10,
    "percentage": 70,
    "skillLevel": "Advanced",
    "topicPerformance": [{ "topic": "DBMS", "total": 2, "correct": 1 }],
    "breakdown": [{ "questionId": 1, "selectedOption": "B", "correctOption": "B", "isCorrect": true, "topic": "DSA" }]
  }
}
```
Also, as a side effect: updates `user_skill_levels` and regenerates the user's recommendations.

### GET /quiz/history 🔒
Response: `{ data: { attempts: [{ id, score, percentage, skill_level_result, attempted_at, level }] } }`

---

## Coding

### GET /coding/problems?topic=&difficulty=&search=
Public. Response: `{ data: { problems: [{ id, title, difficulty, topic }] } }`

### GET /coding/problems/:id
Public. Response: `{ data: { problem: { ...full row incl. description } } }`

### GET /coding/progress 🔒
Response: `{ data: { progressMap: { "1": "Completed" }, solved, total } }`

### POST /coding/progress 🔒
Body: `{ "problemId": 1, "status": "Completed" }` (or `"Not Started"`)

---

## Aptitude

### GET /aptitude/questions?category=Quantitative|Logical|Verbal|DataInterpretation
Public. Response: `{ data: { questions: [...] } }` (no `correct_option`)

### POST /aptitude/submit 🔒
Body: `{ "questionId": 1, "selectedOption": "B" }`
Response: `{ data: { isCorrect: true, correctOption: "B" } }`

### GET /aptitude/progress 🔒
Response: `{ data: { categoryStats: [{ category, attempted, correct }], overall: { attempted, correct } } }`

---

## Interview (Technical + HR)

### GET /interview/technical?topic=
Public. Response: `{ data: { resources: [{ id, type, topic, question_text, answer_text, difficulty }] } }`

### GET /interview/hr
Public. Same shape, `type: "HR"`.

### GET /interview/progress?type=Technical|HR 🔒
Response: `{ data: { progressMap: { "3": true }, stats: { total, completed } } }`

### POST /interview/progress 🔒
Body: `{ "resourceId": 3, "isCompleted": true }`

---

## Progress

### GET /progress/summary 🔒
Full breakdown across every module — coding (solved/total), aptitude (overall + per-category), technical/HR completion, and quiz attempt history. See `progress.controller.js` for the exact shape.

---

## Recommendations

### GET /recommendations 🔒
Response: `{ data: { recommendations: [{ recommended_topic, reason, created_at }] } }`
Empty until the user takes their first assessment.

---

## Chatbot

### POST /chat 🔒
Body: `{ "message": "I'm weak in DBMS, what should I study?" }`
Response: `{ data: { reply: "..." } }`
The reply is personalized using the user's skill level, weak topics, and progress — all fetched server-side before calling the LLM.

### GET /chat/history 🔒
Response: `{ data: { history: [{ role: "user"|"assistant", message, created_at }] } }`

---

## Search

### GET /search?q=term
Public. Response: `{ data: { coding: [...], aptitude: [...], technical: [...], hr: [...] } }`

### GET /search?q=term&type=coding|aptitude|technical|hr
Response: `{ data: { <type>: [...] } }`

---

## Error Responses

All errors follow: `{ "success": false, "message": "..." }`

| Status | Meaning |
|---|---|
| 400 | Validation error (bad input) |
| 401 | Missing/invalid/expired JWT, or wrong login credentials |
| 403 | Authenticated but not allowed (e.g. Level 2 before Level 1) |
| 404 | Resource or route not found |
| 409 | Conflict (duplicate email on register) |
| 500 | Server error (details hidden in production) |
