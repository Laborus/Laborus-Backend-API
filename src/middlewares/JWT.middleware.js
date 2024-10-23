const jwt = require("jsonwebtoken");
const { errorResponse } = require("../utils/api.response");

const authenticateJWT = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // O token geralmente é enviado no formato "Bearer <token>"

  if (!token) {
    return errorResponse(res, "Acesso negado. Token não fornecido.");
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return errorResponse(res, "Token inválido.");
    }
    req.user = user; // Anexa o objeto do usuário decodificado à requisição
    next(); // Chama o próximo middleware ou a rota
  });
};

module.exports = { authenticateJWT };
