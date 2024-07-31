const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["alert", "info", "warning"],
    required: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  relatedObject: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "relatedObjectType",
  },
  relatedObjectType: {
    type: String,
    enum: ["Post", "Comment"],
  },
});

module.exports = mongoose.model("Notification", notificationSchema);
