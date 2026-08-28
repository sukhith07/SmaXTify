const Account = require("../models/Account");

const createAccount = async (req, res) => {
  try {
    const {
      name,
      type,
      details,
      balance,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Account name is required.",
      });
    }

    const account = await Account.create({
      user: req.user.id,
      name: name.trim(),
      type: type || "bank",
      details: details?.trim() || "",
      balance: Number(balance || 0),
    });

    res.status(201).json({
      message: "Account created successfully.",
      account,
    });
  } catch (error) {
    console.error("Create account error:", error);

    res.status(500).json({
      message: "Failed to create account.",
    });
  }
};

const getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({
      user: req.user.id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json(accounts);
  } catch (error) {
    console.error("Get accounts error:", error);

    res.status(500).json({
      message: "Failed to fetch accounts.",
    });
  }
};

const getAccount = async (req, res) => {
  try {
    const account = await Account.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!account) {
      return res.status(404).json({
        message: "Account not found.",
      });
    }

    res.status(200).json(account);
  } catch (error) {
    console.error("Get account error:", error);

    res.status(500).json({
      message: "Failed to fetch account.",
    });
  }
};

const updateAccount = async (req, res) => {
  try {
    const {
      name,
      type,
      details,
      balance,
    } = req.body;

    const account = await Account.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!account) {
      return res.status(404).json({
        message: "Account not found.",
      });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          message: "Account name is required.",
        });
      }

      account.name = name.trim();
    }

    if (type !== undefined) {
      account.type = type;
    }

    if (details !== undefined) {
      account.details = details.trim();
    }

    if (balance !== undefined) {
      const newBalance = Number(balance);

      if (Number.isNaN(newBalance) || newBalance < 0) {
        return res.status(400).json({
          message: "Enter a valid balance.",
        });
      }

      account.balance = newBalance;
    }

    await account.save();

    res.status(200).json({
      message: "Account updated successfully.",
      account,
    });
  } catch (error) {
    console.error("Update account error:", error);

    res.status(500).json({
      message: "Failed to update account.",
    });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const account = await Account.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!account) {
      return res.status(404).json({
        message: "Account not found.",
      });
    }

    await account.deleteOne();

    res.status(200).json({
      message: "Account deleted successfully.",
    });
  } catch (error) {
    console.error("Delete account error:", error);

    res.status(500).json({
      message: "Failed to delete account.",
    });
  }
};

module.exports = {
  createAccount,
  getAccounts,
  getAccount,
  updateAccount,
  deleteAccount,
};