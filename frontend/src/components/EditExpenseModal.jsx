import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import {
  FaEdit,
  FaWallet,
  FaTag,
  FaRupeeSign,
  FaTimes,
  FaSave,
  FaChevronDown,
  FaMoneyBillWave,
  FaCoins,
  FaCalendarAlt,
  FaUniversity,
  FaExchangeAlt,
  FaStickyNote,
  FaUser,
} from "react-icons/fa";

import API from "../services/api";
import "./styles/editExpenseModal.css";

function EditExpenseModal({
  isOpen,
  onClose,
  expense,
  onUpdate,
}) {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    amount: "",
    type: "Expense",
    account: "",
    transferTo: "",
    transferAccount: "",
    transferMode: "person",
    notes: "",
    date: new Date(),
  });

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] =
    useState(false);
  const [destinationDropdownOpen, setDestinationDropdownOpen] =
    useState(false);

  const accountDropdownRef = useRef(null);
  const destinationDropdownRef = useRef(null);

  useEffect(() => {
    if (!expense) return;

    const accountId =
      typeof expense.account === "object"
        ? expense.account?._id || ""
        : expense.account || "";

    setFormData({
      title: expense.title || "",
      category:
        expense.type === "Transfer"
          ? ""
          : expense.category || "",
      amount: expense.amount || "",
      type: expense.type || "Expense",
      account: accountId,
      transferTo:
        expense.transferTo ||
        expense.toAccount ||
        expense.recipient ||
        "",
      transferAccount:
        expense.transferAccount ||
        "",
      transferMode:
        expense.transferMode ||
        (expense.transferAccount ? "account" : "person"),
      notes:
        expense.notes ||
        expense.note ||
        "",
      date: expense.date
        ? new Date(expense.date)
        : new Date(),
    });
  }, [expense]);

  useEffect(() => {
    if (isOpen) {
      loadAccounts();
    }
  }, [isOpen]);

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

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [isOpen, loading, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        originalOverflow;
    };
  }, [isOpen]);

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
    } catch (error) {
      console.error(
        "Failed to load accounts:",
        error
      );

      setAccounts([]);
    } finally {
      setAccountsLoading(false);
    }
  };

  const detectCategory = (title, type) => {
    if (type === "Transfer") {
      return "";
    }

    const text = title.toLowerCase().trim();

    if (type === "Income") {
      if (
        text.includes("salary") ||
        text.includes("wage") ||
        text.includes("payroll")
      ) {
        return "Salary";
      }

      if (
        text.includes("freelance") ||
        text.includes("freelancing")
      ) {
        return "Freelance";
      }

      if (
        text.includes("bonus") ||
        text.includes("incentive")
      ) {
        return "Bonus";
      }

      if (text.includes("interest")) {
        return "Interest";
      }

      return "Other";
    }

    const categories = {
      Food: [
        "pizza",
        "food",
        "lunch",
        "dinner",
        "breakfast",
        "coffee",
        "tea",
        "restaurant",
        "swiggy",
        "zomato",
      ],
      Transport: [
        "uber",
        "ola",
        "bus",
        "fuel",
        "petrol",
        "diesel",
        "metro",
        "cab",
        "taxi",
      ],
      Shopping: [
        "amazon",
        "flipkart",
        "shopping",
        "shoe",
        "shirt",
        "dress",
        "bag",
      ],
      Bills: [
        "electricity",
        "wifi",
        "internet",
        "bill",
        "gas",
        "recharge",
      ],
      Education: [
        "book",
        "books",
        "college",
        "course",
        "school",
        "fees",
      ],
      Entertainment: [
        "movie",
        "netflix",
        "spotify",
        "game",
        "gaming",
      ],
      Healthcare: [
        "hospital",
        "doctor",
        "medicine",
        "medical",
        "pharmacy",
        "insurance",
      ],
      Groceries: [
        "grocery",
        "groceries",
        "vegetables",
        "vegetable",
        "milk",
      ],
      Rent: [
        "rent",
        "house rent",
      ],
      Travel: [
        "travel",
        "trip",
        "flight",
        "hotel",
      ],
    };

    for (const key in categories) {
      if (
        categories[key].some((word) =>
          text.includes(word)
        )
      ) {
        return key;
      }
    }

    return "Other";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      if (
        name === "title" &&
        prev.type !== "Transfer"
      ) {
        updated.category = detectCategory(
          value,
          prev.type
        );
      }

      return updated;
    });
  };

  const selectType = (type) => {
    setFormData((prev) => ({
      ...prev,
      type,
      category:
        type === "Transfer"
          ? ""
          : detectCategory(
              prev.title,
              type
            ),
      title:
        type === "Transfer"
          ? ""
          : prev.title,
      transferTo:
        type === "Transfer"
          ? prev.transferTo
          : "",
      transferAccount:
        type === "Transfer"
          ? prev.transferAccount
          : "",
      transferMode:
        type === "Transfer"
          ? prev.transferMode
          : "person",
    }));

    setAccountDropdownOpen(false);
  };

  const selectAccount = (account) => {
    setFormData((prev) => ({
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
    if (account._id === formData.account) {
      toast.error("From Account and To Account cannot be the same.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      transferAccount: account._id,
      transferTo: account.name,
    }));

    setDestinationDropdownOpen(false);
  };

  const handleTransferModeChange = (mode) => {
    setFormData((prev) => ({
      ...prev,
      transferMode: mode,
      transferAccount:
        mode === "account" ? prev.transferAccount : "",
      transferTo:
        mode === "person" ? prev.transferTo : "",
    }));

    setDestinationDropdownOpen(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!expense?._id) {
      toast.error("Transaction not found.");
      return;
    }

    if (!formData.account) {
      toast.error(
        formData.type === "Transfer"
          ? "Please select the From Account."
          : "Please select an account."
      );
      return;
    }

    if (
      !formData.amount ||
      Number(formData.amount) <= 0
    ) {
      toast.error("Please enter a valid amount.");
      return;
    }

    if (!formData.date) {
      toast.error(
        "Please select a transaction date."
      );
      return;
    }

    if (formData.type === "Transfer") {
      if (formData.transferMode === "account") {
        if (!formData.transferAccount) {
          toast.error("Please select the destination account.");
          return;
        }

        if (formData.transferAccount === formData.account) {
          toast.error("From Account and To Account cannot be the same.");
          return;
        }
      }

      if (formData.transferMode === "person") {
        if (!formData.transferTo.trim()) {
          toast.error("Please enter the person's name.");
          return;
        }

        if (formData.transferTo.trim().length > 100) {
          toast.error("Person name is too long.");
          return;
        }
      }
    } else {
      if (!formData.title.trim()) {
        toast.error(
          "Please enter a transaction title."
        );
        return;
      }

      if (!formData.category.trim()) {
        toast.error(
          "Please enter a category."
        );
        return;
      }
    }

    try {
      setLoading(true);

      const payload = {
        title:
          formData.type === "Transfer"
            ? "Transfer"
            : formData.title.trim(),
        category:
          formData.type === "Transfer"
            ? "Transfer"
            : formData.category.trim(),
        amount: Number(formData.amount),
        type: formData.type,
        account: formData.account,
        transferTo:
          formData.type === "Transfer" &&
          formData.transferMode === "person"
            ? formData.transferTo.trim()
            : "",
        transferAccount:
          formData.type === "Transfer" &&
          formData.transferMode === "account"
            ? formData.transferAccount
            : null,
        transferMode:
          formData.type === "Transfer"
            ? formData.transferMode
            : null,
        notes: formData.notes.trim(),
        date: formData.date,
      };

      const res = await API.put(
        `/expenses/${expense._id}`,
        payload
      );

      if (res.data?.expense) {
        onUpdate(res.data.expense);
      }

      toast.success(
        formData.type === "Transfer"
          ? "Transfer Updated Successfully!"
          : "Transaction Updated Successfully!"
      );

      setAccountDropdownOpen(false);
      setDestinationDropdownOpen(false);
      onClose();
    } catch (error) {
      console.error(
        "Update transaction error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to update transaction."
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedAccount = accounts.find(
    (account) =>
      account._id === formData.account
  );

  const selectedDestinationAccount = accounts.find(
    (account) =>
      account._id === formData.transferAccount
  );

  const renderCalendarHeader = ({
    date,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
  }) => {
    return (
      <div className="edit-calendar-header">
        <button
          type="button"
          className="edit-calendar-nav"
          onClick={decreaseMonth}
          disabled={prevMonthButtonDisabled}
          aria-label="Previous month"
        >
          ‹
        </button>

        <strong>
          {date.toLocaleString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </strong>

        <button
          type="button"
          className="edit-calendar-nav"
          onClick={increaseMonth}
          disabled={nextMonthButtonDisabled}
          aria-label="Next month"
        >
          ›
        </button>
      </div>
    );
  };

  const renderDatePicker = (label) => (
    <div className="edit-field-card">
      <label>{label}</label>

      <div className="edit-input-box edit-date-box">
        <FaCalendarAlt />

        <DatePicker
          selected={formData.date}
          onChange={(date) =>
            setFormData((prev) => ({
              ...prev,
              date,
            }))
          }
          dateFormat="MMM dd, yyyy"
          maxDate={new Date()}
          placeholderText="Select Date"
          className="edit-datepicker"
          popperClassName="edit-datepicker-popper"
          calendarClassName="edit-calendar"
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          renderCustomHeader={
            renderCalendarHeader
          }
          disabled={loading}
          popperPlacement="bottom-start"
        />
      </div>
    </div>
  );

  if (!isOpen || !expense) {
    return null;
  }

  const modalContent = (
    <div
      className="edit-modal-overlay"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !loading
        ) {
          onClose();
        }
      }}
    >
      <div
        className="edit-modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-transaction-title"
      >
        <div className="edit-modal-header">
          <div className="edit-modal-title">
            <span className="edit-title-icon">
              <FaEdit />
            </span>

            <h2 id="edit-transaction-title">
              Edit Transaction
            </h2>
          </div>

          <button
            type="button"
            className="edit-close-btn"
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        <div className="edit-modal-body">
          <div className="edit-type-tabs">
            <button
              type="button"
              className={
                formData.type === "Expense"
                  ? "edit-type-tab expense active"
                  : "edit-type-tab"
              }
              onClick={() =>
                selectType("Expense")
              }
              disabled={loading}
            >
              <FaMoneyBillWave />
              <span>Expense</span>
            </button>

            <button
              type="button"
              className={
                formData.type === "Income"
                  ? "edit-type-tab income active"
                  : "edit-type-tab"
              }
              onClick={() =>
                selectType("Income")
              }
              disabled={loading}
            >
              <FaCoins />
              <span>Income</span>
            </button>

            <button
              type="button"
              className={
                formData.type === "Transfer"
                  ? "edit-type-tab transfer active"
                  : "edit-type-tab"
              }
              onClick={() =>
                selectType("Transfer")
              }
              disabled={loading}
            >
              <FaExchangeAlt />
              <span>Transfer</span>
            </button>
          </div>

          {formData.type !== "Transfer" ? (
            <form
              className="edit-form"
              onSubmit={handleUpdate}
            >
              <div className="edit-field-card">
                <label>Transaction Title</label>

                <div className="edit-input-box">
                  <FaWallet />

                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Transaction Title"
                    autoComplete="off"
                    required
                  />
                </div>
              </div>

              <div className="edit-field-card">
                <label>Category</label>

                <div className="edit-input-box">
                  <FaTag />

                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="Category"
                    required
                  />
                </div>
              </div>

              <div className="edit-field-card">
                <label>Amount</label>

                <div className="edit-input-box">
                  <FaRupeeSign />

                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="₹0"
                    min="1"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="edit-two-column">
                <div
                  className="edit-field-card"
                  ref={accountDropdownRef}
                >
                  <label>Account</label>

                  <button
                    type="button"
                    className="edit-select-btn"
                    onClick={() =>
                      setAccountDropdownOpen(
                        (prev) => !prev
                      )
                    }
                    disabled={
                      accountsLoading ||
                      loading
                    }
                  >
                    <span>
                      <FaUniversity />

                      {selectedAccount
                        ? selectedAccount.name
                        : accountsLoading
                        ? "Loading Accounts..."
                        : "Select Account"}
                    </span>

                    <FaChevronDown
                      className={
                        accountDropdownOpen
                          ? "edit-chevron rotate"
                          : "edit-chevron"
                      }
                    />
                  </button>

                  {accountDropdownOpen && (
                    <div className="edit-account-menu">
                      {accounts.length === 0 ? (
                        <div className="edit-no-accounts">
                          No accounts available.
                        </div>
                      ) : (
                        accounts.map(
                          (account) => (
                            <button
                              type="button"
                              key={
                                account._id
                              }
                              className={
                                formData.account ===
                                account._id
                                  ? "edit-account-option active"
                                  : "edit-account-option"
                              }
                              onClick={() =>
                                selectAccount(
                                  account
                                )
                              }
                            >
                              <FaUniversity />

                              <span className="edit-account-info">
                                <strong>
                                  {
                                    account.name
                                  }
                                </strong>

                                <small>
                                  ₹
                                  {Number(
                                    account.balance ||
                                      0
                                  ).toLocaleString(
                                    "en-IN"
                                  )}
                                </small>
                              </span>
                            </button>
                          )
                        )
                      )}
                    </div>
                  )}
                </div>

                {renderDatePicker(
                  "Transaction Date"
                )}
              </div>

              <div className="edit-form-actions">
                <button
                  type="button"
                  className="edit-cancel-btn"
                  onClick={onClose}
                  disabled={loading}
                >
                  <FaTimes />
                  Cancel
                </button>

                <button
                  type="submit"
                  className="edit-save-btn"
                  disabled={loading}
                >
                  <FaSave />

                  {loading
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          ) : (
            <form
              className="edit-form transfer-form"
              onSubmit={handleUpdate}
            >
              <div className="edit-transfer-mode">
                <button
                  type="button"
                  className={
                    formData.transferMode === "person"
                      ? "edit-transfer-mode-btn active"
                      : "edit-transfer-mode-btn"
                  }
                  onClick={() => handleTransferModeChange("person")}
                  disabled={loading}
                >
                  <FaUser />
                  <span>To Person</span>
                </button>

                <button
                  type="button"
                  className={
                    formData.transferMode === "account"
                      ? "edit-transfer-mode-btn active"
                      : "edit-transfer-mode-btn"
                  }
                  onClick={() => handleTransferModeChange("account")}
                  disabled={loading}
                >
                  <FaUniversity />
                  <span>My Account</span>
                </button>
              </div>

              <div
                className="edit-field-card"
                ref={accountDropdownRef}
              >
                <label>From Account</label>

                <button
                  type="button"
                  className="edit-select-btn"
                  onClick={() =>
                    setAccountDropdownOpen(
                      (prev) => !prev
                    )
                  }
                  disabled={
                    accountsLoading ||
                    loading
                  }
                >
                  <span>
                    <FaUniversity />

                    {selectedAccount
                      ? selectedAccount.name
                      : accountsLoading
                      ? "Loading Accounts..."
                      : "Select Account"}
                  </span>

                  <FaChevronDown
                    className={
                      accountDropdownOpen
                        ? "edit-chevron rotate"
                        : "edit-chevron"
                    }
                  />
                </button>

                {accountDropdownOpen && (
                  <div className="edit-account-menu">
                    {accounts.length === 0 ? (
                      <div className="edit-no-accounts">
                        No accounts available.
                      </div>
                    ) : (
                      accounts.map(
                        (account) => (
                          <button
                            type="button"
                            key={
                              account._id
                            }
                            className={
                              formData.account ===
                              account._id
                                ? "edit-account-option active"
                                : "edit-account-option"
                            }
                            onClick={() =>
                              selectAccount(
                                account
                              )
                            }
                          >
                            <FaUniversity />

                            <span className="edit-account-info">
                              <strong>
                                {
                                  account.name
                                }
                              </strong>

                              <small>
                                ₹
                                {Number(
                                  account.balance ||
                                    0
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </small>
                            </span>
                          </button>
                        )
                      )
                    )}
                  </div>
                )}
              </div>

              <div className="edit-field-card">
                <label>Amount</label>

                <div className="edit-input-box">
                  <FaRupeeSign />

                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="₹0"
                    min="1"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              {formData.transferMode === "account" ? (
                <div
                  className="edit-field-card"
                  ref={destinationDropdownRef}
                >
                  <label>To Account</label>

                  <button
                    type="button"
                    className="edit-select-btn"
                    onClick={() =>
                      setDestinationDropdownOpen((prev) => !prev)
                    }
                    disabled={accountsLoading || loading}
                  >
                    <span>
                      <FaUniversity />
                      {selectedDestinationAccount
                        ? selectedDestinationAccount.name
                        : accountsLoading
                        ? "Loading Accounts..."
                        : "Select destination account"}
                    </span>

                    <FaChevronDown
                      className={
                        destinationDropdownOpen
                          ? "edit-chevron rotate"
                          : "edit-chevron"
                      }
                    />
                  </button>

                  {destinationDropdownOpen && (
                    <div className="edit-account-menu">
                      {accounts.filter((account) => account._id !== formData.account).length === 0 ? (
                        <div className="edit-no-accounts">
                          No other accounts available.
                        </div>
                      ) : (
                        accounts
                          .filter((account) => account._id !== formData.account)
                          .map((account) => (
                            <button
                              type="button"
                              key={account._id}
                              className={
                                formData.transferAccount === account._id
                                  ? "edit-account-option active"
                                  : "edit-account-option"
                              }
                              onClick={() => selectDestinationAccount(account)}
                            >
                              <FaUniversity />
                              <span className="edit-account-info">
                                <strong>{account.name}</strong>
                                <small>
                                  ₹{Number(account.balance || 0).toLocaleString("en-IN")}
                                </small>
                              </span>
                            </button>
                          ))
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="edit-field-card">
                  <label>To Person</label>

                  <div className="edit-input-box">
                    <FaUser />
                    <input
                      type="text"
                      name="transferTo"
                      value={formData.transferTo}
                      onChange={handleChange}
                      placeholder="Enter person's name..."
                      maxLength="100"
                      autoComplete="off"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="edit-transfer-bottom">
                <div className="edit-field-card">
                  <label>Note</label>

                  <div className="edit-input-box">
                    <FaStickyNote />

                    <input
                      type="text"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Optional reference..."
                      maxLength="300"
                      autoComplete="off"
                    />
                  </div>
                </div>

                {renderDatePicker(
                  "Transfer Date"
                )}
              </div>

              <div className="edit-form-actions">
                <button
                  type="button"
                  className="edit-cancel-btn"
                  onClick={onClose}
                  disabled={loading}
                >
                  <FaTimes />
                  Cancel
                </button>

                <button
                  type="submit"
                  className="edit-save-btn transfer-save-btn"
                  disabled={loading}
                >
                  <FaSave />

                  {loading
                    ? "Saving..."
                    : "Save Transfer"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(
    modalContent,
    document.body
  );
}

export default EditExpenseModal;