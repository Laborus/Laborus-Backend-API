const express = require("express");
const dotenv = require("dotenv");
const DatabaseConnection = require("./src/database/db.connection");
const appRouter = require("./src/routes/app");
const apiRouter = require("./src/routes/api");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors"); 


const app = express();
const PORT = process.env.SERVER_PORT || 3333;

dotenv.config();

// Route prefixes
app.use(cors());
app.use(express.json());
app.use("/", appRouter);
app.use("/api/", apiRouter);

// Database connection

DatabaseConnection();

// Configuração do servidor e do Socket.IO
const server = http.createServer(app);
const io = socketIo(server);

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("sendMessage", async (data) => {
    console.log("sendMessage event received:", data); // Log para ver se a mensagem está sendo recebida

    const { conversationId, sender, text } = data;

    // Salvar a mensagem no banco de dados
    const message = new Message({ conversationId, sender, text });
    await message.save();

    // Atualiza a conversa com a nova mensagem
    await Conversation.findByIdAndUpdate(conversationId, {
      $push: { messages: message._id },
      lastMessage: message._id,
    });

    // Emitir a mensagem para todos os participantes da conversa
    io.to(conversationId).emit("messageReceived", message);
    console.log("Message emitted to conversation:", conversationId);
  });

  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);
    console.log(`User joined conversation: ${conversationId}`);
  });

  socket.on("disconnect", () => {
    console.log("Usuário desconectado", socket.id);
  });
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
