/**
 * One-shot generator for StudySwap Week 12 presentation deck.
 * Run from repo root (or this folder):
 *   node docs/slides/generate-pptx.mjs
 * Requires pptxgenjs available via NODE_PATH or local install.
 */
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "StudySwap-Week12-Presentation.pptx");

// Resolve pptxgenjs from NODE_PATH / nearby installs (generator deps are not committed).
function loadPptxGen() {
  const candidates = [
    process.env.PPTXGEN_PATH,
    "/tmp/node_modules/pptxgenjs",
    join(__dirname, "node_modules/pptxgenjs"),
    "pptxgenjs",
  ].filter(Boolean);
  for (const id of candidates) {
    try {
      if (id !== "pptxgenjs" && !existsSync(id) && !existsSync(`${id}.js`)) {
        continue;
      }
      return require(id);
    } catch {
      /* try next */
    }
  }
  throw new Error(
    "pptxgenjs not found. Install once: npm install pptxgenjs --prefix /tmp && node docs/slides/generate-pptx.mjs",
  );
}

const PptxGenJS = loadPptxGen();

const C = {
  bg: "1E1E2E",
  card: "181825",
  text: "CDD6F4",
  muted: "A6ADC8",
  accent: "94E2D5",
  accent2: "89B4FA",
  peach: "FAB387",
  green: "A6E3A1",
  red: "F38BA8",
  yellow: "F9E2AF",
  white: "FFFFFF",
};

const pptx = new PptxGenJS();
pptx.defineLayout({ name: "WIDESCREEN", width: 13.333, height: 7.5 });
pptx.layout = "WIDESCREEN";
pptx.author = "Group D — StudySwap";
pptx.title = "StudySwap — Week 12 Presentation";
pptx.subject = "COIT20269 Assignment 2 Part B";

function addBg(slide) {
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: "100%",
    h: "100%",
    fill: { color: C.bg },
  });
}

function addFooter(slide, page, total = 10) {
  slide.addText("StudySwap · COIT20269 · Group D", {
    x: 0.5,
    y: 7.05,
    w: 10,
    h: 0.3,
    fontSize: 11,
    color: C.muted,
    fontFace: "Calibri",
  });
  slide.addText(`${page} / ${total}`, {
    x: 11.5,
    y: 7.05,
    w: 1.3,
    h: 0.3,
    fontSize: 11,
    color: C.muted,
    fontFace: "Calibri",
    align: "right",
  });
}

function titleBar(slide, title, subtitle) {
  slide.addText(title, {
    x: 0.6,
    y: 0.35,
    w: 12,
    h: 0.55,
    fontSize: 28,
    bold: true,
    color: C.text,
    fontFace: "Calibri",
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.6,
      y: 0.9,
      w: 12,
      h: 0.35,
      fontSize: 14,
      color: C.accent,
      fontFace: "Calibri",
    });
  }
}

function bullets(slide, items, opts = {}) {
  const {
    x = 0.7,
    y = 1.5,
    w = 11.8,
    fontSize = 18,
    color = C.text,
  } = opts;
  slide.addText(
    items.map((t) => ({
      text: t,
      options: { bullet: true, breakLine: true },
    })),
    {
      x,
      y,
      w,
      h: opts.h || 5,
      fontSize,
      color,
      fontFace: "Calibri",
      paraSpaceAfter: 10,
      valign: "top",
    },
  );
}

// ----- 1. Title -----
{
  const s = pptx.addSlide();
  addBg(s);
  s.addShape(pptx.shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: 0.25,
    h: "100%",
    fill: { color: C.accent },
  });
  s.addText("StudySwap", {
    x: 0.8,
    y: 2.1,
    w: 11.5,
    h: 1,
    fontSize: 54,
    bold: true,
    color: C.accent,
    fontFace: "Calibri",
  });
  s.addText("Campus second-hand marketplace for CQU students", {
    x: 0.8,
    y: 3.15,
    w: 11.5,
    h: 0.5,
    fontSize: 22,
    color: C.text,
    fontFace: "Calibri",
  });
  s.addText(
    "COIT20269 Assignment 2 · Week 12 Presentation · Group D\nYavik Dayaram · Thi My Linh Huynh · John Anthony Hosenilla Naui",
    {
      x: 0.8,
      y: 4.2,
      w: 11.5,
      h: 1,
      fontSize: 16,
      color: C.muted,
      fontFace: "Calibri",
    },
  );
  s.addNotes(
    "Introduce the team and app name. One sentence: StudySwap helps CQU students buy and sell textbooks, furniture, and electronics with trusted campus pickup.",
  );
}

// ----- 2. Agenda -----
{
  const s = pptx.addSlide();
  addBg(s);
  titleBar(s, "Agenda", "Part B deliverables");
  bullets(s, [
    "Motivation — who uses StudySwap and why",
    "High-level user requirements — needs from the user’s view",
    "Software architecture — three-tier hybrid stack",
    "Test results (preliminary) — screenshots / flows (#6 follow-up)",
    "Vulnerability analysis (preliminary) — identify & report only",
    "Live demo (device / emulator / browser)",
  ]);
  addFooter(s, 2);
  s.addNotes(
    "Keep this short. Flag that test screenshots will be filled from issue #6 if placeholders remain.",
  );
}

// ----- 3. Motivation -----
{
  const s = pptx.addSlide();
  addBg(s);
  titleBar(s, "Motivation", "Target audience & market gap");
  bullets(s, [
    "Who: CQU students (buyers & sellers) needing cheap campus-local deals",
    "Why: textbooks, furniture, electronics turn over every term / move",
    "Gap: Gumtree / Facebook Marketplace are general — weak student trust & campus context",
    "Gap: StudentVIP-style sites are not focused on second-hand campus pickup",
    "StudySwap: student-oriented accounts, campus field, simple meetup-friendly listings",
    "Trend: hybrid mobile + cloud API; camera for listing photos; online API (Render)",
  ]);
  addFooter(s, 3);
  s.addNotes(
    "Expand with 1–2 competitor examples verbally. Emphasize trusted campus meetup, not payments or chat (out of scope v1).",
  );
}

// ----- 4. User requirements -----
{
  const s = pptx.addSlide();
  addBg(s);
  titleBar(s, "High-level user requirements", "From user stories (docs/user-stories.md)");
  bullets(
    s,
    [
      "Account: sign up, log in, log out as a CQU student member",
      "Browse: see active listings; filter by category; open full detail",
      "Sell: create a listing with title, description, price, category, photo",
      "Manage: edit own listing, mark sold, delete; see my listings on profile",
      "HTTP coverage: GET / POST / PUT / DELETE across real user flows",
      "Out of scope (v1): in-app chat, payments, ratings",
    ],
    { y: 1.45 },
  );
  addFooter(s, 4);
  s.addNotes(
    "Map verbally to personas Seller/Buyer. Traceability: auth POST; browse GET; create POST; edit/sold PUT; delete DELETE.",
  );
}

// ----- 5. Architecture -----
{
  const s = pptx.addSlide();
  addBg(s);
  titleBar(s, "Software architecture", "Three-tier mobile hybrid app");

  const boxes = [
    {
      y: 1.5,
      title: "Client — Cordova hybrid",
      body: "jQuery Mobile + HTML/CSS/JS\nAuth, browse, form, profile\nCamera plugin for photos",
      color: C.accent2,
    },
    {
      y: 3.35,
      title: "Server — Express (Render)",
      body: "HTTPS / platform TLS · CORS\nPassport local + JWT\nRouters: users, listings",
      color: C.accent,
    },
    {
      y: 5.2,
      title: "Data — MongoDB Atlas",
      body: "User & Listing documents\nMongoose models · env secrets",
      color: C.peach,
    },
  ];

  boxes.forEach((b, i) => {
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.7,
      y: b.y,
      w: 12,
      h: 1.55,
      fill: { color: C.card },
      rectRadius: 0.1,
    });
    s.addShape(pptx.shapes.RECTANGLE, {
      x: 0.7,
      y: b.y,
      w: 0.18,
      h: 1.55,
      fill: { color: b.color },
    });
    s.addText(b.title, {
      x: 1.1,
      y: b.y + 0.15,
      w: 11,
      h: 0.4,
      fontSize: 18,
      bold: true,
      color: b.color,
      fontFace: "Calibri",
    });
    s.addText(b.body, {
      x: 1.1,
      y: b.y + 0.55,
      w: 11,
      h: 0.85,
      fontSize: 14,
      color: C.text,
      fontFace: "Calibri",
    });
    if (i < boxes.length - 1) {
      s.addText("▼ HTTPS JSON + JWT", {
        x: 5.2,
        y: b.y + 1.5,
        w: 3,
        h: 0.3,
        fontSize: 11,
        color: C.muted,
        fontFace: "Calibri",
        align: "center",
      });
    }
  });

  addFooter(s, 5);
  s.addNotes(
    "Walk top-down. Mention env-based MONGODB_URI / JWT_SECRET — no hardcoded credentials. Cordova wraps client/www.",
  );
}

// ----- 6. Architecture detail -----
{
  const s = pptx.addSlide();
  addBg(s);
  titleBar(s, "Architecture — key components", "What each tier owns");
  bullets(s, [
    "Client: shared api.js (Bearer token in localStorage), jQM pages in components/",
    "Auth API: POST /users/signup | login | logout · GET /users/me",
    "Listings API: GET/POST/PUT/DELETE /listings (+ owner checks on mutate)",
    "Middleware: CORS, Passport JWT authenticate, central JSON error handler",
    "Deploy path: Atlas for data · Render for API · Cordova for Android demo",
  ]);
  addFooter(s, 6);
  s.addNotes(
    "Optional deep-dive if tutor asks. Point to docs/api-contract.md.",
  );
}

// ----- 7. Test results -----
{
  const s = pptx.addSlide();
  addBg(s);
  titleBar(
    s,
    "Test results (preliminary)",
    "Screenshots — capture under issue #6",
  );

  const cells = [
    { label: "1. Sign up / Login", hint: "Auth screens" },
    { label: "2. Browse listings", hint: "GET list + filters" },
    { label: "3. Create listing", hint: "POST + camera/file" },
    { label: "4. Edit / Sold / Delete", hint: "PUT + DELETE" },
    { label: "5. Profile / My listings", hint: "GET me + owned" },
    { label: "6. Cordova device (opt.)", hint: "Camera on Android" },
  ];

  cells.forEach((c, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.6 + col * 4.15;
    const y = 1.5 + row * 2.5;
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x,
      y,
      w: 3.9,
      h: 2.2,
      fill: { color: C.card },
      rectRadius: 0.08,
      line: { color: "313244", width: 1.5, dashType: "dash" },
    });
    s.addText(c.label, {
      x: x + 0.2,
      y: y + 0.7,
      w: 3.5,
      h: 0.4,
      fontSize: 16,
      bold: true,
      color: C.text,
      fontFace: "Calibri",
      align: "center",
    });
    s.addText(c.hint + "\n[screenshot placeholder]", {
      x: x + 0.2,
      y: y + 1.15,
      w: 3.5,
      h: 0.7,
      fontSize: 12,
      color: C.muted,
      fontFace: "Calibri",
      align: "center",
    });
  });

  addFooter(s, 7);
  s.addNotes(
    "Until #6 lands: say we verified flows manually / with Vitest API tests; UI screenshots TBD. After capture, replace placeholders in this slide or add image slides.",
  );
}

// ----- 8. Testing notes -----
{
  const s = pptx.addSlide();
  addBg(s);
  titleBar(s, "How we tested", "Automated + manual (preliminary)");
  bullets(s, [
    "Backend: Vitest + Supertest — user router & listing CRUD (CI on every PR)",
    "Manual UI: browser against Docker Compose API (localhost:3100)",
    "Auth: signup validation, login failure message, logout clears token",
    "Listings: create → appear in browse; edit/sold/delete as owner only",
    "Cordova: camera plugin wired; file-picker fallback in browser",
    "Next: drop screenshots into docs/slides/ or docs/testing/ (#6)",
  ]);
  addFooter(s, 8);
  s.addNotes(
    "Mention CI workflow. Be honest that device screenshots may still be pending.",
  );
}

// ----- 9. Vulnerabilities -----
{
  const s = pptx.addSlide();
  addBg(s);
  titleBar(
    s,
    "Vulnerability analysis (preliminary)",
    "Report only — fixes not required (assignment)",
  );
  bullets(
    s,
    [
      "Scope: Express API + jQuery Mobile / Cordova client (code review)",
      "V-01 (High): JWT in localStorage → XSS can steal the 7-day session token",
      "V-02 / V-03 (Medium): Open CORS + no login rate limit → demo-friendly, abuse-prone",
      "V-04 / V-05 (Medium): Self-signed HTTPS in lab; listing search uses unescaped $regex",
      "V-06 (Low): Logout is client discard only — stolen JWT valid until expiry",
      "Already mitigated: bcrypt passwords, env secrets, owner checks, FE HTML escaping",
    ],
    { fontSize: 16, y: 1.4 },
  );
  addFooter(s, 9);
  s.addNotes(
    "Stress: identify & report only. Full table in docs/vulnerability-analysis.md. Do not claim we fixed these unless a later issue did.",
  );
}

// ----- 10. Closing -----
{
  const s = pptx.addSlide();
  addBg(s);
  s.addShape(pptx.shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: 0.25,
    h: "100%",
    fill: { color: C.accent },
  });
  s.addText("Demo & questions", {
    x: 0.8,
    y: 2.3,
    w: 11.5,
    h: 0.7,
    fontSize: 40,
    bold: true,
    color: C.accent,
    fontFace: "Calibri",
  });
  s.addText(
    "Live demo → then questions from the tutor\nEach member should be ready to explain their owned code.",
    {
      x: 0.8,
      y: 3.2,
      w: 11.5,
      h: 1.2,
      fontSize: 18,
      color: C.text,
      fontFace: "Calibri",
    },
  );
  s.addText(
    "Repo: client/ · server/ · docs/   |   Sources: user-stories, api-contract, vulnerability-analysis",
    {
      x: 0.8,
      y: 5.2,
      w: 11.5,
      h: 0.5,
      fontSize: 14,
      color: C.muted,
      fontFace: "Calibri",
    },
  );
  addFooter(s, 10);
  s.addNotes(
    "Handoff to demo. John: lead/docs/BE-FE; Yavik: Atlas/Render; Linh: app shell/theme. Reminder: understanding is assessed individually.",
  );
}

await pptx.writeFile({ fileName: outPath });
console.log("Wrote", outPath);
