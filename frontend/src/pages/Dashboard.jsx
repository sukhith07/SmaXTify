import { useEffect, useState } from "react";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

import Summary from "../components/Summary";
import AddExpense from "../components/AddExpense";
import ExpenseChart from "../components/ExpenseChart";
import MonthlyChart from "../components/MonthlyChart";
import ExpenseList from "../components/ExpenseList";

import AIAdvisorModal from "../components/AIAdvisorModal";

import API from "../services/api";

import "../components/styles/dashboard.css";

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [showAI, setShowAI] = useState(false);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const res = await API.get("/expenses");

      setExpenses(
        res.data.expenses || res.data
      );
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="dashboard-content">
        <Navbar
          openAI={() => setShowAI(true)}
        />

        <div className="dashboard-main">
          <Summary expenses={expenses} />

          <div className="dashboard-row">
            <div className="left-panel">
              <AddExpense
                expenses={expenses}
                setExpenses={setExpenses}
              />
            </div>

            <div className="right-panel">
              <ExpenseChart
                expenses={expenses}
              />
            </div>
          </div>

          <MonthlyChart
            expenses={expenses}
          />

          <div className="budget-section"></div>

          <ExpenseList
            expenses={expenses}
            setExpenses={setExpenses}
          />
        </div>
      </div>

      <AIAdvisorModal
        isOpen={showAI}
        onClose={() => setShowAI(false)}
        expenses={expenses}
      />
    </div>
  );
}

export default Dashboard;