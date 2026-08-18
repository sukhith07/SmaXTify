const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "bill",
        "budget",
        "goal",
        "subscription",
        "calendar",
        "warning",
        "success",
        "info",
      ],
      default: "info",
    },

    read: {
      type: Boolean,
      default: false,
    },

    time: {
      type: Date,
      default: Date.now,
    },

    source: {
      type: String,
      enum: [
        "subscription",
        "expense",
        "budget",
        "goal",
        "system",
      ],
      default: "system",
    },

    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    reminderKey: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({
  user: 1,
  time: -1,
});

notificationSchema.index(
  {
    user: 1,
    reminderKey: 1,
  },
  {
    unique: true,
    sparse: true,
  }
);

module.exports = mongoose.model(
  "Notification",
  notificationSchema
);