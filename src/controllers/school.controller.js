const mongoose = require("mongoose");
const {
  successResponseWithData,
  errorResponse,
} = require("../utils/api.response");
const Challenge = require("../models/challenge.model");

// Get school details with optional additional information
exports.getSchoolByName = async (req, res) => {
  try {
    const { schoolName, includeStudents, includeChallenges } = req.query;

    if (!schoolName) {
      return errorResponse(
        res,
        "SCHOOL_NAME_REQUIRED",
        "The school name is required."
      );
    }

    const school = await School.findOne({ name: schoolName });

    if (!school) {
      return errorResponse(
        res,
        "SCHOOL_NOT_FOUND",
        "The requested school was not found."
      );
    }

    const students =
      includeStudents === "true"
        ? await Student.find({
            school: mongoose.Types.ObjectId(school._id),
          })
        : [];

    const onlineStudentsCount =
      includeStudents === "true"
        ? await Student.countDocuments({
            school: mongoose.Types.ObjectId(school._id),
            isOnline: true,
          })
        : 0;

    const totalFollowers = school.followers.length || 0;

    const challenges =
      includeChallenges === "true"
        ? {
            challengesList: [],
          }
        : null;

    if (includeChallenges === "true") {
      // Find challenges created by the school's students
      challenges.challengesList = await Challenge.find({
        createdBy: { $in: students.map((student) => student._id) },
      });

      challenges.totalChallenges = challenges.challengesList.length;
    }

    successResponseWithData(res, "School retrieved successfully.", {
      school,
      counts: {
        totalStudents: students.length,
        onlineStudents: onlineStudentsCount,
        followers: totalFollowers,
        challenges: challenges ? challenges.totalChallenges : 0,
      },
      students: includeStudents === "true" ? students : undefined,
      challenges: includeChallenges === "true" ? challenges : undefined,
    });
  } catch (error) {
    console.error(error);
    errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};
