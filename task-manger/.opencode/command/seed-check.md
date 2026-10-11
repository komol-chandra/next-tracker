---
description: Re-seed local MongoDB and verify seeder acceptance criteria
---

Verify the MongoDB seed data matches `.claude/plan/04-seeder.md`.

1. `cd backend && npm run seed:fresh` (local DB only).
2. Count documents per collection and confirm every count > 0 and that no tenant-owned document lacks `tenant`.
3. Run `npm run seed` again and confirm counts are identical (idempotent).
4. Log in via `POST /api/auth/login` with each demo account from 04-seeder.md §5 (server must be running) and report pass/fail.
5. Report any failing acceptance item from 04-seeder.md §6.
