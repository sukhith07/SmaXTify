const Budget = require("../models/Budget");
const Expense = require("../models/Expense");

// =======================================
// Save / Update Budget
// =======================================
exports.saveBudget = async (req, res) => {
  try {

    const { month, categories } = req.body;

    if (!month || !Array.isArray(categories)) {
      return res.status(400).json({
        message: "Invalid budget data",
      });
    }

    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const expenses = await Expense.find({
      user: req.user.id,
      type: "Expense",
      date: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    const updatedCategories = categories.map((item) => {

      const limit = Number(item.limit) || 0;

      const spent = expenses
        .filter(exp => exp.category === item.category)
        .reduce((sum, exp) => sum + exp.amount, 0);

      return {
        category: item.category,
        limit,
        spent,
      };

    });

    const totalBudget = updatedCategories.reduce(
      (sum, item) => sum + item.limit,
      0
    );

    const totalSpent = updatedCategories.reduce(
      (sum, item) => sum + item.spent,
      0
    );

    const remainingBudget = totalBudget - totalSpent;

    const overallPercentage =
      totalBudget === 0
        ? 0
        : Math.min(
            Math.round((totalSpent / totalBudget) * 100),
            100
          );

    let budget = await Budget.findOne({
      user: req.user.id,
      month,
    });

    if (budget) {

      budget.categories = updatedCategories;
      budget.totalBudget = totalBudget;
      budget.totalSpent = totalSpent;
      budget.remainingBudget = remainingBudget;

      await budget.save();

    } else {

      budget = await Budget.create({

        user: req.user.id,

        month,

        categories: updatedCategories,

        totalBudget,

        totalSpent,

        remainingBudget,

      });

    }

    res.status(200).json({

      message: "Budget Saved Successfully",

      budget,

      totalBudget,

      totalSpent,

      remainingBudget,

      overallPercentage,

    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

// =======================================
// Get Budget
// =======================================
exports.getBudget = async (req, res) => {

  try {

    const month = req.query.month;

    const budget = await Budget.findOne({

      user: req.user.id,

      month,

    });

    if (!budget) {

      return res.status(404).json({

        message: "No Budget Found",

      });

    }

    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const expenses = await Expense.find({

      user: req.user.id,

      type: "Expense",

      date: {
        $gte: startDate,
        $lt: endDate,
      },

    });

    const categories = budget.categories.map(item => {

      const spent = expenses
        .filter(exp => exp.category === item.category)
        .reduce((sum, exp) => sum + exp.amount, 0);

      return {

        category: item.category,

        limit: item.limit,

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

    const remainingBudget = totalBudget - totalSpent;

    const overallPercentage =
      totalBudget === 0
        ? 0
        : Math.min(
            Math.round((totalSpent / totalBudget) * 100),
            100
          );

    res.status(200).json({

      budget: {

        ...budget.toObject(),

        categories,

      },

      totalBudget,

      totalSpent,

      remainingBudget,

      overallPercentage,

    });

  } catch (error) {

    res.status(500).json({

      message: error.message,

    });

  }

};

// =======================================
// Budget Progress
// =======================================
exports.getBudgetProgress = async (req, res) => {

  try {

    const month = req.query.month;

    const budget = await Budget.findOne({

      user: req.user.id,

      month,

    });

    if (!budget) {

      return res.status(404).json({

        message: "Budget Not Found",

      });

    }

    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const expenses = await Expense.find({

      user: req.user.id,

      type: "Expense",

      date: {

        $gte: startDate,

        $lt: endDate,

      },

    });

    let totalBudget = 0;
    let totalSpent = 0;

    const categories = budget.categories.map(item => {

      const limit = Number(item.limit) || 0;

      const spent = expenses
        .filter(exp => exp.category === item.category)
        .reduce((sum, exp) => sum + exp.amount, 0);

      const remaining = Math.max(limit - spent, 0);

      const percentage =
        limit === 0
          ? 0
          : Math.min(
              Math.round((spent / limit) * 100),
              100
            );

      totalBudget += limit;
      totalSpent += spent;

      return {

        category: item.category,

        limit,

        spent,

        remaining,

        percentage,

      };

    });

    res.status(200).json({

      month,

      totalBudget,

      totalSpent,

      remainingBudget: totalBudget - totalSpent,

      overallPercentage:
        totalBudget === 0
          ? 0
          : Math.min(
              Math.round(
                (totalSpent / totalBudget) * 100
              ),
              100
            ),

      categories,

    });

  } catch (error) {

    res.status(500).json({

      message: error.message,

    });

  }

};

// =======================================
// Delete Budget
// =======================================
exports.deleteBudget = async (req, res) => {

  try {

    const budget = await Budget.findById(req.params.id);

    if (!budget) {

      return res.status(404).json({

        message: "Budget Not Found",

      });

    }

    if (budget.user.toString() !== req.user.id) {

      return res.status(403).json({

        message: "Access Denied",

      });

    }

    await budget.deleteOne();

    res.status(200).json({

      message: "Budget Deleted Successfully",

    });

  } catch (error) {

    res.status(500).json({

      message: error.message,

    });

  }

};