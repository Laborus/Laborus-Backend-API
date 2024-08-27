const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

router.get("/users", userController.getAllUsers);
router.get("/users/:id", userController.getUserById);
router.delete("/users/:id", userController.deleteUser);
// Temporarily
router.delete("/users", userController.deleteAllUsers);

module.exports = router;
