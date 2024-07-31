const mongoose = require("mongoose");
const jobSchema = require("./jobs.model");

const companySchema = new mongoose.Schema({
  cnpj: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  jobs: [jobSchema],
  contactLinks: {
    website: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
  },
});

module.exports = mongoose.model("Company", companySchema);
