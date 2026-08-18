const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  getSubscriptions,
  getSubscriptionById,
  addSubscription,
  updateSubscription,
  deleteSubscription,
} = require("../controllers/subscriptionController");

router.get(
  "/",
  protect,
  getSubscriptions
);

router.post(
  "/",
  protect,
  addSubscription
);

router.get(
  "/:id",
  protect,
  getSubscriptionById
);

router.put(
  "/:id",
  protect,
  updateSubscription
);

router.delete(
  "/:id",
  protect,
  deleteSubscription
);

module.exports = router;