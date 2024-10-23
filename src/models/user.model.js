// const mongoose = require("mongoose");
// const Tags = require("./tags.enum");
// const validTags = Object.values(Tags);

// const userSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, "Please! Name is required."],
//     min: [3, "Name must be at least 3 characters."],
//     max: [50, "Name must not exceeds 50 characters."],
//   },
//   email: {
//     type: String,
//     required: [true, "Please! Email is required."],
//     unique: [true, "Email address is already in use."],
//     min: [3, "Email must be at least 3 characters."],
//     max: [50, "Email must not exceeds 50 characters."],
//     match: [
//       /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/,
//       "Please provide a valid email address.",
//     ],
//   },
//   password: {
//     type: String,
//     required: [true, "Please! Password is required."],
//     min: [8, "Password must be at least 8 characters."],
//   },
//   accountType: {
//     type: String,
//     enum: ["Student", "Company", "School"],
//     required: [true, "Please! AccountType is required."],
//   },
//   isOnline: {
//     type: Boolean,
//     default: false,
//   },
//   accountStatus: {
//     type: String,
//     enum: ["active", "suspended", "deactivated", "pending_verification"],
//     default: "active",
//   },
//   tags: {
//     type: [String],
//     enum: validTags,
//     validate: {
//       validator: function (tags) {
//         return tags.length <= 3;
//       },
//       message: "Tags must not exceeds 3 items.",
//     },
//   },
//   location: {
//     type: String,
//     default: "",
//   },
//   aboutContent: {
//     type: String,
//     max: [250, "AboutContent must not exceeds 250 characters."],
//   },
//   saved: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       refPath: "savedItemType",
//     },
//   ],
//   savedItemType: {
//     type: String,
//     enum: ["Post", "Job"],
//   },
//   following: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//   ],
//   profileImage: {
//     type: String,
//     default: "../public/images/bannerImage_default.png",
//   },
//   bannerImage: {
//     type: String,
//     default: "../public/images/profileImage_default.png",
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// module.exports = mongoose.model("User", userSchema);
