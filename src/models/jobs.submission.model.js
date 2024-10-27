const mongoose = require("mongoose");

const jobsubmissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
  file: {
    data: Buffer,
    contentType: String,
  },
  createdAt: { type: Date, default: Date.now },
});

const JobSubmission = mongoose.model("JobSubmission", jobsubmissionSchema);
module.exports = JobSubmission;
