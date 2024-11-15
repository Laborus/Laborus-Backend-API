// routes/auth.routes.js
const express = require("express");
const router = express.Router();
const authenticateJWT = require("../middlewares/JWT.middleware");

router.get("/validate-token", authenticateJWT, (req, res) => {
  // Se o token for válido, as informações estarão em req.user
  const { id, userType, school, exp, iat } = req.user;

  // Calcula o tempo restante para o token expirar (em segundos)
  const currentTime = Math.floor(Date.now() / 1000); // Timestamp atual em segundos
  const expiresIn = exp - currentTime;

  res.status(200).json({
    success: true,
    message: "Token válido",
    user: {
      id,
      userType,
      school,
    },
    tokenInfo: {
      issuedAt: new Date(iat * 1000).toISOString(), // Data de criação do token
      expiresAt: new Date(exp * 1000).toISOString(), // Data de expiração do token
      expiresIn: `${expiresIn} segundos`, // Tempo restante para expirar
    },
  });
});

module.exports = router;
