const mongoose = require("mongoose");

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    min: [3, "Title must be at least 3 characters."],
    max: [30, "Title must not exceeds 30 characters."],
  },
  instructions: {
    type: String,
    required: true,
    min: [3, "Instructions cannot be empty! Must be at least 3 characters."],
    max: [250, "Instructions must not exceeds 250 characters."],
  },
  course: {
    type: String,
    required: [true, "Please! Course is required."],
  },
  points: {
    type: Number,
    enum: [0, 20, 40, 60, 80, 100],
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
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School", // Referência ao modelo School
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
