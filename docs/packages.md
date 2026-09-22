# Packages & libraries used — StudySwap

Inventory of **Node.js packages**, **Cordova plugins/platforms**, and **vendored client libraries** used in the project. Versions match `server/package.json` and `client/package.json` (and vendored files under `client/www/lib/`). Update this file when dependencies change.

Runtime: **Node.js 24** · package manager: **npm only** (≥ 11).

---

## Server (`server/`) — runtime dependencies

| Package | Role in StudySwap |
|---|---|
| **express** | HTTP API framework; mounts routers, JSON body parsing |
| **mongoose** | MongoDB ODM (User & Listing models, Atlas connection) |
| **passport** | Auth framework |
| **passport-local** | Email/password login strategy |
| **passport-jwt** | Bearer JWT strategy for protected routes |
| **jsonwebtoken** | Issue JWTs on signup/login |
| **bcrypt** | Password hashing (never store plain passwords) |
| **cors** | Cross-origin access for browser + Cordova `file://` demos |
| **dotenv** | Load `MONGODB_URI`, `JWT_SECRET`, etc. from `.env` |

## Server — development / tooling

| Package | Role |
|---|---|
| **nodemon** | Hot-reload API in local `npm run dev` |
| **vitest** | Unit/integration test runner |
| **supertest** | HTTP assertions against Express app in tests |
| **oxlint** / **oxfmt** | Lint and format JavaScript |
| **selfsigned** | Generate local HTTPS certs (`npm run generate-cert`) |

---

## Client (`client/`) — Cordova / npm

| Package | Role in StudySwap |
|---|---|
| **cordova** (dev) | CLI to add platforms/plugins and build/run Android |
| **cordova-android** | Android platform for the hybrid app |
| **cordova-plugin-camera** | Capture listing photos on device/emulator |
| **oxlint** / **oxfmt** (dev) | Lint/format client `www/js` |

Declared Cordova plugin in `client/package.json` → `cordova.plugins.cordova-plugin-camera`.

## Client — vendored UI libraries (not npm)

Shipped under `client/www/lib/` (no build/transpile step for day-to-day UI work):

| Library | Version (path) | Role |
|---|---|---|
| **jQuery** | 2.2.4 (`lib/jquery-2.2.4.min.js`) | DOM / AJAX helper used by app scripts |
| **jQuery Mobile** | 1.4.5 (`lib/jquery.mobile-1.4.5.min.js` + CSS) | Multi-page mobile UI shell |

`cordova.js` is injected at Cordova build/run time and is **gitignored** (not committed).

---

## Why these packages (assignment alignment)

The spec expects extra value from **Cordova plug-ins** and **Node.js packages** beyond a bare Express + HTML shell. StudySwap uses:

- **Auth stack:** Passport + bcrypt + JWT (secure session for marketplace actions)
- **Data:** Mongoose → MongoDB Atlas
- **Hybrid device feature:** `cordova-plugin-camera` for listing photos
- **Quality:** Vitest/Supertest + oxlint/oxfmt + CI

---

## Quick reference — install

```bash
# API
cd server && npm install

# Cordova client wrapper
cd client && npm install
```

See also [README.md](../README.md), [cordova-setup.md](cordova-setup.md), and the Week 12 deck slide “Packages & libraries” in [slides/](slides/).
