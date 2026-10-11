require("dotenv").config();
const mongoose = require("mongoose");
const Tenant = require("../models/Tenant");
const User = require("../models/User");
const Role = require("../models/Role");
const Department = require("../models/Department");
const Task = require("../models/Task");
const TaskPreset = require("../models/TaskPreset");
const Holiday = require("../models/Holiday");
const Attendance = require("../models/Attendance");
const LeaveRequest = require("../models/LeaveRequest");
const LeaveBalance = require("../models/LeaveBalance");
const TimeEntry = require("../models/TimeEntry");
const Timesheet = require("../models/Timesheet");
const ActiveTimer = require("../models/ActiveTimer");
const Payroll = require("../models/Payroll");
const Setting = require("../models/Setting");

const TenantData = require("./data/tenants");
const UserData = require("./data/users");
const RoleData = require("./data/roles");
const DepartmentData = require("./data/departments");
const TaskData = require("./data/tasks");
const TaskPresetData = require("./data/task-presets");
const HolidayData = require("./data/holidays");

const {
  randomEnum,
  randomDateBetween,
  randomWorkingDay,
  generateAttendanceDays,
  generateTimeEntries,
  generatePayrollRecord,
} = "./helpers";

let tenantIds = [];
let userIds = [];
let roleIds = [];
let departmentIds = [];

const clearDB = async () => {
  await Promise.all([
    Attendance.deleteMany({}),
    LeaveRequest.deleteMany({}),
    LeaveBalance.deleteMany({}),
    Payroll.deleteMany({}),
    Task.deleteMany({}),
    TaskPreset.deleteMany({}),
    Holiday.deleteMany({}),
    TimeEntry.deleteMany({}),
    Timesheet.deleteMany({}),
    ActiveTimer.deleteMany({}),
    User.deleteMany({}),
    Role.deleteMany({}),
    Department.deleteMany({}),
    Tenant.deleteMany({}),
  ]);
  console.log("All collections cleared");
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for seeding");

    // Clear existing data if --fresh
    const args = process.argv.slice(3);
    if (args.includes("--fresh") || args.includes("--destroy")) {
      await clearDB();
    }

    // Seed Tenants
    const tenants = await Tenant.insertMany(TenantData);
    tenantIds = tenants.map((t) => t._id);
    console.log(`${tenants.length} tenants seeded`);

    const apexTenant = tenants.find((t) => t.code === "APEX");
    const techbdTenant = tenants.find((t) => t.code === "TECH-BD");

    // Map tenant placeholders to actual IDs
    const updatedUsers = UserData.map((u) => {
      if (u.email.includes("apex")) {
        u.tenant = apexTenant._id;
      } else if (u.email.includes("techbd")) {
        u.tenant = techbdTenant._id;
      }
      return u;
    });

    const updatedRoles = RoleData.map((r) => {
      if (r.name.includes("APEX")) {
        r.tenant = apexTenant._id;
      } else if (r.name.includes("TECH-BD")) {
        r.tenant = techbdTenant._id;
      }
      return r;
    });

    // Update department tenant references
    const updatedDepartments = DepartmentData.map((d) => {
      if (d.tenant && d.tenant._id && apexTenant._id.toString() === d.tenant._id.toString()) {
        d.tenant = apexTenant._id;
      } else if (d.tenant && techbdTenant._id) {
        d.tenant = techbdTenant._id;
      }
      return d;
    });

    // Seed Users
    const users = await User.insertMany(updatedUsers);
    userIds = users.map((u) => u._id);
    console.log(`${users.length} users seeded`);

    // Seed Roles
    const roles = await Role.insertMany(updatedRoles);
    roleIds = roles.map((r) => r._id);
    console.log(`${roles.length} roles seeded`);

    // Seed Departments
    const departments = await Department.insertMany(updatedDepartments);
    departmentIds = departments.map((d) => d._id);
    console.log(`${departments.length} departments seeded`);

    // Seed Tasks with proper owner references
    const updatedTasks = TaskData.map((t, i) => {
      t.owner = userIds[i % userIds.length];
      t.ownerName = users[i % users.length].name;
      return t;
    });
    const tasks = await Task.insertMany(updatedTasks);
    console.log(`${tasks.length} tasks seeded`);

    // Seed TaskPresets
    const updatedTaskPresets = TaskPresetData.map((tp) => {
      if (tp.tenant._id.toString() === apexTenant._id.toString()) {
        tp.tenant = apexTenant._id;
      } else {
        tp.tenant = techbdTenant._id;
      }
      return tp;
    });
    const taskPresets = await TaskPreset.insertMany(updatedTaskPresets);
    console.log(`${taskPresets.length} task presets seeded`);

    // Seed Holidays
    const updatedHolidays = HolidayData.map((h) => {
      if (h.tenant._id.toString() === apexTenant._id.toString()) {
        h.tenant = apexTenant._id;
      } else {
        h.tenant = techbdTenant._id;
      }
      return h;
    });
    const holidays = await Holiday.insertMany(updatedHolidays);
    console.log(`${holidays.length} holidays seeded`);

    // Seed Attendance (60 days per user) - using async/IIFE
    for (const userId of userIds) {
      const userDoc = await User.findById(userId);
      await Attendance.insertMany([
        {
          tenant: userId,
          user: userId,
          userName: userDoc.name,
          ...generateAttendanceDays(new Date("2026-09-01"), new Date("2026-10-31")),
        },
      ]);
    }
    console.log("Attendance data seeded for all users");

    // Seed LeaveRequests (some sample requests)
    const leaveRequests = [
      {
        tenant: apexTenant._id,
        user: userIds[1], // Jane Smith
        applicantName: "Jane Smith",
        dept: "Engineering",
        type: "Sick Leave",
        startDate: new Date("2026-10-10"),
        endDate: new Date("2026-10-12"),
        days: 3,
        duration: "3 working days",
        reason: "Flu",
        status: "Pending Manager",
      },
      {
        tenant: techbdTenant._id,
        user: userIds[8], // Rahman Islam
        applicantName: "Rahman Islam",
        dept: "Human Resources",
        type: "Casual Leave",
        startDate: new Date("2026-10-20"),
        endDate: new Date("2026-10-22"),
        days: 3,
        duration: "3 working days",
        reason: "Family event",
        status: "Pending Manager",
      },
    ];
    await LeaveRequest.insertMany(leaveRequests);
    console.log(`${leaveRequests.length} leave requests seeded`);

    // Seed LeaveBalances
    const leaveBalances = userIds.map((userId) => ({
      tenant: userId,
      user: userId,
      year: 2026,
      casualTotal: 10,
      casualUsed: Math.floor(Math.random() * 5),
      sickTotal: 7,
      sickUsed: Math.floor(Math.random() * 3),
      annualTotal: 15,
      annualUsed: Math.floor(Math.random() * 5),
      unpaidUsed: Math.floor(Math.random() * 2),
    }));
    await LeaveBalance.insertMany(leaveBalances);
    console.log(`${leaveBalances.length} leave balances seeded`);

    // Seed TimeEntries
    for (const userId of userIds) {
      const taskForUser = tasks.find((t) => t.owner.toString() === userId.toString()) || tasks[0];
      await TimeEntry.insertMany(generateTimeEntries(userId, [taskForUser._id], new Date("2026-10-01"), new Date("2026-10-31")));
    }
    console.log("Time entries seeded for all users");

    // Seed Timesheets
    for (const userId of userIds) {
      await Timesheet.create({
        tenant: userId,
        user: userId,
        userName: (await User.findById(userId)).name,
        weekStart: new Date("2026-10-07"),
        weekEnd: new Date("2026-10-13"),
        weekLabel: "Week 40",
        dailyHours: {
          mon: 8,
          tue: 7.5,
          wed: 9,
          thu: 8,
          fri: 7.5,
          sat: 0,
          sun: 0,
        },
        totalHours: 40,
        status: "Submitted",
        idleFlags: 0,
      });
    }
    console.log(`${timesheetPromises.length} timesheets seeded`);

    // Seed ActiveTimers (some running, some not)
    for (let i = 0; i < userIds.length; i++) {
      const isRunning = i % 3 !== 0;
      await ActiveTimer.create({
        tenant: userIds[i],
        user: userIds[i],
        task: tasks[i % tasks]._id,
        taskTitle: tasks[i % tasks].title,
        startedAt: isRunning ? new Date("2026-10-15") : undefined,
        lastResumedAt: isRunning ? new Date() : undefined,
        accumulatedSeconds: isRunning ? Math.floor(Math.random() * 3600 * 4) : 0,
        running: isRunning,
        idleDiscardedSeconds: 0,
      });
    }
    console.log(`${activeTimerPromises.length} active timers seeded`);

    // Seed Payroll records (3 months)
    const months = ["2026-09", "2026-10", "2026-11"];
    for (let i = 0; i < userIds.length; i++) {
      await Payroll.create(generatePayrollRecord({ tenant: userIds[i], _id: userIds[i] }, months[i % months.length]));
    }
    console.log(`${payrollPromises.length} payroll records seeded`);

    // Seed Settings (one per tenant)
    for (const tenant of tenants) {
      await Setting.create({
        tenant: tenant._id,
        idleThresholdSeconds: 60,
        defaultWorkingHours: 8,
        officeStartTime: "09:00",
        lateGraceMinutes: 15,
        monthlySubmissionDay: 25,
        approvalWindowDay: 28,
        overtimeRateMultiplier: 1.5,
        workingDays: [0, 1, 2, 3, 4], // Sun-Thu for TECH-BD
        deductionFormula: "salary × (presentDays − absentDays − leaveDays) / presentDays + overtimeRate × overtimeHours",
        leaveAllowance: { casual: 10, sick: 7, annual: 15 },
        sickCertificateAfterDays: 1,
      });
    }
    console.log(`${tenants.length} settings seeded`);

    // Print demo login summary
    console.log("\n=== Demo Login Summary ===\n");
    console.log("TECH-BD Super Admin:");
    console.log("  Email: sarah@techbd.com");
    console.log("  Password: password123");
    console.log("\nTECH-BD Admin:");
    console.log("  Email: mohammad@techbd.com");
    console.log("  Password: password123");
    console.log("\nTECH-BD Member:");
    console.log("  Email: karim@techbd.com");
    console.log("  Password: password123");
    console.log("\nAPEX Super Admin:");
    console.log("  Email: john@apex.com");
    console.log("  Password: password123");
    console.log("\nAPEX Admin:");
    console.log("  Email: jane@apex.com");
    console.log("  Password: password123");
    console.log("\nAPEX Member:");
    console.log("  Email: charlie@apex.com");
    console.log("  Password: password123\n");

    console.log("Seeding completed successfully!");
    mongoose.connection.close();
  } catch (err) {
    console.error("Seeding error:", err);
    mongoose.connection.close();
    process.exit(1);
  }
};

seed();