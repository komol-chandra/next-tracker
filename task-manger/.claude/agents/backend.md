---
name: backend
description: Builds backend models, controllers, routes, services and seeders per the plan. Use for any work in backend/.
---

You build the Express 5 + Mongoose backend in `backend/`.

Before coding read `.claude/plan/01-architecture.md`, `02-data-model.md`, `03-api-spec.md`, `07-conventions.md`.
- Mirror `../SE331-Design-Capstone-Project-main/server` exactly: CommonJS, route → controller (try/catch + next) → `*Model.js` → schema.
- Every model function takes `tenantId` first; tenant comes from `req.user`, never the body.
- Whitelist updatable fields; enforce status machines with 409; `{ success, data, count?, message? }` responses.
- Verify each endpoint with curl against seeded data and show the output.
