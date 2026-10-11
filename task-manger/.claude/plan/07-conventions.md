# 07 — Conventions

## Backend (follow SE331 code exactly)

- CommonJS: `const x = require(...)`, `module.exports = { ... }`.
- Controllers: `async function name(req, res, next) { try { ... } catch (error) { next(error); } }` — same shape as
  `projectController.js`. Validation failures `return res.status(400).json({ success:false, message })`.
- Model-function files (`taskModel.js`) are the **only** place that calls Mongoose for that collection, and every
  function takes `tenantId` as its first argument: `getAllTasks(tenantId, filters)`, `getTaskById(tenantId, id)`.
- Routes: one line per endpoint with the `// METHOD /api/path` comment like `projectRoutes.js`.
- Update calls use `{ new: true, runValidators: true }`.
- Never `Object.assign(doc, req.body)` — pick allowed fields explicitly.
- Never trust ids/names from the body for ownership (`userId`, `ownerName`, `tenantId`) — derive from `req.user`.
- Invalid ObjectId → 404, not 500 (handle `CastError` in `errorHandler`).
- Short header comment per file explaining its role (SE331 style), no line-by-line noise.

## Frontend

- TypeScript, functional components, hooks. Keep mock component names and Tailwind classes.
- All HTTP through `src/api/*Service.ts`. No `fetch` in components.
- `src/types/index.ts` is the contract; when the API shape changes, change the type first.
- No `any` in new code (mock's existing `any` can stay until that file is touched).

## Naming

| Thing | Style | Example |
|---|---|---|
| Mongoose model file | PascalCase singular | `LeaveRequest.js` |
| Model-function file | camelCase + `Model` | `leaveModel.js` |
| Controller / routes | camelCase + suffix | `leaveController.js`, `leaveRoutes.js` |
| Permission keys | `module.action` | `leave.approve` |
| API paths | kebab-case plural | `/monthly-plans`, `/task-presets` |
| React components | PascalCase | `ApprovalsView.tsx` |

## Git

- `git init` inside `task-manger/` in Phase 0. Branch per phase/module: `feat/m5-tasks`.
- Conventional commits (`feat(tasks): add review endpoint`). Commit at the end of each checklist item group.
- Never commit `.env`, `node_modules`, `dist`.

## Definition of done per task

1. Code follows the layering above.
2. Happy path + one failure path tried manually (curl / Thunder Client / UI) — or a test exists.
3. Tenant isolation respected (query includes tenant).
4. The box in the step's plan file (09 or 10) is ticked and `PROGRESS.md` updated.
