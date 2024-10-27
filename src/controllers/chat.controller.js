const Conversation = require("../models/conversation.model");
const Message = require("../models/message.model");

// Controlador para criar uma nova conversa
exports.createConversation = async (req, res) => {
  const { participants } = req.body;

  // Assumindo que o primeiro participante é o sender
  const sender = participants[0];

  // Verifica se o sender não está na lista de participantes
  if (participants.includes(sender)) {
    return res.status(403).json({
      success: false,
      message: "Você não pode criar uma conversa com você mesmo.",
    });
  }

  try {
    const senderDoc = await Student.findById(sender).populate("connections");

    const isValidParticipants = participants.every((participant) =>
      senderDoc.connections.includes(participant)
    );

    if (!isValidParticipants) {
      return res.status(403).json({
        success: false,
        message: "Todos os participantes devem ser conexões.",
      });
    }

    const conversation = new Conversation({ participants });
    await conversation.save();
    res.status(201).json({ success: true, conversation });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erro ao criar a conversa." });
  }
};

// Controlador para enviar uma nova mensagem
exports.sendMessage = async (req, res) => {
  const { conversationId, sender, receiver, text, image, video } = req.body;

  try {
    // Verifica se o sender é um connection do receiver
    const senderDoc = await Student.findById(sender).populate("connections");
    if (!senderDoc.connections.includes(receiver)) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Você não pode enviar mensagens para este usuário.",
        });
    }

    const message = new Message({
      conversationId,
      sender,
      receiver,
      text,
      image,
      video,
    });
    await message.save();

    // Atualiza a conversa com a nova mensagem
    await Conversation.findByIdAndUpdate(conversationId, {
      $push: { messages: message._id },
      lastMessage: message._id,
    });

    res.status(201).json({ success: true, message });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erro ao enviar a mensagem." });
  }
};

// Controlador para obter mensagens de uma conversa
exports.getMessages = async (req, res) => {
  const { id } = req.params;

  try {
    const messages = await Message.find({ conversationId: id }).populate(
      "sender"
    );
    res.status(200).json({ success: true, messages });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erro ao obter mensagens." });
  }
};

// Controlador para buscar todas as conversas de um usuário
exports.getConversations = async (req, res) => {
  const { userId } = req.params; // ID do usuário

  try {
    const conversations = await Conversation.find({ participants: userId });
    res.status(200).json({ success: true, conversations });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erro ao obter conversas." });
  }
};

// exports.getChat = (req, res) => {};

// exports.getAllChats = (req, res) => {};

// exports.chatList = (req, res) => {};

// exports.getOnlineUsers = (req, res) => {};

// exports.createChat = (req, res) => {};

// exports.deleteChat = (req, res) => {};

// exports.sendMessage = (req, res) => {};

// exports.updateMessage = (req, res) => {};

// exports.deleteMessage = (req, res) => {};

// exports.reportChat = (req, res) => {};
