const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please! Title is required."],
    trim: true,
    max: [80, "Title must not exceeds 80 characters."],
  },
  tag: {
    type: String,
    enum: ["URGENT", "INFORMATIVE"],
    required: [
      true,
      "Please provide the type of alert: 'urgent' or 'informative'.",
    ],
  },
  text: {
    type: String,
    required: [true, "Please! Text is required."],
    max: [2400, "Text must not exceeds 2400 characters."],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
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
