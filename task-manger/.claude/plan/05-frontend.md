# 05 — Frontend Port Plan (mock UI → real app)

> Current sprint: only ✅ screens are wired; ❌ screens are behind `src/config/features.ts` flags and open a `ComingSoon`
> page (see `08-current-scope.md §1`).

## 1. Strategy

**Copy, then rewire — never redesign.** The mock's look (Tailwind classes, lucide icons, `motion` animations) is the
spec. Each view is copied verbatim, then its data source is swapped from mock API / inline arrays to the real API.

## 2. Bootstrap (Phase 6)

1. `npm create vite@latest frontend -- --template react-ts` (Node 22), then copy from mock:
   `src/index.css`, `src/types`, `src/components/**`, `src/views/**`, `src/context/AppContext.tsx`, `index.html` body.
2. Deps: `react-router-dom axios lucide-react motion tailwindcss @tailwindcss/vite`.
   Drop: `express`, `@google/genai`, `dotenv`, `tsx`, `vite` middleware server, `server.ts`, `server/`.
3. `vite.config.ts`: react + tailwind plugins; `server.proxy['/api'] = 'http://localhost:5000'`.
4. `src/api/axiosClient.ts` (SE331 `axiosClient.js` + interceptors):
   - request: attach `Authorization: Bearer ${localStorage.token}`; for Super Admin add `X-Tenant-Id` of selected tenant.
   - response: return `response.data`; on 401 → clear token → redirect `/login`; normalise error to `Error(message)`.
5. One service file per module (SE331 `projectService.js` style). Each function unwraps `data` so views receive the
   same shapes the mock `api.ts` returned. Keep the **mock function names** (`getTasks`, `submitFullPlan`, …) and
   re-export them from `src/api/index.ts` as `api` so views only change their import line.

## 3. Auth & routing

- `AuthContext`: `{ user, tenant, permissions, token, login, logout, can(perm), switchTenant }`.
  On load, if token → `GET /auth/me`; show a full-screen loader until resolved.
- `AppContext` keeps only UI state (sidebar, modals, toasts, timer, idle detector, notifications polling).
  Remove: `defaultUser`, `defaultTenant`, `currentRole`/`switchRole`, `erp_role`/`erp_tenant` localStorage,
  punch state in localStorage (load from `GET /attendance/today`).
- Replace `activeView` switch with routes (keep `ViewTab` ids as paths):

| Path | View | Guard (perm) |
|---|---|---|
| /login | LoginPage | public |
| / → /dashboard | DashboardView | dashboard.view |
| /timer | TimeTrackerView | time.log |
| /leaves | LeaveManagementView | leave.apply |
| /tasks | TasksView | task.view |
| /monthly-plan | MonthlyPlanView | plan.view |
| /attendance | AttendanceView | attendance.punch |
| /approvals | ApprovalsView | any of *.approve |
| /payroll | PayrollView | payroll.view_own |
| /reports | ReportsView | report.view |
| /user-report/:userId? | UserReportView | report.view (or self) |
| /org-rbac | OrgRbacView | org.manage \| role.manage |
| /task-types | TaskPresetsView | preset.manage |
| /settings | SettingsView | settings.manage |
| * | NotFound | — |

- Sidebar: `setActiveView(id)` → `<NavLink to>`; visibility via `can(perm)` instead of `isAdmin/isManager/isHR`.
- Topbar: **remove the role dropdown**; tenant dropdown shown only if `can('tenant.switch')`; user menu → profile modal + logout.

## 4. View-by-view rewiring checklist

| View / modal | Current data source | Change |
|---|---|---|
| DashboardView | `getDashboardStats`, `getTasks`, `getCurrentUser` | use AuthContext user; render 0 states; member variant |
| TimeTrackerView | entries/timesheets/tasks APIs; timer in context | timer start/stop hits `/time/timer/*`; idle keep/discard sends `idleTimeMinutes` + `idleAction`; week grid reads real `weekStart` |
| IdleWarningBanner | context | threshold from `GET /settings` |
| LeaveManagementView | `getLeaves`, `getHolidays`, `updateLeaveStatus` | approve buttons only if `can('leave.approve')`; show `days` + 2-step status |
| TasksView | tasks CRUD + submitFullPlan | filters → query params; disable edit/delete on non-Draft |
| TaskPresetsView | `getTaskPresets` | add edit/delete |
| MonthlyPlanView | `getMonthlyPlans` | breakdown modal → `GET /monthly-plans/:id` |
| AttendanceView | `getAttendance` | date-range filter; HR sees all users |
| PayrollView | `getPayroll`, `generatePayroll` | month picker; disburse button; Member sees own payslips |
| **ApprovalsView** | **inline `useState([...])` arrays** | replace with `GET /approvals?type=`; wire approve/reject/flag buttons to module endpoints; counts from `/approvals/summary` |
| **ReportsView** | **static JSX numbers** | `GET /reports/overview`; charts from data (keep existing visual style) |
| UserReportView | `getTasks` | `GET /reports/users/:id` + user picker |
| OrgRbacView | departments + matrix | toggles call `PUT /rbac/matrix`; add-dept/new-role persist |
| **SettingsView** | **local useState defaults** | load `GET /settings`, save `PUT /settings` |
| ModalRoot (1.5k lines) | create* APIs | split into `components/modals/*Modal.tsx` (one file per `type`) as part of rewiring; keep `ModalRoot` as a switch |
| Topbar notifications | `getNotifications` | poll every 60 s; timestamps formatted with `Intl.RelativeTimeFormat` |

## 5. UX rules

- Every fetch: loading skeleton, error banner with retry, empty state (copy tone from mock).
- Mutations: disable button while pending; toast on success/error (existing `showToast`).
- After a mutation call `triggerRefresh()` (already in mock) or refetch the affected list.
- Currency/date formatting in one helper (`src/utils/format.ts`) using tenant currency + timezone.
- No hard-coded names/dates in JSX ("Mahmud Sahiuddin", "September 2026", "Week 37") — grep for them in Phase 10.
