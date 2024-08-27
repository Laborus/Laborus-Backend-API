const ConnectionRequest = require("./connectionRequest.model"); // Adicione a importação do modelo ConnectionRequest
const {
  successResponseWithData,
  errorResponse,
} = require("../utils/api.response");
exports.addConnection = async (req, res) => {
  try {
    const userId = req.user.id;
    const { connectionId } = req.body;

    // Verifique se o usuário está logado e se o usuário de conexão existe
    const user = await Student.findById(userId);
    const connectionUser = await Student.findById(connectionId);

    if (!user || !connectionUser) return errorResponse(res, "USER_NOT_FOUND");

    // Verifique se já existe um pedido de conexão pendente
    const existingRequest = await ConnectionRequest.findOne({
      fromUser: userId,
      toUser: connectionId,
      status: "PENDING",
    });

    if (existingRequest)
      return errorResponse(res, "CONNECTION_REQUEST_ALREADY_PENDING");

    // Crie um novo pedido de conexão
    const connectionRequest = new ConnectionRequest({
      fromUser: userId,
      toUser: connectionId,
    });

    await connectionRequest.save();

    successResponseWithData(
      res,
      "Connection request sent successfully.",
      connectionRequest
    );
  } catch (error) {
    console.error(error);
    errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};
