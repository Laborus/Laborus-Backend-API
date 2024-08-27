const mongoose = require("mongoose");
const jobSchema = require("./jobs.model");

const companySchema = new mongoose.Schema({
  cnpj: {
    type: String,
    required: [true, "Please! CNPJ is required."],
    unique: [true, "CNPJ is already in use."],
    trim: true,
  },
  jobs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
  ],
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
