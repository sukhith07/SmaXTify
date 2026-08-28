const express = require("express");

const {
  createAccount,
  getAccounts,
  getAccount,
  updateAccount,
  deleteAccount,
} = require("../controllers/accountController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  createAccount
);

router.get(
  "/",
  protect,
  getAccounts
);

router.get(
  "/:id",
  protect,
  getAccount
);

router.put(
  "/:id",
  protect,
  updateAccount
);

router.delete(
  "/:id",
  protect,
  deleteAccount
);

module.exports = router;