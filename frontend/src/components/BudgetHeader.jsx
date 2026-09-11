import { useState } from "react";
import { FaWallet } from "react-icons/fa";
import "./styles/budgetHeader.css";

function BudgetHeader() {
  const [animationKey, setAnimationKey] = useState(0);

  const handleClick = () => {
    setAnimationKey((prev) => prev + 1);
  };

  return (
    <div
      className="budget-header"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="budget-header-icon">
        <FaWallet />
      </div>

      <div
        key={animationKey}
        className="budget-header-content budget-header-content-click"
      >
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