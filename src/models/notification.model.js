const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
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
    enum: [
      "Post",
      "Comment",
      "Job",
      "Challenge",
      "SchoolUpdate",
      "SchoolEvent",
      "ChatMessage", // Adicione o tipo de mensagem de chat
    ],
  },
  notificationType: {
    type: String,
    enum: Object.keys(NOTIFICATION_TYPES),
    required: true,
  },
});

module.exports = mongoose.model("Notification", notificationSchema);
