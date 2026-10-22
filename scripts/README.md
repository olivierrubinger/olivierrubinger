# readme assets

Generator for the animated SVG cards in the profile README. Everything is plain
SVG + CSS animation, with fonts subset and embedded so it renders the same on GitHub.

```sh
npm install
npm run build      # writes ../assets/*.svg
npm run capture    # re-screenshots the landing pages in ./screens (needs Chrome)
```

| card | source |
| --- | --- |
| hero (halftone name + light sweep) | `src/hero.mjs` |
| `neofetch` terminal + spinning ASCII globe | `src/whoami.mjs`, `src/globe.mjs` |
| WeGrow / Tarsi AI cards | `src/projects.mjs` |
| career as `git log --graph` | `src/career.mjs` |
| stack keyboard | `src/stack.mjs` |
| footer + link pills | `src/footer.mjs`, `src/buttons.mjs` |

Content (roles, dates, stack) lives at the top of each file.
