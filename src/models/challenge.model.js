const mongoose = require("mongoose");

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    min: [3, "Title must be at least 3 characters."],
    max: [50, "Title must not exceeds 50 characters."],
  },
  instructions: {
    type: String,
    required: true,
    min: [3, "Instructions cannot be empty! Must be at least 3 characters."],
    max: [600, "Instructions must not exceeds 600 characters."],
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: [true, "Please! Course is required."],
  },
  points: {
    type: Number,
    required: [true, "Please! 'Points' is required."],
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    required: [
      true,
      "Please provide  the difficulty: 'Easy', 'Medium', or 'Hard.",
    ],
  },
  file: {
    data: Buffer,
    contentType: String,
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

module.exports = mongoose.model("Challenge", challengeSchema);
