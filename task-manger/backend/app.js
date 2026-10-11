// app.js
// This file shows middleware CHAINING - order matters, top to bottom.
// A request travels through each line in order until something sends a response.

const express = require("express");
const cors = require("cors");
const logger = require("./middlewares/logger");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const authRoutes = require("./routes/auth");
const routes = require("./routes");

const app = express();

app.use(cors());

app.use(express.json());

app.use(logger);

// Auth routes
app.use("/api/auth", authRoutes);

// Regular routes
app.use("/api", routes);

// 404 handler - only reached if no route above matched
app.use(notFound);

// Error handler - always LAST. Catches anything passed to next(err)
app.use(errorHandler);

module.exports = app;