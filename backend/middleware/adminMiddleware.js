const User = require("../models/User");

const adminOnly = async (
  req,
  res,
  next
) => {
  try {
    // authMiddleware should run before this middleware
    if (
      !req.user ||
      !req.user.id
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Not Authorized",
      });
    }

    const user =
      await User.findById(
        req.user.id
      ).select("role");

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "User not found",
      });
    }

    if (
      ![
        "admin",
        "superadmin",
      ].includes(user.role)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Admin access required",
      });
    }

    // Make the current role available
    // to controllers that need it.
    req.user.role =
      user.role;

    next();
  } catch (error) {
    console.error(
      "Admin Middleware Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to verify admin access",
    });
  }
};

module.exports = adminOnly;