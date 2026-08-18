const express = require("express");

const router = express.Router();

const {
  getReport,
} = require("../controllers/reportController");

// ======================================
// Authentication Middleware
// ======================================

const protect =
  require("../middleware/authMiddleware");

// ======================================
// GET FINANCIAL REPORT
// ======================================

router.get(
  "/",
  protect,
  getReport
);

module.exports = router;