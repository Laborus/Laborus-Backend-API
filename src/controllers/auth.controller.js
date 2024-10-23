const mongoose = require("mongoose");
const Student = require("../models/student.model");
const School = require("../models/school.model");
const Company = require("../models/company.model");
const bcrypt = require("bcrypt");
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
      password,
      accountType,
      location,
      tags,
      aboutContent,
      profileImage,
      bannerImage,
      saved,
      savedItemType,
      following,
      cpf, // Para Student
      cnpj, // Para School e Company
      courses, // Para School
      school, // Para Student
    } = req.body;

    // Verifica se o e-mail já está registrado em qualquer uma das coleções
    const existingUser =
      (await Student.findOne({ email })) ||
      (await School.findOne({ email })) ||
      (await Company.findOne({ email }));

    if (existingUser) {
      return validationErrorWithData(res, "Email já está em uso.", { email });
    }

    // Campos comuns a todos os tipos de usuário
    const commonFields = {
      name,
      email,
      password: await bcrypt.hash(password, 10), // Hash da senha
      accountType,
      isEmailVerified: false, // Considerar o valor padrão como false
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
          {
            school,
          }
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
    console.log("Senha fornecida:", password);
    console.log("Hash armazenado:", user.password);

    // Comparar a senha inserida com o hash armazenado
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("A senha é válida?", isPasswordValid); // Log para ver se a senha corresponde
    if (!isPasswordValid) {
      console.log("Senha incorreta para o usuário:", email);
      return errorResponse(res, "Email ou senha estão incorretos.");
    }

    // Gera o token JWT
    const token = jwt.sign(
      { userId: user._id, accountType: user.constructor.modelName },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // Token válido por 7 dias
    );
    console.log("Token gerado:", token); // Log do token gerado

    // Resposta de sucesso com o token
    return successResponseWithData(res, "Login bem-sucedido.", { token });
  } catch (error) {
    console.error("Erro no login:", error);
    return errorResponse(res, error.message || "ERRO_INTERNO_DO_SERVIDOR");
  }
};
