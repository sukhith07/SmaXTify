import { useState, useEffect } from "react";

import {
    FaBullseye,
    FaRupeeSign,
    FaCalendarAlt,
    FaSave,
    FaTimes,
} from "react-icons/fa";

import {
    FaChevronLeft,
    FaChevronRight,
} from "react-icons/fa6";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { toast } from "react-toastify";
import API from "../services/api";

import "./styles/editGoalModal.css";

const goalIcons = [
    "🎯",
    "💻",
    "🚗",
    "🏍️",
    "🏠",
    "✈️",
    "📱",
    "🎓",
    "💍",
    "🎮",
    "💰",
    "🛒",
];

function EditGoalModal({
    isOpen,
    onClose,
    goal,
    loadGoals,
}) {
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        title: "",
        targetAmount: "",
        icon: "🎯",
        targetDate: null,
    });

    useEffect(() => {
        if (goal) {
            setForm({
                title: goal.title || "",
                targetAmount: goal.targetAmount || "",
                icon: goal.icon || "🎯",
                targetDate: goal.targetDate
                    ? new Date(goal.targetDate)
                    : null,
            });
        }
    }, [goal]);

    if (!isOpen || !goal) return null;

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.title.trim()) {
            return toast.error("Goal title is required.");
        }

        if (Number(form.targetAmount) <= 0) {
            return toast.error(
                "Target amount must be greater than 0."
            );
        }

        if (Number(form.targetAmount) < goal.savedAmount) {
            return toast.error(
                `Target amount cannot be less than ₹${goal.savedAmount.toLocaleString()}`
            );
        }

        try {
            setLoading(true);

            await API.put(`/goals/${goal._id}`, {
                title: form.title,
                targetAmount: Number(form.targetAmount),
                icon: form.icon,
                targetDate: form.targetDate,
            });

            toast.success("Goal Updated Successfully");

            await loadGoals();

            onClose();
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to update goal"
            );
        } finally {
            setLoading(false);
        }
    };

    const renderCalendarHeader = ({
        date,
        decreaseMonth,
        increaseMonth,
        changeMonth,
        changeYear,
        prevMonthButtonDisabled,
        nextMonthButtonDisabled,
    }) => {
        const months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];

        const currentYear = new Date().getFullYear();

        const years = Array.from(
            { length: 101 },
            (_, index) => currentYear + index
        );

        return (
            <div className="edit-calendar-header">
                <div className="edit-calendar-title">
                    {months[date.getMonth()]} {date.getFullYear()}
                </div>

                <div className="edit-calendar-controls">
                    <button
                        type="button"
                        className="edit-calendar-arrow"
                        onClick={decreaseMonth}
                        disabled={prevMonthButtonDisabled}
                    >
                        <FaChevronLeft />
                    </button>

                    <select
                        className="edit-calendar-month"
                        value={date.getMonth()}
                        onChange={(e) =>
                            changeMonth(Number(e.target.value))
                        }
                    >
                        {months.map((month, index) => (
                            <option
                                key={month}
                                value={index}
                            >
                                {month}
                            </option>
                        ))}
                    </select>

                    <select
                        className="edit-calendar-year"
                        value={date.getFullYear()}
                        onChange={(e) =>
                            changeYear(Number(e.target.value))
                        }
                    >
                        {years.map((year) => (
                            <option
                                key={year}
                                value={year}
                            >
                                {year}
                            </option>
                        ))}
                    </select>

                    <button
                        type="button"
                        className="edit-calendar-arrow"
                        onClick={increaseMonth}
                        disabled={nextMonthButtonDisabled}
                    >
                        <FaChevronRight />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="edit-goal-modal-overlay">
            <div className="edit-goal-modal">
                <button
                    type="button"
                    className="edit-goal-close-btn"
                    onClick={onClose}
                >
                    <FaTimes />
                </button>

                <h2 className="edit-goal-title">
                    ✏️ Edit Goal
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="edit-goal-field">
                        <label>
                            <FaBullseye />
                            Goal Name
                        </label>

                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="Enter Goal Name"
                        />
                    </div>

                    <div className="edit-goal-field">
                        <label>
                            <FaRupeeSign />
                            Target Amount
                        </label>

                        <input
                            type="number"
                            name="targetAmount"
                            value={form.targetAmount}
                            onChange={handleChange}
                            placeholder="₹ 0"
                        />
                    </div>

                    <div className="edit-goal-field">
                        <label>
                            🎯 Choose Goal Icon
                        </label>

                        <div className="edit-goal-icon-picker">
                            {goalIcons.map((emoji) => (
                                <button
                                    key={emoji}
                                    type="button"
                                    className={
                                        form.icon === emoji
                                            ? "edit-goal-icon active"
                                            : "edit-goal-icon"
                                    }
                                    onClick={() =>
                                        setForm((prev) => ({
                                            ...prev,
                                            icon: emoji,
                                        }))
                                    }
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="edit-goal-field">
                        <label>
                            <FaCalendarAlt />
                            Target Date
                        </label>

                        <DatePicker
                            selected={form.targetDate}
                            onChange={(date) =>
                                setForm((prev) => ({
                                    ...prev,
                                    targetDate: date,
                                }))
                            }
                            className="edit-goal-datepicker"
                            placeholderText="Select Target Date"
                            dateFormat="dd MMM yyyy"
                            minDate={new Date()}
                            popperPlacement="bottom-start"
                            popperClassName="edit-goal-calendar-popper"
                            calendarClassName="edit-goal-calendar"
                            todayButton="Today"
                            renderCustomHeader={
                                renderCalendarHeader
                            }
                        />
                    </div>

                    <div className="edit-goal-actions">
                        <button
                            type="button"
                            className="edit-goal-cancel-btn"
                            onClick={onClose}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="edit-goal-update-btn"
                            disabled={loading}
                        >
                            <FaSave />

                            {loading
                                ? "Updating..."
                                : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditGoalModal;