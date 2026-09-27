// =========================================================
// SMAxTIFY AI CONTROLLER
// =========================================================

const { GoogleGenAI } = require("@google/genai");

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


// =========================================================
// GEMINI CONFIGURATION
// =========================================================

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY?.trim();

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});


// =========================================================
// GEMINI MODELS
// =========================================================

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


// =========================================================
// ERROR HELPERS
// =========================================================

const getErrorStatus = (
  error
) => {
  return (
    error?.status ||
    error?.error?.code ||
    error?.code ||
    error?.response?.status ||
    error?.response?.data?.error?.code ||
    null
  );
};


const getNumericErrorStatus = (
  error
) => {
  const status =
    getErrorStatus(error);

  const numericStatus =
    Number(status);

  if (
    Number.isFinite(
      numericStatus
    )
  ) {
    return numericStatus;
  }

  return null;
};


const isRetryableError = (
  error
) => {
  const status =
    getNumericErrorStatus(
      error
    );

  return (
    status !== null &&
    RETRYABLE_STATUS_CODES.includes(
      status
    )
  );
};


const sleep = (
  milliseconds
) => {
  return new Promise(
    (resolve) =>
      setTimeout(
        resolve,
        milliseconds
      )
  );
};


// =========================================================
// GEMINI GENERATION WITH RETRY + FALLBACK
// =========================================================

const generateGeminiContent =
  async ({
    contents,
    config = {},
  }) => {
    if (!GEMINI_API_KEY) {
      const error =
        new Error(
          "Gemini API key is not configured."
        );

      error.status = 503;

      error.code =
        "AI_KEY_MISSING";

      throw error;
    }

    let lastError = null;

    for (
      let modelIndex = 0;
      modelIndex <
      GEMINI_MODELS.length;
      modelIndex++
    ) {
      const model =
        GEMINI_MODELS[
          modelIndex
        ];

      for (
        let attempt = 0;
        attempt <=
        MAX_RETRIES_PER_MODEL;
        attempt++
      ) {
        try {
          console.log(
            `Gemini request: ${model} | attempt ${
              attempt + 1
            }`
          );

          const response =
            await ai.models.generateContent({
              model,
              contents,
              config,
            });

          console.log(
            `Gemini success: ${model}`
          );

          return response;
        } catch (error) {
          lastError =
            error;

          const status =
            getNumericErrorStatus(
              error
            );

          console.error(
            `Gemini error: ${model} | status: ${status} | attempt: ${
              attempt + 1
            } | message: ${
              error?.message ||
              error
            }`
          );

          if (
            !isRetryableError(
              error
            )
          ) {
            throw error;
          }

          if (
            attempt <
            MAX_RETRIES_PER_MODEL
          ) {
            const baseDelay =
              1000 *
              Math.pow(
                2,
                attempt
              );

            const jitter =
              Math.floor(
                Math.random() *
                  500
              );

            const delay =
              baseDelay +
              jitter;

            console.log(
              `Gemini temporary error. Retrying ${model} in ${delay}ms...`
            );

            await sleep(
              delay
            );

            continue;
          }

          console.warn(
            `Gemini model ${model} unavailable after retries.`
          );

          break;
        }
      }

      if (
        modelIndex <
        GEMINI_MODELS.length - 1
      ) {
        console.warn(
          `Falling back from ${model} to ${
            GEMINI_MODELS[
              modelIndex + 1
            ]
          }`
        );
      }
    }

    throw (
      lastError ||
      new Error(
        "All Gemini models failed."
      )
    );
  };


// =========================================================
// SEND AI ERROR
// =========================================================

const sendAIError = (
  res,
  error,
  defaultMessage
) => {
  const status =
    getNumericErrorStatus(
      error
    );

  console.error(
    "Gemini Error:",
    error?.message ||
      error
  );

  if (
    error?.code ===
    "AI_KEY_MISSING"
  ) {
    return res.status(503).json({
      success: false,
      message:
        "Gemini API key is not configured.",
      code:
        "AI_KEY_MISSING",
    });
  }

  if (
    status === 400
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid request sent to Gemini AI.",
      code:
        "AI_BAD_REQUEST",
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
      code:
        "AI_AUTH_ERROR",
    });
  }

  if (
    status === 429
  ) {
    return res.status(429).json({
      success: false,
      message:
        "AI request limit reached. Please try again later.",
      code:
        "AI_RATE_LIMIT",
    });
  }

  if (
    status === 404
  ) {
    return res.status(503).json({
      success: false,
      message:
        "The configured AI model is currently unavailable.",
      code:
        "AI_MODEL_UNAVAILABLE",
    });
  }

  if (
    status === 408 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  ) {
    return res.status(503).json({
      success: false,
      message:
        "AI service is temporarily unavailable. Please try again shortly.",
      code:
        "AI_UNAVAILABLE",
    });
  }

  return res.status(500).json({
    success: false,
    message:
      defaultMessage,
    code:
      "AI_ERROR",
  });
};


// =========================================================
// CATEGORY NORMALIZER
// =========================================================

const normalizeCategory = (
  category
) => {
  if (
    typeof category !==
    "string"
  ) {
    return "";
  }

  return category
    .replace(
      /^["'`]+|["'`]+$/g,
      ""
    )
    .replace(
      /[.!?]+$/g,
      ""
    )
    .replace(
      /\s+/g,
      " "
    )
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


// =========================================================
// SAFE JSON PARSER
// =========================================================

const parseAIJSON = (
  text
) => {
  if (
    typeof text !==
    "string"
  ) {
    return null;
  }

  const cleaned =
    text
      .trim()
      .replace(
        /^```json\s*/i,
        ""
      )
      .replace(
        /^```\s*/i,
        ""
      )
      .replace(
        /\s*```$/i,
        ""
      )
      .trim();

  try {
    return JSON.parse(
      cleaned
    );
  } catch {
    return null;
  }
};


// =========================================================
// DETERMINISTIC CHART INTENT RESOLVER
// =========================================================
//
// This runs BEFORE Gemini action selection.
//
// It prevents Gemini from responding with:
//
// "I don't currently have a feature to generate graphs."
//
// for supported visualization requests.
//
// =========================================================

const getDeterministicChartAction = (
  message
) => {
  if (
    typeof message !==
    "string"
  ) {
    return null;
  }

  const normalized =
    message
      .toLowerCase()
      .replace(
        /[^\w\s&/-]/g,
        " "
      )
      .replace(
        /\s+/g,
        " "
      )
      .trim();

  if (!normalized) {
    return null;
  }


  // -------------------------------------------------------
  // INCOME VS EXPENSE
  // -------------------------------------------------------

  const incomeVsExpensePatterns = [
    /\bincome\s*(vs|versus|and)\s*(expense|expenses)\b/,
    /\b(income|expenses?)\s*(comparison|compare)\b/,
    /\bcompare\s+(my\s+)?(income|expenses?)\b/,
    /\bcompare\s+(my\s+)?income\s+and\s+(my\s+)?expenses?\b/,
    /\bincome\s+against\s+(my\s+)?expenses?\b/,
    /\bincome\s+expense\s+(graph|chart)\b/,
    /\b(income|expense)\s+comparison\s+(graph|chart)\b/,
  ];

  if (
    incomeVsExpensePatterns.some(
      (pattern) =>
        pattern.test(
          normalized
        )
    )
  ) {
    return {
      mode: "action",
      action:
        "get_income_vs_expense_chart",
      arguments: {
        months: extractChartMonths(
          normalized
        ),
      },
    };
  }


  // -------------------------------------------------------
  // CATEGORY BREAKDOWN
  // -------------------------------------------------------

  const categoryPatterns = [
    /\bspending\s+by\s+categor(y|ies)\b/,
    /\bexpenses?\s+by\s+categor(y|ies)\b/,
    /\bcategory\s+breakdown\b/,
    /\bcategory[-\s]?wise\s+expenses?\b/,
    /\bexpense\s+categor(y|ies)\s+(graph|chart)\b/,
    /\bspending\s+categor(y|ies)\s+(graph|chart)\b/,
    /\bwhere\s+am\s+i\s+spending\b/,
    /\bshow\s+my\s+spending\s+categor(y|ies)\b/,
  ];

  if (
    categoryPatterns.some(
      (pattern) =>
        pattern.test(
          normalized
        )
    )
  ) {
    return {
      mode: "action",
      action:
        "get_category_breakdown",
      arguments: {
        limit: 10,
      },
    };
  }


  // -------------------------------------------------------
  // MONTHLY FINANCIAL CHART
  // -------------------------------------------------------

  const monthlyFinancialPatterns = [
    /\bmonthly\s+financial\s+(graph|chart|overview)\b/,
    /\bmonthly\s+(income|expense|expenses?)\s+(and|vs)\s+(expense|expenses?|income)\b/,
    /\bmonthly\s+money\s+trend\b/,
    /\bfinancial\s+trend\b/,
    /\bmonthly\s+financial\s+trend\b/,
    /\bmonthly\s+financial\s+overview\b/,
  ];

  if (
    monthlyFinancialPatterns.some(
      (pattern) =>
        pattern.test(
          normalized
        )
    )
  ) {
    return {
      mode: "action",
      action:
        "get_monthly_financial_chart",
      arguments: {
        months: extractChartMonths(
          normalized
        ),
      },
    };
  }


  // -------------------------------------------------------
  // EXPENSE CHART
  // -------------------------------------------------------

  const expensePatterns = [
    /\bexpense\s+graph\b/,
    /\bexpenses?\s+graph\b/,
    /\bexpense\s+chart\b/,
    /\bexpenses?\s+chart\b/,
    /\bexpense\s+trend\b/,
    /\bexpenses?\s+trend\b/,
    /\bexpenses?\s+over\s+time\b/,
    /\bshow\s+(my\s+)?expenses?\s+graph\b/,
    /\bshow\s+(my\s+)?expenses?\s+chart\b/,
    /\bvisuali[sz]e\s+(my\s+)?expenses?\b/,
    /\bmonthly\s+expense\s+(graph|chart)\b/,
    /\bmonthly\s+expenses?\s+(graph|chart)\b/,
  ];

  if (
    expensePatterns.some(
      (pattern) =>
        pattern.test(
          normalized
        )
    )
  ) {
    return {
      mode: "action",
      action:
        "get_expense_chart",
      arguments: {
        months: extractChartMonths(
          normalized
        ),
      },
    };
  }


  // -------------------------------------------------------
  // INCOME CHART
  // -------------------------------------------------------

  const incomePatterns = [
    /\bincome\s+graph\b/,
    /\bincome\s+chart\b/,
    /\bincome\s+trend\b/,
    /\bincome\s+over\s+time\b/,
    /\bshow\s+(my\s+)?income\s+graph\b/,
    /\bshow\s+(my\s+)?income\s+chart\b/,
    /\bvisuali[sz]e\s+(my\s+)?income\b/,
    /\bdisplay\s+(my\s+)?income\s+(graph|chart)\b/,
    /\bmonthly\s+income\s+(graph|chart)\b/,
  ];

  if (
    incomePatterns.some(
      (pattern) =>
        pattern.test(
          normalized
        )
    )
  ) {
    return {
      mode: "action",
      action:
        "get_income_chart",
      arguments: {
        months: extractChartMonths(
          normalized
        ),
      },
    };
  }


  return null;
};


// =========================================================
// EXTRACT CHART MONTHS
// =========================================================

const extractChartMonths = (
  message
) => {
  if (
    typeof message !==
    "string"
  ) {
    return 12;
  }

  const normalized =
    message.toLowerCase();

  const match =
    normalized.match(
      /\b(?:last|past|previous)\s+(\d{1,2})\s+months?\b/
    );

  if (match) {
    const months =
      Number(
        match[1]
      );

    if (
      Number.isInteger(
        months
      ) &&
      months >= 1 &&
      months <= 24
    ) {
      return months;
    }
  }

  if (
    /\bthis\s+year\b/.test(
      normalized
    )
  ) {
    const currentMonth =
      new Date().getMonth() + 1;

    return Math.min(
      currentMonth,
      24
    );
  }

  if (
    /\blast\s+year\b/.test(
      normalized
    )
  ) {
    return 12;
  }

  return 12;
};


// =========================================================
// GET USER AI CONTEXT
// =========================================================

const getUserAIContext =
  async (userId) => {
    const [
      accounts,
      recentTransactions,
    ] = await Promise.all([
      Account.find({
        user: userId,
      })
        .select(
          "_id name type balance"
        )
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
      accounts:
        accounts.map(
          (account) => ({
            id:
              account._id.toString(),

            name:
              account.name,

            type:
              account.type,

            balance:
              Number(
                account.balance || 0
              ),
          })
        ),

      recentTransactions:
        recentTransactions.map(
          (transaction) => ({
            id:
              transaction._id.toString(),

            title:
              transaction.title || "",

            amount:
              Number(
                transaction.amount || 0
              ),

            category:
              transaction.category ||
              "Other",

            type:
              transaction.type,

            date:
              transaction.date,

            account:
              transaction.account
                ? {
                    id:
                      transaction
                        .account
                        ._id?.toString(),

                    name:
                      transaction
                        .account
                        .name,

                    type:
                      transaction
                        .account
                        .type,
                  }
                : null,

            toAccount:
              transaction.toAccount ||
              "",

            transferAccount:
              transaction
                .transferAccount
                ? {
                    id:
                      transaction
                        .transferAccount
                        ._id?.toString(),

                    name:
                      transaction
                        .transferAccount
                        .name,

                    type:
                      transaction
                        .transferAccount
                        .type,
                  }
                : null,

            transferMode:
              transaction.transferMode ||
              null,
          })
        ),
    };
  };


// =========================================================
// AI ACTION DECISION
// =========================================================

const generateAIActionDecision =
  async ({
    message,
    chat,
    userContext,
  }) => {
    let conversationHistory = "";

    chat.messages
      .slice(-20)
      .forEach((msg) => {
        conversationHistory +=
          `${msg.role.toUpperCase()}: ${msg.text}\n`;
      });

    const prompt = `
You are SmaXTify.AI.

You are the intelligent assistant inside a personal finance
application called SmaXTify.

Your job is to understand the user's request and determine
whether the request is:

1. A normal conversational question
2. A supported SmaXTify application action

IMPORTANT SECURITY RULES:

- Never invent database IDs.
- Never invent account IDs.
- Never invent transaction IDs.
- Use IDs only from the provided SmaXTify context.
- Never request unrestricted database access.
- Never create arbitrary MongoDB queries.
- Never execute actions yourself.
- Return only one supported action when an action is clearly requested.
- If the request is unclear, use normal chat mode and ask a clarification question.
- Do not claim an action was completed unless the backend confirms execution.
- Read-only chart and report actions are safe data retrieval operations.
- Never modify data when the user only asks to view, analyze, summarize, or visualize data.

SUPPORTED ACTIONS:

TRANSACTIONS:
create_transaction
update_transaction
delete_transaction

ACCOUNTS:
get_accounts

FINANCIAL SUMMARY:
get_financial_summary

BUDGET:
get_budget
save_budget
delete_budget

SAVINGS GOALS:
get_goals
create_goal
add_goal_savings
update_goal
delete_goal

SUBSCRIPTIONS:
get_subscriptions
create_subscription
update_subscription
delete_subscription

NAVIGATION:
navigate

CHARTS AND VISUALIZATIONS:
get_income_chart
get_expense_chart
get_income_vs_expense_chart
get_category_breakdown
get_monthly_financial_chart

REPORT DATA:
get_report_data


=========================================================
VISUALIZATION PRIORITY
=========================================================

If the user requests a graph, chart, visualization, trend,
breakdown, comparison, or financial graph, ALWAYS choose
the appropriate visualization action.

Never respond that SmaXTify cannot generate graphs.

Examples:

"Show my income graph"
-> get_income_chart

"Show my expense graph"
-> get_expense_chart

"Compare income and expenses"
-> get_income_vs_expense_chart

"Show my spending by category"
-> get_category_breakdown

"Show my monthly financial overview"
-> get_monthly_financial_chart


=========================================================
CHART ACTION SELECTION
=========================================================

get_income_chart:

Use for:

- income graph
- income chart
- income trend
- income over time
- show income
- visualize income
- monthly income graph


get_expense_chart:

Use for:

- expense graph
- expense chart
- expense trend
- expenses over time
- show expenses graph
- visualize expenses
- monthly expense graph


get_income_vs_expense_chart:

Use for:

- income vs expense
- income versus expense
- income and expense comparison
- compare income and expenses
- income against expenses


get_category_breakdown:

Use for:

- spending by category
- expenses by category
- category breakdown
- category-wise expenses
- expense category chart
- where am I spending money


get_monthly_financial_chart:

Use for:

- monthly financial graph
- monthly financial chart
- monthly financial overview
- financial trend
- monthly money trend


get_report_data:

Use for:

- detailed report data
- transaction report
- transaction data
- detailed financial report

Do NOT use get_report_data for graph/chart requests.


=========================================================
CHART PERIOD
=========================================================

Default:
12 months

"last 6 months":
months = 6

"last 3 months":
months = 3

"last 12 months":
months = 12

"last year":
months = 12

Never invent dates.


=========================================================
TRANSACTION CREATION
=========================================================

Required information normally includes:

- type
- amount
- account

For Expense:

- title
- category

For Income:

- title
- category

For Transfer:

- transferMode
- destination account OR person's name

If required information is missing, ask for clarification.


=========================================================
ACCOUNT SELECTION
=========================================================

Match account descriptions against the provided account list.

Never invent account IDs.


=========================================================
TRANSACTION MODIFICATION
=========================================================

Use only transaction IDs from the provided context.

If multiple transactions could match, ask for clarification.


=========================================================
READ-ONLY ACTIONS
=========================================================

get_accounts
get_financial_summary
get_income_chart
get_expense_chart
get_income_vs_expense_chart
get_category_breakdown
get_monthly_financial_chart
get_report_data


=========================================================
CONVERSATION HISTORY
=========================================================

${conversationHistory}


=========================================================
CURRENT USER MESSAGE
=========================================================

${message}


=========================================================
USER SMAxTIFY CONTEXT
=========================================================

${JSON.stringify(
  userContext,
  null,
  2
)}


=========================================================
RETURN ONLY VALID JSON
=========================================================

NORMAL CHAT:

{
  "mode": "chat",
  "reply": "Your response"
}

ACTION:

{
  "mode": "action",
  "action": "get_income_chart",
  "arguments": {
    "months": 12
  }
}

Do not include markdown.
Do not include code fences.
Do not include explanations outside JSON.
`;

    const response =
      await generateGeminiContent({
        contents:
          prompt,

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

            required: [
              "mode",
            ],
          },
        },
      });

    const parsed =
      parseAIJSON(
        response.text || ""
      );

    if (!parsed) {
      throw new Error(
        "AI returned an invalid structured response."
      );
    }

    return parsed;
  };


// =========================================================
// GENERATE CHAT TITLE
// =========================================================

const generateChatTitle =
  async (prompt) => {
    try {
      const titlePrompt = `
Generate a short chat title.

Rules:
- Maximum 5 words
- Do not use quotes
- Do not use punctuation
- Return ONLY the title

Conversation:

${prompt}
`;

      const response =
        await generateGeminiContent({
          contents:
            titlePrompt,

          config: {
            temperature: 0.2,
          },
        });

      return (
        response.text
          ?.trim()
          .replace(
            /^["']|["']$/g,
            ""
          )
          .replace(
            /[.!?]+$/g,
            ""
          ) ||
        "New Chat"
      );
    } catch (error) {
      console.error(
        "AI Title Error:",
        error?.message ||
          error
      );

      return "New Chat";
    }
  };


// =========================================================
// SAVE CHAT ACTION MESSAGES
// =========================================================

const saveActionMessages = async ({
  chat,
  userMessage,
  assistantMessage,
}) => {
  await chat.messages.push({
    role: "user",
    text: userMessage,
    time: new Date(),
  });

  await chat.messages.push({
    role: "assistant",
    text: assistantMessage,
    time: new Date(),
  });

  await chat.save();
};


// =========================================================
// CHAT WITH GEMINI
// =========================================================

exports.chatWithGemini =
  async (req, res) => {
    try {
      const {
        message,
        chatId,
        confirmed = false,
      } = req.body;

      // ---------------------------------------------------
      // VALIDATE REQUEST
      // ---------------------------------------------------

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

      // ---------------------------------------------------
      // FIND CHAT BELONGING TO CURRENT USER
      // ---------------------------------------------------

      const chat =
        await Chat.findOne({
          _id: chatId,
          user: req.user.id,
        });

      if (!chat) {
        return res.status(404).json({
          success: false,
          message:
            "Chat not found.",
        });
      }

      const cleanMessage =
        String(
          message
        ).trim();

      // ---------------------------------------------------
      // GET USER FINANCIAL CONTEXT
      // ---------------------------------------------------

      const userContext =
        await getUserAIContext(
          req.user.id
        );

      // ===================================================
      // DETERMINISTIC CHART ROUTING
      // ===================================================
      //
      // This happens BEFORE Gemini.
      //
      // Therefore:
      //
      // "show income graph"
      //
      // cannot become normal chat.
      //
      // ===================================================

      let decision =
        getDeterministicChartAction(
          cleanMessage
        );

      if (decision) {
        console.log(
          `Deterministic chart action selected: ${decision.action}`
        );
      } else {
        // -------------------------------------------------
        // NORMAL GEMINI ACTION DECISION
        // -------------------------------------------------

        decision =
          await generateAIActionDecision({
            message:
              cleanMessage,

            chat,

            userContext,
          });
      }

      // ===================================================
      // ACTION MODE
      // ===================================================

      if (
        decision.mode ===
        "action"
      ) {
        const action =
          decision.action;

        const args =
          decision.arguments ||
          {};

        // -------------------------------------------------
        // VALIDATE ACTION
        // -------------------------------------------------

        const validation =
          validateAction({
            action,
            args,
          });

        if (
          !validation.valid
        ) {
          return res.status(400).json({
            success: false,
            message:
              validation.errors.join(
                " "
              ),
            code:
              "INVALID_AI_ACTION",
          });
        }

        // -------------------------------------------------
        // CHECK CONFIRMATION
        // -------------------------------------------------

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

          await chat.messages.push({
            role: "assistant",
            text:
              confirmationMessage,
            time: new Date(),
          });

          await chat.save();

          return res.status(200).json({
            success: true,

            reply:
              confirmationMessage,

            action: {
              name:
                validation
                  .actionDefinition
                  .name,

              arguments:
                args,

              requiresConfirmation:
                true,

              confirmed:
                false,
            },

            executed:
              false,
          });
        }

        // -------------------------------------------------
        // EXECUTE ACTION
        // -------------------------------------------------

        console.log(
          `Executing AI action: ${action}`
        );

        const actionResult =
          await executeAIAction({
            userId:
              req.user.id,

            action,

            args,
          });

        if (
          !actionResult.success
        ) {
          return res.status(400).json({
            success: false,

            reply:
              actionResult.message,

            action: {
              name:
                action,

              arguments:
                args,
            },

            executed:
              false,

            code:
              actionResult.code,
          });
        }

        // -------------------------------------------------
        // ACTION RESULT
        // -------------------------------------------------

        const actionReply =
          actionResult.message ||
          "Action completed successfully.";

        await saveActionMessages({
          chat,
          userMessage:
            cleanMessage,
          assistantMessage:
            actionReply,
        });

        return res.status(200).json({
          success: true,

          reply:
            actionReply,

          action: {
            name:
              validation
                .actionDefinition
                .name,

            arguments:
              args,

            requiresConfirmation:
              needsConfirmation,

            confirmed:
              needsConfirmation
                ? true
                : false,
          },

          executed:
            true,

          result:
            actionResult.data,
        });
      }

      // ===================================================
      // NORMAL CHAT MODE
      // ===================================================

      const reply =
        typeof decision.reply ===
          "string" &&
        decision.reply.trim()
          ? decision.reply.trim()
          : "Sorry, I couldn't generate a response.";

      // ---------------------------------------------------
      // SAVE USER MESSAGE
      // ---------------------------------------------------

      await chat.messages.push({
        role: "user",
        text:
          cleanMessage,
        time: new Date(),
      });

      // ---------------------------------------------------
      // SAVE ASSISTANT RESPONSE
      // ---------------------------------------------------

      await chat.messages.push({
        role: "assistant",
        text:
          reply,
        time: new Date(),
      });

      // ---------------------------------------------------
      // GENERATE CHAT TITLE
      // ---------------------------------------------------

      let generatedTitle =
        null;

      if (
        chat.title ===
        "New Chat"
      ) {
        const titlePrompt = `
USER:
${cleanMessage}

ASSISTANT:
${reply}
`;

        generatedTitle =
          await generateChatTitle(
            titlePrompt
          );

        chat.title =
          generatedTitle ||
          "New Chat";
      }

      await chat.save();

      return res.status(200).json({
        success: true,

        reply,

        title:
          generatedTitle,

        action: null,

        executed:
          false,
      });
    } catch (error) {
      return sendAIError(
        res,
        error,
        "Failed to generate AI response."
      );
    }
  };


// =========================================================
// CONFIRMATION DESCRIPTION
// =========================================================

const getConfirmationDescription =
  (action) => {
    switch (action) {
      case "update_transaction":
        return "update that transaction";

      case "delete_transaction":
        return "delete that transaction";

      case "update_account":
        return "update that account";

      case "delete_account":
        return "delete that account";

      case "save_budget":
        return "save these budget changes";

      case "delete_budget":
        return "delete that budget";

      case "add_goal_savings":
        return "add that amount to your savings goal";

      case "update_goal":
        return "update that savings goal";

      case "delete_goal":
        return "delete that savings goal";

      case "update_subscription":
        return "update that subscription";

      case "delete_subscription":
        return "delete that subscription";

      default:
        return "perform this action";
    }
  };


// =========================================================
// REPORT INSIGHTS
// =========================================================

exports.generateReportInsights =
  async (req, res) => {
    try {
      const {
        income = 0,
        expense = 0,
        balance = 0,
        savings = 0,
        totalTransactions = 0,
        transactions = [],
      } = req.body;

      if (
        !Array.isArray(
          transactions
        )
      ) {
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
              Number(
                transaction.amount
              ) || 0,

            type:
              transaction.type ||
              "Expense",

            date:
              transaction.date ||
              null,
          })
        );

      const prompt = `
You are SmaXTify.AI, a professional personal finance analyst.

Analyze the user's financial report data and provide useful,
practical financial insights.

IMPORTANT RULES:

1. Use ONLY the financial data provided.
2. Never invent transactions.
3. Never invent amounts.
4. Never invent dates.
5. Never invent categories.
6. Be concise and easy to understand.
7. Focus on spending, income, savings and financial patterns.
8. Do not give investment, tax or legal advice.
9. Do not use markdown tables.
10. Return exactly 4 insights.
11. Do not mention that you are an AI model.

Allowed type values:

spending
income
savings
warning

Allowed priority values:

positive
neutral
warning
critical

FINANCIAL SUMMARY

Income:
₹${Number(
        income
      ).toLocaleString("en-IN")}

Expenses:
₹${Number(
        expense
      ).toLocaleString("en-IN")}

Balance:
₹${Number(
        balance
      ).toLocaleString("en-IN")}

Savings Rate:
${Number(savings)}%

Total Transactions:
${Number(
        totalTransactions
      )}

TRANSACTIONS:

${JSON.stringify(
        transactionData,
        null,
        2
      )}

RETURN ONLY VALID JSON:

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
          contents:
            prompt,

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

              required: [
                "insights",
              ],
            },
          },
        });

      const rawText =
        response.text || "";

      const parsed =
        parseAIJSON(
          rawText
        );

      if (
        !parsed ||
        !Array.isArray(
          parsed.insights
        )
      ) {
        console.error(
          "AI Insights Invalid Response:",
          rawText
        );

        return res.status(500).json({
          success: false,
          message:
            "AI returned an invalid insight format.",
          code:
            "AI_INVALID_RESPONSE",
        });
      }

      return res.status(200).json({
        success: true,

        insights:
          parsed.insights.slice(
            0,
            4
          ),
      });
    } catch (error) {
      return sendAIError(
        res,
        error,
        "Failed to generate financial insights."
      );
    }
  };


// =========================================================
// TRANSACTION CATEGORIZATION
// =========================================================

exports.categorizeTransaction =
  async (req, res) => {
    try {
      const {
        title,
        type,
      } = req.body;

      // ---------------------------------------------------
      // VALIDATE TITLE
      // ---------------------------------------------------

      if (
        !title ||
        !String(title).trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Transaction title is required.",
          code:
            "TITLE_REQUIRED",
        });
      }

      // ---------------------------------------------------
      // VALIDATE TYPE
      // ---------------------------------------------------

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

      // ---------------------------------------------------
      // API KEY
      // ---------------------------------------------------

      if (!GEMINI_API_KEY) {
        return res.status(503).json({
          success: false,
          message:
            "Gemini API key is not configured.",
          code:
            "AI_KEY_MISSING",
        });
      }

      const cleanTitle =
        String(
          title
        ).trim();

      // ---------------------------------------------------
      // CATEGORY PROMPT
      // ---------------------------------------------------

      const prompt = `
You are SmaXTify.AI's advanced personal finance transaction categorization engine.

Your task is to understand ANY transaction title provided by the user and determine the most accurate financial category using your own language understanding and world knowledge.

You are NOT restricted to a predefined keyword list.

You MUST analyze the meaning of the complete transaction.

TRANSACTION TITLE:
"${cleanTitle}"

TRANSACTION TYPE:
"${type}"

CORE REQUIREMENTS:

1. ALWAYS return exactly ONE category.
2. NEVER return an empty category.
3. Use your own AI understanding of the transaction.
4. Do NOT depend on a predefined keyword list.
5. Understand individual products, services, brands, medicines, foods, vegetables, fruits, vehicles, electronics, bills, subscriptions, education items, personal-care products, clothing, household items and financial transactions.
6. Understand singular and plural words.
7. Understand spelling variations.
8. Understand common abbreviations.
9. Understand brand names.
10. Understand product names.
11. Understand medicine names.
12. Understand Indian products and services.
13. Understand common international products and services.
14. Understand context from the complete transaction title.
15. Use the transaction type to resolve ambiguity.
16. Create a sensible new category when an existing common category does not accurately describe the transaction.
17. Never force an unrelated category.
18. Use a maximum of 3 words for the category.
19. Use Title Case.
20. Do not include punctuation in the category.
21. Do not explain the answer.
22. Return ONLY valid JSON.
23. Use "Other" ONLY when the transaction genuinely provides no meaningful information for classification.

FINANCIAL UNDERSTANDING:

Food and beverages should normally be classified under categories such as:

Food
Food & Beverages
Groceries
Dining

Vegetables, fruits, grains, pulses, dairy products, spices and household grocery products should normally be classified as:

Groceries

Medicines, medical products, medical services, doctors, hospitals, pharmacies, medical tests and healthcare products should normally be classified as:

Healthcare

Stationery, school supplies, office supplies, writing materials, notebooks and study supplies should normally be classified as:

Stationery

Books and educational materials should normally be classified as:

Education

Skincare, cosmetics, grooming, hygiene, beauty and personal-care products should normally be classified as:

Personal Care

Clothing, footwear, fashion accessories and shopping purchases should normally be classified as:

Shopping

Phones, smartphones, laptops, computers, tablets, chargers, headphones, cameras and electronic devices should normally be classified as:

Electronics

Cars, motorcycles, bikes, scooters, bicycles and vehicle purchases should normally be classified as:

Vehicle

Petrol, diesel, CNG, LPG and vehicle fuel should normally be classified as:

Fuel

Uber, Ola, Rapido, taxis, auto-rickshaws, buses, metro and transportation fares should normally be classified as:

Transport

Electricity payments should normally be classified as:

Electricity

Water payments should normally be classified as:

Water Bill

Cooking gas and gas-cylinder payments should normally be classified as:

Gas Bill

Internet, Wi-Fi, broadband and fiber connections should normally be classified as:

Internet

Mobile recharge and mobile network bills should normally be classified as:

Mobile Recharge

Rent payments should normally be classified as:

Rent

Insurance payments should normally be classified as:

Insurance

Movies, cinema, concerts, games and entertainment activities should normally be classified as:

Entertainment

Netflix, Spotify and similar recurring digital services should normally be classified as:

Subscription

Flights, train journeys, holidays and trips should normally be classified as:

Travel

Hotels, resorts, Airbnb and lodging should normally be classified as:

Accommodation

Gym, sports, fitness, yoga and related activities should normally be classified as:

Fitness & Sports

Pet-related expenses should normally be classified as:

Pet Care

Loans and EMI payments should normally be classified as:

Loan & EMI

Taxes should normally be classified as:

Taxes

Donations and charity should normally be classified as:

Donation

Bank fees and financial charges should normally be classified as:

Bank Charges

Salary and employment income should normally be classified as:

Salary

Freelance income should normally be classified as:

Freelance

Business income should normally be classified as:

Business

Investment returns should normally be classified as:

Investment

Bank interest should normally be classified as:

Interest

Bonuses should normally be classified as:

Bonus

Rental income should normally be classified as:

Rental Income

Refunds and cashback should normally be classified as:

Refund

CONTEXT UNDERSTANDING:

If the title is:

"book"

and type is:

"Expense"

choose:

Education

If the title is:

"hotel booking"

choose:

Accommodation

If the title is:

"flight booking"

choose:

Travel

If the title is:

"job"

and type is:

"Income"

choose:

Salary

If the title is:

"job application fee"

and type is:

"Expense"

choose the category appropriate to the application expense.

If the title is:

"apple"

choose:

Groceries

If the title is:

"Apple iPhone"

choose:

Electronics

If the title is:

"phone"

choose:

Electronics

If the title is:

"phone recharge"

choose:

Mobile Recharge

If the title is:

"car"

choose:

Vehicle

If the title is:

"car petrol"

choose:

Fuel

If the title is:

"car insurance"

choose:

Insurance

If the title is:

"cake"

choose:

Food

If the title is:

"juice"

choose:

Food & Beverages

If the title is:

"capsule"

and the context indicates medicine, choose:

Healthcare

If the title is:

"pen"

choose:

Stationery

If the title is:

"shampoo"

choose:

Personal Care

If the title is:

"salary"

and type is:

"Income"

choose:

Salary

IMPORTANT AI BEHAVIOR:

Do not memorize only the examples above.

The examples are demonstrations of reasoning.

For a completely new word that is NOT listed above, use your general AI knowledge.

Do not use a hard-coded keyword lookup system.

Do not return "Other" simply because the exact word was not included above.

Use "Other" only when there is genuinely insufficient information.

RETURN ONLY THIS JSON FORMAT:

{
  "category": "Category Name"
}
`;

      // ---------------------------------------------------
      // GEMINI CATEGORY REQUEST
      // ---------------------------------------------------

      const response =
        await generateGeminiContent({
          contents:
            prompt,

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

              required: [
                "category",
              ],
            },
          },
        });

      const rawText =
        response.text || "";

      const parsed =
        parseAIJSON(
          rawText
        );

      let category = "";

      if (
        parsed &&
        typeof parsed.category ===
          "string"
      ) {
        category =
          parsed.category.trim();
      } else {
        const match =
          rawText.match(
            /"category"\s*:\s*"([^"]+)"/i
          );

        if (match) {
          category =
            match[1].trim();
        }
      }

      category =
        normalizeCategory(
          category
        );

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

        source:
          "ai",
      });
    } catch (error) {
      return sendAIError(
        res,
        error,
        "Failed to detect transaction category. You can enter the category manually."
      );
    }
  };