# Multi-Agent Wiki

An engineering knowledge base for **multi-agent interaction patterns, workflow orchestration, classification, and implementation**. 30 patterns across 7 categories (control, workflow, information flow, decision, environment, protocols, specialized), a dedicated Dynamic Workflows section, 6 implementation guides, and a glossary — every pattern page with mermaid topology, when-to-use guidance, risks, pseudocode, and trace events. Each pattern also embeds an animated live visualization.

Built with Next.js 16 (App Router) + React 19, shadcn-style design tokens, Geist fonts, framer-motion, react-markdown, and mermaid.

## Stack

- Next.js 16 (App Router) + React 19, TypeScript
- Tailwind v4 with shadcn-style HSL/OKLCH tokens, light + dark mode (`next-themes`)
- Geist Sans + Geist Mono
- `react-markdown` + `remark-gfm` + `rehype-highlight`
- `mermaid` for diagrams (client-rendered, theme-aware)
- `framer-motion` for sidebar pill, page transitions, caption swaps
- Playwright for E2E

## Local development

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Scripts

| Command            | Purpose                                  |
| ------------------ | ---------------------------------------- |
| `npm run dev`      | Start the dev server                     |
| `npm run build`    | Production build                         |
| `npm start`        | Run the production build                 |
| `npm run lint`     | ESLint                                   |
| `npm run test:e2e` | Playwright E2E tests                     |
| `npm run test:e2e:ui` | Playwright in interactive UI mode     |

## Layout

```
app/
  page.tsx              — wiki home (renders content/wiki/index.md)
  [...slug]/page.tsx    — catch-all that renders any wiki page; embeds the live
                          visualization on pattern pages that have a matching animation
  llms.txt/route.ts     — agent-friendly index of the wiki
  llms-full.txt/route.ts — every wiki page concatenated as plain markdown
  icon.svg              — brand mark, auto-served as favicon
components/
  wiki/                 — markdown renderer, mermaid renderer, sidebar, layout shell
  ui/                   — shadcn primitives (Button, Card, Badge, Separator)
  DiagramCanvas, Controls — animated pattern visualization
  top-nav.tsx, theme-toggle.tsx, logo.tsx
content/wiki/           — all markdown source (single source of truth)
  index.md, taxonomy.md, decision-matrix.md
  patterns/             — 30 pattern docs
  workflows/            — Dynamic workflow deep dives, orchestration primitives, governance, case studies
  implementation/       — 6 implementation guides
  reference/            — glossary, references
data/patterns.ts        — animated pattern data (drives 13 of the wiki patterns)
hooks/useAnimationEngine.ts
lib/
  wiki.ts               — read + parse markdown
  wiki-nav.ts           — sidebar navigation tree
  pattern-map.ts        — animation id ↔ wiki slug
  utils.ts              — `cn` helper
```

## Agent-friendly endpoints

| URL              | Purpose                                                                                  |
| ---------------- | ---------------------------------------------------------------------------------------- |
| `/llms.txt`      | Overview + one-line summary of every page ([llms.txt spec](https://llmstxt.org/))         |
| `/llms-full.txt` | Every wiki page concatenated as plain markdown                                            |

Both are generated at build time from `content/wiki/` via route handlers (`dynamic = 'force-static'`). The HTML `<head>` includes `<link rel="alternate" type="text/markdown" href="/llms.txt">` for discovery.

## Adding a new pattern page

1. Drop a markdown file under `content/wiki/patterns/<slug>.md` following the template in [`content/wiki/implementation/pattern-page-template.md`](content/wiki/implementation/pattern-page-template.md).
2. Add the slug to `PATTERN_CATEGORIES` in `lib/pattern-map.ts` under the appropriate category — this is what drives the sidebar grouping in `lib/wiki-nav.ts`.
3. (Optional) If the pattern has an animated counterpart in `data/patterns.ts` or `data/patterns-extra.ts`, add the mapping to `PATTERN_TO_WIKI` in `lib/pattern-map.ts` and the live visualization widget will embed automatically.
4. (Optional) Add a Chinese version under `content/wiki-zh/patterns/<slug>.md`. At minimum a short Chinese summary keeps the Chinese sidebar from breaking.

## Deploying to Vercel

1. Push to GitHub.
2. In Vercel, **Add New Project** and import the repo.
3. Framework preset: **Next.js** (auto-detected). Root directory: leave as repo root.
4. **Deploy.** No env vars required.
