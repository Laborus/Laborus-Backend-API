const Message = require("../models/message.model");
const Conversation = require("../models/conversation.model");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    // Evento para enviar mensagem
    socket.on("sendMessage", async (data) => {
      console.log("sendMessage event received:", data);

      const { conversationId, sender, text } = data;

      try {
        // Salvar a mensagem no banco de dados
        const message = new Message({ conversationId, sender, text });
        await message.save();

        // Atualizar a conversa com a nova mensagem
        await Conversation.findByIdAndUpdate(conversationId, {
          $push: { messages: message._id },
          lastMessage: message._id,
          updatedAt: Date.now(),
        });

        // Emitir a mensagem para todos os participantes da conversa
        io.to(conversationId).emit("messageReceived", message);
        console.log("Message emitted to conversation:", conversationId);
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    // Evento para entrar em uma conversa
    socket.on("joinConversation", (conversationId) => {
      socket.join(conversationId);
      console.log(`👥 User joined conversation: ${conversationId}`);
    });

    // Evento para desconectar
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
