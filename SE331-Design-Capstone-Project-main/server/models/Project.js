const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
    {
        title: {
          type: String,
          required: [true, "Title is required"],
          trim: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
