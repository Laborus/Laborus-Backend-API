const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth.controller");
const bcrypt = require("bcrypt");
const {
  validateUser,
  checkDuplicateUser,
  encryptPassword,
} = require("../middlewares/auth.middleware");

router.post(
  "/signup",
  validateUser,
  encryptPassword,
  checkDuplicateUser,
  AuthController.signup
);

router.post("/signin", AuthController.signin);

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    await authController.forgotPassword(email);
    return res
      .status(200)
      .json({ message: "Email de redefinição de senha enviado." });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

module.exports = router;
''