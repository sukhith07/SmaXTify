const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "Entertainment",
        "Education",
        "Software",
        "Health",
        "Shopping",
        "Gaming",
        "Other",
      ],
      default: "Other",
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    cycle: {
      type: String,
      enum: ["Weekly", "Monthly", "Yearly"],
      default: "Monthly",
    },

    startDate: {
      type: Date,
      required: true,
    },

    nextPayment: {
      type: Date,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: [
        "UPI",
        "Card",
        "Net Banking",
        "Cash",
        "Other",
      ],
      default: "UPI",
    },

    autoRenew: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: ["Active", "Paused", "Cancelled"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Subscription",
  subscriptionSchema
);