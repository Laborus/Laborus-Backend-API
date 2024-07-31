const mongoose = require("mongoose");

const discussionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  hashtags: {
    type: [String],
    validate: {
      validator: function (hashtags) {
        return hashtags.length <= 8;
      },
      message: "A discussion can have a maximum of 8 hashtags.",
    },
  },
  isAnswered: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  comments: [commentSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Discussion", discussionSchema);
