# Pages — web version

A single-page React app (loaded via CDN, JSX compiled in-browser with
Babel standalone — no build step) that reimplements the reading tracker:
shelves by status, book detail with progress/rating/notes, a stats screen
with a reading-goal ring and streak, and a Premium screen (informational
only — no billing wired up on web).

## Where this actually runs

`index.html` is written specifically for the **Claude Artifacts**
runtime: it stores data through `window.claude.use("db")`, a database
capability that only exists when the page is opened inside Claude
(claude.ai/code/artifact/...). Opened anywhere else, `window.claude` is
undefined, so the UI renders but nothing persists — no books, no notes,
no saved goal.

Live version: https://claude.ai/code/artifact/1cea9116-af41-4d76-aafd-ce0f3ec47ee8

## If you want a portable version instead

To deploy this to your own domain (Vercel, Netlify, GitHub Pages, etc.)
it needs a real persistence layer, since there's no `window.claude` to
lean on outside Claude. The two realistic options:

- **localStorage-only**: simplest — keeps everything on that one
  browser/device, no backend to run. Good for a personal single-device
  tool, same tradeoff the Flutter/mobile version has today.
- **A real backend** (e.g. Firebase, Supabase, or a small API + Postgres):
  needed for the library to sync across devices or browsers. More setup,
  but matches what "install it on your phone and use it everywhere"
  usually means.

Ask for either and it can be adapted from this file — the UI and
component structure carry over, only the data layer changes.

## Relationship to the Flutter app

`reading_tracker/` (the Flutter/Dart app targeting Android) is untouched
by this — both versions currently exist side by side. This directory
does not build or deploy anything on its own; `index.html` is meant to be
published as a Claude Artifact (or adapted per above for standalone
hosting).
