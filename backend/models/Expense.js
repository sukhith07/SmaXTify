const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      default: "Other",
    },

    type: {
      type: String,
      enum: ["Income", "Expense"],
      required: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },

    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      default: null,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Expense",
  expenseSchema
);