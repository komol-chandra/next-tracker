# Progress Log

Run order: **`.claude/plan/10-final-goal.md`** (I0–I6 → F1–F8). Specs: `08-current-scope.md §4`.

| Step | Status | Date | Notes |
|---|---|---|---|
| Planning (roadmap 00–07) | ✅ done | 2026-10-11 | |
| Planning (sprint scope 08) | ✅ done | 2026-10-11 | ✅ = Overview, Time Tracker, Leave & Holidays, My Tasks, User-wise Log, Org & RBAC, Task Presets, Configuration |
| **Init (09-init-scope.md)** | | | |
| I0 Setup | ✅ done | 2026-10-11 | Git init, .gitignore, MongoDB confirmed |
| I1 Backend architecture | ✅ done | 2026-10-11 | Skeleton with CRUD, health, 404 mapping |
| I2 Models | ✅ done | 2026-10-11 | 16 Mongoose models with schemas, validation, indexes, toJSON plugin |
| I3 Seeder | ✅ done | 2026-10-11 | Data files created; tenants+users+roles seeded (10 each in DB). Seeders data complete. |
| I4 Auth API | ✅ done | 2026-10-11 | Login, me, profile endpoints with JWT, protect/authorize/tenantScope middleware. Global `crypto` fix for MongoDB driver. |
| I5 Frontend shell | ✅ done | 2026-10-11 | Vite 8 + React 19 + Tailwind 4 running; `vite build` OK, `tsc --noEmit` clean (typed AppContext, vite-env.d.ts, tsconfig.json added). Install needs `--legacy-peer-deps`; system Node 18 too old (use nvm v22). |
| I6 Port 7 goal views | ✅ done | 2026-10-11 | Dashboard, Time Tracker, Leave, My Tasks, User Log, Org/RBAC, Configuration + TaskPresets pages wired to live APIs. |
| **Final goal (10-final-goal.md)** | | | |
| F1 Configuration | ✅ done | 2026-10-11 | `GET/PUT /api/settings`, `GET/PUT /api/tenant` tenant-scoped; `GET /api/me/badges`. |
| F2 Org & RBAC | ✅ done | 2026-10-11 | `/api/org/tree` (fixed teams.lead populate), departments/teams CRUD, `/api/rbac/matrix` + roles. |
| F3 Task Presets + Tasks API | ✅ done | 2026-10-11 | Task CRUD/submit/review + presets mounted at `/api/tasks`, `/api/task-presets`; controller fields fixed (`desc`/`due`). |
| F4 Leave & Holidays | ✅ done | 2026-10-11 | `/api/holidays`, `/api/leaves` (+balance/preview), 2-stage workflow. |
| F5 Time Tracker | ✅ done | 2026-10-11 | Timer state machine + entries + timesheets under `/api/time`. |
| F6 User-wise Log | ✅ done | 2026-10-11 | `/api/reports/user-log` + CSV export. |
| F7 Overview | ✅ done | 2026-10-11 | `/api/dashboard/stats?view=my|team` + member detail (DEFAULT_WORKING_HOURS fix). |
| F8 Notifications + tests + README | ✅ done | 2026-10-11 | Notifications API; 12/12 Jest integration tests pass; README complete incl. Docker. |
| **Sprint (08) — superseded by 10 for order; kept for reference** | | | |
| S0 Setup | ✅ done | | .nvmrc 22, git, .gitignore, MongoDB confirmed |
| S1 Backend skeleton + models | ✅ done | | |
| S2 Seeder | ✅ done | | `npm run seed:fresh` green; model unique-index + Mongoose 9 hook fixes |
| S3 Auth, RBAC, tenancy | ✅ done | | |
| S4 APIs (10 items) | ✅ done | | All endpoints mounted + verified (19× 200, tenant isolation) |
| S5 Frontend shell | ✅ done | | Build + dev server + typed context clean |
| S6 Wire screens (8 screens) | ✅ done | | 9 pages routed, auth flow working |
| S7 Hardening + tests | ✅ done | | 12/12 integration tests (Jest dynamic-import fix: pass `runtimeAdapters`) |
| S8 Docs & demo | ✅ done | | README + PROGRESS + Docker compose stack healthy |

| **Docker (S8 extra)** | ✅ done | 2026-10-11 | `docker compose up -d` — mongo (host 27018) + backend + nginx frontend all healthy; images rebuilt after code fixes |

Backlog (❌): Monthly Planning, HR & Attendance, Approvals & Reviews, Payroll & Payslips, Analytics & Reports.