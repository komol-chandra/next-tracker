# 08 — Current Sprint Scope (Member 1 deliverable)

> **This file drives the current work.** Where it differs from 00–07, this file wins for the current sprint.
> Other modules stay in the backlog (§9) for the other members / later.

## 1. Scope by sidebar item

| Sidebar section | Item | Sprint | Module | Mock view |
|---|---|---|---|---|
| Core Operations | Overview | ✅ IN | Dashboard Management | `DashboardView` |
| | Time Tracker (timer badge `00:00`) | ✅ IN | Time Tracking | `TimeTrackerView` |
| | Leave & Holidays (badge `3`) | ✅ IN | Leave & Holiday Mgmt | `LeaveManagementView` |
| | My Tasks (badge `12`) | ✅ IN | Tasks (feeds Time + Dashboard) | `TasksView` |
| | Monthly Planning | ❌ later | — | `MonthlyPlanView` |
| | HR & Attendance | ❌ later | — | `AttendanceView` |
| | Approvals & Reviews (badge `3`) | ❌ later | — | `ApprovalsView` |
| | Payroll & Payslips | ❌ later | — | `PayrollView` |
| | Analytics & Reports | ❌ later | — | `ReportsView` |
| | User-wise Log | ✅ IN | Tasks / reporting | `UserReportView` |
| Administration | Org & Spatie RBAC | ✅ IN | RBAC & Multi-Tenancy | `OrgRbacView` |
| | Task Presets | ✅ IN | Tasks admin | `TaskPresetsView` |
| | Configuration | ✅ IN | Settings | `SettingsView` |
| Cross-cutting | Login, tenant isolation, protected APIs, Topbar (profile, notifications, tenant switch) | ✅ IN | RBAC & Multi-Tenancy | `Topbar`, `profile`/`notifications` modals |

### How the ❌ items behave this sprint
- **Sidebar:** they still show, greyed out with a `Soon` pill and no badge. They link to a shared `ComingSoon` page. One
  flag per item lives in `frontend/src/config/features.ts`, so turning a module on later is a one-line change.
- **Backend:** no routes are mounted for them.
- **Data they own that in-scope screens need** (the Dashboard needs attendance and payroll numbers):
  - The `Attendance` and `Payroll` **models exist and the seeder fills them**.
  - The Dashboard reads them **read-only** through `dashboardService`.
  - Nothing else touches them until those modules are built.
- **Approvals that in-scope modules need are done inside the module's own screen**, not in Approvals & Reviews:
  - Leave → in the Leave screen.
  - Timesheet → a "Team Timesheets" tab in Time Tracker.
  - Task → the task detail modal.
  - The future Approvals screen will call the same endpoints, so nothing gets thrown away.
- **"Punch Attendance"** button (Dashboard header) and the `clock` modal → hidden behind the `attendance` flag.

## 2. Gaps in the mock that this sprint must close

| Gap | Where | Fix |
|---|---|---|
| Modal `addHoliday` opened but not implemented | LeaveManagementView | build `AddHolidayModal` (also used for edit) |
| Modal `editTask` opened but not implemented | TasksView | reuse `NewTaskModal` with `task` prop (edit mode) |
| Modal `memberDetail` opened but not implemented | Dashboard team tab | build `MemberDetailModal` |
| Dashboard KPI cards, donut, member tracker table all hard-coded | DashboardView | real data, §4.1 |
| `DashboardStats.payrollOverview` / `departmentBreakdown` returned but never shown | DashboardView | show in Team tab for `dashboard.payroll_overview` |
| Timesheet grid rows (3 tasks × 7 days) hard-coded; header dates "Mon 7…Sun 13" fixed | TimeTrackerView | rows derived from time entries, §4.2 |
| Timesheet model only stores day totals, grid edits per task/day | backend | rows = task×day sums of `TimeEntry`; cell edit writes an adjustment entry |
| Timer lives only in browser memory; lost on refresh; `activeTimersCount` fake (11) | AppContext | server-side `ActiveTimer`, §4.2 |
| Leave policy text hard-coded (10/7/15 days, certificate rule) | Leave → Policies tab | rendered from `Setting` |
| Leave approve = 1 click, always deducts 1 day | Leave | 2-stage + real working-day count, §4.3 |
| "Holidays Calendar 2026" fixed year | Leave | year selector |
| Tasks header "September Monthly Plan & Tasks"; "Save Draft" button only toasts | TasksView | month selector; remove Save Draft (tasks save on create) |
| User report "Created 2026-09-01" and "2 Proofs" hard-coded | UserReportView | `createdAt`, `proofAttachments.length` |
| Export CSV / Excel / PDF only toast | Time, User log | real CSV download; PDF = print stylesheet |
| Settings save only toasts | SettingsView | `GET/PUT /settings` |
| RBAC matrix read-only, fixed 4 columns; new role not persisted | OrgRbacView | per-tenant roles, editable matrix, dynamic columns |
| Org tree members are plain strings | OrgRbacView | real users; add/move member, change role |
| Sidebar badges hard-coded `3`, `12` | Sidebar | `GET /me/badges` |
| Role chosen from a Topbar dropdown | Topbar | removed; real login |

## 3. Roles, permissions, data scope (RBAC & Multi-Tenancy)

### 3.1 Permission keys — **use the mock's keys** (from `db.ts` `spatiePermissions`) + additions marked ★

| Key | Name | Admin | HR | Manager | Member |
|---|---|:-:|:-:|:-:|:-:|
| dashboard.view_stats | View dashboard | ✔ | ✔ | ✔ | ✔ |
| ★ dashboard.view_team | Team & Org Overview tab | ✔ | ✔ | ✔ | – |
| dashboard.payroll_overview | Payroll totals on dashboard | ✔ | ✔ | – | – |
| timelog.record | Web timer | ✔ | ✔ | ✔ | ✔ |
| timelog.manual_entry | Manual time entries | ✔ | ✔ | ✔ | ✔ |
| timelog.approve | Approve team timesheets | ✔ | – | ✔ | – |
| leave.request | Apply leave, see own balance | ✔ | ✔ | ✔ | ✔ |
| leave.approve | Approve/decline leaves | ✔ | ✔ | ✔ | – |
| holiday.manage | Manage holidays | ✔ | ✔ | – | – |
| ★ tasks.view | See tasks (scope-limited) | ✔ | ✔ | ✔ | ✔ |
| tasks.create | Create/edit own tasks | ✔ | – | ✔ | ✔ |
| tasks.approve | Approve subordinate tasks | ✔ | – | ✔ | – |
| ★ presets.manage | Manage task presets | ✔ | – | ✔ | – |
| ★ reports.user_log | User-wise log (scope-limited) | ✔ | ✔ | ✔ | ✔ |
| org.manage | Depts, teams, members | ✔ | – | – | – |
| ★ roles.manage | Roles & matrix | ✔ | – | – | – |
| ★ settings.manage | Edit configuration | ✔ | – | – | – |
| attendance.punch / attendance.manage / monthly_plan.manage / payroll.view_own / payroll.process | seeded for later modules | as mock | | | |
| ★ tenant.switch | Switch tenant | Super Admin only | | | |

Super Admin = every key. The keys live in `backend/config/permissions.js`. The seeder creates the table rows from that
file, and the frontend gets the user's keys from `/auth/me`.

### 3.2 Roles are per tenant
- The seeder creates the 5 default roles **for each tenant**. Changing the matrix in tenant A never affects tenant B.
- Each role has `scope: "self" | "team" | "department" | "tenant"`. This matches the mock's **Scope Level** field in the
  `newRole` modal.
- Defaults: Member = self, Manager = team, HR = tenant, Admin = tenant, Super Admin = tenant (plus tenant switch).
- **Data scope rule:** every list endpoint calls `scopeUserIds(req)`:

| scope | Which users' records you can see |
|---|---|
| `self` | only your own |
| `team` | you + every member of the teams you lead |
| `department` | everyone in your department |
| `tenant` | everyone (`null` = no user filter) |

  The tenant filter applies on top, always.
- **Writes:** you can only act on records inside your scope. Approving your own record is never allowed.

### 3.3 Protected APIs & isolation
`protect` → `tenantScope` → `authorize(perm)` → controller (scope filter). A record from another tenant or outside your
scope returns **404**, so the API never confirms it exists. A missing permission returns 403. Tenant switch: only Super
Admin may send `X-Tenant-Id`; for anyone else the header is ignored.

## 4. Screen specs (what "done" means for each ✅ item)

### 4.1 Overview (Dashboard Management)
**APIs:** `GET /dashboard/stats?view=my|team` · `GET /dashboard/member/:userId` (memberDetail) · tasks + timer from §4.2/4.4.

| Tab | Element | Data source / rule |
|---|---|---|
| Header | "… · {Month YYYY} Cycle · Tenant: {name}" | current month, tenant |
| My | Hours Logged (Week) + "Target: Xh · Y% fulfilled" | sum of own entries this ISO week; target = defaultWorkingHours × working days in week (minus holidays) |
| My | Attendance this Month + "N days present, M approved leave" | Attendance (seeded, read-only) + approved leaves |
| My | Task Progress (replaces "Monthly Plan Progress") + delta vs last month | avg `progress` of own tasks this month vs last month |
| My | Net Salary (Est.) | latest own Payroll record (seeded); if none → baseSalary − dailyRate × unpaid days this month |
| My | Today's Focus (4 tasks) + "Tracked today: Xh Ym" | own open tasks ordered priority desc, due asc; tracked = today's entries + running timer |
| My | Plan vs Achievement donut + bars | own tasks this month: Achieved (progress 100 or Approved & complete), In Progress, Pending/Overdue (due < today & < 100); bars = progress per category |
| Team* | Total Workforce / depts | active users in scope; departments in scope |
| Team* | Currently Clocked In "x / y" + on leave | today's Attendance (seeded) + approved leaves today |
| Team* | Active Web Timers | `ActiveTimer.running` in scope (real) |
| Team* | Pending Approvals "N Items · a leaves + b timesheets + c tasks" | in my approval scope |
| Team* | Live Member Tracker table | per user in scope: attendance today, running timer task + elapsed, hours today; **Inspect** → MemberDetailModal (profile, week hours by day, open tasks, leave balance, recent entries) |
| Team (payroll perm) | Payroll Overview card + Department Breakdown | `payrollOverview`, `departmentBreakdown` from stats |
| Quick Timer | task select + start/pause + elapsed | §4.2 timer API; threshold text from settings |

*Team tab needs `dashboard.view_team`. Every number can be 0. **No fallback constants.**
**Acceptance:** Log in as the seeded Member and the seeded Manager. Every card matches a hand-checked Mongo query.
A Member never sees the Team tab.

### 4.2 Time Tracker (Time Tracking)
**APIs:** `GET /time/timer` · `POST /time/timer/start {taskId}` · `/pause` · `/resume` · `/stop {notes, location}` · `/discard` · `/idle {seconds, action}`
· `GET /time/timesheets/week?start=YYYY-MM-DD[&userId]` · `PUT /time/timesheets/:id/cell {taskId, day, hours}` · `POST /time/timesheets/:id/submit`
· `GET /time/timesheets?status=Submitted` (team) · `POST /time/timesheets/:id/approve {action, remarks}` · `GET/POST/DELETE /time/entries`

- **Timer:** one `ActiveTimer` per user, stored in the DB.
  - Starting a timer for a different task auto-stops the old one, which creates its entry.
  - The sidebar badge and Dashboard read `GET /time/timer` on load, so the timer survives a page refresh.
  - The elapsed time ticks in the browser.
  - **Stop** creates a `TimeEntry` with `source: "timer"` and start/end times, rounded to 0.01 h.
  - Timers under 1 minute are discarded with a toast.
- **Idle detection** (`IdleWarningBanner`):
  - Threshold = `settings.idleThresholdSeconds`.
  - After that much time with no mouse or keyboard activity while the timer runs, show the banner.
  - **Keep** → `POST /idle {action:"kept"}`.
  - **Discard** → `POST /idle {seconds, action:"discarded"}`, which subtracts the idle time.
  - Stored on the entry as `idleTimeMinutes` + `idleAction`. Each discard adds 1 to the week's `idleFlags`.
- **Weekly timesheet grid:**
  - Week picker (‹ › buttons), header dates calculated from `weekStart`.
  - Rows = every task with time that week, plus the selected task.
  - Each cell = sum of that task's entries that day.
  - Footer = daily totals and the week total.
  - **Editing a cell** creates, updates or deletes a single `source: "manual", isAdjustment: true` entry for that
    task and day, so the cell equals the typed value. Allowed values: 0–24, steps of 0.25. A day's total across all
    tasks can't exceed 24.
  - Inputs are disabled when the week is Submitted or Approved.
- **Submit Timesheet:** works from Draft or Flagged. Notifies the user's manager. Status pill as in the mock.
- **Export CSV:** built in the browser from the grid rows.
- **Manual Log** (`manualTime` modal): date, duration **or** start+end (one fills in the other), location, description,
  task select. Rejected if the week is locked.
- **Recent Task Time Logs:** your own entries, newest first, paged 20 at a time. You can delete an entry if its week is
  still Draft.
- **★ Team Timesheets tab** (`timelog.approve`): submitted timesheets in your scope → open the read-only grid →
  Approve / Flag (remarks required to flag). Notifies the owner. You can't approve your own.

**Acceptance:**
- Start the timer, refresh the page, stop it → the entry appears and the grid cell and total update.
- Idle discard shortens the entry.
- Editing a cell changes the total, and the change survives a server restart.
- A submitted week can't be edited (API returns 409).
- The Manager approves; the Member gets a notification.

### 4.3 Leave & Holidays (Leave & Holiday Management)
**APIs:** `GET /leaves?scope=mine|pending|all&status&year` · `GET /leaves/balance[?userId]` · `POST /leaves` · `PUT /leaves/:id/status {status, remarks}` · `DELETE /leaves/:id` · `GET /holidays?year` · `POST/PUT/DELETE /holidays/:id` · `POST /leaves/preview {type,startDate,endDate,halfDay}`

- **Balance cards:** your own balance for the current year. Remaining = total − used. Unpaid shows days taken.
- **Applications & History tab:**
  - Sub-filters: **Mine** / **Pending my action** (approvers only) / **All in scope**, plus a status filter.
  - The list layout stays as in the mock.
- **Apply Leave modal:**
  - Fields: type, start date, end date, half-day toggle (only when it's a single day), reason, certificate (file name or
    link for now).
  - A live preview from `/leaves/preview` shows "N working days" and the balance after the leave.
  - Working days skip weekends (`settings.workingDays`) and tenant holidays.
- **Rules:**
  - Reject 0-day requests.
  - Reject overlaps with your own pending or approved leave.
  - Reject if the balance is too low (Unpaid is exempt).
  - Sick leave longer than `settings.sickCertificateAfterDays` (default **1**, as the mock's policy text says) needs a
    certificate.
- **Workflow:**
  - New requests start as `Pending Manager`, or `Pending HR` if the applicant has no manager.
  - A Manager approves `Pending Manager` → `Pending HR`.
  - HR or Admin approves either pending stage → `Approved`.
  - Anyone with `leave.approve` and the record in scope can decline. Declining requires remarks (small modal, no browser
    `confirm`).
  - Approval deducts `days` from the right balance bucket.
  - The applicant can cancel while the request is still pending.
  - Every step sends a notification.
- **Holidays tab:**
  - Year selector.
  - Add/edit/delete via `AddHolidayModal` (needs `holiday.manage`). One holiday per date per tenant.
  - Day name calculated from the date.
- **Policies tab:** text built from settings (allowances, certificate rule, deduction formula).

**Acceptance:**
- A Member applies for 3 days that span a weekend and a holiday → the request counts the right number of working days.
- Manager approves, then HR approves → the balance drops by that number.
- Overlapping or over-balance requests are rejected with clear messages.
- Managers from another team can't see the request.

### 4.4 My Tasks
**APIs:** `GET /tasks?scope=mine|team&month=YYYY-MM&status&category&search` · `GET /tasks/:id` · `POST /tasks` · `PUT /tasks/:id` · `DELETE /tasks/:id` · `POST /tasks/:id/submit` · `POST /tasks/submit-plan {month}` · `PUT /tasks/:id/review {action, remarks}` · `PATCH /tasks/:id/progress {completedQuantity, progress}` · `POST /tasks/:id/proofs`

- Header "{Month} Monthly Plan & Tasks" with a month picker. Remove **Save Draft**; show a "Drafts save
  automatically" hint instead.
- The toolbar search and filters run on the server. Managers get an extra **Mine / Team** toggle.
- **Add / Edit Task:**
  - `NewTaskModal` handles both; edit mode is used when the task is Draft or Rejected.
  - It has an optional **preset picker** (Published presets allowed for your role) that pre-fills category, target and
    proof type.
- **Row actions:**
  - ⏱ timer: selects the task and opens Time Tracker.
  - 👁 detail.
  - ✎ edit: Draft/Rejected only.
  - ➤ submit: Draft only.
  - 🗑 delete: Draft only, with a confirm modal.
- **Submit Full Plan:** sends all of your Draft tasks for the selected month and shows how many were sent.
- **Task Detail modal:**
  - Shows the fields, hours logged (from entries), proofs list, and review remarks.
  - **Owner on an Approved task:** can update completed quantity, which recalculates progress, and add proof metadata.
  - **Approver** (`tasks.approve`, task in scope, not your own): Approve / Reject. Reject requires remarks. Notifies the
    owner.
- **Sidebar badge:** your open tasks this month (status ≠ Rejected and progress < 100).
- Updates only accept known fields. The body can never change `owner`, `tenant` or `hoursLogged`.

**Acceptance:**
- Draft → submit → approve → log time → progress updates on the Dashboard.
- A rejected task can be edited and resubmitted.
- A Member can't approve; a Manager can't approve their own task.

### 4.5 User-wise Log
**APIs:** `GET /reports/user-log?userId&from&to&status&category&page` · `GET /reports/user-log/export?…` (CSV)
- Table exactly as the mock, with real data:
  - User + department.
  - Task title (opens detail).
  - Category, priority, status.
  - **Created** = `createdAt`.
  - Due.
  - **Remarks** = review remarks, falling back to the description.
  - **Attachments** = `proofAttachments.length`, opening `attachmentPreview` with the real list.
- Filters: user picker (only users in your scope; Members only see themselves), date range, status, category.
- Each row gets an extra **hours logged** column, summed over the date range.
- Export Excel = CSV download (all rows, not just the current page). Export PDF = print-friendly view + `window.print()`.

**Acceptance:** totals match `/tasks` and `/time/entries` for the same range; a Member's export has only their own rows.

### 4.6 Org & Spatie RBAC
**APIs:** `GET /org/tree` · `POST/PUT/DELETE /org/departments/:id` · `POST /org/departments/:id/teams` · `PUT/DELETE /org/teams/:deptId/:teamName` · `GET/POST/PUT /users` · `PUT /users/:id/assignment {departmentId, team, role, manager}` · `GET /rbac/matrix` · `PUT /rbac/matrix {roleId, perm, value}` · `POST /rbac/roles` · `PUT/DELETE /rbac/roles/:id`
- **Tree:** tenant → departments (code, budget formatted in tenant currency) → teams (lead) → members (real users).
- **nodeDetail modal shows real info:**
  - Tenant: id, code, plan, user count.
  - Department: head, budget, teams, headcount.
  - Team: lead, members.
  - Member: role, role scope, manager, email.
  - With `org.manage`, you can also edit, add a team, add a member (create user with a temporary password), move a
    member, or change role.
- **addDept modal:**
  - Head of department picked from users.
  - Budget is a number.
  - Optional first team.
  - Code must be unique per tenant.
  - Delete is blocked while the department still has members.
- **Matrix:**
  - One column per role in the tenant (dynamic, no longer fixed at 4).
  - Rows are grouped by module.
  - Each cell is a checkbox, editable only with `roles.manage`.
  - Super Admin's column is locked.
  - You can't remove `roles.manage` from the last role that has it.
- **newRole modal:** name, guard (cosmetic: sanctum/web), scope level (team/department/tenant, plus `self`), permission
  checkboxes → saved as a real role.
- Changing a role's permissions clears the cached permissions for that role.

**Acceptance:**
- An Admin in APEX never sees TECH-BD departments or roles.
- Revoking `leave.approve` from Manager makes the Manager's approve buttons disappear and the API return 403.
- A member moved to a different team becomes visible to the new team lead.

### 4.7 Task Presets
**APIs:** `GET /task-presets?status&category` · `POST /task-presets` · `PUT /task-presets/:id` · `PATCH /task-presets/:id/status` · `DELETE /task-presets/:id`
- The table matches the mock. Add row actions: edit, publish/unpublish, delete.
- Deleting a preset that tasks already use → archive it instead (it becomes Draft and is hidden from the picker).
- Modal fields: name, category, frequency, default target (≥ 1), allowed roles (multi-select from the tenant's roles),
  proof type.
- Members can read Published presets (for the task picker), but this screen needs `presets.manage`.

### 4.8 Configuration
**APIs:** `GET /settings` · `PUT /settings` · `GET /tenant` · `PUT /tenant`
- **Fields, as in the mock:**
  - Idle threshold (60 / 300 / 600 s).
  - Working hours per day (4–12).
  - Plan submission deadline (day 25/28).
  - Approval window closes (day 28 / last day).
  - Deduction formula (read-only).
- **★ New fields:**
  - Working days (weekday checkboxes; BD default Sun–Thu).
  - Leave allowances (casual / sick / annual).
  - Sick certificate after N days.
- **★ Organization profile section** (Admin): tenant name, timezone, currency.
- Non-admins see the whole form read-only.
- Save → toast. The idle threshold takes effect right away (`AppContext` reloads settings).
- Changing leave allowances affects **new** balance years only. Show a note saying so.

### 4.9 Shared shell (must exist for all of the above)
- **Login page:** mock styling, demo-account quick-fill buttons in dev only.
- **AuthContext:** `can(perm)`. **ProtectedRoute** checks the permission.
- **Topbar:**
  - Tenant switcher: Super Admin only.
  - Notifications bell: unread count, mark all read, click → go to `linkTab` if that module is enabled.
  - Profile modal: view your details, change phone and password.
  - Logout.
- **Sidebar badges:** `GET /me/badges` →
  `{ leavesPending, myOpenTasks, timer: { running, startedAt, accumulatedSeconds } }`.
  Re-fetched after mutations (`triggerRefresh`) and every 60 s.

## 5. Model changes for this sprint (update 02-data-model accordingly)

- **Role:** `tenant` is required (per-tenant roles), plus `scope` enum and `isSystem` (the 5 defaults can't be deleted).
- **★ ActiveTimer:**
  - Fields: `tenant, user (unique), task, taskTitle, startedAt, lastResumedAt, accumulatedSeconds, running, idleDiscardedSeconds`.
- **TimeEntry:** add `isAdjustment: Boolean`. `timesheet` ref stays.
- **Timesheet:** `dailyHours` is still stored, but always **recomputed** from entries. Rows are built on request
  (aggregate by task × day).
- **Setting:** add `workingDays: [Number]` (0 = Sun), `leaveAllowance { casual, sick, annual }`,
  `sickCertificateAfterDays`.
- **Task:** confirm `createdAt` (timestamps), `reviewRemarks`, `reviewedBy`, `reviewedAt`.
- **Notification:** unchanged (per-user `readBy`).
- **Attendance, Payroll:** models + seed only (read by dashboard).
- **MonthlyPlan:** not needed this sprint. Tasks use `monthCycle` only.

## 6. Sprint plan (S0–S8) with checklists

Estimates are working days for one developer. Do them in order: each step builds on the one before.

### S0 — Setup (0.5 d)
- [ ] `nvm use` (22). `git init`. `.gitignore`. `PROGRESS.md`.
- [ ] Mongo reachable on 127.0.0.1:27017 (docker `mongo:7` is already running).

### S1 — Backend skeleton + models (1.5 d)
- [ ] SE331 skeleton: `server.js`, `app.js`, `config/db.js`, logger, errorHandler (+ Mongoose error mapping), `/api/health`.
- [ ] `config/permissions.js` (§3.1), `config/constants.js` enums, `toJSON` plugin.
- [ ] Models: Tenant, User, Role, Department, Task, TaskPreset, TimeEntry, Timesheet, ActiveTimer, LeaveRequest,
      LeaveBalance, Holiday, Notification, Setting, Attendance (read-only), Payroll (read-only).
- [ ] `*Model.js` data-access files. Every function takes the tenant first.
- **Gate:** health OK. A test script round-trips one doc per model, and the JSON shows `id`.

### S2 — Seeder (1 d)
- [ ] Everything in `04-seeder.md`, plus roles per tenant with scope, ActiveTimers for 3 TECH-BD users (so "Active Web
      Timers" isn't 0), adjustment-free entries, and 60 days of attendance + 2 months of payroll for the dashboard.
- **Gate:** `04-seeder.md §6` passes. Running `seed` twice gives the same counts.

### S3 — Auth, RBAC, tenancy (1.5 d)
- [ ] Login / me / profile update. `protect`, `tenantScope`, `authorize`, permissions cache.
- [ ] `utils/scope.js` → `scopeUserIds(req)`, `assertInScope(req, userId)`.
- [ ] `GET /me/badges`, `GET/PUT /tenant`, `/tenants` (Super Admin).
- **Gate:**
  - No token → 401.
  - Member → `/rbac/matrix` → 403.
  - APEX admin requests a TECH-BD id → 404.
  - Super Admin header switch works; for an Admin the header is ignored.

### S4 — APIs (5 d), in this order, because later items depend on earlier ones
1. [ ] **Settings + tenant profile** (0.25 d)
2. [ ] **Org & RBAC:** tree, departments, teams, users/assignment, matrix GET/PUT, roles CRUD (1 d)
3. [ ] **Task presets** CRUD + status (0.25 d)
4. [ ] **Holidays** + `utils/dates` (`workingDaysBetween`, `isoWeekStart`, `tenantToday`), with unit tests (0.5 d)
5. [ ] **Leaves:** preview, apply rules, 2-stage workflow, cancel, balances, notifications (1 d)
6. [ ] **Tasks:** CRUD whitelist, submit, submit-plan, review, progress, proofs, scope toggle (0.75 d)
7. [ ] **Time:** timer state machine, idle, entries, week grid aggregation, cell adjustment, submit, team list, approve/flag (1.25 d)
8. [ ] **User-wise log** + CSV export (0.25 d)
9. [ ] **Dashboard:** `stats?view=my|team`, `member/:id` (0.5 d), last because it reads from all of the above
10. [ ] **Notifications:** list, mark-read; `notificationService` hooked into leave/time/task actions
- **Gate:** a Postman/Thunder collection in `backend/docs/` runs green, with at least one 403 + one 404 (other tenant) +
  one 409 (bad status change) per module.

### S5 — Frontend shell (1.5 d)
- [ ] Vite react-ts + Tailwind 4. Copy the mock's styles, layout, common components, types.
- [ ] `api/axiosClient.ts` + services. `AuthContext`, `LoginPage`, `ProtectedRoute`, router.
- [ ] `config/features.ts` + `ComingSoon` page. Sidebar uses NavLink + `can()` + flags + live badges.
- [ ] `AppContext`: remove the fake user/role. Timer + idle use the timer API. Settings are loaded once.
- [ ] Topbar: tenant switch (Super Admin), notifications, profile, logout.
- **Gate:**
  - Each demo role sees the right sidebar.
  - ❌ items show `Soon` and open ComingSoon.
  - Refreshing keeps the session.
  - The timer badge survives a refresh.

### S6 — Wire screens (5 d), same order as S4, so each screen has its API ready
- [ ] Configuration (0.25 d)
- [ ] Org & RBAC + addDept / newRole / nodeDetail / add-member modals (1 d)
- [ ] Task Presets + newTaskPreset (edit mode) (0.25 d)
- [ ] My Tasks + NewTaskModal (create/edit + preset picker) + TaskDetail (review, progress, proofs) + confirm modal (1 d)
- [ ] Time Tracker + manualTime + idle banner + week grid + Team Timesheets tab + CSV (1.25 d)
- [ ] Leave & Holidays + applyLeave (preview) + AddHolidayModal + decline-remarks modal + policies from settings (0.75 d)
- [ ] User-wise Log + attachmentPreview + CSV/print (0.25 d)
- [ ] Overview: 3 tabs + MemberDetailModal (0.5 d)
- [ ] While touching each modal, move it out of `ModalRoot.tsx` into `components/modals/<Name>Modal.tsx`.
- **Gate:** `grep -rnE "Mahmud|Adhara|usr-[0-9]|2026-09|September|Week 37|'৳ ?[0-9]" frontend/src` → nothing.
  Every screen has loading, empty and error states.

### S7 — Hardening + tests (2 d)
- [ ] Unit: `workingDaysBetween`, week math, timer accumulate/idle, leave balance, cell adjustment.
- [ ] Integration (jest + supertest + mongodb-memory-server):
  - auth 401/403
  - tenant isolation on every `/:id` route
  - data-scope (Manager can't see another team)
  - leave flow
  - timesheet flow
  - task flow
  - RBAC matrix revoke → 403
- [ ] Manual sweep of every status change in the UI. Illegal actions are disabled in the UI **and** return 409 from the API.
- [ ] Timezone check (Asia/Dhaka vs UTC near midnight) for the timer, entries and leave dates.

### S8 — Docs & demo (0.5 d)
- [ ] README (setup in ≤ 10 commands, demo logins, which modules are in scope this sprint).
- [ ] Demo script:
  1. Member: starts the timer, logs time, applies for leave, submits the plan.
  2. Manager: approves tasks, approves leave (stage 1), approves the timesheet.
  3. HR: final leave approval.
  4. Admin: edits the matrix, adds a department and member, changes settings.
  5. Super Admin: switches tenant to show isolation.
- [ ] Update `PROGRESS.md`; tick boxes.

**Sprint total:** about 18.5 developer-days.

## 7. Dependency map

```
Settings ─┬─► Holidays ─► Leaves ─────────────┐
          └─► (working days, idle threshold)  │
Org/RBAC ─► scope ─┬─► Tasks ─► Time ──────────┼─► Dashboard
Presets ──────────►┘           └─► User log    │
Notifications ◄── Leaves / Tasks / Time ───────┘
Attendance & Payroll (seed only) ─────────────► Dashboard
```

## 8. Risks & decisions to confirm with the team

| # | Item | Default chosen |
|---|---|---|
| R1 | Dashboard attendance and payroll cards depend on ❌ modules | Read from seeded data. Once Members 3/2 build those modules, the numbers become live automatically |
| R2 | Approvals & Reviews is ❌ but leave and timesheet approval is ✅ | Approve inside each module's screen; the Approvals screen later reuses the same endpoints |
| R3 | Tasks belong to Member 2 in the mock, but My Tasks is ✅ for you | Built now; the monthly-plan link (`monthlyPlan` ref) is added when Monthly Planning arrives |
| R4 | "Monthly Plan Progress" card needs Monthly Planning | Replaced by "Task Progress" (same visual) |
| R5 | File uploads (certificates, proofs) | Store file name or URL only; real upload with multer is a stretch goal |
| R6 | Working week (BD = Sun–Thu vs Mon–Fri) | Setting per tenant; seed TECH-BD Sun–Thu, APEX/EVER Mon–Fri |

## 9. Backlog (❌ this sprint)
Monthly Planning (M6), HR & Attendance UI + punch (M7), Approvals & Reviews hub (M9), Payroll UI + generate/disburse (M8),
Analytics & Reports (M10). Specs stay in `03-api-spec.md` / `05-frontend.md`. Each one needs: mount its routes, flip its
flag in `features.ts`, wire its view.
