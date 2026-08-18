import { FaWallet } from "react-icons/fa";
import "./styles/budgetHeader.css";

function BudgetHeader() {
  return (
    <div className="budget-header">

      <div className="budget-header-icon">
        <FaWallet />
      </div>

      <div>

        <h1>Monthly Budget Planner</h1>

        <p>
          Plan your monthly budget, control your expenses,
          and achieve your financial goals.
        </p>

      </div>

    </div>
  );
}

export default BudgetHeader;