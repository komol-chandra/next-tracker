const router = require("express").Router();
const {
  getTimer,
  startTimer,
  pauseTimer,
  resumeTimer,
  stopTimer,
  discardTimer,
  setIdle,
  getWeeklyTimesheet,
  updateTimesheetCell,
  submitTimesheet,
  getTimesheets,
  approveTimesheet,
  getTimeEntries,
  createTimeEntry,
} = require("../controllers/timeController");

router.get("/timer", getTimer);
router.post("/timer/start", startTimer);
router.post("/timer/pause", pauseTimer);
router.post("/timer/resume", resumeTimer);
router.post("/timer/stop", stopTimer);
router.post("/timer/discard", discardTimer);
router.post("/idle", setIdle);
router.get("/timesheets/week", getWeeklyTimesheet);
router.put("/timesheets/:id/cell", updateTimesheetCell);
router.post("/timesheets/:id/submit", submitTimesheet);
router.get("/timesheets", getTimesheets);
router.post("/timesheets/:id/approve", approveTimesheet);
router.get("/entries", getTimeEntries);
router.post("/entries", createTimeEntry);

module.exports = router;