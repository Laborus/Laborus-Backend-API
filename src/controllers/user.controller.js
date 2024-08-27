const User = require("../models/user.model");
const APPLICATION_ERRORS = require("../models/application.errors.enum");
const {
  successResponseWithData,
  errorResponse,
  successResponse,
} = require("../utils/api.response");

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return errorResponse(res, "NOT_FOUND");
    }

    successResponseWithData(res, "User retrieved successfully.", user);
  } catch (error) {
    console.error(error);
    errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};

// Get all users

exports.getAllUsers = async (req, res) => {
  try {
    const { tags, accountType } = req.query;
    let filter = {};

    if (tags) {
      const tagsArray = tags.split(","); // Converte a string de tags em um array
      const validTags = tagsArray.filter((tag) =>
        Object.values(Tags).includes(tag.toUpperCase())
      );

      if (validTags.length > 0) {
        filter.tags = { $in: validTags };
      }
    }

    if (accountType) {
      const validAccountTypes = ["Student", "School", "Company"];
      if (validAccountTypes.includes(accountType)) {
        filter.accountType = accountType;
      } else {
        return errorResponse(
          res,
          "INVALID_ACCOUNT_TYPE",
          "The provided account type is invalid."
        );
      }
    }

    const totalCount = await User.countDocuments(filter);

    const schoolUsers = await User.countDocuments({ accountType: "School" });
    const studentUsers = await User.countDocuments({ accountType: "Student" });
    const companyUsers = await User.countDocuments({ accountType: "Company" });

    const users = await User.find(filter);

    successResponseWithData(res, "Users retrieved successfully.", {
      totalUsers: totalCount,
      schoolUsers: schoolUsers,
      studentUsers: studentUsers,
      companyUsers: companyUsers,
      users,
    });
  } catch (error) {
    console.error(error);
    errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};

// exports.updateUser = async (req, res) => {};

// exports.userPhoto = async (req, res) => {};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const result = await User.findByIdAndDelete(userId);

    if (!result) {
      return errorResponse(res, "NOT_FOUND");
    }

    successResponse(res, "User deleted successfully.");
  } catch (error) {
    console.error(error);
    errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};
// Temporarily
exports.deleteAllUsers = async (req, res) => {
  try {
    await User.deleteMany({});
    successResponse(res, "All users deleted successfully.");
  } catch (error) {
    console.error(error);
    errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};

// exports.addConnection = async (req, res) => {};

// exports.removeConnection = async (req, res) => {};

// exports.addFollowing = async (req, res) => {};

// exports.removeFollowing = async (req, res) => {};

// exports.addFollower = async (req, res) => {};

// exports.removeFollower = async (req, res) => {};

// exports.saves = async (req, res) => {};

// exports.findUsers = async (req, res) => {};
