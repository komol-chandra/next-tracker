// app.js
// This file shows middleware CHAINING - order matters, top to bottom.
// A request travels through each line in order until something sends a response.

const express = require("express");
const cors = require("cors");
const logger = require("./middlewares/logger");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const { protect, tenantScope } = require("./middlewares/auth");
const routes = require("./routes");
const orgRoutes = require("./routes/org");
const taskPresetRoutes = require("./routes/task-presets");
const holidayRoutes = require("./routes/holidays");
const taskRoutes = require("./routes/tasks");
const timeRoutes = require("./routes/time");
const userLogRoutes = require("./routes/user-log");
const dashboardRoutes = require("./routes/dashboard");
const notificationRoutes = require("./routes/notifications");
const User = require("./models/User");
const jwt = require("jsonwebtoken");
const generateToken = require("./utils/generateToken");

const app = express();

app.use(cors());

app.use(express.json());

app.use(logger);

// Auth routes - inline
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password +role +tenant +permissions");

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  const token = generateToken(user._id, user.role, user.tenant);

  res.status(200).json({
    success: true,
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenant: user.tenant,
      },
    },
    message: "Logged in successfully",
  });
});

app.get("/api/auth/me", async (req, res) => {
  // Simple protect middleware logic inline
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token, authorization denied",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret-key");
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not found, authorization denied",
      });
    }
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  // Simple tenant scope logic
  req.tenantId = req.user.tenant;

  // Get user details without password, plus effective permissions
  const user = await User.findById(req.user.id).select("-password");
  const payload = user.toObject();
  payload.permissions = user.getPermissions();

  res.status(200).json({
    success: true,
    data: payload,
  });
});

app.put("/api/auth/me", async (req, res) => {
  // Simple protect middleware logic inline
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token, authorization denied",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret-key");
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not found, authorization denied",
      });
    }
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  // Simple tenant scope logic
  req.tenantId = req.user.tenant;

  const updatedUser = await User.findByIdAndUpdate(req.user.id, req.body, {
    new: true,
    runValidators: true,
  }).select("-password");

  res.status(200).json({
    success: true,
    data: updatedUser,
    message: "Profile updated successfully",
  });
});

// Configuration APIs - protected, tenant-scoped
app.get("/api/settings", protect, async (req, res) => {
  const Setting = require("./models/Setting");
  const setting = await Setting.findOne({ tenant: req.tenantId }).lean();
  if (!setting) {
    return res.status(404).json({
      success: false,
      message: "Settings not found",
    });
  }
  res.status(200).json({
    success: true,
    data: setting,
  });
});

app.put("/api/settings", protect, async (req, res) => {
  const Setting = require("./models/Setting");
  const updated = await Setting.findOneAndUpdate(
    { tenant: req.tenantId },
    req.body,
    { new: true, runValidators: true }
  ).lean();
  if (!updated) {
    return res.status(404).json({
      success: false,
      message: "Settings not found",
    });
  }
  res.status(200).json({
    success: true,
    data: updated,
    message: "Settings updated successfully",
  });
});

// Sidebar badges: pending leaves, open tasks, running timer
app.get("/api/me/badges", protect, async (req, res) => {
  const LeaveRequest = require("./models/LeaveRequest");
  const Task = require("./models/Task");
  const ActiveTimer = require("./models/ActiveTimer");

  const approverRoles = ["Super Admin", "Admin", "HR", "Manager"];
  const canApprove = approverRoles.includes(req.user.role);
  const statusFilter = { $in: ["Pending Manager", "Pending HR"] };

  const leavesPending = await LeaveRequest.countDocuments(
    canApprove
      ? { tenant: req.tenantId, status: statusFilter }
      : { tenant: req.tenantId, user: req.user._id, status: statusFilter }
  );

  const myOpenTasks = await Task.countDocuments({
    tenant: req.tenantId,
    owner: req.user._id,
    status: { $in: ["Draft", "Submitted"] },
  });

  const timer = await ActiveTimer.findOne({
    tenant: req.tenantId,
    user: req.user._id,
  })
    .select("running startedAt accumulatedSeconds")
    .lean();

  res.status(200).json({
    success: true,
    data: {
      leavesPending,
      myOpenTasks,
      timer: timer
        ? {
            running: !!timer.running,
            startedAt: timer.startedAt,
            accumulatedSeconds: timer.accumulatedSeconds || 0,
          }
        : { running: false, startedAt: null, accumulatedSeconds: 0 },
    },
  });
});

app.get("/api/tenant", protect, async (req, res) => {
  // Super Admin can override via X-Tenant-Id header; for anyone else the header is ignored
  let tenantId = req.user.tenant;
  if (req.user.role === "Super Admin" && req.headers["x-tenant-id"]) {
    tenantId = req.headers["x-tenant-id"];
  }
  const Tenant = require("./models/Tenant");
  const tenant = await Tenant.findById(tenantId).lean();
  if (!tenant) {
    return res.status(404).json({
      success: false,
      message: "Tenant not found",
    });
  }
  res.status(200).json({
    success: true,
    data: tenant,
  });
});

app.put("/api/tenant", protect, async (req, res) => {
  // Super Admin can override via X-Tenant-Id header; for anyone else the header is ignored
  let tenantId = req.user.tenant;
  if (req.user.role === "Super Admin" && req.headers["x-tenant-id"]) {
    tenantId = req.headers["x-tenant-id"];
  }
  const Tenant = require("./models/Tenant");
  const updated = await Tenant.findByIdAndUpdate(tenantId, req.body, {
    new: true,
    runValidators: true,
  }).lean();
  if (!updated) {
    return res.status(404).json({
      success: false,
      message: "Tenant not found",
    });
  }
  res.status(200).json({
    success: true,
    data: updated,
    message: "Tenant updated successfully",
  });
});

// Regular routes
app.use("/api", routes); // public: /health

// Everything below requires a valid JWT and is tenant-scoped
app.use("/api", protect);
app.use("/api", tenantScope);

// Each module mounted at its canonical prefix
app.use("/api", orgRoutes); // /org/*, /users/assignment, /rbac/*
app.use("/api/task-presets", taskPresetRoutes); // /task-presets
app.use("/api", holidayRoutes); // /holidays, /leaves
app.use("/api/tasks", taskRoutes); // /tasks
app.use("/api/time", timeRoutes); // /time/timer, /time/entries, ...
app.use("/api/reports", userLogRoutes); // /reports/user-log
app.use("/api/dashboard", dashboardRoutes); // /dashboard/stats
app.use("/api/notifications", notificationRoutes); // /notifications

// 404 handler - only reached if no route above matched
app.use(notFound);

// Error handler - always LAST. Catches anything passed to next(err)
app.use(errorHandler);

module.exports = app;