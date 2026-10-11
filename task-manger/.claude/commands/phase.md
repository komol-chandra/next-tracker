---
description: Execute one build phase from the plan (e.g. /phase I0, /phase F1)
argument-hint: <step id, e.g. I0 or F1>
---

Execute phase **$ARGUMENTS** of the build plan.

1. Conventions and run order are already loaded via CLAUDE.md. Run order is `10-final-goal.md`. Ids `I0`–`I6` are in `09-init-scope.md`; ids `F1`–`F8` are in `10-final-goal.md` (each names its `08 §4.x` spec); ids `S0`–`S8` are in 08 §6 (current sprint); ids `P0`–`P10` are in `06-phases.md` (roadmap).
2. Follow the **token rules in `10-final-goal.md`**: read only the sections the step names (grep the heading, then Read with offset/limit). Never read whole 08, `ModalRoot.tsx`, or the mock server. Port with `cp` + Edit. No subagents.
3. Check `PROGRESS.md`: if the previous phase gate has not passed, stop and report what is missing.
4. Implement the unchecked tasks of the phase in order. Mirror `../SE331-Design-Capstone-Project-main` layering and copy UI from `../task-manger-moc/src` (visuals only, never its fake data).
5. Run the phase **Gate** checks and show their real output.
6. Tick finished boxes in the plan file the step came from, update the phase row in `PROGRESS.md`, and summarise what was done, what was skipped, and any deviation from the plan.
7. End by telling the user to `/clear` before the next step.
