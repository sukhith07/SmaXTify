const Expense = require("../models/Expense");
const Budget = require("../models/Budget");

// =======================================
// Recalculate Monthly Budget
// =======================================

const recalculateBudget = async (userId, date) => {

  try {

    const month = new Date(date)
      .toISOString()
      .slice(0, 7);

    const budget = await Budget.findOne({

      user: userId,

      month,

    });

    if (!budget) return;

    const startDate = new Date(`${month}-01`);

    const endDate = new Date(startDate);

    endDate.setMonth(endDate.getMonth() + 1);

    const expenses = await Expense.find({

      user: userId,

      type: "Expense",

      date: {

        $gte: startDate,

        $lt: endDate,

      },

    });

    const categories = budget.categories.map((item) => {

      const spent = expenses
        .filter(
          (expense) =>
            expense.category === item.category
        )
        .reduce(
          (sum, expense) =>
            sum + expense.amount,
          0
        );

      return {

        category: item.category,

        limit: Number(item.limit),

        spent,

      };

    });

    const totalBudget = categories.reduce(

      (sum, item) => sum + item.limit,

      0

    );

    const totalSpent = categories.reduce(

      (sum, item) => sum + item.spent,

      0

    );

    budget.categories = categories;

    budget.totalBudget = totalBudget;

    budget.totalSpent = totalSpent;

    budget.remainingBudget =
      totalBudget - totalSpent;

    await budget.save();

  } catch (error) {

    console.log(
      "Budget Update Error:",
      error.message
    );

  }

};

// =======================================
// Add Transaction
// =======================================

exports.addExpense = async (req, res) => {

  try {

    const {

      title,

      amount,

      category,

      type,

      date,

      notes,

    } = req.body;

    if (
      !title ||
      !amount ||
      !category ||
      !type
    ) {

      return res.status(400).json({

        message:
          "Please fill all required fields",

      });

    }

    const expense = await Expense.create({

      title,

      amount,

      category,

      type,

      date: date || Date.now(),

      notes,

      user: req.user.id,

    });

    // ============================
    // Automatically Update Budget
    // ============================

    await recalculateBudget(

      req.user.id,

      expense.date

    );

    res.status(201).json({

      success: true,

      message:
        "Transaction Added Successfully",

      expense,

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};
// ===============================
// Get All Transactions
// ===============================
exports.getExpenses = async (req, res) => {

  try {

    const expenses = await Expense.find({

      user: req.user.id,

    }).sort({

      date: -1,

    });

    res.status(200).json({

      success: true,

      count: expenses.length,

      expenses,

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};

// ===============================
// Get Single Transaction
// ===============================
exports.getExpenseById = async (req, res) => {

  try {

    const expense = await Expense.findById(
      req.params.id
    );

    if (!expense) {

      return res.status(404).json({

        message: "Transaction not found",

      });

    }

    if (
      expense.user.toString() !==
      req.user.id
    ) {

      return res.status(401).json({

        message: "Not Authorized",

      });

    }

    res.status(200).json({

      success: true,

      expense,

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};

// ===============================
// Update Transaction
// ===============================
exports.updateExpense = async (req, res) => {

  try {

    const expense = await Expense.findById(
      req.params.id
    );

    if (!expense) {

      return res.status(404).json({

        message: "Transaction not found",

      });

    }

    if (
      expense.user.toString() !==
      req.user.id
    ) {

      return res.status(401).json({

        message: "Not Authorized",

      });

    }

    expense.title =
      req.body.title ?? expense.title;

    expense.amount =
      req.body.amount ?? expense.amount;

    expense.category =
      req.body.category ?? expense.category;

    expense.type =
      req.body.type ?? expense.type;

    expense.date =
      req.body.date ?? expense.date;

    expense.notes =
      req.body.notes ?? expense.notes;

    await expense.save();

    // ============================
    // Update Budget Automatically
    // ============================

    await recalculateBudget(

      req.user.id,

      expense.date

    );

    res.status(200).json({

      success: true,

      message:
        "Transaction Updated Successfully",

      expense,

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};

// ===============================
// Delete Transaction
// ===============================
exports.deleteExpense = async (req, res) => {

  try {

    const expense = await Expense.findById(
      req.params.id
    );

    if (!expense) {

      return res.status(404).json({

        message: "Transaction not found",

      });

    }

    if (
      expense.user.toString() !==
      req.user.id
    ) {

      return res.status(401).json({

        message: "Not Authorized",

      });

    }

    // Store the date before deleting
    const expenseDate = expense.date;

    await expense.deleteOne();

    // ============================
    // Update Budget Automatically
    // ============================

    await recalculateBudget(

      req.user.id,

      expenseDate

    );

    res.status(200).json({

      success: true,

      message:
        "Transaction Deleted Successfully",

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};
// ===============================
// Dashboard Summary
// ===============================
exports.getSummary = async (req, res) => {

  try {

    const expenses = await Expense.find({

      user: req.user.id,

    });

    let income = 0;
    let expense = 0;

    expenses.forEach((item) => {

      if (item.type === "Income") {

        income += Number(item.amount);

      } else {

        expense += Number(item.amount);

      }

    });

    const balance = income - expense;

    const savings =
      income > 0
        ? Number(
            ((balance / income) * 100).toFixed(1)
          )
        : 0;

    // =====================================
    // Current Month Budget Summary
    // =====================================

    const currentMonth = new Date()
      .toISOString()
      .slice(0, 7);

    const budget = await Budget.findOne({

      user: req.user.id,

      month: currentMonth,

    });

    const budgetSummary = budget
      ? {

          totalBudget:
            budget.totalBudget || 0,

          totalSpent:
            budget.totalSpent || 0,

          remainingBudget:
            budget.remainingBudget || 0,

        }
      : {

          totalBudget: 0,

          totalSpent: 0,

          remainingBudget: 0,

        };

    res.status(200).json({

      success: true,

      summary: {

        balance,

        income,

        expense,

        savings,

        totalTransactions:
          expenses.length,

        ...budgetSummary,

      },

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};