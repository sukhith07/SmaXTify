const express = require("express");

const router = express.Router();

const {
  chatWithGemini,
  generateReportInsights,
  categorizeTransaction,
} = require("../controllers/aiController");

const protect =
  require("../middleware/authMiddleware");

router.post(
  "/chat",
  protect,
  chatWithGemini
);

router.post(
  "/report-insights",
  protect,
  generateReportInsights
);

router.post(
  "/categorize",
  protect,
  categorizeTransaction
);

module.exports = router;