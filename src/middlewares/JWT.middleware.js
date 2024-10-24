const jwt = require("jsonwebtoken");
const { unauthorizedResponse } = require("../utils/api.response"); // Ajuste o caminho conforme necessário

const authenticateJWT = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return unauthorizedResponse(res, "Token não fornecido."); // Usar a padronização
  }

  // O token deve ter o prefixo "Bearer"
  const bearerToken = token.split(" ")[1];
  if (!bearerToken) {
    return unauthorizedResponse(res, "Token inválido."); // Usar a padronização
  }

  try {
    // Verifique o token
    const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET);
    req.userId = decoded.userId; // Assuma que o ID do usuário é codificado no token
    next();
  } catch (error) {
    console.error("Token verification error:", error); // Log do erro
    return unauthorizedResponse(res, "Token inválido."); // Usar a padronização
  }
};

module.exports = authenticateJWT;
