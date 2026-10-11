import express, { Request, Response } from 'express';
import { db, Task, TimeEntry, LeaveRequest, AttendanceRecord, MonthlyPlan } from './db';

export const apiRouter = express.Router();

// Helper to get active tenant ID from request header or fallback
function getTenantId(req: Request): string {
  return (req.headers['x-tenant-id'] as string) || (req.query.tenantId as string) || 'tenant-bd';
}

// -----------------------------------------------------------------------------
// 1. TENANTS & CONTEXT
// -----------------------------------------------------------------------------
apiRouter.get('/tenants', (req: Request, res: Response) => {
  res.json({ tenants: db.tenants });
});

apiRouter.get('/auth/current-user', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  // Default to user 1 (Adhara Paul) or user 2 (Mahmud)
  const user = db.users.find(u => u.tenantId === tenantId) || db.users[0];
  res.json({ user, tenant: db.tenants.find(t => t.id === tenantId) });
});

// -----------------------------------------------------------------------------
// 2. DASHBOARD MANAGEMENT (Member 1: Adhara Paul)
// Employee count, active tasks, attendance summary, payroll overview, workforce stats
// -----------------------------------------------------------------------------
apiRouter.get('/dashboard/stats', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const tenantUsers = db.users.filter(u => u.tenantId === tenantId);
  const tenantTasks = db.tasks.filter(t => t.tenantId === tenantId);
  const tenantAttendance = db.attendanceRecords.filter(a => a.tenantId === tenantId);
  const tenantPayroll = db.payrollRecords.filter(p => p.tenantId === tenantId);
  const tenantLeaves = db.leaves.filter(l => l.tenantId === tenantId);
  const tenantTimesheets = db.timesheets.filter(t => t.tenantId === tenantId);

  // Workforce stats
  const employeeCount = tenantUsers.length || 16;
  const activeTasks = tenantTasks.filter(t => t.status === 'Approved' || t.status === 'Submitted');
  const completedTasks = tenantTasks.filter(t => t.progress === 100);
  const taskCompletionRate = tenantTasks.length ? Math.round((completedTasks.length / tenantTasks.length) * 100) : 84;

  // Attendance summary
  const todayAttendance = tenantAttendance.filter(a => a.date === '2026-09-11');
  const clockedInCount = todayAttendance.filter(a => a.status === 'Present' || a.status === 'Late').length || 14;
  const onLeaveCount = tenantLeaves.filter(l => l.status === 'Approved').length || 2;
  const lateCount = todayAttendance.filter(a => a.status === 'Late').length || 1;

  // Payroll overview
  const totalGrossPayroll = tenantPayroll.reduce((acc, p) => acc + p.baseSalary + p.bonus, 0) || 1420000;
  const totalDeductions = tenantPayroll.reduce((acc, p) => acc + p.deductions, 0) || 24500;
  const totalBonuses = tenantPayroll.reduce((acc, p) => acc + p.bonus, 0) || 85000;
  const totalNetPayable = totalGrossPayroll - totalDeductions;

  // Time tracking overview
  const totalLoggedHours = tenantTimesheets.reduce((acc, t) => acc + t.totalHours, 0) || 1248;
  const activeTimersCount = 11; // 11 field reps with web timers active

  // Monthly plan rollup
  const tenantPlans = db.monthlyPlans.filter(p => p.tenantId === tenantId);
  const avgPlanProgress = tenantPlans.length
    ? Math.round(tenantPlans.reduce((acc, p) => acc + p.progressRollup, 0) / tenantPlans.length)
    : 78;

  res.json({
    employeeCount,
    activeTasksCount: activeTasks.length,
    totalTasksCount: tenantTasks.length,
    taskCompletionRate,
    attendanceSummary: {
      clockedInCount,
      totalHeadcount: employeeCount,
      onLeaveCount,
      lateCount,
      attendanceRate: '95.2%'
    },
    payrollOverview: {
      grossTotal: totalGrossPayroll,
      deductionsTotal: totalDeductions,
      bonusesTotal: totalBonuses,
      netPayable: totalNetPayable,
      status: 'Disbursement Ready',
      currency: tenantId === 'apex-agency' ? '$' : tenantId === 'ever-global' ? '£' : '৳'
    },
    workforceStatistics: {
      totalLoggedHours,
      activeTimersCount,
      avgPlanProgress,
      pendingApprovalsCount: 5,
      departmentBreakdown: [
        { name: 'Field Sales', count: 8, hours: 540, progress: 90 },
        { name: 'Engineering', count: 4, hours: 420, progress: 78 },
        { name: 'Marketing', count: 3, hours: 180, progress: 62 },
        { name: 'Human Resources', count: 1, hours: 108, progress: 45 }
      ]
    }
  });
});

// -----------------------------------------------------------------------------
// 3. TIME TRACKING (Member 1: Adhara Paul)
// Working hours, timesheets, task-based time entries, web timer, and time summaries
// -----------------------------------------------------------------------------
apiRouter.get('/time/entries', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const entries = db.timeEntries.filter(t => t.tenantId === tenantId);
  res.json({ entries });
});

apiRouter.post('/time/entries', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const { taskId, durationHours, notes, category, location, date, startTime, endTime, source, idleAction } = req.body;
  const task = db.tasks.find(t => t.id === taskId);

  const newEntry: TimeEntry = {
    id: `te-${Date.now()}`,
    tenantId,
    userId: 'usr-2',
    userName: 'Mahmud Sahiuddin',
    taskId: taskId || 'task-1',
    taskTitle: task ? task.title : 'Manual Operation Log',
    date: date || new Date().toISOString().split('T')[0],
    startTime: startTime || '10:00 AM',
    endTime: endTime || '12:30 PM',
    durationHours: parseFloat(durationHours) || 1.0,
    category: category || 'Field Operational Visit',
    location: location || 'Headquarters / Route Outlets',
    notes: notes || 'Standard operational task time logged.',
    source: source || 'manual',
    idleAction: idleAction,
    status: 'Submitted'
  };

  db.timeEntries.unshift(newEntry);

  // Update associated task logged hours and progress
  if (task) {
    task.hoursLogged = parseFloat((task.hoursLogged + newEntry.durationHours).toFixed(1));
    task.progress = Math.min(100, task.progress + Math.round(newEntry.durationHours * 3));
  }

  // Update weekly timesheet row for the task
  const userTimesheet = db.timesheets.find(ts => ts.userId === newEntry.userId);
  if (userTimesheet) {
    const dayKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][new Date().getDay()];
    userTimesheet.dailyHours[dayKey] = parseFloat(((userTimesheet.dailyHours[dayKey] || 0) + newEntry.durationHours).toFixed(1));
    userTimesheet.totalHours = parseFloat((Object.values(userTimesheet.dailyHours).reduce((a, b) => a + b, 0)).toFixed(1));
  }

  res.status(201).json({ entry: newEntry, updatedTask: task });
});

apiRouter.get('/time/timesheets', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const timesheets = db.timesheets.filter(ts => ts.tenantId === tenantId);
  res.json({ timesheets });
});

apiRouter.put('/time/timesheets/:id/cell', (req: Request, res: Response) => {
  const { id } = req.params;
  const { day, hours } = req.body;
  const ts = db.timesheets.find(t => t.id === id);
  if (!ts) return res.status(404).json({ error: 'Timesheet not found' });

  ts.dailyHours[day] = parseFloat(hours) || 0;
  ts.totalHours = parseFloat(Object.values(ts.dailyHours).reduce((a, b) => a + b, 0).toFixed(1));
  res.json({ timesheet: ts });
});

apiRouter.post('/time/timesheets/:id/submit', (req: Request, res: Response) => {
  const { id } = req.params;
  const ts = db.timesheets.find(t => t.id === id);
  if (!ts) return res.status(404).json({ error: 'Timesheet not found' });

  ts.status = 'Submitted';
  ts.submittedAt = new Date().toLocaleString();

  // Add system notification for manager review
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    tenantId: ts.tenantId,
    title: 'Weekly Timesheet Submitted',
    message: `${ts.userName} submitted ${ts.weekLabel} (${ts.totalHours} hrs) for approval.`,
    category: 'timesheet',
    timestamp: 'Just now',
    read: false,
    linkTab: 'approvals'
  });

  res.json({ timesheet: ts, message: 'Timesheet submitted successfully!' });
});

apiRouter.post('/time/timesheets/:id/approve', (req: Request, res: Response) => {
  const { id } = req.params;
  const { action, remarks } = req.body;
  const ts = db.timesheets.find(t => t.id === id);
  if (!ts) return res.status(404).json({ error: 'Timesheet not found' });

  if (action === 'flag') {
    ts.status = 'Flagged';
  } else {
    ts.status = 'Approved';
    ts.approvedBy = 'Adhara Paul (Workforce Operations Lead)';
  }

  res.json({ timesheet: ts, message: `Timesheet ${ts.status.toLowerCase()}!` });
});

apiRouter.post('/time/timesheets/batch-approve', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const pending = db.timesheets.filter(ts => ts.tenantId === tenantId && ts.status === 'Submitted');
  pending.forEach(ts => {
    ts.status = 'Approved';
    ts.approvedBy = 'Adhara Paul (Workforce Operations Lead)';
  });
  res.json({ approvedCount: pending.length, message: `Approved ${pending.length} timesheets successfully!` });
});

// -----------------------------------------------------------------------------
// 4. LEAVE & HOLIDAY MANAGEMENT (Member 1: Adhara Paul)
// Leave applications, approval/rejection, leave balances, holidays, and leave history
// -----------------------------------------------------------------------------
apiRouter.get('/leaves', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const leaves = db.leaves.filter(l => l.tenantId === tenantId);
  const userId = (req.query.userId as string) || 'usr-2';
  const balance = db.leaveBalances[userId] || {
    tenantId,
    userId,
    casualTotal: 10,
    casualUsed: 1,
    sickTotal: 7,
    sickUsed: 0,
    annualTotal: 15,
    annualUsed: 0,
    unpaidUsed: 0
  };

  res.json({ leaves, balance });
});

apiRouter.post('/leaves/apply', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const { type, startDate, endDate, duration, reason, applicantName, dept, certificateAttachment } = req.body;

  const newLeave: LeaveRequest = {
    id: `leave-${Date.now()}`,
    tenantId,
    userId: 'usr-2',
    applicantName: applicantName || 'Mahmud Sahiuddin',
    dept: dept || 'Field Sales',
    type: type || 'Casual Leave',
    startDate: startDate || '2026-09-18',
    endDate: endDate || '2026-09-18',
    duration: duration || '1 Day',
    reason: reason || 'Personal emergency leave',
    status: 'Pending HR',
    appliedAt: new Date().toISOString().split('T')[0],
    certificateAttachment: certificateAttachment || undefined
  };

  db.leaves.unshift(newLeave);

  // Add system notification for manager / HR
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    tenantId,
    title: 'New Leave Application',
    message: `${newLeave.applicantName} applied for ${newLeave.type} (${newLeave.duration}).`,
    category: 'leave',
    timestamp: 'Just now',
    read: false,
    linkTab: 'approvals'
  });

  res.status(201).json({ leave: newLeave, message: 'Leave application submitted successfully!' });
});

apiRouter.put('/leaves/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, remarks } = req.body;
  const leave = db.leaves.find(l => l.id === id);
  if (!leave) return res.status(404).json({ error: 'Leave request not found' });

  leave.status = status;
  leave.remarks = remarks || (status === 'Approved' ? 'Approved in accordance with company policy.' : 'Declined.');
  leave.approvedBy = 'Adhara Paul (Workforce Lead)';

  // If approved, update user leave balance
  if (status === 'Approved' && db.leaveBalances[leave.userId]) {
    const bal = db.leaveBalances[leave.userId];
    if (leave.type.includes('Casual')) bal.casualUsed += 1;
    else if (leave.type.includes('Sick')) bal.sickUsed += 1;
    else if (leave.type.includes('Annual')) bal.annualUsed += 1;
    else bal.unpaidUsed += 1;
  }

  res.json({ leave, message: `Leave application marked as ${status}!` });
});

apiRouter.get('/holidays', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const holidays = db.holidays.filter(h => h.tenantId === tenantId);
  res.json({ holidays });
});

apiRouter.post('/holidays', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const { title, date, day, type, description } = req.body;
  const newHoliday = {
    id: `hol-${Date.now()}`,
    tenantId,
    title,
    date,
    day: day || 'Monday',
    type: type || 'National',
    description: description || ''
  };
  db.holidays.push(newHoliday);
  res.status(201).json({ holiday: newHoliday });
});

// -----------------------------------------------------------------------------
// 5. RBAC & MULTI-TENANCY (Member 1: Adhara Paul)
// Roles, permissions, organization-specific data access, protected APIs, organization isolation
// -----------------------------------------------------------------------------
apiRouter.get('/rbac/matrix', (req: Request, res: Response) => {
  res.json({
    permissions: db.spatiePermissions,
    roles: ['Super Admin', 'Admin', 'HR', 'Manager', 'Member']
  });
});

apiRouter.get('/rbac/departments', (req: Request, res: Response) => {
  res.json({ departments: db.departments });
});

apiRouter.post('/rbac/departments', (req: Request, res: Response) => {
  const { name, code, hod, budget, initialTeam } = req.body;
  const newDept = {
    name,
    code,
    hod,
    budget: budget || '৳ 500,000',
    teams: [
      {
        name: initialTeam || `${name} Primary Team`,
        lead: hod,
        members: ['Staff Associate (Operational Rep)']
      }
    ]
  };
  db.departments.push(newDept);
  res.status(201).json({ department: newDept, message: 'Department registered in organization tree!' });
});

apiRouter.post('/rbac/roles', (req: Request, res: Response) => {
  const { name, guard, permissions } = req.body;
  res.status(201).json({
    role: { name, guard: guard || 'sanctum', permissions },
    message: `Spatie role "${name}" registered and assigned to guard.`
  });
});

// -----------------------------------------------------------------------------
// 6. TASKS & PRESETS (Member 2: Anindita Ghosh Mridu)
// -----------------------------------------------------------------------------
apiRouter.get('/tasks', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const { category, status, search } = req.query;
  let result = db.tasks.filter(t => t.tenantId === tenantId);

  if (category) result = result.filter(t => t.category === category);
  if (status) result = result.filter(t => t.status === status);
  if (search) {
    const q = (search as string).toLowerCase();
    result = result.filter(t => t.title.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q));
  }

  res.json({ tasks: result });
});

apiRouter.post('/tasks', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const { title, desc, category, priority, due, targetQuantity } = req.body;

  const newTask: Task = {
    id: `task-${Date.now()}`,
    tenantId,
    title,
    desc: desc || 'Field operational task assignment.',
    category: category || 'Field Visit',
    priority: priority || 'Medium',
    status: 'Draft',
    due: due || 'Sep 25, 2026',
    progress: 0,
    hoursLogged: 0,
    ownerId: 'usr-2',
    ownerName: 'Mahmud Sahiuddin',
    dept: 'Field Sales',
    targetQuantity: parseInt(targetQuantity) || 25,
    completedQuantity: 0
  };

  db.tasks.unshift(newTask);
  res.status(201).json({ task: newTask, message: 'Task added to monthly draft plan!' });
});

apiRouter.put('/tasks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const task = db.tasks.find(t => t.id === id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  Object.assign(task, req.body);
  res.json({ task, message: 'Task updated successfully!' });
});

apiRouter.delete('/tasks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.tasks.findIndex(t => t.id === id);
  if (index === -1) return res.status(404).json({ error: 'Task not found' });

  const deleted = db.tasks.splice(index, 1)[0];
  res.json({ deleted, message: 'Task removed!' });
});

apiRouter.post('/tasks/submit-plan', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const draftTasks = db.tasks.filter(t => t.tenantId === tenantId && t.status === 'Draft');
  draftTasks.forEach(t => t.status = 'Submitted');

  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    tenantId,
    title: 'Full Monthly Plan Submitted',
    message: `Mahmud Sahiuddin submitted ${draftTasks.length} plan tasks for Supervisor review.`,
    category: 'plan',
    timestamp: 'Just now',
    read: false,
    linkTab: 'approvals'
  });

  res.json({ submittedCount: draftTasks.length, message: 'Full September monthly plan submitted for approval!' });
});

apiRouter.get('/task-presets', (req: Request, res: Response) => {
  res.json({ presets: db.taskPresets });
});

apiRouter.post('/task-presets', (req: Request, res: Response) => {
  const { name, category, freq, target, role, proofType } = req.body;
  const newPreset = {
    id: `pre-${Date.now()}`,
    name,
    category: category || 'Field Visit',
    freq: freq || 'Daily',
    target: parseInt(target) || 25,
    role: role || 'SO, ASE',
    proofType: proofType || 'GPS Geofence + Photo',
    status: 'Published' as const
  };
  db.taskPresets.push(newPreset);
  res.status(201).json({ preset: newPreset, message: 'Master Task Preset published!' });
});

// -----------------------------------------------------------------------------
// 7. MONTHLY PLANNING (Member 2: Anindita Ghosh Mridu)
// -----------------------------------------------------------------------------
apiRouter.get('/monthly-plans', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const plans = db.monthlyPlans.filter(p => p.tenantId === tenantId);
  res.json({ plans });
});

apiRouter.post('/monthly-plans', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const { team, dept, targetObjective, repsCount, tasksCount, targetQuantity, operationalNotes } = req.body;

  const newPlan: MonthlyPlan = {
    id: `plan-${Date.now()}`,
    tenantId,
    team: team || 'Field Sales Alpha',
    dept: dept || 'Field Sales',
    targetObjective: targetObjective || '350 Retail Outlets + ৳1.4M Collection',
    repsCount: repsCount || '4 Reps',
    tasksCount: parseInt(tasksCount) || 25,
    targetQuantity: targetQuantity || '350 visits',
    progressRollup: 0,
    status: 'In Progress',
    monthCycle: 'September 2026',
    operationalNotes
  };

  db.monthlyPlans.push(newPlan);
  res.status(201).json({ plan: newPlan, message: 'Team Monthly Plan registered!' });
});

// -----------------------------------------------------------------------------
// 8. ATTENDANCE (Member 3: Rafsan Alam Rishad)
// -----------------------------------------------------------------------------
apiRouter.get('/attendance', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const records = db.attendanceRecords.filter(a => a.tenantId === tenantId);
  res.json({ records });
});

apiRouter.post('/attendance/punch', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const { action, location, note } = req.body;
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toISOString().split('T')[0];

  let record = db.attendanceRecords.find(a => a.tenantId === tenantId && a.userId === 'usr-2' && a.date === '2026-09-11');

  if (action === 'clock-out') {
    if (record) {
      record.clockOut = timeStr;
      record.duration = '8h 15m (Completed)';
    }
    return res.json({ status: 'Clocked Out', time: timeStr, record });
  } else {
    if (!record) {
      record = {
        id: `att-${Date.now()}`,
        tenantId,
        userId: 'usr-2',
        userName: 'Mahmud Sahiuddin',
        date: '2026-09-11',
        clockIn: timeStr,
        duration: 'Active Session',
        status: 'Present',
        location: location || 'HQ - Gulshan Office',
        note: note || 'Clocked in from web interface'
      };
      db.attendanceRecords.unshift(record);
    } else {
      record.clockIn = timeStr;
      record.status = 'Present';
      record.location = location || record.location;
    }
    return res.json({ status: 'Clocked In', time: timeStr, record });
  }
});

// -----------------------------------------------------------------------------
// 9. PAYROLL (Member 3: Rafsan Alam Rishad)
// -----------------------------------------------------------------------------
apiRouter.get('/payroll', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const records = db.payrollRecords.filter(p => p.tenantId === tenantId);
  res.json({ records });
});

apiRouter.post('/payroll/generate', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const records = db.payrollRecords.filter(p => p.tenantId === tenantId);
  records.forEach(r => {
    r.status = 'Calculated';
  });
  res.json({ count: records.length, message: 'September 2026 payroll successfully calculated!' });
});

// -----------------------------------------------------------------------------
// 10. NOTIFICATIONS
// -----------------------------------------------------------------------------
apiRouter.get('/notifications', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const notifs = db.notifications.filter(n => n.tenantId === tenantId);
  res.json({ notifications: notifs });
});

apiRouter.post('/notifications/mark-read', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  db.notifications.filter(n => n.tenantId === tenantId).forEach(n => n.read = true);
  res.json({ message: 'All notifications marked as read' });
});

// -----------------------------------------------------------------------------
// 11. SETTINGS & POLICIES
// -----------------------------------------------------------------------------
apiRouter.get('/settings', (req: Request, res: Response) => {
  res.json({ settings: db.settings });
});

apiRouter.put('/settings', (req: Request, res: Response) => {
  Object.assign(db.settings, req.body);
  res.json({ settings: db.settings, message: 'Configuration saved!' });
});
