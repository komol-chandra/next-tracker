# 04 — MongoDB Seeder

## 1. Goals

- One command rebuilds a realistic demo DB: `npm run seed` (from `backend/`).
- **Idempotent**: running twice gives the same result (it wipes the seeded collections first).
- Data is **ported from the mock** (`task-manger-moc/server/db.ts`) so the real app looks like the mock on first run,
  then **extended** so dashboards/reports have enough history to be meaningful.
- Never runs against a non-local DB by accident.

## 2. Files

```
backend/seeders/
├── seed.js                 # CLI entry
├── helpers.js              # dateHelpers, pick(), deterministic random (seeded PRNG, e.g. mulberry32)
└── data/
    ├── tenants.js          # 3 tenants from mock: tenant-bd (TECH-BD), apex-agency, ever-global
    ├── roles.js            # system roles + permission matrix (source for /rbac/matrix)
    ├── departments.js      # from mock db.departments, one set per tenant
    ├── users.js            # mock usr-1..usr-7 + 2–3 users per role per tenant
    ├── settings.js         # mock db.settings + new fields (officeStartTime, lateGraceMinutes, workingDays)
    ├── holidays.js         # mock hol-1..6 (+ year-relative copies)
    ├── taskPresets.js      # mock db.taskPresets
    ├── tasks.js            # mock db.tasks (owner by email key, not "usr-2")
    ├── monthlyPlans.js     # mock db.monthlyPlans
    ├── leaves.js           # mock db.leaves (+ balances recalculated from approved leaves)
    ├── notifications.js    # mock db.notifications (timestamps → real Dates)
    └── generators.js       # generated history: attendance, time entries, timesheets, payroll
```

Data files reference other records by **natural keys** (tenant `code`, user `email`, department `code`), never by
hard-coded ObjectIds. `seed.js` builds lookup maps after each insert step.

## 3. Commands (`backend/package.json`)

```json
"seed":         "node seeders/seed.js",
"seed:fresh":   "node seeders/seed.js --fresh",      // drop entire DB, rebuild indexes, seed
"seed:destroy": "node seeders/seed.js --destroy",    // wipe seeded collections only
"seed:minimal": "node seeders/seed.js --minimal"     // tenants + roles + users + settings only
```

## 4. `seed.js` flow

```
1. require('dotenv').config(); guard: abort unless MONGO_URI host is localhost/127.0.0.1
   (override with --force) and NODE_ENV !== 'production'.
2. connectDB() (reuse config/db.js)
3. --destroy / --fresh → deleteMany on every model (or dropDatabase for --fresh) → await Model.syncIndexes()
4. Insert in dependency order, building maps:
   a. Tenants              → tenantByCode
   b. Roles (system)       → roleByName
   c. Settings (1/tenant)
   d. Departments          → deptByCode[tenantCode]
   e. Users (insertMany does NOT run save hooks → hash passwords explicitly with bcrypt.hash
      once and reuse the hash for the shared demo password) → userByEmail
   f. Patch Department.hod / teams[].lead / members with user ids; set User.manager
   g. LeaveBalance per user for current year
   h. Holidays, TaskPresets
   i. MonthlyPlans → Tasks (link plan + preset) → recompute plan tasksCount/progressRollup
   j. Leaves (mock) → apply approved ones to balances
   k. generators: last 60 days of Attendance (working days only, skip holidays/approved leave,
      ~85% Present, 8% Late, 4% Half-Day, 3% Absent — deterministic PRNG)
   l. generators: TimeEntries (2–4 per worked day against the user's tasks) → Timesheets per ISO week
      (past weeks Approved, last week Submitted, current week Draft) → Task.hoursLogged recomputed
   m. generators: Payroll for the previous 2 months via payrollService (Disbursed) + current month (Draft)
   n. Notifications (mock list + a few generated)
5. Print a summary table (collection → count) and the demo login table below.
6. mongoose.disconnect(); process.exit(0). Any error → log + exit(1).
```

Use the **real services** (`payrollService`, `timesheetService`, `leaveService.workingDaysBetween`) inside the seeder
so seeded numbers obey the same rules as the API. If a seeded number looks wrong, the service is wrong.

Dates are generated **relative to today** (`dayjs()` or plain Date helpers) so the demo never looks stale; the mock's
fixed "September 2026" data is shifted to the current month.

## 5. Demo logins (all passwords `Password@123`)

| Tenant | Email | Role | Notes |
|---|---|---|---|
| — | superadmin@workforce.local | Super Admin | can switch all 3 tenants |
| TECH-BD | admin@technologies.com.bd | Admin | |
| TECH-BD | hr@technologies.com.bd | HR | final leave approver, payroll |
| TECH-BD | adhara.paul@technologies.com.bd | Manager | mock default user, Workforce Operations |
| TECH-BD | mahmud@technologies.com.bd | Member | mock "usr-2", Field Sales rep, has tasks/time/leaves |
| TECH-BD | ravi.kumar@…, tanvir.ahmed@…, sadia.islam@… | Member | from mock |
| APEX / EVER | admin@apex.agency, admin@ever.global (+1 manager, 3 members each) | | for tenant-isolation testing |

Superadmin belongs to tenant TECH-BD in the DB but holds `tenant.switch`.

## 6. Acceptance

- [ ] `npm run seed:fresh` finishes < 15 s and prints counts > 0 for every collection.
- [ ] Running `npm run seed` twice → identical counts.
- [ ] Every demo login works through `POST /api/auth/login`.
- [ ] Dashboard for TECH-BD Manager shows non-zero values for every card **without** any fallback code.
- [ ] No document in any collection lacks `tenant` (except system Roles).
- [ ] `--destroy` against `mongodb://some.remote.host` aborts without `--force`.
