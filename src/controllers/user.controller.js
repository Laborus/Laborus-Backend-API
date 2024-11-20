const APPLICATION_ERRORS = require("../models/application.errors.enum");
const authenticateJWT = require("../middlewares/JWT.middleware");
const {
  successResponseWithData,
  errorResponse,
  successResponse,
} = require("../utils/api.response");
const Student = require("../models/student.model");
const School = require("../models/school.model");
const Company = require("../models/company.model");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id; // Obtém o ID do usuário da requisição
    let user;

    // Tenta encontrar o usuário como Student
    user = await Student.findById(userId);
    if (user) {
      return successResponseWithData(res, "User retrieved successfully.", user);
    }

    // Se não encontrar, tenta como School
    user = await School.findById(userId);
    if (user) {
      return successResponseWithData(res, "User retrieved successfully.", user);
    }

    // Se ainda não encontrar, tenta como Company
    user = await Company.findById(userId);
    if (user) {
      return successResponseWithData(res, "User retrieved successfully.", user);
    }

    // Se não encontrar em nenhum dos três, retorna NOT_FOUND
    return errorResponse(res, "NOT_FOUND");
  } catch (error) {
    console.error(error);
    errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    // Buscar todos os usuários de cada tipo
    const students = await Student.find();
    const schools = await School.find();
    const companies = await Company.find();

    // Calcular total de cada tipo de usuário
    const totalStudents = students.length;
    const totalSchools = schools.length;
    const totalCompanies = companies.length;
    const totalUsers = totalStudents + totalSchools + totalCompanies;

    // Contar usuários online
    const onlineStudentsCount = await Student.countDocuments({
      isOnline: true,
    });
    const onlineSchoolsCount = await School.countDocuments({ isOnline: true });
    const onlineCompaniesCount = await Company.countDocuments({
      isOnline: true,
    });

    const totalOnlineUsers =
      onlineStudentsCount + onlineSchoolsCount + onlineCompaniesCount;

    // Agrupar os usuários
    const users = { students, schools, companies };

    successResponseWithData(res, "Users retrieved successfully.", {
      totalUsers,
      totalStudents,
      totalSchools,
      totalCompanies,
      totalOnlineUsers, // Adicionando a contagem de usuários online
      onlineStudentsCount,
      onlineSchoolsCount,
      onlineCompaniesCount,
      users,
    });
  } catch (error) {
    console.error(error);
    errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};

exports.editUser = [
  authenticateJWT,
  async (req, res) => {
    try {
      const userId = req.params.id;
      const { name, otherFields, profileImage, bannerImage, aboutContent, tags } = req.body;

      // Tente buscar o usuário nos três modelos possíveis
      let user =
        (await Student.findById(userId)) ||
        (await School.findById(userId)) ||
        (await Company.findById(userId));

      if (!user) {
        return errorResponse(res, "User not found.");
      }

      // Atualiza os campos permitidos
      if (name) user.name = name;
      if (name) user.aboutContent = aboutContent;
      if (name) user.tags = tags; 
      if (otherFields) user.otherFields = otherFields;

      // Impede a atualização do e-mail
      if (req.body.email) {
        return errorResponse(res, "Email cannot be changed.");
      }

      // Atualiza as imagens se enviadas no corpo
      if (profileImage) {
        if (!isValidBase64(profileImage)) {
          return errorResponse(res, "Invalid Base64 format for profileImage.");
        }
        user.profileImage = profileImage;
      }

      if (bannerImage) {
        if (!isValidBase64(bannerImage)) {
          return errorResponse(res, "Invalid Base64 format for bannerImage.");
        }
        user.bannerImage = bannerImage;
      }

      // Salva as alterações no banco de dados
      await user.save();

      return successResponseWithData(res, "User updated successfully.", user);
    } catch (error) {
      console.error("Erro interno:", error); // Log para depuração
      return errorResponse(res, "INTERNAL_SERVER_ERROR");
    }
  },
];

// Função para validar se uma string está em formato Base64
function isValidBase64(str) {
  const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
  return base64Regex.test(str);
}

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find();
    const totalStudents = students.length;

    successResponseWithData(res, "Students retrieved successfully.", {
      totalStudents,
      students,
    });
  } catch (error) {
    console.error(error);
    errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};

// Get all schools
exports.getAllSchools = async (req, res) => {
  try {
    const schools = await School.find();
    const totalSchools = schools.length;

    successResponseWithData(res, "Schools retrieved successfully.", {
      totalSchools,
      schools,
    });
  } catch (error) {
    console.error(error);
    errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};

// Get all companies
exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find();
    const totalCompanies = companies.length;

    successResponseWithData(res, "Companies retrieved successfully.", {
      totalCompanies,
      companies,
    });
  } catch (error) {
    console.error(error);
    errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};

exports.deleteUser = [
  authenticateJWT,
  async (req, res) => {
    try {
      const userId = req.params.id; // Obtém o ID do usuário da requisição

      // Tenta encontrar e deletar o usuário como Student
      let result = await Student.findByIdAndDelete(userId);
      if (result) {
        return successResponse(res, "User deleted successfully.");
      }

      // Se não encontrar, tenta como School
      result = await School.findByIdAndDelete(userId);
      if (result) {
        return successResponse(res, "User deleted successfully.");
      }

      // Se ainda não encontrar, tenta como Company
      result = await Company.findByIdAndDelete(userId);
      if (result) {
        return successResponse(res, "User deleted successfully.");
      }

      // Se não encontrar em nenhum dos três, retorna NOT_FOUND
      return errorResponse(res, "NOT_FOUND");
    } catch (error) {
      console.error(error);
      return errorResponse(res, "INTERNAL_SERVER_ERROR");
    }
  },
];

exports.deleteAllUsers = async (req, res) => {
  try {
    // Deleta todos os usuários de todos os tipos
    await Student.deleteMany({});
    await School.deleteMany({});
    await Company.deleteMany({});

    successResponse(res, "All users deleted successfully.");
  } catch (error) {
    console.error(error);
    errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};
