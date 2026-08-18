import { useState } from "react";

import {
  FaBrain,
  FaLightbulb,
  FaTriangleExclamation,
  FaArrowTrendUp,
  FaPiggyBank,
  FaRotate,
  FaWandMagicSparkles,
} from "react-icons/fa6";

import { toast } from "react-toastify";

import API from "../../services/api";

import "../styles/reportAIInsights.css";

function ReportAIInsights({
  income = 0,
  expense = 0,
  balance = 0,
  savings = 0,
  totalTransactions = 0,
  transactions = [],
}) {
  const [insights, setInsights] = useState([]);

  const [loading, setLoading] = useState(false);

  // =====================================================
  // Generate AI Insights
  // =====================================================

  const generateInsights = async () => {
    // -----------------------------------------------
    // No transactions
    // -----------------------------------------------

    if (!Array.isArray(transactions) || transactions.length === 0) {
      setInsights([]);

      toast.info(
        "Add transactions to generate financial insights."
      );

      return;
    }

    try {
      setLoading(true);

      // -----------------------------------------------
      // Gemini API Request
      // -----------------------------------------------

      const { data } = await API.post(
        "/ai/report-insights",
        {
          income,
          expense,
          balance,
          savings,
          totalTransactions,
          transactions,
        }
      );

      // -----------------------------------------------
      // Successful Response
      // -----------------------------------------------

      if (
        data.success &&
        Array.isArray(data.insights)
      ) {
        setInsights(data.insights);

        toast.success(
          "Financial insights generated successfully."
        );
      } else {
        setInsights([]);

        toast.error(
          "AI returned no financial insights."
        );
      }

    } catch (error) {
      console.error(
        "AI Insights Error:",
        error
      );

      setInsights([]);

      // -----------------------------------------------
      // Handle Rate Limit
      // -----------------------------------------------

      if (error.response?.status === 429) {
        toast.error(
          "AI request limit reached. Please wait a moment and try again."
        );

        return;
      }

      // -----------------------------------------------
      // Handle Gemini Unavailable
      // -----------------------------------------------

      if (error.response?.status === 503) {
        toast.error(
          "AI service is temporarily busy. Please try again later."
        );

        return;
      }

      // -----------------------------------------------
      // Other Errors
      // -----------------------------------------------

      toast.error(
        error.response?.data?.message ||
        "Unable to generate AI insights."
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // Get Insight Icon
  // =====================================================

  const getIcon = (type) => {
    switch (type) {
      case "spending":
        return <FaLightbulb />;

      case "income":
        return <FaArrowTrendUp />;

      case "savings":
        return <FaPiggyBank />;

      case "warning":
        return <FaTriangleExclamation />;

      default:
        return <FaLightbulb />;
    }
  };

  // =====================================================
  // Empty State
  // =====================================================

  if (
    !loading &&
    transactions.length === 0
  ) {
    return (
      <section className="report-ai-card">

        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="report-ai-header">

          <div className="report-ai-title">

            <div className="report-ai-icon">
              <FaBrain />
            </div>

            <div>
              <h2>
                AI Financial Insights
              </h2>

              <p>
                Personalized insights from your
                selected report.
              </p>
            </div>

          </div>

        </div>

        {/* ==========================================
            EMPTY STATE
        ========================================== */}

        <div className="report-ai-empty">

          <FaBrain />

          <h3>
            No Insights Yet
          </h3>

          <p>
            Add transactions to generate
            personalized financial insights.
          </p>

        </div>

      </section>
    );
  }

  // =====================================================
  // Render
  // =====================================================

  return (
    <section className="report-ai-card">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="report-ai-header">

        <div className="report-ai-title">

          <div className="report-ai-icon">
            <FaBrain />
          </div>

          <div>

            <h2>
              AI Financial Insights
            </h2>

            <p>
              Personalized analysis of your
              selected report.
            </p>

          </div>

        </div>

        {/* =============================================
            GENERATE / REFRESH BUTTON
        ============================================= */}

        <button
          type="button"
          className="report-ai-refresh"
          onClick={generateInsights}
          disabled={loading}
        >

          {loading ? (
            <FaRotate className="ai-spinning" />
          ) : insights.length > 0 ? (
            <FaRotate />
          ) : (
            <FaWandMagicSparkles />
          )}

          {loading
            ? "Analyzing..."
            : insights.length > 0
            ? "Refresh"
            : "Generate Insights"}

        </button>

      </div>

      {/* =================================================
          BEFORE FIRST GENERATION
      ================================================= */}

      {!loading &&
        insights.length === 0 && (

          <div className="report-ai-empty">

            <div className="report-ai-empty-icon">
              <FaBrain />
            </div>

            <h3>
              Get Your Financial Insights
            </h3>

            <p>
              Let SmaXTify.AI analyze your
              selected transactions and identify
              useful spending, income, and
              savings patterns.
            </p>

            <button
              type="button"
              className="report-ai-generate-btn"
              onClick={generateInsights}
            >

              <FaWandMagicSparkles />

              Generate AI Insights

            </button>

          </div>

        )}

      {/* =================================================
          LOADING
      ================================================= */}

      {loading && (

        <div className="report-ai-loading">

          <div className="ai-loader">
            <FaBrain />
          </div>

          <h3>
            Analyzing your finances...
          </h3>

          <p>
            SmaXTify.AI is looking for useful
            spending and savings patterns.
          </p>

        </div>

      )}

      {/* =================================================
          INSIGHTS
      ================================================= */}

      {!loading &&
        insights.length > 0 && (

          <div className="report-ai-list">

            {insights.map(
              (insight, index) => (

                <article
                  key={index}
                  className={`report-ai-insight ${
                    insight.priority || "neutral"
                  }`}
                >

                  {/* Insight Icon */}

                  <div className="report-ai-insight-icon">

                    {getIcon(
                      insight.type
                    )}

                  </div>

                  {/* Insight Content */}

                  <div className="report-ai-insight-content">

                    <div className="report-ai-insight-heading">

                      <h3>
                        {insight.title}
                      </h3>

                      <span>
                        {insight.type}
                      </span>

                    </div>

                    <p>
                      {insight.message}
                    </p>

                  </div>

                </article>

              )
            )}

          </div>

        )}

    </section>
  );
}

export default ReportAIInsights;