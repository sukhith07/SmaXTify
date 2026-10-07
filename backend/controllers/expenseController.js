const Expense = require("../models/Expense");
const Budget = require("../models/Budget");
const Account = require("../models/Account");
const ReceiptScan = require("../models/ReceiptScan");

const {
  cleanCategory,
  getAccount,
  recalculateBudget,
  getTransferMode,
  applyTransaction,
  reverseTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require("../services/transactionService");

exports.addExpense = async (req, res) => {
  try {
    const {
      title,
      amount,
      category,
      type,
      date,
      notes,
      account,
      toAccount,
      transferAccount,
      transferMode,
    } = req.body;

    if (!amount || !type || !account) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields and select an account.",
      });
    }

    if (!["Income", "Expense", "Transfer"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction type.",
      });
    }

    const transactionAmount = Number(amount);

    if (!Number.isFinite(transactionAmount) || transactionAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid amount.",
      });
    }

    if (type !== "Transfer" && (!title || !String(title).trim())) {
      return res.status(400).json({
        success: false,
        message: "Please enter a transaction title.",
      });
    }

    if (type !== "Transfer" && (!category || !String(category).trim())) {
      return res.status(400).json({
        success: false,
        message: "Please enter a category.",
      });
    }

    const selectedAccount = await getAccount(account, req.user.id);

    if (!selectedAccount) {
      return res.status(404).json({
        success: false,
        message: "Selected account not found.",
      });
    }

    let finalTransferMode = null;
    let finalTransferAccount = null;
    let finalToAccount = "";

    if (type === "Transfer") {
      finalTransferMode =
        transferMode === "account" ? "account" : "person";

      if (finalTransferMode === "account") {
        const destinationId = transferAccount || toAccount;

        if (!destinationId) {
          return res.status(400).json({
            success: false,
            message: "Please select the destination account.",
          });
        }

        finalTransferAccount = await getAccount(
          destinationId,
          req.user.id
        );

        if (!finalTransferAccount) {
          return res.status(404).json({
            success: false,
            message: "Destination account not found.",
          });
        }

        if (
          finalTransferAccount._id.toString() ===
          selectedAccount._id.toString()
        ) {
          return res.status(400).json({
            success: false,
            message: "From Account and To Account cannot be the same.",
          });
        }

        finalToAccount = finalTransferAccount.name;
      } else {
        finalToAccount =
          typeof toAccount === "string" ? toAccount.trim() : "";

        if (!finalToAccount) {
          return res.status(400).json({
            success: false,
            message: "Please enter the person's name.",
          });
        }

        if (finalToAccount.length > 100) {
          return res.status(400).json({
            success: false,
            message: "Person name is too long.",
          });
        }
      }
    }

    const expense = await createTransaction({
      userId: req.user.id,
      title,
      amount: transactionAmount,
      category,
      type,
      date,
      notes,
      account,
      toAccount: finalToAccount,
      transferAccount: finalTransferAccount
        ? finalTransferAccount._id
        : null,
      transferMode: finalTransferMode,
    });

    return res.status(201).json({
      success: true,
      message:
        type === "Transfer"
          ? "Transfer Added Successfully"
          : "Transaction Added Successfully",
      expense,
    });
  } catch (error) {
    console.error("Add Expense Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({
      user: req.user.id,
    })
      .populate("account", "name type balance")
      .populate("transferAccount", "name type balance")
      .sort({
        date: -1,
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: expenses.length,
      expenses,
    });
  } catch (error) {
    console.error("Get Expenses Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate("account", "name type balance")
      .populate("transferAccount", "name type balance");

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized",
      });
    }

    return res.status(200).json({
      success: true,
      expense,
    });
  } catch (error) {
    console.error("Get Expense Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized",
      });
    }

    const updatedExpense = await updateTransaction(
      expense,
      req.body,
      req.user.id
    );

    await ReceiptScan.updateMany(
      {
        user: req.user.id,
        transaction: updatedExpense._id,
      },
      {
        $set: {
          total: Number(updatedExpense.amount),
        },
      }
    );

    return res.status(200).json({
      success: true,
      message:
        updatedExpense.type === "Transfer"
          ? "Transfer Updated Successfully"
          : "Transaction Updated Successfully",
      expense: updatedExpense,
    });
  } catch (error) {
    console.error("Update Expense Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized",
      });
    }

    await deleteTransaction(expense, req.user.id);

    await ReceiptScan.deleteMany({
      user: req.user.id,
      transaction: expense._id,
    });

    return res.status(200).json({
      success: true,
      message:
        "Transaction and linked AI Scan receipt deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Expense Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const expenses = await Expense.find({
      user: req.user.id,
    });

    let income = 0;
    let expense = 0;
    let transfers = 0;

    expenses.forEach((item) => {
      if (item.type === "Income") {
        income += Number(item.amount || 0);
      }

      if (item.type === "Expense") {
        expense += Number(item.amount || 0);
      }

      if (item.type === "Transfer") {
        transfers += Number(item.amount || 0);
      }
    });

    const balance = income - expense;

    const savings =
      income > 0
        ? Number(((balance / income) * 100).toFixed(1))
        : 0;

    const currentMonth = new Date().toISOString().slice(0, 7);

    const budget = await Budget.findOne({
      user: req.user.id,
      month: currentMonth,
    });

    const budgetSummary = budget
      ? {
          totalBudget: budget.totalBudget || 0,
          totalSpent: budget.totalSpent || 0,
          remainingBudget: budget.remainingBudget || 0,
        }
      : {
          totalBudget: 0,
          totalSpent: 0,
          remainingBudget: 0,
        };

    const accounts = await Account.find({
      user: req.user.id,
    });

    const totalAccountBalance = accounts.reduce(
      (sum, account) => sum + Number(account.balance || 0),
      0
    );

    return res.status(200).json({
      success: true,
      summary: {
        balance,
        income,
        expense,
        transfers,
        savings,
        totalTransactions: expenses.length,
        totalAccountBalance,
        accountCount: accounts.length,
        ...budgetSummary,
      },
    });
  } catch (error) {
    console.error("Summary Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};