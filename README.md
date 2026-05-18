# Multi-Agent Explorer

Interactive UI for exploring and inspecting multi-agent system runs. Built with Next.js 16 + React 19.

## Stack

- Next.js 16 (App Router) + React 19
- TypeScript, Tailwind
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

## Deploying to Vercel

1. Push this repo to GitHub.
2. In Vercel, **Add New Project** and import the repo.
3. Framework preset: **Next.js** (auto-detected). Root directory: leave as repo root.
4. Click **Deploy**. No env vars required.

## Layout

```
app/         — Next.js App Router pages
components/  — UI components
data/        — Sample run data
dsl/         — Run DSL (builder + examples)
hooks/       — Custom React hooks
types/       — Shared TypeScript types
e2e/         — Playwright specs
public/      — Static assets
_handoff/    — Original Claude Design handoff (HTML prototype + chat transcripts)
```

The `_handoff/` directory preserves the source-of-truth design materials. It is not used at runtime and can be ignored by deployments.
