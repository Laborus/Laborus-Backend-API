const mongoose = require("mongoose");
const Tags = require("./tags.enum");
const validTags = Object.values(Tags);

const schoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please! Name is required."],
    min: [3, "Name must be at least 3 characters."],
    max: [50, "Name must not exceeds 50 characters."],
  },
  email: {
    type: String,
    required: [true, "Please! Email is required."],
    unique: [true, "Email address is already in use."],
    min: [3, "Email must be at least 3 characters."],
    max: [50, "Email must not exceeds 50 characters."],
    match: [
      /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/,
      "Please provide a valid email address.",
    ],
  },
  password: {
    type: String,
    required: [true, "Please! Password is required."],
    min: [8, "Password must be at least 8 characters."],
  },
  cnpj: {
    type: String,
    required: [true, "Please! CNPJ is required."],
    unique: [true, "CNPJ is already in use."],
    trim: true,
  },
  courses: {
    type: [String],
    min: [3, "School must have at least 3 courses."],
    validate: {
      validator: function (courses) {
        return Array.isArray(courses) && courses.length >= 3;
      },
      message: "Courses must be an array of course names.",
    },
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
  profileImage: {
    type: String,
    default: "../public/images/bannerImage_default.png",
  },
  bannerImage: {
    type: String,
    default: "../public/images/profileImage_default.png",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  accountStatus: {
    type: String,
    enum: ["active", "suspended"],
    default: "active",
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
  location: {
    type: String,
    default: "",
  },
  aboutContent: {
    type: String,
    max: [250, "AboutContent must not exceeds 250 characters."],
  },
  saved: [
    {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "savedItemType",
    },
  ],
  savedItemType: {
    type: String,
    enum: ["Post", "Job"],
  },
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
    },
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
  ],
});

module.exports = mongoose.model("School", schoolSchema);
