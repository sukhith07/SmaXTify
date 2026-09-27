// =========================================================
// SMAxTIFY AI ACTION DEFINITIONS
// =========================================================
//
// Central whitelist of actions that SmaXTify.AI is allowed
// to request.
//
// IMPORTANT:
//
// Gemini does NOT execute these actions directly.
//
// Gemini only identifies the requested action.
// The backend validator checks the action.
// The backend executor performs the operation.
//
// Read-only actions:
// - No confirmation required
//
// Destructive actions:
// - Confirmation required
//
// =========================================================

const AI_ACTIONS = {

  // =======================================================
  // TRANSACTIONS
  // =======================================================

  CREATE_TRANSACTION: {
    name: "create_transaction",

    description:
      "Create a new income, expense, or transfer transaction.",

    destructive: false,

    requiresConfirmation: false,
  },


  UPDATE_TRANSACTION: {
    name: "update_transaction",

    description:
      "Update an existing income, expense, or transfer transaction.",

    destructive: true,

    requiresConfirmation: true,
  },


  DELETE_TRANSACTION: {
    name: "delete_transaction",

    description:
      "Delete an existing transaction.",

    destructive: true,

    requiresConfirmation: true,
  },


  // =======================================================
  // ACCOUNTS
  // =======================================================

  GET_ACCOUNTS: {
    name: "get_accounts",

    description:
      "View the authenticated user's own financial accounts and balances.",

    destructive: false,

    requiresConfirmation: false,
  },


  CREATE_ACCOUNT: {
    name: "create_account",

    description:
      "Create a new financial account for the authenticated user.",

    destructive: false,

    requiresConfirmation: false,
  },


  UPDATE_ACCOUNT: {
    name: "update_account",

    description:
      "Update one of the authenticated user's financial accounts.",

    destructive: true,

    requiresConfirmation: true,
  },


  DELETE_ACCOUNT: {
    name: "delete_account",

    description:
      "Delete one of the authenticated user's financial accounts.",

    destructive: true,

    requiresConfirmation: true,
  },


  // =======================================================
  // BUDGET
  // =======================================================

  GET_BUDGET: {
    name: "get_budget",

    description:
      "View the authenticated user's budget information.",

    destructive: false,

    requiresConfirmation: false,
  },


  SAVE_BUDGET: {
    name: "save_budget",

    description:
      "Create or update the authenticated user's monthly budget.",

    destructive: true,

    requiresConfirmation: true,
  },


  DELETE_BUDGET: {
    name: "delete_budget",

    description:
      "Delete the authenticated user's monthly budget.",

    destructive: true,

    requiresConfirmation: true,
  },


  // =======================================================
  // SAVINGS GOALS
  // =======================================================

  GET_GOALS: {
    name: "get_goals",

    description:
      "View the authenticated user's savings goals.",

    destructive: false,

    requiresConfirmation: false,
  },


  CREATE_GOAL: {
    name: "create_goal",

    description:
      "Create a new savings goal for the authenticated user.",

    destructive: false,

    requiresConfirmation: false,
  },


  ADD_GOAL_SAVINGS: {
    name: "add_goal_savings",

    description:
      "Add money to an existing savings goal.",

    destructive: true,

    requiresConfirmation: true,
  },


  UPDATE_GOAL: {
    name: "update_goal",

    description:
      "Update an existing savings goal.",

    destructive: true,

    requiresConfirmation: true,
  },


  DELETE_GOAL: {
    name: "delete_goal",

    description:
      "Delete an existing savings goal.",

    destructive: true,

    requiresConfirmation: true,
  },


  // =======================================================
  // SUBSCRIPTIONS
  // =======================================================

  GET_SUBSCRIPTIONS: {
    name: "get_subscriptions",

    description:
      "View the authenticated user's subscriptions.",

    destructive: false,

    requiresConfirmation: false,
  },


  CREATE_SUBSCRIPTION: {
    name: "create_subscription",

    description:
      "Create a new subscription for the authenticated user.",

    destructive: false,

    requiresConfirmation: false,
  },


  UPDATE_SUBSCRIPTION: {
    name: "update_subscription",

    description:
      "Update an existing subscription.",

    destructive: true,

    requiresConfirmation: true,
  },


  DELETE_SUBSCRIPTION: {
    name: "delete_subscription",

    description:
      "Delete an existing subscription.",

    destructive: true,

    requiresConfirmation: true,
  },


  // =======================================================
  // NAVIGATION
  // =======================================================

  NAVIGATE: {
    name: "navigate",

    description:
      "Navigate the user to an available SmaXTify page.",

    destructive: false,

    requiresConfirmation: false,
  },


  // =======================================================
  // FINANCIAL INFORMATION
  // =======================================================

  GET_FINANCIAL_SUMMARY: {
    name: "get_financial_summary",

    description:
      "Get a summary of the authenticated user's own financial data.",

    destructive: false,

    requiresConfirmation: false,
  },


  // =======================================================
  // FINANCIAL VISUALIZATION
  // =======================================================

  GET_INCOME_CHART: {
    name: "get_income_chart",

    description:
      "Get the authenticated user's income data grouped by month for displaying an income chart.",

    destructive: false,

    requiresConfirmation: false,
  },


  GET_EXPENSE_CHART: {
    name: "get_expense_chart",

    description:
      "Get the authenticated user's expense data grouped by month for displaying an expense chart.",

    destructive: false,

    requiresConfirmation: false,
  },


  GET_INCOME_VS_EXPENSE_CHART: {
    name: "get_income_vs_expense_chart",

    description:
      "Get the authenticated user's monthly income and expense data for displaying an income versus expense chart.",

    destructive: false,

    requiresConfirmation: false,
  },


  GET_CATEGORY_BREAKDOWN: {
    name: "get_category_breakdown",

    description:
      "Get the authenticated user's expense data grouped by category for displaying a category breakdown chart.",

    destructive: false,

    requiresConfirmation: false,
  },


  GET_MONTHLY_FINANCIAL_CHART: {
    name: "get_monthly_financial_chart",

    description:
      "Get the authenticated user's monthly financial data including income, expenses, savings, and transaction counts for visualization.",

    destructive: false,

    requiresConfirmation: false,
  },


  // =======================================================
  // REPORT DATA
  // =======================================================

  GET_REPORT_DATA: {
    name: "get_report_data",

    description:
      "Get the authenticated user's financial report data for analysis and visualization.",

    destructive: false,

    requiresConfirmation: false,
  },
};


// =========================================================
// GET ACTION
// =========================================================

const getAction = (
  actionName
) => {

  if (
    typeof actionName !==
    "string"
  ) {
    return null;
  }


  const normalized =
    actionName
      .trim()
      .toUpperCase();


  return (
    AI_ACTIONS[
      normalized
    ] ||

    Object.values(
      AI_ACTIONS
    ).find(
      (action) =>
        action.name ===
        actionName.trim()
    ) ||

    null
  );
};


// =========================================================
// VALID ACTION CHECK
// =========================================================

const isValidAction = (
  actionName
) => {
  return !!getAction(
    actionName
  );
};


// =========================================================
// CONFIRMATION CHECK
// =========================================================

const requiresConfirmation = (
  actionName
) => {

  const action =
    getAction(
      actionName
    );


  return action
    ? action.requiresConfirmation
    : false;
};


// =========================================================
// DESTRUCTIVE ACTION CHECK
// =========================================================

const isDestructiveAction = (
  actionName
) => {

  const action =
    getAction(
      actionName
    );


  return action
    ? action.destructive
    : false;
};


// =========================================================
// READ-ONLY ACTION CHECK
// =========================================================

const isReadOnlyAction = (
  actionName
) => {

  const action =
    getAction(
      actionName
    );


  return action
    ? !action.destructive
    : false;
};


// =========================================================
// GET ALL ACTIONS
// =========================================================

const getAllActions = () => {
  return Object.values(
    AI_ACTIONS
  );
};


// =========================================================
// GET ACTION NAMES
// =========================================================

const getActionNames = () => {
  return Object.values(
    AI_ACTIONS
  ).map(
    (action) =>
      action.name
  );
};


// =========================================================
// EXPORT
// =========================================================

module.exports = {
  AI_ACTIONS,

  getAction,

  isValidAction,

  requiresConfirmation,

  isDestructiveAction,

  isReadOnlyAction,

  getAllActions,

  getActionNames,
};