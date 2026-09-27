const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({
  path: path.join(__dirname, ".env"),
});

console.log(
  "Gemini API Key Loaded:",
  !!process.env.GEMINI_API_KEY
);

const connectDB = require("./config/db");

connectDB();

const app = express();

app.use(cors());

app.use(express.json());

// ===============================
// ROUTES
// ===============================

const authRoutes =
  require("./routes/authRoutes");

const expenseRoutes =
  require("./routes/expenseRoutes");

const budgetRoutes =
  require("./routes/budgetRoutes");

const goalRoutes =
  require("./routes/goalRoutes");

const aiRoutes =
  require("./routes/aiRoutes");

const chatRoutes =
  require("./routes/chatRoutes");

const reportRoutes =
  require("./routes/reportRoutes");

const currencyRoutes =
  require("./routes/currencyRoutes");

const subscriptionRoutes =
  require("./routes/subscriptionRoutes");

const notificationRoutes =
  require("./routes/notificationRoutes");

const accountRoutes =
  require("./routes/accountRoutes");

const settingsRoutes =
  require("./routes/settingsRoutes");

// Admin routes
const adminRoutes =
  require("./routes/adminRoutes");


// ===============================
// API ROUTES
// ===============================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/expenses",
  expenseRoutes
);

app.use(
  "/api/budget",
  budgetRoutes
);

app.use(
  "/api/goals",
  goalRoutes
);

app.use(
  "/api/ai",
  aiRoutes
);

app.use(
  "/api/chats",
  chatRoutes
);

app.use(
  "/api/reports",
  reportRoutes
);

app.use(
  "/api/currency",
  currencyRoutes
);

app.use(
  "/api/subscriptions",
  subscriptionRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

app.use(
  "/api/accounts",
  accountRoutes
);

app.use(
  "/api/settings",
  settingsRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);


// ===============================
// ROOT ROUTE
// ===============================

app.get("/", (req, res) => {
  res.send(
    "🚀 SmaXTify Backend Running Successfully"
  );
});


// ===============================
// 404 HANDLER
// ===============================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});


// ===============================
// START SERVER
// ===============================

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 Server running on http://localhost:${PORT}`
  );
});