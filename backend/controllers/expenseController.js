const mongoose = require("mongoose");

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

const getAccount = async (
  accountId,
  userId
) => {
  if (
    !accountId ||
    !mongoose.Types.ObjectId.isValid(
      accountId
    )
  ) {
    return null;
  }

  return Account.findOne({
    _id: accountId,
    user: userId,
  });
};

const recalculateBudget = async (
  userId,
  date
) => {
  try {
    const transactionDate =
      new Date(date);

    if (
      Number.isNaN(
        transactionDate.getTime()
      )
    ) {
      return;
    }

    const month =
      transactionDate
        .toISOString()
        .slice(0, 7);

    const budget =
      await Budget.findOne({
        user: userId,
        month,
      });

    if (!budget) {
      return;
    }

    const startDate =
      new Date(`${month}-01`);

    const endDate =
      new Date(startDate);

    endDate.setMonth(
      endDate.getMonth() + 1
    );

    const expenses =
      await Expense.find({
        user: userId,
        type: "Expense",
        date: {
          $gte: startDate,
          $lt: endDate,
        },
      });

    const categories =
      budget.categories.map(
        (item) => {
          const spent =
            expenses
              .filter(
                (expense) =>
                  expense.category ===
                  item.category
              )
              .reduce(
                (sum, expense) =>
                  sum +
                  Number(
                    expense.amount || 0
                  ),
                0
              );

          return {
            category:
              item.category,
            limit: Number(
              item.limit || 0
            ),
            spent,
          };
        }
      );

    const totalBudget =
      categories.reduce(
        (sum, item) =>
          sum +
          Number(
            item.limit || 0
          ),
        0
      );

    const totalSpent =
      categories.reduce(
        (sum, item) =>
          sum +
          Number(
            item.spent || 0
          ),
        0
      );

    budget.categories =
      categories;

    budget.totalBudget =
      totalBudget;

    budget.totalSpent =
      totalSpent;

    budget.remainingBudget =
      totalBudget -
      totalSpent;

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
    await getAccount(
      accountId,
      userId
    );

  if (!account) {
    throw new Error(
      "Selected account not found."
    );
  }

  const transactionAmount =
    Number(amount);

  if (
    !Number.isFinite(
      transactionAmount
    ) ||
    transactionAmount <= 0
  ) {
    throw new Error(
      "Invalid transaction amount."
    );
  }

  const oldBalance =
    Number(
      account.balance || 0
    );

  if (type === "Income") {
    account.balance =
      oldBalance +
      transactionAmount;
  }

  if (type === "Expense") {
    if (
      oldBalance <
      transactionAmount
    ) {
      throw new Error(
        `Insufficient balance in ${account.name}.`
      );
    }

    account.balance =
      oldBalance -
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
  const account =
    await getAccount(
      accountId,
      userId
    );

  if (!account) {
    throw new Error(
      "Original account no longer exists."
    );
  }

  const transactionAmount =
    Number(amount);

  const currentBalance =
    Number(
      account.balance || 0
    );

  if (type === "Income") {
    if (
      currentBalance <
      transactionAmount
    ) {
      throw new Error(
        `Unable to reverse income because ${account.name} does not have enough balance.`
      );
    }

    account.balance =
      currentBalance -
      transactionAmount;
  }

  if (type === "Expense") {
    account.balance =
      currentBalance +
      transactionAmount;
  }

  await account.save();

  return account;
};

const applyInternalTransfer =
  async (
    fromAccountId,
    toAccountId,
    userId,
    amount
  ) => {
    const fromAccount =
      await getAccount(
        fromAccountId,
        userId
      );

    const toAccount =
      await getAccount(
        toAccountId,
        userId
      );

    if (!fromAccount) {
      throw new Error(
        "From account not found."
      );
    }

    if (!toAccount) {
      throw new Error(
        "Destination account not found."
      );
    }

    if (
      fromAccount._id.toString() ===
      toAccount._id.toString()
    ) {
      throw new Error(
        "From Account and To Account cannot be the same."
      );
    }

    const transactionAmount =
      Number(amount);

    if (
      !Number.isFinite(
        transactionAmount
      ) ||
      transactionAmount <= 0
    ) {
      throw new Error(
        "Invalid transfer amount."
      );
    }

    const fromBalance =
      Number(
        fromAccount.balance || 0
      );

    const toBalance =
      Number(
        toAccount.balance || 0
      );

    if (
      fromBalance <
      transactionAmount
    ) {
      throw new Error(
        `Insufficient balance in ${fromAccount.name}.`
      );
    }

    const oldFromBalance =
      fromBalance;

    const oldToBalance =
      toBalance;

    try {
      fromAccount.balance =
        oldFromBalance -
        transactionAmount;

      await fromAccount.save();

      toAccount.balance =
        oldToBalance +
        transactionAmount;

      await toAccount.save();

      return {
        fromAccount,
        toAccount,
      };
    } catch (error) {
      try {
        fromAccount.balance =
          oldFromBalance;

        await fromAccount.save();
      } catch {}

      try {
        toAccount.balance =
          oldToBalance;

        await toAccount.save();
      } catch {}

      throw error;
    }
  };

const reverseInternalTransfer =
  async (
    expense,
    userId
  ) => {
    const fromAccount =
      await getAccount(
        expense.account,
        userId
      );

    const toAccount =
      await getAccount(
        expense.transferAccount,
        userId
      );

    if (!fromAccount) {
      throw new Error(
        "Original source account no longer exists."
      );
    }

    if (!toAccount) {
      throw new Error(
        "Original destination account no longer exists."
      );
    }

    const amount =
      Number(expense.amount);

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      throw new Error(
        "Invalid transfer amount."
      );
    }

    const fromBalance =
      Number(
        fromAccount.balance || 0
      );

    const toBalance =
      Number(
        toAccount.balance || 0
      );

    if (
      toBalance < amount
    ) {
      throw new Error(
        `Unable to reverse transfer because ${toAccount.name} does not have enough balance.`
      );
    }

    const oldFromBalance =
      fromBalance;

    const oldToBalance =
      toBalance;

    try {
      fromAccount.balance =
        oldFromBalance + amount;

      await fromAccount.save();

      toAccount.balance =
        oldToBalance - amount;

      await toAccount.save();
    } catch (error) {
      try {
        fromAccount.balance =
          oldFromBalance;

        await fromAccount.save();
      } catch {}

      try {
        toAccount.balance =
          oldToBalance;

        await toAccount.save();
      } catch {}

      throw error;
    }
  };

const getTransferMode = (
  expense
) => {
  if (
    expense.transferMode ===
    "account"
  ) {
    return "account";
  }

  if (
    expense.transferMode ===
    "person"
  ) {
    return "person";
  }

  if (expense.transferAccount) {
    return "account";
  }

  return "person";
};

const applyTransfer = async (
  fromAccountId,
  transferMode,
  destinationAccountId,
  userId,
  amount
) => {
  if (
    transferMode === "account"
  ) {
    return applyInternalTransfer(
      fromAccountId,
      destinationAccountId,
      userId,
      amount
    );
  }

  return updateAccountBalance(
    fromAccountId,
    userId,
    amount,
    "Expense"
  );
};

const reverseTransfer = async (
  expense,
  userId
) => {
  const transferMode =
    getTransferMode(expense);

  if (
    transferMode === "account"
  ) {
    return reverseInternalTransfer(
      expense,
      userId
    );
  }

  return reverseAccountBalance(
    expense.account,
    userId,
    expense.amount,
    "Expense"
  );
};

const applyTransaction = async (
  type,
  account,
  transferMode,
  transferAccount,
  amount,
  userId
) => {
  if (
    type === "Transfer"
  ) {
    return applyTransfer(
      account,
      transferMode,
      transferAccount,
      userId,
      amount
    );
  }

  return updateAccountBalance(
    account,
    userId,
    amount,
    type
  );
};

const reverseTransaction = async (
  expense,
  userId
) => {
  if (
    expense.type ===
    "Transfer"
  ) {
    return reverseTransfer(
      expense,
      userId
    );
  }

  return reverseAccountBalance(
    expense.account,
    userId,
    expense.amount,
    expense.type
  );
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
      toAccount,
      transferAccount,
      transferMode,
    } = req.body;

    if (
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
      ![
        "Income",
        "Expense",
        "Transfer",
      ].includes(type)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid transaction type.",
      });
    }

    const transactionAmount =
      Number(amount);

    if (
      !Number.isFinite(
        transactionAmount
      ) ||
      transactionAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid amount.",
      });
    }

    if (
      type !== "Transfer" &&
      (!title ||
        !String(title).trim())
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a transaction title.",
      });
    }

    if (
      type !== "Transfer" &&
      (!category ||
        !String(category).trim())
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a category.",
      });
    }

    const selectedAccount =
      await getAccount(
        account,
        req.user.id
      );

    if (!selectedAccount) {
      return res.status(404).json({
        success: false,
        message:
          "Selected account not found.",
      });
    }

    let finalTransferMode = null;
    let finalTransferAccount =
      null;
    let finalToAccount = "";

    if (
      type === "Transfer"
    ) {
      finalTransferMode =
        transferMode === "account"
          ? "account"
          : "person";

      if (
        finalTransferMode ===
        "account"
      ) {
        const destinationId =
          transferAccount ||
          toAccount;

        if (!destinationId) {
          return res.status(400).json({
            success: false,
            message:
              "Please select the destination account.",
          });
        }

        finalTransferAccount =
          await getAccount(
            destinationId,
            req.user.id
          );

        if (!finalTransferAccount) {
          return res.status(404).json({
            success: false,
            message:
              "Destination account not found.",
          });
        }

        if (
          finalTransferAccount._id.toString() ===
          selectedAccount._id.toString()
        ) {
          return res.status(400).json({
            success: false,
            message:
              "From Account and To Account cannot be the same.",
          });
        }

        finalToAccount =
          finalTransferAccount.name;
      } else {
        finalToAccount =
          typeof toAccount ===
          "string"
            ? toAccount.trim()
            : "";

        if (!finalToAccount) {
          return res.status(400).json({
            success: false,
            message:
              "Please enter the person's name.",
          });
        }

        if (
          finalToAccount.length >
          100
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Person name is too long.",
          });
        }
      }

      if (
        Number(
          selectedAccount.balance ||
            0
        ) <
        transactionAmount
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Insufficient balance in ${selectedAccount.name}.`,
        });
      }
    }

    if (
      type === "Expense" &&
      Number(
        selectedAccount.balance ||
          0
      ) <
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
        user: req.user.id,

        title:
          type === "Transfer"
            ? ""
            : String(title).trim(),

        amount:
          transactionAmount,

        category:
          type === "Transfer"
            ? "Transfer"
            : cleanCategory(category),

        type,

        date:
          date || Date.now(),

        notes:
          notes
            ? String(notes).trim()
            : "",

        account,

        toAccount:
          type === "Transfer"
            ? finalToAccount
            : "",

        transferAccount:
          type === "Transfer" &&
          finalTransferMode ===
            "account"
            ? finalTransferAccount._id
            : null,

        transferMode:
          type === "Transfer"
            ? finalTransferMode
            : null,
      });

    try {
      await applyTransaction(
        type,
        account,
        finalTransferMode,
        finalTransferAccount
          ? finalTransferAccount._id
          : null,
        transactionAmount,
        req.user.id
      );
    } catch (accountError) {
      await expense.deleteOne();

      return res.status(400).json({
        success: false,
        message:
          accountError.message,
      });
    }

    if (
      type === "Expense"
    ) {
      await recalculateBudget(
        req.user.id,
        expense.date
      );
    }

    const populatedExpense =
      await Expense.findById(
        expense._id
      )
        .populate(
          "account",
          "name type balance"
        )
        .populate(
          "transferAccount",
          "name type balance"
        );

    return res.status(201).json({
      success: true,
      message:
        type === "Transfer"
          ? "Transfer Added Successfully"
          : "Transaction Added Successfully",
      expense:
        populatedExpense,
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
        .populate(
          "transferAccount",
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
      )
        .populate(
          "account",
          "name type balance"
        )
        .populate(
          "transferAccount",
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

    const oldTransferAccountId =
      expense.transferAccount
        ? expense.transferAccount.toString()
        : null;

    const oldTransferMode =
      getTransferMode(expense);

    const oldToAccount =
      expense.toAccount || "";

    const oldDate =
      expense.date;

    const newType =
      req.body.type !== undefined
        ? req.body.type
        : oldType;

    if (
      ![
        "Income",
        "Expense",
        "Transfer",
      ].includes(newType)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid transaction type.",
      });
    }

    const newAmount =
      req.body.amount !== undefined
        ? Number(req.body.amount)
        : oldAmount;

    if (
      !Number.isFinite(
        newAmount
      ) ||
      newAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid amount.",
      });
    }

    const newAccountId =
      req.body.account !==
      undefined
        ? req.body.account
        : oldAccountId;

    if (!newAccountId) {
      return res.status(400).json({
        success: false,
        message:
          "Please select an account.",
      });
    }

    const newAccount =
      await getAccount(
        newAccountId,
        req.user.id
      );

    if (!newAccount) {
      return res.status(404).json({
        success: false,
        message:
          "Selected account not found.",
      });
    }

    let newTransferMode = null;
    let newTransferAccount =
      null;
    let newToAccount = "";

    if (
      newType === "Transfer"
    ) {
      newTransferMode =
        req.body.transferMode ===
        "account"
          ? "account"
          : req.body.transferMode ===
            "person"
          ? "person"
          : oldTransferMode;

      if (
        newTransferMode !==
          "account" &&
        newTransferMode !==
          "person"
      ) {
        newTransferMode =
          "person";
      }

      if (
        newTransferMode ===
        "account"
      ) {
        const destinationId =
          req.body.transferAccount !==
          undefined
            ? req.body.transferAccount
            : req.body.toAccount !==
              undefined
            ? req.body.toAccount
            : oldTransferAccountId;

        if (!destinationId) {
          return res.status(400).json({
            success: false,
            message:
              "Please select the destination account.",
          });
        }

        newTransferAccount =
          await getAccount(
            destinationId,
            req.user.id
          );

        if (!newTransferAccount) {
          return res.status(404).json({
            success: false,
            message:
              "Destination account not found.",
          });
        }

        if (
          newTransferAccount._id.toString() ===
          newAccount._id.toString()
        ) {
          return res.status(400).json({
            success: false,
            message:
              "From Account and To Account cannot be the same.",
          });
        }

        newToAccount =
          newTransferAccount.name;
      } else {
        newToAccount =
          req.body.toAccount !==
          undefined
            ? String(
                req.body.toAccount
              ).trim()
            : oldToAccount;

        if (!newToAccount) {
          return res.status(400).json({
            success: false,
            message:
              "Please enter the person's name.",
          });
        }

        if (
          newToAccount.length >
          100
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Person name is too long.",
          });
        }
      }
    }

    const newTitle =
      req.body.title !==
      undefined
        ? String(
            req.body.title
          ).trim()
        : expense.title;

    const newCategory =
      req.body.category !==
      undefined
        ? cleanCategory(
            req.body.category
          )
        : cleanCategory(
            expense.category
          );

    const newDate =
      req.body.date !==
      undefined
        ? req.body.date
        : expense.date;

    const newNotes =
      req.body.notes !==
      undefined
        ? String(
            req.body.notes
          ).trim()
        : expense.notes;

    if (
      newType !== "Transfer" &&
      !newTitle
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a transaction title.",
      });
    }

    if (
      newType !== "Transfer" &&
      !newCategory
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a category.",
      });
    }

    try {
      await reverseTransaction(
        expense,
        req.user.id
      );
    } catch (reverseError) {
      return res.status(400).json({
        success: false,
        message:
          reverseError.message,
      });
    }

    try {
      await applyTransaction(
        newType,
        newAccountId,
        newTransferMode,
        newTransferAccount
          ? newTransferAccount._id
          : null,
        newAmount,
        req.user.id
      );
    } catch (accountError) {
      try {
        await applyTransaction(
          oldType,
          oldAccountId,
          oldTransferMode,
          oldTransferAccountId,
          oldAmount,
          req.user.id
        );
      } catch (rollbackError) {
        console.error(
          "Transaction rollback error:",
          rollbackError
        );
      }

      return res.status(400).json({
        success: false,
        message:
          accountError.message,
      });
    }

    expense.title =
      newType === "Transfer"
        ? ""
        : newTitle;

    expense.amount =
      newAmount;

    expense.category =
      newType === "Transfer"
        ? "Transfer"
        : newCategory;

    expense.type =
      newType;

    expense.date =
      newDate;

    expense.notes =
      newNotes;

    expense.account =
      newAccountId;

    expense.toAccount =
      newType === "Transfer"
        ? newToAccount
        : "";

    expense.transferMode =
      newType === "Transfer"
        ? newTransferMode
        : null;

    expense.transferAccount =
      newType === "Transfer" &&
      newTransferMode ===
        "account"
        ? newTransferAccount._id
        : null;

    try {
      await expense.save();
    } catch (saveError) {
      try {
        await reverseTransaction(
          expense,
          req.user.id
        );
      } catch {}

      try {
        await applyTransaction(
          oldType,
          oldAccountId,
          oldTransferMode,
          oldTransferAccountId,
          oldAmount,
          req.user.id
        );
      } catch {}

      return res.status(500).json({
        success: false,
        message:
          saveError.message,
      });
    }

    if (
      oldType === "Expense"
    ) {
      await recalculateBudget(
        req.user.id,
        oldDate
      );
    }

    if (
      newType === "Expense"
    ) {
      await recalculateBudget(
        req.user.id,
        newDate
      );
    }

    const updatedExpense =
      await Expense.findById(
        expense._id
      )
        .populate(
          "account",
          "name type balance"
        )
        .populate(
          "transferAccount",
          "name type balance"
        );

    return res.status(200).json({
      success: true,
      message:
        newType === "Transfer"
          ? "Transfer Updated Successfully"
          : "Transaction Updated Successfully",
      expense:
        updatedExpense,
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

    try {
      await reverseTransaction(
        expense,
        req.user.id
      );
    } catch (reverseError) {
      return res.status(400).json({
        success: false,
        message:
          reverseError.message,
      });
    }

    await expense.deleteOne();

    if (
      expense.type === "Expense"
    ) {
      await recalculateBudget(
        req.user.id,
        expenseDate
      );
    }

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
    let transfers = 0;

    expenses.forEach((item) => {
      if (
        item.type === "Income"
      ) {
        income += Number(
          item.amount || 0
        );
      }

      if (
        item.type === "Expense"
      ) {
        expense += Number(
          item.amount || 0
        );
      }

      if (
        item.type === "Transfer"
      ) {
        transfers += Number(
          item.amount || 0
        );
      }
    });

    const balance =
      income - expense;

    const savings =
      income > 0
        ? Number(
            (
              (balance /
                income) *
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

    const budgetSummary =
      budget
        ? {
            totalBudget:
              budget.totalBudget ||
              0,
            totalSpent:
              budget.totalSpent ||
              0,
            remainingBudget:
              budget.remainingBudget ||
              0,
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
        transfers,
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