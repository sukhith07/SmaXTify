const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  getNotifications,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
} = require("../controllers/notificationController");

router.get("/", protect, getNotifications);

router.post("/", protect, createNotification);

router.put(
  "/:id/read",
  protect,
  markNotificationAsRead
);

router.put(
  "/read-all",
  protect,
  markAllNotificationsAsRead
);

router.delete(
  "/:id",
  protect,
  deleteNotification
);

router.delete(
  "/",
  protect,
  clearAllNotifications
);

module.exports = router;