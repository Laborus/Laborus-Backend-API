const mongoose = require("mongoose");

const challengeResponseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  }, // O ID do usuário que está enviando a resposta
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Challenge",
    required: true,
  }, // O desafio associado
  status: {
    type: String,
    enum: ["pending", "approved", "incorrect", "rejected"], // Enum for status
    default: "pending", // Default value
  },
  file: {
    data: Buffer,
    contentType: String,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ChallengeResponse", challengeResponseSchema);
