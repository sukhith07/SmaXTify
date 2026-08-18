import {
  FaFilePdf,
  FaFileExcel,
  FaPrint,
} from "react-icons/fa6";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

import "../styles/reportExport.css";

function ReportExport({
  report = {},
  transactions = [],
  period,
  category,
  startDate,
  endDate,
}) {

  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  const formatCurrency = (amount) => {

    return `Rs. ${Number(
      amount || 0
    ).toLocaleString("en-IN")}`;

  };


  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {

    if (!date) {
      return "-";
    }

    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  };


  // =====================================================
  // REPORT PERIOD
  // =====================================================

  const getPeriodLabel = () => {

    switch (period) {

      case "thisMonth":
        return "This Month";

      case "lastMonth":
        return "Last Month";

      case "thisYear":
        return "This Year";

      case "allTime":
        return "All Time";

      case "custom":

        if (
          startDate &&
          endDate
        ) {

          const start =
            startDate instanceof Date
              ? formatDate(startDate)
              : startDate;

          const end =
            endDate instanceof Date
              ? formatDate(endDate)
              : endDate;

          return `${start} - ${end}`;

        }

        return "Custom Range";

      default:
        return "Selected Period";

    }

  };


  // =====================================================
  // PDF EXPORT
  // =====================================================

  const exportPDF = () => {

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });


    const pageWidth =
      doc.internal.pageSize.getWidth();

    const pageHeight =
      doc.internal.pageSize.getHeight();

    const margin = 14;

    const contentWidth =
      pageWidth - margin * 2;


    // =================================================
    // COLORS
    // =================================================

    const colors = {

      dark: [15, 23, 42],

      text: [51, 65, 85],

      muted: [100, 116, 139],

      border: [226, 232, 240],

      light: [248, 250, 252],

      blue: [37, 99, 235],

      purple: [124, 58, 237],

      green: [22, 163, 74],

      red: [220, 38, 38],

    };


    // =================================================
    // HEADER
    // =================================================

    doc.setFillColor(
      ...colors.blue
    );

    doc.rect(
      0,
      0,
      pageWidth,
      38,
      "F"
    );


    // Brand

    doc.setTextColor(
      255,
      255,
      255
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(22);

    doc.text(
      "SmaXTify",
      margin,
      17
    );


    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(9);

    doc.text(
      "Personal Finance Management",
      margin,
      24
    );


    // Report title

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(12);

    doc.text(
      "FINANCIAL REPORT",
      pageWidth - margin,
      17,
      {
        align: "right",
      }
    );


    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(8);

    doc.text(
      `Generated ${formatDate(new Date())}`,
      pageWidth - margin,
      24,
      {
        align: "right",
      }
    );


    // =================================================
    // REPORT OVERVIEW
    // =================================================

    let y = 50;


    doc.setTextColor(
      ...colors.dark
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(15);

    doc.text(
      "Report Overview",
      margin,
      y
    );


    y += 9;


    const infoWidth =
      (contentWidth - 8) / 2;

    const infoHeight = 18;


    // Period

    doc.setFillColor(
      ...colors.light
    );

    doc.roundedRect(
      margin,
      y,
      infoWidth,
      infoHeight,
      3,
      3,
      "F"
    );


    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(7);

    doc.setTextColor(
      ...colors.muted
    );

    doc.text(
      "TIME PERIOD",
      margin + 5,
      y + 7
    );


    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(10);

    doc.setTextColor(
      ...colors.dark
    );

    doc.text(
      getPeriodLabel(),
      margin + 5,
      y + 13
    );


    // Category

    doc.setFillColor(
      ...colors.light
    );

    doc.roundedRect(
      margin + infoWidth + 8,
      y,
      infoWidth,
      infoHeight,
      3,
      3,
      "F"
    );


    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(7);

    doc.setTextColor(
      ...colors.muted
    );

    doc.text(
      "CATEGORY",
      margin + infoWidth + 13,
      y + 7
    );


    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(10);

    doc.setTextColor(
      ...colors.dark
    );

    doc.text(
      category ||
        "All Categories",
      margin + infoWidth + 13,
      y + 13
    );


    y += 30;


    // =================================================
    // FINANCIAL SUMMARY
    // =================================================

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(15);

    doc.setTextColor(
      ...colors.dark
    );

    doc.text(
      "Financial Summary",
      margin,
      y
    );


    y += 7;


    const summaryWidth =
      (contentWidth - 12) / 4;


    const summaryItems = [

      {
        label: "Income",

        value:
          formatCurrency(
            report.income
          ),

        color:
          colors.green,
      },

      {
        label: "Expenses",

        value:
          formatCurrency(
            report.expense
          ),

        color:
          colors.red,
      },

      {
        label: "Balance",

        value:
          formatCurrency(
            report.balance
          ),

        color:
          Number(report.balance) >= 0
            ? colors.blue
            : colors.red,
      },

      {
        label: "Savings Rate",

        value:
          `${Number(
            report.savings || 0
          )}%`,

        color:
          colors.purple,
      },

    ];


    summaryItems.forEach(
      (item, index) => {

        const x =
          margin +
          index *
            (summaryWidth + 4);


        doc.setFillColor(
          255,
          255,
          255
        );

        doc.setDrawColor(
          ...colors.border
        );


        doc.roundedRect(
          x,
          y,
          summaryWidth,
          27,
          3,
          3,
          "FD"
        );


        doc.setFillColor(
          ...item.color
        );


        doc.roundedRect(
          x,
          y,
          2,
          27,
          1,
          1,
          "F"
        );


        doc.setFont(
          "helvetica",
          "normal"
        );

        doc.setFontSize(7);

        doc.setTextColor(
          ...colors.muted
        );


        doc.text(
          item.label.toUpperCase(),
          x + 6,
          y + 8
        );


        doc.setFont(
          "helvetica",
          "bold"
        );

        doc.setFontSize(9);

        doc.setTextColor(
          ...item.color
        );


        doc.text(
          item.value,
          x + 6,
          y + 18
        );

      }
    );


    y += 37;


    // =================================================
    // TRANSACTION OVERVIEW
    // =================================================

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(15);

    doc.setTextColor(
      ...colors.dark
    );


    doc.text(
      "Transaction Overview",
      margin,
      y
    );


    y += 8;


    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(9);

    doc.setTextColor(
      ...colors.text
    );


    doc.text(
      `Total transactions: ${
        report.totalTransactions || 0
      }`,
      margin,
      y
    );


    y += 15;


    // =================================================
    // TRANSACTION DATA
    // =================================================

    const transactionRows =
      transactions.map(
        (transaction) => [

          transaction.title ||
            "Untitled",

          transaction.category ||
            "Other",

          transaction.type ||
            "Expense",

          formatCurrency(
            transaction.amount
          ),

          formatDate(
            transaction.date
          ),

        ]
      );


    // =================================================
    // TRANSACTION TABLE
    // =================================================

    autoTable(
      doc,
      {

        startY: y,

        margin: {
          left: margin,
          right: margin,
          bottom: 16,
        },


        head: [

          [
            "Title",
            "Category",
            "Type",
            "Amount",
            "Date",
          ],

        ],


        body:
          transactionRows.length > 0
            ? transactionRows
            : [

                [
                  "No transactions",
                  "-",
                  "-",
                  "-",
                  "-",
                ],

              ],


        theme: "grid",


        styles: {

          font:
            "helvetica",

          fontSize: 8,

          cellPadding: 4,

          textColor:
            colors.text,

          lineColor:
            colors.border,

          lineWidth:
            0.2,

          valign:
            "middle",

        },


        headStyles: {

          fillColor:
            colors.dark,

          textColor:
            [255, 255, 255],

          fontStyle:
            "bold",

          fontSize: 8,

        },


        alternateRowStyles: {

          fillColor:
            [248, 250, 252],

        },


        columnStyles: {

          0: {
            cellWidth: 52,
          },

          1: {
            cellWidth: 34,
          },

          2: {
            cellWidth: 25,
          },

          3: {
            cellWidth: 34,
            halign: "right",
          },

          4: {
            cellWidth: 31,
          },

        },


        didDrawPage: () => {

          const footerY =
            pageHeight - 9;


          doc.setFont(
            "helvetica",
            "normal"
          );

          doc.setFontSize(7);

          doc.setTextColor(
            ...colors.muted
          );


          doc.text(
            "SmaXTify • Personal Finance Report",
            margin,
            footerY
          );


          const pageNumber =
            doc.internal.getNumberOfPages();


          doc.text(
            `Page ${pageNumber}`,
            pageWidth - margin,
            footerY,
            {
              align: "right",
            }
          );

        },

      }
    );


    // =================================================
    // SAVE PDF
    // =================================================

    doc.save(
      "SmaXTify-Financial-Report.pdf"
    );

  };


  // =====================================================
  // EXCEL EXPORT
  // =====================================================

  const exportExcel = () => {

    const summaryData = [

      {

        "Report Period":
          getPeriodLabel(),

        "Category":
          category ||
          "All Categories",

        "Income":
          Number(
            report.income
          ) || 0,

        "Expenses":
          Number(
            report.expense
          ) || 0,

        "Balance":
          Number(
            report.balance
          ) || 0,

        "Savings Rate":
          Number(
            report.savings
          ) || 0,

        "Transactions":
          Number(
            report.totalTransactions
          ) || 0,

      },

    ];


    const transactionData =
      transactions.map(
        (transaction) => ({

          Title:
            transaction.title ||
            "Untitled",

          Category:
            transaction.category ||
            "Other",

          Type:
            transaction.type ||
            "Expense",

          Amount:
            Number(
              transaction.amount
            ) || 0,

          Date:
            transaction.date
              ? new Date(
                  transaction.date
                ).toLocaleDateString(
                  "en-IN"
                )
              : "",

        })
      );


    // =================================================
    // WORKBOOK
    // =================================================

    const workbook =
      XLSX.utils.book_new();


    // =================================================
    // SUMMARY SHEET
    // =================================================

    const summarySheet =
      XLSX.utils.json_to_sheet(
        summaryData
      );


    summarySheet["!cols"] = [

      {
        wch: 18,
      },

      {
        wch: 20,
      },

      {
        wch: 16,
      },

      {
        wch: 16,
      },

      {
        wch: 16,
      },

      {
        wch: 16,
      },

      {
        wch: 16,
      },

    ];


    XLSX.utils.book_append_sheet(
      workbook,
      summarySheet,
      "Summary"
    );


    // =================================================
    // TRANSACTIONS SHEET
    // =================================================

    const transactionSheet =
      XLSX.utils.json_to_sheet(
        transactionData.length
          ? transactionData
          : [
              {
                Title:
                  "No transactions",
              },
            ]
      );


    transactionSheet["!cols"] = [

      {
        wch: 30,
      },

      {
        wch: 20,
      },

      {
        wch: 15,
      },

      {
        wch: 18,
      },

      {
        wch: 18,
      },

    ];


    transactionSheet["!autofilter"] = {

      ref:
        transactionSheet["!ref"],

    };


    transactionSheet["!freeze"] = {

      ySplit: 1,

    };


    XLSX.utils.book_append_sheet(
      workbook,
      transactionSheet,
      "Transactions"
    );


    // =================================================
    // DOWNLOAD
    // =================================================

    XLSX.writeFile(
      workbook,
      "SmaXTify-Financial-Report.xlsx"
    );

  };


  // =====================================================
// PRINT REPORT
// =====================================================

const printReport = () => {

    document.body.classList.add(
        "printing-report"
    );

    window.print();

    // Restore normal UI after printing
    setTimeout(() => {

        document.body.classList.remove(
            "printing-report"
        );

    }, 1000);

};


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <section className="report-export">

      <div className="report-export-heading">

        <div>

          <h2>
            Export Report
          </h2>

          <p>
            Download or print your financial report.
          </p>

        </div>

      </div>


      <div className="report-export-actions">

        {/* PDF */}

        <button
          type="button"
          className="export-btn export-pdf"
          onClick={exportPDF}
        >

          <FaFilePdf />

          <span>
            Export PDF
          </span>

        </button>


        {/* Excel */}

        <button
          type="button"
          className="export-btn export-excel"
          onClick={exportExcel}
        >

          <FaFileExcel />

          <span>
            Export Excel
          </span>

        </button>


        {/* Print */}

        <button
          type="button"
          className="export-btn export-print"
          onClick={printReport}
        >

          <FaPrint />

          <span>
            Print Report
          </span>

        </button>

      </div>

    </section>

  );

}

export default ReportExport;