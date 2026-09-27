const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    default: null,
  },

  provider: {
    type: String,
    enum: ["local", "google"],
    default: "local",
  },

  // ============================
  // USER ROLE
  // ============================

  role: {
    type: String,
    enum: [
      "user",
      "admin",
      "superadmin",
    ],
    default: "user",
  },

  googleId: {
    type: String,
    default: null,
  },

  photo: {
    type: String,
    default: "",
  },

  // ============================
  // PASSWORD RESET
  // ============================

  resetOTP: {
    type: String,
    default: null,
  },

  resetOTPExpire: {
    type: Date,
    default: null,
  },

  // ============================
  // USER SETTINGS
  // ============================

  settings: {

    // ----------------------------
    // Appearance
    // ----------------------------

    theme: {
      type: String,
      enum: [
        "light",
        "dark",
        "system",
      ],
      default: "light",
    },

    appearance: {

      accentColor: {
        type: String,
        enum: [
          "blue",
          "purple",
          "green",
          "orange",
          "rose",
          "cyan",
        ],
        default: "blue",
      },

      animations: {
        type: Boolean,
        default: true,
      },

      compactMode: {
        type: Boolean,
        default: false,
      },

    },

    // ----------------------------
    // Notifications
    // ----------------------------

    notifications: {

      push: {
        type: Boolean,
        default: true,
      },

      email: {
        type: Boolean,
        default: true,
      },

      financialAlerts: {
        type: Boolean,
        default: true,
      },

    },

    // ----------------------------
    // Currency & Region
    // ----------------------------

    currency: {
      type: String,
      default: "INR",
      trim: true,
    },

    timezone: {
      type: String,
      default: "Asia/Kolkata",
      trim: true,
    },

    // ----------------------------
    // SmaXTify AI
    // ----------------------------

    ai: {

      enabled: {
        type: Boolean,
        default: true,
      },

      confirmActions: {
        type: Boolean,
        default: true,
      },

      saveChatHistory: {
        type: Boolean,
        default: true,
      },

    },

  },

  // ============================
  // CREATED AT
  // ============================

  createdAt: {
    type: Date,
    default: Date.now,
  },

});

module.exports = mongoose.model(
  "User",
  userSchema
);