const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const adminAuth = require("../config/firebase");

// ============================
// Register User
// ============================
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      provider: "local",
    });

    res.status(201).json({
      message: "User Registered Successfully",
      user,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ============================
// Login User
// ============================
const loginUser = async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid Email",
      });
    }

    if (user.provider === "google") {
      return res.status(400).json({
        message: "Please continue with Google",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Password",
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      message: "Login Successful",
      token,
      user,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ============================
// Google Login
// ============================
const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    const decodedToken = await adminAuth.verifyIdToken(idToken);

    const {
      uid,
      email,
      name,
      picture,
    } = decodedToken;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        provider: "google",
        googleId: uid,
        photo: picture,
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Google Login Successful",
      token,
      user,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Google Authentication Failed",
    });
  }
};

// ============================
// Send OTP
// ============================
const sendOTP = async (req, res) => {
  try {

    const { email } = req.body;

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(404).json({
        message: "Email not registered",
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    user.resetOTP = otp;
    user.resetOTPExpire =
      Date.now() + 5 * 60 * 1000;

    await user.save();

    const transporter =
      nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

    await transporter.sendMail({
      from: `"SmaXTify" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "SmaXTify Password Reset OTP",
      html: `
      <div style="font-family:Arial">
        <h2>SmaXTify</h2>

        <p>Your OTP is</p>

        <h1 style="letter-spacing:5px;color:#2563eb">
          ${otp}
        </h1>

        <p>
          This OTP expires in
          <b>5 minutes</b>.
        </p>
      </div>
      `,
    });

    res.status(200).json({
      message: "OTP sent successfully",
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Failed to send OTP",
    });

  }
};

// ============================
// Verify OTP
// ============================
const verifyOTP = async (req, res) => {
  try {

    const { email, otp } = req.body;

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (
      user.resetOTP !== otp ||
      user.resetOTPExpire < Date.now()
    ) {
      return res.status(400).json({
        message: "Invalid or Expired OTP",
      });
    }

    res.status(200).json({
      message: "OTP Verified Successfully",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

// ============================
// Reset Password
// ============================
const resetPassword = async (req, res) => {
  try {

    const {
      email,
      otp,
      password,
    } = req.body;

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (
      user.resetOTP !== otp ||
      user.resetOTPExpire < Date.now()
    ) {
      return res.status(400).json({
        message: "Invalid or Expired OTP",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.provider = "local";
    user.resetOTP = null;
    user.resetOTPExpire = null;

    await user.save();

    res.status(200).json({
      message:
        "Password Reset Successfully",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  sendOTP,
  verifyOTP,
  resetPassword,
};