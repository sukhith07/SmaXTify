import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import {
  FaWallet,
  FaTag,
  FaRupeeSign,
  FaPlusCircle,
  FaChevronDown,
  FaMoneyBillWave,
  FaCoins,
  FaCalendarAlt,
  FaUniversity,
  FaPlus,
  FaExclamationCircle,
} from "react-icons/fa";

import API from "../services/api";
import "./styles/addExpense.css";

function AddExpense({
  expenses = [],
  setExpenses,
}) {
  const navigate = useNavigate();

  const [expense, setExpense] = useState({
    title: "",
    category: "",
    amount: "",
    type: "Expense",
    account: "",
    date: new Date(),
  });

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [accountsLoading, setAccountsLoading] = useState(true);

  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState("");

  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  const typeDropdownRef = useRef(null);
  const accountDropdownRef = useRef(null);

  const categoryTimerRef = useRef(null);
  const categoryRequestRef = useRef(0);

  useEffect(() => {
    loadAccounts();

    return () => {
      if (categoryTimerRef.current) {
        clearTimeout(categoryTimerRef.current);
      }

      categoryRequestRef.current += 1;
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        typeDropdownRef.current &&
        !typeDropdownRef.current.contains(event.target)
      ) {
        setTypeDropdownOpen(false);
      }

      if (
        accountDropdownRef.current &&
        !accountDropdownRef.current.contains(event.target)
      ) {
        setAccountDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const loadAccounts = async () => {
    try {
      setAccountsLoading(true);

      const res = await API.get("/accounts");

      const accountList = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.accounts)
        ? res.data.accounts
        : [];

      setAccounts(accountList);

      setExpense((prev) => {
        const currentAccountExists =
          prev.account &&
          accountList.some(
            (account) => account._id === prev.account
          );

        if (currentAccountExists) {
          return prev;
        }

        if (accountList.length === 1) {
          return {
            ...prev,
            account: accountList[0]._id,
          };
        }

        return {
          ...prev,
          account: "",
        };
      });
    } catch (error) {
      console.error("Failed to load accounts:", error);

      setAccounts([]);

      setExpense((prev) => ({
        ...prev,
        account: "",
      }));
    } finally {
      setAccountsLoading(false);
    }
  };

  const detectCategory = async (
    title,
    type,
    requestId
  ) => {
    try {
      const res = await API.post("/ai/categorize", {
        title: title.trim(),
        type,
      });

      if (
        requestId !== categoryRequestRef.current
      ) {
        return;
      }

      const category =
        res.data?.category?.trim();

      if (!category) {
        throw new Error(
          "AI did not return a category."
        );
      }

      setExpense((prev) => ({
        ...prev,
        category,
      }));

      setCategoryError("");
    } catch (error) {
      if (
        requestId !== categoryRequestRef.current
      ) {
        return;
      }

      console.error(
        "AI category detection failed:",
        error
      );

      setExpense((prev) => ({
        ...prev,
        category: "",
      }));

      const status =
        error.response?.status;

      if (status === 429) {
        setCategoryError(
          "AI request limit reached. Enter the category manually."
        );
      } else if (status === 503) {
        setCategoryError(
          "AI service is temporarily unavailable. Enter the category manually."
        );
      } else if (status === 404) {
        setCategoryError(
          "AI category service was not found. Enter the category manually."
        );
      } else {
        setCategoryError(
          "AI could not detect the category. Enter it manually."
        );
      }
    } finally {
      if (
        requestId === categoryRequestRef.current
      ) {
        setCategoryLoading(false);
      }
    }
  };

  const scheduleCategoryDetection = (
    title,
    type
  ) => {
    if (categoryTimerRef.current) {
      clearTimeout(categoryTimerRef.current);
    }

    const requestId =
      ++categoryRequestRef.current;

    if (!title.trim()) {
      setCategoryLoading(false);
      setCategoryError("");

      setExpense((prev) => ({
        ...prev,
        category: "",
      }));

      return;
    }

    setCategoryLoading(true);
    setCategoryError("");

    categoryTimerRef.current = setTimeout(() => {
      detectCategory(
        title,
        type,
        requestId
      );
    }, 1500);
  };

  const handleTitleChange = (e) => {
    const value = e.target.value;

    setExpense((prev) => ({
      ...prev,
      title: value,
      category: "",
    }));

    scheduleCategoryDetection(
      value,
      expense.type
    );
  };

  const handleCategoryChange = (e) => {
    setExpense((prev) => ({
      ...prev,
      category: e.target.value,
    }));

    setCategoryError("");
  };

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setExpense((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const selectType = (type) => {
    if (categoryTimerRef.current) {
      clearTimeout(categoryTimerRef.current);
    }

    categoryRequestRef.current += 1;

    const title =
      expense.title.trim();

    setExpense((prev) => ({
      ...prev,
      type,
      category: "",
    }));

    setTypeDropdownOpen(false);
    setCategoryError("");

    if (title) {
      scheduleCategoryDetection(
        title,
        type
      );
    }
  };

  const selectAccount = (account) => {
    setExpense((prev) => ({
      ...prev,
      account: account._id,
    }));

    setAccountDropdownOpen(false);
  };

  const handleAddAccount = () => {
    navigate("/accounts");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (accounts.length === 0) {
      toast.error(
        "Please add an account before creating a transaction."
      );
      return;
    }

    if (!expense.account) {
      toast.error(
        "Please select an account."
      );
      return;
    }

    if (!expense.title.trim()) {
      toast.error(
        "Please enter a transaction title."
      );
      return;
    }

    if (
      !expense.amount ||
      Number(expense.amount) <= 0
    ) {
      toast.error(
        "Please enter a valid amount."
      );
      return;
    }

    if (categoryLoading) {
      toast.info(
        "Please wait while AI detects the category."
      );
      return;
    }

    if (!expense.category.trim()) {
      toast.error(
        "Please enter a category."
      );
      return;
    }

    if (!expense.date) {
      toast.error(
        "Please select a transaction date."
      );
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: expense.title.trim(),
        category: expense.category.trim(),
        amount: Number(expense.amount),
        type: expense.type,
        account: expense.account,
        date: expense.date,
      };

      const res = await API.post(
        "/expenses",
        payload
      );

      if (res.data?.expense) {
        setExpenses((prev) => [
          ...prev,
          res.data.expense,
        ]);
      }

      toast.success(
        "Transaction Added Successfully!"
      );

      if (categoryTimerRef.current) {
        clearTimeout(
          categoryTimerRef.current
        );
      }

      categoryRequestRef.current += 1;

      setExpense({
        title: "",
        category: "",
        amount: "",
        type: "Expense",
        account:
          accounts.length === 1
            ? accounts[0]._id
            : "",
        date: new Date(),
      });

      setCategoryLoading(false);
      setCategoryError("");
      setTypeDropdownOpen(false);
      setAccountDropdownOpen(false);

      await loadAccounts();
    } catch (error) {
      console.error(
        "Add transaction error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to add transaction."
      );
    } finally {
      setLoading(false);
    }
  };

  const currentType =
    expense.type === "Income"
      ? {
          icon: <FaCoins />,
          text: "Income",
        }
      : {
          icon: <FaMoneyBillWave />,
          text: "Expense",
        };

  const selectedAccount =
    accounts.find(
      (account) =>
        account._id === expense.account
    );

  const hasAccounts =
    accounts.length > 0;

  return (
    <div
      className="expense-form"
      id="add-expense"
    >
      <h2>
        <FaPlusCircle />
        Add Transaction
      </h2>

      {accountsLoading ? (
        <div className="account-message loading-message">
          <div className="account-message-icon">
            <FaUniversity />
          </div>

          <div className="account-message-content">
            <strong>
              Loading Accounts
            </strong>

            <p>
              Please wait while your accounts
              are being loaded.
            </p>
          </div>
        </div>
      ) : !hasAccounts ? (
        <div className="account-message account-required">
          <div className="account-message-icon">
            <FaExclamationCircle />
          </div>

          <div className="account-message-content">
            <strong>
              Account Required
            </strong>

            <p>
              Please add an account before
              creating a transaction.
            </p>

            <button
              type="button"
              className="account-action-btn"
              onClick={handleAddAccount}
            >
              <FaPlus />
              Add Account
            </button>
          </div>
        </div>
      ) : null}

      <form onSubmit={handleSubmit}>
        <div
          className={
            !hasAccounts
              ? "transaction-fields disabled-fields"
              : "transaction-fields"
          }
        >
          <div className="field">
            <label>
              Transaction Title
            </label>

            <div className="input-box">
              <FaWallet />

              <input
                type="text"
                name="title"
                placeholder="Lunch, Salary..."
                value={expense.title}
                onChange={handleTitleChange}
                autoComplete="off"
                disabled={!hasAccounts}
                required
              />
            </div>
          </div>

          <div className="field">
            <label>
              Category
            </label>

            <div className="input-box">
              <FaTag />

              <input
                type="text"
                name="category"
                value={expense.category}
                onChange={handleCategoryChange}
                placeholder={
                  categoryLoading
                    ? "AI detecting category..."
                    : "AI Auto Detect"
                }
                disabled={!hasAccounts}
                required
              />
            </div>

            {categoryLoading && (
              <small className="category-status">
                AI is analyzing your
                transaction...
              </small>
            )}

            {!categoryLoading &&
              categoryError && (
                <small className="category-error">
                  {categoryError}
                </small>
              )}
          </div>

          <div className="field">
            <label>
              Amount
            </label>

            <div className="input-box">
              <FaRupeeSign />

              <input
                type="number"
                name="amount"
                placeholder="₹0"
                value={expense.amount}
                onChange={handleChange}
                min="1"
                step="0.01"
                disabled={!hasAccounts}
                required
              />
            </div>
          </div>

          <div className="transaction-selection-row">
            <div
              className="custom-select"
              ref={typeDropdownRef}
            >
              <label>
                Transaction Type
              </label>

              <button
                type="button"
                className="select-btn"
                disabled={!hasAccounts}
                onClick={() =>
                  setTypeDropdownOpen(
                    (prev) => !prev
                  )
                }
              >
                <span className="selected-item">
                  {currentType.icon}
                  {currentType.text}
                </span>

                <FaChevronDown
                  className={
                    typeDropdownOpen
                      ? "rotate"
                      : ""
                  }
                />
              </button>

              {typeDropdownOpen && (
                <div className="select-menu">
                  <div
                    className={
                      expense.type === "Expense"
                        ? "select-option active"
                        : "select-option"
                    }
                    onClick={() =>
                      selectType("Expense")
                    }
                  >
                    <FaMoneyBillWave />
                    Expense
                  </div>

                  <div
                    className={
                      expense.type === "Income"
                        ? "select-option active"
                        : "select-option"
                    }
                    onClick={() =>
                      selectType("Income")
                    }
                  >
                    <FaCoins />
                    Income
                  </div>
                </div>
              )}
            </div>

            <div
              className="custom-select"
              ref={accountDropdownRef}
            >
              <label>
                Account
              </label>

              <button
                type="button"
                className="select-btn"
                disabled={!hasAccounts}
                onClick={() =>
                  setAccountDropdownOpen(
                    (prev) => !prev
                  )
                }
              >
                <span className="selected-item">
                  <FaUniversity />

                  {selectedAccount
                    ? selectedAccount.name
                    : "Select Account"}
                </span>

                <FaChevronDown
                  className={
                    accountDropdownOpen
                      ? "rotate"
                      : ""
                  }
                />
              </button>

              {accountDropdownOpen && (
                <div className="select-menu account-menu">
                  {accounts.map(
                    (account) => (
                      <div
                        key={account._id}
                        className={
                          expense.account ===
                          account._id
                            ? "select-option account-option active"
                            : "select-option account-option"
                        }
                        onClick={() =>
                          selectAccount(
                            account
                          )
                        }
                      >
                        <FaUniversity />

                        <div className="account-option-content">
                          <strong>
                            {account.name}
                          </strong>

                          <span>
                            ₹
                            {Number(
                              account.balance || 0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="field">
            <label>
              Transaction Date
            </label>

            <div className="input-box date-input-box">
              <FaCalendarAlt />

              <DatePicker
                selected={expense.date}
                onChange={(date) =>
                  setExpense((prev) => ({
                    ...prev,
                    date,
                  }))
                }
                dateFormat="dd MMM yyyy"
                maxDate={new Date()}
                placeholderText="Select Date"
                className="expense-datepicker"
                disabled={!hasAccounts}
              />
            </div>
          </div>

          <button
            className="add-btn"
            type="submit"
            disabled={
              !hasAccounts ||
              loading ||
              categoryLoading
            }
          >
            <FaPlusCircle />

            {loading
              ? "Adding..."
              : categoryLoading
              ? "Detecting Category..."
              : "Add Transaction"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddExpense;