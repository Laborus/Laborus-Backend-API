const express = require("express");
const router = express.Router();
const Message = require("../models/message.model");
const Conversation = require("../models/conversation.model");

router.post("/send-message", async (req, res) => {
  const { sender, recipient, text } = req.body;

  try {
    // 1. Verificar se já existe uma conversa entre o sender e o recipient
    let conversation = await Conversation.findOne({
      participants: { $all: [sender, recipient] },
    });

    // 2. Se não existe uma conversa, criamos uma nova
    if (!conversation) {
      conversation = new Conversation({
        participants: [sender, recipient],
        participantType: "Student", // ou qualquer outro tipo de participante
      });
      await conversation.save();
    }

    // 3. Criar a mensagem
    const message = new Message({
      conversationId: conversation._id,
      sender,
      recipient,
      text,
      senderType: "Student", // ou qualquer outro tipo de remetente
      recipientType: "Student", // ou qualquer outro tipo de destinatário
    });

    // 4. Salvar a mensagem no banco de dados
    await message.save();

    // 5. Atualizar a conversa com a nova mensagem
    await Conversation.findByIdAndUpdate(conversation._id, {
      $push: { messages: message._id },
      lastMessage: message._id,
      updatedAt: Date.now(),
    });

    // 6. Emitir evento Socket.IO para os participantes da conversa
    const io = req.app.get("io"); // Acessando o io a partir do app
    if (io && conversation._id) {
      io.to(conversation._id.toString()).emit("messageReceived", message);
      console.log(`Message sent to conversation: ${conversation._id}`);
    } else {
      console.log("Socket.IO instance not found or invalid conversation ID.");
    }

    // 7. Retornar a resposta com a conversationId
    res.status(201).json({
      success: true,
      message,
      conversationId: conversation._id, // Enviar a conversationId na resposta
    });
  } catch (error) {
    console.error("Error sending message:", error); // Logando o erro
    res.status(500).json({ success: false, error: error.message });
  }
});

// Rota para buscar a conversa e as mensagens
router.get("/conversation/:conversationId", async (req, res) => {
  const { conversationId } = req.params; // Pega o ID da conversa a partir da URL

  try {
    if (!conversationId) {
      return res
        .status(400)
        .json({ success: false, error: "conversationId é obrigatória." });
    }

    // Buscar a conversa com o conversationId
    const conversation = await Conversation.findById(conversationId).populate({
      path: "messages", // Populando as mensagens da conversa
      model: "Message",
      populate: [
        {
          path: "sender", // Populando o remetente
          model: "Student",
          select: "_id name", // Retorna apenas o _id e name do sender
        },
        {
          path: "recipient", // Populando o destinatário
          model: "Student",
          select: "_id name", // Retorna apenas o _id e name do recipient
        },
      ],
    });

    if (!conversation) {
      return res
        .status(404)
        .json({ success: false, error: "Conversa não encontrada." });
    }

    // Contagem de mensagens na conversa
    const messageCount = await Message.countDocuments({ conversationId });

    // Formatar a resposta para incluir apenas os campos desejados
    const formattedConversation = {
      _id: conversation._id,
      messageCount: messageCount,
      participants: conversation.participants,
      messages: conversation.messages.map((message) => ({
        _id: message._id,
        text: message.text,
        createdAt: message.createdAt,
        sender: {
          _id: message.sender._id,
          name: message.sender.name,
        },
        recipient: {
          _id: message.recipient._id,
          name: message.recipient.name,
        },
      })),
      lastMessage: conversation.lastMessage,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };

    return res
      .status(200)
      .json({ success: true, conversation: formattedConversation });
  } catch (error) {
    console.error("Erro ao buscar conversa:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
