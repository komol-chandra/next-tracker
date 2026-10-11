const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const toJSON = require("./plugins/toJSON");

const userSchema = new mongoose.Schema(
  {
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, unique: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["Super Admin", "Admin", "HR", "Manager", "Member"] },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    dept: { type: String },
    team: { type: String },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    designation: { type: String },
    phone: { type: String },
    avatar: { type: String },
    empCode: { type: String },
    baseSalary: { type: Number, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = bcrypt.hashSync(this.password, salt);
  next();
});

userSchema.methods.getPermissions = function () {
  const roleName = this.role;
  const roleInfo = PERMISSIONS_ROLES[roleName] || [];
  return roleInfo.permissions;
};

const PERMISSIONS_ROLES = {
  "Super Admin": {
    permissions: ["*"],
  },
  Admin: {
    permissions: [
      "dashboard.view_stats",
      "dashboard.view_team",
      "dashboard.payroll_overview",
      "timelog.record",
      "timelog.manual_entry",
      "timelog.approve",
      "leave.request",
      "leave.approve",
      "holiday.manage",
      "tasks.view",
      "tasks.create",
      "tasks.approve",
      "presets.manage",
      "reports.user_log",
      "org.manage",
      "roles.manage",
      "settings.manage",
      "tenant.switch",
    ],
  },
  HR: {
    permissions: [
      "dashboard.view_stats",
      "timelog.record",
      "timelog.manual_entry",
      "leave.request",
      "leave.approve",
      "holiday.manage",
      "reports.user_log",
    ],
  },
  Manager: {
    permissions: [
      "dashboard.view_stats",
      "dashboard.view_team",
      "timelog.record",
      "timelog.manual_entry",
      "timelog.approve",
      "leave.request",
      "leave.approve",
      "tasks.view",
      "tasks.create",
      "tasks.approve",
    ],
  },
  Member: {
    permissions: [
      "dashboard.view_stats",
      "timelog.record",
      "timelog.manual_entry",
      "leave.request",
    ],
  },
};

module.exports = mongoose.model("User", userSchema);