import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import { toast } from "react-toastify";

import API from "../services/api";
import EditExpenseModal from "./EditExpenseModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import "./styles/expenseList.css";

function ExpenseList({ expenses, setExpenses }) {

  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const [showDelete, setShowDelete] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  useEffect(() => {

    const keyword = search.toLowerCase();

    const filtered = expenses.filter((item) => {

      const title = item.title?.toLowerCase() || "";
      const category = item.category?.toLowerCase() || "";

      return (
        title.includes(keyword) ||
        category.includes(keyword)
      );

    });

    setFilteredExpenses(filtered);
    setLoading(false);

  }, [expenses, search]);

  const openEdit = (expense) => {

    setSelectedExpense(expense);
    setShowModal(true);

  };

  const updateExpense = (updatedExpense) => {

    const updated = expenses.map((item) =>
      item._id === updatedExpense._id
        ? updatedExpense
        : item
    );

    setExpenses(updated);

  };

  const deleteExpense = async () => {

    if (!deleteItem) return;

    try {

      await API.delete(`/expenses/${deleteItem._id}`);

      const updated = expenses.filter(
        (item) => item._id !== deleteItem._id
      );

      setExpenses(updated);

      toast.success("Transaction Deleted Successfully!");

      setShowDelete(false);
      setDeleteItem(null);

    } catch (err) {

      console.log(err);

      toast.error(
        err.response?.data?.message ||
        "Delete Failed"
      );

    }

  };

  return (

    <motion.div
      className="transaction-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
            <div className="transaction-header">

        <div>
          <h2>Recent Transactions</h2>
          <p>{filteredExpenses.length} Transaction(s)</p>
        </div>

        <div className="search-wrapper">

          <FaSearch className="search-icon" />

          <input
            className="search-box"
            type="text"
            placeholder="Search by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

      </div>

      <div className="table-wrapper">

        <table className="expense-table">

          <thead>

            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Date</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>

          </thead>

          <tbody>

            {loading ? (

              <tr>

                <td
                  colSpan="6"
                  className="no-data"
                >
                  Loading...
                </td>

              </tr>

            ) : filteredExpenses.length === 0 ? (

              <tr>

                <td
                  colSpan="6"
                  className="no-data"
                >
                  No Transactions Found
                </td>

              </tr>

            ) : (

              filteredExpenses.map((item, index) => (

                <motion.tr
                  key={item._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: index * 0.05,
                  }}
                >

                  <td>
                    <strong>{item.title}</strong>
                  </td>

                  <td>{item.category}</td>

                  <td>
                    {item.date
                      ? new Date(item.date).toLocaleDateString("en-IN")
                      : "-"}
                  </td>

                  <td>

                    <span
                      className={
                        item.type === "Income"
                          ? "income-badge"
                          : "expense-badge"
                      }
                    >

                      {item.type === "Income" ? (
                        <FaArrowUp />
                      ) : (
                        <FaArrowDown />
                      )}

                      <span style={{ marginLeft: "6px" }}>
                        {item.type}
                      </span>

                    </span>

                  </td>

                  <td
                    className={
                      item.type === "Income"
                        ? "income-text"
                        : "expense-text"
                    }
                  >
                    {item.type === "Income" ? "+" : "-"}
                    ₹{Number(item.amount).toLocaleString()}
                  </td>

                  <td>

                    <div className="action-buttons">

                      <button
                        className="edit-btn"
                        title="Edit"
                        onClick={() => openEdit(item)}
                      >
                        <FaEdit />
                      </button>

                      <button
                        className="delete-btn"
                        title="Delete"
                        onClick={() => {
                          setDeleteItem(item);
                          setShowDelete(true);
                        }}
                      >
                        <FaTrash />
                      </button>

                    </div>

                  </td>

                </motion.tr>

              ))

            )}

          </tbody>

        </table>

      </div>

      {showModal && selectedExpense && (

        <EditExpenseModal
          isOpen={showModal}
          expense={selectedExpense}
          onClose={() => {
            setShowModal(false);
            setSelectedExpense(null);
          }}
          onUpdate={updateExpense}
        />

      )}

      <DeleteConfirmModal
        isOpen={showDelete}
        title={deleteItem?.title}
        onClose={() => {
          setShowDelete(false);
          setDeleteItem(null);
        }}
        onConfirm={deleteExpense}
      />

    </motion.div>

  );

}

export default ExpenseList;