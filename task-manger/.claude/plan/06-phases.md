# 06 — Phases & Task Checklist

> **Current sprint runs from `08-current-scope.md §6` (S0–S8).** This file is the full roadmap. P5/P7 items for
> Monthly Planning, Attendance, Payroll, Approvals hub, Reports are backlog.

Work top to bottom. Each phase ends with an **acceptance gate** — do not start the next phase until it passes.
Tick boxes here and log a line in `../PROGRESS.md` when a phase closes.
Estimates assume one developer; modules in Phase 5/7 can run in parallel across the 3 members.

```
P0 Setup ─► P1 Backend skeleton ─► P2 Models ─► P3 Seeder ─► P4 Auth+RBAC ─┬─► P5 Module APIs ─┐
                                                                            └─► P6 Frontend shell ┴─► P7 Wire views ─► P8 Rules hardening ─► P9 Tests ─► P10 Polish/docs
```

---

## P0 — Workspace setup (0.5 day)

- [x] `.nvmrc` → `22`; confirm `nvm use` gives Node ≥ 20.19 (Vite 8 requirement; system Node 18 is too old).
- [x] `git init` in `task-manger/`; `.gitignore` copied from SE331 + `.env`, `coverage/`.
- [x] `backend/` and `frontend/` exist (already, empty).
- [x] Confirm MongoDB: `docker ps` shows a `mongo:7` on 27017, or `docker run -d --name workforce-mongo -p 27017:27017 -v workforce-mongo:/data/db mongo:7`.
      Optional: install `mongosh` / MongoDB Compass for inspection.
- [x] Root `README.md` stub with setup steps.
- [x] `PROGRESS.md` created (phase log).

**Gate:** `node -v` ≥ 22 in the project dir, `nc -z 127.0.0.1 27017` succeeds.

## P1 — Backend skeleton (0.5 day) — mirrors SE331 `server/`

- [x] `npm init -y`; deps: `express@5 mongoose cors dotenv bcryptjs jsonwebtoken`; dev: `nodemon jest supertest mongodb-memory-server`.
- [x] Scripts: `dev` (nodemon server.js), `start`, `seed*` (P3), `test` (P9).
- [x] `server.js`, `app.js`, `config/db.js` copied from SE331, adapted (PORT 5000, CORS origin from env).
- [x] `middlewares/logger.js`, `middlewares/errorHandler.js` copied; extend errorHandler for `ValidationError`→400,
      `CastError`→404, duplicate key `11000`→409, `JsonWebTokenError`→401.
- [x] `GET /api/health` → `{ success:true, data:{ status:"ok", db: mongoose.connection.readyState } }`.
- [x] `routes/index.js` mounting placeholder routers.
- [x] `.env.example` (see 01-architecture §6).

**Gate:** `npm run dev` → "MongoDB connected" + `curl :5000/api/health` OK; unknown route → 404 JSON.

## P2 — Mongoose models (1 day)

- [x] `config/constants.js`: ROLES, PERMISSIONS, all enums (task category/priority/status, leave types/status, …).
- [x] `models/plugins/toJSON.js` and apply globally (`mongoose.plugin(...)` before models load).
- [x] All 16 schemas from `02-data-model.md` with validation, indexes, and hooks
      (User password hash, Timesheet totalHours, Attendance duration).
- [ ] One `*Model.js` data-access file per collection, all functions tenant-first.

**Gate:** a scratch script creates + reads one doc per model; `syncIndexes()` succeeds; JSON shows `id` not `_id`.

## P3 — Seeder (1 day) — see `04-seeder.md`

- [x] `seeders/helpers.js` (deterministic PRNG, date helpers).
- [x] Port mock `db.ts` arrays into `seeders/data/*.js` with natural-key references.
- [x] `seed.js` with `--fresh / --destroy / --minimal / --force` and the remote-host guard.
- [x] Generators for attendance (60 days), time entries + timesheets, payroll (2 past months + current).
      Payroll/timesheet generators may be stubbed until P5 services exist — finish them in P5 and re-run.
- [x] Summary + demo-login table printed at the end.

**Gate:** all items in `04-seeder.md §6`.

## P4 — Auth, tenancy, RBAC (1 day)

- [x] `utils/generateToken.js`; `POST /auth/login` (by email; if same email exists in several tenants, require `tenantCode`).
- [x] `middlewares/auth.js` (`protect`): Bearer → verify → load active user → `req.user`, `req.tenantId`, `req.permissions`
      (role permissions cached in memory, invalidated on role update).
- [x] `middlewares/authorize.js`: `authorize(...perms)` = user needs **any** of them → else 403.
- [x] `middlewares/tenantScope.js`: Super Admin + `X-Tenant-Id` → override `req.tenantId` (validate tenant exists).
- [ ] `GET/PUT /auth/me`, `GET /tenants`, `/users` CRUD.

**Gate:** curl: no token → 401; Member hitting `/payroll/generate` → 403; Super Admin with header reads other tenant;
Admin with header is ignored (still own tenant).

## P5 — Module APIs (5–6 days, parallelisable) — see `03-api-spec.md`

Build in this order inside each module: model functions → service (if any) → controller → routes → curl check.

**Member 1 (Adhara)**
- [x] M3 Holidays CRUD + `utils/dates.workingDaysBetween` (unit-test it first).
- [x] M3 Leaves: apply (days, overlap, balance, certificate rule), 2-step approve/reject, cancel, balance deduction, Leave attendance rows.
- [x] M2 Time entries + `timesheetService` (upsert week, recompute day/total, task.hoursLogged); timer start/stop.
- [x] M2 Timesheets: cell edit, submit, approve/flag, batch approve, state guards.
- [x] M4 RBAC matrix (GET/PUT), roles, departments + teams CRUD (tenant-scoped).
- [x] M1 `dashboardService` aggregations (admin + member variants) — **last**, needs other modules.

**Member 2 (Anindita)**
- [x] M5 Task CRUD with field whitelist + status guards, filters, text search.
- [x] M5 submit-plan, review (approve/reject), proof attachments.
- [x] M5 Task presets CRUD (+ apply-to-month stretch).
- [ ] M6 Monthly plans CRUD, status transitions, rollup recompute hook from tasks.

**Member 3 (Rafsan)**
- [ ] M7 Attendance: today, punch in/out with TZ-correct date, Late/Half-Day rules, HR correction.
- [ ] M8 `payrollService` formula; generate (upsert), edit bonus/deductions, disburse, payslip by id.

**Shared**
- [x] M11 `notificationService.notify()` + notifications list/mark-read (per-user `readBy`); call it from every
      submit/approve/reject/disburse action.
- [x] M11 Settings GET/PUT.
- [ ] M9 Approvals summary + list (scope: Manager = direct reports; HR = `Pending HR` leaves; Admin = everything in tenant).
- [ ] M10 Reports overview + per-user report (aggregation pipelines).
- [x] Re-run `npm run seed:fresh` with real services wired into generators.

**Gate:** a Thunder Client / Postman collection (`backend/docs/api.postman_collection.json`) runs green for every
endpoint in `03-api-spec.md` against seeded data, including at least one 403 and one 409 per module.

## P6 — Frontend shell (1.5 days) — see `05-frontend.md` §2–3

- [x] Vite react-ts app, Tailwind 4, copy mock styles/components/views/types.
- [x] `axiosClient.ts` + per-module services exposing the mock `api` function names.
- [x] `AuthContext`, `LoginPage` (mock visual style), `ProtectedRoute`, router with all paths.
- [x] Strip fake auth from `AppContext`; Sidebar → NavLink + `can()`; Topbar role dropdown removed, tenant switch gated.

**Gate:** log in as each demo role → sidebar items match permissions; refresh keeps session; logout clears it;
direct URL to forbidden page → redirected / "no access" view.

## P7 — Wire every view (4–5 days, parallel by module owner) — see `05-frontend.md` §4

- [x] Dashboard (admin + member variants)            — M1
- [ ] Time tracker + idle banner + manual time modal  — M2
- [x] Leave management + apply modal                  — M3
- [x] Org & RBAC + addDept/newRole/nodeDetail modals  — M4
- [x] Tasks + newTask/taskDetail modals; presets      — M5
- [ ] Monthly plan + newPlan/teamPlanBreakdown        — M6
- [ ] Attendance + clock modal (punch state from API) — M7
- [ ] Payroll + payslip/salaryStructure modals        — M8
- [ ] **Approvals** (remove inline arrays)            — M9
- [ ] **Reports** + user report (remove static numbers) — M10
- [x] Notifications modal + **Settings** (remove local defaults) + profile modal — M11
- [ ] Split `ModalRoot.tsx` into one file per modal while touching each.

**Gate:** `grep -rnE "useState\(\[\s*\{|Mahmud|usr-2|2026-09-11|Week 37" frontend/src` returns nothing;
every view shows loading, empty, and error states.

**Status 2026-10-11 (partial):** Dashboard, Timer (start/pause/stop), Leave, Org tree+matrix, Tasks, Presets, User log, Settings/Configuration, Login wired to live APIs. Not built: idle banner, manual-time modal, per-view modals (newTask/taskDetail/addDept/newRole/nodeDetail), Monthly plan, Attendance, Payroll, Approvals, Reports overview views (backlog).

## P8 — Business-rule hardening (1.5 days)

- [ ] Walk every state machine in `03-api-spec.md` via the UI; illegal transitions return 409 and the UI disables the button.
- [ ] Self-approval blocked (owner ≠ approver) for timesheets, leaves, tasks, plans.
- [x] Tenant-isolation sweep: log in as APEX admin, try TECH-BD ids on every `/:id` route → 404.
- [ ] Timezone check: punch near midnight uses tenant TZ date.
- [ ] Leave days exclude weekends + holidays; balance can't go negative; payroll matches hand calculation for 2 users.
- [ ] Input validation on every POST/PUT (required, enums, number ranges, date order).

## P9 — Tests (2 days)

- [ ] Jest + supertest + `mongodb-memory-server`; `tests/setup.js` seeds `--minimal` fixture.
- [ ] Unit: `workingDaysBetween`, payroll formula, timesheet recompute, attendance status.
- [ ] Integration: auth (401/403), tenant isolation, leave apply→approve→balance, timesheet submit→approve, task submit-plan→review, payroll generate.
- [ ] Frontend (optional): Vitest + Testing Library for LoginPage and one view.
- [x] `npm test` green.

## P10 — Polish & docs (1 day)

- [x] README: prerequisites, `nvm use`, Mongo start, `.env` copy, `npm i`, `npm run seed`, `npm run dev` ×2, demo logins.
- [ ] Remove dead mock code (Gemini mentions, unused deps), run `tsc --noEmit` + ESLint clean.
- [x] `frontend` production build works; optional root script `npm run dev` with `concurrently`.
- [ ] Demo script for presentation: one walkthrough per role (Member logs time & applies leave → Manager approves → HR finalises → Admin runs payroll → dashboard updates).

---

## Stretch (only after P10)

- File uploads for proof attachments / leave certificates (multer → `backend/uploads`).
- Real geofence check on punch (`navigator.geolocation` + tenant office coordinates).
- CSV/PDF export for reports & payslips.
- Socket.io push notifications instead of polling.
- Audit log collection for approvals.
