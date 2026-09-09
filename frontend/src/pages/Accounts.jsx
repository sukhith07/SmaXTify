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
  FaExclamationTriangle,
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

  /* Edit / Add modal */
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  /* Delete modal */
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "bank",
    details: "",
    balance: "",
  });

  /* =========================================================
     LOAD ACCOUNTS
     ========================================================= */

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

  /* =========================================================
     FORM
     ========================================================= */

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
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================================
     ADD / EDIT ACCOUNT
     ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Account name is required.");
      return;
    }

    const balance = Number(formData.balance || 0);

    if (Number.isNaN(balance) || balance < 0) {
      toast.error("Enter a valid balance.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: formData.name.trim(),
        type: formData.type,
        details: formData.details.trim(),
        balance,
      };

      /* UPDATE */
      if (editingAccount) {
        const res = await API.put(
          `/accounts/${editingAccount._id}`,
          payload
        );

        const updatedAccount =
          res.data.account || res.data;

        setAccounts((previous) =>
          previous.map((account) =>
            account._id === updatedAccount._id
              ? updatedAccount
              : account
          )
        );

        toast.success(
          "Account Updated Successfully!"
        );
      }

      /* ADD */
      else {
        const res = await API.post(
          "/accounts",
          payload
        );

        const newAccount =
          res.data.account || res.data;

        setAccounts((previous) => [
          newAccount,
          ...previous,
        ]);

        toast.success(
          "Account Added Successfully!"
        );
      }

      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to save account."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     DELETE MODAL
     ========================================================= */

  const openDeleteModal = (account) => {
    setAccountToDelete(account);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;

    setShowDeleteModal(false);
    setAccountToDelete(null);
  };

  /* =========================================================
     DELETE ACCOUNT
     ========================================================= */

  const handleDelete = async () => {
    if (!accountToDelete) return;

    try {
      setDeleting(true);

      await API.delete(
        `/accounts/${accountToDelete._id}`
      );

      setAccounts((previous) =>
        previous.filter(
          (account) =>
            account._id !== accountToDelete._id
        )
      );

      toast.success(
        "Account Deleted Successfully!"
      );

      setShowDeleteModal(false);
      setAccountToDelete(null);
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to delete account."
      );
    } finally {
      setDeleting(false);
    }
  };

  /* =========================================================
     ACCOUNT TYPE
     ========================================================= */

  const getAccountType = (type) => {
    return (
      accountTypes.find(
        (item) => item.value === type
      ) || accountTypes[4]
    );
  };

  /* =========================================================
     TOTAL BALANCE
     ========================================================= */

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

          {/* =================================================
              PAGE HEADER
              ================================================= */}

          <section className="accounts-page-header accounts-animate">

            <div className="accounts-page-header-icon">
              <FaWallet />
            </div>

            <div className="accounts-page-header-content">
              <h1>My Accounts</h1>

              <p>
                Manage your bank accounts, wallets,
                cash and cards
              </p>
            </div>

            <div className="accounts-page-header-actions">

              <button
                type="button"
                className="add-account-btn"
                onClick={openAddModal}
              >
                <FaPlus />
                <span>Add Account</span>
              </button>

            </div>

          </section>


          {/* =================================================
              TOTAL BALANCE
              ================================================= */}

          <section className="accounts-summary accounts-animate accounts-delay-1">

            <div className="accounts-summary-icon">
              <FaWallet />
            </div>

            <div className="accounts-summary-details">

              <span>Total Balance</span>

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

          </section>


          {/* =================================================
              ACCOUNTS
              ================================================= */}

          {loading ? (

            <div className="accounts-loading accounts-animate accounts-delay-2">

              <div className="loading-spinner"></div>

              <p>
                Loading accounts...
              </p>

            </div>

          ) : accounts.length === 0 ? (

            /* =================================================
               EMPTY
               ================================================= */

            <div className="accounts-empty accounts-animate accounts-delay-2">

              <div className="empty-icon">
                <FaWallet />
              </div>

              <h2>
                No Accounts Yet
              </h2>

              <p>
                Add your first account to start
                managing your money separately.
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

            /* =================================================
               ACCOUNT GRID
               ================================================= */

            <div className="accounts-grid">

              {accounts.map(
                (account, index) => {

                  const accountType =
                    getAccountType(
                      account.type
                    );

                  return (
                    <div
                      className={`account-card accounts-animate accounts-card-delay-${Math.min(
                        index + 1,
                        5
                      )}`}
                      key={account._id}
                    >

                      {/* =========================
                          CARD TOP
                          ========================= */}

                      <div className="account-card-top">

                        <div className="account-icon">
                          {accountType.icon}
                        </div>

                        <div className="account-actions">

                          {/* EDIT */}
                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(account)
                            }
                            aria-label="Edit account"
                            title="Edit Account"
                          >
                            <FaEdit />
                          </button>

                          {/* DELETE */}
                          <button
                            type="button"
                            onClick={() =>
                              openDeleteModal(
                                account
                              )
                            }
                            aria-label="Delete account"
                            title="Delete Account"
                          >
                            <FaTrash />
                          </button>

                        </div>

                      </div>


                      {/* =========================
                          ACCOUNT INFO
                          ========================= */}

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


                      {/* =========================
                          BALANCE
                          ========================= */}

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
                }
              )}

            </div>
          )}

        </main>

      </div>


      {/* =====================================================
          ADD / EDIT ACCOUNT MODAL
          ===================================================== */}

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

              {/* ACCOUNT NAME */}

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


              {/* ACCOUNT TYPE */}

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
                              type: type.value,
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


              {/* BALANCE */}

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


              {/* DETAILS */}

              <div className="account-field">

                <label>

                  <span className="details-label">
                    Details
                  </span>

                  <span className="optional-label">
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


              {/* BUTTONS */}

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


      {/* =====================================================
          DELETE ACCOUNT MODAL
          ===================================================== */}

      {showDeleteModal &&
        accountToDelete && (

          <div className="account-modal-overlay">

            <div className="account-delete-modal">

              {/* ==============================
                  DELETE HEADER
                  ============================== */}

              <div className="account-modal-header">

                <div>

                  <h2 className="delete-modal-title">
                    Delete Account
                  </h2>

                  <p>
                    This action cannot be undone.
                  </p>

                </div>

                <button
                  type="button"
                  className="account-modal-close"
                  onClick={closeDeleteModal}
                  disabled={deleting}
                  aria-label="Close"
                >
                  <FaTimes />
                </button>

              </div>


              {/* ==============================
                  DELETE CONTENT
                  ============================== */}

              <div className="account-delete-content">

                <div className="delete-warning-icon">
                  <FaExclamationTriangle />
                </div>

                <h3>
                  Are you sure?
                </h3>

                <p>
                  You are about to delete
                  <strong>
                    {" "}
                    "{accountToDelete.name}"
                  </strong>
                  .
                </p>

                <p className="delete-warning-text">
                  All information related to this
                  account will be removed.
                </p>

              </div>


              {/* ==============================
                  DELETE BUTTONS
                  ============================== */}

              <div className="account-delete-buttons">

                <button
                  type="button"
                  className="delete-cancel-btn"
                  onClick={closeDeleteModal}
                  disabled={deleting}
                >
                  <FaTimes />
                  Cancel
                </button>

                <button
                  type="button"
                  className="delete-confirm-btn"
                  onClick={handleDelete}
                  disabled={deleting}
                >

                  <FaTrash />

                  {deleting
                    ? "Deleting..."
                    : "Delete Account"}

                </button>

              </div>

            </div>

          </div>
        )}

    </div>
  );
}

export default Accounts;