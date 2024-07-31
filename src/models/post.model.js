const mongoose = require("mongoose");
const Comment = require("./comment.model");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  textContent: {
    type: String,
    required: true,
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
    type: Date.now,
  },
  likes: {
    type: Number,
    default: 0,
  },
  comments: [commentSchema],
  shares: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Post", postSchema);
