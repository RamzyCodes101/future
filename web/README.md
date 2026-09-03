# Pages — web version

A single-page React app (loaded via CDN, JSX compiled in-browser with
Babel standalone — no build step, no `npm install`) that reimplements
the reading tracker: shelves by status, book detail with progress/
rating/notes, and a stats screen with a reading-goal ring and streak.

## Data storage

Everything is saved to the browser's `localStorage` (see the "local
storage-backed store" block near the top of the `<script type="text/
babel">` tag in `index.html`). That means:

- It's fully self-contained — no backend, no signup, works the moment
  the page loads.
- Data lives on **one browser, one device**. Clearing site data, using
  a private window, or opening the site on a different device all
  start from an empty library. There's no sync.
- The "Go Premium" screen is informational only — no billing is wired
  up on web, so notes stay unlimited here (the Play Store version's
  3-note free-tier cap doesn't apply).

If you outgrow single-device storage later, swapping in a real backend
(Firebase, Supabase, or a small API + Postgres) is a data-layer change
only — the UI and components don't need to change.

## Deploying to Vercel

This directory is a plain static site (one `index.html`, no build
step), so Vercel needs zero configuration:

1. Go to [vercel.com/new](https://vercel.com/new) and import the
   `RamzyCodes101/future` GitHub repo (connect GitHub first if you
   haven't).
2. When it asks for the **root directory**, set it to `web`.
3. Framework preset: **Other** (or leave on auto-detect — there's no
   framework here, just static HTML).
4. Leave build command and output directory blank — nothing to build.
5. Deploy. Vercel gives you a `*.vercel.app` URL immediately, and every
   push to this branch (or whichever branch you connect) redeploys it
   automatically.

To use a custom domain afterward: Vercel project → Settings → Domains.

## Relationship to the other versions

- `reading_tracker/` — the Flutter/Dart app targeting Android (Play
  Store), untouched by this.
- This directory previously stored data via the Claude Artifacts
  platform's `db` capability (`window.claude`), which only works
  inside claude.ai. It's since been switched to `localStorage` so it
  runs anywhere, Vercel included — see git history if you need the
  Claude-Artifact-only version back.

All three share the same visual identity (palette, layout, copy) but
are otherwise independent — none of them read or write each other's
data.
