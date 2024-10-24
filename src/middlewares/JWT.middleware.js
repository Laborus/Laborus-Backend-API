const jwt = require("jsonwebtoken");
const { unauthorizedResponse } = require("../utils/api.response"); // Ajuste o caminho conforme necessário

const authenticateJWT = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return unauthorizedResponse(res, "Token não fornecido."); // Usar a padronização
  }

  const bearerToken = token.split(" ")[1];
  if (!bearerToken) {
    return unauthorizedResponse(res, "Token inválido."); // Usar a padronização
  }

  try {
    const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET);
    req.user = {
      id: decoded.userId, // O ID do usuário a partir do token
      userType: decoded.userType, // O tipo do usuário (ex: 'student' ou 'school')
      school: decoded.school, // A escola do usuário
    };
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return unauthorizedResponse(res, "Token inválido."); // Usar a padronização
  }
};

module.exports = authenticateJWT;
