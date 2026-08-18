const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createGoal,
  getGoals,
  updateGoal,
  addSavings,
  deleteGoal,
} = require("../controllers/goalController");

// Create Goal
router.post("/", protect, createGoal);

// Get All Goals
router.get("/", protect, getGoals);

// Update Goal
router.put("/:id", protect, updateGoal);

// Add Savings
router.put("/:id/add", protect, addSavings);

// Delete Goal
router.delete("/:id", protect, deleteGoal);

module.exports = router;