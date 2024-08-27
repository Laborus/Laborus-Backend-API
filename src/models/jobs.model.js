const mongoose = require("mongoose");
const validTags = require("./tags.enum");

const jobSchema = new mongoose.Schema({
  companyImage: {
    data: Buffer,
    contentType: String,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  period: {
    type: String,
    enum: ["Morning", "Afternoon", "Evening"],
    required: true,
  },
  modality: {
    type: String,
    enum: ["Presential", "Hybrid", "Remote"],
    required: true,
  },
  tags: {
    type: [String],
    enum: validTags,
    validate: {
      validator: function (tags) {
        return tags.length <= 3;
      },
      message: "Tags must not exceeds 3 items.",
    },
  },
  description: {
    type: String,
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

module.exports = mongoose.model("Job", jobSchema);
