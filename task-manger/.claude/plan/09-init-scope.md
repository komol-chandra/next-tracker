# 09 — Init Scope (foundation before feature work)

> Goal: a running app you can log into, with the full architecture, all models, seeded demo data, the real
> shell (sidebar, topbar, profile, logout) and the **7 goal views** (`10-final-goal.md`) ported from the mock as UI shells.
> No business logic yet (no timer, leave workflow, task review, etc.) — that is S4/S6 in `08-current-scope.md`.
>
> This is a slice of `08` §6: **S0 + S1 + S2 + auth part of S3 + S5 + a static port of the 7 goal views.**
> Where details are needed (fields, folder names, permissions), follow `01`, `02`, `04`, `05`, `08` — don't re-invent.

## Time estimate

| Step | What | By hand | With Claude (incl. your review/testing) |
|---|---|---|---|
| I0 | Setup: git, Node 22, both apps scaffolded | 0.5 d | 30 min |
| I1 | Backend architecture skeleton | 0.5 d | 1 h |
| I2 | All Mongoose models + `*Model.js` files | 1 d | 1.5–2 h |
| I3 | Seeder (tenants, roles, users, demo data) | 1 d | 1.5–2 h |
| I4 | Auth API: login, me, profile, change password, logout, RBAC middleware | 1 d | 1.5 h |
| I5 | Frontend shell: router, AuthContext, Login, Sidebar, Topbar, Profile modal, Logout | 1.5 d | 2–3 h |
| I6 | Port the 7 goal views + their modals (UI only, empty states) | 1.5 d | 2–3 h |
| | **Total** | **~7 dev-days** | **~10–13 h ≈ 2 working days** |

Realistic calendar: **2–3 days** with Claude, because you still need to run, click through and fix things.

## I0 — Setup
- [ ] `cd task-manger && nvm use` (Node 22). `git init`, `.gitignore` (node_modules, .env, dist).
- [ ] `backend/`: `npm init`, install `express@5 mongoose dotenv cors bcryptjs jsonwebtoken morgan` + dev `nodemon`.
- [ ] `frontend/`: Vite react-ts, Tailwind 4, `axios react-router-dom lucide-react motion`. Vite proxy `/api → :5000`.
- [ ] Mongo reachable at `mongodb://127.0.0.1:27017/workforce_os`.
- **Gate:** `npm run dev` works in both folders; first commit made.

## I1 — Backend architecture
- [ ] `server.js`, `app.js`, `config/db.js`, `config/constants.js`, `config/permissions.js` (keys from `08` §3.1).
- [ ] `middlewares/`: logger, errorHandler (Mongoose Validation/Cast/11000 → 400/409), validate.
- [ ] `routes/index.js` mounting under `/api`; `GET /api/health`.
- [ ] `models/plugins/toJSON.js` (`_id → id`, hide `__v`, `password`).
- **Gate:** `curl :5000/api/health` → `{ success: true }`.

## I2 — Models
- [ ] Schemas per `02-data-model.md` + `08` §5: Tenant, User, Role (per-tenant, `scope`, `isSystem`), Department
      (teams embedded), Task, TaskPreset, TimeEntry, Timesheet, ActiveTimer, LeaveRequest, LeaveBalance, Holiday,
      Notification, Setting, Attendance, Payroll.
- [ ] One `xxxModel.js` data-access file per schema; every function takes `tenantId` first.
- **Gate:** a scratch script creates + reads one doc per model; JSON shows `id`, no `_id`/`__v`/`password`.

## I3 — Seeder
- [ ] `seeder/` per `04-seeder.md`: 3 tenants, 5 roles per tenant with permissions + scope, departments/teams,
      users (one demo login per role), settings, holidays, leave balances, some tasks/presets/time entries,
      60 days attendance, 2 months payroll.
- [ ] Scripts: `seed`, `seed:fresh`, `seed:destroy`. Idempotent.
- [ ] Print the demo logins table at the end.
- **Gate:** running `seed` twice gives the same counts; `/seed-check` passes.

## I4 — Auth API
- [ ] `POST /api/auth/login` → `{ token, user }` (user includes role, permissions, tenant).
- [ ] `GET /api/auth/me`, `PUT /api/auth/profile` (phone, avatar), `PUT /api/auth/password`.
- [ ] `POST /api/auth/logout` (stateless; client drops the token — endpoint just returns success).
- [ ] Middlewares: `protect` (JWT), `tenantScope` (Super Admin only may switch), `authorize(perm)` with permissions cache.
- [ ] `GET /api/me/badges` returning zeros/real counts (cheap queries only).
- **Gate:** no token → 401; wrong password → 401; Member on an `authorize('roles.manage')` test route → 403.

## I5 — Frontend shell
- [ ] Copy mock `index.css`, `types/`, `components/common/*` into `frontend/src`.
- [ ] `api/axiosClient.ts` (Bearer token, 401 → logout) + `services/authService.ts`.
- [ ] `AuthContext` (`user`, `login`, `logout`, `can(perm)`), token in localStorage, restore on refresh via `/auth/me`.
- [ ] `LoginPage` (mock styling; dev-only demo quick-fill buttons).
- [ ] `ProtectedRoute` (auth + optional permission). Router: one route per sidebar item.
- [ ] `config/features.ts` flags + `ComingSoon` page.
- [ ] `Sidebar`: NavLink, hides items without permission, ❌ items greyed with `Soon`, badges from `/me/badges`.
- [ ] `Topbar`: user menu → Profile modal (view + edit phone + change password), Logout; tenant switcher (Super Admin only);
      notification bell (count only for now).
- [ ] Strip the mock `AppContext` of fake user/role; keep only toast + modal state.
- **Gate:** each demo role logs in and sees the right sidebar; refresh keeps you logged in; logout returns to login.

## I6 — Port the 7 goal views (UI only)
- [ ] `cp` the 7 goal views (`10-final-goal.md`) from `../task-manger-moc/src/views` into `frontend/src/views`:
      Dashboard, TimeTracker, LeaveManagement, UserReport, OrgRbac, TaskPresets, Settings. Then `Edit` only the
      data lines. Tasks, MonthlyPlan, Attendance, Approvals, Payroll and Reports are **not** ported → `ComingSoon`.
- [ ] Replace mock data/calls with empty arrays + **loading / empty / error** placeholders. No fake names, dates, or numbers.
- [ ] Split out only the modals the 7 views use from `ModalRoot.tsx` into `components/modals/<Name>Modal.tsx` (grep `case '`, read ranges only; UI only).
- [ ] Add `services/<module>Service.ts` stubs with the endpoint signatures from `08` §4 (not called yet, or return []).
- **Gate:** every in-scope route renders without console errors; `npm run build` passes (tsc clean);
  `grep -rnE "Mahmud|Adhara|usr-[0-9]|2026-09|September|Week 37" frontend/src` → nothing.

## After init
Continue with `08-current-scope.md` S4 (APIs) → S6 (wire screens) → S7 → S8. S0, S1, S2, S5 and the auth part of S3
are already done by this init — tick them in `PROGRESS.md`.
