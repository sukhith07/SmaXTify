
const { GoogleGenAI } = require("@google/genai");
const cloudinary = require("cloudinary").v2;

const Chat = require("../models/Chat");
const Expense = require("../models/Expense");
const Account = require("../models/Account");
const ReceiptScan = require("../models/ReceiptScan");

const { executeAIAction } = require("../services/ai/aiActionExecutor");
const {
  validateAction,
  actionNeedsConfirmation,
} = require("../services/ai/aiActionValidator");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const GEMINI_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
];

const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getErrorStatus = (error) =>
  error?.status ||
  error?.error?.code ||
  error?.code ||
  error?.response?.status ||
  error?.response?.data?.error?.code ||
  null;

const getNumericErrorStatus = (error) => {
  const status = Number(getErrorStatus(error));
  return Number.isFinite(status) ? status : null;
};

const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const generateGeminiContent = async ({ contents, config = {} }) => {
  if (!GEMINI_API_KEY) {
    const error = new Error("Gemini API key is not configured.");
    error.status = 503;
    error.code = "AI_KEY_MISSING";
    throw error;
  }

  let lastError;

  for (const model of GEMINI_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        return await ai.models.generateContent({
          model,
          contents,
          config,
        });
      } catch (error) {
        lastError = error;

        if (!RETRYABLE_STATUS_CODES.includes(getNumericErrorStatus(error))) {
          throw error;
        }

        if (attempt === 0) {
          await sleep(1000 + Math.floor(Math.random() * 500));
        }
      }
    }
  }

  throw lastError || new Error("All Gemini models failed.");
};

const sendAIError = (res, error, defaultMessage) => {
  const status = getNumericErrorStatus(error);

  console.error("AI Controller Error:", error?.message || error);

  if (error?.code === "AI_KEY_MISSING") {
    return res.status(503).json({
      success: false,
      message: "Gemini API key is not configured.",
      code: "AI_KEY_MISSING",
    });
  }

  if (error?.code === "CLOUDINARY_CONFIG_MISSING") {
    return res.status(503).json({
      success: false,
      message: "Cloudinary is not configured. Check your environment variables.",
      code: "CLOUDINARY_CONFIG_MISSING",
    });
  }

  if (status === 400) {
    return res.status(400).json({
      success: false,
      message: "Invalid request sent to Gemini AI.",
      code: "AI_BAD_REQUEST",
    });
  }

  if (status === 401 || status === 403) {
    return res.status(401).json({
      success: false,
      message: "Gemini authentication failed. Check your GEMINI_API_KEY.",
      code: "AI_AUTH_ERROR",
    });
  }

  if (status === 429) {
    return res.status(429).json({
      success: false,
      message: "AI request limit reached. Please try again later.",
      code: "AI_RATE_LIMIT",
    });
  }

  if (status === 404 || [408, 500, 502, 503, 504].includes(status)) {
    return res.status(503).json({
      success: false,
      message: "AI service is temporarily unavailable. Please try again shortly.",
      code: "AI_UNAVAILABLE",
    });
  }

  return res.status(500).json({
    success: false,
    message: defaultMessage,
    code: "AI_ERROR",
  });
};

const parseAIJSON = (text) => {
  if (typeof text !== "string") return null;

  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
};

const normalizeCategory = (category) => {
  if (typeof category !== "string") return "";

  return category
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/[.!?]+$/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const normalizeReceiptAmount = (value) => {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "number") {
    return Number.isFinite(value) && value >= 0 ? value : null;
  }

  if (typeof value !== "string") return null;

  const cleaned = value
    .trim()
    .replace(/^(₹|rs\.?|inr|usd|eur|gbp)\s*/i, "")
    .replace(/[₹$€£,\s]/g, "");

  if (!cleaned || !/^\d+(\.\d+)?$/.test(cleaned)) return null;

  const amount = Number(cleaned);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
};

const normalizeReceiptDate = (value) => {
  if (typeof value !== "string" || !value.trim()) return null;

  const input = value.trim();
  let year;
  let month;
  let day;

  let match = input.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);

  if (match) {
    day = Number(match[1]);
    month = Number(match[2]);
    year = Number(match[3]);
  } else {
    match = input.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);

    if (match) {
      year = Number(match[1]);
      month = Number(match[2]);
      day = Number(match[3]);
    } else {
      const parsed = new Date(input);
      return Number.isNaN(parsed.getTime())
        ? null
        : parsed.toISOString().slice(0, 10);
    }
  }

  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

const extractChartMonths = (message) => {
  const match = String(message || "").toLowerCase().match(
    /\b(?:last|past|previous)\s+(\d{1,2})\s+months?\b/
  );

  if (match) {
    const months = Number(match[1]);
    if (Number.isInteger(months) && months >= 1 && months <= 24) {
      return months;
    }
  }

  if (/\bthis\s+year\b/i.test(message)) {
    return new Date().getMonth() + 1;
  }

  return 12;
};

const getDeterministicChartAction = (message) => {
  const normalized = String(message || "")
    .toLowerCase()
    .replace(/[^\w\s&/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return null;

  const months = extractChartMonths(normalized);

  const rules = [
    {
      action: "get_income_vs_expense_chart",
      patterns: [
        /\bincome\s*(vs|versus|and)\s*(expense|expenses)\b/,
        /\bcompare\s+(my\s+)?income\b/,
        /\bincome\s+against\s+(my\s+)?expenses?\b/,
        /\bincome\s+expense\s+(graph|chart)\b/,
      ],
      arguments: { months },
    },
    {
      action: "get_category_breakdown",
      patterns: [
        /\bspending\s+by\s+categor(y|ies)\b/,
        /\bexpenses?\s+by\s+categor(y|ies)\b/,
        /\bcategory\s+breakdown\b/,
        /\bcategory[-\s]?wise\s+expenses?\b/,
        /\bwhere\s+am\s+i\s+spending\b/,
      ],
      arguments: { limit: 10 },
    },
    {
      action: "get_monthly_financial_chart",
      patterns: [
        /\bmonthly\s+financial\s+(graph|chart|overview)\b/,
        /\bmonthly\s+money\s+trend\b/,
        /\bfinancial\s+trend\b/,
      ],
      arguments: { months },
    },
    {
      action: "get_expense_chart",
      patterns: [
        /\bexpense\s+graph\b/,
        /\bexpenses?\s+graph\b/,
        /\bexpense\s+chart\b/,
        /\bexpenses?\s+chart\b/,
        /\bexpense\s+trend\b/,
        /\bexpenses?\s+over\s+time\b/,
        /\bvisuali[sz]e\s+(my\s+)?expenses?\b/,
      ],
      arguments: { months },
    },
    {
      action: "get_income_chart",
      patterns: [
        /\bincome\s+graph\b/,
        /\bincome\s+chart\b/,
        /\bincome\s+trend\b/,
        /\bvisuali[sz]e\s+(my\s+)?income\b/,
      ],
      arguments: { months },
    },
  ];

  for (const rule of rules) {
    if (rule.patterns.some((pattern) => pattern.test(normalized))) {
      return {
        mode: "action",
        action: rule.action,
        arguments: rule.arguments,
      };
    }
  }

  return null;
};

const getUserAIContext = async (userId) => {
  const [accounts, transactions, receipts] = await Promise.all([
    Account.find({ user: userId })
      .select("_id name type balance")
      .sort({ createdAt: 1 })
      .lean(),

    Expense.find({ user: userId })
      .select("_id title amount category type date account toAccount transferAccount transferMode")
      .populate("account", "name type")
      .populate("transferAccount", "name type")
      .sort({ date: -1, createdAt: -1 })
      .limit(20)
      .lean(),

    ReceiptScan.find({ user: userId })
      .select("_id merchant date currency subtotal tax total items transaction createdAt")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean(),
  ]);

  const linkedIds = receipts
    .filter((receipt) => receipt.transaction)
    .map((receipt) => receipt.transaction);

  const linkedTransactions = linkedIds.length
    ? await Expense.find({
        _id: { $in: linkedIds },
        user: userId,
      })
        .select("_id title type amount")
        .lean()
    : [];

  const linkedMap = new Map(
    linkedTransactions.map((transaction) => [
      transaction._id.toString(),
      transaction,
    ])
  );

  return {
    accounts: accounts.map((account) => ({
      id: account._id.toString(),
      name: account.name,
      type: account.type,
      balance: Number(account.balance || 0),
    })),

    recentTransactions: transactions.map((transaction) => ({
      id: transaction._id.toString(),
      title: transaction.title || "",
      amount: Number(transaction.amount || 0),
      category: transaction.category || "Other",
      type: transaction.type,
      date: transaction.date,
      account: transaction.account
        ? {
            id: transaction.account._id?.toString(),
            name: transaction.account.name,
            type: transaction.account.type,
          }
        : null,
      toAccount: transaction.toAccount || "",
      transferAccount: transaction.transferAccount
        ? {
            id: transaction.transferAccount._id?.toString(),
            name: transaction.transferAccount.name,
            type: transaction.transferAccount.type,
          }
        : null,
      transferMode: transaction.transferMode || null,
    })),

    receiptScanCount: receipts.length,

    recentReceiptScans: receipts.map((receipt) => {
      const linked = receipt.transaction
        ? linkedMap.get(receipt.transaction.toString())
        : null;

      return {
        id: receipt._id.toString(),
        merchant: receipt.merchant || "Unknown Merchant",
        date: receipt.date || null,
        currency: receipt.currency || "INR",
        subtotal: Number(receipt.subtotal || 0),
        tax: Number(receipt.tax || 0),
        total: Number(receipt.total || 0),
        itemCount: Array.isArray(receipt.items) ? receipt.items.length : 0,
        items: (receipt.items || []).slice(0, 20).map((item) => ({
          name: item.name || "",
          quantity: Number(item.quantity || 0),
          price: Number(item.price || 0),
          total: Number(item.total || 0),
        })),
        transactionLinked: Boolean(linked),
        linkedTransaction: linked
          ? {
              title: linked.title || "",
              type: linked.type,
              amount: Number(linked.amount || 0),
            }
          : null,
        savedAt: receipt.createdAt || null,
      };
    }),
  };
};

const formatReceiptDate = (date) => {
  if (!date) return "Date not recorded";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Date not recorded";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatMoney = (amount, currency = "INR") => {
  const value = Number(amount);

  if (!Number.isFinite(value)) return "Amount not recorded";

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency || "INR"} ${value.toFixed(2)}`;
  }
};

const getReceiptQuestionAnswer = (message, context) => {
  const text = String(message || "").toLowerCase();

  const mentionsReceipts =
    /\b(receipt|receipts|ai scan|scanned receipt|scan history|receipt history)\b/.test(text);

  if (!mentionsReceipts) return null;

  const asksCount =
    /\b(how many|count|number of|total number|total receipts|receipt count)\b/.test(text);

  const asksLatest =
    /\b(latest|last|recent|newest|most recent)\b/.test(text);

  const asksList =
    /\b(show|list|display|view|find|get)\b/.test(text) &&
    /\b(receipt|receipts|history|scanned)\b/.test(text);

  const asksFeature =
    /\b(what is|what does|how does|how to|can i|does .* support|tell me about)\b/.test(text);

  if (asksFeature && !asksCount && !asksLatest && !asksList) {
    return (
      "SmaXTify includes an AI Receipt Scanner. You can upload a receipt image, " +
      "extract visible details such as merchant, date, total, tax and items, " +
      "review the result, save it, and manage saved scans in Scan History."
    );
  }

  const receipts = context.recentReceiptScans || [];
  const count = Number(context.receiptScanCount || 0);

  if (asksCount) {
    if (count === 0) {
      return (
        "I checked your saved AI Scan receipt records and found **0 receipts** " +
        "in the latest 50-record history query. The AI Receipt Scanner feature is available, " +
        "but no saved receipt records were returned for your account."
      );
    }

    return (
      `I found **${count} saved AI Scan receipt${count === 1 ? "" : "s"}** ` +
      "in the receipt records checked. The history query includes up to the latest 50 receipts."
    );
  }

  if (asksLatest || asksList) {
    if (receipts.length === 0) {
      return (
        "I checked your saved AI Scan history, but no receipt records were found. " +
        "You can scan a receipt in the AI Scan section and save it to build your history."
      );
    }

    const selected = asksLatest ? receipts.slice(0, 1) : receipts.slice(0, 10);

    const lines = selected.map((receipt, index) => {
      const items = (receipt.items || [])
        .slice(0, 5)
        .map((item) => item.name)
        .filter(Boolean);

      const itemText = items.length
        ? ` Items: ${items.join(", ")}${receipt.itemCount > items.length ? ", and more" : ""}.`
        : "";

      return (
        `${index + 1}. **${receipt.merchant || "Unknown Merchant"}** — ` +
        `${formatMoney(receipt.total, receipt.currency)}; ` +
        `date: ${formatReceiptDate(receipt.date)}; ` +
        `${receipt.itemCount} item(s).${itemText}`
      );
    });

    const intro = asksLatest
      ? "Your latest saved AI Scan receipt is:"
      : `Here are your ${selected.length} most recent saved AI Scan receipt(s):`;

    return `${intro}\n\n${lines.join("\n\n")}`;
  }

  return null;
};

const generateAIActionDecision = async ({ message, chat, userContext }) => {
  const history = chat.messages
    .slice(-20)
    .map((item) => `${String(item.role).toUpperCase()}: ${item.text}`)
    .join("\n");

  const prompt = `
You are SmaXTify.AI, the personal finance assistant built into SmaXTify.

SmaXTify has an AI Receipt Scanner. Users can scan receipt images, extract merchant, date, currency, subtotal, tax, total and line items, review extracted details, save scans, and view, edit or delete saved receipt history.

Never claim the AI Scan feature does not exist. Receipt questions should be answered from the supplied authenticated user context. If there are no saved records, distinguish that from the feature being unavailable. The context contains up to the latest 50 saved receipt records, not necessarily all historical records.

Other application sections include Dashboard, Accounts, Budget Planner, Savings Goals, Reports, Currency Converter, Subscription Tracker, Bill Reminders, Notifications and Settings.

Never invent financial records, amounts, IDs or actions. Never claim an action completed unless the executor confirms it. Do not execute modifications for read-only requests. Ask for clarification when needed.

Only choose actions supported by the current action executor. Do not assume that a section name means an action exists.

Supported action names may include:
create_transaction, update_transaction, delete_transaction, get_accounts,
get_financial_summary, get_income_chart, get_expense_chart,
get_income_vs_expense_chart, get_category_breakdown,
get_monthly_financial_chart.

For chart requests, select the corresponding chart action. Default period is 12 months; use the user's requested month count when stated.

Conversation:
${history}

Current user message:
${message}

Authenticated user data:
${JSON.stringify(userContext, null, 2)}

Return only valid JSON:
{"mode":"chat","reply":"Your response"}
or
{"mode":"action","action":"get_accounts","arguments":{}}
`;

  const response = await generateGeminiContent({
    contents: prompt,
    config: {
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          mode: { type: "string" },
          reply: { type: "string" },
          action: { type: "string" },
          arguments: { type: "object" },
        },
        required: ["mode"],
      },
    },
  });

  const parsed = parseAIJSON(response.text || "");

  if (!parsed || !["chat", "action"].includes(parsed.mode)) {
    throw new Error("AI returned an invalid structured response.");
  }

  return parsed;
};

const generateChatTitle = async (conversation) => {
  try {
    const response = await generateGeminiContent({
      contents:
        `Generate a short chat title of no more than 5 words. Return only the title without quotes or punctuation.\n\n${conversation}`,
      config: { temperature: 0.2 },
    });

    return (
      response.text?.trim().replace(/^["']|["']$/g, "").replace(/[.!?]+$/g, "") ||
      "New Chat"
    );
  } catch (error) {
    console.error("AI Title Error:", error?.message || error);
    return "New Chat";
  }
};

const saveMessages = async (chat, userMessage, assistantMessage) => {
  chat.messages.push(
    { role: "user", text: userMessage, time: new Date() },
    { role: "assistant", text: assistantMessage, time: new Date() }
  );

  if (chat.title === "New Chat") {
    chat.title = await generateChatTitle(
      `USER:\n${userMessage}\n\nASSISTANT:\n${assistantMessage}`
    );
  }

  await chat.save();
};

const getConfirmationDescription = (action) => {
  const descriptions = {
    update_transaction: "update that transaction",
    delete_transaction: "delete that transaction",
    update_account: "update that account",
    delete_account: "delete that account",
    save_budget: "save these budget changes",
    delete_budget: "delete that budget",
    add_goal_savings: "add that amount to your savings goal",
    update_goal: "update that savings goal",
    delete_goal: "delete that savings goal",
    update_subscription: "update that subscription",
    delete_subscription: "delete that subscription",
  };

  return descriptions[action] || "perform this action";
};

exports.chatWithGemini = async (req, res) => {
  try {
    const { message, chatId, confirmed = false } = req.body;

    if (!chatId || !message || !String(message).trim()) {
      return res.status(400).json({
        success: false,
        message: "chatId and message are required.",
      });
    }

    const chat = await Chat.findOne({
      _id: chatId,
      user: req.user.id,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found.",
      });
    }

    const cleanMessage = String(message).trim();
    const context = await getUserAIContext(req.user.id);

    // Receipt questions are answered directly from MongoDB, not by Gemini.
    const receiptAnswer = getReceiptQuestionAnswer(cleanMessage, context);

    if (receiptAnswer) {
      await saveMessages(chat, cleanMessage, receiptAnswer);

      return res.status(200).json({
        success: true,
        reply: receiptAnswer,
        title: chat.title,
        action: null,
        executed: false,
      });
    }

    let decision = getDeterministicChartAction(cleanMessage);

    if (!decision) {
      decision = await generateAIActionDecision({
        message: cleanMessage,
        chat,
        userContext: context,
      });
    }

    if (decision.mode === "action") {
      const action = decision.action;
      const args = decision.arguments || {};
      const validation = validateAction({ action, args });

      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.errors.join(" "),
          code: "INVALID_AI_ACTION",
        });
      }

      const needsConfirmation = actionNeedsConfirmation(action);

      if (needsConfirmation && confirmed !== true) {
        const confirmationMessage =
          `I can ${getConfirmationDescription(action)}. Please confirm if you want me to continue.`;

        chat.messages.push({
          role: "assistant",
          text: confirmationMessage,
          time: new Date(),
        });

        await chat.save();

        return res.status(200).json({
          success: true,
          reply: confirmationMessage,
          action: {
            name: validation.actionDefinition.name,
            arguments: args,
            requiresConfirmation: true,
            confirmed: false,
          },
          executed: false,
        });
      }

      const result = await executeAIAction({
        userId: req.user.id,
        action,
        args,
      });

      if (!result.success) {
        return res.status(400).json({
          success: false,
          reply: result.message,
          action: { name: action, arguments: args },
          executed: false,
          code: result.code,
        });
      }

      const reply = result.message || "Action completed successfully.";

      await saveMessages(chat, cleanMessage, reply);

      return res.status(200).json({
        success: true,
        reply,
        action: {
          name: validation.actionDefinition.name,
          arguments: args,
          requiresConfirmation: needsConfirmation,
          confirmed: needsConfirmation,
        },
        executed: true,
        result: result.data,
      });
    }

    const reply =
      typeof decision.reply === "string" && decision.reply.trim()
        ? decision.reply.trim()
        : "Sorry, I couldn't generate a response.";

    await saveMessages(chat, cleanMessage, reply);

    return res.status(200).json({
      success: true,
      reply,
      title: chat.title,
      action: null,
      executed: false,
    });
  } catch (error) {
    return sendAIError(res, error, "Failed to generate AI response.");
  }
};

exports.generateReportInsights = async (req, res) => {
  try {
    const {
      income = 0,
      expense = 0,
      balance = 0,
      savings = 0,
      totalTransactions = 0,
      transactions = [],
    } = req.body;

    if (!Array.isArray(transactions)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction data.",
      });
    }

    const data = transactions.map((transaction) => ({
      title: transaction.title || "Untitled",
      category: transaction.category || "Other",
      amount: Number(transaction.amount) || 0,
      type: transaction.type || "Expense",
      date: transaction.date || null,
    }));

    const prompt = `
You are SmaXTify.AI, a professional personal finance analyst.
Provide exactly 4 concise, practical insights using only the supplied data.
Do not invent transactions, amounts, dates or categories. Do not give investment, tax or legal advice.

Income: ₹${Number(income).toLocaleString("en-IN")}
Expenses: ₹${Number(expense).toLocaleString("en-IN")}
Balance: ₹${Number(balance).toLocaleString("en-IN")}
Savings rate: ${Number(savings)}%
Total transactions: ${Number(totalTransactions)}

Transactions:
${JSON.stringify(data, null, 2)}

Return JSON:
{"insights":[{"type":"spending","title":"Short title","message":"Useful insight","priority":"neutral"}]}
`;

    const response = await generateGeminiContent({
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  title: { type: "string" },
                  message: { type: "string" },
                  priority: { type: "string" },
                },
                required: ["type", "title", "message", "priority"],
              },
            },
          },
          required: ["insights"],
        },
      },
    });

    const parsed = parseAIJSON(response.text || "");

    if (!parsed || !Array.isArray(parsed.insights)) {
      return res.status(500).json({
        success: false,
        message: "AI returned an invalid insight format.",
        code: "AI_INVALID_RESPONSE",
      });
    }

    return res.status(200).json({
      success: true,
      insights: parsed.insights.slice(0, 4),
    });
  } catch (error) {
    return sendAIError(res, error, "Failed to generate financial insights.");
  }
};

exports.categorizeTransaction = async (req, res) => {
  try {
    const { title, type } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        success: false,
        message: "Transaction title is required.",
        code: "TITLE_REQUIRED",
      });
    }

    if (type !== "Income" && type !== "Expense") {
      return res.status(400).json({
        success: false,
        message: "Transaction type must be Income or Expense.",
        code: "INVALID_TRANSACTION_TYPE",
      });
    }

    const prompt = `
You are SmaXTify.AI's financial transaction categorization engine.
Choose one accurate category. Use Title Case, maximum 3 words, no punctuation.
Use Other only if there is genuinely insufficient information.
Return only JSON: {"category":"Category Name"}

Transaction title: "${String(title).trim()}"
Transaction type: "${type}"

Examples:
Food, cake, juice -> Food & Beverages
Vegetables, fruits, groceries -> Groceries
Medicines, doctors, hospitals -> Healthcare
Books and educational materials -> Education
Skincare and grooming -> Personal Care
Clothing and footwear -> Shopping
Phones and laptops -> Electronics
Petrol and diesel -> Fuel
Taxi, bus, metro -> Transport
Electricity payments -> Electricity
Internet and broadband -> Internet
Netflix and recurring digital services -> Subscription
Hotels and lodging -> Accommodation
Salary -> Salary
Freelance income -> Freelance
Refunds and cashback -> Refund
`;

    const response = await generateGeminiContent({
      contents: prompt,
      config: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: { category: { type: "string" } },
          required: ["category"],
        },
      },
    });

    const parsed = parseAIJSON(response.text || "");
    const category = normalizeCategory(parsed?.category || "");

    if (!category) {
      return res.status(500).json({
        success: false,
        message: "AI did not return a valid category. Please enter it manually.",
        code: "AI_INVALID_CATEGORY",
      });
    }

    return res.status(200).json({
      success: true,
      category,
      source: "ai",
    });
  } catch (error) {
    return sendAIError(
      res,
      error,
      "Failed to detect transaction category. You can enter the category manually."
    );
  }
};

const uploadReceiptImage = (file, userId) =>
  new Promise((resolve, reject) => {
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      const error = new Error("Cloudinary is not configured.");
      error.code = "CLOUDINARY_CONFIG_MISSING";
      return reject(error);
    }

    const upload = cloudinary.uploader.upload_stream(
      {
        folder: `smaxtify/receipts/${userId}`,
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);

        if (!result?.secure_url || !result?.public_id) {
          return reject(new Error("Cloudinary did not return image details."));
        }

        resolve({
          imageUrl: result.secure_url,
          imagePublicId: result.public_id,
        });
      }
    );

    upload.end(file.buffer);
  });

exports.scanReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a receipt image.",
        code: "RECEIPT_IMAGE_REQUIRED",
      });
    }

    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
    ];

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Unsupported image format. Please upload a JPG, PNG, WebP, HEIC or HEIF image.",
        code: "UNSUPPORTED_IMAGE_FORMAT",
      });
    }

    const prompt = `
You are SmaXTify.AI, a receipt information extraction assistant.
Extract only information clearly visible in the uploaded image.
Do not invent missing information. Use null for unavailable amounts or dates.
Amounts must be JSON numbers. Return the total payable when visible.
Extract merchant, date, currency, subtotal, tax, total and item names, quantities and prices.
If the image is not a receipt, set isReceipt to false.
Use YYYY-MM-DD dates where possible.
Return only JSON:
{
  "isReceipt": true,
  "merchant": "Example Store",
  "date": "2025-01-28",
  "currency": "INR",
  "subtotal": 100,
  "tax": 5,
  "total": 105,
  "items": [{"name":"Example Item","quantity":1,"price":100}]
}
`;

    const response = await generateGeminiContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: req.file.mimetype,
                data: req.file.buffer.toString("base64"),
              },
            },
          ],
        },
      ],
      config: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    });

    const extracted = parseAIJSON(response.text || "");

    if (
      !extracted ||
      typeof extracted.isReceipt !== "boolean" ||
      !Array.isArray(extracted.items)
    ) {
      return res.status(500).json({
        success: false,
        message: "AI returned an invalid receipt format. Please try another image.",
        code: "AI_INVALID_RECEIPT_RESPONSE",
      });
    }

    if (!extracted.isReceipt) {
      return res.status(400).json({
        success: false,
        message: "The uploaded image does not appear to be a receipt.",
        code: "NOT_A_RECEIPT",
      });
    }

    let image;

    try {
      image = await uploadReceiptImage(req.file, req.user.id);
    } catch (uploadError) {
      console.error("Receipt image upload error:", uploadError?.message || uploadError);

      return res.status(502).json({
        success: false,
        message:
          uploadError?.code === "CLOUDINARY_CONFIG_MISSING"
            ? "Cloudinary is not configured. Check your environment variables."
            : "Receipt was scanned, but its image could not be uploaded. Please try again.",
        code:
          uploadError?.code === "CLOUDINARY_CONFIG_MISSING"
            ? "CLOUDINARY_CONFIG_MISSING"
            : "RECEIPT_IMAGE_UPLOAD_FAILED",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Receipt scanned successfully. Please review the extracted details.",
      receipt: {
        merchant: typeof extracted.merchant === "string" ? extracted.merchant.trim() : null,
        date: normalizeReceiptDate(extracted.date),
        currency: typeof extracted.currency === "string" ? extracted.currency.trim() : "INR",
        subtotal: normalizeReceiptAmount(extracted.subtotal),
        tax: normalizeReceiptAmount(extracted.tax),
        total: normalizeReceiptAmount(extracted.total),
        items: extracted.items.map((item) => ({
          name: typeof item?.name === "string" ? item.name.trim() : "",
          quantity: normalizeReceiptAmount(item?.quantity),
          price: normalizeReceiptAmount(item?.price),
        })),
        imageUrl: image.imageUrl,
        imagePublicId: image.imagePublicId,
      },
    });
  } catch (error) {
    return sendAIError(res, error, "Failed to scan receipt. Please try again.");
  }
};
