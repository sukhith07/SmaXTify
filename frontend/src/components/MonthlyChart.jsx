import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

import "./styles/monthlyChart.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

function MonthlyChart({ expenses = [] }) {

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const incomeData = new Array(12).fill(0);
  const expenseData = new Array(12).fill(0);

  expenses.forEach((item) => {

    const month = new Date(item.date).getMonth();

    if (item.type === "Income") {
      incomeData[month] += Number(item.amount);
    } else {
      expenseData[month] += Number(item.amount);
    }

  });

  const data = {

    labels: months,

    datasets: [

      {
        label: "Income",

        data: incomeData,

        backgroundColor: "#10b981",

        borderRadius: 10,

        borderSkipped: false,

      },

      {

        label: "Expense",

        data: expenseData,

        backgroundColor: "#ef4444",

        borderRadius: 10,

        borderSkipped: false,

      },

    ],

  };

  const options = {

    responsive: true,

    maintainAspectRatio: false,

    plugins: {

      legend: {

        position: "top",

        labels: {

          usePointStyle: true,

          pointStyle: "circle",

          padding: 20,

        },

      },

    },

    scales: {

      y: {

        beginAtZero: true,

        grid: {

          color: "#e5e7eb",

        },

      },

      x: {

        grid: {

          display: false,

        },

      },

    },

  };

  return (

    <div className="monthly-chart-card">

      <h2>Monthly Analytics</h2>

      <div className="monthly-chart">

        <Bar
          data={data}
          options={options}
        />

      </div>

    </div>

  );

}

export default MonthlyChart;