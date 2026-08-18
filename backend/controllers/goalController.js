const Goal = require("../models/Goal");

// ======================================
// Create Goal
// ======================================

exports.createGoal = async (req, res) => {
  try {
    const {
      title,
      targetAmount,
      savedAmount,
      icon,
      targetDate,
    } = req.body;

    if (!title || !targetAmount) {
      return res.status(400).json({
        success: false,
        message: "Title and Target Amount are required.",
      });
    }

    const goal = await Goal.create({
      title,
      targetAmount: Number(targetAmount),
      savedAmount: Number(savedAmount) || 0,
      icon: icon || "🎯",
      targetDate,
      user: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Goal created successfully.",
      goal,
    });
  } catch (error) {
    console.error("Create Goal Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create goal.",
      error: error.message,
    });
  }
};

// ======================================
// Get Goals
// ======================================

exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      goals,
    });
  } catch (error) {
    console.error("Get Goals Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load goals.",
      error: error.message,
    });
  }
};

// ======================================
// Update Goal
// ======================================

exports.updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found.",
      });
    }

    if (goal.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const {
      title,
      targetAmount,
      savedAmount,
      icon,
      targetDate,
    } = req.body;

    if (title !== undefined) goal.title = title;
    if (targetAmount !== undefined)
      goal.targetAmount = Number(targetAmount);
    if (savedAmount !== undefined)
      goal.savedAmount = Number(savedAmount);
    if (icon !== undefined) goal.icon = icon;
    if (targetDate !== undefined) goal.targetDate = targetDate;

    await goal.save();

    res.status(200).json({
      success: true,
      message: "Goal updated successfully.",
      goal,
    });
  } catch (error) {
    console.error("Update Goal Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update goal.",
      error: error.message,
    });
  }
};

// ======================================
// Add Savings
// ======================================

exports.addSavings = async (req, res) => {
  try {
    const { amount } = req.body;

    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found.",
      });
    }

    if (goal.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    goal.savedAmount += Number(amount);

    await goal.save();

    res.status(200).json({
      success: true,
      message: "Savings added successfully.",
      goal,
    });
  } catch (error) {
    console.error("Add Savings Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add savings.",
      error: error.message,
    });
  }
};

// ======================================
// Delete Goal
// ======================================

exports.deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found.",
      });
    }

    if (goal.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    await goal.deleteOne();

    res.status(200).json({
      success: true,
      message: "Goal deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Goal Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete goal.",
      error: error.message,
    });
  }
};