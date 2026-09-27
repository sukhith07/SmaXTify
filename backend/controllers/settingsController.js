const User = require("../models/User");
const Expense = require("../models/Expense");
const Account = require("../models/Account");
const bcrypt = require("bcryptjs");

// ============================
// Default Settings
// ============================

const getDefaultSettings = () => ({
  theme: "light",

  appearance: {
    accentColor: "blue",
    animations: true,
    compactMode: false,
  },

  notifications: {
    push: true,
    email: true,
    financialAlerts: true,
  },

  currency: "INR",
  timezone: "Asia/Kolkata",

  ai: {
    enabled: true,
    confirmActions: true,
    saveChatHistory: true,
  },
});

// ============================
// Get Settings
// ============================

const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -resetOTP -resetOTPExpire"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
      settings: user.settings,
    });

  } catch (error) {

    console.error(
      "Get Settings Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load settings",
    });
  }
};

// ============================
// Update Profile
// ============================

const updateProfile = async (req, res) => {
  try {

    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.name = name.trim();

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        provider: user.provider,
        photo: user.photo,
      },
    });

  } catch (error) {

    console.error(
      "Update Profile Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

// ============================
// Update Preferences
// ============================

const updatePreferences = async (req, res) => {
  try {

    const {
      theme,
      appearance,
      notifications,
      currency,
      timezone,
      ai,
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ============================
    // THEME
    // ============================

    if (theme !== undefined) {

      if (
        !["light", "dark", "system"].includes(theme)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid theme",
        });
      }

      user.settings.theme = theme;
    }

    // ============================
    // APPEARANCE
    // ============================

    if (appearance !== undefined) {

      if (
        typeof appearance !== "object" ||
        appearance === null
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid appearance data",
        });
      }

      const allowedAccentColors = [
        "blue",
        "purple",
        "green",
        "orange",
        "rose",
        "cyan",
      ];

      if (
        appearance.accentColor !== undefined
      ) {

        if (
          !allowedAccentColors.includes(
            appearance.accentColor
          )
        ) {
          return res.status(400).json({
            success: false,
            message: "Invalid accent color",
          });
        }

        user.settings.appearance.accentColor =
          appearance.accentColor;
      }

      if (
        appearance.animations !== undefined
      ) {
        user.settings.appearance.animations =
          Boolean(appearance.animations);
      }

      if (
        appearance.compactMode !== undefined
      ) {
        user.settings.appearance.compactMode =
          Boolean(appearance.compactMode);
      }
    }

    // ============================
    // NOTIFICATIONS
    // ============================

    if (notifications !== undefined) {

      if (
        typeof notifications !== "object" ||
        notifications === null
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid notifications data",
        });
      }

      const notificationKeys = [
        "push",
        "email",
        "financialAlerts",
      ];

      notificationKeys.forEach((key) => {

        if (
          notifications[key] !== undefined
        ) {
          user.settings.notifications[key] =
            Boolean(notifications[key]);
        }

      });
    }

    // ============================
    // CURRENCY
    // ============================

    if (currency !== undefined) {

      if (
        typeof currency !== "string" ||
        !currency.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid currency",
        });
      }

      user.settings.currency =
        currency.trim().toUpperCase();
    }

    // ============================
    // TIMEZONE
    // ============================

    if (timezone !== undefined) {

      if (
        typeof timezone !== "string" ||
        !timezone.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid timezone",
        });
      }

      user.settings.timezone =
        timezone.trim();
    }

    // ============================
    // AI SETTINGS
    // ============================

    if (ai !== undefined) {

      if (
        typeof ai !== "object" ||
        ai === null
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid AI settings",
        });
      }

      if (ai.enabled !== undefined) {
        user.settings.ai.enabled =
          Boolean(ai.enabled);
      }

      if (
        ai.confirmActions !== undefined
      ) {
        user.settings.ai.confirmActions =
          Boolean(ai.confirmActions);
      }

      if (
        ai.saveChatHistory !== undefined
      ) {
        user.settings.ai.saveChatHistory =
          Boolean(ai.saveChatHistory);
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      settings: user.settings,
    });

  } catch (error) {

    console.error(
      "Update Preferences Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update settings",
    });
  }
};

// ============================
// Change Password
// ============================

const changePassword = async (req, res) => {
  try {

    const {
      currentPassword,
      newPassword,
    } = req.body;

    if (
      !currentPassword ||
      !newPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (
      user.provider === "google" &&
      !user.password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Google accounts do not have a current password. Use password reset to create one.",
      });
    }

    const isMatch =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message:
          "Current password is incorrect",
      });
    }

    const isSamePassword =
      await bcrypt.compare(
        newPassword,
        user.password
      );

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be different from current password",
      });
    }

    user.password =
      await bcrypt.hash(
        newPassword,
        10
      );

    user.provider = "local";

    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Password changed successfully",
    });

  } catch (error) {

    console.error(
      "Change Password Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to change password",
    });
  }
};

// ============================
// Reset Settings
// ============================

const resetSettings = async (req, res) => {
  try {

    const user =
      await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.settings =
      getDefaultSettings();

    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Settings reset successfully",
      settings: user.settings,
    });

  } catch (error) {

    console.error(
      "Reset Settings Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to reset settings",
    });
  }
};

// ============================
// Delete All Transactions
// ============================

const deleteAllTransactions = async (
  req,
  res
) => {
  try {

    const result =
      await Expense.deleteMany({
        user: req.user.id,
      });

    if (Account) {

      await Account.updateMany(
        {
          user: req.user.id,
        },
        {
          $set: {
            balance: 0,
          },
        }
      );

    }

    res.status(200).json({
      success: true,
      message:
        "All transactions deleted successfully",
      deletedCount:
        result.deletedCount,
    });

  } catch (error) {

    console.error(
      "Delete All Transactions Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to delete all transactions",
    });
  }
};

// ============================
// Delete Account
// ============================

const deleteAccount = async (
  req,
  res
) => {
  try {

    const user =
      await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await Expense.deleteMany({
      user: req.user.id,
    });

    if (Account) {

      await Account.deleteMany({
        user: req.user.id,
      });

    }

    await User.findByIdAndDelete(
      req.user.id
    );

    res.status(200).json({
      success: true,
      message:
        "Account deleted successfully",
    });

  } catch (error) {

    console.error(
      "Delete Account Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to delete account",
    });
  }
};

// ============================
// EXPORTS
// ============================

module.exports = {
  getSettings,
  updateProfile,
  updatePreferences,
  changePassword,
  resetSettings,
  deleteAllTransactions,
  deleteAccount,
};