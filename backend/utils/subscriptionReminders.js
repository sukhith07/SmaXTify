const Subscription = require("../models/Subscription");
const Notification = require("../models/Notification");

const generateSubscriptionReminders = async (userId) => {
  try {
    const subscriptions = await Subscription.find({
      user: userId,
      status: "Active",
      nextPayment: {
        $exists: true,
        $ne: null,
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const subscription of subscriptions) {
      const paymentDate = new Date(
        `${subscription.nextPayment}T00:00:00`
      );

      if (isNaN(paymentDate.getTime())) {
        continue;
      }

      paymentDate.setHours(0, 0, 0, 0);

      const difference =
        paymentDate.getTime() - today.getTime();

      const daysUntilPayment = Math.ceil(
        difference / 86400000
      );

      let reminderType = null;
      let title = "";
      let message = "";

      if (daysUntilPayment === 7) {
        reminderType = "7-days";
        title = `${subscription.name} renews in 7 days`;
        message = `${subscription.name} will renew on ${formatDate(
          subscription.nextPayment
        )} for ${formatCurrency(subscription.amount)}.`;
      } else if (daysUntilPayment === 3) {
        reminderType = "3-days";
        title = `${subscription.name} renewal coming up`;
        message = `${subscription.name} will renew in 3 days for ${formatCurrency(
          subscription.amount
        )}.`;
      } else if (daysUntilPayment === 1) {
        reminderType = "1-day";
        title = `${subscription.name} renews tomorrow`;
        message = `${subscription.name} is scheduled to renew tomorrow for ${formatCurrency(
          subscription.amount
        )}.`;
      } else if (daysUntilPayment === 0) {
        reminderType = "today";
        title = `${subscription.name} renews today`;
        message = `${subscription.name} is due today for ${formatCurrency(
          subscription.amount
        )}.`;
      }

      if (!reminderType) {
        continue;
      }

      if (subscription.autoRenew) {
        message += " Auto-renew is enabled.";
      } else {
        message += " Manual renewal is required.";
      }

      const paymentDateKey =
        typeof subscription.nextPayment === "string"
          ? subscription.nextPayment
          : paymentDate.toISOString().slice(0, 10);

      const reminderKey =
        `subscription-${subscription._id}-${paymentDateKey}-${reminderType}`;

      const existingNotification =
        await Notification.findOne({
          user: userId,
          reminderKey,
        });

      if (existingNotification) {
        continue;
      }

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
    }
  } catch (error) {
    console.error(
      "Subscription Reminder Error:",
      error.message
    );
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date) => {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(
    `${date}T00:00:00`
  );

  if (isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

module.exports =
  generateSubscriptionReminders;