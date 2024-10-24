const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth.controller");
const {
  successResponseWithData,
  errorResponse,
  validationErrorWithData,
} = require("../utils/api.response");

const {
  sendResetEmail,
  generateResetToken,
} = require("../controllers/forgot-pass.controller"); // Importa as funções
const Student = require("../models/student.model"); // Importa o modelo Student
const School = require("../models/school.model"); // Importa o modelo School
const Company = require("../models/company.model"); // Importa o modelo Company
const {
  validateUser,
  checkDuplicateUser,
} = require("../middlewares/auth.middleware");

router.post("/signup", validateUser, checkDuplicateUser, AuthController.signup);

router.post("/signin", AuthController.signin);

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    // Verifica se o usuário existe em qualquer uma das coleções
    let user =
      (await Student.findOne({ email })) ||
      (await School.findOne({ email })) ||
      (await Company.findOne({ email }));

    if (!user) {
      return notFoundResponse(res, "Usuário não encontrado");
    }

    // Gera um token de redefinição de senha
    const resetToken = generateResetToken();

    // Envia o e-mail com o token de redefinição
    await sendResetEmail(email, resetToken);

    console.log("Email de redefinição de senha enviado para:", email);
    return successResponse(res, "Email de redefinição de senha enviado.");
  } catch (error) {
    console.error("Erro ao processar a solicitação:", error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR"); // Use a chave de erro adequada aqui
  }
});

module.exports = router;
