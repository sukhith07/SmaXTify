const Expense = require("../models/Expense");

// =======================================
// Get Reports
// =======================================

exports.getReport = async (req, res) => {

  try {

    const {
      period = "thisMonth",
      category = "All Categories",
      startDate,
      endDate,
    } = req.query;


    // =====================================
    // Current Date
    // =====================================

    const now = new Date();

    let start = null;
    let end = null;


    // =====================================
    // This Month
    // =====================================

    if (period === "thisMonth") {

      start = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );

      end = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1
      );

    }


    // =====================================
    // Last Month
    // =====================================

    else if (period === "lastMonth") {

      start = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );

      end = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );

    }


    // =====================================
    // This Year
    // =====================================

    else if (period === "thisYear") {

      start = new Date(
        now.getFullYear(),
        0,
        1
      );

      end = new Date(
        now.getFullYear() + 1,
        0,
        1
      );

    }


    // =====================================
    // Custom Date Range
    // =====================================

    else if (period === "custom") {

      if (!startDate || !endDate) {

        return res.status(400).json({
          success: false,
          message:
            "Start date and end date are required",
        });

      }

      start = new Date(`${startDate}T00:00:00`);

      end = new Date(`${endDate}T23:59:59.999`);

    }


    // =====================================
    // All Time
    // =====================================

    else if (period === "allTime") {

      start = null;
      end = null;

    }


    // =====================================
    // Invalid Period
    // =====================================

    else {

      return res.status(400).json({

        success: false,

        message:
          "Invalid report period",

      });

    }


    // =====================================
    // Build MongoDB Query
    // =====================================

    const query = {
      user: req.user.id,
    };


    // =====================================
    // Date Filter
    // =====================================

    if (start && end) {

      query.date = {
        $gte: start,
        $lte: end,
      };

    }


    // =====================================
    // Category Filter
    // =====================================

    if (
      category &&
      category !== "All Categories"
    ) {

      query.category = category;

    }


    // =====================================
    // Get Transactions
    // =====================================

    const transactions =
      await Expense.find(query)
        .sort({
          date: -1,
        })
        .lean();


    // =====================================
    // Calculate Summary
    // =====================================

    let income = 0;
    let expense = 0;


    transactions.forEach((item) => {

      const amount =
        Number(item.amount) || 0;


      if (item.type === "Income") {

        income += amount;

      } else {

        expense += amount;

      }

    });


    // =====================================
    // Balance
    // =====================================

    const balance =
      income - expense;


    // =====================================
    // Savings Rate
    // =====================================

    const savings =
      income > 0
        ? Number(
            (
              (balance / income) *
              100
            ).toFixed(1)
          )
        : 0;


    // =====================================
    // Response
    // =====================================

    return res.status(200).json({

      success: true,

      filters: {

        period,

        category,

        startDate:
          start
            ? start.toISOString()
            : null,

        endDate:
          end
            ? end.toISOString()
            : null,

      },

      summary: {

        income,

        expense,

        balance,

        savings,

        totalTransactions:
          transactions.length,

      },

      transactions,

    });

  } catch (error) {

    console.error(
      "Reports Error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Failed to generate report",

      error:
        error.message,

    });

  }

};