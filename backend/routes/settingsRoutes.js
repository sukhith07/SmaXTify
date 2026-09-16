const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  getSettings,
  updateProfile,
  updatePreferences,
  changePassword,
  resetSettings,
  deleteAllTransactions,
  deleteAccount,
} = require("../controllers/settingsController");

router.get(
  "/",
  protect,
  getSettings
);

router.put(
  "/profile",
  protect,
  updateProfile
);

router.put(
  "/preferences",
  protect,
  updatePreferences
);

router.put(
  "/password",
  protect,
  changePassword
);

router.post(
  "/reset",
  protect,
  resetSettings
);

router.delete(
  "/transactions",
  protect,
  deleteAllTransactions
);

router.delete(
  "/account",
  protect,
  deleteAccount
);

module.exports = router;