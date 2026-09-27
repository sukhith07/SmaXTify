const mongoose = require("mongoose");

const Expense = require("../models/Expense");
const Budget = require("../models/Budget");
const Account = require("../models/Account");


// =========================================================
// CATEGORY
// =========================================================

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


// =========================================================
// ACCOUNT
// =========================================================

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


// =========================================================
// BUDGET RECALCULATION
// =========================================================

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


// =========================================================
// ACCOUNT BALANCE
// =========================================================

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


// =========================================================
// INTERNAL ACCOUNT TRANSFER
// =========================================================

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


// =========================================================
// TRANSFER HELPERS
// =========================================================

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


// =========================================================
// CREATE TRANSACTION
// =========================================================

const createTransaction = async ({
  userId,
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
}) => {

  if (
    !amount ||
    !type ||
    !account
  ) {
    throw new Error(
      "Please fill all required fields and select an account."
    );
  }

  if (
    ![
      "Income",
      "Expense",
      "Transfer",
    ].includes(type)
  ) {
    throw new Error(
      "Invalid transaction type."
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
      "Please enter a valid amount."
    );
  }

  if (
    type !== "Transfer" &&
    (!title ||
      !String(title).trim())
  ) {
    throw new Error(
      "Please enter a transaction title."
    );
  }

  if (
    type !== "Transfer" &&
    (!category ||
      !String(category).trim())
  ) {
    throw new Error(
      "Please enter a category."
    );
  }

  const selectedAccount =
    await getAccount(
      account,
      userId
    );

  if (!selectedAccount) {
    throw new Error(
      "Selected account not found."
    );
  }

  let finalTransferMode = null;
  let finalTransferAccount = null;
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
        throw new Error(
          "Please select the destination account."
        );
      }

      finalTransferAccount =
        await getAccount(
          destinationId,
          userId
        );

      if (!finalTransferAccount) {
        throw new Error(
          "Destination account not found."
        );
      }

      if (
        finalTransferAccount._id.toString() ===
        selectedAccount._id.toString()
      ) {
        throw new Error(
          "From Account and To Account cannot be the same."
        );
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
        throw new Error(
          "Please enter the person's name."
        );
      }

      if (
        finalToAccount.length >
        100
      ) {
        throw new Error(
          "Person name is too long."
        );
      }
    }

    if (
      Number(
        selectedAccount.balance ||
          0
      ) <
      transactionAmount
    ) {
      throw new Error(
        `Insufficient balance in ${selectedAccount.name}.`
      );
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
    throw new Error(
      `Insufficient balance in ${selectedAccount.name}.`
    );
  }

  const expense =
    await Expense.create({
      user: userId,

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
      userId
    );
  } catch (accountError) {
    await expense.deleteOne();

    throw accountError;
  }

  if (
    type === "Expense"
  ) {
    await recalculateBudget(
      userId,
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

  return populatedExpense;
};


// =========================================================
// UPDATE TRANSACTION
// =========================================================

const updateTransaction = async (
  expense,
  data,
  userId
) => {

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
    data.type !== undefined
      ? data.type
      : oldType;

  if (
    ![
      "Income",
      "Expense",
      "Transfer",
    ].includes(newType)
  ) {
    throw new Error(
      "Invalid transaction type."
    );
  }

  const newAmount =
    data.amount !== undefined
      ? Number(data.amount)
      : oldAmount;

  if (
    !Number.isFinite(
      newAmount
    ) ||
    newAmount <= 0
  ) {
    throw new Error(
      "Please enter a valid amount."
    );
  }

  const newAccountId =
    data.account !==
    undefined
      ? data.account
      : oldAccountId;

  if (!newAccountId) {
    throw new Error(
      "Please select an account."
    );
  }

  const newAccount =
    await getAccount(
      newAccountId,
      userId
    );

  if (!newAccount) {
    throw new Error(
      "Selected account not found."
    );
  }

  let newTransferMode = null;
  let newTransferAccount = null;
  let newToAccount = "";

  if (
    newType === "Transfer"
  ) {
    newTransferMode =
      data.transferMode ===
      "account"
        ? "account"
        : data.transferMode ===
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
        data.transferAccount !==
        undefined
          ? data.transferAccount
          : data.toAccount !==
            undefined
          ? data.toAccount
          : oldTransferAccountId;

      if (!destinationId) {
        throw new Error(
          "Please select the destination account."
        );
      }

      newTransferAccount =
        await getAccount(
          destinationId,
          userId
        );

      if (!newTransferAccount) {
        throw new Error(
          "Destination account not found."
        );
      }

      if (
        newTransferAccount._id.toString() ===
        newAccount._id.toString()
      ) {
        throw new Error(
          "From Account and To Account cannot be the same."
        );
      }

      newToAccount =
        newTransferAccount.name;
    } else {
      newToAccount =
        data.toAccount !==
        undefined
          ? String(
              data.toAccount
            ).trim()
          : oldToAccount;

      if (!newToAccount) {
        throw new Error(
          "Please enter the person's name."
        );
      }

      if (
        newToAccount.length >
        100
      ) {
        throw new Error(
          "Person name is too long."
        );
      }
    }
  }

  const newTitle =
    data.title !==
    undefined
      ? String(
          data.title
        ).trim()
      : expense.title;

  const newCategory =
    data.category !==
    undefined
      ? cleanCategory(
          data.category
        )
      : cleanCategory(
          expense.category
        );

  const newDate =
    data.date !==
    undefined
      ? data.date
      : expense.date;

  const newNotes =
    data.notes !==
    undefined
      ? String(
          data.notes
        ).trim()
      : expense.notes;

  if (
    newType !== "Transfer" &&
    !newTitle
  ) {
    throw new Error(
      "Please enter a transaction title."
    );
  }

  if (
    newType !== "Transfer" &&
    !newCategory
  ) {
    throw new Error(
      "Please enter a category."
    );
  }

  await reverseTransaction(
    expense,
    userId
  );

  try {
    await applyTransaction(
      newType,
      newAccountId,
      newTransferMode,
      newTransferAccount
        ? newTransferAccount._id
        : null,
      newAmount,
      userId
    );
  } catch (accountError) {

    try {
      await applyTransaction(
        oldType,
        oldAccountId,
        oldTransferMode,
        oldTransferAccountId,
        oldAmount,
        userId
      );
    } catch (rollbackError) {
      console.error(
        "Transaction rollback error:",
        rollbackError
      );
    }

    throw accountError;
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
        userId
      );
    } catch {}

    try {
      await applyTransaction(
        oldType,
        oldAccountId,
        oldTransferMode,
        oldTransferAccountId,
        oldAmount,
        userId
      );
    } catch {}

    throw saveError;
  }

  if (
    oldType === "Expense"
  ) {
    await recalculateBudget(
      userId,
      oldDate
    );
  }

  if (
    newType === "Expense"
  ) {
    await recalculateBudget(
      userId,
      newDate
    );
  }

  return Expense.findById(
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
};


// =========================================================
// DELETE TRANSACTION
// =========================================================

const deleteTransaction = async (
  expense,
  userId
) => {

  const expenseDate =
    expense.date;

  await reverseTransaction(
    expense,
    userId
  );

  await expense.deleteOne();

  if (
    expense.type === "Expense"
  ) {
    await recalculateBudget(
      userId,
      expenseDate
    );
  }
};


// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  cleanCategory,
  getAccount,
  recalculateBudget,

  updateAccountBalance,
  reverseAccountBalance,

  applyInternalTransfer,
  reverseInternalTransfer,

  getTransferMode,
  applyTransfer,
  reverseTransfer,

  applyTransaction,
  reverseTransaction,

  createTransaction,
  updateTransaction,
  deleteTransaction,
};