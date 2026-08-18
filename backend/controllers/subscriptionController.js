const Subscription = require("../models/Subscription");

exports.getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({
      user: req.user.id,
    }).sort({
      nextPayment: 1,
    });

    res.status(200).json({
      success: true,
      count: subscriptions.length,
      subscriptions,
    });
  } catch (error) {
    console.error("Get Subscriptions Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getSubscriptionById = async (req, res) => {
  try {
    const subscription =
      await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    if (
      subscription.user.toString() !==
      req.user.id
    ) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized",
      });
    }

    res.status(200).json({
      success: true,
      subscription,
    });
  } catch (error) {
    console.error(
      "Get Subscription Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.addSubscription = async (req, res) => {
  try {
    const {
      name,
      category,
      amount,
      cycle,
      startDate,
      nextPayment,
      paymentMethod,
      autoRenew,
      status,
    } = req.body;

    if (
      !name ||
      amount === undefined ||
      amount === null ||
      !startDate ||
      !nextPayment
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please fill all required subscription fields",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "Subscription amount must be greater than 0",
      });
    }

    const subscription =
      await Subscription.create({
        user: req.user.id,
        name: name.trim(),
        category: category || "Other",
        amount: Number(amount),
        cycle: cycle || "Monthly",
        startDate,
        nextPayment,
        paymentMethod:
          paymentMethod || "UPI",
        autoRenew:
          autoRenew !== undefined
            ? Boolean(autoRenew)
            : true,
        status: status || "Active",
      });

    res.status(201).json({
      success: true,
      message:
        "Subscription Added Successfully",
      subscription,
    });
  } catch (error) {
    console.error(
      "Add Subscription Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateSubscription = async (
  req,
  res
) => {
  try {
    const subscription =
      await Subscription.findById(
        req.params.id
      );

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    if (
      subscription.user.toString() !==
      req.user.id
    ) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized",
      });
    }

    const {
      name,
      category,
      amount,
      cycle,
      startDate,
      nextPayment,
      paymentMethod,
      autoRenew,
      status,
    } = req.body;

    if (
      amount !== undefined &&
      Number(amount) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Subscription amount must be greater than 0",
      });
    }

    if (name !== undefined) {
      subscription.name =
        name.trim();
    }

    if (category !== undefined) {
      subscription.category =
        category;
    }

    if (amount !== undefined) {
      subscription.amount =
        Number(amount);
    }

    if (cycle !== undefined) {
      subscription.cycle =
        cycle;
    }

    if (startDate !== undefined) {
      subscription.startDate =
        startDate;
    }

    if (nextPayment !== undefined) {
      subscription.nextPayment =
        nextPayment;
    }

    if (paymentMethod !== undefined) {
      subscription.paymentMethod =
        paymentMethod;
    }

    if (autoRenew !== undefined) {
      subscription.autoRenew =
        Boolean(autoRenew);
    }

    if (status !== undefined) {
      subscription.status =
        status;
    }

    await subscription.save();

    res.status(200).json({
      success: true,
      message:
        "Subscription Updated Successfully",
      subscription,
    });
  } catch (error) {
    console.error(
      "Update Subscription Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteSubscription = async (
  req,
  res
) => {
  try {
    const subscription =
      await Subscription.findById(
        req.params.id
      );

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    if (
      subscription.user.toString() !==
      req.user.id
    ) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized",
      });
    }

    await subscription.deleteOne();

    res.status(200).json({
      success: true,
      message:
        "Subscription Deleted Successfully",
    });
  } catch (error) {
    console.error(
      "Delete Subscription Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};