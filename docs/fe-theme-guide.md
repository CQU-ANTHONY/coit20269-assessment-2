# Issue #14 — jQuery Mobile theme polish (Linh)

Branch: `feat/14-theme-polish`  
Worktree: `.worktrees/feat-14-theme-polish`

## Already done (do not redo)

PR #39 landed the shell structure on `dev`:

- Six frozen page IDs: `#page-login`, `#page-signup`, `#page-browse`, `#page-detail`, `#page-form`, `#page-profile`
- Vendored jQuery 2.2.4 + jQuery Mobile 1.4.5 in `client/www/lib/`
- Shared nav popup + toast popup
- Structural CSS only in `client/www/css/studyswap.css`

## Your job

Theme / aesthetics polish only:

1. Pick a cohesive jQM `data-theme` (or custom swatch) for headers, buttons, listviews
2. Improve spacing, typography, and brand feel in `studyswap.css`
3. Optional: page transitions via `mobileinit` (keep Cordova-safe)
4. Make login → browse → detail → form feel like one product

## Hard rules

- Do **not** rename or remove frozen page IDs
- Do **not** modify `client/www/js/api.js`
- Prefer CSS + `data-theme` / `data-icon` attributes over rewriting markup owned by #15–#17
- Pull latest `dev` often — #15/#16/#17 will fill page bodies while you theme

## Theme checklist

- [x] Choose header/button data-theme (or custom swatch) — pages `data-theme="a"`, headers `data-theme="b"` (recolored to brand green)
- [x] Brand colour tokens (`--ss-*` variables) — green campus brand + warm accent
- [x] Auth / browse / detail / form spacing polish — filters, empty states, toast, nav, forms
- [x] Do not rename frozen page IDs; do not edit `js/api.js`

## How to work

```bash
cd .worktrees/feat-14-theme-polish
# edit client/www/css/studyswap.css (+ light index.html theme attrs if needed)
git add -A && git commit -m "feat: StudySwap jQuery Mobile theme polish (#14)"
git push -u origin HEAD
# open PR targeting dev, request review from @nauijohn
```
