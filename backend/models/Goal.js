const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
{
    title: {
        type: String,
        required: true,
        trim: true,
    },

    targetAmount: {
        type: Number,
        required: true,
        min: 1,
    },

    savedAmount: {
        type: Number,
        default: 0,
        min: 0,
    },

    icon: {
        type: String,
        default: "🎯",
    },

    targetDate: {
        type: Date,
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

module.exports = mongoose.model("Goal", goalSchema);