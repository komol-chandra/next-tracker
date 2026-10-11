# Workforce & Task Manager OS — agent instructions (opencode)

This file mirrors `CLAUDE.md` for opencode. The full plan is in `.claude/plan/` and is loaded via `opencode.json`
`instructions`. Read `00-overview.md`, `07-conventions.md`, then **`08-current-scope.md`** (current sprint S0–S8; overrides 02/03/06).

- UI reference (read-only): `../task-manger-moc/src`. Structure reference (read-only): `../SE331-Design-Capstone-Project-main`.
- Backend: `backend/` — Express 5, CommonJS, Mongoose; route → controller → `*Model.js` → schema (SE331 layering).
- Frontend: `frontend/` — Vite, React 19, TS, Tailwind 4, axios, react-router-dom.
- DB: local MongoDB `mongodb://127.0.0.1:27017/workforce_os`; seed with `cd backend && npm run seed:fresh`.
- Node 22 (`nvm use`). Every query tenant-scoped; tenant from JWT user only.
- Update `PROGRESS.md` and tick boxes in `.claude/plan/06-phases.md` when a phase gate passes.
- Commands: `/phase S<n>`, `/status`, `/seed-check`. Sub-agents: `@backend`, `@frontend`.
