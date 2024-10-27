const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "senderType",
    required: true,
  },
  senderType: {
    type: String,
    enum: ["Student", "School", "Company"],
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "recipientType",
    required: true,
  },
  recipientType: {
    type: String,
    enum: ["Student", "School", "Company"],
    required: true,
  },
  text: {
    type: String,
    trim: true,
  },
  image: {
    type: String, // URL or path to the image
    trim: true,
  },
  video: {
    type: String, // URL or path to the video
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Message", messageSchema);
