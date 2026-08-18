const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  saveBudget,
  getBudget,
  getBudgetProgress,
  deleteBudget,
} = require("../controllers/budgetController");

// ===============================
// Create / Update Budget
// ===============================
router.post("/", protect, saveBudget);

// ===============================
// Get Monthly Budget
// Example:
// /api/budget?month=2026-08
// ===============================
router.get("/", protect, getBudget);

// ===============================
// Budget Progress
// Example:
// /api/budget/progress?month=2026-08
// ===============================
router.get("/progress", protect, getBudgetProgress);

// ===============================
// Delete Budget
// ===============================
router.delete("/:id", protect, deleteBudget);

module.exports = router;