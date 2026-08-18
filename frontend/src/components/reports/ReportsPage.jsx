import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import API from "../../services/api";

import ReportHeader from "./ReportHeader";
import ReportFilters from "./ReportFilters";
import ReportSummary from "./ReportSummary";
import ReportCategoryChart from "./ReportCategoryChart";
import ReportIncomeExpenseChart from "./ReportIncomeExpenseChart";
import ReportTrendChart from "./ReportTrendChart";
import ReportAnalytics from "./ReportAnalytics";
import ReportAIInsights from "./ReportAIInsights";
import ReportExport from "./ReportExport";

import "../styles/reportsPage.css";


function ReportsPage() {

  // =====================================================
  // FILTER STATE
  // =====================================================

  const [period, setPeriod] =
    useState("thisMonth");

  const [category, setCategory] =
    useState("All Categories");

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");


  // =====================================================
  // REPORT DATA
  // =====================================================

  const [report, setReport] = useState({

    income: 0,

    expense: 0,

    balance: 0,

    savings: 0,

    totalTransactions: 0,

  });


  // =====================================================
  // TRANSACTIONS
  // =====================================================

  const [transactions, setTransactions] =
    useState([]);


  // =====================================================
  // LOADING
  // =====================================================

  const [loading, setLoading] =
    useState(true);


  // =====================================================
  // ERROR
  // =====================================================

  const [error, setError] =
    useState("");


  // =====================================================
  // LOAD REPORT FROM BACKEND
  // =====================================================

  const loadReport = async () => {

    try {

      setLoading(true);

      setError("");


      // =================================================
      // BUILD QUERY PARAMETERS
      // =================================================

      const params =
        new URLSearchParams();


      params.append(
        "period",
        period
      );


      params.append(
        "category",
        category
      );


      // =================================================
      // CUSTOM DATE RANGE
      // =================================================

      if (period === "custom") {

        if (
          !startDate ||
          !endDate
        ) {

          setLoading(false);

          return;

        }


        // -----------------------------------------------
        // Convert Date Object
        // -----------------------------------------------

        const formattedStartDate =
          startDate instanceof Date
            ? startDate
                .toISOString()
                .split("T")[0]
            : startDate;


        const formattedEndDate =
          endDate instanceof Date
            ? endDate
                .toISOString()
                .split("T")[0]
            : endDate;


        params.append(
          "startDate",
          formattedStartDate
        );


        params.append(
          "endDate",
          formattedEndDate
        );

      }


      // =================================================
      // API REQUEST
      // =================================================

      const { data } =
        await API.get(
          `/reports?${params.toString()}`
        );


      // =================================================
      // VALIDATE RESPONSE
      // =================================================

      if (!data.success) {

        throw new Error(
          data.message ||
          "Failed to generate report."
        );

      }


      // =================================================
      // UPDATE REPORT SUMMARY
      // =================================================

      if (
        data.success &&
        data.summary
      ) {

        setReport({

          income:
            Number(
              data.summary.income
            ) || 0,

          expense:
            Number(
              data.summary.expense
            ) || 0,

          balance:
            Number(
              data.summary.balance
            ) || 0,

          savings:
            Number(
              data.summary.savings
            ) || 0,

          totalTransactions:
            Number(
              data.summary.totalTransactions
            ) || 0,

        });

      } else {

        setReport({

          income: 0,

          expense: 0,

          balance: 0,

          savings: 0,

          totalTransactions: 0,

        });

      }


      // =================================================
      // UPDATE TRANSACTIONS
      // =================================================

      setTransactions(

        Array.isArray(
          data.transactions
        )
          ? data.transactions
          : []

      );

    } catch (error) {

      // =================================================
      // ERROR HANDLING
      // =================================================

      console.error(
        "Reports Load Error:",
        error
      );


      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Unable to load your financial report.";


      setError(
        errorMessage
      );


      toast.error(
        errorMessage
      );


      // Reset report data

      setReport({

        income: 0,

        expense: 0,

        balance: 0,

        savings: 0,

        totalTransactions: 0,

      });


      setTransactions([]);

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // LOAD WHEN FILTERS CHANGE
  // =====================================================

  useEffect(() => {

    if (
      period === "custom" &&
      (
        !startDate ||
        !endDate
      )
    ) {

      setLoading(false);

      return;

    }


    loadReport();

  }, [

    period,

    category,

    startDate,

    endDate,

  ]);


  // =====================================================
  // RESET FILTERS
  // =====================================================

  const resetFilters = () => {

    setPeriod(
      "thisMonth"
    );

    setCategory(
      "All Categories"
    );

    setStartDate("");

    setEndDate("");

  };


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <main className="reports-page">


      {/* =================================================
          REPORT HEADER
      ================================================= */}

      <ReportHeader />


      {/* =================================================
          REPORT FILTERS
      ================================================= */}

      <ReportFilters

        period={period}

        setPeriod={setPeriod}

        category={category}

        setCategory={setCategory}

        startDate={startDate}

        setStartDate={setStartDate}

        endDate={endDate}

        setEndDate={setEndDate}

        onReset={
          resetFilters
        }

      />


      {/* =================================================
          LOADING STATE
      ================================================= */}

      {loading ? (

        <section className="reports-state reports-loading">

          <div className="reports-state-icon">

            <div className="reports-spinner" />

          </div>


          <h3>
            Loading Report
          </h3>


          <p>
            We're preparing your financial report...
          </p>

        </section>


      ) : error ? (


        /* =================================================
           ERROR STATE
        ================================================= */

        <section className="reports-state reports-error">

          <div className="reports-state-icon">
            ⚠️
          </div>


          <h3>
            Unable to Load Report
          </h3>


          <p>
            {error}
          </p>


          <button
            type="button"
            className="reports-retry-btn"
            onClick={loadReport}
          >
            Try Again
          </button>

        </section>


      ) : (


        /* =================================================
           REPORT CONTENT
        ================================================= */

        <section className="reports-section">


          {/* =================================================
              SUMMARY
          ================================================= */}

          <ReportSummary

            income={
              report.income
            }

            expense={
              report.expense
            }

            balance={
              report.balance
            }

          />


          {/* =================================================
              RESULT INFORMATION
          ================================================= */}

          <div className="report-result-info">

            <span>

              Showing{" "}

              <strong>
                {
                  report.totalTransactions
                }
              </strong>{" "}

              transactions

            </span>


            <span>

              {category}

            </span>

          </div>


          {/* =================================================
              EMPTY STATE / REPORT DATA
          ================================================= */}

          {transactions.length === 0 ? (


            /* =================================================
               EMPTY REPORT STATE
            ================================================= */

            <section className="reports-empty">

              <div className="reports-empty-icon">
                📊
              </div>


              <h3>
                No Transactions Found
              </h3>


              <p>
                There are no transactions for the selected
                period and category. Try changing your filters
                or add a new transaction.
              </p>


              <button
                type="button"
                className="reports-empty-reset"
                onClick={
                  resetFilters
                }
              >
                Reset Filters
              </button>

            </section>


          ) : (


            /* =================================================
               REPORT DATA
            ================================================= */

            <>


              {/* =============================================
                  PHASE 3.1 + 3.2
                  CHART GRID
              ============================================= */}

              <div className="reports-chart-grid">


                {/* ===========================================
                    EXPENSE BY CATEGORY
                =========================================== */}

                <ReportCategoryChart

                  transactions={
                    transactions
                  }

                />


                {/* ===========================================
                    INCOME VS EXPENSE
                =========================================== */}

                <ReportIncomeExpenseChart

                  income={
                    report.income
                  }

                  expense={
                    report.expense
                  }

                />

              </div>


              {/* =============================================
                  PHASE 3.3
                  INCOME & EXPENSE TREND
              ============================================= */}

              <ReportTrendChart

                transactions={
                  transactions
                }

              />


              {/* =============================================
                  PHASE 4.1
                  FINANCIAL ANALYTICS
              ============================================= */}

              <ReportAnalytics

                income={
                  report.income
                }

                expense={
                  report.expense
                }

                balance={
                  report.balance
                }

                totalTransactions={
                  report.totalTransactions
                }

                transactions={
                  transactions
                }

              />


              {/* =============================================
                  PHASE 4.2
                  AI FINANCIAL INSIGHTS
              ============================================= */}

              <ReportAIInsights

                income={
                  report.income
                }

                expense={
                  report.expense
                }

                balance={
                  report.balance
                }

                savings={
                  report.savings
                }

                totalTransactions={
                  report.totalTransactions
                }

                transactions={
                  transactions
                }

              />


              {/* =============================================
                  PHASE 5
                  EXPORT
              ============================================= */}

              <ReportExport

                report={
                  report
                }

                transactions={
                  transactions
                }

                period={
                  period
                }

                category={
                  category
                }

                startDate={
                  startDate
                }

                endDate={
                  endDate
                }

              />

            </>

          )}

        </section>

      )}

    </main>

  );

}


export default ReportsPage;