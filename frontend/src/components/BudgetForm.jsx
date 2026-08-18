import { FaSave } from "react-icons/fa";
import "./styles/budgetForm.css";

function BudgetForm({
  categories = [],
  loading = false,
  onChange,
  onSave,
}) {

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (onSave) {
      await onSave();
    }
  };

  return (

    <form
      className="budget-form"
      onSubmit={handleSubmit}
    >

      {/* Header */}

      <div className="budget-form-header">

        <h2>
          Configure Monthly Budget
        </h2>

        <p>
          Set your spending limit for each category.
        </p>

      </div>

      {/* Category List */}

      <div className="budget-form-list">

        {categories.map((item, index) => (

          <div
            className="budget-form-row"
            key={item.category}
          >

            <div className="budget-category-name">
              {item.category}
            </div>

            <input
              type="number"
              min="0"
              inputMode="numeric"
              placeholder="Enter Amount"
              value={
                item.limit === 0
                  ? ""
                  : item.limit
              }
              onChange={(e) =>
                onChange(index, e.target.value)
              }
            />

          </div>

        ))}

      </div>

      {/* Save Button */}

      <button
        type="submit"
        className="budget-form-btn"
        disabled={loading}
      >

        <FaSave />

        {loading
          ? "Saving..."
          : "Save Budget"}

      </button>

    </form>

  );

}

export default BudgetForm;