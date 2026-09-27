const express = require("express");

const router = express.Router();

const protect =
  require("../middleware/authMiddleware");

const adminOnly =
  require("../middleware/adminMiddleware");

const {
  getAdminDashboard,
  getAllUsers,
  updateUserRole,
  getAdminAccounts,
  getAllTransactions,
  getTransactionsByUser,
  getAllSubscriptions,
  getSubscriptionsByUser,
  getAuditLogs,
  deleteAuditLog,

  createPromotionRequest,
  getPromotionRequests,
  approvePromotionRequest,
  rejectPromotionRequest,
} = require("../controllers/adminController");

// =========================================================
// ADMIN DASHBOARD
// =========================================================

router.get(
  "/dashboard",
  protect,
  adminOnly,
  getAdminDashboard
);

// =========================================================
// USERS
// =========================================================

router.get(
  "/users",
  protect,
  adminOnly,
  getAllUsers
);

router.put(
  "/users/:id/role",
  protect,
  adminOnly,
  updateUserRole
);

// =========================================================
// ADMIN PROMOTION REQUESTS
// =========================================================

// Admin requests permission from Super Admin
// to promote a User to Admin.

router.post(
  "/promotion-requests",
  protect,
  adminOnly,
  createPromotionRequest
);

// Admin/Super Admin can view promotion requests.
// Backend controller determines which requests
// each role is allowed to see.

router.get(
  "/promotion-requests",
  protect,
  adminOnly,
  getPromotionRequests
);

// Super Admin approves a promotion request.

router.put(
  "/promotion-requests/:id/approve",
  protect,
  adminOnly,
  approvePromotionRequest
);

// Super Admin rejects a promotion request.

router.put(
  "/promotion-requests/:id/reject",
  protect,
  adminOnly,
  rejectPromotionRequest
);

// =========================================================
// ACCOUNTS
// =========================================================

router.get(
  "/accounts",
  protect,
  adminOnly,
  getAdminAccounts
);

// =========================================================
// TRANSACTIONS
// =========================================================

// All visible transactions

router.get(
  "/transactions",
  protect,
  adminOnly,
  getAllTransactions
);

// Transactions grouped by user/admin

router.get(
  "/transactions/by-user",
  protect,
  adminOnly,
  getTransactionsByUser
);

// =========================================================
// SUBSCRIPTIONS
// =========================================================

// All visible subscriptions

router.get(
  "/subscriptions",
  protect,
  adminOnly,
  getAllSubscriptions
);

// Subscriptions grouped by user/admin

router.get(
  "/subscriptions/by-user",
  protect,
  adminOnly,
  getSubscriptionsByUser
);

// =========================================================
// AUDIT LOGS
// =========================================================

router.get(
  "/audit-logs",
  protect,
  adminOnly,
  getAuditLogs
);

router.delete(
  "/audit-logs/:id",
  protect,
  adminOnly,
  deleteAuditLog
);

module.exports = router;