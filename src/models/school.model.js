const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema({
  cnpj: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  courses: {
    type: [String],
    validate: {
      validator: function (courses) {
        return Array.isArray(courses) && courses.length >= 0;
      },
      message: "Courses should be an array of course names.",
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
