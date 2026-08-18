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

  createdAt: {
    type: Date,
    default: Date.now,
  },

});

module.exports = mongoose.model("User", userSchema);