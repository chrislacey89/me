# Self-hosted fonts

## Switzer

- **Source:** https://www.fontshare.com/fonts/switzer
- **License:** Fontshare EULA (FFL) — free for personal and commercial web use per §01. Self-hosted `@font-face` embedding is not restricted under §02 (which targets legacy font-serving/replacement tech like EOT, Cufon, sIFR).
- **Files:**
  - `Switzer-Variable.woff2` — variable font covering weight 100–900 (roman)
  - `Switzer-Variable-Italic.woff2` — variable italic, 100–900

To update, re-download from Fontshare and replace the files in place. The variable woff2 is the only face needed; static weight files are not used.

## IBM Plex Mono and Source Serif 4

Delivered via npm (`@fontsource/ibm-plex-mono` and `@fontsource-variable/source-serif-4`) and imported from `src/styles/global.css`. No files live here.
