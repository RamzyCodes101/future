# Licensed typefaces go here

The site is designed for two commercial faces, neither of which is
distributed with this repository:

| File to add | Typeface | Used for |
|---|---|---|
| `display.woff2` | **PP Editorial New**, Regular | Every heading, the wordmark, prices |
| `sans.woff2` | **Suisse Intl**, Regular–Semibold (variable is ideal) | Navigation, labels, body copy |

## To install them

1. Licence the faces and export web formats (`.woff2` only — every browser
   that matters supports it, and the older formats double the payload).
2. Rename them to `display.woff2` and `sans.woff2` and put them in this folder.
3. Uncomment the `@font-face` block in `app/(site)/globals.css`.

That is all. `"Fashionova Display"` and `"Fashionova Sans"` are already first
in the font stacks, so the whole site switches over at once.

## Until then

The stacks fall through to the best high-contrast serif and grotesque actually
installed on the visitor's device — Didot or Bodoni 72 on Apple platforms,
Constantia or Cambria on Windows, Noto Serif on Android. The site looks
considered on all of them; it just is not yet *the* typeface.

## Free stand-ins, if the licence has to wait

- **Instrument Serif** — closest free match to the editorial display voice
- **Inter Tight** — a good stand-in for Suisse Intl

Self-host these the same way rather than loading them from Google Fonts: a
third-party font request is a render-blocking round trip to another origin,
which is exactly what you do not want on a Ghanaian mobile connection.

## One thing to check after installing

Set the `size-adjust` values in the `@font-face` block so the fallback's
metrics match the real face. Without it the page reflows the moment the font
lands, which is the layout shift visitors notice most.
