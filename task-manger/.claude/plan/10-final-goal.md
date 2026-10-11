# 10 — Final Goal & Token-Optimized Run Order

> **This file drives the work from now on.** Order here wins over `08 §6`. Specs (what "done" means) still come
> from `08 §4` — read only the section a step names.

## Final goal — 7 screens fully working

| Screen | Spec | Step |
|---|---|---|
| Configuration | 08 §4.8 | F1 |
| Org & Spatie RBAC | 08 §3, §4.6 | F2 |
| Task Presets (+ Tasks core API) | 08 §4.7, §4.4 (API only) | F3 |
| Leave & Holidays | 08 §4.3 | F4 |
| Time Tracker | 08 §4.2 | F5 |
| User-wise Log | 08 §4.5 | F6 |
| Overview | 08 §4.1 | F7 |
| + Login / logout / profile / sidebar / topbar | 08 §4.9 | I4–I5 |

**Not in goal:** My Tasks screen, Monthly Planning, HR & Attendance, Approvals, Payroll, Reports → sidebar `Soon` +
`ComingSoon`. The **Tasks API is still built** (F3), because Timer, User log and Overview read tasks. Tasks come from the
seeder plus `POST /tasks`. Turning on the My Tasks screen later costs one extra step (~1 session).

## Run order (one step = one Claude session, `/clear` between)

| # | Step | Model | Est. time |
|---|---|---|---|
| I0–I6 | Init (see `09-init-scope.md`; I6 ports only the 7 goal views) | Sonnet | ~10 h |
| F1 | Configuration: settings + tenant API → SettingsView | Sonnet | 1 h |
| F2 | Org & RBAC: tree, depts, teams, users, matrix, roles, `utils/scope.js` → OrgRbacView + modals | Opus | 3 h |
| F3 | Task Presets CRUD + Tasks core API (list/get/create/update/progress/review) → TaskPresetsView | Sonnet | 1.5 h |
| F4 | Holidays + `utils/dates` + Leaves (preview, rules, 2-stage, balances) → LeaveManagementView + modals | Opus | 3 h |
| F5 | Time: ActiveTimer, idle, entries, week grid, cell edit, submit/approve → TimeTrackerView + sidebar timer | Opus | 4 h |
| F6 | User-wise log + CSV/print → UserReportView | Sonnet | 1 h |
| F7 | Dashboard stats my/team + member detail → DashboardView + MemberDetailModal | Opus | 2.5 h |
| F8 | Notifications wiring + integration tests (401/403/404/409, isolation, flows) + README | Sonnet | 2.5 h |
| | **Total** | | **≈ 28–30 h ≈ 4–5 working days** |

Each F step is a **vertical slice** (API + screen in one session). The spec section is read once and the API shape is
still in context when the screen is wired. That saves a full re-read compared with 08's "all APIs, then all screens".

Gate per F step: the `Acceptance` bullets of its 08 §4 section, plus `curl` checks for one 403, one 404 (other tenant)
and one 409. Show only the tail of the output.

## Token rules (follow in every session)

1. **One step per session.** `/clear` after the gate passes and `PROGRESS.md` is updated. Never carry two steps in one
   context.
2. **Read sections, not files.** `grep -n "^### 4.3" .claude/plan/08-current-scope.md`, then `Read` with offset/limit.
   Never read 08 whole (7.7k tok).
3. **Never read `ModalRoot.tsx` whole** (17.8k tok). `grep -n "case '" …/ModalRoot.tsx` → read only the modal's range.
4. **Copy, don't retype.** Port mock files with `cp`, then `Edit` only the data/logic lines. Writing a file costs
   output tokens; `cp` costs zero.
5. **Don't read the mock server** (`server/db.ts`, `routes.ts`, 13.6k tok). The plan already has the data and rules.
   Grep it only for one specific value.
6. **Quiet commands.** `npm test 2>&1 | tail -30`, `npm run build 2>&1 | tail -20`, `curl -s … | head -c 600`.
7. **No subagents.** Each one starts cold and re-reads the plan. Do the work inline.
8. **Model per step:** Sonnet for mechanical steps (scaffold, models, seeder, port, CRUD); Opus for logic-heavy ones
   (scope, leave workflow, timer, dashboard aggregates). Switch with `/model`.
9. **Don't re-read files you just wrote/edited.** Trust the tool result; verify by running, not by reading.
10. **Check spend:** `/context` mid-session. If context passes ~120k, finish the current sub-task, update PROGRESS.md, and
    `/clear`.

## Token budget (estimates)

How it is counted: every turn re-sends the whole context. Most of that is **cache reads** (cheap, ~10% of the normal
input price). What really costs is **new input** (files read, tool output) and **output** (code written + reasoning).

Baseline per turn ≈ 20k (Claude Code system + tools) + CLAUDE.md imports.

| Step | Turns | New reads | Output (code) | Avg context | Total input processed |
|---|---|---|---|---|---|
| I0 Setup | 15 | 3k | 4k | 30k | 0.45M |
| I1 Backend arch | 20 | 6k | 8k | 40k | 0.80M |
| I2 Models | 25 | 5k | 18k | 50k | 1.25M |
| I3 Seeder | 25 | 6k | 15k | 55k | 1.40M |
| I4 Auth API | 25 | 5k | 10k | 50k | 1.25M |
| I5 Frontend shell | 35 | 20k | 20k | 70k | 2.45M |
| I6 Port 7 views | 35 | 23k | 15k | 80k | 2.80M |
| F1 Configuration | 20 | 4k | 8k | 45k | 0.90M |
| F2 Org & RBAC | 40 | 10k | 25k | 80k | 3.20M |
| F3 Presets + Tasks API | 25 | 5k | 12k | 55k | 1.40M |
| F4 Leave & Holidays | 40 | 12k | 25k | 85k | 3.40M |
| F5 Time Tracker | 50 | 15k | 30k | 95k | 4.75M |
| F6 User-wise Log | 20 | 6k | 10k | 55k | 1.10M |
| F7 Overview | 35 | 12k | 20k | 85k | 2.98M |
| F8 Notif + tests + README | 40 | 10k | 25k | 80k | 3.20M |
| **Total** | **~450** | **~140k** | **~245k** (+~50% reasoning ≈ 370k) | | **≈ 31M (≈ 90% cache reads)** |

### Without these rules (for comparison)
| Waste source | Extra |
|---|---|
| CLAUDE.md importing 00+07+08+09 (11.5k) vs 07+10 (≈2.5k): 9k × 450 turns | +4M |
| Reading 08 whole in each of 15 steps | +115k new, and it stays in context → +3M |
| Reading ModalRoot whole in ~6 sessions | +107k new → +4M carried |
| Retyping ported views instead of `cp` + Edit | +40k output |
| Running everything in 3–4 long sessions instead of 15 (context 150k+) | +30–40M |
| **Unoptimized total** | **≈ 75–85M processed, ~450k+ output** |

**≈ 2.5× less with the rules.** Long sessions are the biggest cost driver. Use `/clear` often.

These are planning estimates. Check real usage with `/context` (per session) and `/cost` or the usage page, and adjust
the table after I2 if the numbers are off by more than ~30%.
