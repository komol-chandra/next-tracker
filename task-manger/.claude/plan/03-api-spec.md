# 03 — API Specification

> **Current sprint:** the in-scope endpoint list (timer, week grid, leave preview, org tree, user-log, badges, dashboard
> member detail) is in `08-current-scope.md §4`, and it wins over this file where they differ. Sections M6–M10 here are backlog.

Base: `/api`. All responses: `{ success: boolean, data?, count?, message? }` (D5).
Errors: `{ success:false, message }` with 400 (validation), 401 (no/invalid token), 403 (permission),
404 (not found **or other tenant's doc** — never leak existence), 409 (bad state transition / duplicate).

Legend: 🔓 public · 🔐 login · `perm` = `authorize()` key. "own" = scoped to `req.user` unless the user holds the `*_all`
/ approve permission. "Mock" column = the endpoint in `task-manger-moc/server/routes.ts` it replaces.

## M0 Auth / tenants / users

| Method | Path | Auth | Mock | Notes |
|---|---|---|---|---|
| POST | /auth/login | 🔓 | — | `{email,password,tenantCode?}` → `{ token, user, tenant, permissions[] }` |
| GET | /auth/me | 🔐 | `/auth/current-user` | `{ user, tenant, permissions }` |
| PUT | /auth/me | 🔐 | — | update own phone/avatar/password (`profile` modal) |
| GET | /tenants | `tenant.switch` | `/tenants` | Super Admin only; others get their own tenant |
| GET | /users | `user.manage` or Manager (team only) | — | for dropdowns: owners, HOD, team lead |
| POST/PUT/DELETE | /users[/:id] | `user.manage` | — | creates LeaveBalance on create; DELETE = soft (`isActive=false`) |

## M1 Dashboard

| GET | /dashboard/stats | `dashboard.view` | `/dashboard/stats` |
|---|---|---|---|
Returns the exact `DashboardStats` shape from `types/index.ts`, computed with aggregations in `dashboardService`:
- `employeeCount` = active users in tenant. **No fallbacks** — 0 is a valid answer.
- `activeTasksCount` = status in (Submitted, Approved) and progress < 100; `taskCompletionRate` = progress==100 / total.
- `attendanceSummary` for **today** (tenant timezone): Present+Late, Late, users with approved leave covering today,
  `attendanceRate` = (Present+Late)/(headcount − onLeave).
- `payrollOverview` for latest payroll month; `currency` from tenant.
- `workforceStatistics.totalLoggedHours` = sum TimeEntry hours this month; `activeTimersCount` = users with an open
  timer (see `/time/timer`); `avgPlanProgress` = avg MonthlyPlan.progressRollup this month;
  `pendingApprovalsCount` = same number as `/approvals/summary`; `departmentBreakdown` = group users + hours + plan progress by dept.
- Member role: same endpoint returns **personal** stats (own tasks/hours/attendance), payroll block = own payslip.

## M2 Time tracking

| Method | Path | perm | Mock | Rules |
|---|---|---|---|---|
| GET | /time/entries?from&to&userId | `time.log` (own) / `timesheet.approve` (team) | same | newest first |
| POST | /time/entries | `time.log` | same | owner = req.user; task must belong to user+tenant; `durationHours` > 0 ≤ 24; if `idleAction=discarded` subtract idle minutes; then `timesheetService.addEntry()` (upsert week, add to day) and recompute `task.hoursLogged`. Rejects if that week's timesheet is Submitted/Approved (409) |
| DELETE | /time/entries/:id | `time.log` (own, Draft week only) | — | reverses the timesheet + task totals |
| POST | /time/timer/start · /time/timer/stop | `time.log` | — | optional server-side timer record so `activeTimersCount` is real; stop → creates a `source:"timer"` entry |
| GET | /time/timesheets?status&userId | own / `timesheet.approve` | same | |
| PUT | /time/timesheets/:id/cell | owner | same | `{day: mon..sun, hours 0–24}`; only Draft/Flagged |
| POST | /time/timesheets/:id/submit | `timesheet.submit` (owner) | same | Draft/Flagged → Submitted; notify manager |
| POST | /time/timesheets/:id/approve | `timesheet.approve` | same | `{action:"approve"|"flag", remarks}`; Submitted only; approver ≠ owner; notify owner |
| POST | /time/timesheets/batch-approve | `timesheet.approve` | same | approves all Submitted in approver's scope; returns `{ approvedCount }` |

## M3 Leave & holidays

| Method | Path | perm | Mock | Rules |
|---|---|---|---|---|
| GET | /leaves?userId&status | own / `leave.approve` | same | returns `{ leaves, balance }` (balance for `userId` or self) |
| POST | /leaves | `leave.apply` | `/leaves/apply` | `days = workingDaysBetween(start,end)` excluding weekends (from settings) + tenant holidays; reject 0 days, overlaps with own pending/approved leave, or insufficient balance (except Unpaid). Sick > `settings.sickCertificateAfterDays` (default 1) requires `certificateAttachment`. Initial status: `Pending Manager` (or `Pending HR` if applicant has no manager) |
| PUT | /leaves/:id/status | `leave.approve` | same | 2-step: Manager moves `Pending Manager → Pending HR`; HR/Admin moves `Pending HR → Approved`. Either can Reject. Approve deducts `days` (not 1!) from the right balance bucket; writes `Leave` attendance rows for each day |
| DELETE | /leaves/:id | owner, Pending only | — | cancel |
| GET | /holidays?year | 🔐 | same | |
| POST/PUT/DELETE | /holidays[/:id] | `holiday.manage` | POST only | |

## M4 Org & RBAC

| Method | Path | perm | Mock |
|---|---|---|---|
| GET | /rbac/matrix | `role.manage` (read allowed for Admin/HR) | same — returns `{ permissions: SpatiePermission[], roles }` built from Role docs so the mock table renders unchanged (`admin/hr/manager/member` booleans) |
| PUT | /rbac/matrix | `role.manage` | — toggle `{ role, perm, value }` |
| POST | /rbac/roles | `role.manage` | same — now actually persists |
| GET | /rbac/departments | 🔐 | same — **tenant-scoped** (mock wasn't) |
| POST/PUT/DELETE | /rbac/departments[/:id] | `org.manage` | POST only — DELETE blocked if users attached |
| POST | /rbac/departments/:id/teams | `org.manage` | — |

## M5 Tasks & presets

| Method | Path | perm | Mock | Rules |
|---|---|---|---|---|
| GET | /tasks?category&status&search&ownerId&monthCycle | `task.view` (own; managers see team) | same | search uses text index |
| GET | /tasks/:id | `task.view` | — | `taskDetail` modal |
| POST | /tasks | `task.create` | same | owner = self (managers may pass `ownerId` in team); status Draft; `monthCycle` from `due` |
| PUT | /tasks/:id | `task.update` | same | **whitelist** fields (mock did `Object.assign(req.body)` = mass-assignment hole). Members may only edit Draft/Rejected tasks + progress/completedQuantity on Approved ones |
| DELETE | /tasks/:id | `task.delete` | same | Draft only; owner or manager |
| POST | /tasks/submit-plan | `task.create` | same | own Draft tasks for `monthCycle` → Submitted; notify manager |
| PUT | /tasks/:id/review | `task.approve` | — | `{action:"approve"|"reject", remarks}` (used by Approvals → plans tab) |
| POST | /tasks/:id/proofs | `task.update` | — | push proof attachment metadata (file upload = optional stretch, store URL/filename only) |
| GET | /task-presets | 🔐 | same | tenant-scoped |
| POST/PUT/DELETE | /task-presets[/:id] | `preset.manage` | POST only | |
| POST | /task-presets/:id/apply | `task.create` | — | generate tasks from a preset for a month (stretch) |

## M6 Monthly plans

| GET | /monthly-plans?monthCycle&dept | `plan.view` | same |
|---|---|---|---|
| GET | /monthly-plans/:id | `plan.view` | — returns plan + member breakdown (`teamPlanBreakdown` modal) |
| POST | /monthly-plans | `plan.create` | same — unique per team+month (409) |
| PUT | /monthly-plans/:id | `plan.create` | — |
| PUT | /monthly-plans/:id/status | `plan.approve` | — Submitted→Approved / Under Revision |
`tasksCount` and `progressRollup` are recomputed whenever a linked task changes (taskModel post-save hook → service).

## M7 Attendance

| GET | /attendance?from&to&userId | own / `attendance.view_all` | same |
|---|---|---|---|
| GET | /attendance/today | `attendance.punch` | — returns own record for today (drives `punchState` in AppContext, replacing localStorage) |
| POST | /attendance/punch | `attendance.punch` | same — `{action:"clock-in"|"clock-out", location, note}`; date = **today in tenant TZ** (mock hard-coded 2026-09-11); clock-in twice → 409; clock-out without clock-in → 409; computes `durationMinutes` and Late/Half-Day status |
| PUT | /attendance/:id | `attendance.view_all` | — HR correction with note |

## M8 Payroll

| GET | /payroll?month | `payroll.view_all` / `payroll.view_own` | same |
|---|---|---|---|
| GET | /payroll/:id | own or `payroll.view_all` | — payslip modal |
| POST | /payroll/generate | `payroll.generate` | same — `{month}`: upsert a record per active user via `payrollService`: `dailyRate = baseSalary / 30`, `absentDays` = working days − present − approved paid leave − holidays, `deductions = dailyRate × (absentDays + unpaidLeaveDays)`, `overtime = max(0, approvedHours − workingDays×defaultWorkingHours) × hourlyRate × multiplier`, `net = base + bonus + overtime − deductions`. Status → Calculated. Refuses months already Disbursed |
| PUT | /payroll/:id | `payroll.generate` | — edit bonus / deductions (Calculated only) |
| POST | /payroll/disburse | `payroll.generate` | — `{month, paymentMethod}` → Disbursed + notify each employee |

## M9 Approvals (feeds the currently-static `ApprovalsView`)

| GET | /approvals/summary | any approve perm | `{ plans, timesheets, leaves, total }` counts in caller's scope |
|---|---|---|---|
| GET | /approvals?type=plans\|timesheets\|leaves | any approve perm | pending items in caller's scope (Manager = own team; HR = `Pending HR` leaves; Admin = all) |
Actions reuse module endpoints: `PUT /tasks/:id/review` / `PUT /monthly-plans/:id/status`, `POST /time/timesheets/:id/approve`, `PUT /leaves/:id/status`.

## M10 Reports

| GET | /reports/overview?from&to | `report.view` | hours by dept/category, task status distribution, attendance trend per day, leave usage |
|---|---|---|---|
| GET | /reports/users/:userId?from&to | `report.view` or self | `UserReportView`: tasks, hours per day, attendance, leaves |
| GET | /reports/export?type&from&to | `report.view` | CSV download (stretch) |

## M11 Notifications & settings

| GET | /notifications | 🔐 | same — for current user, `read` computed, newest first, limit 50 |
|---|---|---|---|
| POST | /notifications/mark-read | 🔐 | same — adds user to `readBy` (all or `{ids}`) |
| GET | /settings | 🔐 | same — tenant settings |
| PUT | /settings | `settings.manage` | same — whitelisted fields, numeric validation |

## Status machines (enforce in controllers, 409 on violation)

```
Task:        Draft ─submit→ Submitted ─approve→ Approved
                               └─reject→ Rejected ─edit→ Draft
Timesheet:   Draft ─submit→ Submitted ─approve→ Approved
                               └─flag→ Flagged ─edit/submit→ Submitted
Leave:       Pending Manager ─mgr ok→ Pending HR ─hr ok→ Approved      (any pending ─reject→ Rejected)
MonthlyPlan: In Progress ─submit→ Submitted ─approve→ Approved
                                        └─revise→ Under Revision ─submit→ Submitted
Payroll:     Draft ─generate→ Calculated ─disburse→ Disbursed (locked)
```
