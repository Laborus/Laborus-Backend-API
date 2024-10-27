const ConnectionRequest = require("../models/send.connection.model");
const Student = require("../models/student.model");

exports.getUserConnections = async (req, res) => {
  try {
    const userId = req.user.id; // The ID of the authenticated user

    // Find the user and populate the connections with name, email, and profileImage
    const user = await Student.findById(userId).populate(
      "connections",
      "name email profileImage" // Adjusted to include profileImage
    );

    if (!user) {
      return res.status(404).json({
        status: "FAILED",
        message: "User not found.",
      });
    }

    // Map connections to include only necessary fields
    const connections = user.connections.map((conn) => ({
      _id: conn._id,
      name: conn.name,
      email: conn.email,
      profileImage: conn.profileImage, // Include profileImage
    }));

    return res.status(200).json({
      status: "SUCCESS",
      connectionCount: connections.length, // Count of connections
      connections: connections,
    });
  } catch (error) {
    console.error("Error fetching connections:", error);
    return res.status(500).json({
      status: "FAILED",
      message: "Internal server error.",
    });
  }
};

exports.sendConnectionRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.id;

    // Impede que o usuário envie uma solicitação para si mesmo
    if (senderId === receiverId) {
      return res.status(400).json({
        status: "FAILED",
        message: "You cannot send a connection request to yourself.",
      });
    }

    const receiver = await Student.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        status: "FAILED",
        message: "User not found.",
      });
    }

    const existingRequest = await ConnectionRequest.findOne({
      sender: senderId,
      receiver: receiverId,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        status: "FAILED",
        message: "Connection request already sent.",
      });
    }

    const newRequest = new ConnectionRequest({
      sender: senderId,
      receiver: receiverId,
      status: "pending",
      createdAt: Date.now(),
    });

    await newRequest.save();

    receiver.inbox.push(newRequest._id);
    await receiver.save();

    return res.status(201).json({
      status: "SUCCESS",
      message: "Connection request sent successfully.",
      data: newRequest,
    });
  } catch (error) {
    console.error("Error sending connection request:", error);
    return res.status(500).json({
      status: "FAILED",
      message: "Internal server error.",
    });
  }
};

exports.handleConnectionRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body;
    const userId = req.user.id;

    const connectionRequest = await ConnectionRequest.findById(requestId);

    if (!connectionRequest) {
      return res.status(404).json({
        status: "FAILED",
        message: "Connection request not found.",
      });
    }

    // Certifica-se de que o usuário é o destinatário do pedido
    if (connectionRequest.receiver.toString() !== userId) {
      return res.status(403).json({
        status: "FAILED",
        message: "You are not authorized to respond to this request.",
      });
    }

    const sender = await Student.findById(connectionRequest.sender);
    const receiver = await Student.findById(connectionRequest.receiver);

    if (!sender || !receiver) {
      return res.status(404).json({
        status: "FAILED",
        message: "One or both users not found.",
      });
    }

    if (action === "accept") {
      // Adiciona a conexão nos dois usuários, evitando duplicidade
      if (
        !sender.connections.some(
          (conn) => conn.toString() === receiver._id.toString()
        )
      ) {
        sender.connections.push(receiver._id);
      }
      if (
        !receiver.connections.some(
          (conn) => conn.toString() === sender._id.toString()
        )
      ) {
        receiver.connections.push(sender._id);
      }

      // Remove o request da inbox do destinatário
      receiver.inbox = receiver.inbox.filter(
        (req) => req.toString() !== requestId
      );

      await sender.save();
      await receiver.save();
      await ConnectionRequest.findByIdAndDelete(requestId);

      return res.status(200).json({
        status: "SUCCESS",
        message: "Connection accepted.",
      });
    } else if (action === "reject") {
      // Rejeita removendo o request
      receiver.inbox = receiver.inbox.filter(
        (req) => req.toString() !== requestId
      );

      await receiver.save();
      await ConnectionRequest.findByIdAndDelete(requestId);

      return res.status(200).json({
        status: "SUCCESS",
        message: "Connection rejected.",
      });
    } else {
      return res.status(400).json({
        status: "FAILED",
        message: "Invalid action.",
      });
    }
  } catch (error) {
    console.error("Error handling connection request:", error);
    return res.status(500).json({
      status: "FAILED",
      message: "Internal server error.",
    });
  }
};

exports.deleteConnection = async (req, res) => {
  try {
    const { connectionId } = req.body; // ID do usuário com quem quer desconectar
    const userId = req.user.id; // ID do usuário autenticado

    // Encontre o usuário atual e o usuário com quem deseja desconectar
    const user = await Student.findById(userId);
    const connectionUser = await Student.findById(connectionId);

    if (!user || !connectionUser) {
      return res.status(404).json({
        status: "FAILED",
        message: "Usuário não encontrado.",
      });
    }

    // Verificar se eles estão conectados
    const areConnected =
      user.connections.some((conn) => conn.toString() === connectionId) &&
      connectionUser.connections.some((conn) => conn.toString() === userId);

    if (!areConnected) {
      return res.status(400).json({
        status: "FAILED",
        message: "Os usuários não estão conectados.",
      });
    }

    // Remover o ID de ambos os arrays de conexões
    user.connections = user.connections.filter(
      (conn) => conn.toString() !== connectionId
    );
    connectionUser.connections = connectionUser.connections.filter(
      (conn) => conn.toString() !== userId
    );

    // Salvar as alterações
    await user.save();
    await connectionUser.save();

    return res.status(200).json({
      status: "SUCCESS",
      message: "Conexão deletada com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao deletar conexão:", error);
    return res.status(500).json({
      status: "FAILED",
      message: "Internal server error.",
    });
  }
};

