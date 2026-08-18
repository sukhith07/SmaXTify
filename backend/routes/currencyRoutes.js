const express = require("express");

const router = express.Router();

const {
  convertCurrency,
} = require("../controllers/currencyController");

// ======================================
// Currency Conversion
// ======================================

router.get(
  "/convert",
  convertCurrency
);

module.exports = router;