# Stage 09 Tech Stack

## Runtime

- Node.js
- TypeScript
- Node.js built-in `node:test`

## UI

- Local Node server
- Vanilla HTML / JavaScript
- No React / Next / Vite / Vue / Svelte by default

## Config / data

- JSON configs under `configs/`
- Fixtures under `fixtures/`
- PM checklists under `pm_checklists/`
- Codex stage prompts under `prompts/`

## AI

- Mock provider by default
- OpenAI provider behind environment flag
- No API key in browser
- No real `.env` committed

## BaZi layer

- Adapter-based BaZi derived profile design
- External BaZi/lunar libraries wrapped behind internal interface
- Rectification and ranking remain deterministic

## Evaluation

- A/B/C/D benchmark modes
- Holdout targets
- Leakage guard
- Deterministic/mock judge by default

## Privacy

- Local-first session model
- Export/import
- Redaction
- Hide/delete context facts
