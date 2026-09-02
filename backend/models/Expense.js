const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      trim: true,
      default: "",
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    category: {
      type: String,
      trim: true,
      default: "Other",
    },

    type: {
      type: String,
      enum: ["Income", "Expense", "Transfer"],
      required: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },

    toAccount: {
      type: String,
      trim: true,
      default: "",
    },

    transferAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      default: null,
    },

    transferMode: {
      type: String,
      enum: ["account", "person"],
      default: null,
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