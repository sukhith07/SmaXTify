const Notification = require("../models/Notification");
const Subscription = require("../models/Subscription");

const normalizeDate = (value) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  const stringValue = String(value);

  const date = new Date(
    stringValue.includes("T")
      ? stringValue
      : `${stringValue}T00:00:00`
  );

  if (isNaN(date.getTime())) {
    return null;
  }

  date.setHours(0, 0, 0, 0);

  return date;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
};

const formatDate = (value) => {
  const date = normalizeDate(value);

  if (!date) {
    return "";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const generateSubscriptionReminders = async (
  userId
) => {
  try {
    const subscriptions =
      await Subscription.find({
        user: userId,
        status: "Active",
        nextPayment: {
          $exists: true,
          $ne: null,
        },
      });

    console.log(
      "Active subscriptions found:",
      subscriptions.length
    );

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    for (const subscription of subscriptions) {
      console.log(
        "Checking subscription:",
        subscription.name,
        "| nextPayment:",
        subscription.nextPayment
      );

      const paymentDate = normalizeDate(
        subscription.nextPayment
      );

      if (!paymentDate) {
        console.log(
          "Invalid payment date for:",
          subscription.name
        );
        continue;
      }

      const difference =
        paymentDate.getTime() -
        today.getTime();

      const daysUntilPayment = Math.round(
        difference / 86400000
      );

      console.log(
        subscription.name,
        "| days until payment:",
        daysUntilPayment
      );

      let reminderType = null;
      let title = "";
      let message = "";

      if (daysUntilPayment === 7) {
        reminderType = "7-days";

        title =
          `${subscription.name} renews in 7 days`;

        message =
          `${subscription.name} will renew on ` +
          `${formatDate(subscription.nextPayment)} ` +
          `for ${formatCurrency(subscription.amount)}.`;
      }

      if (daysUntilPayment === 3) {
        reminderType = "3-days";

        title =
          `${subscription.name} renewal coming up`;

        message =
          `${subscription.name} will renew in 3 days ` +
          `for ${formatCurrency(subscription.amount)}.`;
      }

      if (daysUntilPayment === 2) {
        reminderType = "2-days";

        title =
          `${subscription.name} renews in 2 days`;

        message =
          `${subscription.name} will renew in 2 days ` +
          `for ${formatCurrency(subscription.amount)}.`;
      }

      if (daysUntilPayment === 1) {
        reminderType = "1-day";

        title =
          `${subscription.name} renews tomorrow`;

        message =
          `${subscription.name} is scheduled to renew ` +
          `tomorrow for ${formatCurrency(subscription.amount)}.`;
      }

      if (daysUntilPayment === 0) {
        reminderType = "today";

        title =
          `${subscription.name} renews today`;

        message =
          `${subscription.name} is due today for ` +
          `${formatCurrency(subscription.amount)}.`;
      }

      if (!reminderType) {
        continue;
      }

      if (subscription.autoRenew) {
        message +=
          " Auto-renew is enabled.";
      } else {
        message +=
          " Manual renewal is required.";
      }

      const paymentDateKey =
        paymentDate.toISOString().slice(0, 10);

      const reminderKey =
        `subscription-${subscription._id}-` +
        `${paymentDateKey}-${reminderType}`;

      const existingNotification =
        await Notification.findOne({
          user: userId,
          reminderKey,
        });

      if (existingNotification) {
        console.log(
          "Reminder already exists:",
          reminderKey
        );

        continue;
      }

      const notification =
        await Notification.create({
          user: userId,
          title,
          message,
          type: "subscription",
          source: "subscription",
          sourceId: subscription._id,
          reminderKey,
          time: new Date(),
          read: false,
        });

      console.log(
        "Notification CREATED:",
        notification.title
      );
    }
  } catch (error) {
    console.error(
      "Subscription Reminder Error:",
      error
    );
  }
};

exports.getNotifications = async (
  req,
  res
) => {
  try {
    console.log(
      "===================================="
    );

    console.log(
      "GET NOTIFICATIONS"
    );

    console.log(
      "User ID:",
      req.user.id
    );

    await generateSubscriptionReminders(
      req.user.id
    );

    const notifications =
      await Notification.find({
        user: req.user.id,
      }).sort({
        time: -1,
      });

    const unreadCount =
      await Notification.countDocuments({
        user: req.user.id,
        read: false,
      });

    console.log(
      "Notifications found:",
      notifications.length
    );

    console.log(
      "Unread notifications:",
      unreadCount
    );

    console.log(
      "===================================="
    );

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications,
    });
  } catch (error) {
    console.error(
      "Get Notifications Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createNotification = async (
  req,
  res
) => {
  try {
    const {
      title,
      message,
      type,
      source,
      sourceId,
      reminderKey,
      time,
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message:
          "Title and message are required",
      });
    }

    if (reminderKey) {
      const existingNotification =
        await Notification.findOne({
          user: req.user.id,
          reminderKey,
        });

      if (existingNotification) {
        return res.status(200).json({
          success: true,
          message:
            "Notification already exists",
          notification:
            existingNotification,
        });
      }
    }

    const notification =
      await Notification.create({
        user: req.user.id,
        title,
        message,
        type: type || "info",
        source: source || "system",
        sourceId: sourceId || null,
        reminderKey:
          reminderKey || null,
        time: time || new Date(),
        read: false,
      });

    res.status(201).json({
      success: true,
      message:
        "Notification created successfully",
      notification,
    });
  } catch (error) {
    console.error(
      "Create Notification Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.markNotificationAsRead =
  async (req, res) => {
    try {
      const notification =
        await Notification.findOne({
          _id: req.params.id,
          user: req.user.id,
        });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message:
            "Notification not found",
        });
      }

      notification.read = true;

      await notification.save();

      res.status(200).json({
        success: true,
        message:
          "Notification marked as read",
        notification,
      });
    } catch (error) {
      console.error(
        "Mark Notification Read Error:",
        error
      );

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

exports.markAllNotificationsAsRead =
  async (req, res) => {
    try {
      await Notification.updateMany(
        {
          user: req.user.id,
          read: false,
        },
        {
          $set: {
            read: true,
          },
        }
      );

      res.status(200).json({
        success: true,
        message:
          "All notifications marked as read",
      });
    } catch (error) {
      console.error(
        "Mark All Notifications Error:",
        error
      );

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

exports.deleteNotification =
  async (req, res) => {
    try {
      const notification =
        await Notification.findOne({
          _id: req.params.id,
          user: req.user.id,
        });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message:
            "Notification not found",
        });
      }

      await notification.deleteOne();

      res.status(200).json({
        success: true,
        message:
          "Notification deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete Notification Error:",
        error
      );

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

exports.clearAllNotifications =
  async (req, res) => {
    try {
      await Notification.deleteMany({
        user: req.user.id,
      });

      res.status(200).json({
        success: true,
        message:
          "All notifications cleared successfully",
      });
    } catch (error) {
      console.error(
        "Clear Notifications Error:",
        error
      );

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };