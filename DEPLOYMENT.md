# PrepPilot Deployment Guide

This is a single Node.js/Express server that also serves the static frontend, plus a MySQL database — so deployment is straightforward.

---

## 1. Hosting Options

Any of these work well for a project of this size:

| Option | Notes |
|---|---|
| **Railway / Render** | Easiest — push your repo, add a MySQL add-on (or use PlanetScale), set env vars in their dashboard, done. |
| **A VPS (DigitalOcean, AWS EC2, etc.)** | More control, requires manual setup below. |
| **PlanetScale / Aiven for the DB + Render/Railway for the app** | Managed MySQL if you don't want to run your own. |

---

## 2. Environment Variables (Production)

Set these on your hosting platform (never commit real values):

```
PORT=5000
NODE_ENV=production
DB_HOST=<your production DB host>
DB_PORT=3306
DB_USER=<db user>
DB_PASSWORD=<db password>
DB_NAME=preppilot
JWT_SECRET=<a long, random, unique string, different from development>
JWT_EXPIRES_IN=7d
LLM_API_KEY=<your real Anthropic API key>
LLM_API_URL=https://api.anthropic.com/v1/messages
LLM_MODEL=claude-sonnet-4-6
```

`NODE_ENV=production` matters — it makes the error handler hide internal error details from API responses (see `middleware/error.middleware.js`), which is important for not leaking database structure to the outside world.

---

## 3. Database Setup on the Production Host

```bash
mysql -u <user> -p -h <host> -e "CREATE DATABASE preppilot;"
mysql -u <user> -p -h <host> preppilot < server/database/schema.sql
mysql -u <user> -p -h <host> preppilot < server/database/seed.sql
```

---

## 4. Deploying to a VPS (manual)

```bash
# On the server
git clone <your-repo-url>
cd preppilot/server
npm install --production

# Set up your .env file (see section 2 above)
nano .env

# Run with a process manager so it survives reboots/crashes
npm install -g pm2
pm2 start server.js --name preppilot
pm2 save
pm2 startup
```

Put a reverse proxy (Nginx) in front for HTTPS:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Then use `certbot` for a free TLS certificate.

---

## 5. Deploying to Railway/Render (typical flow)

1. Push your code to GitHub.
2. Create a new Web Service pointing at `server/` as the root, with:
   - Build command: `npm install`
   - Start command: `npm start`
3. Add a MySQL database (Railway has a one-click MySQL add-on; Render requires an external provider like PlanetScale).
4. Copy the DB connection details into your service's environment variables.
5. Run `schema.sql` and `seed.sql` against the new database once.
6. Set `NODE_ENV=production` and your real `LLM_API_KEY`.
7. Deploy — the platform gives you a public URL that serves both the API and the frontend automatically, since `server.js` serves `client/` as static files.

---

## 6. Production Checklist

- [ ] `NODE_ENV=production` set
- [ ] `JWT_SECRET` is long, random, and different from your local dev secret
- [ ] Database user has only the permissions it needs (not necessarily `root`)
- [ ] `.env` is not committed to version control
- [ ] `LLM_API_KEY` is a real, valid key with billing configured on the Anthropic side
- [ ] CORS is appropriately scoped if the frontend is hosted on a different origin than the API (currently `cors()` allows all origins — tighten this with `cors({ origin: "https://yourdomain.com" })` if frontend and backend are split)
- [ ] Regular database backups configured on whichever MySQL host you choose

---

## 7. Scaling Notes (if this ever grows beyond a college project)

- The MySQL connection pool (`config/db.js`) is already sized for moderate concurrency (`connectionLimit: 10`) — raise it if you see connection queueing under load.
- Chat history and quiz attempts grow unbounded per user; add pagination or archiving if this becomes a long-running production app.
- Static frontend files could be moved to a CDN for faster global delivery, with the Express app serving only `/api/*`.
