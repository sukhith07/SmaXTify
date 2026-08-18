import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

import "../components/styles/dashboard.css";

function BillReminders() {

  return (

    <div className="dashboard">

      <Sidebar />

      <div className="dashboard-content">

        <Navbar />

        <div className="dashboard-main">

          <h1>🔔 Bill Reminders</h1>

          <p>
            Bill Reminder module coming soon.
          </p>

        </div>

      </div>

    </div>

  );

}

export default BillReminders;