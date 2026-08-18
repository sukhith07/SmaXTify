const express = require("express");

const router = express.Router();

const {
  chatWithGemini,
  generateReportInsights,
} = require("../controllers/aiController");


// ======================================
// Normal SmaXTify AI Chat
// ======================================

router.post(
  "/chat",
  chatWithGemini
);


// ======================================
// Financial Report AI Insights
// ======================================

router.post(
  "/report-insights",
  generateReportInsights
);


module.exports = router;