const mongoose = require("mongoose");
const Tags = require("./tags.enum");
const validTags = Object.values(Tags);

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 3,
    max: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    max: 50,
  },
  hashed_password: {
    type: String,
    required: true,
    min: 8,
  },
  tags: {
    type: [String],
    enum: validTags,
    validate: {
      validator: function (tags) {
        return tags.length <= 3;
      },
      message: "A maximum of 3 tags is allowed.",
    },
  },
  aboutContent: {
    type: String,
    trim: true,
    max: 200,
  },
  profileImage: {
    type: String,
  },
  bannerImage: {
    type: String,
  },
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  role: {
    type: String,
    enum: ["Student", "Company", "School"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
  resetPasswordLink: {
    data: String,
    default: "",
  },
});

module.exports = mongoose.model("User", userSchema);
