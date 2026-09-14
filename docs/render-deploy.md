# Issue #13 — Deploy Express API to Render (Yavik)

Branch: `feat/13-render-deploy`  
Worktree: `.worktrees/feat-13-render-deploy`

**Depends on:** #9 (MongoDB Atlas `MONGODB_URI`). Get the Atlas connection string from the #9 owner before configuring Render env vars.

## Already done in the repo

- Express app under `server/` with `npm start` → `node src/index.js`
- Node engine pin: `>=24 <25` (`server/package.json` `engines`)
- Required env: `MONGODB_URI`, `JWT_SECRET` (validated in `server/src/config/env.js`)
- Plain HTTP listen when cert paths are unset — correct for Render (TLS at the edge). See `server/src/index.js`
- CORS enabled with default `cors()` in `server/src/app.js` (allows Cordova `file://` and browser origins during demos)

## Your job — checklist

### 1. Create the Web Service

- [ ] In [Render](https://render.com), **New → Web Service**
- [ ] Connect this GitHub repo (`coit20269-assessment-2` / Group D)
- [ ] Set **Root Directory** to `server` (API lives there, not repo root)
- [ ] Runtime: **Node**
- [ ] **Node version:** `24` (match `engines` in `server/package.json`)
- [ ] **Build command:** `npm install`
- [ ] **Start command:** `npm start` (runs `node src/index.js`)
- [ ] Branch to deploy: `main` or `dev` once the API is merge-ready (ask lead which branch is live)

### 2. Environment variables (Render Dashboard → Environment)

Set these in the Render UI. **Never commit real values** to git (`.env` is gitignored; only `.env.example` stays in the repo).

| Variable | Value | Notes |
|---|---|---|
| `MONGODB_URI` | Atlas `mongodb+srv://…` from #9 | Same URI as local; ensure Atlas Network Access allows Render (e.g. `0.0.0.0/0`) |
| `JWT_SECRET` | Long random string | Different from local/dev if possible |
| `PORT` | *(optional)* | Render injects `PORT`; our server already reads `process.env.PORT` |
| `NODE_ENV` | `production` | |

Do **not** set `HTTPS_KEY_PATH` / `HTTPS_CERT_PATH` on Render — leave unset so the process listens on HTTP behind Render’s TLS proxy.

### 3. HTTPS

- [ ] Confirm the public URL is `https://…onrender.com` (platform TLS). No self-signed certs needed in production.

### 4. CORS / client origins

Current server config (`server/src/app.js`):

```js
app.use(cors());
```

Default `cors()` reflects the request `Origin` and allows credential-less cross-origin calls. That covers:

- Cordova / hybrid: requests often have no browser Origin, or `file://` / `null`
- Browser demos: `http://localhost:…` or a static host hitting the Render API

If a client call fails with a CORS error after deploy, check the Network tab Origin header and tighten/widen the `cors()` options only if the lead asks — default should be fine for the assignment demo.

Point the client `API_BASE` in `client/www/js/api.js` at `https://<your-service>.onrender.com/api` once the service is live (separate FE task / config step).

### 5. Health check / smoke test

After the first successful deploy:

- [ ] Open `https://<service>.onrender.com/api/listings` (GET) — expect `200` and `{ "data": { "listings": […] } }` (may be empty)
- [ ] Or `POST /api/users/signup` with a test body — expect `201` (use a unique email)
- [ ] Confirm Render logs show Mongo connect success (no `Failed to connect to MongoDB`)

### 6. Keep it deployed

- [ ] Leave the service **running** (not suspended) through demos / Week 12 presentation
- [ ] Free tier spins down when idle — hit the listings endpoint once before a live demo so cold start finishes
- [ ] Auto-deploy from the chosen branch is fine; tell the team before redeploys that break the demo URL

## Acceptance

- [ ] Web Service exists, Root Directory = `server`, Node 24, start = `npm start`
- [ ] Env vars set in Render only: `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production` (and `PORT` if you set it)
- [ ] No secrets committed; HTTPS works via Render URL
- [ ] Smoke test passes (GET listings and/or signup)
- [ ] Service stays up for continuous demo access
- [ ] PR description notes the public URL + that #9 Atlas URI was used
- [ ] Close #13 when verified (`Closes #13`)

## Optional PR content

Repo change for this issue is usually **docs only** (`docs/render-deploy.md`). Code/env-example tweaks are optional and should stay tiny.
