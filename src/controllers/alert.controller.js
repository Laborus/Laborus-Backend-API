const Alert = require("../models/alert.model");
const School = require("../models/school.model");
const Student = require("../models/student.model");
const Company = require("../models/company.model");

const {
  validationErrorWithData,
  successResponseWithData,
  errorResponse,
} = require("../utils/api.response");

// Get all alerts with count
exports.getAllAlerts = async (req, res) => {
  try {
    // Fetch all alerts sorted by creation date (most recent first)
    const alerts = await Alert.find().sort({ createdAt: -1 });

    // Count total number of alerts
    const totalAlerts = await Alert.countDocuments();

    // Return success response with both alerts and total count
    return successResponseWithData(res, "Alerts retrieved successfully.", {
      totalAlerts,
      alerts,
    });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};

exports.alertsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId; // Pega o userId da URL

    // Consulta apenas pelo userId, sem verificar userType
    const alerts = await Alert.find({ createdBy: userId }).sort({
      createdAt: -1,
    });

    return successResponseWithData(
      res,
      "Alerts retrieved successfully.",
      alerts
    );
  } catch (error) {
    console.error("Error fetching alerts by user ID:", error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};

// Create a new alert
exports.createAlert = async (req, res) => {
  try {
    const { title, tag, text, createdBy } = req.body;
    const newAlert = new Alert({
      title,
      tag,
      text,
      createdBy,
    });
    const savedAlert = await newAlert.save();
    res.status(201).json(savedAlert);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update an alert
exports.updateAlert = async (req, res) => {
  const { id } = req.params;
  const { title, tag, text, urgencyLevel } = req.body;

  try {
    const updatedAlert = await Alert.findByIdAndUpdate(
      id,
      { title, tag, text, urgencyLevel, updatedAt: Date.now() },
      { new: true }
    );

    if (!updatedAlert) {
      return errorResponse(res, "Alert not found.");
    }

    return successResponseWithData(
      res,
      "Alert updated successfully!",
      updatedAlert
    );
  } catch (error) {
    console.error("Error updating alert:", error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};

// Delete an alert
exports.deleteAlert = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedAlert = await Alert.findByIdAndDelete(id);

    if (!deletedAlert) {
      return errorResponse(res, "Alert not found.");
    }

    return successResponseWithData(
      res,
      "Alert deleted successfully!",
      deletedAlert
    );
  } catch (error) {
    console.error("Error deleting alert:", error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};

// Get alert by ID
exports.alertById = async (req, res) => {
  const { id } = req.params;

  try {
    const alert = await Alert.findById(id);
    if (!alert) {
      return errorResponse(res, "Alert not found.");
    }
    return successResponseWithData(res, "Alert retrieved successfully.", alert);
  } catch (error) {
    console.error("Error fetching alert by ID:", error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};
