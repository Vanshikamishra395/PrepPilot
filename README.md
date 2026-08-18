# PrepPilot – Placement Preparation Platform

A centralized placement preparation platform where students can practice coding, aptitude, and interview questions, take a two-level skill assessment, track their progress, and get AI-powered, personalized guidance.

**Tech Stack:** HTML5 + CSS3 + Vanilla JavaScript (frontend) · Node.js + Express.js (backend) · MySQL (database) · JWT auth · Anthropic LLM API (chatbot)

No React, no MongoDB, no build tooling — deliberately kept simple and explainable.

---

## 1. Project Structure

```
preppilot/
├── server/                # Node.js + Express backend
│   ├── config/             # env loading, MySQL connection pool
│   ├── controllers/        # request handlers (business logic)
│   ├── routes/              # Express route definitions
│   ├── middleware/         # auth, validation, error handling
│   ├── services/            # skill classification, recommendations, LLM
│   ├── models/               # all raw SQL, parameterized queries
│   ├── utils/                # hashing, JWT, response helpers
│   ├── database/
│   │   ├── schema.sql        # all table definitions
│   │   └── seed.sql          # realistic starter data
│   ├── .env.example
│   └── server.js             # entry point
│
└── client/                 # Static HTML/CSS/JS frontend
    ├── index.html            # landing page
    ├── login.html / register.html
    ├── dashboard.html
    ├── quiz.html             # skill assessment (Level 1 & 2)
    ├── coding.html / aptitude.html / technical.html / hr.html
    ├── chatbot.html
    ├── search.html
    ├── css/
    └── js/
```

---

## 2. Prerequisites

- Node.js 18 or later
- MySQL 8.0 (or compatible)
- An Anthropic API key (only needed for the AI Assistant feature — everything else works without it)

---

## 3. Setup Instructions

### Step 1 — Clone and install dependencies

```bash
cd server
npm install
```

### Step 2 — Create the database

```bash
mysql -u root -p -e "CREATE DATABASE preppilot;"
```

### Step 3 — Load the schema and seed data

```bash
mysql -u root -p preppilot < database/schema.sql
mysql -u root -p preppilot < database/seed.sql
```

This creates all 14 tables and populates: 10 Level 1 quiz questions, 10 Level 2 quiz questions, 12 coding problems, 10 aptitude questions, 9 technical interview resources, and 7 HR interview questions — enough to explore every feature immediately.

### Step 4 — Configure environment variables

```bash
cp .env.example .env
```

Then edit `server/.env`:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=preppilot

JWT_SECRET=replace_this_with_a_long_random_string
JWT_EXPIRES_IN=7d

LLM_API_KEY=your_anthropic_api_key       # leave blank to disable the chatbot
LLM_API_URL=https://api.anthropic.com/v1/messages
LLM_MODEL=claude-sonnet-4-6
```

**Never commit your real `.env` file.** It's already excluded via `.gitignore`.

### Step 5 — Start the server

```bash
npm run dev     # with auto-restart (nodemon)
# or
npm start       # plain node
```

The server serves both the API and the static frontend, so a single URL is all you need:

```
http://localhost:5000/index.html
```

### Step 6 — Try it out

1. Register an account at `/register.html`
2. Take the Level 1 Skill Assessment from the dashboard
3. Explore Coding, Aptitude, Technical, and HR sections
4. Check the dashboard — your skill badge and recommendations update automatically
5. Ask the AI Assistant a question (requires a valid `LLM_API_KEY`)

---

## 4. Architecture Overview

```
Browser (HTML/CSS/JS)
       |  fetch() + JWT in Authorization header
       v
Express REST API  --->  MySQL (parameterized queries only)
       |
       +--->  Anthropic LLM API (server-side only, for /api/chat)
```

- The frontend never talks to MySQL or the LLM API directly — everything goes through the Express backend.
- JWT tokens are issued on login/register and stored in `localStorage`; every protected endpoint re-validates the token server-side via `middleware/auth.middleware.js`.
- The LLM API key lives only in `server/.env` and is used exclusively inside `services/llm.service.js`.

---

## 5. Skill Classification Logic

Fixed, deterministic rule (`services/skillClassification.service.js`), based on a 10-question quiz:

| Score | Classification |
|---|---|
| 0–4 | Beginner |
| 5 | Beginner-Intermediate |
| 6–10 | Advanced |

## 6. Recommendation Logic

Rule-based, not ML (`services/recommendation.service.js`):
1. Any topic where the user scored below 50% accuracy on their most recent quiz attempt is recommended first, with a specific reason.
2. The remainder is filled from a fixed list per skill level (Beginner / Beginner-Intermediate / Advanced).

Recommendations regenerate automatically every time a quiz is submitted.

---

## 7. Full API Documentation

See [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md) for every endpoint, request/response shape, and auth requirements.

---

## 8. Deployment

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for production deployment notes (hosting options, environment variables, process management, and database considerations).

---

## 9. Security Notes

- Passwords are hashed with bcrypt (10 salt rounds) — never stored in plaintext.
- All SQL queries use parameterized placeholders (`?`) — no string concatenation, so SQL injection is not possible through normal query paths.
- JWT tokens expire after 7 days by default (`JWT_EXPIRES_IN`).
- In `NODE_ENV=production`, internal error details are hidden from API responses (generic messages only) while still being logged server-side.
- The LLM API key is never exposed to the frontend.

---

## 10. Known Limitations (by design, for simplicity)

- The user's overall skill level always reflects their **most recent** quiz attempt (not an average or "best of").
- Chat history has no pagination — it grows per user (fine for a college project scope).
- No email verification or password reset flow — out of scope for this project's requirements.
