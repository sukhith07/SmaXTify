const { GoogleGenAI } = require("@google/genai");
const Chat = require("../models/Chat");

// =====================================================
// Gemini Configuration
// =====================================================

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// =====================================================
// Gemini Model
// =====================================================

const GEMINI_MODEL = "gemini-3.6-flash";

// =====================================================
// NORMAL SMAxTify AI CHAT
// =====================================================

exports.chatWithGemini = async (req, res) => {
  try {
    const {
      message,
      chatId,
    } = req.body;

    // ===============================================
    // Validation
    // ===============================================

    if (!chatId || !message) {
      return res.status(400).json({
        success: false,
        message: "chatId and message are required.",
      });
    }

    // ===============================================
    // Find Chat
    // ===============================================

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found.",
      });
    }

    // ===============================================
    // Build Conversation History
    // ===============================================

    let prompt = `
You are SmaXTify.AI.

You are a friendly, intelligent, and professional AI assistant.

Continue the conversation naturally based on the previous messages.

Conversation History:
`;

    chat.messages.forEach((msg) => {
      prompt += `${msg.role.toUpperCase()}: ${msg.text}\n`;
    });

    prompt += `
USER: ${message}

ASSISTANT:
`;

    // ===============================================
    // Generate AI Response
    // ===============================================

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    const reply =
      response.text ||
      "Sorry, I couldn't generate a response.";

    // ===============================================
    // Generate Chat Title
    // ===============================================

    let generatedTitle = null;

    if (chat.title === "New Chat") {
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

      const titleResponse =
        await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: titlePrompt,
        });

      generatedTitle =
        titleResponse.text
          .trim()
          .replace(/^["']|["']$/g, "");

      chat.title = generatedTitle;

      await chat.save();
    }

    // ===============================================
    // Response
    // ===============================================

    return res.status(200).json({
      success: true,
      reply,
      title: generatedTitle,
    });

  } catch (error) {
    console.error("Gemini Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate AI response.",
    });
  }
};


// =====================================================
// FINANCIAL REPORT AI INSIGHTS
// =====================================================

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

    // ===============================================
    // Validate Transactions
    // ===============================================

    if (!Array.isArray(transactions)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction data.",
      });
    }

    // ===============================================
    // Prepare Transaction Data
    // ===============================================

    const transactionData = transactions.map(
      (transaction) => ({
        title:
          transaction.title || "Untitled",

        category:
          transaction.category || "Other",

        amount:
          Number(transaction.amount) || 0,

        type:
          transaction.type || "Expense",

        date:
          transaction.date || null,
      })
    );

    // ===============================================
    // Build Financial Prompt
    // ===============================================

    const prompt = `
You are SmaXTify.AI, a professional personal finance analyst.

Analyze the user's financial report data and provide useful,
practical financial insights.

IMPORTANT RULES:

1. Use ONLY the financial data provided below.
2. Do not invent transactions, amounts, categories, or dates.
3. Do not give investment, tax, or legal advice.
4. Be concise and easy to understand.
5. Focus on spending behavior, income, expenses, savings,
   and financial patterns.
6. If there is not enough data for a particular insight,
   say so naturally.
7. Do not mention that you are an AI model.
8. Do not use markdown tables.
9. Return exactly 4 insights.
10. Each insight must contain:
    - type
    - title
    - message
    - priority

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
₹${Number(income).toLocaleString("en-IN")}

Expenses:
₹${Number(expense).toLocaleString("en-IN")}

Balance:
₹${Number(balance).toLocaleString("en-IN")}

Savings Rate:
${Number(savings)}%

Total Transactions:
${Number(totalTransactions)}

TRANSACTIONS

${JSON.stringify(transactionData, null, 2)}

RETURN FORMAT

Return ONLY valid JSON in exactly this structure:

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

    // ===============================================
    // Generate Gemini Insights
    // ===============================================

    const response =
      await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
      });

    const rawText =
      response.text || "";

    // ===============================================
    // Clean Response
    // ===============================================

    let cleanedText =
      rawText.trim();

    cleanedText =
      cleanedText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

    // ===============================================
    // Parse JSON
    // ===============================================

    let parsed;

    try {
      parsed = JSON.parse(cleanedText);

    } catch (parseError) {
      console.error(
        "AI Insights JSON Error:",
        parseError
      );

      console.error(
        "Gemini Raw Response:",
        rawText
      );

      return res.status(500).json({
        success: false,
        message:
          "AI returned an invalid insight format.",
      });
    }

    // ===============================================
    // Validate Insights
    // ===============================================

    if (
      !parsed.insights ||
      !Array.isArray(parsed.insights)
    ) {
      return res.status(500).json({
        success: false,
        message:
          "Invalid AI insights response.",
      });
    }

    // ===============================================
    // Return Insights
    // ===============================================

    return res.status(200).json({
      success: true,
      insights:
        parsed.insights.slice(0, 4),
    });

  } catch (error) {

  console.error(
    "Report AI Insights Error:",
    error
  );

  // ===============================================
  // Gemini Rate Limit / Quota Error
  // ===============================================

  if (
    error?.status === 429 ||
    error?.error?.code === 429
  ) {

    return res.status(429).json({

      success: false,

      message:
        "AI request limit reached. Please try again later.",

    });

  }

  // ===============================================
  // Gemini Temporarily Unavailable
  // ===============================================

  if (
    error?.status === 503 ||
    error?.error?.code === 503
  ) {

    return res.status(503).json({

      success: false,

      message:
        "AI service is temporarily busy. Please try again later.",

    });

  }

  // ===============================================
  // Other Errors
  // ===============================================

  return res.status(500).json({

    success: false,

    message:
      "Unable to generate AI insights right now.",

  });

}

  // ===============================================
  // Gemini Rate Limit / Quota
  // ===============================================

  if (error?.status === 429) {

    return res.status(429).json({

      success: false,

      message:
        "AI request limit reached. Please wait a minute and try again.",

      code: "AI_RATE_LIMIT",

    });

  }


  // ===============================================
  // Gemini Temporarily Unavailable
  // ===============================================

  if (error?.status === 503) {

    return res.status(503).json({

      success: false,

      message:
        "AI service is temporarily busy. Please try again in a moment.",

      code: "AI_UNAVAILABLE",

    });

  }


  // ===============================================
  // Other Gemini Error
  // ===============================================

  return res.status(500).json({

    success: false,

    message:
      "Failed to generate financial insights.",

    code: "AI_ERROR",

  });

};