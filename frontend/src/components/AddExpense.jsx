import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
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
  FaExchangeAlt,
  FaStickyNote,
  FaArrowRight,
  FaExclamationCircle,
  FaPlus,
  FaUser,
} from "react-icons/fa";

import API from "../services/api";
import "./styles/addExpense.css";

function CalendarHeader({
  date,
  decreaseMonth,
  increaseMonth,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
}) {
  return (
    <div className="calendar-header">
      <button
        type="button"
        className="calendar-nav-btn"
        onClick={decreaseMonth}
        disabled={prevMonthButtonDisabled}
        aria-label="Previous month"
      >
        ‹
      </button>

      <div className="calendar-month-year">
        <span className="calendar-month">
          {date.toLocaleString("en-US", {
            month: "long",
          })}
        </span>

        <span className="calendar-year">
          {date.getFullYear()}
        </span>
      </div>

      <button
        type="button"
        className="calendar-nav-btn"
        onClick={increaseMonth}
        disabled={nextMonthButtonDisabled}
        aria-label="Next month"
      >
        ›
      </button>
    </div>
  );
}

function AddExpense({ expenses = [], setExpenses }) {
  const [expense, setExpense] = useState({
    title: "",
    category: "",
    amount: "",
    type: "Expense",
    account: "",
    toAccount: "",
    transferAccount: "",
    transferMode: "person",
    note: "",
    date: new Date(),
  });

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [accountsLoading, setAccountsLoading] = useState(true);

  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState("");

  const [accountDropdownOpen, setAccountDropdownOpen] =
    useState(false);

  const [destinationDropdownOpen, setDestinationDropdownOpen] =
    useState(false);

  const [calendarOpen, setCalendarOpen] = useState(false);

  const accountDropdownRef = useRef(null);
  const destinationDropdownRef = useRef(null);
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
        accountDropdownRef.current &&
        !accountDropdownRef.current.contains(event.target)
      ) {
        setAccountDropdownOpen(false);
      }

      if (
        destinationDropdownRef.current &&
        !destinationDropdownRef.current.contains(event.target)
      ) {
        setDestinationDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
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
        transferAccount: "",
      }));
    } finally {
      setAccountsLoading(false);
    }
  };

  const getLocalCategory = (title, type) => {
    const value = title.toLowerCase().trim();

    if (type === "Income") {
      if (
        value.includes("salary") ||
        value.includes("wage") ||
        value.includes("payroll")
      ) {
        return "Salary";
      }

      if (
        value.includes("freelance") ||
        value.includes("freelancing")
      ) {
        return "Freelance";
      }

      if (
        value.includes("bonus") ||
        value.includes("incentive")
      ) {
        return "Bonus";
      }

      if (value.includes("interest")) {
        return "Interest";
      }
    }

    if (
      value.includes("rent") ||
      value.includes("house rent")
    ) {
      return "Rent";
    }

    if (
      value.includes("food") ||
      value.includes("lunch") ||
      value.includes("dinner") ||
      value.includes("breakfast")
    ) {
      return "Food";
    }

    if (
      value.includes("grocery") ||
      value.includes("groceries")
    ) {
      return "Groceries";
    }

    if (
      value.includes("fuel") ||
      value.includes("petrol") ||
      value.includes("diesel")
    ) {
      return "Fuel";
    }

    if (
      value.includes("electricity") ||
      value.includes("water bill") ||
      value.includes("internet bill") ||
      value.includes("mobile bill")
    ) {
      return "Bills";
    }

    if (
      value.includes("shopping") ||
      value.includes("clothes") ||
      value.includes("clothing")
    ) {
      return "Shopping";
    }

    if (
      value.includes("medicine") ||
      value.includes("medical") ||
      value.includes("hospital")
    ) {
      return "Healthcare";
    }

    if (
      value.includes("travel") ||
      value.includes("trip") ||
      value.includes("flight") ||
      value.includes("hotel")
    ) {
      return "Travel";
    }

    if (
      value.includes("education") ||
      value.includes("college") ||
      value.includes("course") ||
      value.includes("books")
    ) {
      return "Education";
    }

    return "";
  };

  const detectCategory = async (
    title,
    type,
    requestId
  ) => {
    if (type === "Transfer") {
      setCategoryLoading(false);
      setCategoryError("");
      return;
    }

    try {
      const res = await API.post(
        "/ai/categorize",
        {
          title: title.trim(),
          type,
        }
      );

      if (
        requestId !==
        categoryRequestRef.current
      ) {
        return;
      }

      const aiCategory =
        typeof res.data?.category === "string"
          ? res.data.category.trim()
          : "";

      const localCategory =
        getLocalCategory(title, type);

      const finalCategory =
        localCategory ||
        (aiCategory &&
        aiCategory.toLowerCase() !== "other"
          ? aiCategory
          : aiCategory || "");

      if (!finalCategory) {
        throw new Error(
          "AI did not return a category."
        );
      }

      setExpense((prev) => ({
        ...prev,
        category: finalCategory,
      }));

      setCategoryError("");
    } catch (error) {
      if (
        requestId !==
        categoryRequestRef.current
      ) {
        return;
      }

      const localCategory =
        getLocalCategory(title, type);

      if (localCategory) {
        setExpense((prev) => ({
          ...prev,
          category: localCategory,
        }));

        setCategoryError("");
      } else {
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
            "AI category service was not found. Enter it manually."
          );
        } else {
          setCategoryError(
            "AI could not detect the category. Enter it manually."
          );
        }
      }
    } finally {
      if (
        requestId ===
        categoryRequestRef.current
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

    if (
      !title.trim() ||
      type === "Transfer"
    ) {
      setCategoryLoading(false);
      setCategoryError("");

      if (type !== "Transfer") {
        setExpense((prev) => ({
          ...prev,
          category: "",
        }));
      }

      return;
    }

    const localCategory =
      getLocalCategory(title, type);

    if (localCategory) {
      setCategoryLoading(false);
      setCategoryError("");

      setExpense((prev) => ({
        ...prev,
        category: localCategory,
      }));
    } else {
      setCategoryLoading(true);
      setCategoryError("");
    }

    categoryTimerRef.current =
      setTimeout(() => {
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

    setExpense((prev) => ({
      ...prev,
      type,
      title: "",
      category: "",
      toAccount:
        type === "Transfer"
          ? prev.toAccount
          : "",
      transferAccount:
        type === "Transfer"
          ? prev.transferAccount
          : "",
      transferMode:
        type === "Transfer"
          ? prev.transferMode
          : "person",
      note:
        type === "Transfer"
          ? prev.note
          : "",
    }));

    setCategoryLoading(false);
    setCategoryError("");
    setAccountDropdownOpen(false);
    setDestinationDropdownOpen(false);
    setCalendarOpen(false);
  };

  const selectAccount = (account) => {
    setExpense((prev) => ({
      ...prev,
      account: account._id,
      transferAccount:
        prev.transferAccount === account._id
          ? ""
          : prev.transferAccount,
    }));

    setAccountDropdownOpen(false);
  };

  const selectDestinationAccount = (account) => {
    if (
      account._id ===
      expense.account
    ) {
      toast.error(
        "From Account and To Account cannot be the same."
      );
      return;
    }

    setExpense((prev) => ({
      ...prev,
      transferAccount: account._id,
      toAccount: account.name,
    }));

    setDestinationDropdownOpen(false);
  };

  const handleTransferModeChange = (mode) => {
    setExpense((prev) => ({
      ...prev,
      transferMode: mode,
      transferAccount:
        mode === "account"
          ? prev.transferAccount
          : "",
      toAccount:
        mode === "person"
          ? prev.toAccount
          : "",
    }));

    setDestinationDropdownOpen(false);
  };

  const handleAddAccount = () => {
    window.location.href = "/accounts";
  };

  const selectedAccount = accounts.find(
    (account) =>
      account._id === expense.account
  );

  const selectedDestinationAccount =
    accounts.find(
      (account) =>
        account._id ===
        expense.transferAccount
    );

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

    if (
      !expense.amount ||
      Number(expense.amount) <= 0
    ) {
      toast.error(
        "Please enter a valid amount."
      );
      return;
    }

    if (!expense.date) {
      toast.error(
        "Please select a transaction date."
      );
      return;
    }

    if (expense.type === "Transfer") {
      if (
        expense.transferMode ===
        "account"
      ) {
        if (!expense.transferAccount) {
          toast.error(
            "Please select the destination account."
          );
          return;
        }

        if (
          expense.transferAccount ===
          expense.account
        ) {
          toast.error(
            "From Account and To Account cannot be the same."
          );
          return;
        }
      }

      if (
        expense.transferMode ===
        "person"
      ) {
        if (!expense.toAccount.trim()) {
          toast.error(
            "Please enter the person's name."
          );
          return;
        }

        if (
          expense.toAccount.trim().length >
          100
        ) {
          toast.error(
            "Person name is too long."
          );
          return;
        }
      }
    } else {
      if (!expense.title.trim()) {
        toast.error(
          "Please enter a transaction title."
        );
        return;
      }

      if (categoryLoading) {
        toast.info(
          "Please wait while AI detects the category."
        );
        return;
      }

      let finalCategory =
        expense.category.trim();

      if (!finalCategory) {
        finalCategory =
          getLocalCategory(
            expense.title,
            expense.type
          );
      }

      if (!finalCategory) {
        toast.error(
          "Please enter a category."
        );
        return;
      }
    }

    try {
      setLoading(true);

      const payload =
        expense.type === "Transfer"
          ? {
              type: "Transfer",
              amount: Number(
                expense.amount
              ),
              account:
                expense.account,
              transferMode:
                expense.transferMode,
              transferAccount:
                expense.transferMode ===
                "account"
                  ? expense.transferAccount
                  : null,
              toAccount:
                expense.transferMode ===
                "person"
                  ? expense.toAccount.trim()
                  : "",
              notes:
                expense.note.trim(),
              date: expense.date,
            }
          : {
              title:
                expense.title.trim(),
              category:
                expense.category.trim(),
              amount: Number(
                expense.amount
              ),
              type:
                expense.type,
              account:
                expense.account,
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
        expense.type === "Transfer"
          ? "Transfer Added Successfully!"
          : "Transaction Added Successfully!"
      );

      if (categoryTimerRef.current) {
        clearTimeout(categoryTimerRef.current);
      }

      categoryRequestRef.current += 1;

      setExpense({
        title: "",
        category: "",
        amount: "",
        type: expense.type,
        account:
          accounts.length === 1
            ? accounts[0]._id
            : "",
        toAccount: "",
        transferAccount: "",
        transferMode:
          expense.type === "Transfer"
            ? expense.transferMode
            : "person",
        note: "",
        date: new Date(),
      });

      setCategoryLoading(false);
      setCategoryError("");
      setAccountDropdownOpen(false);
      setDestinationDropdownOpen(false);
      setCalendarOpen(false);

      await loadAccounts();
    } catch (error) {
      console.error(
        "Transaction error:",
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

  const hasAccounts =
    accounts.length > 0;

  const isTransfer =
    expense.type === "Transfer";

  const handleDateChange = (date) => {
    setExpense((prev) => ({
      ...prev,
      date,
    }));

    setCalendarOpen(false);
  };

  const formattedDate = expense.date
    ? expense.date.toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      )
    : "Select Date";

  return (
    <div
      className="expense-form"
      id="add-expense"
    >
      <h2>
        <FaPlusCircle />
        Add Transaction
      </h2>

      <div className="transaction-type-tabs">
        <button
          type="button"
          className={`transaction-type-tab ${
            expense.type === "Expense"
              ? "active expense"
              : ""
          }`}
          onClick={() =>
            selectType("Expense")
          }
          disabled={!hasAccounts}
        >
          <FaMoneyBillWave />
          Expense
        </button>

        <button
          type="button"
          className={`transaction-type-tab ${
            expense.type === "Income"
              ? "active income"
              : ""
          }`}
          onClick={() =>
            selectType("Income")
          }
          disabled={!hasAccounts}
        >
          <FaCoins />
          Income
        </button>

        <button
          type="button"
          className={`transaction-type-tab ${
            expense.type === "Transfer"
              ? "active transfer"
              : ""
          }`}
          onClick={() =>
            selectType("Transfer")
          }
          disabled={!hasAccounts}
        >
          <FaExchangeAlt />
          Transfer
        </button>
      </div>

      {calendarOpen && hasAccounts && (
        <div className="inline-calendar-container">
          <DatePicker
            inline
            selected={expense.date}
            onChange={handleDateChange}
            maxDate={new Date()}
            calendarClassName="custom-calendar"
            renderCustomHeader={CalendarHeader}
          />
        </div>
      )}

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
              Please wait while your
              accounts are being loaded.
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
              Please add an account
              before creating a
              transaction.
            </p>

            <button
              type="button"
              className="account-action-btn"
              onClick={
                handleAddAccount
              }
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
          {!calendarOpen && !isTransfer && (
            <>
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
                    value={
                      expense.title
                    }
                    onChange={
                      handleTitleChange
                    }
                    autoComplete="off"
                    disabled={
                      !hasAccounts
                    }
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
                    value={
                      expense.category
                    }
                    onChange={
                      handleCategoryChange
                    }
                    placeholder={
                      categoryLoading
                        ? "AI detecting category..."
                        : "AI Auto Detect"
                    }
                    disabled={
                      !hasAccounts
                    }
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
                    value={
                      expense.amount
                    }
                    onChange={
                      handleChange
                    }
                    min="1"
                    step="0.01"
                    disabled={
                      !hasAccounts
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-two-column">
                <div
                  className="custom-select account-field"
                  ref={
                    accountDropdownRef
                  }
                >
                  <label>
                    Account
                  </label>

                  <button
                    type="button"
                    className="select-btn"
                    disabled={
                      !hasAccounts
                    }
                    onClick={() =>
                      setAccountDropdownOpen(
                        (prev) =>
                          !prev
                      )
                    }
                  >
                    <span className="selected-item">
                      <FaUniversity />

                      <span className="selected-account-name">
                        {selectedAccount
                          ? selectedAccount.name
                          : "Select Account"}
                      </span>
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
                    <div className="select-menu">
                      {accounts.map(
                        (account) => (
                          <div
                            key={
                              account._id
                            }
                            className={
                              expense.account ===
                              account._id
                                ? "select-option active"
                                : "select-option"
                            }
                            onClick={() =>
                              selectAccount(
                                account
                              )
                            }
                          >
                            <FaUniversity />

                            <span>
                              {
                                account.name
                              }
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>

                <div className="field date-field">
                  <label>
                    Transaction Date
                  </label>

                  <button
                    type="button"
                    className="input-box date-input-box date-button"
                    onClick={() =>
                      setCalendarOpen(
                        true
                      )
                    }
                    disabled={
                      !hasAccounts
                    }
                  >
                    <FaCalendarAlt />

                    <span>
                      {formattedDate}
                    </span>
                  </button>
                </div>
              </div>
            </>
          )}

          {!calendarOpen && isTransfer && (
            <>
              <div className="transfer-mode-switch">
                <button
                  type="button"
                  className={
                    expense.transferMode ===
                    "account"
                      ? "transfer-mode-btn active"
                      : "transfer-mode-btn"
                  }
                  onClick={() =>
                    handleTransferModeChange(
                      "account"
                    )
                  }
                  disabled={loading}
                >
                  <FaUniversity />
                  My Account
                </button>

                <button
                  type="button"
                  className={
                    expense.transferMode ===
                    "person"
                      ? "transfer-mode-btn active"
                      : "transfer-mode-btn"
                  }
                  onClick={() =>
                    handleTransferModeChange(
                      "person"
                    )
                  }
                  disabled={loading}
                >
                  <FaUser />
                  Person
                </button>
              </div>

              <div className="transfer-mode-description">
                {expense.transferMode ===
                "account"
                  ? "Transfer money between your own accounts."
                  : "Send money from your account to another person."}
              </div>

              <div className="field">
                <label>
                  From Account
                </label>

                <div
                  className="custom-select"
                  ref={
                    accountDropdownRef
                  }
                >
                  <button
                    type="button"
                    className="select-btn"
                    disabled={
                      !hasAccounts
                    }
                    onClick={() =>
                      setAccountDropdownOpen(
                        (prev) =>
                          !prev
                      )
                    }
                  >
                    <span className="selected-item">
                      <FaUniversity />

                      <span className="selected-account-name">
                        {selectedAccount
                          ? selectedAccount.name
                          : "Select Account"}
                      </span>
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
                    <div className="select-menu">
                      {accounts.map(
                        (account) => (
                          <div
                            key={
                              account._id
                            }
                            className={
                              expense.account ===
                              account._id
                                ? "select-option active"
                                : "select-option"
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
                                {
                                  account.name
                                }
                              </strong>

                              <span>
                                ₹
                                {Number(
                                  account.balance ||
                                    0
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
                  Amount
                </label>

                <div className="input-box">
                  <FaRupeeSign />

                  <input
                    type="number"
                    name="amount"
                    placeholder="₹0"
                    value={
                      expense.amount
                    }
                    onChange={
                      handleChange
                    }
                    min="1"
                    step="0.01"
                    disabled={
                      !hasAccounts
                    }
                    required
                  />
                </div>
              </div>

              {expense.transferMode ===
              "account" ? (
                <div
                  className={`custom-select destination-select ${
                    destinationDropdownOpen
                      ? "dropdown-open"
                      : ""
                  }`}
                  ref={
                    destinationDropdownRef
                  }
                >
                  <label>
                    To Account
                  </label>

                  <button
                    type="button"
                    className="select-btn"
                    disabled={
                      !hasAccounts
                    }
                    onClick={() =>
                      setDestinationDropdownOpen(
                        (prev) =>
                          !prev
                      )
                    }
                  >
                    <span className="selected-item">
                      <FaArrowRight />

                      <span className="selected-account-name">
                        {selectedDestinationAccount
                          ? selectedDestinationAccount.name
                          : "Select destination account"}
                      </span>
                    </span>

                    <FaChevronDown
                      className={
                        destinationDropdownOpen
                          ? "rotate"
                          : ""
                      }
                    />
                  </button>

                  {destinationDropdownOpen && (
                    <div className="select-menu">
                      {accounts
                        .filter(
                          (account) =>
                            account._id !==
                            expense.account
                        )
                        .map(
                          (account) => (
                            <div
                              key={
                                account._id
                              }
                              className={
                                expense.transferAccount ===
                                account._id
                                  ? "select-option active"
                                  : "select-option"
                              }
                              onClick={() =>
                                selectDestinationAccount(
                                  account
                                )
                              }
                            >
                              <FaUniversity />

                              <div className="account-option-content">
                                <strong>
                                  {
                                    account.name
                                  }
                                </strong>

                                <span>
                                  ₹
                                  {Number(
                                    account.balance ||
                                      0
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
              ) : (
                <div className="field">
                  <label>
                    Person Name
                  </label>

                  <div className="input-box">
                    <FaUser />

                    <input
                      type="text"
                      name="toAccount"
                      placeholder="Enter person's name..."
                      value={
                        expense.toAccount
                      }
                      onChange={
                        handleChange
                      }
                      autoComplete="off"
                      maxLength="100"
                      disabled={
                        !hasAccounts
                      }
                      required
                    />
                  </div>
                </div>
              )}

              <div className="transfer-note-date-row">
                <div className="field">
                  <label>
                    Note
                  </label>

                  <div className="input-box">
                    <FaStickyNote />

                    <input
                      type="text"
                      name="note"
                      placeholder="Optional reference..."
                      value={
                        expense.note
                      }
                      onChange={
                        handleChange
                      }
                      autoComplete="off"
                      disabled={
                        !hasAccounts
                      }
                    />
                  </div>
                </div>

                <div className="field date-field">
                  <label>
                    Transfer Date
                  </label>

                  <button
                    type="button"
                    className="input-box date-input-box date-button"
                    onClick={() =>
                      setCalendarOpen(
                        true
                      )
                    }
                    disabled={
                      !hasAccounts
                    }
                  >
                    <FaCalendarAlt />

                    <span>
                      {formattedDate}
                    </span>
                  </button>
                </div>
              </div>
            </>
          )}

          <button
            className={`add-btn ${
              isTransfer
                ? "transfer-btn"
                : expense.type ===
                  "Income"
                ? "income-btn"
                : "expense-btn"
            }`}
            type="submit"
            disabled={
              !hasAccounts ||
              loading ||
              categoryLoading ||
              calendarOpen
            }
          >
            {isTransfer ? (
              <FaExchangeAlt />
            ) : (
              <FaPlusCircle />
            )}

            {loading
              ? "Adding..."
              : categoryLoading
              ? "Detecting Category..."
              : isTransfer
              ? "Add Transfer"
              : expense.type ===
                "Income"
              ? "Add Income"
              : "Add Expense"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddExpense;