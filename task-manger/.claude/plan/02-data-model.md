# 02 — Data Model (MongoDB / Mongoose)

Rules for **every** schema:
- `{ timestamps: true }` and the `toJSON` plugin (`_id → id`, strip `__v`, `password`).
- Every tenant-owned collection has `tenant: { type: ObjectId, ref: "Tenant", required: true, index: true }`.
  Every query in a `*Model.js` file **must** filter by tenant. No exceptions.
- Enums come from `config/constants.js` so schema, seeder and frontend types agree.
- Denormalised display fields from the mock (`ownerName`, `userName`, `applicantName`, `employeeName`, `dept`) are
  **kept** as snapshot strings to avoid `populate` on every list, but the `ObjectId` ref is the truth.
  Response field names stay the same as the mock types (`src/types/index.ts`) so views do not change.

## Collections

### Tenant
| field | type | notes |
|---|---|---|
| name | String req | "Technologies Ltd" |
| code | String req unique | "TECH-BD" |
| domain | String | |
| currency | String | "BDT (৳)" — symbol derived client-side |
| timezone | String | "Asia/Dhaka" |
| activePlan | String | |

### User
| field | type | notes |
|---|---|---|
| tenant | ref Tenant | |
| name, email | String req | unique index `{ tenant, email }`; `email` lowercase |
| password | String req, `select:false` | bcrypt hash (pre-save hook) |
| role | enum ROLES | `Super Admin, Admin, HR, Manager, Member` |
| department | ref Department | + `dept` snapshot string |
| team | String | team name inside department |
| manager | ref User | used to route approvals / notifications |
| designation, phone, avatar | String | avatar = initials if empty |
| empCode | String | "EMP-0002" — used by payroll |
| baseSalary | Number ≥ 0 | |
| isActive | Boolean default true | |
| methods | `matchPassword(plain)` | |

### Role
| field | type | notes |
|---|---|---|
| tenant | ref Tenant, required | roles are **per tenant** (seeded 5 defaults per tenant) |
| scope | enum `self, team, department, tenant` | data visibility (08 §3.2) |
| isSystem | Boolean | default roles cannot be deleted |
| name | String req | unique `{ tenant, name }` |
| guard | String default "api" | mock showed "sanctum" — cosmetic |
| permissions | [String] | keys from `PERMISSIONS` |

`PERMISSIONS` live in `config/permissions.js` and use the **mock's keys** (`dashboard.view_stats`, `timelog.record`,
`leave.request`, `tasks.create`, `org.manage`, …) plus a few additions — the authoritative list and default matrix are in
**`08-current-scope.md §3.1`**.

### Department
| field | type | notes |
|---|---|---|
| tenant | ref | |
| name, code | String req | unique `{ tenant, code }` |
| hod | ref User | + `hodName` snapshot |
| budget | Number | mock stored "৳ 500,000" string → store number, format client-side |
| teams | `[{ name, lead: ref User, leadName, members: [ref User] }]` | embedded |

### Task
| field | type | notes |
|---|---|---|
| tenant, owner (ref User), ownerName, dept | | |
| title | String req | |
| desc | String | |
| category | enum `Field Visit, Sales, Collection, Admin, Service` | |
| priority | enum `Low, Medium, High, Critical` | |
| status | enum `Draft, Submitted, Approved, Rejected` | default Draft |
| due | Date | mock used "Sep 25, 2026" strings |
| progress | Number 0–100 | |
| hoursLogged | Number | **derived** — sum of TimeEntry.durationHours, updated by service |
| targetQuantity, completedQuantity | Number | progress can be derived = completed/target |
| preset | ref TaskPreset (optional) | |
| monthlyPlan | ref MonthlyPlan (optional) | |
| monthCycle | String "2026-09" | groups "submit full plan" |
| proofAttachments | `[{ title, fileName, type, gpsCoordinates, geofenceStatus, timestamp: Date, previewUrl }]` | embedded |
| reviewedBy, reviewRemarks | | |
Indexes: `{ tenant, owner, monthCycle }`, `{ tenant, status }`, text index on `title, desc` for search.

### TaskPreset
`tenant, name, category, freq (Daily|Weekly|Monthly|Quarterly), target:Number, role:String, proofType:String,
status (Published|Draft)`

### MonthlyPlan
| field | notes |
|---|---|
| tenant, department, dept, team | |
| monthCycle | `"2026-09"` (display "September 2026" client-side); unique `{ tenant, team, monthCycle }` |
| targetObjective, operationalNotes | String |
| repsCount | Number (mock: "4 Reps") |
| tasksCount | Number — derived from tasks linked |
| targetQuantity | Number + `targetUnit` String ("visits") |
| progressRollup | Number — derived avg of linked task progress |
| status | `In Progress, Submitted, Approved, Under Revision` |
| createdBy, reviewedBy | ref User |

### TimeEntry
`tenant, user, userName, task (ref), taskTitle, date (YYYY-MM-DD), startTime (Date), endTime (Date),
durationHours, category, location, notes, idleTimeMinutes, idleAction (kept|discarded), source (timer|manual),
status (Draft|Submitted|Approved), timesheet (ref), isAdjustment (Boolean — written by timesheet cell edits)`
Index `{ tenant, user, date }`.

### Timesheet (one per user per ISO week)
`tenant, user, userName, weekStart (Date, Monday), weekEnd, weekLabel ("Week 37"),
dailyHours { mon..sun: Number }, totalHours, status (Draft|Submitted|Approved|Flagged), idleFlags,
submittedAt, approvedBy (ref) + approvedByName, remarks`
Unique `{ tenant, user, weekStart }`. `totalHours` recomputed in a pre-save hook.

### LeaveRequest
`tenant, user, applicantName, dept, type (Casual|Sick|Annual|Unpaid Leave), startDate, endDate,
days:Number (working days, computed), duration (display string, computed), reason,
status (Pending Manager|Pending HR|Approved|Rejected), appliedAt, approvedBy, remarks, certificateAttachment`

### LeaveBalance
`tenant, user, year, casualTotal, casualUsed, sickTotal, sickUsed, annualTotal, annualUsed, unpaidUsed`
Unique `{ tenant, user, year }`. Created on user creation / seeding.

### ActiveTimer (one per user)
`tenant, user (unique), task, taskTitle, startedAt, lastResumedAt, accumulatedSeconds, running, idleDiscardedSeconds`

### Holiday
`tenant, title, date (Date), type (National|Religious|Company), description` — `day` derived on client.
Unique `{ tenant, date }`.

### Attendance
`tenant, user, userName, date (YYYY-MM-DD), clockIn (Date), clockOut (Date), durationMinutes,
status (Present|Late|Absent|Half-Day|Leave), location, note`
Unique `{ tenant, user, date }`. `status` computed: Late if clockIn > settings.officeStart + graceMinutes.

### Payroll
`tenant, user, employeeName, empCode, dept, role, month ("2026-09"), baseSalary, presentDays, absentDays,
leaveDays, bonus, deductions, overtimeHours, netSalary, status (Draft|Calculated|Disbursed), paymentMethod,
disbursedAt` — unique `{ tenant, user, month }`.

### Notification
`tenant, recipients [ref User] (empty = everyone in tenant with the permission in audience), audiencePerm (String),
title, message, category (timesheet|plan|leave|attendance|payroll|security), linkTab, readBy [ref User]`
`read` is computed per requesting user in the controller (`readBy.includes(req.user.id)`).

### Setting (one per tenant)
`tenant (unique), idleThresholdSeconds=60, defaultWorkingHours=8, officeStartTime="09:00", lateGraceMinutes=15,
monthlySubmissionDay=25, approvalWindowDay=28, overtimeRateMultiplier=1.5, workingDays=[Number] (0=Sun; TECH-BD Sun–Thu),
deductionFormula (display string), leaveAllowance { casual=10, sick=7, annual=15 }, sickCertificateAfterDays=1`

## Relationship diagram

```
Tenant 1─* User *─1 Department (teams[] embedded)
User 1─* Task *─0..1 MonthlyPlan          Task *─0..1 TaskPreset
User 1─* TimeEntry *─1 Task               TimeEntry *─1 Timesheet (user+week)
User 1─* LeaveRequest   User 1─1 LeaveBalance (per year)
User 1─* Attendance (per day)   User 1─* Payroll (per month)
Tenant 1─* Holiday, Notification, Role(custom)   Tenant 1─1 Setting
```
