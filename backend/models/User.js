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

  googleId: {
    type: String,
    default: null,
  },

  photo: {
    type: String,
    default: "",
  },

  resetOTP: {
    type: String,
    default: null,
  },

  resetOTPExpire: {
    type: Date,
    default: null,
  },

  settings: {
    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "light",
    },

    notifications: {
      push: {
        type: Boolean,
        default: true,
      },

      email: {
        type: Boolean,
        default: true,
      },

      billReminders: {
        type: Boolean,
        default: true,
      },

      financialAlerts: {
        type: Boolean,
        default: true,
      },
    },

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
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

});

module.exports = mongoose.model("User", userSchema);