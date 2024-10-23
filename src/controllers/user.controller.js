const APPLICATION_ERRORS = require("../models/application.errors.enum");
const {
  successResponseWithData,
  errorResponse,
  successResponse,
} = require("../utils/api.response");
const Student = require("../models/student.model");
const School = require("../models/school.model");
const Company = require("../models/company.model");

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

exports.deleteUser = async (req, res) => {
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
    errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};

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
