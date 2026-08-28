import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  FaUniversity,
  FaWallet,
  FaMoneyBillWave,
  FaMobileAlt,
  FaCreditCard,
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSave,
} from "react-icons/fa";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

import API from "../services/api";

import "../components/styles/accounts.css";
const accountTypes = [
  {
    value: "bank",
    label: "Bank Account",
    icon: <FaUniversity />,
  },
  {
    value: "cash",
    label: "Cash",
    icon: <FaMoneyBillWave />,
  },
  {
    value: "wallet",
    label: "Digital Wallet",
    icon: <FaMobileAlt />,
  },
  {
    value: "credit",
    label: "Credit Card",
    icon: <FaCreditCard />,
  },
  {
    value: "other",
    label: "Other",
    icon: <FaWallet />,
  },
];

function Accounts() {
  const [accounts, setAccounts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);

  const [editingAccount, setEditingAccount] =
    useState(null);

  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "bank",
    details: "",
    balance: "",
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);

      const res = await API.get("/accounts");

      setAccounts(
        Array.isArray(res.data)
          ? res.data
          : res.data.accounts || []
      );
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load accounts."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "bank",
      details: "",
      balance: "",
    });

    setEditingAccount(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (account) => {
    setEditingAccount(account);

    setFormData({
      name: account.name || "",
      type: account.type || "bank",
      details: account.details || "",
      balance:
        account.balance !== undefined
          ? account.balance
          : "",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    resetForm();
  };

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error(
        "Account name is required."
      );

      return;
    }

    const balance = Number(
      formData.balance || 0
    );

    if (
      Number.isNaN(balance) ||
      balance < 0
    ) {
      toast.error(
        "Enter a valid balance."
      );

      return;
    }

    try {
      setSaving(true);

      if (editingAccount) {
        const res = await API.put(
          `/accounts/${editingAccount._id}`,
          {
            name: formData.name,
            type: formData.type,
            details: formData.details,
            balance,
          }
        );

        const updatedAccount =
          res.data.account;

        setAccounts((previous) =>
          previous.map((account) =>
            account._id ===
            updatedAccount._id
              ? updatedAccount
              : account
          )
        );

        toast.success(
          "Account Updated Successfully!"
        );
      } else {
        const res = await API.post(
          "/accounts",
          {
            name: formData.name,
            type: formData.type,
            details: formData.details,
            balance,
          }
        );

        setAccounts((previous) => [
          res.data.account,
          ...previous,
        ]);

        toast.success(
          "Account Added Successfully!"
        );
      }

      closeModal();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to save account."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (account) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${account.name}"?`
      );

    if (!confirmed) return;

    try {
      await API.delete(
        `/accounts/${account._id}`
      );

      setAccounts((previous) =>
        previous.filter(
          (item) =>
            item._id !== account._id
        )
      );

      toast.success(
        "Account Deleted Successfully!"
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to delete account."
      );
    }
  };

  const getAccountType = (type) => {
    return (
      accountTypes.find(
        (item) => item.value === type
      ) || accountTypes[4]
    );
  };

  const totalBalance = accounts.reduce(
    (sum, account) =>
      sum + Number(account.balance || 0),
    0
  );

  return (
    <div className="accounts-page">
      <Sidebar />

      <div className="accounts-content">
        <Navbar />

        <main className="accounts-main">
          <div className="accounts-header">
            <div>
              <h1>
                <FaWallet />
                My Accounts
              </h1>

              <p>
                Manage your bank accounts,
                wallets, cash and cards
              </p>
            </div>

            <button
              type="button"
              className="add-account-btn"
              onClick={openAddModal}
            >
              <FaPlus />
              Add Account
            </button>
          </div>

          <div className="accounts-summary">
            <div className="accounts-summary-icon">
              <FaWallet />
            </div>

            <div>
              <span>
                Total Balance
              </span>

              <h2>
                ₹
                {totalBalance.toLocaleString(
                  "en-IN",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
              </h2>
            </div>

            <div className="account-count">
              <strong>
                {accounts.length}
              </strong>

              <span>
                {accounts.length === 1
                  ? "Account"
                  : "Accounts"}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="accounts-loading">
              <div className="loading-spinner"></div>

              <p>
                Loading accounts...
              </p>
            </div>
          ) : accounts.length === 0 ? (
            <div className="accounts-empty">
              <div className="empty-icon">
                <FaWallet />
              </div>

              <h2>
                No Accounts Yet
              </h2>

              <p>
                Add your first account to
                start managing your money
                separately.
              </p>

              <button
                type="button"
                className="empty-add-btn"
                onClick={openAddModal}
              >
                <FaPlus />
                Add Your First Account
              </button>
            </div>
          ) : (
            <div className="accounts-grid">
              {accounts.map((account) => {
                const accountType =
                  getAccountType(
                    account.type
                  );

                return (
                  <div
                    className="account-card"
                    key={account._id}
                  >
                    <div className="account-card-top">
                      <div className="account-icon">
                        {accountType.icon}
                      </div>

                      <div className="account-actions">
                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(
                              account
                            )
                          }
                          aria-label="Edit account"
                        >
                          <FaEdit />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              account
                            )
                          }
                          aria-label="Delete account"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>

                    <div className="account-info">
                      <h3>
                        {account.name}
                      </h3>

                      <span>
                        {accountType.label}
                      </span>

                      {account.details && (
                        <p>
                          {account.details}
                        </p>
                      )}
                    </div>

                    <div className="account-balance">
                      <span>
                        Available Balance
                      </span>

                      <h2>
                        ₹
                        {Number(
                          account.balance || 0
                        ).toLocaleString(
                          "en-IN",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </h2>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {showModal && (
        <div className="account-modal-overlay">
          <div className="account-modal">
            <div className="account-modal-header">
              <div>
                <h2>
                  {editingAccount
                    ? "Edit Account"
                    : "Add Account"}
                </h2>

                <p>
                  {editingAccount
                    ? "Update your account details"
                    : "Add a new financial account"}
                </p>
              </div>

              <button
                type="button"
                className="account-modal-close"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            <form
              className="account-form"
              onSubmit={handleSubmit}
            >
              <div className="account-field">
                <label>
                  Account Name
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="SBI Savings"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="account-field">
                <label>
                  Account Type
                </label>

                <div className="account-type-grid">
                  {accountTypes.map(
                    (type) => (
                      <button
                        type="button"
                        key={type.value}
                        className={
                          formData.type ===
                          type.value
                            ? "account-type-option active"
                            : "account-type-option"
                        }
                        onClick={() =>
                          setFormData(
                            (previous) => ({
                              ...previous,
                              type:
                                type.value,
                            })
                          )
                        }
                      >
                        <span>
                          {type.icon}
                        </span>

                        <small>
                          {type.label}
                        </small>
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="account-field">
                <label>
                  Current Balance
                </label>

                <input
                  type="number"
                  name="balance"
                  placeholder="₹0"
                  min="0"
                  step="0.01"
                  value={formData.balance}
                  onChange={handleChange}
                />
              </div>

              <div className="account-field">
                <label>
                  Details
                  <span>
                    Optional
                  </span>
                </label>

                <input
                  type="text"
                  name="details"
                  placeholder="Account number, bank name..."
                  value={formData.details}
                  onChange={handleChange}
                />
              </div>

              <div className="account-modal-buttons">
                <button
                  type="button"
                  className="account-cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  <FaTimes />
                  Cancel
                </button>

                <button
                  type="submit"
                  className="account-save-btn"
                  disabled={saving}
                >
                  {editingAccount ? (
                    <FaSave />
                  ) : (
                    <FaPlus />
                  )}

                  {saving
                    ? "Saving..."
                    : editingAccount
                    ? "Save Changes"
                    : "Add Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Accounts;