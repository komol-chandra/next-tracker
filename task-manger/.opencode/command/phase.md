---
description: Execute one build phase from the plan (e.g. /phase S2)
---

Execute phase **$ARGUMENTS** of the build plan.

1. Read `.claude/plan/00-overview.md`, `.claude/plan/07-conventions.md`, and `.claude/plan/08-current-scope.md`. Ids `S0`–`S8` are in 08 §6 (current sprint); ids `P0`–`P10` are in `06-phases.md` (roadmap).
2. Read only the other plan files that phase references (data model, API spec, seeder, frontend).
3. Check `PROGRESS.md`: if the previous phase gate has not passed, stop and report what is missing.
4. Implement the unchecked tasks of the phase in order. Mirror `../SE331-Design-Capstone-Project-main` layering and copy UI from `../task-manger-moc/src` (visuals only, never its fake data).
5. Run the phase **Gate** checks and show their real output.
6. Tick finished boxes in the plan file the step came from, update the phase row in `PROGRESS.md`, and summarise what was done, what was skipped, and any deviation from the plan.
