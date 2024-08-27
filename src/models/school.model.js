const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema({
  cnpj: {
    type: String,
    required: [true, "Please! CNPJ is required."],
    unique: [true, "CNPJ is already in use."],
    trim: true,
  },
  courses: {
    type: [String],
    min: [3, "School must be at least 3 courses."],
    validate: {
      validator: function (courses) {
        return Array.isArray(courses) && courses.length >= 0;
      },
      message: "Courses must be an array of course names.",
    },
  },
  contactLinks: {
    website: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
  },
});

module.exports = mongoose.model("School", schoolSchema);
