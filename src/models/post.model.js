const mongoose = require("mongoose");
const Comment = require("./comment.model");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  textContent: {
    type: String,
  },
  postedOn: {
    type: String,
    enum: ["Global", "Campus"],
    required: [
      true,
      "Please provide the route where you want to publish this post: Global or Campus.",
    ],
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
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    type: Date.now,
  },
  likes: {
    type: Number,
    default: 0,
  },
  commentsEnabled: {
    type: Boolean,
    default: true,
  },
  comments: [commentSchema],
  shares: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Post", postSchema);
