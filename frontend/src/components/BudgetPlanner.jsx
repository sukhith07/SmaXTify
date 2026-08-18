import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import API from "../services/api";

import BudgetHeader from "./BudgetHeader";
import BudgetSummary from "./BudgetSummary";
import BudgetUsageGauge from "./BudgetUsageGauge";
import BudgetDistributionChart from "./BudgetDistributionChart";
import BudgetForm from "./BudgetForm";
import BudgetCategoryCard from "./BudgetCategoryCard";
import BudgetInsights from "./BudgetInsights";
import BudgetAlerts from "./BudgetAlerts";
import BudgetQuickExpense from "./BudgetQuickExpense";

import "./styles/budgetPlanner.css";

const categoryList = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Healthcare",
  "Education",
  "Travel",
  "Groceries",
  "Rent",
];

function BudgetPlanner() {

  const currentMonth = new Date()
    .toISOString()
    .slice(0, 7);

  const emptyCategories = categoryList.map((category) => ({
    category,
    limit: 0,
    spent: 0,
  }));

  const [loading, setLoading] = useState(false);

  const [budget, setBudget] = useState({
    categories: [],
    totalBudget: 0,
    totalSpent: 0,
    remainingBudget: 0,
    overallPercentage: 0,
  });

  const [categories, setCategories] =
    useState(emptyCategories);

  // =====================================
  // Load Budget
  // =====================================

  const loadBudget = async () => {

    try {

      const { data } = await API.get(
        `/budget?month=${currentMonth}`
        
      );

      if (!data.budget) {

        setBudget({
          categories: [],
          totalBudget: 0,
          totalSpent: 0,
          remainingBudget: 0,
          overallPercentage: 0,
        });

        setCategories(emptyCategories);

        return;

      }

      // Always use fresh totals returned
      // directly from the backend

      setBudget({

        categories: data.budget.categories,

        totalBudget: Number(data.totalBudget),

        totalSpent: Number(data.totalSpent),

        remainingBudget: Number(
          data.remainingBudget
        ),

        overallPercentage: Number(
          data.overallPercentage
        ),

      });

      setCategories(

        categoryList.map((name) => {

          const existing =
            data.budget.categories.find(
              (c) => c.category === name
            );

          return {

            category: name,

            limit: existing?.limit || 0,

            spent: existing?.spent || 0,

          };

        })

      );

    } catch (error) {

      console.error(error);

      setBudget({

        categories: [],

        totalBudget: 0,

        totalSpent: 0,

        remainingBudget: 0,

        overallPercentage: 0,

      });

      setCategories(emptyCategories);

    }

  };

  useEffect(() => {

    loadBudget();

  }, []);
    // =====================================
  // Change Budget Limit
  // =====================================

  const handleChange = (index, value) => {

    const updated = [...categories];

    updated[index] = {
      ...updated[index],
      limit:
        value === ""
          ? 0
          : Number(value),
    };

    setCategories(updated);

  };

  // =====================================
  // Save Budget
  // =====================================

  const saveBudget = async () => {

    try {

      setLoading(true);

      const payload = categories.map((item) => ({
        category: item.category,
        limit: Number(item.limit) || 0,
      }));

      const { data } = await API.post(
        "/budget",
        {
          month: currentMonth,
          categories: payload,
        }
      );

      toast.success(
        "Budget Saved Successfully"
      );

      // Immediately update the UI
      // using the response from backend

      setBudget({

        categories: data.budget.categories,

        totalBudget: Number(data.totalBudget),

        totalSpent: Number(data.totalSpent),

        remainingBudget: Number(
          data.remainingBudget
        ),

        overallPercentage: Number(
          data.overallPercentage
        ),

      });

      setCategories(

        categoryList.map((name) => {

          const existing =
            data.budget.categories.find(
              (c) =>
                c.category === name
            );

          return {

            category: name,

            limit: existing?.limit || 0,

            spent: existing?.spent || 0,

          };

        })

      );

      // Reload once from database
      // to keep everything synchronized

      await loadBudget();

    } catch (err) {

      console.error(err);

      toast.error(

        err.response?.data?.message ||

        "Failed to Save Budget"

      );

    } finally {

      setLoading(false);

    }

  };

    return (

    <>

      {/* ===============================
          Header
      =============================== */}

      <BudgetHeader />

      {/* ===============================
          Summary
      =============================== */}

      <BudgetSummary
        totalBudget={budget.totalBudget}
        totalSpent={budget.totalSpent}
        remainingBudget={budget.remainingBudget}
        overallPercentage={budget.overallPercentage}
      />

      {/* ===============================
          Quick Add Expense
      =============================== */}

      <BudgetQuickExpense
        onExpenseAdded={loadBudget}
      />

      {/* ===============================
          Analytics
      =============================== */}

      <div className="budget-analytics">

        <BudgetUsageGauge
          totalBudget={budget.totalBudget}
          totalSpent={budget.totalSpent}
        />

        <BudgetDistributionChart
          categories={budget.categories}
        />

      </div>

      {/* ===============================
          Budget Configuration
      =============================== */}

      <BudgetForm
        categories={categories}
        loading={loading}
        onChange={handleChange}
        onSave={saveBudget}
      />

      {/* ===============================
          Category Cards
      =============================== */}

      {budget.categories.length > 0 && (

        <div className="budget-cards">

          {budget.categories.map((item) => (

            <BudgetCategoryCard
              key={item.category}
              category={item.category}
              limit={item.limit}
              spent={item.spent}
            />

          ))}

        </div>

      )}

      {/* ===============================
          Budget Insights
      =============================== */}

      {budget.categories.length > 0 && (

        <BudgetInsights
          categories={budget.categories}
        />

      )}

      {/* ===============================
          Budget Alerts
      =============================== */}

      {budget.categories.length > 0 && (

        <BudgetAlerts
          categories={budget.categories}
        />

      )}

      {/* ===============================
          Empty State
      =============================== */}

      {budget.categories.length === 0 && (

        <div className="budget-empty">

          <h2>
            💰 No Budget Created
          </h2>

          <p>
            Start by setting a monthly budget for
            each category. Once you save your
            budget, your charts, insights and
            alerts will automatically appear
            here.
          </p>

        </div>

      )}

    </>

  );

}

export default BudgetPlanner;