const mongoose = require("mongoose");

const adminPromotionRequestSchema =
  new mongoose.Schema(
    {
      requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      targetUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      status: {
        type: String,
        enum: [
          "pending",
          "approved",
          "rejected",
        ],
        default: "pending",
        index: true,
      },

      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      reviewedAt: {
        type: Date,
        default: null,
      },

      rejectionReason: {
        type: String,
        default: "",
        trim: true,
      },
    },
    {
      timestamps: true,
    }
  );

adminPromotionRequestSchema.index({
  status: 1,
  createdAt: -1,
});

adminPromotionRequestSchema.index({
  targetUser: 1,
  status: 1,
});

module.exports =
  mongoose.model(
    "AdminPromotionRequest",
    adminPromotionRequestSchema
  );