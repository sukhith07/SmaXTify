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
  const [accounts, setAccounts] = useState([]);
  const [showAI, setShowAI] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [expensesResponse, accountsResponse] =
        await Promise.all([
          API.get("/expenses"),
          API.get("/accounts"),
        ]);

      const expenseList =
        Array.isArray(expensesResponse.data)
          ? expensesResponse.data
          : Array.isArray(
              expensesResponse.data?.expenses
            )
          ? expensesResponse.data.expenses
          : [];

      const accountList =
        Array.isArray(accountsResponse.data)
          ? accountsResponse.data
          : Array.isArray(
              accountsResponse.data?.accounts
            )
          ? accountsResponse.data.accounts
          : [];

      setExpenses(expenseList);
      setAccounts(accountList);
    } catch (error) {
      console.error(
        "Failed to load dashboard data:",
        error
      );

      setExpenses([]);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const totalAccountBalance = accounts.reduce(
    (total, account) =>
      total + Number(account.balance || 0),
    0
  );

  const handleExpensesChange = (updatedExpenses) => {
    setExpenses(updatedExpenses);
    loadDashboardData();
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="dashboard-content">
        <Navbar
          openAI={() => setShowAI(true)}
        />

        <main className="dashboard-main">
          <Summary
            expenses={expenses}
            accounts={accounts}
            totalAccountBalance={
              totalAccountBalance
            }
          />

          <section className="dashboard-row">
            <div className="left-panel">
              <AddExpense
                expenses={expenses}
                setExpenses={
                  handleExpensesChange
                }
              />
            </div>

            <div className="right-panel">
              <ExpenseChart
                expenses={expenses}
              />
            </div>
          </section>

          <section className="monthly-section">
            <MonthlyChart
              expenses={expenses}
            />
          </section>

          <section className="transactions-section">
            <ExpenseList
              expenses={expenses}
              setExpenses={
                handleExpensesChange
              }
            />
          </section>
        </main>
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