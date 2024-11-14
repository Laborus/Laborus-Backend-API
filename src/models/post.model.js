const mongoose = require("mongoose");
const Comment = require("./comment.model");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
  },
  textContent: {
    type: String,
    required: [true, "Text content is required"],
  },
  postedOn: {
    type: String,
    enum: ["Global", "Campus"],
    required: [
      true,
      "Please specify where this post is published: Global or Campus.",
    ],
  },
  campusId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School", // Referência à instituição associada
    required: function () {
      return this.postedOn === "Campus";
    },
  },
  image: {
    data: Buffer,
    contentType: String,
  },
  video: {
    data: Buffer,
    contentType: String,
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "postedByModel",
    required: true,
  },
  postedByModel: {
    type: String,
    required: true,
    enum: ["School", "Student"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "userModel",
    },
  ],
  dislikes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "userModel",
    },
  ],
  reports: [
    {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "userModel",
    },
  ],
  userModel: {
    type: String,
    enum: ["School", "Student"],
    default: "Student",
  },
  commentsEnabled: {
    type: Boolean,
    default: true,
  },
  comments: {
    type: [Comment.schema],
    default: [],
  },
  // No seu post.model.js
  sharedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Supondo que você tenha um modelo User
    },
  ],
});

// Virtuals
postSchema.virtual("likesCount").get(function () {
  return this.likes.length;
});
postSchema.virtual("dislikesCount").get(function () {
  return this.dislikes.length;
});

module.exports = mongoose.model("Post", postSchema);
