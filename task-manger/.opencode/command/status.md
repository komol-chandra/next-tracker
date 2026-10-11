---
description: Show plan progress, current phase, and environment health
---

Report build progress.

1. Read `PROGRESS.md` , `.claude/plan/08-current-scope.md`, and `.claude/plan/06-phases.md`.
2. For the current sprint step (`08-current-scope.md §6`) list done vs. remaining checkboxes.
3. Quick health checks (skip any that do not apply yet): `node -v`, Mongo reachable on 127.0.0.1:27017, `backend/` and `frontend/` install state, `curl -s localhost:5000/api/health`.
4. Output a short table: phase · status · next 3 tasks · blockers.
