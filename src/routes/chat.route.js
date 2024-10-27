const express = require("express");
const router = express.Router();
const {
  createConversation,
  sendMessage,
  getMessages,
  getConversations,
} = require("../controllers/chat.controller");

// Rotas para conversas e mensagens
router.post("/conversations", createConversation);
router.post("/messages", sendMessage);
router.get("/conversations/:userId", getConversations);
router.get("/conversations/:id/messages", getMessages);

module.exports = router;
