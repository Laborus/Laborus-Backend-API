const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "participantType",
      required: true,
    },
  ],
  participantType: {
    type: String,
    enum: ["Student", "School", "Company"],
    required: true,
  },
  messages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  ],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
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

module.exports = mongoose.model("Conversation", conversationSchema);
