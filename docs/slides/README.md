# StudySwap — Week 12 Presentation (Part B)

**Course:** COIT20269 Assignment 2  
**Group:** D — Yavik Dayaram · Thi My Linh Huynh · John Anthony Hosenilla Naui  
**Deck file:** [StudySwap-Week12-Presentation.pptx](./StudySwap-Week12-Presentation.pptx)

This folder holds the Week 12 PowerPoint deck (#5). Content is drawn from existing project docs so the slides stay aligned with what we built.

| Spec section | Slide(s) | Source |
|---|---|---|
| Motivation | 3 | [README.md](../../README.md), [user-stories.md](../user-stories.md) |
| High-level user requirements | 4 | [user-stories.md](../user-stories.md) |
| Software architecture | 5–6 | README architecture, [api-contract.md](../api-contract.md) |
| Test results (preliminary) | 7–8 | Placeholders for #6 screenshots; Vitest/CI + manual flows |
| Vulnerability analysis | 9 | [vulnerability-analysis.md](../vulnerability-analysis.md) |
| Packages & libraries | 10 | [packages.md](../packages.md) |

## Regenerating the `.pptx`

```bash
# from repo root, with pptxgenjs available (e.g. npm install pptxgenjs in a temp dir)
NODE_PATH=/path/to/node_modules node docs/slides/generate-pptx.mjs
```

Do not commit `node_modules` for the generator. The committed artefact is the `.pptx` plus this markdown outline.

## Screenshot follow-up (#6)

Slide 7 has dashed placeholders for:

1. Sign up / Login  
2. Browse listings  
3. Create listing  
4. Edit / Sold / Delete  
5. Profile / My listings  
6. Cordova device (optional)

Drop PNGs into `docs/slides/screenshots/` (or `docs/testing/`) and either re-run the generator with image paths or paste into PowerPoint manually.

## Speaker notes (quick)

See also notes embedded in the `.pptx` (View → Notes).

### 1 — Title
Introduce StudySwap in one sentence: campus second-hand marketplace for CQU students.

### 2 — Agenda
Five Part B sections + live demo. Flag that UI screenshots may still be pending (#6).

### 3 — Motivation
Buyers/sellers on campus; gap vs Gumtree/Facebook/StudentVIP; no payments/chat in v1.

### 4 — Requirements
Auth, browse/filter/detail, create/edit/sold/delete, profile. GET/POST/PUT/DELETE covered.

### 5–6 — Architecture
Cordova client → Express on Render (JWT/CORS/routers) → MongoDB Atlas. Env secrets only.

### 7–8 — Tests
API tests in CI; manual Compose/browser; placeholders until screenshots land.

### 9 — Vulnerabilities
Report only. V-01 localStorage JWT; open CORS / no rate limit; self-signed lab TLS; unescaped `$regex`; non-revoking logout. Mitigations: bcrypt, env secrets, owner checks, FE escaping.

### 10 — Packages & libraries
Server npm (Express, Mongoose, Passport, JWT, bcrypt, cors, dotenv + Vitest tooling). Cordova (android + camera plugin). Vendored jQuery / jQuery Mobile. Full list: `docs/packages.md`.

### 11 — Demo & questions
Each member must explain their owned code (tutor may quiz individuals).
