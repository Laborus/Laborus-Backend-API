const User = require("../models/user.model");
const Student = require("../models/student.model");
const School = require("../models/school.model");
const Company = require("../models/company.model");
const {
  generateOtp,
  sendOtpEmail,
  storeOtp,
  verifyOtp,
} = require("../utils/mailer-otp");
const {
  successResponseWithData,
  errorResponse,
  validationErrorWithData,
} = require("../utils/api.response");

// Função para registrar um usuário
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
      otp, // Este é o OTP enviado e deve ser verificado
    } = req.body;

    // Verificar o OTP enviado
    if (!verifyOtp(email, otp)) {
      return errorResponse(res, "INVALID_OTP");
    }

    // Se o OTP for válido, prosseguir com o registro do usuário
    const commonFields = {
      name,
      email,
      password,
      accountType,
      isEmailVerified: true, // O e-mail foi verificado
      accountStatus: "active", // Conta ativa após verificação
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

    // Criar o usuário baseado no tipo de conta
    if (accountType === "Student") {
      const { cpf, school, course } = req.body;
      if (!cpf || !school || !course) {
        return validationErrorWithData(
          res,
          "Missing required fields for Student registration.",
          { cpf, school, course }
        );
      }

      // Buscar a escola pelo nome
      const schoolRecord = await School.findOne({ name: school });
      if (!schoolRecord) {
        return validationErrorWithData(res, "School not found.", { school });
      }

      user = new Student({
        ...commonFields,
        cpf,
        school: schoolRecord._id, // Associar o ObjectId da escola
        course,
      });
    } else if (accountType === "School") {
      const { cnpj, courses } = req.body;
      if (!cnpj || !courses) {
        return validationErrorWithData(
          res,
          "Missing required fields for School registration.",
          { cnpj, courses }
        );
      }
      user = new School({
        ...commonFields,
        cnpj,
        courses,
      });
    } else if (accountType === "Company") {
      const { cnpj } = req.body;
      if (!cnpj) {
        return validationErrorWithData(
          res,
          "Missing required fields for Company registration.",
          { cnpj }
        );
      }
      user = new Company({
        ...commonFields,
        cnpj,
      });
    } else {
      return errorResponse(res, "INVALID_ACCOUNT_TYPE");
    }

    await user.save();
    return successResponseWithData(res, "User registered successfully.", user);
  } catch (error) {
    console.error(error);
    if (error.name === "ValidationError") {
      return validationErrorWithData(res, "Validation failed.", error.errors);
    }
    return errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};

// Função para verificar o OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!verifyOtp(email, otp)) {
      return errorResponse(res, "INVALID_OTP");
    }

    return successResponseWithData(res, "OTP verified successfully.", {});
  } catch (error) {
    console.error(error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};

// Função para re-enviar o OTP (opcional, se necessário)
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return validationErrorWithData(res, "Email is required.", { email });
    }

    const generatedOtp = generateOtp();
    storeOtp(email, generatedOtp);
    await sendOtpEmail(email, generatedOtp);

    return successResponseWithData(
      res,
      "An OTP has been sent to your email.",
      {}
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};

// // exports.signin = async (req, res) => {};

// // exports.signout = (req, res) => {};

// // exports.verifyMail = async (req, res) => {};

// // exports.resendConfirmOtp = async (req, res) => {};

// // exports.forgotPassword = (req, res) => {};

// // exports.resetPassword = (req, res) => {};
