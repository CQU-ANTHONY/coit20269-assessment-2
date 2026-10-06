# Presentation outline — StudySwap Week 12

Slide-by-slide copy for the deck (and for pasting into PowerPoint if the `.pptx` needs a manual rebuild).

---

## Slide 1 — Title

**StudySwap**  
Campus second-hand marketplace for CQU students

COIT20269 Assignment 2 · Week 12 Presentation · Group D  
Yavik Dayaram · Thi My Linh Huynh · John Anthony Hosenilla Naui

---

## Slide 2 — Agenda

- Motivation — who uses StudySwap and why
- High-level user requirements — needs from the user’s view
- Software architecture — three-tier hybrid stack
- Packages & libraries — Node.js, Cordova, vendored UI
- Test results (preliminary) — screenshots / flows (#6 follow-up)
- Vulnerability analysis (preliminary) — identify & report only
- Live demo (device / emulator / browser)

---

## Slide 3 — Motivation

- Who: CQU students (buyers & sellers) needing cheap campus-local deals
- Why: textbooks, furniture, electronics turn over every term / move
- Gap: Gumtree / Facebook Marketplace are general — weak student trust & campus context
- Gap: StudentVIP-style sites are not focused on second-hand campus pickup
- StudySwap: student-oriented accounts, campus field, simple meetup-friendly listings
- Trend: hybrid mobile + cloud API; camera for listing photos; online API (Render)

---

## Slide 4 — High-level user requirements

- Account: sign up, log in, log out as a CQU student member
- Browse: see active listings; filter by category; open full detail
- Sell: create a listing with title, description, price, category, photo
- Manage: edit own listing, mark sold, delete; see my listings on profile
- HTTP coverage: GET / POST / PUT / DELETE across real user flows
- Out of scope (v1): in-app chat, payments, ratings

---

## Slide 5 — Software architecture

Three tiers:

1. **Client — Cordova hybrid** — jQuery Mobile + HTML/CSS/JS; auth, browse, form, profile; camera plugin  
2. **Server — Express (Render)** — HTTPS / platform TLS; CORS; Passport local + JWT; user & listing routers  
3. **Data — MongoDB Atlas** — User & Listing documents; Mongoose; secrets via env

Flow: Client ──HTTPS JSON + JWT──▶ Server ──Mongoose──▶ Atlas

---

## Slide 6 — Architecture — key components

- Client: shared `api.js` (Bearer token in `localStorage`), jQM pages in `components/`
- Auth API: `POST /users/signup | login | logout` · `GET /users/me`
- Listings API: `GET/POST/PUT/DELETE /listings` (+ owner checks on mutate)
- Middleware: CORS, Passport JWT authenticate, central JSON error handler
- Deploy path: Atlas for data · Render for API · Cordova for Android demo

---

## Slide 7 — Test results (preliminary)

Screenshot placeholders (issue #6):

1. Sign up / Login  
2. Browse listings  
3. Create listing  
4. Edit / Sold / Delete  
5. Profile / My listings  
6. Cordova device (optional)

---

## Slide 8 — How we tested

- Backend: Vitest + Supertest — user router & listing CRUD (CI on every PR)
- Manual UI: browser against Docker Compose API (`localhost:3100`)
- Auth: signup validation, login failure message, logout clears token
- Listings: create → appear in browse; edit/sold/delete as owner only
- Cordova: camera plugin wired; file-picker fallback in browser
- Next: drop screenshots into `docs/slides/` or `docs/testing/` (#6)

---

## Slide 9 — Vulnerability analysis (preliminary)

Scope: Express API + jQuery Mobile / Cordova client — **report only**, fixes not required.

- **V-01 (High):** JWT in `localStorage` → XSS can steal the 7-day session token
- **V-02 / V-03 (Medium):** Open CORS + no login rate limit → demo-friendly, abuse-prone
- **V-04 / V-05 (Medium):** Self-signed HTTPS in lab; listing search uses unescaped `$regex`
- **V-06 (Low):** Logout is client discard only — stolen JWT valid until expiry
- **Already mitigated:** bcrypt passwords, env secrets, owner checks, FE HTML escaping

Full table: `docs/vulnerability-analysis.md`

---

## Slide 10 — Packages & libraries

**Server (npm):** express, mongoose, passport (+ local/JWT), jsonwebtoken, bcrypt, cors, dotenv · Dev: vitest, supertest, nodemon, oxlint/oxfmt  

**Cordova (npm):** cordova CLI, cordova-android, cordova-plugin-camera  

**Client (vendored):** jQuery 2.2.4, jQuery Mobile 1.4.5 under `www/lib/`  

Full inventory: `docs/packages.md`

---

## Slide 11 — Demo & questions

Live demo → then questions from the tutor.  
Each member should be ready to explain their owned code.

Repo: `client/` · `server/` · `docs/`  
Sources: user-stories, api-contract, packages, vulnerability-analysis
