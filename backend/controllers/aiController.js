const { GoogleGenAI } = require("@google/genai");
const Chat = require("../models/Chat");

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY?.trim();

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

const GEMINI_MODEL = "gemini-3.5-flash";

const getErrorStatus = (error) => {
  return (
    error?.status ||
    error?.error?.code ||
    error?.code ||
    error?.response?.status ||
    null
  );
};

const sendAIError = (
  res,
  error,
  defaultMessage
) => {
  const status = getErrorStatus(error);

  console.error(
    "Gemini Error:",
    error?.message || error
  );

  if (status === 400) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid request sent to Gemini AI.",
      code: "AI_BAD_REQUEST",
    });
  }

  if (status === 401 || status === 403) {
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
        "AI request limit reached. You can enter the category manually.",
      code: "AI_RATE_LIMIT",
    });
  }

  if (status === 503) {
    return res.status(503).json({
      success: false,
      message:
        "AI service is temporarily unavailable. You can enter the category manually.",
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

exports.chatWithGemini = async (
  req,
  res
) => {
  try {
    const {
      message,
      chatId,
    } = req.body;

    if (!chatId || !message) {
      return res.status(400).json({
        success: false,
        message:
          "chatId and message are required.",
      });
    }

    const chat =
      await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found.",
      });
    }

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

    const response =
      await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
      });

    const reply =
      response.text ||
      "Sorry, I couldn't generate a response.";

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
          ?.trim()
          .replace(/^["']|["']$/g, "")
          .replace(/[.!?]+$/g, "");

      chat.title =
        generatedTitle || "New Chat";

      await chat.save();
    }

    return res.status(200).json({
      success: true,
      reply,
      title: generatedTitle,
    });
  } catch (error) {
    return sendAIError(
      res,
      error,
      "Failed to generate AI response."
    );
  }
};

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
₹${Number(income).toLocaleString("en-IN")}

Expenses:
₹${Number(expense).toLocaleString("en-IN")}

Balance:
₹${Number(balance).toLocaleString("en-IN")}

Savings Rate:
${Number(savings)}%

Total Transactions:
${Number(totalTransactions)}

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
        await ai.models.generateContent({
          model: GEMINI_MODEL,
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

      const cleanedText =
        rawText
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

      let parsed;

      try {
        parsed =
          JSON.parse(cleanedText);
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
          code: "AI_INVALID_RESPONSE",
        });
      }

      if (
        !parsed.insights ||
        !Array.isArray(
          parsed.insights
        )
      ) {
        return res.status(500).json({
          success: false,
          message:
            "Invalid AI insights response.",
          code: "AI_INVALID_RESPONSE",
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

exports.categorizeTransaction =
  async (req, res) => {
    try {
      const {
        title,
        type,
      } = req.body;

      if (!title || !title.trim()) {
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
          code: "INVALID_TRANSACTION_TYPE",
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
        title.trim();

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

choose the most likely financial meaning, normally:

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

For example, if the user enters the name of a vegetable you have never seen in the examples, identify that it is a vegetable and classify it appropriately.

If the user enters a medicine name you have never seen in the examples, understand that it is a medicine and classify it appropriately.

If the user enters a skincare brand or product you have never seen in the examples, identify its purpose and classify it appropriately.

If the user enters a vehicle model you have never seen in the examples, identify it as a vehicle and classify it appropriately.

If the user enters a mobile phone model you have never seen in the examples, identify it as electronics.

If the user enters a stationery product you have never seen in the examples, identify it as stationery.

If the user enters a food item you have never seen in the examples, identify it as food or groceries depending on the context.

If the user enters a bill or service you have never seen in the examples, identify the service and create the appropriate category.

If the user enters a company or brand name, infer what the company or brand is associated with when possible.

If the user enters an unfamiliar product name, use your general knowledge and the transaction context to classify it.

If the user enters multiple words, understand the entire phrase rather than matching only one word.

The transaction type is important.

For Income transactions, think about where the money came from.

For Expense transactions, think about what the money was spent on.

DO NOT use a hard-coded keyword lookup system.

DO NOT return "Other" simply because the exact word was not included in the examples.

Use "Other" only when there is genuinely insufficient information to understand the transaction.

RETURN ONLY THIS JSON FORMAT:

{
  "category": "Category Name"
}
`;

      const response =
        await ai.models.generateContent({
          model: GEMINI_MODEL,
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
              required: [
                "category",
              ],
            },
          },
        });

      let category = "";

      const rawText =
        response.text || "";

      try {
        const parsed =
          JSON.parse(
            rawText.trim()
          );

        category =
          typeof parsed.category ===
          "string"
            ? parsed.category.trim()
            : "";
      } catch (parseError) {
        console.error(
          "Category JSON parsing error:",
          parseError
        );

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