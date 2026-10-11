# Workforce & Task Manager OS — `task-manger/`

Full-stack rebuild of the AI-Studio mock as a real app. **Planning lives in `.claude/plan/` — read it before coding.**

@.claude/plan/07-conventions.md
@.claude/plan/10-final-goal.md

Other plan files are read **on demand, by section** (see token rules in 10). Do not import them here.

## Where things are
- Plan (source of truth): `.claude/plan/00..10` — 01 architecture, 02 data model, 03 API, 04 seeder, 05 frontend, 08 screen specs, 09 init, **10 run order + token rules**.
- Progress log: `PROGRESS.md` (update when a phase gate passes).
- UI reference (read-only): `../task-manger-moc/src` — copy visuals from here, never its fake data/logic.
- Structure reference (read-only): `../SE331-Design-Capstone-Project-main` — backend/frontend layering to mirror.
- Code: `backend/` (Express 5 + Mongoose, CommonJS) and `frontend/` (Vite + React 19 + TS + Tailwind 4).

## Working rules
- **Run order = `10-final-goal.md`: I0–I6 (`09-init-scope.md`), then F1–F8.** One step per session, `/clear` between.
- Specs = `.claude/plan/08-current-scope.md §4` (read only the section a step names). Don't start a step before the previous gate passes.
- Out-of-scope (❌) modules: don't build their UI/routes; keep them behind `frontend/src/config/features.ts` flags.
- Every DB query is tenant-scoped; tenant comes from the JWT user, never the request body.
- Run `nvm use` first (Node 22). Mongo: `mongodb://127.0.0.1:27017/workforce_os`.
- Commands: `/phase I0`…`I6`, `/phase F1`…`F8` to execute a step, `/status` for progress, `/seed-check` to verify seeded data.

## Commands
```
cd backend  && npm run dev        # :5000
cd backend  && npm run seed:fresh # rebuild demo DB
cd frontend && npm run dev        # :5173 (proxies /api → :5000)
cd backend  && npm test
```
