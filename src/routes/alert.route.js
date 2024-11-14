const express = require("express");
const router = express.Router();
const alertController = require("../controllers/alert.controller");
const authenticateJWT = require("../middlewares/JWT.middleware"); // Ajuste o caminho conforme necessário

// Get all alerts
router.get("/alerts", alertController.getAllAlerts);

// Get alerts by any user ID (pass user ID in the URL)
router.get("/alerts/:userId", authenticateJWT, alertController.alertsByUserId);

// Get alert by ID
router.get("/alert/:id", authenticateJWT, alertController.alertById);

// Create a new alert
router.post("/alert", authenticateJWT, alertController.createAlert);

// Update an existing alert
router.put("/alert/:id", authenticateJWT, alertController.updateAlert);

// Delete an alert
router.delete("/alert/:id", authenticateJWT, alertController.deleteAlert);

module.exports = router;
