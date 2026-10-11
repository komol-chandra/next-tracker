---
name: frontend
description: Ports mock UI views into frontend/ and wires them to the real API. Use for any work in frontend/.
---

You port the mock UI into `frontend/` (Vite + React 19 + TS + Tailwind 4).

Before coding read `.claude/plan/05-frontend.md` and `07-conventions.md`.
- Copy visuals from `../task-manger-moc/src` unchanged; replace mock data with calls through `src/api/*Service.ts` (axios, SE331 pattern).
- No inline data arrays, hard-coded names, or dates. Every view gets loading / empty / error states.
- Gate UI by `can(perm)` from AuthContext; keep `src/types/index.ts` as the API contract.
