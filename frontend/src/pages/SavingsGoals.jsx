import { useEffect, useState } from "react";
import { FaPlus, FaBullseye } from "react-icons/fa";
import { toast } from "react-toastify";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

import GoalCard from "../components/GoalCard";
import AddGoalModal from "../components/AddGoalModal";
import AddSavingsModal from "../components/AddSavingsModal";
import EditGoalModal from "../components/EditGoalModal";
import DeleteGoalModal from "../components/DeleteGoalModal";

import API from "../services/api";

import "../components/styles/dashboard.css";
import "../components/styles/savingsGoals.css";

function SavingsGoals() {

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [showSavingsModal, setShowSavingsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedGoal, setSelectedGoal] = useState(null);

  const [deleteLoading, setDeleteLoading] = useState(false);

  // ==========================
  // Load Goals
  // ==========================

  const loadGoals = async () => {

    try {

      const res = await API.get("/goals");

      setGoals(res.data.goals || []);

    } catch (error) {

      console.log(error);

      toast.error("Failed to load goals");

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    loadGoals();

  }, []);

  // ==========================
  // Add Savings
  // ==========================

  const handleAddSavings = (goal) => {

    if (goal.savedAmount >= goal.targetAmount) {

      toast.success("🎉 Goal already completed!");

      return;

    }

    setSelectedGoal(goal);

    setShowSavingsModal(true);

  };

  // ==========================
  // Edit Goal
  // ==========================

  const handleEdit = (goal) => {

    setSelectedGoal(goal);

    setShowEditModal(true);

  };

  // ==========================
  // Delete Goal
  // ==========================

  const handleDelete = (goal) => {

    setSelectedGoal(goal);

    setShowDeleteModal(true);

  };

  const confirmDelete = async () => {

    if (!selectedGoal) return;

    try {

      setDeleteLoading(true);

      await API.delete(`/goals/${selectedGoal._id}`);

      toast.success("Goal Deleted Successfully");

      setShowDeleteModal(false);

      setSelectedGoal(null);

      loadGoals();

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Failed to delete goal"
      );

    } finally {

      setDeleteLoading(false);

    }

  };

 return (

  <div className="dashboard">

    <Sidebar />

    <div className="dashboard-content">

      <Navbar />

      <div className="dashboard-main">

        {/* Header */}

        <div className="budget-page-header">

          <div className="budget-page-icon">

            <FaBullseye />

          </div>

          <div className="budget-page-content">

            <h1>Savings Goals</h1>

            <p>
              Create savings goals and achieve your dreams faster.
            </p>

          </div>

          <button
            className="goal-add-btn"
            onClick={() => setShowModal(true)}
          >

            <FaPlus />

            Add Goal

          </button>

        </div>

        {/* Goals */}

        {loading ? (

          <div className="loading-goals">

            Loading Goals...

          </div>

        ) : goals.length === 0 ? (

          <div className="empty-goals">

            <h2>🎯 No Goals Yet</h2>

            <p>
              Create your first savings goal and start tracking your progress.
            </p>

          </div>

        ) : (

          <div className="goal-grid">

            {goals.map((goal) => (

              <GoalCard
                key={goal._id}
                goal={goal}
                onAddSavings={handleAddSavings}
                onEdit={handleEdit}
                onDelete={() => handleDelete(goal)}
              />

            ))}

          </div>

        )}

      </div>

    </div>

    <AddGoalModal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      loadGoals={loadGoals}
    />

    <AddSavingsModal
      isOpen={showSavingsModal}
      onClose={() => setShowSavingsModal(false)}
      goal={selectedGoal}
      loadGoals={loadGoals}
    />

    
    <EditGoalModal
  isOpen={showEditModal}
  onClose={() => {
    setShowEditModal(false);
    setSelectedGoal(null);
  }}
  goal={selectedGoal}
  loadGoals={loadGoals}
/>

    <DeleteGoalModal
      isOpen={showDeleteModal}
      onClose={() => setShowDeleteModal(false)}
      onConfirm={confirmDelete}
      goal={selectedGoal}
      loading={deleteLoading}
    />

  </div>

);
}

export default SavingsGoals;