const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth.controller");
const { validateUser } = require("../middlewares/auth.middleware");

router.post("/signup", validateUser, AuthController.signup);
router.post("/verify-otp", AuthController.verifyOtp);
router.post("/resend-otp", AuthController.resendOtp);
module.exports = router;
