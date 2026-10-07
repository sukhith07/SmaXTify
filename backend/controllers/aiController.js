const { GoogleGenAI } = require("@google/genai");
const cloudinary = require("cloudinary").v2;

const Chat = require("../models/Chat");
const Expense = require("../models/Expense");
const Account = require("../models/Account");

const {
  executeAIAction,
} = require("../services/ai/aiActionExecutor");

const {
  validateAction,
  actionNeedsConfirmation,
} = require("../services/ai/aiActionValidator");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const GEMINI_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
];

const MAX_RETRIES_PER_MODEL = 1;

const RETRYABLE_STATUS_CODES = [
  408,
  429,
  500,
  502,
  503,
  504,
];

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

const isRetryableError = (error) =>
  RETRYABLE_STATUS_CODES.includes(
    getNumericErrorStatus(error)
  );

const sleep = (milliseconds) =>
  new Promise((resolve) =>
    setTimeout(resolve, milliseconds)
  );

const generateGeminiContent = async ({
  contents,
  config = {},
}) => {
  if (!GEMINI_API_KEY) {
    const error = new Error(
      "Gemini API key is not configured."
    );

    error.status = 503;
    error.code = "AI_KEY_MISSING";

    throw error;
  }

  let lastError = null;

  for (const model of GEMINI_MODELS) {
    for (
      let attempt = 0;
      attempt <= MAX_RETRIES_PER_MODEL;
      attempt++
    ) {
      try {
        console.log(
          `Gemini request: ${model} | attempt ${attempt + 1}`
        );

        const response =
          await ai.models.generateContent({
            model,
            contents,
            config,
          });

        console.log(`Gemini success: ${model}`);

        return response;
      } catch (error) {
        lastError = error;

        const status =
          getNumericErrorStatus(error);

        console.error(
          `Gemini error: ${model} | status: ${status} | attempt: ${
            attempt + 1
          } | message: ${error?.message || error}`
        );

        if (!isRetryableError(error)) {
          throw error;
        }

        if (
          attempt < MAX_RETRIES_PER_MODEL
        ) {
          const delay =
            1000 * Math.pow(2, attempt) +
            Math.floor(Math.random() * 500);

          await sleep(delay);
        }
      }
    }
  }

  throw (
    lastError ||
    new Error("All Gemini models failed.")
  );
};

const uploadReceiptImage = (file, userId) =>
  new Promise((resolve, reject) => {
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      const error = new Error(
        "Cloudinary is not configured."
      );

      error.code = "CLOUDINARY_CONFIG_MISSING";

      return reject(error);
    }

    const upload =
      cloudinary.uploader.upload_stream(
        {
          folder: `smaxtify/receipts/${userId}`,
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }

          if (
            !result?.secure_url ||
            !result?.public_id
          ) {
            return reject(
              new Error(
                "Cloudinary did not return image details."
              )
            );
          }

          resolve({
            imageUrl: result.secure_url,
            imagePublicId: result.public_id,
          });
        }
      );

    upload.end(file.buffer);
  });

const sendAIError = (
  res,
  error,
  defaultMessage
) => {
  const status = getNumericErrorStatus(error);

  console.error(
    "Gemini Error:",
    error?.message || error
  );

  if (
    error?.code === "AI_KEY_MISSING"
  ) {
    return res.status(503).json({
      success: false,
      message:
        "Gemini API key is not configured.",
      code: "AI_KEY_MISSING",
    });
  }

  if (
    error?.code ===
    "CLOUDINARY_CONFIG_MISSING"
  ) {
    return res.status(503).json({
      success: false,
      message:
        "Cloudinary is not configured. Check your Cloudinary environment variables.",
      code: "CLOUDINARY_CONFIG_MISSING",
    });
  }

  if (status === 400) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid request sent to Gemini AI.",
      code: "AI_BAD_REQUEST",
    });
  }

  if (
    status === 401 ||
    status === 403
  ) {
    return res.status(401).json({
      success: false,
      message:
        "Gemini authentication failed. Check your GEMINI_API_KEY.",
      code: "AI_AUTH_ERROR",
    });
  }

  if (status === 429) {
    return res.status(429).json({
      success: false,
      message:
        "AI request limit reached. Please try again later.",
      code: "AI_RATE_LIMIT",
    });
  }

  if (status === 404) {
    return res.status(503).json({
      success: false,
      message:
        "The configured AI model is currently unavailable.",
      code: "AI_MODEL_UNAVAILABLE",
    });
  }

  if (
    [408, 500, 502, 503, 504].includes(
      status
    )
  ) {
    return res.status(503).json({
      success: false,
      message:
        "AI service is temporarily unavailable. Please try again shortly.",
      code: "AI_UNAVAILABLE",
    });
  }

  return res.status(500).json({
    success: false,
    message: defaultMessage,
    code: "AI_ERROR",
  });
};

const normalizeCategory = (category) => {
  if (typeof category !== "string") {
    return "";
  }

  return category
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/[.!?]+$/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase()
    )
    .join(" ");
};

const parseAIJSON = (text) => {
  if (typeof text !== "string") {
    return null;
  }

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

const normalizeReceiptAmount = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) &&
      value >= 0
      ? value
      : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value
    .trim()
    .replace(
      /^(₹|rs\.?|inr|usd|eur|gbp)\s*/i,
      ""
    )
    .replace(/[₹$€£,\s]/g, "");

  if (
    !cleaned ||
    !/^\d+(\.\d+)?$/.test(cleaned)
  ) {
    return null;
  }

  const amount = Number(cleaned);

  return Number.isFinite(amount) &&
    amount >= 0
    ? amount
    : null;
};

const normalizeReceiptDate = (value) => {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return null;
  }

  const date = value.trim();

  const dayFirstMatch = date.match(
    /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/
  );

  if (dayFirstMatch) {
    const day = Number(
      dayFirstMatch[1]
    );

    const month = Number(
      dayFirstMatch[2]
    );

    const year = Number(
      dayFirstMatch[3]
    );

    const parsed = new Date(
      Date.UTC(
        year,
        month - 1,
        day
      )
    );

    if (
      parsed.getUTCFullYear() !== year ||
      parsed.getUTCMonth() !== month - 1 ||
      parsed.getUTCDate() !== day
    ) {
      return null;
    }

    return `${year}-${String(month).padStart(
      2,
      "0"
    )}-${String(day).padStart(
      2,
      "0"
    )}`;
  }

  const yearFirstMatch = date.match(
    /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/
  );

  if (yearFirstMatch) {
    const year = Number(
      yearFirstMatch[1]
    );

    const month = Number(
      yearFirstMatch[2]
    );

    const day = Number(
      yearFirstMatch[3]
    );

    const parsed = new Date(
      Date.UTC(
        year,
        month - 1,
        day
      )
    );

    if (
      parsed.getUTCFullYear() !== year ||
      parsed.getUTCMonth() !== month - 1 ||
      parsed.getUTCDate() !== day
    ) {
      return null;
    }

    return `${year}-${String(month).padStart(
      2,
      "0"
    )}-${String(day).padStart(
      2,
      "0"
    )}`;
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
};

const extractChartMonths = (message) => {
  if (typeof message !== "string") {
    return 12;
  }

  const normalized =
    message.toLowerCase();

  const match = normalized.match(
    /\b(?:last|past|previous)\s+(\d{1,2})\s+months?\b/
  );

  if (match) {
    const months = Number(match[1]);

    if (
      Number.isInteger(months) &&
      months >= 1 &&
      months <= 24
    ) {
      return months;
    }
  }

  if (/\bthis\s+year\b/.test(normalized)) {
    return Math.min(
      new Date().getMonth() + 1,
      24
    );
  }

  return 12;
};

const getDeterministicChartAction = (
  message
) => {
  if (typeof message !== "string") {
    return null;
  }

  const normalized = message
    .toLowerCase()
    .replace(/[^\w\s&/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) {
    return null;
  }

  const months =
    extractChartMonths(normalized);

  const patterns = [
    {
      action:
        "get_income_vs_expense_chart",

      patterns: [
        /\bincome\s*(vs|versus|and)\s*(expense|expenses)\b/,
        /\b(income|expenses?)\s*(comparison|compare)\b/,
        /\bcompare\s+(my\s+)?(income|expenses?)\b/,
        /\bincome\s+against\s+(my\s+)?expenses?\b/,
        /\bincome\s+expense\s+(graph|chart)\b/,
      ],

      arguments: {
        months,
      },
    },

    {
      action:
        "get_category_breakdown",

      patterns: [
        /\bspending\s+by\s+categor(y|ies)\b/,
        /\bexpenses?\s+by\s+categor(y|ies)\b/,
        /\bcategory\s+breakdown\b/,
        /\bcategory[-\s]?wise\s+expenses?\b/,
        /\bwhere\s+am\s+i\s+spending\b/,
        /\bshow\s+my\s+spending\s+categor(y|ies)\b/,
      ],

      arguments: {
        limit: 10,
      },
    },

    {
      action:
        "get_monthly_financial_chart",

      patterns: [
        /\bmonthly\s+financial\s+(graph|chart|overview)\b/,
        /\bmonthly\s+(income|expense|expenses?)\s+(and|vs)\s+(expense|expenses?|income)\b/,
        /\bmonthly\s+money\s+trend\b/,
        /\bfinancial\s+trend\b/,
        /\bmonthly\s+financial\s+trend\b/,
      ],

      arguments: {
        months,
      },
    },

    {
      action: "get_expense_chart",

      patterns: [
        /\bexpense\s+graph\b/,
        /\bexpenses?\s+graph\b/,
        /\bexpense\s+chart\b/,
        /\bexpenses?\s+chart\b/,
        /\bexpense\s+trend\b/,
        /\bexpenses?\s+trend\b/,
        /\bexpenses?\s+over\s+time\b/,
        /\bvisuali[sz]e\s+(my\s+)?expenses?\b/,
        /\bmonthly\s+expense\s+(graph|chart)\b/,
      ],

      arguments: {
        months,
      },
    },

    {
      action: "get_income_chart",

      patterns: [
        /\bincome\s+graph\b/,
        /\bincome\s+chart\b/,
        /\bincome\s+trend\b/,
        /\bincome\s+over\s+time\b/,
        /\bvisuali[sz]e\s+(my\s+)?income\b/,
        /\bmonthly\s+income\s+(graph|chart)\b/,
      ],

      arguments: {
        months,
      },
    },
  ];

  for (const item of patterns) {
    if (
      item.patterns.some((pattern) =>
        pattern.test(normalized)
      )
    ) {
      return {
        mode: "action",
        action: item.action,
        arguments: item.arguments,
      };
    }
  }

  return null;
};

const getUserAIContext = async (
  userId
) => {
  const [
    accounts,
    recentTransactions,
  ] = await Promise.all([
    Account.find({
      user: userId,
    })
      .select("_id name type balance")
      .sort({
        createdAt: 1,
      })
      .lean(),

    Expense.find({
      user: userId,
    })
      .select(
        "_id title amount category type date account toAccount transferAccount transferMode"
      )
      .populate(
        "account",
        "name type"
      )
      .populate(
        "transferAccount",
        "name type"
      )
      .sort({
        date: -1,
        createdAt: -1,
      })
      .limit(20)
      .lean(),
  ]);

  return {
    accounts: accounts.map(
      (account) => ({
        id: account._id.toString(),
        name: account.name,
        type: account.type,
        balance: Number(
          account.balance || 0
        ),
      })
    ),

    recentTransactions:
      recentTransactions.map(
        (transaction) => ({
          id: transaction._id.toString(),
          title:
            transaction.title || "",
          amount: Number(
            transaction.amount || 0
          ),
          category:
            transaction.category || "Other",
          type: transaction.type,
          date: transaction.date,

          account:
            transaction.account
              ? {
                  id: transaction.account._id?.toString(),
                  name: transaction.account.name,
                  type: transaction.account.type,
                }
              : null,

          toAccount:
            transaction.toAccount || "",

          transferAccount:
            transaction.transferAccount
              ? {
                  id: transaction.transferAccount._id?.toString(),
                  name: transaction.transferAccount.name,
                  type: transaction.transferAccount.type,
                }
              : null,

          transferMode:
            transaction.transferMode ||
            null,
        })
      ),
  };
};

const generateAIActionDecision = async ({
  message,
  chat,
  userContext,
}) => {
  let conversationHistory = "";

  chat.messages
    .slice(-20)
    .forEach((msg) => {
      conversationHistory += `${msg.role.toUpperCase()}: ${msg.text}\n`;
    });

  const prompt = `
You are SmaXTify.AI, the intelligent assistant inside the SmaXTify personal finance application.

Determine whether the user's request is normal conversation or a supported application action.

Security rules:

- Never invent database IDs, account IDs, or transaction IDs.
- Use IDs only from the supplied context.
- Never create arbitrary database queries.
- Never execute actions yourself.
- Return only one supported action when clearly requested.
- If unclear, use chat mode and ask a clarification question.
- Do not claim an action was completed unless the backend confirms it.
- Never modify data when the user only asks to view, analyze, summarize, or visualize it.

Supported actions:

Transactions: create_transaction, update_transaction, delete_transaction
Accounts: get_accounts
Financial summary: get_financial_summary
Budget: get_budget, save_budget, delete_budget
Savings goals: get_goals, create_goal, add_goal_savings, update_goal, delete_goal
Subscriptions: get_subscriptions, create_subscription, update_subscription, delete_subscription
Navigation: navigate
Charts: get_income_chart, get_expense_chart, get_income_vs_expense_chart, get_category_breakdown, get_monthly_financial_chart
Reports: get_report_data

Visualization rules:

- Graph, chart, visualization, trend, breakdown, comparison, or financial graph requests must use the appropriate chart action.
- Income graph -> get_income_chart.
- Expense graph -> get_expense_chart.
- Income versus expenses -> get_income_vs_expense_chart.
- Spending by category -> get_category_breakdown.
- Monthly financial overview -> get_monthly_financial_chart.
- Never say SmaXTify cannot generate graphs.
- Default chart period is 12 months.
- For "last 6 months", use months 6. For "last 3 months", use months 3.
- Never invent dates.

Transaction creation:

- Required information normally includes type, amount, and account.
- Expense and Income also require title and category.
- Transfer requires transferMode and a destination account or person's name.
- Ask for missing required information.

Account selection:

- Match account descriptions against the supplied account list.
- Never invent account IDs.

Modification:

- Use only transaction IDs from the supplied context.
- Ask for clarification if multiple transactions match.

Read-only actions:

get_accounts, get_financial_summary, get_income_chart, get_expense_chart,
get_income_vs_expense_chart, get_category_breakdown,
get_monthly_financial_chart, get_report_data.

Conversation history:

${conversationHistory}

Current user message:

${message}

User SmaXTify context:

${JSON.stringify(userContext, null, 2)}

Return only valid JSON.

Normal chat:

{"mode":"chat","reply":"Your response"}

Action:

{"mode":"action","action":"get_income_chart","arguments":{"months":12}}

Do not include markdown or explanations outside JSON.
`;

  const response =
    await generateGeminiContent({
      contents: prompt,

      config: {
        temperature: 0.2,

        responseMimeType:
          "application/json",

        responseSchema: {
          type: "object",

          properties: {
            mode: {
              type: "string",
            },

            reply: {
              type: "string",
            },

            action: {
              type: "string",
            },

            arguments: {
              type: "object",
            },
          },

          required: ["mode"],
        },
      },
    });

  const parsed = parseAIJSON(
    response.text || ""
  );

  if (!parsed) {
    throw new Error(
      "AI returned an invalid structured response."
    );
  }

  return parsed;
};

const generateChatTitle = async (
  prompt
) => {
  try {
    const titlePrompt = `
Generate a short chat title.

Maximum 5 words.

Do not use quotes or punctuation.

Return only the title.

Conversation:

${prompt}
`;

    const response =
      await generateGeminiContent({
        contents: titlePrompt,

        config: {
          temperature: 0.2,
        },
      });

    return (
      response.text
        ?.trim()
        .replace(/^["']|["']$/g, "")
        .replace(/[.!?]+$/g, "") ||
      "New Chat"
    );
  } catch (error) {
    console.error(
      "AI Title Error:",
      error?.message || error
    );

    return "New Chat";
  }
};

const saveActionMessages = async ({
  chat,
  userMessage,
  assistantMessage,
}) => {
  chat.messages.push({
    role: "user",
    text: userMessage,
    time: new Date(),
  });

  chat.messages.push({
    role: "assistant",
    text: assistantMessage,
    time: new Date(),
  });

  await chat.save();
};

const getConfirmationDescription = (
  action
) => {
  const descriptions = {
    update_transaction:
      "update that transaction",

    delete_transaction:
      "delete that transaction",

    update_account:
      "update that account",

    delete_account:
      "delete that account",

    save_budget:
      "save these budget changes",

    delete_budget:
      "delete that budget",

    add_goal_savings:
      "add that amount to your savings goal",

    update_goal:
      "update that savings goal",

    delete_goal:
      "delete that savings goal",

    update_subscription:
      "update that subscription",

    delete_subscription:
      "delete that subscription",
  };

  return (
    descriptions[action] ||
    "perform this action"
  );
};

exports.chatWithGemini = async (
  req,
  res
) => {
  try {
    const {
      message,
      chatId,
      confirmed = false,
    } = req.body;

    if (
      !chatId ||
      !message ||
      !String(message).trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "chatId and message are required.",
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

    const cleanMessage =
      String(message).trim();

    const userContext =
      await getUserAIContext(
        req.user.id
      );

    let decision =
      getDeterministicChartAction(
        cleanMessage
      );

    if (decision) {
      console.log(
        `Deterministic chart action selected: ${decision.action}`
      );
    } else {
      decision =
        await generateAIActionDecision({
          message: cleanMessage,
          chat,
          userContext,
        });
    }

    if (decision.mode === "action") {
      const action = decision.action;
      const args =
        decision.arguments || {};

      const validation =
        validateAction({
          action,
          args,
        });

      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message:
            validation.errors.join(" "),
          code: "INVALID_AI_ACTION",
        });
      }

      const needsConfirmation =
        actionNeedsConfirmation(
          action
        );

      if (
        needsConfirmation &&
        confirmed !== true
      ) {
        const confirmationMessage =
          `I can ${getConfirmationDescription(
            action
          )}. Please confirm if you want me to continue.`;

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
            name:
              validation.actionDefinition.name,
            arguments: args,
            requiresConfirmation: true,
            confirmed: false,
          },

          executed: false,
        });
      }

      console.log(
        `Executing AI action: ${action}`
      );

      const actionResult =
        await executeAIAction({
          userId: req.user.id,
          action,
          args,
        });

      if (!actionResult.success) {
        return res.status(400).json({
          success: false,
          reply: actionResult.message,

          action: {
            name: action,
            arguments: args,
          },

          executed: false,
          code: actionResult.code,
        });
      }

      const actionReply =
        actionResult.message ||
        "Action completed successfully.";

      await saveActionMessages({
        chat,
        userMessage: cleanMessage,
        assistantMessage: actionReply,
      });

      return res.status(200).json({
        success: true,
        reply: actionReply,

        action: {
          name:
            validation.actionDefinition.name,
          arguments: args,
          requiresConfirmation:
            needsConfirmation,
          confirmed:
            needsConfirmation
              ? true
              : false,
        },

        executed: true,
        result: actionResult.data,
      });
    }

    const reply =
      typeof decision.reply ===
        "string" &&
      decision.reply.trim()
        ? decision.reply.trim()
        : "Sorry, I couldn't generate a response.";

    chat.messages.push({
      role: "user",
      text: cleanMessage,
      time: new Date(),
    });

    chat.messages.push({
      role: "assistant",
      text: reply,
      time: new Date(),
    });

    let generatedTitle = null;

    if (chat.title === "New Chat") {
      generatedTitle =
        await generateChatTitle(`
USER:

${cleanMessage}

ASSISTANT:

${reply}
`);

      chat.title =
        generatedTitle || "New Chat";
    }

    await chat.save();

    return res.status(200).json({
      success: true,
      reply,
      title: generatedTitle,
      action: null,
      executed: false,
    });
  } catch (error) {
    return sendAIError(
      res,
      error,
      "Failed to generate AI response."
    );
  }
};

exports.generateReportInsights = async (
  req,
  res
) => {
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
        message:
          "Invalid transaction data.",
      });
    }

    const transactionData =
      transactions.map(
        (transaction) => ({
          title:
            transaction.title ||
            "Untitled",

          category:
            transaction.category ||
            "Other",

          amount:
            Number(transaction.amount) ||
            0,

          type:
            transaction.type ||
            "Expense",

          date:
            transaction.date || null,
        })
      );

    const prompt = `
You are SmaXTify.AI, a professional personal finance analyst.

Analyze the supplied financial report and provide exactly 4 useful, practical insights.

Rules:

- Use only the supplied data.
- Never invent transactions, amounts, dates, or categories.
- Be concise and easy to understand.
- Focus on spending, income, savings, and financial patterns.
- Do not give investment, tax, or legal advice.
- Do not use markdown tables.
- Do not mention that you are an AI model.

Allowed type values: spending, income, savings, warning.

Allowed priority values: positive, neutral, warning, critical.

Financial summary:

Income: ₹${Number(
      income
    ).toLocaleString("en-IN")}

Expenses: ₹${Number(
      expense
    ).toLocaleString("en-IN")}

Balance: ₹${Number(
      balance
    ).toLocaleString("en-IN")}

Savings Rate: ${Number(savings)}%

Total Transactions: ${Number(
      totalTransactions
    )}

Transactions:

${JSON.stringify(
  transactionData,
  null,
  2
)}

Return only JSON:

{
  "insights": [
    {
      "type": "spending",
      "title": "Short title",
      "message": "Useful financial insight.",
      "priority": "neutral"
    }
  ]
}
`;

    const response =
      await generateGeminiContent({
        contents: prompt,

        config: {
          responseMimeType:
            "application/json",

          responseSchema: {
            type: "object",

            properties: {
              insights: {
                type: "array",

                items: {
                  type: "object",

                  properties: {
                    type: {
                      type: "string",
                    },

                    title: {
                      type: "string",
                    },

                    message: {
                      type: "string",
                    },

                    priority: {
                      type: "string",
                    },
                  },

                  required: [
                    "type",
                    "title",
                    "message",
                    "priority",
                  ],
                },
              },
            },

            required: ["insights"],
          },
        },
      });

    const rawText =
      response.text || "";

    const parsed =
      parseAIJSON(rawText);

    if (
      !parsed ||
      !Array.isArray(parsed.insights)
    ) {
      console.error(
        "AI Insights Invalid Response:",
        rawText
      );

      return res.status(500).json({
        success: false,
        message:
          "AI returned an invalid insight format.",
        code: "AI_INVALID_RESPONSE",
      });
    }

    return res.status(200).json({
      success: true,
      insights:
        parsed.insights.slice(0, 4),
    });
  } catch (error) {
    return sendAIError(
      res,
      error,
      "Failed to generate financial insights."
    );
  }
};

exports.categorizeTransaction = async (
  req,
  res
) => {
  try {
    const {
      title,
      type,
    } = req.body;

    if (
      !title ||
      !String(title).trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Transaction title is required.",
        code: "TITLE_REQUIRED",
      });
    }

    if (
      type !== "Income" &&
      type !== "Expense"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Transaction type must be Income or Expense.",
        code:
          "INVALID_TRANSACTION_TYPE",
      });
    }

    if (!GEMINI_API_KEY) {
      return res.status(503).json({
        success: false,
        message:
          "Gemini API key is not configured.",
        code: "AI_KEY_MISSING",
      });
    }

    const cleanTitle =
      String(title).trim();

    const prompt = `
You are SmaXTify.AI's personal finance transaction categorization engine.

Analyze the complete transaction title and return exactly one accurate financial category.

Transaction title: "${cleanTitle}"

Transaction type: "${type}"

Rules:

- Use your language understanding, not a fixed keyword list.
- Understand products, brands, services, medicines, food, bills, subscriptions, education, clothing, household items, and financial transactions.
- Understand Indian and international products and services.
- Use the transaction type to resolve ambiguity.
- Create a sensible category if needed.
- Maximum 3 words, Title Case, no punctuation.
- Never return an empty category.
- Use Other only when there is genuinely insufficient information.
- Return only valid JSON.

Category guidance:

Food, cake, juice -> Food or Food & Beverages.

Vegetables, fruits, groceries, dairy, spices -> Groceries.

Medicines, doctors, hospitals, pharmacies, tests -> Healthcare.

Stationery, notebooks, pens, office supplies -> Stationery.

Books and educational materials -> Education.

Skincare, cosmetics, grooming, hygiene -> Personal Care.

Clothing, footwear, fashion accessories -> Shopping.

Phones, laptops, chargers, electronics -> Electronics.

Cars, motorcycles, bicycles -> Vehicle.

Petrol, diesel, CNG, vehicle fuel -> Fuel.

Uber, Ola, Rapido, taxi, bus, metro -> Transport.

Electricity payments -> Electricity.

Water payments -> Water Bill.

Cooking gas -> Gas Bill.

Internet, Wi-Fi, broadband -> Internet.

Mobile recharge -> Mobile Recharge.

Rent -> Rent.

Insurance -> Insurance.

Movies, cinema, concerts, games -> Entertainment.

Netflix, Spotify, recurring digital services -> Subscription.

Flights, trains, holidays, trips -> Travel.

Hotels, resorts, lodging -> Accommodation.

Gym, sports, fitness, yoga -> Fitness & Sports.

Pet expenses -> Pet Care.

Loans and EMI -> Loan & EMI.

Taxes -> Taxes.

Donations and charity -> Donation.

Bank fees -> Bank Charges.

Salary and employment income -> Salary.

Freelance income -> Freelance.

Business income -> Business.

Investment returns -> Investment.

Bank interest -> Interest.

Bonuses -> Bonus.

Rental income -> Rental Income.

Refunds and cashback -> Refund.

Context examples:

- "book" with Expense -> Education.
- "hotel booking" -> Accommodation.
- "flight booking" -> Travel.
- "job" with Income -> Salary.
- "apple" -> Groceries.
- "Apple iPhone" -> Electronics.
- "phone recharge" -> Mobile Recharge.
- "car petrol" -> Fuel.
- "car insurance" -> Insurance.
- "shampoo" -> Personal Care.
- "salary" with Income -> Salary.

Return only:

{"category":"Category Name"}
`;

    const response =
      await generateGeminiContent({
        contents: prompt,

        config: {
          temperature: 0.2,

          responseMimeType:
            "application/json",

          responseSchema: {
            type: "object",

            properties: {
              category: {
                type: "string",
              },
            },

            required: ["category"],
          },
        },
      });

    const rawText =
      response.text || "";

    const parsed =
      parseAIJSON(rawText);

    let category = "";

    if (
      parsed &&
      typeof parsed.category ===
        "string"
    ) {
      category =
        parsed.category.trim();
    } else {
      const match = rawText.match(
        /"category"\s*:\s*"([^"]+)"/i
      );

      if (match) {
        category =
          match[1].trim();
      }
    }

    category =
      normalizeCategory(category);

    if (!category) {
      return res.status(500).json({
        success: false,
        message:
          "AI did not return a valid category. Please enter the category manually.",
        code:
          "AI_INVALID_CATEGORY",
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

exports.scanReceipt = async (
  req,
  res
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "Please upload a receipt image.",
        code:
          "RECEIPT_IMAGE_REQUIRED",
      });
    }

    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
    ];

    if (
      !allowedMimeTypes.includes(
        req.file.mimetype
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Unsupported image format. Please upload a JPG, PNG, or WebP image.",
        code:
          "UNSUPPORTED_IMAGE_FORMAT",
      });
    }

    if (!GEMINI_API_KEY) {
      return res.status(503).json({
        success: false,
        message:
          "Gemini API key is not configured.",
        code: "AI_KEY_MISSING",
      });
    }

    const prompt = `
You are SmaXTify.AI, a receipt information extraction assistant.

Analyze the uploaded image and extract only information clearly visible.

Rules:

- Do not invent missing information.
- Use null for unavailable amounts or dates.
- Amounts must be JSON numbers, not strings.
- Remove currency symbols and commas from amounts.
- Return the total amount payable, not subtotal, when both are visible.
- Extract tax separately when shown.
- Do not calculate or guess missing amounts.
- Preserve the receipt currency where identifiable.
- Return item names and visible quantities and prices.
- If the image is not a receipt, set isReceipt to false.
- For dates, use YYYY-MM-DD format whenever possible.
- If the date is unclear, return null.
- Return only valid JSON with these fields:
  isReceipt, merchant, date, currency, subtotal, tax, total, items.
- Each item must contain name, quantity, and price.

Example:

{
  "isReceipt": true,
  "merchant": "Example Store",
  "date": "2025-01-28",
  "currency": "INR",
  "subtotal": 100,
  "tax": 5,
  "total": 105,
  "items": [
    {
      "name": "Example Item",
      "quantity": 1,
      "price": 100
    }
  ]
}
`;

    const response =
      await generateGeminiContent({
        contents: [
          {
            role: "user",

            parts: [
              {
                text: prompt,
              },

              {
                inlineData: {
                  mimeType:
                    req.file.mimetype,

                  data:
                    req.file.buffer.toString(
                      "base64"
                    ),
                },
              },
            ],
          },
        ],

        config: {
          temperature: 0.1,

          responseMimeType:
            "application/json",
        },
      });

    const rawText =
      response.text || "";

    const extracted =
      parseAIJSON(rawText);

    if (
      !extracted ||
      typeof extracted.isReceipt !==
        "boolean" ||
      !Array.isArray(
        extracted.items
      )
    ) {
      console.error(
        "Invalid receipt response:",
        rawText
      );

      return res.status(500).json({
        success: false,
        message:
          "AI returned an invalid receipt format. Please try another image.",
        code:
          "AI_INVALID_RECEIPT_RESPONSE",
      });
    }

    if (!extracted.isReceipt) {
      return res.status(400).json({
        success: false,
        message:
          "The uploaded image does not appear to be a receipt.",
        code: "NOT_A_RECEIPT",
      });
    }

    const subtotal =
      normalizeReceiptAmount(
        extracted.subtotal
      );

    const tax =
      normalizeReceiptAmount(
        extracted.tax
      );

    const total =
      normalizeReceiptAmount(
        extracted.total
      );

    const items =
      extracted.items.map((item) => ({
        name:
          typeof item?.name === "string"
            ? item.name.trim()
            : "",

        quantity:
          normalizeReceiptAmount(
            item?.quantity
          ),

        price:
          normalizeReceiptAmount(
            item?.price
          ),
      }));

    const receiptDate =
      normalizeReceiptDate(
        extracted.date
      );

    let cloudinaryImage;

    try {
      cloudinaryImage =
        await uploadReceiptImage(
          req.file,
          req.user.id
        );
    } catch (uploadError) {
      console.error(
        "Receipt image upload error:",
        uploadError?.message ||
          uploadError
      );

      return res.status(502).json({
        success: false,

        message:
          uploadError?.code ===
          "CLOUDINARY_CONFIG_MISSING"
            ? "Cloudinary is not configured. Check your environment variables."
            : "Receipt was scanned, but its image could not be uploaded. Please try again.",

        code:
          uploadError?.code ===
          "CLOUDINARY_CONFIG_MISSING"
            ? "CLOUDINARY_CONFIG_MISSING"
            : "RECEIPT_IMAGE_UPLOAD_FAILED",
      });
    }

    return res.status(200).json({
      success: true,

      message:
        "Receipt scanned successfully. Please review the extracted details.",

      receipt: {
        merchant:
          typeof extracted.merchant ===
          "string"
            ? extracted.merchant.trim()
            : null,

        date: receiptDate,

        currency:
          typeof extracted.currency ===
          "string"
            ? extracted.currency.trim()
            : "INR",

        subtotal,

        tax,

        total,

        items,

        imageUrl:
          cloudinaryImage.imageUrl,

        imagePublicId:
          cloudinaryImage.imagePublicId,
      },
    });
  } catch (error) {
    return sendAIError(
      res,
      error,
      "Failed to scan receipt. Please try again."
    );
  }
};