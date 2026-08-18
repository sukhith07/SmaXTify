import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

import "../components/styles/dashboard.css";

function Settings() {

  return (

    <div className="dashboard">

      <Sidebar />

      <div className="dashboard-content">

        <Navbar />

        <div className="dashboard-main">

          <h1>⚙️ Settings</h1>

          <p>
            Settings page coming soon.
          </p>

        </div>

      </div>

    </div>

  );

}

export default Settings;