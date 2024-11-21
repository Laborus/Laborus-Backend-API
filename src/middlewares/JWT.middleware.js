const jwt = require("jsonwebtoken");
const Blacklist = require("../models/blacklist.model"); // Aquele modelo de Blacklist que você vai criar
const { unauthorizedResponse } = require("../utils/api.response");

const authenticateJWT = async (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return unauthorizedResponse(res, "Token não fornecido.");
  }

  const bearerToken = token.split(" ")[1]; // Pegando o token do tipo "Bearer token"
  if (!bearerToken) {
    return unauthorizedResponse(res, "Token inválido.");
  }

  try {
    // Verifica se o token está na blacklist
    const blacklistedToken = await Blacklist.findOne({ token: bearerToken });
    if (blacklistedToken) {
      return unauthorizedResponse(res, "Token revogado. Faça login novamente.");
    }

    // Decodifica o JWT
    const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET);
    console.log("Token decodificado:", decoded);


    // Adiciona as informações do usuário no objeto req
    req.user = {
      id: decoded.userId || decoded.id,
      userType: decoded.userType ||  decoded.accountType,
      school: decoded.school,
      exp: decoded.exp, // Tempo de expiração
      iat: decoded.iat, // Tempo de criação do token
    };

    console.log("Usuário autenticado no middleware:", req.user);

    // Passa o controle para o próximo middleware ou controlador
    next();
  } catch (error) {
    console.error("Erro na verificação do token:", error);
    if (error.name === "TokenExpiredError") {
      return unauthorizedResponse(res, "Token expirado.");
    }
    return unauthorizedResponse(res, "Token inválido.");
  }
};

module.exports = authenticateJWT;
