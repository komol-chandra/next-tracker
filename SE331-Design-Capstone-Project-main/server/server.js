// server.js
// Entry point - keeps "creating the app" separate from "starting the server".
// This separation also makes automated testing easier later (not needed to
// explain that part in class unless there's time).
 
require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
 
const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
 
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

