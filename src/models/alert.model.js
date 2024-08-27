const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please! Title is required."],
    trim: true,
  },
  tag: {
    type: String,
    enum: ["urgent", "informative"],
    required: [
      true,
      "Please provide the type of alert: 'urgent' or 'informative'.",
    ],
  },
  text: {
    type: String,
    required: [true, "Please! Text is required."],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Alert", alertSchema);
