import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

import ReportsPage from "../components/reports/ReportsPage";

import "../components/styles/dashboard.css";

function Reports() {

  return (

    <div className="dashboard">

      {/* =====================================
          Sidebar
      ===================================== */}

      <Sidebar />

      {/* =====================================
          Main Application Area
      ===================================== */}

      <div className="dashboard-content">

        {/* Top Navbar */}
        <Navbar />

        {/* =====================================
            Reports Content
        ===================================== */}

        <div className="dashboard-main">

          <ReportsPage />

        </div>

      </div>

    </div>

  );

}

export default Reports;