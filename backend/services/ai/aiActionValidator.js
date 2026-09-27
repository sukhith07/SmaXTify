// =========================================================
// SMAxTIFY AI ACTION VALIDATOR
// =========================================================
//
// This layer validates AI-requested actions BEFORE they
// can reach the action executor.
//
// Gemini is NOT trusted.
//
// Every action must:
// 1. Exist in the AI action whitelist.
// 2. Have a valid argument object.
// 3. Pass action-specific validation.
// 4. Be safe to execute.
//
// =========================================================

const {
  getAction,
} = require("./aiActionDefinitions");


// =========================================================
// BASIC HELPERS
// =========================================================

const isPlainObject = (
  value
) => {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
};


const isValidObjectId = (
  value
) => {
  if (
    typeof value !==
    "string"
  ) {
    return false;
  }

  return /^[a-fA-F0-9]{24}$/.test(
    value
  );
};


const isPositiveNumber = (
  value
) => {
  const number =
    Number(value);

  return (
    Number.isFinite(
      number
    ) &&
    number > 0
  );
};


const cleanString = (
  value
) => {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value.trim();
};


const isNonNegativeInteger = (
  value
) => {
  const number =
    Number(value);

  return (
    Number.isInteger(
      number
    ) &&
    number >= 0
  );
};


// =========================================================
// TRANSACTION VALIDATION
// =========================================================

const validateCreateTransaction =
  (args) => {
    const errors = [];

    if (
      !isPlainObject(args)
    ) {
      return [
        "Transaction arguments are required.",
      ];
    }

    const {
      title,
      amount,
      category,
      type,
      account,
      toAccount,
      transferAccount,
      transferMode,
    } = args;


    // -----------------------------------------------------
    // TYPE
    // -----------------------------------------------------

    if (
      ![
        "Income",
        "Expense",
        "Transfer",
      ].includes(type)
    ) {
      errors.push(
        "Transaction type must be Income, Expense, or Transfer."
      );
    }


    // -----------------------------------------------------
    // AMOUNT
    // -----------------------------------------------------

    if (
      !isPositiveNumber(
        amount
      )
    ) {
      errors.push(
        "Transaction amount must be greater than zero."
      );
    }


    // -----------------------------------------------------
    // ACCOUNT
    // -----------------------------------------------------

    if (
      !isValidObjectId(
        account
      )
    ) {
      errors.push(
        "A valid source account is required."
      );
    }


    // -----------------------------------------------------
    // TITLE
    // -----------------------------------------------------

    if (
      type !== "Transfer" &&
      !cleanString(title)
    ) {
      errors.push(
        "A transaction title is required."
      );
    }


    // -----------------------------------------------------
    // CATEGORY
    // -----------------------------------------------------

    if (
      type !== "Transfer" &&
      !cleanString(category)
    ) {
      errors.push(
        "A transaction category is required."
      );
    }


    // -----------------------------------------------------
    // TRANSFER
    // -----------------------------------------------------

    if (
      type === "Transfer"
    ) {
      if (
        ![
          "account",
          "person",
        ].includes(
          transferMode
        )
      ) {
        errors.push(
          "Transfer mode must be account or person."
        );
      }


      if (
        transferMode ===
        "account"
      ) {
        if (
          !isValidObjectId(
            transferAccount
          )
        ) {
          errors.push(
            "A valid destination account is required."
          );
        }


        if (
          account ===
          transferAccount
        ) {
          errors.push(
            "Source and destination accounts cannot be the same."
          );
        }
      }


      if (
        transferMode ===
        "person"
      ) {
        if (
          !cleanString(
            toAccount
          )
        ) {
          errors.push(
            "A person's name is required for person transfers."
          );
        }


        if (
          cleanString(
            toAccount
          ).length > 100
        ) {
          errors.push(
            "Person name cannot exceed 100 characters."
          );
        }
      }
    }

    return errors;
  };


// =========================================================
// UPDATE TRANSACTION VALIDATION
// =========================================================

const validateUpdateTransaction =
  (args) => {
    const errors = [];

    if (
      !isPlainObject(args)
    ) {
      return [
        "Transaction arguments are required.",
      ];
    }


    // -----------------------------------------------------
    // TRANSACTION ID
    // -----------------------------------------------------

    if (
      !isValidObjectId(
        args.transactionId
      )
    ) {
      errors.push(
        "A valid transaction ID is required."
      );
    }


    // -----------------------------------------------------
    // AMOUNT
    // -----------------------------------------------------

    if (
      args.amount !==
        undefined &&
      !isPositiveNumber(
        args.amount
      )
    ) {
      errors.push(
        "Transaction amount must be greater than zero."
      );
    }


    // -----------------------------------------------------
    // TYPE
    // -----------------------------------------------------

    if (
      args.type !==
        undefined &&
      ![
        "Income",
        "Expense",
        "Transfer",
      ].includes(
        args.type
      )
    ) {
      errors.push(
        "Transaction type must be Income, Expense, or Transfer."
      );
    }


    // -----------------------------------------------------
    // ACCOUNT
    // -----------------------------------------------------

    if (
      args.account !==
        undefined &&
      !isValidObjectId(
        args.account
      )
    ) {
      errors.push(
        "Invalid account ID."
      );
    }


    // -----------------------------------------------------
    // TRANSFER ACCOUNT
    // -----------------------------------------------------

    if (
      args.transferAccount !==
        undefined &&
      args.transferAccount !==
        null &&
      !isValidObjectId(
        args.transferAccount
      )
    ) {
      errors.push(
        "Invalid destination account ID."
      );
    }


    // -----------------------------------------------------
    // TITLE
    // -----------------------------------------------------

    if (
      args.title !==
        undefined &&
      typeof args.title !==
        "string"
    ) {
      errors.push(
        "Transaction title must be text."
      );
    }


    // -----------------------------------------------------
    // CATEGORY
    // -----------------------------------------------------

    if (
      args.category !==
        undefined &&
      typeof args.category !==
        "string"
    ) {
      errors.push(
        "Transaction category must be text."
      );
    }


    // -----------------------------------------------------
    // NOTES
    // -----------------------------------------------------

    if (
      args.notes !==
        undefined &&
      typeof args.notes !==
        "string"
    ) {
      errors.push(
        "Transaction notes must be text."
      );
    }


    return errors;
  };


// =========================================================
// DELETE TRANSACTION VALIDATION
// =========================================================

const validateDeleteTransaction =
  (args) => {
    const errors = [];

    if (
      !isPlainObject(args)
    ) {
      return [
        "Transaction arguments are required.",
      ];
    }


    if (
      !isValidObjectId(
        args.transactionId
      )
    ) {
      errors.push(
        "A valid transaction ID is required."
      );
    }


    return errors;
  };


// =========================================================
// CHART VALIDATION
// =========================================================
//
// Chart actions are read-only.
//
// They intentionally accept only optional date/range
// parameters and do NOT accept arbitrary MongoDB queries.
//
// =========================================================

const validateChartAction =
  (args) => {
    const errors = [];

    if (
      !isPlainObject(args)
    ) {
      return [
        "Chart arguments must be an object.",
      ];
    }


    // -----------------------------------------------------
    // START DATE
    // -----------------------------------------------------

    if (
      args.startDate !==
        undefined &&
      args.startDate !==
        null &&
      typeof args.startDate !==
        "string"
    ) {
      errors.push(
        "Chart startDate must be text."
      );
    }


    // -----------------------------------------------------
    // END DATE
    // -----------------------------------------------------

    if (
      args.endDate !==
        undefined &&
      args.endDate !==
        null &&
      typeof args.endDate !==
        "string"
    ) {
      errors.push(
        "Chart endDate must be text."
      );
    }


    // -----------------------------------------------------
    // MONTHS
    // -----------------------------------------------------

    if (
      args.months !==
        undefined &&
      !isNonNegativeInteger(
        args.months
      )
    ) {
      errors.push(
        "Chart months must be a non-negative integer."
      );
    }


    // -----------------------------------------------------
    // LIMIT
    // -----------------------------------------------------

    if (
      args.limit !==
        undefined &&
      !isNonNegativeInteger(
        args.limit
      )
    ) {
      errors.push(
        "Chart limit must be a non-negative integer."
      );
    }


    // -----------------------------------------------------
    // MAXIMUM LIMIT
    // -----------------------------------------------------

    if (
      args.limit !==
        undefined &&
      Number(args.limit) >
        24
    ) {
      errors.push(
        "Chart limit cannot exceed 24."
      );
    }


    // -----------------------------------------------------
    // MAXIMUM MONTH RANGE
    // -----------------------------------------------------

    if (
      args.months !==
        undefined &&
      Number(args.months) >
        24
    ) {
      errors.push(
        "Chart range cannot exceed 24 months."
      );
    }


    return errors;
  };


// =========================================================
// REPORT DATA VALIDATION
// =========================================================

const validateReportData =
  (args) => {
    const errors = [];

    if (
      !isPlainObject(args)
    ) {
      return [
        "Report arguments must be an object.",
      ];
    }


    if (
      args.startDate !==
        undefined &&
      args.startDate !==
        null &&
      typeof args.startDate !==
        "string"
    ) {
      errors.push(
        "Report startDate must be text."
      );
    }


    if (
      args.endDate !==
        undefined &&
      args.endDate !==
        null &&
      typeof args.endDate !==
        "string"
    ) {
      errors.push(
        "Report endDate must be text."
      );
    }


    if (
      args.limit !==
        undefined &&
      !isNonNegativeInteger(
        args.limit
      )
    ) {
      errors.push(
        "Report limit must be a non-negative integer."
      );
    }


    if (
      args.limit !==
        undefined &&
      Number(args.limit) >
        1000
    ) {
      errors.push(
        "Report limit cannot exceed 1000."
      );
    }


    return errors;
  };


// =========================================================
// GENERIC READ-ONLY ACTION VALIDATION
// =========================================================
//
// These actions do not need arbitrary arguments.
//
// Examples:
//
// get_accounts
// get_financial_summary
//
// =========================================================

const validateReadOnlyAction =
  (args) => {
    const errors = [];

    if (
      !isPlainObject(args)
    ) {
      return [
        "AI action arguments must be an object.",
      ];
    }

    return errors;
  };


// =========================================================
// GENERIC ACTION VALIDATION
// =========================================================

const validateAction = ({
  action,
  args = {},
}) => {
  const errors = [];


  // -------------------------------------------------------
  // ACTION NAME
  // -------------------------------------------------------

  if (
    typeof action !==
      "string" ||
    !action.trim()
  ) {
    return {
      valid: false,

      errors: [
        "AI action is missing.",
      ],

      actionDefinition:
        null,
    };
  }


  // -------------------------------------------------------
  // ACTION WHITELIST
  // -------------------------------------------------------

  const actionDefinition =
    getAction(
      action
    );


  if (
    !actionDefinition
  ) {
    return {
      valid: false,

      errors: [
        `Unsupported AI action: ${action}`,
      ],

      actionDefinition:
        null,
    };
  }


  // -------------------------------------------------------
  // ARGUMENT OBJECT
  // -------------------------------------------------------

  if (
    !isPlainObject(args)
  ) {
    errors.push(
      "AI action arguments must be an object."
    );
  }


  // -------------------------------------------------------
  // STOP HERE IF ARGUMENTS
  // ARE NOT A VALID OBJECT
  // -------------------------------------------------------

  if (
    errors.length > 0
  ) {
    return {
      valid: false,

      errors,

      actionDefinition,
    };
  }


  // -------------------------------------------------------
  // ACTION-SPECIFIC VALIDATION
  // -------------------------------------------------------

  switch (
    actionDefinition.name
  ) {

    // =====================================================
    // TRANSACTIONS
    // =====================================================

    case "create_transaction":

      errors.push(
        ...validateCreateTransaction(
          args
        )
      );

      break;


    case "update_transaction":

      errors.push(
        ...validateUpdateTransaction(
          args
        )
      );

      break;


    case "delete_transaction":

      errors.push(
        ...validateDeleteTransaction(
          args
        )
      );

      break;


    // =====================================================
    // ACCOUNTS
    // =====================================================

    case "get_accounts":

      errors.push(
        ...validateReadOnlyAction(
          args
        )
      );

      break;


    // =====================================================
    // FINANCIAL SUMMARY
    // =====================================================

    case "get_financial_summary":

      errors.push(
        ...validateReadOnlyAction(
          args
        )
      );

      break;


    // =====================================================
    // CHART ACTIONS
    // =====================================================

    case "get_income_chart":

      errors.push(
        ...validateChartAction(
          args
        )
      );

      break;


    case "get_expense_chart":

      errors.push(
        ...validateChartAction(
          args
        )
      );

      break;


    case "get_income_vs_expense_chart":

      errors.push(
        ...validateChartAction(
          args
        )
      );

      break;


    case "get_category_breakdown":

      errors.push(
        ...validateChartAction(
          args
        )
      );

      break;


    case "get_monthly_financial_chart":

      errors.push(
        ...validateChartAction(
          args
        )
      );

      break;


    // =====================================================
    // REPORT DATA
    // =====================================================

    case "get_report_data":

      errors.push(
        ...validateReportData(
          args
        )
      );

      break;


    // =====================================================
    // OTHER ACTIONS
    // =====================================================

    default:

      // The action is already whitelisted.
      // Additional validation can be added here when
      // its executor is implemented.

      break;
  }


  // -------------------------------------------------------
  // RESULT
  // -------------------------------------------------------

  return {
    valid:
      errors.length === 0,

    errors,

    actionDefinition,
  };
};


// =========================================================
// CONFIRMATION CHECK
// =========================================================

const actionNeedsConfirmation =
  (action) => {

    const definition =
      getAction(
        action
      );


    if (
      !definition
    ) {
      return false;
    }


    return (
      definition.requiresConfirmation ===
      true
    );
  };


// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  validateAction,

  actionNeedsConfirmation,

  isValidObjectId,

  isPositiveNumber,

  cleanString,
};