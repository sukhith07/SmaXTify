import {
  Pie,
} from "react-chartjs-2";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import "./styles/budgetDistributionChart.css";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

function BudgetDistributionChart({
  categories = [],
}) {

  const filteredCategories = categories.filter(
    (item) => Number(item.spent) > 0
  );

  if (filteredCategories.length === 0) {

    return (

      <div className="budget-pie-card">

        <h2>Budget Distribution</h2>

        <div className="budget-chart-empty">

          <h3>📊 No Expense Data</h3>

          <p>

            Add some expenses to view the
            category-wise distribution.

          </p>

        </div>

      </div>

    );

  }

  const data = {

    labels: filteredCategories.map(
      (item) => item.category
    ),

    datasets: [

      {

        data: filteredCategories.map(
          (item) => item.spent
        ),

        backgroundColor: [

          "#2563eb",
          "#7c3aed",
          "#22c55e",
          "#f59e0b",
          "#ef4444",
          "#06b6d4",
          "#ec4899",
          "#14b8a6",
          "#8b5cf6",
          "#f97316",

        ],

        borderColor: "#ffffff",

        borderWidth: 2,

      },

    ],

  };

  const options = {

    responsive: true,

    maintainAspectRatio: false,

    plugins: {

      legend: {

        position: "bottom",

        labels: {

          boxWidth: 14,

          padding: 18,

          font: {

            size: 13,

          },

        },

      },

    },

  };

  return (

    <div className="budget-pie-card">

      <h2>

        Budget Distribution

      </h2>

      <div className="budget-chart-container">

        <Pie

          data={data}

          options={options}

        />

      </div>

    </div>

  );

}

export default BudgetDistributionChart;