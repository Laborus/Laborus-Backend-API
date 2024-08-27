const mongoose = require("mongoose");
const Job = require("../models/job");
const User = require("../models/user");
const {
  successResponseWithData,
  errorResponse,
} = require("../utils/api.response");

exports.getAllJobs = async (req, res) => {
  try {
    const filter = {};
    const limit = parseInt(req.query.limit) || 25;

    if (req.query.title) {
      filter.title = new RegExp(req.query.title, "i");
    }
    if (req.query.companyName) {
      const company = await User.findOne({
        name: new RegExp(req.query.companyName, "i"),
        accountType: "Company",
      });

      if (company) {
        filter.company = company._id;
      } else {
        return successResponseWithData(
          res,
          "No jobs found for the specified company.",
          { jobs: [], count: 0 }
        );
      }
    }
    if (req.query.period) {
      filter.period = req.query.period;
    }
    if (req.query.modality) {
      filter.modality = req.query.modality;
    }
    if (req.query.location) {
      filter.location = req.query.location;
    }
    if (req.query.tags) {
      const tagsArray = req.query.tags.split(",");
      filter.tags = { $in: tagsArray };
    }

    const totalCount = await Job.countDocuments(filter);
    const jobs = await Job.find(filter).limit(limit);

    successResponseWithData(res, "Jobs retrieved successfully.", {
      totalCount,
      jobs,
    });
  } catch (error) {
    console.error(error);
    errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};

// exports.createJob = (req, res) => {};

// exports.updateJob = (req, res) => {};

// exports.deleteJob = (req, res) => {};

// exports.submitJob = (req, res) => {};

// exports.submittedUsers = (req, res) => {};

// exports.reportJob = (req, res) => {};
