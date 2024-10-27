const express = require("express");
const authenticateJWT = require("../middlewares/JWT.middleware");
const router = express.Router();
const connectionsController = require("../controllers/connections.controller");

router.get(
  "/connections",
  authenticateJWT,
  connectionsController.getUserConnections
);  

router.post(
  "/connections/request",
  authenticateJWT,
  connectionsController.sendConnectionRequest
);

router.post(
  "/connections/respond",
  authenticateJWT,
  connectionsController.handleConnectionRequest
);

router.delete(
  "/connections/delete",
  authenticateJWT,
  connectionsController.deleteConnection
);

module.exports = router;
