const Expense = require("../models/Expense");
const Budget = require("../models/Budget");
const Account = require("../models/Account");

const cleanCategory = (category) => {
  if (
    typeof category !== "string" ||
    !category.trim()
  ) {
    return "Other";
  }

  return category
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^["']|["']$/g, "");
};

const recalculateBudget = async (
  userId,
  date
) => {
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

    endDate.setMonth(
      endDate.getMonth() + 1
    );

    const expenses = await Expense.find({
      user: userId,
      type: "Expense",
      date: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    const categories =
      budget.categories.map((item) => {
        const spent = expenses
          .filter(
            (expense) =>
              expense.category ===
              item.category
          )
          .reduce(
            (sum, expense) =>
              sum + Number(expense.amount),
            0
          );

        return {
          category: item.category,
          limit: Number(item.limit),
          spent,
        };
      });

    const totalBudget =
      categories.reduce(
        (sum, item) =>
          sum + Number(item.limit),
        0
      );

    const totalSpent =
      categories.reduce(
        (sum, item) =>
          sum + Number(item.spent),
        0
      );

    budget.categories = categories;
    budget.totalBudget = totalBudget;
    budget.totalSpent = totalSpent;
    budget.remainingBudget =
      totalBudget - totalSpent;

    await budget.save();
  } catch (error) {
    console.error(
      "Budget Update Error:",
      error.message
    );
  }
};

const updateAccountBalance = async (
  accountId,
  userId,
  amount,
  type
) => {
  const account =
    await Account.findOne({
      _id: accountId,
      user: userId,
    });

  if (!account) {
    throw new Error(
      "Selected account not found."
    );
  }

  const transactionAmount =
    Number(amount);

  if (type === "Income") {
    account.balance +=
      transactionAmount;
  } else {
    if (
      Number(account.balance) <
      transactionAmount
    ) {
      throw new Error(
        `Insufficient balance in ${account.name}.`
      );
    }

    account.balance -=
      transactionAmount;
  }

  await account.save();

  return account;
};

const reverseAccountBalance = async (
  accountId,
  userId,
  amount,
  type
) => {
  if (!accountId) return;

  const account =
    await Account.findOne({
      _id: accountId,
      user: userId,
    });

  if (!account) return;

  const transactionAmount =
    Number(amount);

  if (type === "Income") {
    account.balance -=
      transactionAmount;
  } else {
    account.balance +=
      transactionAmount;
  }

  await account.save();
};

exports.addExpense = async (
  req,
  res
) => {
  try {
    const {
      title,
      amount,
      category,
      type,
      date,
      notes,
      account,
    } = req.body;

    if (
      !title ||
      !amount ||
      !type ||
      !account
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please fill all required fields and select an account.",
      });
    }

    if (
      type !== "Income" &&
      type !== "Expense"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Transaction type must be Income or Expense.",
      });
    }

    const transactionAmount =
      Number(amount);

    if (
      Number.isNaN(transactionAmount) ||
      transactionAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid amount.",
      });
    }

    const finalCategory =
      cleanCategory(category);

    const selectedAccount =
      await Account.findOne({
        _id: account,
        user: req.user.id,
      });

    if (!selectedAccount) {
      return res.status(404).json({
        success: false,
        message:
          "Selected account not found.",
      });
    }

    if (
      type === "Expense" &&
      Number(selectedAccount.balance) <
        transactionAmount
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Insufficient balance in ${selectedAccount.name}.`,
      });
    }

    const expense =
      await Expense.create({
        title: title.trim(),
        amount: transactionAmount,
        category: finalCategory,
        type,
        date: date || Date.now(),
        notes: notes || "",
        account,
        user: req.user.id,
      });

    try {
      await updateAccountBalance(
        account,
        req.user.id,
        transactionAmount,
        type
      );
    } catch (accountError) {
      await expense.deleteOne();

      return res.status(400).json({
        success: false,
        message:
          accountError.message,
      });
    }

    await recalculateBudget(
      req.user.id,
      expense.date
    );

    const populatedExpense =
      await Expense.findById(
        expense._id
      ).populate(
        "account",
        "name type balance"
      );

    return res.status(201).json({
      success: true,
      message:
        "Transaction Added Successfully",
      expense: populatedExpense,
    });
  } catch (error) {
    console.error(
      "Add Expense Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getExpenses = async (
  req,
  res
) => {
  try {
    const expenses =
      await Expense.find({
        user: req.user.id,
      })
        .populate(
          "account",
          "name type balance"
        )
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
    console.error(
      "Get Expenses Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getExpenseById = async (
  req,
  res
) => {
  try {
    const expense =
      await Expense.findById(
        req.params.id
      ).populate(
        "account",
        "name type balance"
      );

    if (!expense) {
      return res.status(404).json({
        success: false,
        message:
          "Transaction not found",
      });
    }

    if (
      expense.user.toString() !==
      req.user.id
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Not Authorized",
      });
    }

    return res.status(200).json({
      success: true,
      expense,
    });
  } catch (error) {
    console.error(
      "Get Expense Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateExpense = async (
  req,
  res
) => {
  try {
    const expense =
      await Expense.findById(
        req.params.id
      );

    if (!expense) {
      return res.status(404).json({
        success: false,
        message:
          "Transaction not found",
      });
    }

    if (
      expense.user.toString() !==
      req.user.id
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Not Authorized",
      });
    }

    const oldAmount =
      Number(expense.amount);

    const oldType =
      expense.type;

    const oldAccountId =
      expense.account
        ? expense.account.toString()
        : null;

    const oldDate =
      expense.date;

    const newTitle =
      req.body.title !== undefined
        ? String(req.body.title).trim()
        : expense.title;

    const newAmount =
      req.body.amount !== undefined
        ? Number(req.body.amount)
        : Number(expense.amount);

    const newType =
      req.body.type !== undefined
        ? req.body.type
        : expense.type;

    const newCategory =
      req.body.category !== undefined
        ? cleanCategory(
            req.body.category
          )
        : cleanCategory(
            expense.category
          );

    const newDate =
      req.body.date !== undefined
        ? req.body.date
        : expense.date;

    const newAccountId =
      req.body.account !== undefined
        ? req.body.account
        : oldAccountId;

    if (
      !newTitle ||
      !newAmount ||
      !newType ||
      !newAccountId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please fill all required fields and select an account.",
      });
    }

    if (
      newType !== "Income" &&
      newType !== "Expense"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Transaction type must be Income or Expense.",
      });
    }

    if (newAmount <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid amount.",
      });
    }

    const newAccount =
      await Account.findOne({
        _id: newAccountId,
        user: req.user.id,
      });

    if (!newAccount) {
      return res.status(404).json({
        success: false,
        message:
          "Selected account not found.",
      });
    }

    await reverseAccountBalance(
      oldAccountId,
      req.user.id,
      oldAmount,
      oldType
    );

    try {
      await updateAccountBalance(
        newAccountId,
        req.user.id,
        newAmount,
        newType
      );
    } catch (accountError) {
      await updateAccountBalance(
        oldAccountId,
        req.user.id,
        oldAmount,
        oldType === "Income"
          ? "Expense"
          : "Income"
      );

      return res.status(400).json({
        success: false,
        message:
          accountError.message,
      });
    }

    expense.title = newTitle;
    expense.amount = newAmount;
    expense.category =
      newCategory;
    expense.type = newType;
    expense.date = newDate;
    expense.notes =
      req.body.notes !== undefined
        ? req.body.notes
        : expense.notes;
    expense.account =
      newAccountId;

    await expense.save();

    await recalculateBudget(
      req.user.id,
      oldDate
    );

    await recalculateBudget(
      req.user.id,
      newDate
    );

    const updatedExpense =
      await Expense.findById(
        expense._id
      ).populate(
        "account",
        "name type balance"
      );

    return res.status(200).json({
      success: true,
      message:
        "Transaction Updated Successfully",
      expense: updatedExpense,
    });
  } catch (error) {
    console.error(
      "Update Expense Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteExpense = async (
  req,
  res
) => {
  try {
    const expense =
      await Expense.findById(
        req.params.id
      );

    if (!expense) {
      return res.status(404).json({
        success: false,
        message:
          "Transaction not found",
      });
    }

    if (
      expense.user.toString() !==
      req.user.id
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Not Authorized",
      });
    }

    const expenseDate =
      expense.date;

    await reverseAccountBalance(
      expense.account,
      req.user.id,
      expense.amount,
      expense.type
    );

    await expense.deleteOne();

    await recalculateBudget(
      req.user.id,
      expenseDate
    );

    return res.status(200).json({
      success: true,
      message:
        "Transaction Deleted Successfully",
    });
  } catch (error) {
    console.error(
      "Delete Expense Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getSummary = async (
  req,
  res
) => {
  try {
    const expenses =
      await Expense.find({
        user: req.user.id,
      });

    let income = 0;
    let expense = 0;

    expenses.forEach((item) => {
      if (item.type === "Income") {
        income += Number(
          item.amount
        );
      } else {
        expense += Number(
          item.amount
        );
      }
    });

    const balance =
      income - expense;

    const savings =
      income > 0
        ? Number(
            (
              (balance / income) *
              100
            ).toFixed(1)
          )
        : 0;

    const currentMonth =
      new Date()
        .toISOString()
        .slice(0, 7);

    const budget =
      await Budget.findOne({
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

    const accounts =
      await Account.find({
        user: req.user.id,
      });

    const totalAccountBalance =
      accounts.reduce(
        (sum, account) =>
          sum +
          Number(
            account.balance || 0
          ),
        0
      );

    return res.status(200).json({
      success: true,
      summary: {
        balance,
        income,
        expense,
        savings,
        totalTransactions:
          expenses.length,
        totalAccountBalance,
        accountCount:
          accounts.length,
        ...budgetSummary,
      },
    });
  } catch (error) {
    console.error(
      "Summary Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};