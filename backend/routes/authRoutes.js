const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
  googleLogin,
  sendOTP,
  verifyOTP,
  resetPassword,
  getCurrentUser,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");


// ============================
// Authentication Routes
// ============================

router.post(
  "/register",
  registerUser
);

router.post(
  "/login",
  loginUser
);

router.post(
  "/google",
  googleLogin
);


// ============================
// Current User
// ============================

router.get(
  "/me",
  protect,
  getCurrentUser
);


// ============================
// Password Reset
// ============================

router.post(
  "/send-otp",
  sendOTP
);

router.post(
  "/verify-otp",
  verifyOTP
);

router.post(
  "/reset-password",
  resetPassword
);


module.exports = router;