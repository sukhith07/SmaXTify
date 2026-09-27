// =========================================================
// SMAxTIFY AI ACTION EXECUTOR
// =========================================================

const Expense = require("../../models/Expense");
const Account = require("../../models/Account");

const {
  validateAction,
} = require("./aiActionValidator");

const {
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require("../transactionService");


// =========================================================
// RESPONSE HELPERS
// =========================================================

const successResponse = (
  action,
  data = {},
  message = ""
) => {
  return {
    success: true,
    action,
    message,
    data,
  };
};


const errorResponse = (
  action,
  message,
  code = "ACTION_FAILED"
) => {
  return {
    success: false,
    action,
    code,
    message,
    data: null,
  };
};


// =========================================================
// CURRENCY FORMATTER
// =========================================================

const formatCurrency = (
  amount
) => {
  const value =
    Number(amount) || 0;

  return `₹${value.toLocaleString(
    "en-IN",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  )}`;
};


// =========================================================
// DATE HELPERS
// =========================================================

const getValidDate = (
  value
) => {
  if (!value) {
    return null;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date;
};


const getMonthKey = (
  date
) => {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  return `${year}-${month}`;
};


const getMonthLabel = (
  monthKey
) => {
  const [year, month] =
    monthKey.split("-");

  const date =
    new Date(
      Number(year),
      Number(month) - 1,
      1
    );

  return date.toLocaleDateString(
    "en-IN",
    {
      month: "short",
      year: "numeric",
    }
  );
};


// =========================================================
// GET MONTH RANGE
// =========================================================

const getPreviousMonthKeys = (
  months
) => {
  const result = [];

  const count =
    Math.max(
      1,
      Math.min(
        Number(months) || 12,
        24
      )
    );

  const now =
    new Date();

  now.setDate(1);
  now.setHours(
    0,
    0,
    0,
    0
  );

  for (
    let i = count - 1;
    i >= 0;
    i--
  ) {
    const date =
      new Date(now);

    date.setMonth(
      now.getMonth() - i
    );

    result.push(
      getMonthKey(date)
    );
  }

  return result;
};


// =========================================================
// GET MONTH KEYS FROM DATE RANGE
// =========================================================

const getMonthKeysFromDateRange = (
  startDate,
  endDate
) => {
  if (
    !startDate ||
    !endDate
  ) {
    return null;
  }

  const result = [];

  const current =
    new Date(
      startDate
    );

  current.setDate(1);
  current.setHours(
    0,
    0,
    0,
    0
  );

  const last =
    new Date(
      endDate
    );

  last.setDate(1);
  last.setHours(
    0,
    0,
    0,
    0
  );

  while (
    current <= last &&
    result.length < 24
  ) {
    result.push(
      getMonthKey(
        current
      )
    );

    current.setMonth(
      current.getMonth() + 1
    );
  }

  return result;
};


// =========================================================
// BUILD DATE FILTER
// =========================================================

const buildDateFilter = (
  args = {}
) => {
  const filter = {};

  let startDate =
    getValidDate(
      args.startDate
    );

  let endDate =
    getValidDate(
      args.endDate
    );

  if (
    startDate &&
    endDate &&
    startDate > endDate
  ) {
    const temp =
      startDate;

    startDate =
      endDate;

    endDate =
      temp;
  }

  if (
    startDate ||
    endDate
  ) {
    filter.date = {};

    if (startDate) {
      startDate.setHours(
        0,
        0,
        0,
        0
      );

      filter.date.$gte =
        startDate;
    }

    if (endDate) {
      endDate.setHours(
        23,
        59,
        59,
        999
      );

      filter.date.$lte =
        endDate;
    }
  }

  return filter;
};


// =========================================================
// CREATE TRANSACTION
// =========================================================

const executeCreateTransaction =
  async ({
    userId,
    args,
  }) => {
    try {
      const transaction =
        await createTransaction({
          userId,

          title:
            args.title || "",

          amount:
            args.amount,

          category:
            args.category || "Other",

          type:
            args.type,

          date:
            args.date,

          notes:
            args.notes || "",

          account:
            args.account,

          toAccount:
            args.toAccount || "",

          transferAccount:
            args.transferAccount ||
            null,

          transferMode:
            args.transferMode ||
            null,
        });

      const transactionType =
        transaction?.type ||
        args.type ||
        "Transaction";

      const transactionTitle =
        transaction?.title ||
        args.title ||
        "Transaction";

      const transactionAmount =
        transaction?.amount ??
        args.amount ??
        0;

      return successResponse(
        "create_transaction",
        {
          transaction,
        },
        `${transactionType} "${transactionTitle}" of ${formatCurrency(
          transactionAmount
        )} was created successfully.`
      );
    } catch (error) {
      return errorResponse(
        "create_transaction",
        error.message
      );
    }
  };


// =========================================================
// UPDATE TRANSACTION
// =========================================================

const executeUpdateTransaction =
  async ({
    userId,
    args,
  }) => {
    try {
      const transaction =
        await Expense.findOne({
          _id:
            args.transactionId,

          user:
            userId,
        });

      if (!transaction) {
        return errorResponse(
          "update_transaction",
          "Transaction not found.",
          "NOT_FOUND"
        );
      }

      const updatedTransaction =
        await updateTransaction(
          transaction,
          args,
          userId
        );

      return successResponse(
        "update_transaction",
        {
          transaction:
            updatedTransaction,
        },
        "Transaction updated successfully."
      );
    } catch (error) {
      return errorResponse(
        "update_transaction",
        error.message
      );
    }
  };


// =========================================================
// DELETE TRANSACTION
// =========================================================

const executeDeleteTransaction =
  async ({
    userId,
    args,
  }) => {
    try {
      const transaction =
        await Expense.findOne({
          _id:
            args.transactionId,

          user:
            userId,
        });

      if (!transaction) {
        return errorResponse(
          "delete_transaction",
          "Transaction not found.",
          "NOT_FOUND"
        );
      }

      const deletedTitle =
        transaction.title ||
        "Transaction";

      const deletedAmount =
        Number(
          transaction.amount || 0
        );

      await deleteTransaction(
        transaction,
        userId
      );

      return successResponse(
        "delete_transaction",
        {
          transactionId:
            args.transactionId,
        },
        `"${deletedTitle}" of ${formatCurrency(
          deletedAmount
        )} was deleted successfully.`
      );
    } catch (error) {
      return errorResponse(
        "delete_transaction",
        error.message
      );
    }
  };


// =========================================================
// GET ACCOUNTS
// =========================================================

const executeGetAccounts =
  async ({
    userId,
  }) => {
    try {
      const accounts =
        await Account.find({
          user:
            userId,
        })
          .select(
            "name type balance details createdAt"
          )
          .sort({
            createdAt: 1,
          })
          .lean();

      if (
        accounts.length ===
        0
      ) {
        return successResponse(
          "get_accounts",
          {
            accounts: [],
            accountCount: 0,
            totalBalance: 0,
          },
          "You currently have no accounts."
        );
      }

      const accountCount =
        accounts.length;

      const totalBalance =
        accounts.reduce(
          (
            total,
            account
          ) => {
            return (
              total +
              Number(
                account.balance ||
                  0
              )
            );
          },
          0
        );

      const accountSummary =
        accounts.map(
          (account) => {
            const name =
              account.name ||
              "Unnamed Account";

            const type =
              account.type ||
              "Account";

            const balance =
              Number(
                account.balance ||
                  0
              );

            return {
              id:
                account._id.toString(),

              name,

              type,

              balance,
            };
          }
        );

      const accountLines =
        accountSummary
          .map(
            (account) =>
              `• ${account.name} (${account.type}) — ${formatCurrency(
                account.balance
              )}`
          )
          .join("\n");

      const message =
        `You currently have ${accountCount} ${
          accountCount === 1
            ? "account"
            : "accounts"
        }.\n\n${accountLines}\n\nTotal account balance: ${formatCurrency(
          totalBalance
        )}.`;

      return successResponse(
        "get_accounts",
        {
          accounts:
            accountSummary,

          accountCount,

          totalBalance,
        },
        message
      );
    } catch (error) {
      return errorResponse(
        "get_accounts",
        error.message
      );
    }
  };


// =========================================================
// GET FINANCIAL SUMMARY
// =========================================================

const executeFinancialSummary =
  async ({
    userId,
  }) => {
    try {
      const transactions =
        await Expense.find({
          user:
            userId,
        })
          .select(
            "amount type date category"
          )
          .lean();

      const accounts =
        await Account.find({
          user:
            userId,
        })
          .select(
            "name type balance"
          )
          .lean();

      let income = 0;
      let expense = 0;
      let transfers = 0;

      transactions.forEach(
        (
          transaction
        ) => {
          const amount =
            Number(
              transaction.amount ||
                0
            );

          if (
            transaction.type ===
            "Income"
          ) {
            income += amount;
          }

          if (
            transaction.type ===
            "Expense"
          ) {
            expense += amount;
          }

          if (
            transaction.type ===
            "Transfer"
          ) {
            transfers += amount;
          }
        }
      );

      const balance =
        income - expense;

      const totalAccountBalance =
        accounts.reduce(
          (
            sum,
            account
          ) =>
            sum +
            Number(
              account.balance ||
                0
            ),
          0
        );

      const accountCount =
        accounts.length;

      const totalTransactions =
        transactions.length;

      const savingsRate =
        income > 0
          ? ((income - expense) /
              income) *
            100
          : 0;

      const message =
        `Here is your current financial summary:\n\n` +
        `• Income: ${formatCurrency(
          income
        )}\n` +
        `• Expenses: ${formatCurrency(
          expense
        )}\n` +
        `• Net balance: ${formatCurrency(
          balance
        )}\n` +
        `• Transfers: ${formatCurrency(
          transfers
        )}\n` +
        `• Account balance: ${formatCurrency(
          totalAccountBalance
        )}\n` +
        `• Accounts: ${accountCount}\n` +
        `• Transactions: ${totalTransactions}\n` +
        `• Savings rate: ${savingsRate.toFixed(
          1
        )}%`;

      return successResponse(
        "get_financial_summary",
        {
          income,

          expense,

          transfers,

          balance,

          totalAccountBalance,

          totalTransactions,

          accountCount,

          savingsRate,
        },
        message
      );
    } catch (error) {
      return errorResponse(
        "get_financial_summary",
        error.message
      );
    }
  };


// =========================================================
// GET MONTHLY TRANSACTION DATA
// =========================================================

const getMonthlyTransactionData =
  async ({
    userId,
    args = {},
    type = null,
  }) => {
    const months =
      Math.max(
        1,
        Math.min(
          Number(
            args.months
          ) || 12,
          24
        )
      );

    const explicitStartDate =
      getValidDate(
        args.startDate
      );

    const explicitEndDate =
      getValidDate(
        args.endDate
      );

    let monthKeys =
      null;

    if (
      explicitStartDate &&
      explicitEndDate
    ) {
      let start =
        explicitStartDate;

      let end =
        explicitEndDate;

      if (
        start > end
      ) {
        const temp =
          start;

        start =
          end;

        end =
          temp;
      }

      monthKeys =
        getMonthKeysFromDateRange(
          start,
          end
        );
    }

    if (
      !monthKeys ||
      monthKeys.length === 0
    ) {
      monthKeys =
        getPreviousMonthKeys(
          months
        );
    }

    const dateFilter =
      buildDateFilter(
        args
      );

    const match = {
      user:
        userId,

      ...dateFilter,
    };

    if (type) {
      match.type =
        type;
    }

    const transactions =
      await Expense.find(
        match
      )
        .select(
          "amount type date"
        )
        .sort({
          date: 1,
        })
        .lean();

    const monthlyData = {};

    monthKeys.forEach(
      (month) => {
        monthlyData[month] =
          0;
      }
    );

    transactions.forEach(
      (transaction) => {
        if (
          !transaction.date
        ) {
          return;
        }

        const date =
          new Date(
            transaction.date
          );

        if (
          Number.isNaN(
            date.getTime()
          )
        ) {
          return;
        }

        const month =
          getMonthKey(date);

        if (
          Object.prototype.hasOwnProperty.call(
            monthlyData,
            month
          )
        ) {
          monthlyData[month] +=
            Number(
              transaction.amount ||
                0
            );
        }
      }
    );

    return {
      monthKeys,
      monthlyData,
    };
  };


// =========================================================
// GET INCOME CHART
// =========================================================

const executeIncomeChart =
  async ({
    userId,
    args = {},
  }) => {
    try {
      const {
        monthKeys,
        monthlyData,
      } =
        await getMonthlyTransactionData(
          {
            userId,
            args,
            type:
              "Income",
          }
        );

      const labels =
        monthKeys.map(
          getMonthLabel
        );

      const values =
        monthKeys.map(
          (month) =>
            Number(
              monthlyData[
                month
              ] || 0
            )
        );

      const totalIncome =
        values.reduce(
          (
            total,
            value
          ) =>
            total + value,
          0
        );

      return successResponse(
        "get_income_chart",
        {
          chartType:
            "line",

          title:
            "Income Over Time",

          labels,

          datasets: [
            {
              label:
                "Income",

              data:
                values,

              fill:
                false,

              tension:
                0.35,
            },
          ],

          values,

          totalIncome,

          months:
            monthKeys.length,

          currency:
            "INR",
        },
        `Here is your income chart for the last ${monthKeys.length} months. Total income in this period is ${formatCurrency(
          totalIncome
        )}.`
      );
    } catch (error) {
      return errorResponse(
        "get_income_chart",
        error.message
      );
    }
  };


// =========================================================
// GET EXPENSE CHART
// =========================================================

const executeExpenseChart =
  async ({
    userId,
    args = {},
  }) => {
    try {
      const {
        monthKeys,
        monthlyData,
      } =
        await getMonthlyTransactionData(
          {
            userId,
            args,
            type:
              "Expense",
          }
        );

      const labels =
        monthKeys.map(
          getMonthLabel
        );

      const values =
        monthKeys.map(
          (month) =>
            Number(
              monthlyData[
                month
              ] || 0
            )
        );

      const totalExpense =
        values.reduce(
          (
            total,
            value
          ) =>
            total + value,
          0
        );

      return successResponse(
        "get_expense_chart",
        {
          chartType:
            "line",

          title:
            "Expenses Over Time",

          labels,

          datasets: [
            {
              label:
                "Expenses",

              data:
                values,

              fill:
                false,

              tension:
                0.35,
            },
          ],

          values,

          totalExpense,

          months:
            monthKeys.length,

          currency:
            "INR",
        },
        `Here is your expense chart for the last ${monthKeys.length} months. Total expenses in this period are ${formatCurrency(
          totalExpense
        )}.`
      );
    } catch (error) {
      return errorResponse(
        "get_expense_chart",
        error.message
      );
    }
  };


// =========================================================
// GET INCOME VS EXPENSE CHART
// =========================================================

const executeIncomeVsExpenseChart =
  async ({
    userId,
    args = {},
  }) => {
    try {
      const {
        monthKeys,
        monthlyData:
          incomeData,
      } =
        await getMonthlyTransactionData(
          {
            userId,
            args,
            type:
              "Income",
          }
        );

      const {
        monthlyData:
          expenseData,
      } =
        await getMonthlyTransactionData(
          {
            userId,
            args,
            type:
              "Expense",
          }
        );

      const labels =
        monthKeys.map(
          getMonthLabel
        );

      const incomeValues =
        monthKeys.map(
          (month) =>
            Number(
              incomeData[
                month
              ] || 0
            )
        );

      const expenseValues =
        monthKeys.map(
          (month) =>
            Number(
              expenseData[
                month
              ] || 0
            )
        );

      const netValues =
        monthKeys.map(
          (
            month,
            index
          ) =>
            incomeValues[index] -
            expenseValues[index]
        );

      const totalIncome =
        incomeValues.reduce(
          (
            total,
            value
          ) =>
            total + value,
          0
        );

      const totalExpense =
        expenseValues.reduce(
          (
            total,
            value
          ) =>
            total + value,
          0
        );

      const netBalance =
        totalIncome -
        totalExpense;

      return successResponse(
        "get_income_vs_expense_chart",
        {
          chartType:
            "bar",

          title:
            "Income vs Expenses",

          labels,

          datasets: [
            {
              label:
                "Income",

              data:
                incomeValues,
            },

            {
              label:
                "Expenses",

              data:
                expenseValues,
            },
          ],

          income:
            incomeValues,

          expense:
            expenseValues,

          net:
            netValues,

          totalIncome,

          totalExpense,

          netBalance,

          months:
            monthKeys.length,

          currency:
            "INR",
        },
        `Here is your income vs expense chart for the last ${monthKeys.length} months. Income is ${formatCurrency(
          totalIncome
        )}, expenses are ${formatCurrency(
          totalExpense
        )}, and the net balance is ${formatCurrency(
          netBalance
        )}.`
      );
    } catch (error) {
      return errorResponse(
        "get_income_vs_expense_chart",
        error.message
      );
    }
  };


// =========================================================
// GET CATEGORY BREAKDOWN
// =========================================================

const executeCategoryBreakdown =
  async ({
    userId,
    args = {},
  }) => {
    try {
      const dateFilter =
        buildDateFilter(
          args
        );

      const expenses =
        await Expense.find({
          user:
            userId,

          type:
            "Expense",

          ...dateFilter,
        })
          .select(
            "amount category"
          )
          .lean();

      const categoryTotals =
        {};

      expenses.forEach(
        (expense) => {
          const category =
            (
              expense.category ||
              "Other"
            ).trim() ||
            "Other";

          const amount =
            Number(
              expense.amount ||
                0
            );

          if (
            !categoryTotals[
              category
            ]
          ) {
            categoryTotals[
              category
            ] = 0;
          }

          categoryTotals[
            category
          ] += amount;
        }
      );

      const entries =
        Object.entries(
          categoryTotals
        )
          .sort(
            (
              a,
              b
            ) =>
              b[1] - a[1]
          );

      const limit =
        Math.max(
          1,
          Math.min(
            Number(
              args.limit
            ) || 10,
            24
          )
        );

      const limitedEntries =
        entries.slice(
          0,
          limit
        );

      const labels =
        limitedEntries.map(
          ([category]) =>
            category
        );

      const values =
        limitedEntries.map(
          ([, amount]) =>
            Number(amount)
        );

      const totalExpense =
        entries.reduce(
          (
            total,
            [, amount]
          ) =>
            total +
            Number(amount),
          0
        );

      const percentages =
        values.map(
          (value) =>
            totalExpense > 0
              ? Number(
                  (
                    (value /
                      totalExpense) *
                    100
                  ).toFixed(2)
                )
              : 0
        );

      return successResponse(
        "get_category_breakdown",
        {
          chartType:
            "doughnut",

          title:
            "Expense by Category",

          labels,

          datasets: [
            {
              label:
                "Expenses",

              data:
                values,
            },
          ],

          values,

          percentages,

          totalExpense,

          categoryCount:
            entries.length,

          displayedCategories:
            limitedEntries.length,

          currency:
            "INR",
        },
        `Here is your expense category breakdown. Total expenses are ${formatCurrency(
          totalExpense
        )} across ${entries.length} ${
          entries.length === 1
            ? "category"
            : "categories"
        }.`
      );
    } catch (error) {
      return errorResponse(
        "get_category_breakdown",
        error.message
      );
    }
  };


// =========================================================
// GET MONTHLY FINANCIAL CHART
// =========================================================

const executeMonthlyFinancialChart =
  async ({
    userId,
    args = {},
  }) => {
    try {
      const {
        monthKeys,
        monthlyData:
          incomeData,
      } =
        await getMonthlyTransactionData(
          {
            userId,
            args,
            type:
              "Income",
          }
        );

      const {
        monthlyData:
          expenseData,
      } =
        await getMonthlyTransactionData(
          {
            userId,
            args,
            type:
              "Expense",
          }
        );

      const labels =
        monthKeys.map(
          getMonthLabel
        );

      const incomeValues =
        monthKeys.map(
          (month) =>
            Number(
              incomeData[
                month
              ] || 0
            )
        );

      const expenseValues =
        monthKeys.map(
          (month) =>
            Number(
              expenseData[
                month
              ] || 0
            )
        );

      const netValues =
        monthKeys.map(
          (
            month,
            index
          ) =>
            incomeValues[index] -
            expenseValues[index]
        );

      const totalIncome =
        incomeValues.reduce(
          (
            total,
            value
          ) =>
            total + value,
          0
        );

      const totalExpense =
        expenseValues.reduce(
          (
            total,
            value
          ) =>
            total + value,
          0
        );

      const totalNet =
        totalIncome -
        totalExpense;

      return successResponse(
        "get_monthly_financial_chart",
        {
          chartType:
            "line",

          title:
            "Monthly Financial Overview",

          labels,

          datasets: [
            {
              label:
                "Income",

              data:
                incomeValues,
            },

            {
              label:
                "Expenses",

              data:
                expenseValues,
            },

            {
              label:
                "Net Balance",

              data:
                netValues,
            },
          ],

          income:
            incomeValues,

          expense:
            expenseValues,

          net:
            netValues,

          totalIncome,

          totalExpense,

          totalNet,

          months:
            monthKeys.length,

          currency:
            "INR",
        },
        `Here is your monthly financial overview for the last ${monthKeys.length} months.`
      );
    } catch (error) {
      return errorResponse(
        "get_monthly_financial_chart",
        error.message
      );
    }
  };


// =========================================================
// GET REPORT DATA
// =========================================================

const executeReportData =
  async ({
    userId,
    args = {},
  }) => {
    try {
      const dateFilter =
        buildDateFilter(
          args
        );

      const requestedLimit =
        Number(
          args.limit
        ) || 100;

      const limit =
        Math.max(
          1,
          Math.min(
            requestedLimit,
            1000
          )
        );

      const transactions =
        await Expense.find({
          user:
            userId,

          ...dateFilter,
        })
          .select(
            "title amount type category date notes account toAccount createdAt"
          )
          .sort({
            date: -1,
            createdAt: -1,
          })
          .limit(limit)
          .lean();

      let income = 0;
      let expense = 0;
      let transfers = 0;

      transactions.forEach(
        (transaction) => {
          const amount =
            Number(
              transaction.amount ||
                0
            );

          if (
            transaction.type ===
            "Income"
          ) {
            income += amount;
          }

          if (
            transaction.type ===
            "Expense"
          ) {
            expense += amount;
          }

          if (
            transaction.type ===
            "Transfer"
          ) {
            transfers += amount;
          }
        }
      );

      const net =
        income - expense;

      const transactionData =
        transactions.map(
          (transaction) => ({
            id:
              transaction._id.toString(),

            title:
              transaction.title ||
              "Transaction",

            amount:
              Number(
                transaction.amount ||
                  0
              ),

            type:
              transaction.type,

            category:
              transaction.category ||
              "Other",

            date:
              transaction.date,

            notes:
              transaction.notes ||
              "",
          })
        );

      return successResponse(
        "get_report_data",
        {
          transactions:
            transactionData,

          transactionCount:
            transactionData.length,

          income,

          expense,

          transfers,

          net,

          currency:
            "INR",
        },
        `Report data retrieved successfully. ${transactionData.length} transactions were included.`
      );
    } catch (error) {
      return errorResponse(
        "get_report_data",
        error.message
      );
    }
  };


// =========================================================
// MAIN ACTION EXECUTOR
// =========================================================

const executeAIAction =
  async ({
    userId,
    action,
    args = {},
  }) => {
    // -----------------------------------------------------
    // AUTHENTICATION
    // -----------------------------------------------------

    if (!userId) {
      return errorResponse(
        action,
        "Authenticated user is required.",
        "UNAUTHORIZED"
      );
    }

    // -----------------------------------------------------
    // VALIDATE ACTION
    // -----------------------------------------------------

    const validation =
      validateAction({
        action,
        args,
      });

    if (
      !validation.valid
    ) {
      return errorResponse(
        action,
        validation.errors.join(
          " "
        ),
        "INVALID_ACTION"
      );
    }

    const normalizedAction =
      validation
        .actionDefinition
        .name;

    // -----------------------------------------------------
    // WHITELISTED ACTIONS
    // -----------------------------------------------------

    switch (
      normalizedAction
    ) {
      // ===================================================
      // TRANSACTIONS
      // ===================================================

      case "create_transaction":
        return executeCreateTransaction({
          userId,
          args,
        });

      case "update_transaction":
        return executeUpdateTransaction({
          userId,
          args,
        });

      case "delete_transaction":
        return executeDeleteTransaction({
          userId,
          args,
        });


      // ===================================================
      // ACCOUNTS
      // ===================================================

      case "get_accounts":
        return executeGetAccounts({
          userId,
        });


      // ===================================================
      // FINANCIAL SUMMARY
      // ===================================================

      case "get_financial_summary":
        return executeFinancialSummary({
          userId,
        });


      // ===================================================
      // CHARTS
      // ===================================================

      case "get_income_chart":
        return executeIncomeChart({
          userId,
          args,
        });

      case "get_expense_chart":
        return executeExpenseChart({
          userId,
          args,
        });

      case "get_income_vs_expense_chart":
        return executeIncomeVsExpenseChart({
          userId,
          args,
        });

      case "get_category_breakdown":
        return executeCategoryBreakdown({
          userId,
          args,
        });

      case "get_monthly_financial_chart":
        return executeMonthlyFinancialChart({
          userId,
          args,
        });


      // ===================================================
      // REPORT DATA
      // ===================================================

      case "get_report_data":
        return executeReportData({
          userId,
          args,
        });


      // ===================================================
      // NOT IMPLEMENTED
      // ===================================================

      default:
        return errorResponse(
          normalizedAction,
          "This AI action is not implemented yet.",
          "NOT_IMPLEMENTED"
        );
    }
  };


// =========================================================
// EXPORT
// =========================================================

module.exports = {
  executeAIAction,
};