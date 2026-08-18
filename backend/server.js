const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

// ======================================
// Load Environment Variables
// ======================================

dotenv.config();

console.log(
  "Gemini API Key Loaded:",
  !!process.env.GEMINI_API_KEY
);

// ======================================
// Connect MongoDB
// ======================================

connectDB();

// ======================================
// Create Express App
// ======================================

const app = express();

// ======================================
// Middleware
// ======================================

app.use(cors());

app.use(express.json());

// ======================================
// Import Routes
// ======================================

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

// ======================================
// API Routes
// ======================================

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

// ======================================
// Reports
// ======================================

app.use(
  "/api/reports",
  reportRoutes
);

// ======================================
// Currency
// ======================================

app.use(
  "/api/currency",
  currencyRoutes
);

// ======================================
// Home Route
// ======================================

app.get("/", (req, res) => {

  res.send(
    "🚀 SmaXTify Backend Running Successfully"
  );

});

// ======================================
// 404 Route
// ======================================

app.use((req, res) => {

  res.status(404).json({

    success: false,

    message: "Route Not Found",

  });

});

// ======================================
// Start Server
// ======================================

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(
    `🚀 Server running on http://localhost:${PORT}`
  );

});