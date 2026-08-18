const mongoose = require("mongoose");

const categoryBudgetSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      trim: true,
    },

    limit: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    spent: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    month: {
      type: String,
      required: true,
      trim: true,
    },

    totalBudget: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
    },

    remainingBudget: {
      type: Number,
      default: 0,
    },

    categories: [categoryBudgetSchema],
  },
  {
    timestamps: true,
  }
);

// One budget per user per month
budgetSchema.index(
  {
    user: 1,
    month: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("Budget", budgetSchema);