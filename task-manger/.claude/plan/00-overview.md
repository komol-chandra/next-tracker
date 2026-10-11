# 00 — Project Overview: Workforce & Task Manager OS

> Single source of truth for the build. Claude Code and opencode both read this folder.
> Read order: `00-overview` → `01-architecture` → `07-conventions` → **`08-current-scope.md` (current sprint — overrides 02/03/06 where they differ)**.
> `06-phases.md` is the full-project roadmap; `08` is what is being built now.

## 1. Goal

Turn the AI-Studio mock (`../task-manger-moc`) into a **real, working full-stack app** inside `task-manger/`:

| Layer      | Source of truth                                                  | Target                         |
|------------|------------------------------------------------------------------|--------------------------------|
| UI / UX    | `task-manger-moc/src` (React 19 + TS + Tailwind 4, lucide icons) | `task-manger/frontend`         |
| Structure  | `SE331-Design-Capstone-Project-main` (client/server split)       | `task-manger/frontend` + `backend` |
| Data       | `task-manger-moc/server/db.ts` (in-memory arrays)                | **Local MongoDB** + seeder      |
| API shape  | `task-manger-moc/server/routes.ts` + `src/services/api.ts`       | Express 5 REST, real logic      |

The mock is a **visual spec only**. Its server fakes everything: hard-coded user `usr-2`, hard-coded date `2026-09-11`,
fallback numbers in the dashboard (`|| 16`, `|| 1420000`), no auth, role picked from a dropdown, departments shared
across tenants. All of that gets replaced by real data and real rules.

## 2. Modules (from the mock) and team ownership

Ownership comes from the comments in the mock's `routes.ts` / `api.ts`.

Current sprint = M0, M1, M2, M3, M4, M5, M11 (settings) + User-wise Log — see `08-current-scope.md §1`.

| #  | Module                        | Mock view(s)                                 | Owner (mock comments)          |
|----|-------------------------------|----------------------------------------------|--------------------------------|
| M0 | Auth, tenants, users          | Topbar, Sidebar, `profile` modal             | shared (do first)              |
| M1 | Dashboard                     | `DashboardView`                              | Member 1 — Adhara Paul         |
| M2 | Time tracking + timesheets    | `TimeTrackerView`, `IdleWarningBanner`, `manualTime` modal | Member 1                |
| M3 | Leave & holidays              | `LeaveManagementView`, `applyLeave` modal    | Member 1                       |
| M4 | Org & RBAC                    | `OrgRbacView`, `addDept`/`newRole`/`nodeDetail` modals | Member 1             |
| M5 | Tasks + task presets          | `TasksView`, `TaskPresetsView`, `newTask`/`taskDetail`/`newTaskPreset` modals | Member 2 — Anindita Ghosh Mridu |
| M6 | Monthly planning              | `MonthlyPlanView`, `newPlan`/`teamPlanBreakdown` modals | Member 2            |
| M7 | Attendance                    | `AttendanceView`, `clock` modal              | Member 3 — Rafsan Alam Rishad  |
| M8 | Payroll                       | `PayrollView`, `payslip`/`salaryStructure` modals | Member 3                  |
| M9 | Approvals (cross-module)      | `ApprovalsView` (currently **static arrays**) | shared                        |
| M10| Reports + user-wise log       | `ReportsView` (**static**), `UserReportView` | shared                         |
| M11| Notifications + settings      | `notifications` modal, `SettingsView` (**static**) | shared                   |

## 3. Locked decisions (change only by editing this file)

| ID  | Decision | Why |
|-----|----------|-----|
| D1  | Backend = **Express 5, CommonJS JavaScript, Mongoose**, folder layout copied from SE331 `server/` | Matches the course example 1:1 |
| D2  | Frontend = **Vite + React 19 + TypeScript + Tailwind 4**, reusing mock components; adds **axios** + **react-router-dom** like SE331 `client/` | Mock UI is already TS; converting 7k lines to JS adds risk for zero gain. Flip to JSX only if the course requires `.jsx` |
| D3  | Frontend and backend are **separate apps** (no Vite-inside-Express like the mock's `server.ts`) | SE331 structure; independent dev servers |
| D4  | DB = local MongoDB `mongodb://127.0.0.1:27017/workforce_os` (docker `mongo:7` is already listening on 27017) | User requirement |
| D5  | Response envelope = SE331 style `{ success, data, count?, message? }` | Matches example controllers; frontend `api/` layer unwraps it |
| D6  | Every Mongoose schema serialises `_id → id` and hides `__v`, `password` (`toJSON` plugin) | Mock components read `task.id`, `user.id` — no view rewrites needed |
| D7  | Auth = **JWT (Bearer) + bcryptjs**. Tenant comes from the **logged-in user**, never from a header | Fixes the mock's spoofable `x-tenant-id` |
| D8  | RBAC = `Role` collection holding permission keys; `authorize('perm.key')` middleware. Roles: Super Admin, Admin, HR, Manager, Member | Mirrors mock's "Spatie" matrix |
| D9  | Super Admin may switch tenant (`?tenant=` / `X-Tenant-Id` honoured **only** for Super Admin) | Keeps the mock's tenant switcher meaningful |
| D10 | Node **22** (`.nvmrc`). System node is 18 → Vite 8 will not run on it | Verified on this machine |
| D11 | Ports: backend `5000`, frontend `5173` (Vite proxy `/api → :5000`) | Avoid clashing with other local apps on 3000 |
| D12 | Dates stored as `Date` (or `YYYY-MM-DD` strings for day-level fields like attendance `date`); never store "Just now"/"10 mins ago" — format on the client | Mock stores display strings |
| D13 | No Gemini / AI Studio deps carried over (`@google/genai`, `GEMINI_API_KEY`) | Unused by the UI |

## 4. Definition of done (whole project)

- [ ] `npm run seed` builds a full demo DB from scratch, idempotently.
- [ ] Log in as each seeded role; sidebar + API access match the RBAC matrix.
- [ ] Every mock view renders **only** DB data (no inline arrays, no `|| 16` fallbacks).
- [ ] Each create/approve flow persists and survives a server restart.
- [ ] Tenant A can never read/write tenant B data (tested).
- [ ] README explains setup in ≤ 10 commands.

## 5. Files in this folder

| File | Contents |
|------|----------|
| `00-overview.md` | this file |
| `01-architecture.md` | folder trees, request flow, middleware chain |
| `02-data-model.md` | every Mongoose model, fields, indexes, relations |
| `03-api-spec.md` | every endpoint, permission, request/response, business rule |
| `04-seeder.md` | seeder design, data sets, commands, demo logins |
| `05-frontend.md` | how the mock UI is ported and wired |
| `06-phases.md` | ordered phases with checkbox tasks + acceptance criteria |
| `07-conventions.md` | code style, naming, git, error handling |
| `08-current-scope.md` | **current sprint**: in-scope screens (✅), screen-by-screen specs, RBAC scope model, sprint S0–S8 |
