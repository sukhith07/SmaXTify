const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  name: {
    type: String,
    required: true,
    trim: true,
  },

  type: {
    type: String,
    enum: [
      "bank",
      "cash",
      "wallet",
      "credit",
      "other",
    ],
    default: "bank",
  },

  details: {
    type: String,
    trim: true,
    default: "",
  },

  balance: {
    type: Number,
    default: 0,
    min: 0,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

});

module.exports = mongoose.model("Account", accountSchema);