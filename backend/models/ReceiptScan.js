const mongoose = require("mongoose");

const receiptItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "",
    },
    quantity: {
      type: Number,
      default: 1,
    },
    price: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const receiptScanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    merchant: {
      type: String,
      trim: true,
      default: "",
    },

    date: {
      type: Date,
      default: null,
    },

    currency: {
      type: String,
      trim: true,
      default: "INR",
    },

    subtotal: {
      type: Number,
      default: 0,
    },

    tax: {
      type: Number,
      default: 0,
    },

    total: {
      type: Number,
      default: 0,
    },

    items: {
      type: [receiptItemSchema],
      default: [],
    },

    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expense",
      default: null,
      index: true,
    },

    imageUrl: {
      type: String,
      trim: true,
      default: "",
    },

    imagePublicId: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

receiptScanSchema.index({
  user: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "ReceiptScan",
  receiptScanSchema
);