import { useState, useEffect, useRef } from "react";
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
    date: new Date(),
  });

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [typeDropdownOpen, setTypeDropdownOpen] =
    useState(false);

  const [accountDropdownOpen, setAccountDropdownOpen] =
    useState(false);

  const typeDropdownRef = useRef(null);
  const accountDropdownRef = useRef(null);

  useEffect(() => {
    if (expense) {
      const accountId =
        typeof expense.account === "object"
          ? expense.account?._id
          : expense.account || "";

      setFormData({
        title: expense.title || "",
        category: expense.category || "",
        amount: expense.amount || "",
        type: expense.type || "Expense",
        account: accountId,
        date: expense.date
          ? new Date(expense.date)
          : new Date(),
      });
    }
  }, [expense]);

  useEffect(() => {
    if (isOpen) {
      loadAccounts();
    }
  }, [isOpen]);

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

  const loadAccounts = async () => {
    try {
      const res = await API.get("/accounts");

      const accountList = Array.isArray(res.data)
        ? res.data
        : res.data.accounts || [];

      setAccounts(accountList);
    } catch (error) {
      console.log(
        "Failed to load accounts:",
        error
      );
    }
  };

  if (!isOpen) return null;

  const detectCategory = (title, type) => {
    if (type === "Income") {
      return "Other";
    }

    const text = title.toLowerCase();

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

    let updated = {
      ...formData,
      [name]: value,
    };

    if (name === "title") {
      updated.category = detectCategory(
        value,
        formData.type
      );
    }

    setFormData(updated);
  };

  const selectType = (type) => {
    setFormData((prev) => ({
      ...prev,
      type,
      category: detectCategory(
        prev.title,
        type
      ),
    }));

    setTypeDropdownOpen(false);
  };

  const selectAccount = (account) => {
    setFormData((prev) => ({
      ...prev,
      account: account._id,
    }));

    setAccountDropdownOpen(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!formData.account) {
      toast.error("Please select an account.");
      return;
    }

    if (!formData.date) {
      toast.error(
        "Please select a transaction date."
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

    try {
      setLoading(true);

      const payload = {
        title: formData.title,
        category:
          formData.type === "Income"
            ? "Other"
            : formData.category,
        amount: Number(formData.amount),
        type: formData.type,
        account: formData.account,
        date: formData.date,
      };

      const res = await API.put(
        `/expenses/${expense._id}`,
        payload
      );

      onUpdate(res.data.expense);

      toast.success(
        "Transaction Updated Successfully!"
      );

      onClose();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Update Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const currentType =
    formData.type === "Income"
      ? {
          icon: <FaCoins />,
          text: "Income",
        }
      : {
          icon: <FaMoneyBillWave />,
          text: "Expense",
        };

  const selectedAccount = accounts.find(
    (account) =>
      account._id === formData.account
  );

  return (
    <div className="modal-overlay">
      <div className="edit-modal">
        <div className="modal-header">
          <FaEdit />
          <h2>Edit Transaction</h2>
        </div>

        <form onSubmit={handleUpdate}>
          <div className="modal-input">
            <FaWallet />

            <input
              type="text"
              name="title"
              placeholder="Transaction Title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="modal-input">
            <FaTag />

            <input
              type="text"
              name="category"
              placeholder="Category"
              value={formData.category}
              onChange={handleChange}
              required
            />
          </div>

          <div className="modal-input">
            <FaRupeeSign />

            <input
              type="number"
              name="amount"
              placeholder="Amount"
              value={formData.amount}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="edit-selection-row">
            <div
              className="custom-select"
              ref={typeDropdownRef}
            >
              <label>Transaction Type</label>

              <button
                type="button"
                className="select-btn"
                onClick={() =>
                  setTypeDropdownOpen(
                    !typeDropdownOpen
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
                      formData.type === "Expense"
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
                      formData.type === "Income"
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
              <label>Account</label>

              <button
                type="button"
                className="select-btn"
                onClick={() =>
                  setAccountDropdownOpen(
                    !accountDropdownOpen
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
                  {accounts.length === 0 ? (
                    <div className="no-accounts">
                      No accounts available.
                    </div>
                  ) : (
                    accounts.map((account) => (
                      <div
                        key={account._id}
                        className={
                          formData.account ===
                          account._id
                            ? "select-option active"
                            : "select-option"
                        }
                        onClick={() =>
                          selectAccount(account)
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
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="field">
            <label>Transaction Date</label>

            <div className="modal-input date-input-box">
              <FaCalendarAlt />

              <DatePicker
                selected={formData.date}
                onChange={(date) =>
                  setFormData((prev) => ({
                    ...prev,
                    date,
                  }))
                }
                dateFormat="dd MMM yyyy"
                maxDate={new Date()}
                placeholderText="Select Date"
                className="expense-datepicker"
              />
            </div>
          </div>

          <div className="modal-buttons">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              <FaTimes />
              Cancel
            </button>

            <button
              type="submit"
              className="save-btn"
              disabled={loading}
            >
              <FaSave />

              {loading
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditExpenseModal;