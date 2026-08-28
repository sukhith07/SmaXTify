import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaArrowUp,
  FaArrowDown,
  FaUniversity,
} from "react-icons/fa";
import { toast } from "react-toastify";

import API from "../services/api";
import EditExpenseModal from "./EditExpenseModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import "./styles/expenseList.css";

function ExpenseList({ expenses = [], setExpenses }) {
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const [showDelete, setShowDelete] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const keyword = search.toLowerCase().trim();

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
    setExpenses((prev) =>
      prev.map((item) =>
        item._id === updatedExpense._id
          ? updatedExpense
          : item
      )
    );
  };

  const openDelete = (expense) => {
    setDeleteItem(expense);
    setShowDelete(true);
  };

  const closeDelete = () => {
    if (deleteLoading) return;

    setShowDelete(false);
    setDeleteItem(null);
  };

  const deleteExpense = async () => {
    if (!deleteItem?._id) {
      toast.error("Transaction not found.");
      return;
    }

    try {
      setDeleteLoading(true);

      await API.delete(
        `/expenses/${deleteItem._id}`
      );

      setExpenses((prev) =>
        prev.filter(
          (item) =>
            item._id !== deleteItem._id
        )
      );

      toast.success(
        "Transaction Deleted Successfully!"
      );

      setShowDelete(false);
      setDeleteItem(null);
    } catch (error) {
      console.error(
        "Delete transaction error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
        "Failed to delete transaction."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <motion.div
      className="transaction-card"
      initial={{
        opacity: 0,
        y: 30,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
      }}
    >
      <div className="transaction-header">
        <div>
          <h2>Recent Transactions</h2>
          <p>
            {filteredExpenses.length} Transaction(s)
          </p>
        </div>

        <div className="search-wrapper">
          <FaSearch className="search-icon" />

          <input
            className="search-box"
            type="text"
            placeholder="Search by title or category..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
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
              <th>Account</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="7"
                  className="no-data"
                >
                  Loading...
                </td>
              </tr>
            ) : filteredExpenses.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="no-data"
                >
                  No Transactions Found
                </td>
              </tr>
            ) : (
              filteredExpenses.map(
                (item, index) => (
                  <motion.tr
                    key={item._id}
                    initial={{
                      opacity: 0,
                      x: -20,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay: index * 0.05,
                    }}
                  >
                    <td>
                      <strong>
                        {item.title || "-"}
                      </strong>
                    </td>

                    <td>
                      {item.category || "-"}
                    </td>

                    <td>
                      {item.date
                        ? new Date(
                            item.date
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "-"}
                    </td>

                    <td>
                      <span className="account-cell">
                        <FaUniversity />

                        {item.account?.name ||
                          "No Account"}
                      </span>
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

                        {item.type}
                      </span>
                    </td>

                    <td
                      className={
                        item.type === "Income"
                          ? "income-text"
                          : "expense-text"
                      }
                    >
                      {item.type === "Income"
                        ? "+"
                        : "-"}
                      ₹
                      {Number(
                        item.amount || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="edit-btn"
                          title="Edit"
                          onClick={() =>
                            openEdit(item)
                          }
                        >
                          <FaEdit />
                        </button>

                        <button
                          type="button"
                          className="delete-btn"
                          title="Delete"
                          onClick={() =>
                            openDelete(item)
                          }
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )
              )
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
        onClose={closeDelete}
        onConfirm={deleteExpense}
        loading={deleteLoading}
      />
    </motion.div>
  );
}

export default ExpenseList;