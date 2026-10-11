# 01 — Architecture

## 1. Repository layout (target)

```
task-manger/
├── CLAUDE.md                  # Claude Code entry point → points here
├── AGENTS.md                  # opencode entry point → points here
├── opencode.json              # opencode project config (instructions = plan files)
├── .nvmrc                     # 22
├── .gitignore
├── README.md
├── .claude/
│   ├── plan/                  # THIS PLAN (00..07)
│   ├── commands/              # /phase, /status, /seed-check slash commands
│   └── settings.json          # allowed commands
├── .opencode/
│   ├── command/               # same commands for opencode
│   └── agent/                 # backend / frontend sub-agents
├── backend/                   # ← mirrors SE331 server/
└── frontend/                  # ← mirrors SE331 client/ + mock UI
```

## 2. Backend tree (SE331 `server/` pattern, extended)

SE331 layering is **route → controller → model-functions file → Mongoose schema**
(`projectRoutes.js → projectController.js → projectModel.js → Project.js`). Keep it exactly; add `services/` only for
logic that touches several collections.

```
backend/
├── package.json               # "type": "commonjs"; scripts: dev, start, seed, seed:fresh, seed:destroy, test
├── .env.example
├── server.js                  # dotenv → connectDB() → app.listen   (same as SE331)
├── app.js                     # middleware chain + route mounting   (same as SE331)
├── config/
│   ├── db.js                  # mongoose.connect(process.env.MONGO_URI)
│   └── constants.js           # ROLES, PERMISSIONS, enums shared by schemas & seeder
├── middlewares/
│   ├── logger.js              # copied from SE331
│   ├── errorHandler.js        # notFound + errorHandler (extended: Mongoose Validation/Cast/11000 → 400/409)
│   ├── auth.js                # protect: verify JWT, load user, set req.user + req.tenantId
│   ├── authorize.js           # authorize(...permKeys) using req.user.role → Role.permissions
│   ├── tenantScope.js         # Super Admin tenant override (D9)
│   └── validate.js            # tiny required-fields helper → 400 { success:false, message }
├── models/
│   ├── plugins/toJSON.js      # _id→id, drop __v/password (D6)
│   ├── Tenant.js      tenantModel.js
│   ├── User.js        userModel.js
│   ├── Role.js        roleModel.js        # + Permission list lives in config/constants.js
│   ├── Department.js  departmentModel.js  # teams embedded
│   ├── Task.js        taskModel.js        # proofAttachments embedded
│   ├── TaskPreset.js  taskPresetModel.js
│   ├── MonthlyPlan.js monthlyPlanModel.js
│   ├── TimeEntry.js   timeEntryModel.js
│   ├── Timesheet.js   timesheetModel.js
│   ├── LeaveRequest.js leaveModel.js
│   ├── LeaveBalance.js
│   ├── Holiday.js     holidayModel.js
│   ├── Attendance.js  attendanceModel.js
│   ├── Payroll.js     payrollModel.js
│   ├── Notification.js notificationModel.js
│   └── Setting.js     settingModel.js     # one doc per tenant
├── controllers/               # one per module, try/catch + next(error) exactly like projectController.js
│   ├── authController.js  tenantController.js  userController.js
│   ├── dashboardController.js  timeController.js  leaveController.js  holidayController.js
│   ├── rbacController.js  taskController.js  taskPresetController.js  monthlyPlanController.js
│   ├── attendanceController.js  payrollController.js  approvalController.js
│   ├── reportController.js  notificationController.js  settingController.js
├── routes/                    # one router per module, comment each line with METHOD + path (SE331 style)
│   ├── index.js               # mounts everything under /api
│   └── authRoutes.js … settingRoutes.js
├── services/                  # cross-collection logic only
│   ├── dashboardService.js    # aggregates for /dashboard/stats
│   ├── timesheetService.js    # recompute weekly totals from time entries
│   ├── leaveService.js        # working-day count (skip weekends + holidays), balance updates
│   ├── payrollService.js      # salary formula from settings + attendance + leaves
│   └── notificationService.js # notify(tenantId, {title, message, category, linkTab, userIds?})
├── utils/
│   ├── dates.js               # weekStart(date), toDayKey, workingDaysBetween
│   └── generateToken.js
├── seeders/                   # see 04-seeder.md
│   ├── seed.js
│   └── data/*.js
└── tests/                     # jest + supertest (Phase 9)
```

## 3. Middleware chain (`app.js`) — order matters

```js
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(logger);
app.get("/api/health", ...);           // public
app.use("/api", apiRoutes);            // routes/index.js; each router applies protect/authorize itself
app.use(notFound);
app.use(errorHandler);                 // ALWAYS last
```

Inside a protected router:
```js
router.use(protect, tenantScope);                       // every route below needs login
router.get("/", authorize("task.view"), getTasks);      // GET  /api/tasks
router.post("/", authorize("task.create"), createTask); // POST /api/tasks
```

## 4. Request flow example — "submit weekly timesheet"

```
TimeTrackerView → api/timeService.submitTimesheet(id)
  → axios POST /api/time/timesheets/:id/submit  (Authorization: Bearer <jwt>)
  → protect (req.user, req.tenantId) → tenantScope → authorize("timesheet.submit")
  → timeController.submitTimesheet
      → timesheetModel.findOneForUser(id, req.tenantId, req.user.id)  (404 if not owner)
      → guard: status must be Draft|Flagged else 409
      → timesheetModel.update(... status: "Submitted", submittedAt: now)
      → notificationService.notify(tenant, managers of user's team, {...linkTab:"approvals"})
  → 200 { success:true, data: timesheet, message:"Timesheet submitted" }
```

## 5. Frontend tree

```
frontend/
├── package.json  vite.config.ts (react + tailwind, proxy /api → http://localhost:5000)
├── index.html  tsconfig.json  .env.example (VITE_API_URL=/api)
└── src/
    ├── main.tsx  App.tsx                  # BrowserRouter + routes (replaces activeView switch)
    ├── index.css                          # copied from mock
    ├── api/                               # SE331 pattern: axiosClient + one service per module
    │   ├── axiosClient.ts                 # baseURL, Bearer token interceptor, 401 → logout, unwrap errors
    │   ├── authService.ts  dashboardService.ts  timeService.ts  leaveService.ts  rbacService.ts
    │   ├── taskService.ts  planService.ts  attendanceService.ts  payrollService.ts
    │   ├── approvalService.ts  reportService.ts  notificationService.ts  settingService.ts
    ├── context/
    │   ├── AuthContext.tsx                # user, tenant, token, login(), logout(), can(perm)
    │   └── AppContext.tsx                 # mock's UI state (timer, idle, modals, toasts) minus fake auth
    ├── routes/ProtectedRoute.tsx          # redirect to /login; optional `perm` prop
    ├── pages/LoginPage.tsx                # NEW (styled like the mock)
    ├── components/  (common, layout, modals — copied from mock)
    ├── views/       (copied from mock, rewired one by one)
    ├── hooks/useFetch.ts                  # loading / error / data / refetch
    └── types/index.ts                     # copied from mock; becomes the API contract
```

## 6. Environment

`backend/.env.example`
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/workforce_os
JWT_SECRET=change-me-in-dev
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

`frontend/.env.example`
```
VITE_API_URL=/api
```
