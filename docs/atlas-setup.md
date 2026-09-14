# Issue #9 — MongoDB Atlas setup (Yavik)

Branch: `feat/9-mongodb-atlas`  
Worktree: `.worktrees/feat-9-mongodb-atlas`

## Already done in the repo

- `User` and `Listing` Mongoose models (`server/src/models/`)
- Server reads `MONGODB_URI` via `server/src/config/env.js` (required — no hardcoded credentials)
- `server/.env.example` documents the Atlas-style URI
- Local Docker Compose Mongo is available for day-to-day FE/BE work

## Your job

1. Create a MongoDB Atlas cluster (free tier is fine)
2. Create a DB user + allow network access (0.0.0.0/0 for Render, or lock to Render IPs if preferred)
3. Copy the `mongodb+srv://...` connection string into **local** `server/.env` as `MONGODB_URI` (never commit `.env`)
4. Point the DB name at `studyswap` (or update the URI path accordingly)
5. Verify: `cd server && npm test` and/or boot the API and hit `/api/users/signup`
6. Hand the same URI to Render dashboard env vars when doing #13 (do not put it in git)

## Acceptance

- [ ] Atlas cluster exists and is reachable
- [ ] App connects using only `MONGODB_URI` from env
- [ ] No credentials committed
- [ ] Short note in the PR description: cluster region + who has dashboard access
- [ ] Close #9 when verified (`Closes #9`)

## Optional PR content

If you need a repo change, keep it tiny — e.g. clarify `server/.env.example` comments. Models do not need re-creating.
