const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Student = require("../models/student.model");
const School = require("../models/school.model");
const Company = require("../models/company.model");
const jwt = require("jsonwebtoken");
const {
  successResponseWithData,
  errorResponse,
  validationErrorWithData,
} = require("../utils/api.response");

exports.signup = async (req, res) => {
  try {
    const {
      name,
      email,
      password, // A senha será criptografada
      accountType,
      location,
      tags,
      aboutContent,
      profileImage,
      bannerImage,
      saved,
      savedItemType,
      following,
      cpf,
      cnpj,
      courses,
      school,
    } = req.body;

    // Verifica se o e-mail já está registrado em qualquer uma das coleções
    const existingUser =
      (await Student.findOne({ email })) ||
      (await School.findOne({ email })) ||
      (await Company.findOne({ email }));

    if (existingUser) {
      return validationErrorWithData(res, "Email já está em uso.", { email });
    }

    // Criptografa a senha antes de armazenar
    const hashedPassword = await bcrypt.hash(password, 10);

    // Campos comuns a todos os tipos de usuário
    const commonFields = {
      name,
      email,
      password: hashedPassword, // Armazenar a senha criptografada
      accountType,
      isEmailVerified: false,
      accountStatus: "active",
      isOnline: false,
      location,
      tags,
      aboutContent,
      profileImage,
      bannerImage,
      saved,
      savedItemType,
      following,
    };

    let user;

    // Lógica de registro baseada no tipo de conta
    if (accountType === "Student") {
      if (!cpf || !school) {
        return validationErrorWithData(
          res,
          "Campos obrigatórios faltando para registro de estudante.",
          { cpf, school }
        );
      }

      const schoolId = mongoose.Types.ObjectId.isValid(school)
        ? new mongoose.Types.ObjectId(school)
        : null;
      if (!schoolId) {
        return validationErrorWithData(
          res,
          "Formato de ID da escola inválido.",
          { school }
        );
      }

      const schoolRecord = await School.findById(schoolId);
      if (!schoolRecord) {
        return validationErrorWithData(res, "Escola não encontrada.", {
          school,
        });
      }

      user = new Student({
        ...commonFields,
        cpf,
        school: schoolRecord._id,
        course: req.body.course,
      });
    } else if (accountType === "School") {
      if (!cnpj || !courses) {
        return validationErrorWithData(
          res,
          "Campos obrigatórios faltando para registro de escola.",
          { cnpj, courses }
        );
      }

      user = new School({
        ...commonFields,
        cnpj,
        courses,
      });
    } else if (accountType === "Company") {
      if (!cnpj) {
        return validationErrorWithData(
          res,
          "Campo CNPJ é obrigatório para registro de empresa.",
          { cnpj }
        );
      }

      user = new Company({
        ...commonFields,
        cnpj,
      });
    } else {
      return errorResponse(res, "TIPO_DE_CONTA_INVALIDO");
    }

    // Salva o usuário no banco de dados
    await user.save();
    return successResponseWithData(res, "Usuário registrado com sucesso.", {
      userId: user._id,
      email,
    });
  } catch (error) {
    console.error(error);
    if (error.name === "ValidationError") {
      return validationErrorWithData(res, "Falha na validação.", error.errors);
    }
    return errorResponse(res, "ERRO_INTERNO_DO_SERVIDOR");
  }
};

exports.signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user;

    // Tenta encontrar o usuário com base no e-mail
    user = await Student.findOne({ email });
    if (!user) {
      user = await School.findOne({ email });
      if (!user) user = await Company.findOne({ email });
    }

    // Verifica se o usuário foi encontrado
    if (!user) {
      console.log("Usuário não encontrado:", email);
      return errorResponse(res, "Email ou senha estão incorretos.");
    }

    // Logs para depuração
    // console.log("Senha fornecida:", password);
    // console.log("Senha armazenada:", user.password);

    // Comparar a senha inserida com a senha armazenada (criptografada)
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json({ status: "FAILED", message: "Credenciais inválidas." });
    }

    // Atualizar o atributo isOnline para true
    user.isOnline = true;
    await user.save(); // Salva a alteração no banco de dados

    // Gera o token JWT
    const token = jwt.sign(
      { userId: user._id, accountType: user.constructor.modelName },
      process.env.JWT_SECRET, // A chave secreta para assinatura
      { expiresIn: "7d" }
    );

    console.log("Token gerado:", token); // Log do token gerado

    return successResponseWithData(res, "Login bem-sucedido.", { token });
  } catch (error) {
    console.error("Erro no login:", error);
    return errorResponse(res, error.message || "ERRO_INTERNO_DO_SERVIDOR");
  }
};
