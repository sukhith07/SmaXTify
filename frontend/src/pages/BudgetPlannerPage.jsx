import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import BudgetPlanner from "../components/BudgetPlanner";

import "../components/styles/dashboard.css";

function BudgetPlannerPage() {

  return (

    <div className="dashboard">

      <Sidebar />

      <div className="dashboard-content">

        <Navbar />

        <div className="dashboard-main">

          <BudgetPlanner />

        </div>

      </div>

    </div>

  );

}

export default BudgetPlannerPage;