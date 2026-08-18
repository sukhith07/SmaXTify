const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  addExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getSummary,
} = require("../controllers/expenseController");

// ===============================
// Dashboard Summary
// ===============================
router.get("/summary", protect, getSummary);

// ===============================
// Transactions
// ===============================
router.post("/", protect, addExpense);

router.get("/", protect, getExpenses);

router.get("/:id", protect, getExpenseById);

router.put("/:id", protect, updateExpense);

router.delete("/:id", protect, deleteExpense);

module.exports = router;