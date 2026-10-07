const mongoose = require("mongoose");

const User = require("../models/User");
const Expense = require("../models/Expense");
const Account = require("../models/Account");
const Subscription = require("../models/Subscription");
const AuditLog = require("../models/AuditLog");
const Notification = require("../models/Notification");
const AdminPromotionRequest =
  require("../models/AdminPromotionRequest");

// =========================================================
// HELPERS
// =========================================================

const normalizeUserRole = (user) => {
  return {
    ...user,

    role:
      user.role === "admin"
        ? "admin"
        : user.role === "superadmin"
        ? "superadmin"
        : "user",
  };
};

const getVisibleUsers = async () => {
  const allUsers =
    await User.find()
      .select(
        "name email provider role createdAt photo"
      )
      .sort({
        name: 1,
      })
      .lean();

  return allUsers.map(
    normalizeUserRole
  );
};

const getVisibleUserIds = async () => {
  const visibleUsers =
    await getVisibleUsers();

  return {
    visibleUsers,

    visibleUserIds:
      visibleUsers.map(
        (user) => user._id
      ),
  };
};

// =========================================================
// PROMOTION RESPONSE NOTIFICATION
// =========================================================

const createPromotionResponseNotification =
  async ({
    requester,
    targetUser,
    promotionRequest,
    status,
    rejectionReason = "",
  }) => {
    if (
      !requester ||
      !promotionRequest ||
      !promotionRequest._id
    ) {
      return null;
    }

    const isApproved =
      status === "approved";

    const title =
      isApproved
        ? "Admin Promotion Approved"
        : "Admin Promotion Rejected";

    let message;

    if (isApproved) {
      message =
        `Your request to promote ` +
        `${targetUser?.name || "the selected user"} ` +
        `to Admin has been approved by the Super Admin.`;
    } else {
      message =
        rejectionReason
          ? `Your request to promote ` +
            `${targetUser?.name || "the selected user"} ` +
            `to Admin was rejected by the Super Admin. ` +
            `Reason: ${rejectionReason}`
          : `Your request to promote ` +
            `${targetUser?.name || "the selected user"} ` +
            `to Admin was rejected by the Super Admin.`;
    }

    /*
     * Each promotion request gets its own response
     * notification key.
     *
     * Request A -> unique notification
     * Request B -> unique notification
     * Request C -> unique notification
     */
    const reminderKey =
      `admin-promotion-response-${String(
        promotionRequest._id
      )}-${String(
        requester._id
      )}`;

    const notification =
      await Notification.findOneAndUpdate(
        {
          user:
            requester._id,

          reminderKey,
        },
        {
          $set: {
            user:
              requester._id,

            title,

            message,

            type:
              isApproved
                ? "success"
                : "warning",

            source:
              "system",

            sourceId:
              promotionRequest._id,

            reminderKey,

            time:
              new Date(),

            read:
              false,
          },
        },
        {
          new: true,

          upsert: true,

          setDefaultsOnInsert:
            true,
        }
      );

    return notification;
  };

// =========================================================
// ADMIN DASHBOARD
// =========================================================

exports.getAdminDashboard = async (
  req,
  res
) => {
  try {
    const visibleUsers =
      await getVisibleUsers();

    const visibleUserIds =
      visibleUsers.map(
        (user) => user._id
      );

    const visibleAccounts =
      await Account.find({
        user: {
          $in:
            visibleUserIds,
        },
      })
        .select(
          "user name type balance createdAt"
        )
        .sort({
          createdAt: 1,
        })
        .lean();

    const accountMap =
      new Map();

    for (
      const account of
        visibleAccounts
    ) {
      const userId =
        String(
          account.user
        );

      if (
        !accountMap.has(
          userId
        )
      ) {
        accountMap.set(
          userId,
          []
        );
      }

      accountMap
        .get(userId)
        .push({
          _id:
            account._id,

          name:
            account.name ||
            "Unnamed Account",

          type:
            account.type ||
            "Account",

          balance:
            Number(
              account.balance ||
                0
            ),

          createdAt:
            account.createdAt,
        });
    }

    const [
      totalTransactions,
      totalSubscriptions,
      financialSummary,
      userFinancialSummary,
    ] = await Promise.all([
      Expense.countDocuments({
        user: {
          $in:
            visibleUserIds,
        },
      }),

      Subscription.countDocuments({
        user: {
          $in:
            visibleUserIds,
        },
      }),

      Expense.aggregate([
        {
          $match: {
            user: {
              $in:
                visibleUserIds,
            },
          },
        },

        {
          $project: {
            normalizedType: {
              $toLower: {
                $trim: {
                  input: {
                    $toString:
                      "$type",
                  },
                },
              },
            },

            normalizedAmount: {
              $convert: {
                input:
                  "$amount",

                to: "double",

                onError: 0,

                onNull: 0,
              },
            },
          },
        },

        {
          $group: {
            _id:
              "$normalizedType",

            total: {
              $sum:
                "$normalizedAmount",
            },
          },
        },
      ]),

      Expense.aggregate([
        {
          $match: {
            user: {
              $in:
                visibleUserIds,
            },
          },
        },

        {
          $project: {
            user: 1,

            normalizedType: {
              $toLower: {
                $trim: {
                  input: {
                    $toString:
                      "$type",
                  },
                },
              },
            },

            normalizedAmount: {
              $convert: {
                input:
                  "$amount",

                to: "double",

                onError: 0,

                onNull: 0,
              },
            },
          },
        },

        {
          $group: {
            _id: {
              user:
                "$user",

              type:
                "$normalizedType",
            },

            total: {
              $sum:
                "$normalizedAmount",
            },
          },
        },
      ]),
    ]);

    const recentUsers =
      visibleUsers.slice(
        0,
        5
      );

    const recentTransactions =
      await Expense.find({
        user: {
          $in:
            visibleUserIds,
        },
      })
        .populate(
          "user",
          "name email role"
        )
        .populate(
          "account",
          "name type"
        )
        .sort({
          date: -1,
          createdAt: -1,
        })
        .limit(10)
        .lean();

    let totalIncome = 0;
    let totalExpenses = 0;
    let totalTransfers = 0;

    for (
      const item of
        financialSummary
    ) {
      const total =
        Number(
          item.total
        ) || 0;

      if (
        item._id ===
        "income"
      ) {
        totalIncome =
          total;
      }

      if (
        item._id ===
        "expense"
      ) {
        totalExpenses =
          total;
      }

      if (
        item._id ===
        "transfer"
      ) {
        totalTransfers =
          total;
      }
    }

    const netFlow =
      totalIncome -
      totalExpenses;

    const financialMap =
      new Map();

    for (
      const item of
        userFinancialSummary
    ) {
      const userId =
        String(
          item._id.user
        );

      if (
        !financialMap.has(
          userId
        )
      ) {
        financialMap.set(
          userId,
          {
            totalIncome: 0,
            totalExpenses: 0,
            totalTransfers: 0,
          }
        );
      }

      const userFinancial =
        financialMap.get(
          userId
        );

      const total =
        Number(
          item.total
        ) || 0;

      if (
        item._id.type ===
        "income"
      ) {
        userFinancial.totalIncome =
          total;
      }

      if (
        item._id.type ===
        "expense"
      ) {
        userFinancial.totalExpenses =
          total;
      }

      if (
        item._id.type ===
        "transfer"
      ) {
        userFinancial.totalTransfers =
          total;
      }
    }

    const userFinancials =
      visibleUsers.map(
        (user) => {
          const summary =
            financialMap.get(
              String(
                user._id
              )
            ) || {
              totalIncome: 0,
              totalExpenses: 0,
              totalTransfers: 0,
            };

          const userAccounts =
            accountMap.get(
              String(
                user._id
              )
            ) || [];

          const totalAccountBalance =
            userAccounts.reduce(
              (
                total,
                account
              ) =>
                total +
                Number(
                  account.balance ||
                    0
                ),
              0
            );

          return {
            _id:
              user._id,

            name:
              user.name ||
              "Unnamed User",

            email:
              user.email ||
              "",

            provider:
              user.provider ||
              "local",

            role:
              user.role,

            photo:
              user.photo ||
              "",

            createdAt:
              user.createdAt,

            totalIncome:
              summary.totalIncome,

            totalExpenses:
              summary.totalExpenses,

            totalTransfers:
              summary.totalTransfers,

            netFlow:
              summary.totalIncome -
              summary.totalExpenses,

            accountCount:
              userAccounts.length,

            totalAccountBalance,

            accounts:
              userAccounts,
          };
        }
      );

    const totalVisibleAccounts =
      visibleAccounts.length;

    const totalVisibleBalance =
      visibleAccounts.reduce(
        (
          total,
          account
        ) =>
          total +
          Number(
            account.balance ||
              0
          ),
        0
      );

    const totalAdmins =
      visibleUsers.filter(
        (user) =>
          user.role ===
          "admin"
      ).length;

    const totalSuperAdmins =
      visibleUsers.filter(
        (user) =>
          user.role ===
          "superadmin"
      ).length;

    const totalRegularUsers =
      visibleUsers.filter(
        (user) =>
          user.role ===
          "user"
      ).length;

    return res.status(200).json({
      success: true,

      access: {
        role:
          req.user.role,

        financialScope:
          "all-users",

        accountScope:
          "all-users",

        userScope:
          "all-users",

        transactionScope:
          "all-users",

        subscriptionScope:
          "all-users",

        superAdminFinancialProtected:
          false,

        superAdminAccountsProtected:
          false,

        superAdminUserProtected:
          false,
      },

      statistics: {
        totalUsers:
          visibleUsers.length,

        totalTransactions,

        totalSubscriptions,

        totalAdmins,

        totalSuperAdmins,

        totalRegularUsers,

        totalVisibleAccounts,

        totalVisibleBalance,
      },

      financial: {
        totalIncome,

        totalExpenses,

        totalTransfers,

        netFlow,
      },

      accounts: {
        totalAccounts:
          totalVisibleAccounts,

        totalBalance:
          totalVisibleBalance,
      },

      userFinancials,

      recentUsers,

      recentTransactions,
    });
  } catch (error) {
    console.error(
      "Admin Dashboard Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to load admin dashboard",
    });
  }
};

// =========================================================
// GET ADMIN ACCOUNTS
// =========================================================

exports.getAdminAccounts =
  async (
    req,
    res
  ) => {
    try {
      const {
        visibleUsers,
        visibleUserIds,
      } =
        await getVisibleUserIds();

      const accounts =
        await Account.find({
          user: {
            $in:
              visibleUserIds,
          },
        })
          .select(
            "user name type balance createdAt"
          )
          .sort({
            createdAt: 1,
          })
          .lean();

      const accountMap =
        new Map();

      for (
        const account of
          accounts
      ) {
        const userId =
          String(
            account.user
          );

        if (
          !accountMap.has(
            userId
          )
        ) {
          accountMap.set(
            userId,
            []
          );
        }

        accountMap
          .get(userId)
          .push({
            _id:
              account._id,

            name:
              account.name ||
              "Unnamed Account",

            type:
              account.type ||
              "Account",

            balance:
              Number(
                account.balance ||
                  0
              ),

            createdAt:
              account.createdAt,
          });
      }

      const users =
        visibleUsers.map(
          (user) => {
            const userAccounts =
              accountMap.get(
                String(
                  user._id
                )
              ) || [];

            const totalBalance =
              userAccounts.reduce(
                (
                  total,
                  account
                ) =>
                  total +
                  Number(
                    account.balance ||
                      0
                  ),
                0
              );

            return {
              _id:
                user._id,

              name:
                user.name ||
                "Unnamed User",

              email:
                user.email ||
                "",

              provider:
                user.provider ||
                "local",

              role:
                user.role,

              photo:
                user.photo ||
                "",

              createdAt:
                user.createdAt,

              accountCount:
                userAccounts.length,

              totalBalance,

              accounts:
                userAccounts,
            };
          }
        );

      const totalAccounts =
        accounts.length;

      const totalBalance =
        accounts.reduce(
          (
            total,
            account
          ) =>
            total +
            Number(
              account.balance ||
                0
            ),
          0
        );

      return res.status(200).json({
        success: true,

        access: {
          role:
            req.user.role,

          accountScope:
            "all-users",

          superAdminAccountsProtected:
            false,
        },

        summary: {
          totalAccounts,

          totalBalance,

          totalUsers:
            users.length,
        },

        users,
      });
    } catch (error) {
      console.error(
        "Get Admin Accounts Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to load admin accounts",
      });
    }
  };

// =========================================================
// GET ALL USERS
// =========================================================

exports.getAllUsers =
  async (
    req,
    res
  ) => {
    try {
      const page =
        Math.max(
          Number(
            req.query.page
          ) || 1,
          1
        );

      const limit =
        Math.min(
          Math.max(
            Number(
              req.query.limit
            ) || 20,
            1
          ),
          100
        );

      const search =
        req.query.search?.trim() ||
        "";

      const skip =
        (page - 1) *
        limit;

      const query = {};

      if (search) {
        query.$or = [
          {
            name: {
              $regex:
                search,

              $options:
                "i",
            },
          },

          {
            email: {
              $regex:
                search,

              $options:
                "i",
            },
          },
        ];
      }

      const [
        users,
        totalUsers,
      ] = await Promise.all([
        User.find(query)
          .select(
            "name email provider role photo createdAt"
          )
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limit)
          .lean(),

        User.countDocuments(
          query
        ),
      ]);

      const normalizedUsers =
        users.map(
          normalizeUserRole
        );

      const totalPages =
        Math.ceil(
          totalUsers /
            limit
        );

      return res.status(200).json({
        success: true,

        users:
          normalizedUsers,

        pagination: {
          page,

          limit,

          totalUsers,

          totalPages,

          hasNextPage:
            page <
            totalPages,

          hasPreviousPage:
            page > 1,
        },
      });
    } catch (error) {
      console.error(
        "Get All Users Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to load users",
      });
    }
  };

// =========================================================
// UPDATE USER ROLE
// =========================================================

exports.updateUserRole =
  async (
    req,
    res
  ) => {
    try {
      const targetUserId =
        req.params.id;

      const { role } =
        req.body;

      const actorRole =
        req.user.role;

      if (
        ![
          "user",
          "admin",
        ].includes(role)
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Role must be either user or admin",
        });
      }

      if (!targetUserId) {
        return res.status(400).json({
          success: false,

          message:
            "User ID is required",
        });
      }

      if (
        String(
          req.user.id
        ) ===
        String(
          targetUserId
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "You cannot change your own role",
        });
      }

      if (
        actorRole !==
          "admin" &&
        actorRole !==
          "superadmin"
      ) {
        return res.status(403).json({
          success: false,

          message:
            "Insufficient permissions",
        });
      }

      const targetUser =
        await User.findById(
          targetUserId
        );

      if (!targetUser) {
        return res.status(404).json({
          success: false,

          message:
            "User not found",
        });
      }

      const currentRole =
        targetUser.role ||
        "user";

      if (
        currentRole ===
        "superadmin"
      ) {
        return res.status(403).json({
          success: false,

          message:
            "The Super Admin account cannot be modified by an administrator",
        });
      }

      if (
        currentRole ===
        role
      ) {
        return res.status(200).json({
          success: true,

          message:
            `User is already a ${role}`,

          user: {
            _id:
              targetUser._id,

            name:
              targetUser.name,

            email:
              targetUser.email,

            role:
              currentRole,
          },
        });
      }

      if (
        actorRole ===
          "admin" &&
        currentRole ===
          "user" &&
        role ===
          "admin"
      ) {
        return res.status(403).json({
          success: false,

          requiresApproval:
            true,

          message:
            "Admin promotion requires Super Admin approval",
        });
      }

      if (
        role ===
          "admin" &&
        actorRole !==
          "superadmin"
      ) {
        return res.status(403).json({
          success: false,

          requiresApproval:
            true,

          message:
            "Only Super Admin can directly promote a user to Admin",
        });
      }

      const previousRole =
        currentRole;

      targetUser.role =
        role;

      await targetUser.save();

      await AuditLog.create({
        actor:
          req.user.id,

        actorRole:
          actorRole,

        action:
          "UPDATE_USER_ROLE",

        resource:
          "User",

        resourceId:
          targetUser._id,

        description:
          `Changed user role from ${previousRole} to ${role}`,

        metadata: {
          targetUserId:
            targetUser._id,

          targetUserName:
            targetUser.name,

          targetUserEmail:
            targetUser.email,

          previousRole,

          newRole:
            role,
        },

        ipAddress:
          req.ip || "",

        userAgent:
          req.get(
            "user-agent"
          ) || "",
      });

      return res.status(200).json({
        success: true,

        message:
          `User role updated to ${role}`,

        user: {
          _id:
            targetUser._id,

          name:
            targetUser.name,

          email:
            targetUser.email,

          provider:
            targetUser.provider,

          role:
            targetUser.role,

          photo:
            targetUser.photo,

          createdAt:
            targetUser.createdAt,
        },
      });
    } catch (error) {
      console.error(
        "Update User Role Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to update user role",
      });
    }
  };

// =========================================================
// CREATE ADMIN PROMOTION REQUEST
// =========================================================

exports.createPromotionRequest =
  async (
    req,
    res
  ) => {
    try {
      const requesterId =
        req.user.id;

      const requesterRole =
        req.user.role;

      const targetUserId =
        req.body?.targetUserId;

      // -----------------------------------------------------
      // ONLY ADMIN CAN CREATE REQUESTS
      // -----------------------------------------------------

      if (
        requesterRole !==
        "admin"
      ) {
        return res.status(403).json({
          success: false,

          message:
            "Only Admin can create a promotion request. Super Admin can promote users directly.",
        });
      }

      // -----------------------------------------------------
      // VALIDATE TARGET USER ID
      // -----------------------------------------------------

      if (
        !targetUserId ||
        !mongoose.Types.ObjectId.isValid(
          targetUserId
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Valid target user ID is required",
        });
      }

      // -----------------------------------------------------
      // PREVENT SELF PROMOTION
      // -----------------------------------------------------

      if (
        String(
          requesterId
        ) ===
        String(
          targetUserId
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "You cannot request promotion for yourself",
        });
      }

      // -----------------------------------------------------
      // LOAD REQUESTER + TARGET USER
      // -----------------------------------------------------

      const [
        requester,
        targetUser,
      ] = await Promise.all([
        User.findById(
          requesterId
        ).select(
          "name email role"
        ),

        User.findById(
          targetUserId
        ).select(
          "name email role"
        ),
      ]);

      if (!requester) {
        return res.status(404).json({
          success: false,

          message:
            "Requester account not found",
        });
      }

      if (!targetUser) {
        return res.status(404).json({
          success: false,

          message:
            "Target user not found",
        });
      }

      // -----------------------------------------------------
      // PROTECT SUPER ADMIN
      // -----------------------------------------------------

      if (
        targetUser.role ===
        "superadmin"
      ) {
        return res.status(403).json({
          success: false,

          message:
            "The Super Admin account cannot be promoted",
        });
      }

      // -----------------------------------------------------
      // USER MUST NOT ALREADY BE ADMIN
      // -----------------------------------------------------

      if (
        targetUser.role ===
        "admin"
      ) {
        return res.status(400).json({
          success: false,

          message:
            "This user is already an Admin",
        });
      }

      /*
       * =====================================================
       * IMPORTANT:
       *
       * Multiple promotion requests are allowed at the
       * same time.
       *
       * The duplicate check is ONLY for the target user.
       *
       * Therefore:
       *
       * Chetan   -> pending  ✅
       * Shalini  -> pending  ✅
       * Abhilash -> pending  ✅
       *
       * But:
       *
       * Chetan again -> blocked while Chetan is pending ❌
       *
       * We intentionally DO NOT check only requester/status.
       * Otherwise one Admin could have only one pending
       * request at a time.
       * =====================================================
       */

      const existingRequest =
        await AdminPromotionRequest.findOne({
          targetUser:
            targetUser._id,

          status:
            "pending",
        }).lean();

      if (existingRequest) {
        return res.status(409).json({
          success: false,

          message:
            `A promotion request for ${targetUser.name || "this user"} is already pending`,
        });
      }

      // -----------------------------------------------------
      // CREATE A NEW REQUEST
      // -----------------------------------------------------

      const promotionRequest =
        await AdminPromotionRequest.create({
          requester:
            requester._id,

          targetUser:
            targetUser._id,

          status:
            "pending",
        });

      // -----------------------------------------------------
      // AUDIT LOG
      // -----------------------------------------------------

      await AuditLog.create({
        actor:
          requesterId,

        actorRole:
          requesterRole,

        action:
          "ADMIN_PROMOTION_REQUESTED",

        resource:
          "AdminPromotionRequest",

        resourceId:
          promotionRequest._id,

        description:
          `Requested Admin promotion for ${targetUser.name}`,

        metadata: {
          requesterId,

          requesterRole,

          targetUserId:
            targetUser._id,

          targetUserName:
            targetUser.name,

          targetUserEmail:
            targetUser.email,

          status:
            "pending",
        },

        ipAddress:
          req.ip || "",

        userAgent:
          req.get(
            "user-agent"
          ) || "",
      });

      // -----------------------------------------------------
      // FIND ALL SUPER ADMINS
      // -----------------------------------------------------

      const superAdmins =
        await User.find({
          role:
            "superadmin",
        })
          .select(
            "_id name email"
          )
          .lean();

      // -----------------------------------------------------
      // CREATE A SEPARATE NOTIFICATION FOR EACH
      // SUPER ADMIN
      // -----------------------------------------------------

      if (
        superAdmins.length >
        0
      ) {
        const notificationMessage =
          `${requester.name || "An Admin"} has requested approval to promote ` +
          `${targetUser.name || "this user"} to Admin.`;

        const notifications =
          superAdmins.map(
            (superAdmin) => ({
              user:
                superAdmin._id,

              title:
                "Admin Promotion Request",

              message:
                notificationMessage,

              type:
                "info",

              source:
                "system",

              sourceId:
                promotionRequest._id,

              /*
               * IMPORTANT:
               *
               * Request ID is part of reminderKey.
               * Therefore every request gets a separate
               * notification.
               */
              reminderKey:
                `admin-promotion-request-${promotionRequest._id}-${superAdmin._id}`,

              actionType:
                "admin-promotion",

              actionId:
                promotionRequest._id,

              actionStatus:
                "pending",

              time:
                new Date(),

              read:
                false,
            })
          );

        await Notification.insertMany(
          notifications
        );
      }

      // -----------------------------------------------------
      // RESPONSE
      // -----------------------------------------------------

      return res.status(201).json({
        success: true,

        message:
          `Admin promotion request sent for ${targetUser.name || "this user"}`,

        request: {
          _id:
            promotionRequest._id,

          targetUser: {
            _id:
              targetUser._id,

            name:
              targetUser.name,

            email:
              targetUser.email,

            role:
              targetUser.role,
          },

          status:
            promotionRequest.status,

          createdAt:
            promotionRequest.createdAt,
        },
      });
    } catch (error) {
      console.error(
        "Create Promotion Request Error:",
        error
      );

      /*
       * If multiple requests are submitted almost
       * simultaneously and MongoDB reports a duplicate
       * key error, return a clean conflict response.
       */
      if (
        error?.code ===
        11000
      ) {
        return res.status(409).json({
          success: false,

          message:
            "A promotion request for this user is already pending",
        });
      }

      return res.status(500).json({
        success: false,

        message:
          "Failed to create promotion request",
      });
    }
  };

// =========================================================
// GET ADMIN PROMOTION REQUESTS
// =========================================================

exports.getPromotionRequests =
  async (
    req,
    res
  ) => {
    try {
      if (
        req.user.role !==
        "superadmin"
      ) {
        return res.status(403).json({
          success: false,

          message:
            "Only Super Admin can view promotion requests",
        });
      }

      const requests =
        await AdminPromotionRequest.find()
          .populate(
            "requester",
            "name email role photo"
          )
          .populate(
            "targetUser",
            "name email role photo createdAt"
          )
          .populate(
            "reviewedBy",
            "name email role"
          )
          .sort({
            createdAt: -1,
          })
          .lean();

      return res.status(200).json({
        success: true,

        requests,
      });
    } catch (error) {
      console.error(
        "Get Promotion Requests Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to load promotion requests",
      });
    }
  };

// =========================================================
// APPROVE ADMIN PROMOTION REQUEST
// =========================================================

exports.approvePromotionRequest =
  async (
    req,
    res
  ) => {
    try {
      if (
        req.user.role !==
        "superadmin"
      ) {
        return res.status(403).json({
          success: false,

          message:
            "Only Super Admin can approve promotion requests",
        });
      }

      const requestId =
        req.params.id;

      if (
        !mongoose.Types.ObjectId.isValid(
          requestId
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid promotion request ID",
        });
      }

      const promotionRequest =
        await AdminPromotionRequest.findById(
          requestId
        );

      if (!promotionRequest) {
        return res.status(404).json({
          success: false,

          message:
            "Promotion request not found",
        });
      }

      if (
        promotionRequest.status !==
        "pending"
      ) {
        return res.status(400).json({
          success: false,

          message:
            `This request has already been ${promotionRequest.status}`,
        });
      }

      const [
        targetUser,
        requester,
      ] = await Promise.all([
        User.findById(
          promotionRequest.targetUser
        ),

        User.findById(
          promotionRequest.requester
        ).select(
          "name email role"
        ),
      ]);

      if (!targetUser) {
        return res.status(404).json({
          success: false,

          message:
            "Target user no longer exists",
        });
      }

      if (
        targetUser.role ===
        "superadmin"
      ) {
        return res.status(403).json({
          success: false,

          message:
            "The Super Admin account cannot be modified",
        });
      }

      // -----------------------------------------------------
      // TARGET ALREADY ADMIN
      // -----------------------------------------------------

      if (
        targetUser.role ===
        "admin"
      ) {
        promotionRequest.status =
          "approved";

        promotionRequest.reviewedBy =
          req.user.id;

        promotionRequest.reviewedAt =
          new Date();

        await promotionRequest.save();

        await Notification.updateMany(
          {
            actionType:
              "admin-promotion",

            actionId:
              promotionRequest._id,
          },
          {
            $set: {
              actionStatus:
                "approved",

              read:
                true,
            },
          }
        );

        await AuditLog.create({
          actor:
            req.user.id,

          actorRole:
            "superadmin",

          action:
            "ADMIN_PROMOTION_APPROVED",

          resource:
            "AdminPromotionRequest",

          resourceId:
            promotionRequest._id,

          description:
            `Closed promotion request because ${targetUser.name} was already an Admin`,

          metadata: {
            requestId,

            targetUserId:
              targetUser._id,

            targetUserName:
              targetUser.name,

            requesterId:
              promotionRequest.requester,

            previousRole:
              "admin",

            newRole:
              "admin",
          },

          ipAddress:
            req.ip || "",

          userAgent:
            req.get(
              "user-agent"
            ) || "",
        });

        await createPromotionResponseNotification(
          {
            requester,

            targetUser,

            promotionRequest,

            status:
              "approved",
          }
        );

        return res.status(200).json({
          success: true,

          message:
            "User is already an Admin. Request closed.",
        });
      }

      // -----------------------------------------------------
      // PROMOTE USER
      // -----------------------------------------------------

      const previousRole =
        targetUser.role ||
        "user";

      targetUser.role =
        "admin";

      await targetUser.save();

      promotionRequest.status =
        "approved";

      promotionRequest.reviewedBy =
        req.user.id;

      promotionRequest.reviewedAt =
        new Date();

      await promotionRequest.save();

      // -----------------------------------------------------
      // UPDATE ONLY THIS REQUEST'S SUPER ADMIN
      // NOTIFICATION
      // -----------------------------------------------------

      await Notification.updateMany(
        {
          actionType:
            "admin-promotion",

          actionId:
            promotionRequest._id,
        },
        {
          $set: {
            actionStatus:
              "approved",

            read:
              true,
          },
        }
      );

      await AuditLog.create({
        actor:
          req.user.id,

        actorRole:
          "superadmin",

        action:
          "ADMIN_PROMOTION_APPROVED",

        resource:
          "User",

        resourceId:
          targetUser._id,

        description:
          `Approved Admin promotion for ${targetUser.name}`,

        metadata: {
          requestId,

          targetUserId:
            targetUser._id,

          targetUserName:
            targetUser.name,

          targetUserEmail:
            targetUser.email,

          previousRole,

          newRole:
            "admin",

          requesterId:
            promotionRequest.requester,
        },

        ipAddress:
          req.ip || "",

        userAgent:
          req.get(
            "user-agent"
          ) || "",
      });

      // -----------------------------------------------------
      // NOTIFY REQUESTING ADMIN
      // -----------------------------------------------------

      await createPromotionResponseNotification(
        {
          requester,

          targetUser,

          promotionRequest,

          status:
            "approved",
        }
      );

      return res.status(200).json({
        success: true,

        message:
          `${targetUser.name || "User"} is now an Admin`,

        user: {
          _id:
            targetUser._id,

          name:
            targetUser.name,

          email:
            targetUser.email,

          role:
            targetUser.role,
        },
      });
    } catch (error) {
      console.error(
        "Approve Promotion Request Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to approve promotion request",
      });
    }
  };

// =========================================================
// REJECT ADMIN PROMOTION REQUEST
// =========================================================

exports.rejectPromotionRequest =
  async (
    req,
    res
  ) => {
    try {
      if (
        req.user.role !==
        "superadmin"
      ) {
        return res.status(403).json({
          success: false,

          message:
            "Only Super Admin can reject promotion requests",
        });
      }

      const requestId =
        req.params.id;

      if (
        !mongoose.Types.ObjectId.isValid(
          requestId
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid promotion request ID",
        });
      }

      const promotionRequest =
        await AdminPromotionRequest.findById(
          requestId
        );

      if (!promotionRequest) {
        return res.status(404).json({
          success: false,

          message:
            "Promotion request not found",
        });
      }

      if (
        promotionRequest.status !==
        "pending"
      ) {
        return res.status(400).json({
          success: false,

          message:
            `This request has already been ${promotionRequest.status}`,
        });
      }

      const [
        requester,
        targetUser,
      ] = await Promise.all([
        User.findById(
          promotionRequest.requester
        ).select(
          "name email role"
        ),

        User.findById(
          promotionRequest.targetUser
        ).select(
          "name email role"
        ),
      ]);

      promotionRequest.status =
        "rejected";

      promotionRequest.reviewedBy =
        req.user.id;

      promotionRequest.reviewedAt =
        new Date();

      promotionRequest.rejectionReason =
        req.body?.reason?.trim() ||
        "";

      await promotionRequest.save();

      // -----------------------------------------------------
      // UPDATE ONLY THIS REQUEST'S NOTIFICATION
      // -----------------------------------------------------

      await Notification.updateMany(
        {
          actionType:
            "admin-promotion",

          actionId:
            promotionRequest._id,
        },
        {
          $set: {
            actionStatus:
              "rejected",

            read:
              true,
          },
        }
      );

      await AuditLog.create({
        actor:
          req.user.id,

        actorRole:
          "superadmin",

        action:
          "ADMIN_PROMOTION_REJECTED",

        resource:
          "AdminPromotionRequest",

        resourceId:
          promotionRequest._id,

        description:
          "Rejected Admin promotion request",

        metadata: {
          requestId,

          targetUserId:
            promotionRequest.targetUser,

          targetUserName:
            targetUser?.name ||
            "",

          requesterId:
            promotionRequest.requester,

          rejectionReason:
            promotionRequest.rejectionReason,

          status:
            "rejected",
        },

        ipAddress:
          req.ip || "",

        userAgent:
          req.get(
            "user-agent"
          ) || "",
      });

      // -----------------------------------------------------
      // NOTIFY REQUESTING ADMIN
      // -----------------------------------------------------

      await createPromotionResponseNotification(
        {
          requester,

          targetUser,

          promotionRequest,

          status:
            "rejected",

          rejectionReason:
            promotionRequest.rejectionReason,
        }
      );

      return res.status(200).json({
        success: true,

        message:
          "Admin promotion request rejected",
      });
    } catch (error) {
      console.error(
        "Reject Promotion Request Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to reject promotion request",
      });
    }
  };

// =========================================================
// GET ALL TRANSACTIONS
// =========================================================

exports.getAllTransactions =
  async (
    req,
    res
  ) => {
    try {
      const page =
        Math.max(
          Number(
            req.query.page
          ) || 1,
          1
        );

      const limit =
        Math.min(
          Math.max(
            Number(
              req.query.limit
            ) || 20,
            1
          ),
          100
        );

      const search =
        req.query.search?.trim() ||
        "";

      const type =
        req.query.type?.trim() ||
        "";

      const skip =
        (page - 1) *
        limit;

      const {
        visibleUserIds,
      } =
        await getVisibleUserIds();

      const query = {
        user: {
          $in:
            visibleUserIds,
        },
      };

      if (
        [
          "Income",
          "Expense",
          "Transfer",
        ].includes(
          type
        )
      ) {
        query.type =
          type;
      }

      if (search) {
        query.$and = [
          {
            user: {
              $in:
                visibleUserIds,
            },
          },

          {
            $or: [
              {
                title: {
                  $regex:
                    search,

                  $options:
                    "i",
                },
              },

              {
                category: {
                  $regex:
                    search,

                  $options:
                    "i",
                },
              },

              {
                notes: {
                  $regex:
                    search,

                  $options:
                    "i",
                },
              },
            ],
          },
        ];

        delete query.user;
      }

      const [
        transactions,
        totalTransactions,
      ] = await Promise.all([
        Expense.find(query)
          .populate(
            "user",
            "name email role"
          )
          .populate(
            "account",
            "name type"
          )
          .sort({
            date: -1,
            createdAt: -1,
          })
          .skip(skip)
          .limit(limit)
          .lean(),

        Expense.countDocuments(
          query
        ),
      ]);

      const totalPages =
        Math.ceil(
          totalTransactions /
            limit
        );

      return res.status(200).json({
        success: true,

        transactions,

        pagination: {
          page,

          limit,

          totalTransactions,

          totalPages,

          hasNextPage:
            page <
            totalPages,

          hasPreviousPage:
            page > 1,
        },
      });
    } catch (error) {
      console.error(
        "Get All Transactions Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to load transactions",
      });
    }
  };

// =========================================================
// GET TRANSACTIONS GROUPED BY USER
// =========================================================

exports.getTransactionsByUser =
  async (
    req,
    res
  ) => {
    try {
      const {
        visibleUsers,
        visibleUserIds,
      } =
        await getVisibleUserIds();

      const transactions =
        await Expense.find({
          user: {
            $in:
              visibleUserIds,
          },
        })
          .populate(
            "user",
            "name email role"
          )
          .populate(
            "account",
            "name type"
          )
          .sort({
            date: -1,
            createdAt: -1,
          })
          .lean();

      const transactionMap =
        new Map();

      for (
        const transaction of
          transactions
      ) {
        const transactionUserId =
          transaction.user?._id ||
          transaction.user;

        if (
          !transactionUserId
        ) {
          continue;
        }

        const userId =
          String(
            transactionUserId
          );

        if (
          !transactionMap.has(
            userId
          )
        ) {
          transactionMap.set(
            userId,
            []
          );
        }

        transactionMap
          .get(userId)
          .push(
            transaction
          );
      }

      let totalIncome = 0;
      let totalExpenses = 0;
      let totalTransfers = 0;

      const users =
        visibleUsers.map(
          (user) => {
            const userTransactions =
              transactionMap.get(
                String(
                  user._id
                )
              ) || [];

            let userIncome = 0;
            let userExpenses = 0;
            let userTransfers = 0;

            userTransactions.forEach(
              (transaction) => {
                const amount =
                  Number(
                    transaction.amount
                  ) || 0;

                const type =
                  String(
                    transaction.type ||
                      ""
                  )
                    .trim()
                    .toLowerCase();

                if (
                  type ===
                  "income"
                ) {
                  userIncome +=
                    amount;
                }

                if (
                  type ===
                  "expense"
                ) {
                  userExpenses +=
                    amount;
                }

                if (
                  type ===
                  "transfer"
                ) {
                  userTransfers +=
                    amount;
                }
              }
            );

            totalIncome +=
              userIncome;

            totalExpenses +=
              userExpenses;

            totalTransfers +=
              userTransfers;

            return {
              _id:
                user._id,

              name:
                user.name ||
                "Unnamed User",

              email:
                user.email ||
                "",

              provider:
                user.provider ||
                "local",

              role:
                user.role,

              photo:
                user.photo ||
                "",

              createdAt:
                user.createdAt,

              transactionCount:
                userTransactions.length,

              totalIncome:
                userIncome,

              totalExpenses:
                userExpenses,

              totalTransfers:
                userTransfers,

              netFlow:
                userIncome -
                userExpenses,

              transactions:
                userTransactions,
            };
          }
        );

      return res.status(200).json({
        success: true,

        access: {
          role:
            req.user.role,

          transactionScope:
            "all-users",

          superAdminTransactionsProtected:
            false,
        },

        summary: {
          totalUsers:
            visibleUsers.length,

          totalTransactions:
            transactions.length,

          totalIncome,

          totalExpenses,

          totalTransfers,

          netFlow:
            totalIncome -
            totalExpenses,
        },

        users,
      });
    } catch (error) {
      console.error(
        "Get Transactions By User Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to load transactions by user",
      });
    }
  };

// =========================================================
// GET ALL SUBSCRIPTIONS
// =========================================================

exports.getAllSubscriptions =
  async (
    req,
    res
  ) => {
    try {
      const page =
        Math.max(
          Number(
            req.query.page
          ) || 1,
          1
        );

      const limit =
        Math.min(
          Math.max(
            Number(
              req.query.limit
            ) || 20,
            1
          ),
          100
        );

      const search =
        req.query.search?.trim() ||
        "";

      const status =
        req.query.status?.trim() ||
        "";

      const skip =
        (page - 1) *
        limit;

      const {
        visibleUserIds,
      } =
        await getVisibleUserIds();

      const query = {
        user: {
          $in:
            visibleUserIds,
        },
      };

      if (
        [
          "Active",
          "Paused",
          "Cancelled",
        ].includes(
          status
        )
      ) {
        query.status =
          status;
      }

      if (search) {
        query.$and = [
          {
            user: {
              $in:
                visibleUserIds,
            },
          },

          {
            $or: [
              {
                name: {
                  $regex:
                    search,

                  $options:
                    "i",
                },
              },

              {
                category: {
                  $regex:
                    search,

                  $options:
                    "i",
                },
              },

              {
                paymentMethod: {
                  $regex:
                    search,

                  $options:
                    "i",
                },
              },
            ],
          },
        ];

        delete query.user;
      }

      const [
        subscriptions,
        totalSubscriptions,
      ] = await Promise.all([
        Subscription.find(query)
          .populate(
            "user",
            "name email role"
          )
          .sort({
            nextPayment: 1,

            createdAt: -1,
          })
          .skip(skip)
          .limit(limit)
          .lean(),

        Subscription.countDocuments(
          query
        ),
      ]);

      const totalPages =
        Math.ceil(
          totalSubscriptions /
            limit
        );

      return res.status(200).json({
        success: true,

        subscriptions,

        pagination: {
          page,

          limit,

          totalSubscriptions,

          totalPages,

          hasNextPage:
            page <
            totalPages,

          hasPreviousPage:
            page > 1,
        },
      });
    } catch (error) {
      console.error(
        "Get All Subscriptions Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to load subscriptions",
      });
    }
  };

// =========================================================
// GET SUBSCRIPTIONS GROUPED BY USER
// =========================================================

exports.getSubscriptionsByUser =
  async (
    req,
    res
  ) => {
    try {
      const {
        visibleUsers,
        visibleUserIds,
      } =
        await getVisibleUserIds();

      const subscriptions =
        await Subscription.find({
          user: {
            $in:
              visibleUserIds,
          },
        })
          .select(
            "user name category amount cycle startDate nextPayment paymentMethod autoRenew status createdAt"
          )
          .sort({
            nextPayment: 1,

            createdAt: -1,
          })
          .lean();

      const subscriptionMap =
        new Map();

      for (
        const subscription of
          subscriptions
      ) {
        const subscriptionUserId =
          subscription.user;

        if (
          !subscriptionUserId
        ) {
          continue;
        }

        const userId =
          String(
            subscriptionUserId
          );

        if (
          !subscriptionMap.has(
            userId
          )
        ) {
          subscriptionMap.set(
            userId,
            []
          );
        }

        subscriptionMap
          .get(userId)
          .push(
            subscription
          );
      }

      let totalActive = 0;
      let totalPaused = 0;
      let totalCancelled = 0;
      let totalMonthlyCost = 0;

      const users =
        visibleUsers.map(
          (user) => {
            const userSubscriptions =
              subscriptionMap.get(
                String(
                  user._id
                )
              ) || [];

            let userActive = 0;
            let userPaused = 0;
            let userCancelled = 0;
            let userMonthlyCost = 0;

            userSubscriptions.forEach(
              (subscription) => {
                const amount =
                  Number(
                    subscription.amount
                  ) || 0;

                const status =
                  String(
                    subscription.status ||
                      ""
                  )
                    .trim()
                    .toLowerCase();

                const cycle =
                  String(
                    subscription.cycle ||
                      "Monthly"
                  )
                    .trim()
                    .toLowerCase();

                if (
                  status ===
                  "active"
                ) {
                  userActive +=
                    1;

                  totalActive +=
                    1;
                }

                if (
                  status ===
                  "paused"
                ) {
                  userPaused +=
                    1;

                  totalPaused +=
                    1;
                }

                if (
                  status ===
                  "cancelled"
                ) {
                  userCancelled +=
                    1;

                  totalCancelled +=
                    1;
                }

                let monthlyAmount =
                  amount;

                if (
                  cycle ===
                  "yearly"
                ) {
                  monthlyAmount =
                    amount / 12;
                }

                if (
                  cycle ===
                  "weekly"
                ) {
                  monthlyAmount =
                    amount *
                    4.345;
                }

                if (
                  status ===
                  "active"
                ) {
                  userMonthlyCost +=
                    monthlyAmount;

                  totalMonthlyCost +=
                    monthlyAmount;
                }
              }
            );

            return {
              _id:
                user._id,

              name:
                user.name ||
                "Unnamed User",

              email:
                user.email ||
                "",

              provider:
                user.provider ||
                "local",

              role:
                user.role,

              photo:
                user.photo ||
                "",

              createdAt:
                user.createdAt,

              subscriptionCount:
                userSubscriptions.length,

              activeCount:
                userActive,

              pausedCount:
                userPaused,

              cancelledCount:
                userCancelled,

              monthlyCost:
                userMonthlyCost,

              subscriptions:
                userSubscriptions,
            };
          }
        );

      return res.status(200).json({
        success: true,

        access: {
          role:
            req.user.role,

          subscriptionScope:
            "all-users",

          superAdminSubscriptionsProtected:
            false,
        },

        summary: {
          totalUsers:
            visibleUsers.length,

          totalSubscriptions:
            subscriptions.length,

          totalActive,

          totalPaused,

          totalCancelled,

          totalMonthlyCost,
        },

        users,
      });
    } catch (error) {
      console.error(
        "Get Subscriptions By User Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to load subscriptions by user",
      });
    }
  };

// =========================================================
// GET AUDIT LOGS
// =========================================================

exports.getAuditLogs =
  async (
    req,
    res
  ) => {
    try {
      const page =
        Math.max(
          Number(
            req.query.page
          ) || 1,
          1
        );

      const limit =
        Math.min(
          Math.max(
            Number(
              req.query.limit
            ) || 50,
            1
          ),
          200
        );

      const action =
        req.query.action?.trim() ||
        "";

      const skip =
        (page - 1) *
        limit;

      const query = {};

      if (action) {
        query.action =
          action;
      }

      const [
        logs,
        totalLogs,
      ] = await Promise.all([
        AuditLog.find(query)
          .populate(
            "actor",
            "name email role"
          )
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limit)
          .lean(),

        AuditLog.countDocuments(
          query
        ),
      ]);

      const totalPages =
        Math.ceil(
          totalLogs /
            limit
        );

      return res.status(200).json({
        success: true,

        logs,

        pagination: {
          page,

          limit,

          totalLogs,

          totalPages,

          hasNextPage:
            page <
            totalPages,

          hasPreviousPage:
            page > 1,
        },
      });
    } catch (error) {
      console.error(
        "Get Audit Logs Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to load audit logs",
      });
    }
  };

// =========================================================
// DELETE AUDIT LOG
// =========================================================

exports.deleteAuditLog =
  async (
    req,
    res
  ) => {
    try {
      if (
        req.user.role !==
        "superadmin"
      ) {
        return res.status(403).json({
          success: false,

          message:
            "Only Super Admin can delete audit logs",
        });
      }

      const logId =
        req.params.id;

      if (
        !logId ||
        !mongoose.Types.ObjectId.isValid(
          logId
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid audit log ID",
        });
      }

      const deletedLog =
        await AuditLog.findByIdAndDelete(
          logId
        );

      if (!deletedLog) {
        return res.status(404).json({
          success: false,

          message:
            "Audit log not found",
        });
      }

      return res.status(200).json({
        success: true,

        message:
          "Audit log deleted successfully",

        logId,
      });
    } catch (error) {
      console.error(
        "Delete Audit Log Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to delete audit log",
      });
    }
  };