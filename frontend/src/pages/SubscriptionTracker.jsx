import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaPause,
  FaPlay,
  FaCreditCard,
  FaCalendarAlt,
  FaChartLine,
  FaWallet,
  FaClock,
  FaTimes,
  FaSave,
  FaTrophy,
  FaSyncAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaFilm,
  FaGraduationCap,
  FaCode,
  FaHeartbeat,
  FaShoppingBag,
  FaGamepad,
  FaEllipsisH,
  FaArrowRight,
  FaBell,
  FaToggleOn,
} from "react-icons/fa";

import { toast } from "react-toastify";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

import API from "../services/api";

import "../components/styles/subscriptionTracker.css";

function SubscriptionTracker() {
  const [subscriptions, setSubscriptions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("All");

  const [showModal, setShowModal] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [renewalWindow, setRenewalWindow] =
    useState(30);

  const [form, setForm] = useState({
    name: "",
    category: "Entertainment",
    amount: "",
    cycle: "Monthly",
    startDate: "",
    nextPayment: "",
    paymentMethod: "UPI",
    autoRenew: true,
    status: "Active",
  });

  const loadSubscriptions = async () => {
    try {
      setLoading(true);

      const response =
        await API.get("/subscriptions");

      setSubscriptions(
        response.data.subscriptions || []
      );
    } catch (error) {
      console.error(
        "Load Subscriptions Error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load subscriptions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      category: "Entertainment",
      amount: "",
      cycle: "Monthly",
      startDate: "",
      nextPayment: "",
      paymentMethod: "UPI",
      autoRenew: true,
      status: "Active",
    });

    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const saveSubscription = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error(
        "Please enter a subscription name."
      );
      return;
    }

    if (
      !form.amount ||
      Number(form.amount) <= 0
    ) {
      toast.error(
        "Please enter a valid amount."
      );
      return;
    }

    if (!form.startDate) {
      toast.error(
        "Please select the start date."
      );
      return;
    }

    if (!form.nextPayment) {
      toast.error(
        "Please select the next payment date."
      );
      return;
    }

    const subscriptionData = {
      name: form.name.trim(),
      category: form.category,
      amount: Number(form.amount),
      cycle: form.cycle,
      startDate: form.startDate,
      nextPayment: form.nextPayment,
      paymentMethod:
        form.paymentMethod,
      autoRenew: form.autoRenew,
      status: form.status,
    };

    try {
      if (editingId) {
        const response =
          await API.put(
            `/subscriptions/${editingId}`,
            subscriptionData
          );

        const updated =
          response.data.subscription;

        setSubscriptions((current) =>
          current.map((item) =>
            item._id === editingId ||
            item.id === editingId
              ? updated
              : item
          )
        );

        toast.success(
          `${subscriptionData.name} updated successfully.`
        );
      } else {
        const response =
          await API.post(
            "/subscriptions",
            subscriptionData
          );

        const created =
          response.data.subscription;

        setSubscriptions((current) => [
          ...current,
          created,
        ]);

        toast.success(
          `${subscriptionData.name} added successfully.`
        );
      }

      closeModal();
    } catch (error) {
      console.error(
        "Save Subscription Error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to save subscription."
      );
    }
  };

  const editSubscription = (
    subscription
  ) => {
    setForm({
      name: subscription.name || "",
      category:
        subscription.category ||
        "Other",
      amount:
        subscription.amount?.toString() ||
        "",
      cycle:
        subscription.cycle ||
        "Monthly",
      startDate:
        subscription.startDate
          ? new Date(
              subscription.startDate
            )
              .toISOString()
              .slice(0, 10)
          : "",
      nextPayment:
        subscription.nextPayment
          ? new Date(
              subscription.nextPayment
            )
              .toISOString()
              .slice(0, 10)
          : "",
      paymentMethod:
        subscription.paymentMethod ||
        "UPI",
      autoRenew:
        subscription.autoRenew !== false,
      status:
        subscription.status ||
        "Active",
    });

    setEditingId(
      subscription._id ||
        subscription.id
    );

    setShowModal(true);
  };

  const deleteSubscription = async (
    id
  ) => {
    const subscription =
      subscriptions.find(
        (item) =>
          item._id === id ||
          item.id === id
      );

    if (!subscription) {
      return;
    }

    try {
      await API.delete(
        `/subscriptions/${id}`
      );

      setSubscriptions((current) =>
        current.filter(
          (item) =>
            item._id !== id &&
            item.id !== id
        )
      );

      toast.success(
        `${subscription.name} deleted successfully.`
      );
    } catch (error) {
      console.error(
        "Delete Subscription Error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to delete subscription."
      );
    }
  };

  const toggleStatus = async (id) => {
    const subscription =
      subscriptions.find(
        (item) =>
          item._id === id ||
          item.id === id
      );

    if (!subscription) {
      return;
    }

    if (
      subscription.status ===
      "Cancelled"
    ) {
      toast.info(
        "Cancelled subscriptions cannot be resumed."
      );
      return;
    }

    const newStatus =
      subscription.status === "Active"
        ? "Paused"
        : "Active";

    try {
      const response =
        await API.put(
          `/subscriptions/${id}`,
          {
            status: newStatus,
          }
        );

      const updated =
        response.data.subscription;

      setSubscriptions((current) =>
        current.map((item) =>
          item._id === id ||
          item.id === id
            ? updated
            : item
        )
      );

      toast.success(
        newStatus === "Paused"
          ? `${subscription.name} has been paused.`
          : `${subscription.name} has been resumed.`
      );
    } catch (error) {
      console.error(
        "Toggle Status Error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to update subscription status."
      );
    }
  };

  const toggleAutoRenew = async (
    id
  ) => {
    const subscription =
      subscriptions.find(
        (item) =>
          item._id === id ||
          item.id === id
      );

    if (!subscription) {
      return;
    }

    if (
      subscription.status !==
      "Active"
    ) {
      toast.info(
        "Only active subscriptions can use auto-renew."
      );
      return;
    }

    const newValue =
      !subscription.autoRenew;

    try {
      const response =
        await API.put(
          `/subscriptions/${id}`,
          {
            autoRenew: newValue,
          }
        );

      const updated =
        response.data.subscription;

      setSubscriptions((current) =>
        current.map((item) =>
          item._id === id ||
          item.id === id
            ? updated
            : item
        )
      );

      toast.success(
        newValue
          ? `${subscription.name}: auto-renew enabled.`
          : `${subscription.name}: auto-renew disabled.`
      );
    } catch (error) {
      console.error(
        "Toggle Auto Renew Error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to update auto-renew."
      );
    }
  };

  const openRenewalReview = () => {
    setFilter("Active");
    setSearch("");

    toast.info(
      "Showing active subscriptions for renewal review."
    );
  };

  const filteredSubscriptions =
    useMemo(() => {
      return subscriptions.filter(
        (subscription) => {
          const searchValue =
            search
              .toLowerCase()
              .trim();

          const name =
            subscription.name
              ?.toLowerCase() || "";

          const category =
            subscription.category
              ?.toLowerCase() || "";

          const matchesSearch =
            name.includes(
              searchValue
            ) ||
            category.includes(
              searchValue
            );

          const matchesFilter =
            filter === "All" ||
            subscription.status ===
              filter;

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [
      subscriptions,
      search,
      filter,
    ]);

  const getDaysDifference = (
    date
  ) => {
    if (!date) {
      return null;
    }

    const today = new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    const paymentDate =
      new Date(date);

    paymentDate.setHours(
      0,
      0,
      0,
      0
    );

    if (
      Number.isNaN(
        paymentDate.getTime()
      )
    ) {
      return null;
    }

    return Math.ceil(
      (paymentDate.getTime() -
        today.getTime()) /
        86400000
    );
  };

  const getRenewalInfo = (
    date
  ) => {
    const days =
      getDaysDifference(date);

    if (days === null) {
      return {
        label: "No date",
        className: "none",
        icon: <FaCalendarAlt />,
        days: null,
      };
    }

    if (days < 0) {
      return {
        label: `${Math.abs(days)} ${
          Math.abs(days) === 1
            ? "day"
            : "days"
        } overdue`,
        className: "overdue",
        icon: (
          <FaExclamationTriangle />
        ),
        days,
      };
    }

    if (days === 0) {
      return {
        label: "Due today",
        className: "today",
        icon: (
          <FaExclamationTriangle />
        ),
        days,
      };
    }

    if (days === 1) {
      return {
        label: "Due tomorrow",
        className: "tomorrow",
        icon: <FaClock />,
        days,
      };
    }

    if (days <= 7) {
      return {
        label: `Due in ${days} days`,
        className: "soon",
        icon: <FaClock />,
        days,
      };
    }

    return {
      label: `In ${days} days`,
      className: "upcoming",
      icon: <FaCheckCircle />,
      days,
    };
  };

  const formatCurrency = (
    amount
  ) =>
    new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(Number(amount) || 0);

  const formatDate = (
    date
  ) => {
    if (!date) {
      return "Not set";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "Not set";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getMonthlyCost = (
    item
  ) => {
    if (
      item.cycle === "Yearly"
    ) {
      return (
        Number(item.amount) / 12
      );
    }

    if (
      item.cycle === "Weekly"
    ) {
      return (
        Number(item.amount) * 4.345
      );
    }

    return Number(item.amount) || 0;
  };

  const activeSubscriptions =
    subscriptions.filter(
      (item) =>
        item.status === "Active"
    );

  const monthlyCost =
    activeSubscriptions.reduce(
      (total, item) =>
        total +
        getMonthlyCost(item),
      0
    );

  const yearlyCost =
    monthlyCost * 12;

  const averageMonthly =
    activeSubscriptions.length >
    0
      ? monthlyCost /
        activeSubscriptions.length
      : 0;

  const highestCostSubscription =
    activeSubscriptions.length >
    0
      ? [
          ...activeSubscriptions,
        ].sort(
          (a, b) =>
            getMonthlyCost(b) -
            getMonthlyCost(a)
        )[0]
      : null;

  const upcomingPayments =
    activeSubscriptions
      .filter((item) => {
        const days =
          getDaysDifference(
            item.nextPayment
          );

        return (
          days !== null &&
          days >= 0
        );
      })
      .sort(
        (a, b) =>
          new Date(
            a.nextPayment
          ) -
          new Date(
            b.nextPayment
          )
      );

  const nextPayment =
    upcomingPayments.length > 0
      ? upcomingPayments[0]
      : null;

  const autoRenewCount =
    activeSubscriptions.filter(
      (item) =>
        item.autoRenew
    ).length;

  const dueSoonCount =
    activeSubscriptions.filter(
      (item) => {
        const days =
          getDaysDifference(
            item.nextPayment
          );

        return (
          days !== null &&
          days >= 0 &&
          days <= 3
        );
      }
    ).length;

  const overdueCount =
    activeSubscriptions.filter(
      (item) => {
        const days =
          getDaysDifference(
            item.nextPayment
          );

        return (
          days !== null &&
          days < 0
        );
      }
    ).length;

  const categoryIcons = {
    Entertainment: <FaFilm />,
    Education: (
      <FaGraduationCap />
    ),
    Software: <FaCode />,
    Health: <FaHeartbeat />,
    Shopping: (
      <FaShoppingBag />
    ),
    Gaming: <FaGamepad />,
    Other: <FaEllipsisH />,
  };

  const categoryClasses = {
    Entertainment:
      "entertainment",
    Education:
      "education",
    Software:
      "software",
    Health: "health",
    Shopping:
      "shopping",
    Gaming: "gaming",
    Other: "other",
  };

  const categoryInsights =
    useMemo(() => {
      const categories = {};

      activeSubscriptions.forEach(
        (subscription) => {
          const category =
            subscription.category ||
            "Other";

          if (
            !categories[
              category
            ]
          ) {
            categories[
              category
            ] = {
              category,
              monthly: 0,
              count: 0,
              subscriptions: [],
            };
          }

          categories[
            category
          ].monthly +=
            getMonthlyCost(
              subscription
            );

          categories[
            category
          ].count += 1;

          categories[
            category
          ].subscriptions.push(
            subscription
          );
        }
      );

      return Object.values(
        categories
      )
        .map((item) => ({
          ...item,
          percentage:
            monthlyCost > 0
              ? (item.monthly /
                  monthlyCost) *
                100
              : 0,
        }))
        .sort(
          (a, b) =>
            b.monthly -
            a.monthly
        );
    }, [
      activeSubscriptions,
      monthlyCost,
    ]);

  const highestCategory =
    categoryInsights.length > 0
      ? categoryInsights[0]
      : null;

  const next7DaysCount =
    activeSubscriptions.filter(
      (item) => {
        const days =
          getDaysDifference(
            item.nextPayment
          );

        return (
          days !== null &&
          days >= 0 &&
          days <= 7
        );
      }
    ).length;

  const next30DaysSubscriptions =
    activeSubscriptions.filter(
      (item) => {
        const days =
          getDaysDifference(
            item.nextPayment
          );

        return (
          days !== null &&
          days >= 0 &&
          days <= 30
        );
      }
    );

  const next30DaysCount =
    next30DaysSubscriptions.length;

  const next30DaysRenewalSpend =
    next30DaysSubscriptions.reduce(
      (total, item) =>
        total +
        Number(item.amount),
      0
    );

  const categoryAverage =
    categoryInsights.length >
    0
      ? monthlyCost /
        categoryInsights.length
      : 0;

  const renewalSubscriptions =
    activeSubscriptions
      .filter(
        (item) =>
          item.nextPayment
      )
      .map((item) => ({
        ...item,
        renewalDays:
          getDaysDifference(
            item.nextPayment
          ),
        renewalInfo:
          getRenewalInfo(
            item.nextPayment
          ),
      }))
      .sort(
        (a, b) =>
          a.renewalDays -
          b.renewalDays
      );

  const renewalWithin7Days =
    renewalSubscriptions.filter(
      (item) =>
        item.renewalDays !==
          null &&
        item.renewalDays >= 0 &&
        item.renewalDays <= 7
    );

  const renewalWithin30Days =
    renewalSubscriptions.filter(
      (item) =>
        item.renewalDays !==
          null &&
        item.renewalDays >= 0 &&
        item.renewalDays <= 30
    );

  const renewalWithin90Days =
    renewalSubscriptions.filter(
      (item) =>
        item.renewalDays !==
          null &&
        item.renewalDays >= 0 &&
        item.renewalDays <= 90
    );

  const renewalSpend7Days =
    renewalWithin7Days.reduce(
      (total, item) =>
        total +
        Number(item.amount),
      0
    );

  const renewalSpend30Days =
    renewalWithin30Days.reduce(
      (total, item) =>
        total +
        Number(item.amount),
      0
    );

  const renewalSpend90Days =
    renewalWithin90Days.reduce(
      (total, item) =>
        total +
        Number(item.amount),
      0
    );

  const overdueRenewals =
    renewalSubscriptions.filter(
      (item) =>
        item.renewalDays < 0
    );

  const todayRenewals =
    renewalSubscriptions.filter(
      (item) =>
        item.renewalDays === 0
    );

  const tomorrowRenewals =
    renewalSubscriptions.filter(
      (item) =>
        item.renewalDays === 1
    );

  const soonRenewals =
    renewalSubscriptions.filter(
      (item) =>
        item.renewalDays >= 2 &&
        item.renewalDays <= 7
    );

  const autoRenewUpcoming =
    renewalWithin30Days.filter(
      (item) =>
        item.autoRenew
    );

  const nextRenewalIntelligence =
    renewalSubscriptions.find(
      (item) =>
        item.renewalDays >= 0
    ) || null;

  const renewalWindowSubscriptions =
    renewalSubscriptions.filter(
      (item) =>
        item.renewalDays !==
          null &&
        item.renewalDays >= 0 &&
        item.renewalDays <=
          renewalWindow
    );

  const renewalWindowSpend =
    renewalWindowSubscriptions.reduce(
      (total, item) =>
        total +
        Number(item.amount),
      0
    );

  const renewalWindowAutoRenew =
    renewalWindowSubscriptions.filter(
      (item) =>
        item.autoRenew
    ).length;

  const renewalWindowManual =
    renewalWindowSubscriptions.filter(
      (item) =>
        !item.autoRenew
    ).length;

  const autoRenewRate =
    activeSubscriptions.length >
    0
      ? (autoRenewCount /
          activeSubscriptions.length) *
        100
      : 0;

  const pausedCount =
    subscriptions.filter(
      (item) =>
        item.status ===
        "Paused"
    ).length;

  const healthScore =
    Math.max(
      0,
      Math.min(
        100,
        100 -
          overdueCount * 20 -
          dueSoonCount * 6 -
          pausedCount * 4
      )
    );

  const healthStatus =
    healthScore >= 90
      ? "Excellent"
      : healthScore >= 75
        ? "Healthy"
        : healthScore >= 55
          ? "Needs Attention"
          : "At Risk";

  const healthClass =
    healthScore >= 90
      ? "excellent"
      : healthScore >= 75
        ? "healthy"
        : healthScore >= 55
          ? "attention"
          : "risk";

  const smartInsights = [];

  if (
    highestCostSubscription
  ) {
    smartInsights.push({
      type: "spending",
      icon: <FaTrophy />,
      title:
        "Highest recurring cost",
      text: `${
        highestCostSubscription.name
      } accounts for ${formatCurrency(
        getMonthlyCost(
          highestCostSubscription
        )
      )} of your estimated monthly spend.`,
      className:
        "purple",
    });
  }

  if (highestCategory) {
    smartInsights.push({
      type: "category",
      icon: <FaChartLine />,
      title:
        "Top spending category",
      text: `${
        highestCategory.category
      } represents ${highestCategory.percentage.toFixed(
        0
      )}% of your monthly subscription spending.`,
      className: "blue",
    });
  }

  if (dueSoonCount > 0) {
    smartInsights.push({
      type: "renewal",
      icon: <FaClock />,
      title:
        "Renewals coming soon",
      text: `${dueSoonCount} active subscription${
        dueSoonCount !== 1
          ? "s"
          : ""
      } ${
        dueSoonCount !== 1
          ? "are"
          : "is"
      } due within the next 3 days.`,
      className: "orange",
    });
  } else if (nextPayment) {
    smartInsights.push({
      type: "renewal",
      icon: (
        <FaCalendarAlt />
      ),
      title: "Next renewal",
      text: `${
        nextPayment.name
      } is your next scheduled payment on ${formatDate(
        nextPayment.nextPayment
      )}.`,
      className: "green",
    });
  }

  if (autoRenewCount > 0) {
    smartInsights.push({
      type: "auto-renew",
      icon: <FaSyncAlt />,
      title:
        "Auto-renewal coverage",
      text: `${autoRenewCount} of ${
        activeSubscriptions.length
      } active subscription${
        activeSubscriptions.length !==
        1
          ? "s"
          : ""
      } ${
        activeSubscriptions.length !==
        1
          ? "have"
          : "has"
      } auto-renew enabled.`,
      className: "cyan",
    });
  } else if (
    activeSubscriptions.length >
    0
  ) {
    smartInsights.push({
      type: "auto-renew",
      icon: <FaSyncAlt />,
      title:
        "Auto-renewal review",
      text:
        "None of your active subscriptions have auto-renew enabled.",
      className: "violet",
    });
  }

  if (
    monthlyCost > 0 &&
    highestCostSubscription
  ) {
    const highestMonthly =
      getMonthlyCost(
        highestCostSubscription
      );

    const share =
      (highestMonthly /
        monthlyCost) *
      100;

    if (share >= 40) {
      smartInsights.push({
        type: "review",
        icon: <FaWallet />,
        title:
          "Large spending concentration",
        text: `${
          highestCostSubscription.name
        } makes up ${share.toFixed(
          0
        )}% of your monthly subscription spend. Consider reviewing this plan.`,
        className: "gold",
      });
    }
  }

  const limitedSmartInsights =
    smartInsights.slice(0, 5);

  return (
    <div className="dashboard subscription-page">
      <Sidebar />

      <div className="dashboard-content">
        <Navbar />

        <main className="dashboard-main subscription-main">
          <section className="subscription-hero">
            <div className="subscription-title-row">
              <div className="subscription-title-icon">
                <FaCreditCard />
              </div>

              <div>
                <div className="subscription-heading-line">
                  <h1>
                    Subscription Tracker
                  </h1>

                  <span className="subscription-live">
                    <span />
                    Live
                  </span>
                </div>

                <p>
                  Keep every recurring payment organized, visible, and under control.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="subscription-add-btn"
              onClick={
                openAddModal
              }
            >
              <FaPlus />
              Add Subscription
            </button>
          </section>

          <section className="subscription-summary">
            <div className="subscription-summary-card">
              <div className="subscription-summary-icon blue">
                <FaCreditCard />
              </div>

              <div className="subscription-summary-content">
                <span>
                  ACTIVE SUBSCRIPTIONS
                </span>

                <strong>
                  {
                    activeSubscriptions.length
                  }
                </strong>

                <small>
                  Currently running
                </small>
              </div>
            </div>

            <div className="subscription-summary-card">
              <div className="subscription-summary-icon green">
                <FaWallet />
              </div>

              <div className="subscription-summary-content">
                <span>
                  MONTHLY COST
                </span>

                <strong>
                  {formatCurrency(
                    monthlyCost
                  )}
                </strong>

                <small>
                  Estimated recurring spend
                </small>
              </div>
            </div>

            <div className="subscription-summary-card">
              <div className="subscription-summary-icon purple">
                <FaChartLine />
              </div>

              <div className="subscription-summary-content">
                <span>
                  YEARLY COST
                </span>

                <strong>
                  {formatCurrency(
                    yearlyCost
                  )}
                </strong>

                <small>
                  Projected annual spend
                </small>
              </div>
            </div>

            <div className="subscription-summary-card">
              <div className="subscription-summary-icon orange">
                <FaClock />
              </div>

              <div className="subscription-summary-content">
                <span>
                  NEXT PAYMENT
                </span>

                <strong>
                  {nextPayment
                    ? formatCurrency(
                        nextPayment.amount
                      )
                    : "₹0"}
                </strong>

                <small
                  className={
                    nextPayment
                      ? `renewal-text ${
                          getRenewalInfo(
                            nextPayment.nextPayment
                          ).className
                        }`
                      : ""
                  }
                >
                  {nextPayment
                    ? getRenewalInfo(
                        nextPayment.nextPayment
                      ).label
                    : "No upcoming payment"}
                </small>
              </div>
            </div>

            <div className="subscription-summary-card">
              <div className="subscription-summary-icon indigo">
                <FaChartLine />
              </div>

              <div className="subscription-summary-content">
                <span>
                  AVERAGE MONTHLY
                </span>

                <strong>
                  {formatCurrency(
                    averageMonthly
                  )}
                </strong>

                <small>
                  Per active subscription
                </small>
              </div>
            </div>

            <div className="subscription-summary-card">
              <div className="subscription-summary-icon gold">
                <FaTrophy />
              </div>

              <div className="subscription-summary-content">
                <span>
                  HIGHEST COST
                </span>

                <strong className="summary-name">
                  {highestCostSubscription
                    ? highestCostSubscription.name
                    : "None"}
                </strong>

                <small>
                  {highestCostSubscription
                    ? `${formatCurrency(
                        getMonthlyCost(
                          highestCostSubscription
                        )
                      )} monthly`
                    : "No active subscriptions"}
                </small>
              </div>
            </div>

            <div className="subscription-summary-card">
              <div className="subscription-summary-icon cyan">
                <FaCalendarAlt />
              </div>

              <div className="subscription-summary-content">
                <span>
                  NEXT RENEWAL
                </span>

                <strong className="summary-name">
                  {nextPayment
                    ? nextPayment.name
                    : "None"}
                </strong>

                <small>
                  {nextPayment
                    ? formatDate(
                        nextPayment.nextPayment
                      )
                    : "No renewal scheduled"}
                </small>
              </div>
            </div>

            <div className="subscription-summary-card">
              <div className="subscription-summary-icon violet">
                <FaSyncAlt />
              </div>

              <div className="subscription-summary-content">
                <span>
                  AUTO RENEW
                </span>

                <strong>
                  {autoRenewCount}
                </strong>

                <small>
                  Active auto-renewals
                </small>
              </div>
            </div>
          </section>

          {(dueSoonCount > 0 ||
            overdueCount > 0) && (
            <section className="subscription-renewal-alert">
              <div className="subscription-renewal-alert-icon">
                {overdueCount >
                0 ? (
                  <FaExclamationTriangle />
                ) : (
                  <FaClock />
                )}
              </div>

              <div className="subscription-renewal-alert-content">
                <strong>
                  {overdueCount >
                  0
                    ? `${overdueCount} payment${
                        overdueCount !==
                        1
                          ? "s"
                          : ""
                      } overdue`
                    : `${dueSoonCount} payment${
                        dueSoonCount !==
                        1
                          ? "s"
                          : ""
                      } due soon`}
                </strong>

                <span>
                  {overdueCount >
                  0
                    ? "Review your overdue subscriptions."
                    : "You have subscriptions renewing within the next 3 days."}
                </span>
              </div>
            </section>
          )}

          <section className="subscription-category-section">
            <div className="subscription-category-header">
              <div>
                <div className="subscription-category-title">
                  <div className="subscription-category-main-icon">
                    <FaChartLine />
                  </div>

                  <div>
                    <h2>
                      Spending by Category
                    </h2>

                    <p>
                      See where your recurring subscription money goes.
                    </p>
                  </div>
                </div>
              </div>

              {highestCategory && (
                <div className="subscription-category-highlight">
                  <span>
                    TOP CATEGORY
                  </span>

                  <strong>
                    {
                      highestCategory.category
                    }
                  </strong>

                  <small>
                    {formatCurrency(
                      highestCategory.monthly
                    )}
                    /month
                  </small>
                </div>
              )}
            </div>

            {categoryInsights.length ===
            0 ? (
              <div className="subscription-category-empty">
                <div>
                  <FaChartLine />
                </div>

                <h3>
                  No category data yet
                </h3>

                <p>
                  Add active subscriptions to see your spending breakdown.
                </p>
              </div>
            ) : (
              <div className="subscription-category-grid">
                {categoryInsights.map(
                  (item) => {
                    const categoryClass =
                      categoryClasses[
                        item.category
                      ] ||
                      "other";

                    return (
                      <div
                        key={
                          item.category
                        }
                        className={`subscription-category-card ${categoryClass}`}
                      >
                        <div className="subscription-category-card-top">
                          <div className="subscription-category-icon">
                            {categoryIcons[
                              item.category
                            ] || (
                              <FaEllipsisH />
                            )}
                          </div>

                          <div className="subscription-category-info">
                            <strong>
                              {
                                item.category
                              }
                            </strong>

                            <span>
                              {
                                item.count
                              }{" "}
                              subscription
                              {item.count !==
                              1
                                ? "s"
                                : ""}
                            </span>
                          </div>

                          <strong className="subscription-category-amount">
                            {formatCurrency(
                              item.monthly
                            )}
                          </strong>
                        </div>

                        <div className="subscription-category-progress">
                          <div className="subscription-category-progress-track">
                            <div
                              className="subscription-category-progress-fill"
                              style={{
                                width: `${Math.min(
                                  item.percentage,
                                  100
                                )}%`,
                              }}
                            />
                          </div>

                          <span>
                            {item.percentage.toFixed(
                              0
                            )}
                            %
                          </span>
                        </div>

                        <small className="subscription-category-caption">
                          of monthly subscription spending
                        </small>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </section>

          <section className="subscription-overview-section">
            <div className="subscription-overview-header">
              <div className="subscription-overview-title">
                <div className="subscription-overview-main-icon">
                  <FaChartLine />
                </div>

                <div>
                  <h2>
                    Spending &amp; Renewal Overview
                  </h2>

                  <p>
                    A quick look at your recurring financial commitments.
                  </p>
                </div>
              </div>
            </div>

            <div className="subscription-overview-grid">
              <div className="subscription-overview-card blue">
                <div className="subscription-overview-icon">
                  <FaWallet />
                </div>

                <div className="subscription-overview-content">
                  <div className="subscription-overview-card-top">
                    <div>
                      <span>
                        Monthly Spending
                      </span>

                      <small>
                        Active subscriptions
                      </small>
                    </div>

                    <strong>
                      {formatCurrency(
                        monthlyCost
                      )}
                    </strong>
                  </div>

                  <p>
                    Estimated recurring monthly cost
                  </p>
                </div>
              </div>

              <div className="subscription-overview-card purple">
                <div className="subscription-overview-icon">
                  <FaChartLine />
                </div>

                <div className="subscription-overview-content">
                  <div className="subscription-overview-card-top">
                    <div>
                      <span>
                        Yearly Projection
                      </span>

                      <small>
                        Annualized cost
                      </small>
                    </div>

                    <strong>
                      {formatCurrency(
                        yearlyCost
                      )}
                    </strong>
                  </div>

                  <p>
                    Projected yearly subscription spending
                  </p>
                </div>
              </div>

              <div className="subscription-overview-card orange">
                <div className="subscription-overview-icon">
                  <FaClock />
                </div>

                <div className="subscription-overview-content">
                  <div className="subscription-overview-card-top">
                    <div>
                      <span>
                        Next 7 Days
                      </span>

                      <small>
                        Upcoming renewals
                      </small>
                    </div>

                    <strong>
                      {next7DaysCount}
                    </strong>
                  </div>

                  <p>
                    Subscription renewals within 7 days
                  </p>
                </div>
              </div>

              <div className="subscription-overview-card cyan">
                <div className="subscription-overview-icon">
                  <FaCalendarAlt />
                </div>

                <div className="subscription-overview-content">
                  <div className="subscription-overview-card-top">
                    <div>
                      <span>
                        Next 30 Days
                      </span>

                      <small>
                        Renewal count
                      </small>
                    </div>

                    <strong>
                      {next30DaysCount}
                    </strong>
                  </div>

                  <p>
                    Renewals expected within 30 days
                  </p>
                </div>
              </div>

              <div className="subscription-overview-card green">
                <div className="subscription-overview-icon">
                  <FaCreditCard />
                </div>

                <div className="subscription-overview-content">
                  <div className="subscription-overview-card-top">
                    <div>
                      <span>
                        Renewal Spend
                      </span>

                      <small>
                        Next 30 days
                      </small>
                    </div>

                    <strong>
                      {formatCurrency(
                        next30DaysRenewalSpend
                      )}
                    </strong>
                  </div>

                  <p>
                    Expected payment amount from upcoming renewals
                  </p>
                </div>
              </div>

              <div className="subscription-overview-card violet">
                <div className="subscription-overview-icon">
                  <FaChartLine />
                </div>

                <div className="subscription-overview-content">
                  <div className="subscription-overview-card-top">
                    <div>
                      <span>
                        Category Average
                      </span>

                      <small>
                        Monthly
                      </small>
                    </div>

                    <strong>
                      {formatCurrency(
                        categoryAverage
                      )}
                    </strong>
                  </div>

                  <p>
                    Average monthly spending per category
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="subscription-health-section">
            <div className="subscription-health-card">
              <div className="subscription-health-header">
                <div className="subscription-health-title">
                  <div
                    className={`subscription-health-icon ${healthClass}`}
                  >
                    {healthScore >=
                    75 ? (
                      <FaCheckCircle />
                    ) : (
                      <FaExclamationTriangle />
                    )}
                  </div>

                  <div>
                    <h2>
                      Subscription Health
                    </h2>

                    <p>
                      A quick view of how healthy your recurring payments are.
                    </p>
                  </div>
                </div>

                <div
                  className={`subscription-health-score ${healthClass}`}
                >
                  <strong>
                    {healthScore}
                  </strong>

                  <span>
                    / 100
                  </span>
                </div>
              </div>

              <div className="subscription-health-progress">
                <div className="subscription-health-progress-track">
                  <div
                    className={`subscription-health-progress-fill ${healthClass}`}
                    style={{
                      width: `${healthScore}%`,
                    }}
                  />
                </div>

                <div className="subscription-health-status-row">
                  <strong
                    className={
                      healthClass
                    }
                  >
                    {healthStatus}
                  </strong>

                  <span>
                    {overdueCount >
                    0
                      ? `${overdueCount} overdue payment${
                          overdueCount !==
                          1
                            ? "s"
                            : ""
                        }`
                      : dueSoonCount >
                          0
                        ? `${dueSoonCount} renewal${
                            dueSoonCount !==
                            1
                              ? "s"
                              : ""
                          } due soon`
                        : "No immediate payment risks"}
                  </span>
                </div>
              </div>

              <div className="subscription-health-metrics">
                <div>
                  <span>
                    ACTIVE
                  </span>

                  <strong>
                    {
                      activeSubscriptions.length
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    AUTO-RENEW
                  </span>

                  <strong>
                    {Math.round(
                      autoRenewRate
                    )}
                    %
                  </strong>
                </div>

                <div>
                  <span>
                    DUE SOON
                  </span>

                  <strong>
                    {dueSoonCount}
                  </strong>
                </div>

                <div>
                  <span>
                    PAUSED
                  </span>

                  <strong>
                    {pausedCount}
                  </strong>
                </div>
              </div>
            </div>

            <div className="subscription-insights-card">
              <div className="subscription-insights-header">
                <div className="subscription-insights-title">
                  <div className="subscription-insights-main-icon">
                    <FaChartLine />
                  </div>

                  <div>
                    <h2>
                      Smart Insights
                    </h2>

                    <p>
                      Useful observations from your subscription activity.
                    </p>
                  </div>
                </div>

                <span className="subscription-insights-badge">
                  SMART
                </span>
              </div>

              {limitedSmartInsights.length ===
              0 ? (
                <div className="subscription-insights-empty">
                  <FaChartLine />

                  <p>
                    Add active subscriptions to unlock smart insights.
                  </p>
                </div>
              ) : (
                <div className="subscription-insights-list">
                  {limitedSmartInsights.map(
                    (
                      insight,
                      index
                    ) => (
                      <div
                        className="subscription-insight"
                        key={`${insight.type}-${index}`}
                      >
                        <div
                          className={`subscription-insight-icon ${insight.className}`}
                        >
                          {
                            insight.icon
                          }
                        </div>

                        <div className="subscription-insight-content">
                          <strong>
                            {
                              insight.title
                            }
                          </strong>

                          <p>
                            {
                              insight.text
                            }
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </section>

          <section className="subscription-renewal-intelligence">
            <div className="subscription-renewal-intelligence-header">
              <div className="subscription-renewal-intelligence-title">
                <div className="subscription-renewal-intelligence-icon">
                  <FaClock />
                </div>

                <div>
                  <h2>
                    Renewal Intelligence
                  </h2>

                  <p>
                    Plan upcoming renewals, control auto-renewals, and review future charges.
                  </p>
                </div>
              </div>

              <div className="subscription-renewal-smart-badge">
                SMART
              </div>
            </div>

            <div className="subscription-renewal-intelligence-grid">
              <div className="subscription-renewal-next">
                <div className="subscription-renewal-next-top">
                  <div>
                    <span className="subscription-renewal-label">
                      NEXT RENEWAL
                    </span>

                    <h3>
                      {nextRenewalIntelligence
                        ? nextRenewalIntelligence.name
                        : "No upcoming renewal"}
                    </h3>
                  </div>

                  <div className="subscription-renewal-next-icon">
                    <FaCalendarAlt />
                  </div>
                </div>

                {nextRenewalIntelligence ? (
                  <>
                    <div className="subscription-renewal-next-details">
                      <div>
                        <span>
                          AMOUNT
                        </span>

                        <strong>
                          {formatCurrency(
                            nextRenewalIntelligence.amount
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          DATE
                        </span>

                        <strong>
                          {formatDate(
                            nextRenewalIntelligence.nextPayment
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          PAYMENT
                        </span>

                        <strong>
                          {
                            nextRenewalIntelligence.paymentMethod
                          }
                        </strong>
                      </div>
                    </div>

                    <div
                      className={`subscription-renewal-next-status ${nextRenewalIntelligence.renewalInfo.className}`}
                    >
                      {
                        nextRenewalIntelligence
                          .renewalInfo
                          .icon
                      }

                      <span>
                        {
                          nextRenewalIntelligence
                            .renewalInfo
                            .label
                        }
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="subscription-renewal-no-data">
                    <FaCheckCircle />

                    <span>
                      No upcoming renewals.
                    </span>
                  </div>
                )}
              </div>

              <div className="subscription-renewal-spend">
                <div className="subscription-renewal-card-heading">
                  <div className="subscription-renewal-small-icon blue">
                    <FaWallet />
                  </div>

                  <div>
                    <h3>
                      Upcoming Renewal Spend
                    </h3>

                    <p>
                      Expected subscription charges
                    </p>
                  </div>
                </div>

                <div className="subscription-renewal-spend-grid">
                  <div>
                    <span>
                      NEXT 7 DAYS
                    </span>

                    <strong>
                      {formatCurrency(
                        renewalSpend7Days
                      )}
                    </strong>

                    <small>
                      {
                        renewalWithin7Days.length
                      }{" "}
                      renewal
                      {renewalWithin7Days.length !==
                      1
                        ? "s"
                        : ""}
                    </small>
                  </div>

                  <div>
                    <span>
                      NEXT 30 DAYS
                    </span>

                    <strong>
                      {formatCurrency(
                        renewalSpend30Days
                      )}
                    </strong>

                    <small>
                      {
                        renewalWithin30Days.length
                      }{" "}
                      renewal
                      {renewalWithin30Days.length !==
                      1
                        ? "s"
                        : ""}
                    </small>
                  </div>

                  <div>
                    <span>
                      NEXT 90 DAYS
                    </span>

                    <strong>
                      {formatCurrency(
                        renewalSpend90Days
                      )}
                    </strong>

                    <small>
                      {
                        renewalWithin90Days.length
                      }{" "}
                      renewal
                      {renewalWithin90Days.length !==
                      1
                        ? "s"
                        : ""}
                    </small>
                  </div>
                </div>
              </div>

              <div className="subscription-renewal-urgency">
                <div className="subscription-renewal-card-heading">
                  <div className="subscription-renewal-small-icon orange">
                    <FaExclamationTriangle />
                  </div>

                  <div>
                    <h3>
                      Renewal Urgency
                    </h3>

                    <p>
                      Payments requiring attention
                    </p>
                  </div>
                </div>

                <div className="subscription-renewal-urgency-list">
                  <div className="renewal-urgency-item overdue">
                    <span>
                      <i />
                      Overdue
                    </span>

                    <strong>
                      {
                        overdueRenewals.length
                      }
                    </strong>
                  </div>

                  <div className="renewal-urgency-item today">
                    <span>
                      <i />
                      Today
                    </span>

                    <strong>
                      {
                        todayRenewals.length
                      }
                    </strong>
                  </div>

                  <div className="renewal-urgency-item tomorrow">
                    <span>
                      <i />
                      Tomorrow
                    </span>

                    <strong>
                      {
                        tomorrowRenewals.length
                      }
                    </strong>
                  </div>

                  <div className="renewal-urgency-item soon">
                    <span>
                      <i />
                      Within 7 days
                    </span>

                    <strong>
                      {
                        soonRenewals.length
                      }
                    </strong>
                  </div>
                </div>
              </div>

              <div className="subscription-renewal-auto">
                <div className="subscription-renewal-card-heading">
                  <div className="subscription-renewal-small-icon violet">
                    <FaSyncAlt />
                  </div>

                  <div>
                    <h3>
                      Auto-Renew Exposure
                    </h3>

                    <p>
                      Automatic charges coming soon
                    </p>
                  </div>
                </div>

                <div className="subscription-renewal-auto-value">
                  <strong>
                    {
                      autoRenewUpcoming.length
                    }
                  </strong>

                  <span>
                    auto-renewing subscription
                    {autoRenewUpcoming.length !==
                    1
                      ? "s"
                      : ""}{" "}
                    within 30 days
                  </span>
                </div>

                <div className="subscription-renewal-auto-amount">
                  <span>
                    POTENTIAL AUTOMATIC SPEND
                  </span>

                  <strong>
                    {formatCurrency(
                      autoRenewUpcoming.reduce(
                        (
                          total,
                          item
                        ) =>
                          total +
                          Number(
                            item.amount
                          ),
                        0
                      )
                    )}
                  </strong>
                </div>
              </div>
            </div>

            <div className="subscription-renewal-control-center">
              <div className="subscription-renewal-control-header">
                <div>
                  <h3>
                    Renewal Control Center
                  </h3>

                  <p>
                    Focus on the payment window you want to review and manage auto-renewal before charges happen.
                  </p>
                </div>

                <button
                  type="button"
                  className="subscription-renewal-review-btn"
                  onClick={
                    openRenewalReview
                  }
                >
                  Review Active
                  <FaArrowRight />
                </button>
              </div>

              <div className="subscription-renewal-window-row">
                {[7, 30, 90].map(
                  (days) => (
                    <button
                      key={days}
                      type="button"
                      className={
                        renewalWindow ===
                        days
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setRenewalWindow(
                          days
                        )
                      }
                    >
                      Next {days} days
                    </button>
                  )
                )}
              </div>

              <div className="subscription-renewal-control-summary">
                <div className="renewal-control-stat">
                  <div className="renewal-control-stat-icon blue">
                    <FaCalendarAlt />
                  </div>

                  <div>
                    <span>
                      RENEWALS
                    </span>

                    <strong>
                      {
                        renewalWindowSubscriptions.length
                      }
                    </strong>

                    <small>
                      within selected window
                    </small>
                  </div>
                </div>

                <div className="renewal-control-stat">
                  <div className="renewal-control-stat-icon orange">
                    <FaWallet />
                  </div>

                  <div>
                    <span>
                      EXPECTED SPEND
                    </span>

                    <strong>
                      {formatCurrency(
                        renewalWindowSpend
                      )}
                    </strong>

                    <small>
                      scheduled charges
                    </small>
                  </div>
                </div>

                <div className="renewal-control-stat">
                  <div className="renewal-control-stat-icon violet">
                    <FaSyncAlt />
                  </div>

                  <div>
                    <span>
                      AUTO-RENEW
                    </span>

                    <strong>
                      {
                        renewalWindowAutoRenew
                      }
                    </strong>

                    <small>
                      automatic charges
                    </small>
                  </div>
                </div>

                <div className="renewal-control-stat">
                  <div className="renewal-control-stat-icon green">
                    <FaBell />
                  </div>

                  <div>
                    <span>
                      MANUAL REVIEW
                    </span>

                    <strong>
                      {
                        renewalWindowManual
                      }
                    </strong>

                    <small>
                      subscriptions to review
                    </small>
                  </div>
                </div>
              </div>

              <div className="subscription-renewal-control-list">
                {renewalWindowSubscriptions.length ===
                0 ? (
                  <div className="subscription-renewal-control-empty">
                    <FaCheckCircle />

                    <div>
                      <strong>
                        No renewals in this window
                      </strong>

                      <span>
                        Try a longer renewal window.
                      </span>
                    </div>
                  </div>
                ) : (
                  renewalWindowSubscriptions
                    .slice(0, 6)
                    .map(
                      (
                        subscription
                      ) => {
                        const renewal =
                          getRenewalInfo(
                            subscription.nextPayment
                          );

                        const id =
                          subscription._id ||
                          subscription.id;

                        return (
                          <div
                            className="subscription-renewal-control-item"
                            key={id}
                          >
                            <div className="subscription-renewal-control-date">
                              <strong>
                                {new Date(
                                  subscription.nextPayment
                                ).getDate()}
                              </strong>

                              <span>
                                {new Date(
                                  subscription.nextPayment
                                ).toLocaleDateString(
                                  "en-IN",
                                  {
                                    month:
                                      "short",
                                  }
                                )}
                              </span>
                            </div>

                            <div className="subscription-renewal-control-info">
                              <strong>
                                {
                                  subscription.name
                                }
                              </strong>

                              <span>
                                {
                                  subscription.category
                                }{" "}
                                •{" "}
                                {
                                  subscription.cycle
                                }
                              </span>
                            </div>

                            <div
                              className={`subscription-renewal-control-status ${renewal.className}`}
                            >
                              {
                                renewal.icon
                              }

                              <span>
                                {
                                  renewal.label
                                }
                              </span>
                            </div>

                            <div className="subscription-renewal-control-amount">
                              <strong>
                                {formatCurrency(
                                  subscription.amount
                                )}
                              </strong>

                              <span>
                                {subscription.autoRenew
                                  ? "Automatic"
                                  : "Manual"}
                              </span>
                            </div>

                            <div className="subscription-renewal-control-actions">
                              <button
                                type="button"
                                title={
                                  subscription.autoRenew
                                    ? "Disable auto-renew"
                                    : "Enable auto-renew"
                                }
                                onClick={() =>
                                  toggleAutoRenew(
                                    id
                                  )
                                }
                                className={
                                  subscription.autoRenew
                                    ? "auto-enabled"
                                    : ""
                                }
                              >
                                <FaToggleOn />

                                <span>
                                  {subscription.autoRenew
                                    ? "Auto-renew"
                                    : "Manual"}
                                </span>
                              </button>

                              <button
                                type="button"
                                title="Edit subscription"
                                onClick={() =>
                                  editSubscription(
                                    subscription
                                  )
                                }
                              >
                                <FaEdit />
                              </button>
                            </div>
                          </div>
                        );
                      }
                    )
                )}
              </div>
            </div>

            <div className="subscription-renewal-timeline">
              <div className="subscription-renewal-timeline-header">
                <div>
                  <h3>
                    Upcoming Renewal Timeline
                  </h3>

                  <p>
                    Your next recurring charges in order.
                  </p>
                </div>

                <span>
                  {
                    renewalSubscriptions.length
                  }{" "}
                  active renewal
                  {renewalSubscriptions.length !==
                  1
                    ? "s"
                    : ""}
                </span>
              </div>

              {renewalSubscriptions.length ===
              0 ? (
                <div className="subscription-renewal-timeline-empty">
                  <FaCheckCircle />

                  <span>
                    No upcoming renewals to display.
                  </span>
                </div>
              ) : (
                <div className="subscription-renewal-timeline-list">
                  {renewalSubscriptions
                    .slice(0, 6)
                    .map(
                      (
                        subscription
                      ) => {
                        const id =
                          subscription._id ||
                          subscription.id;

                        return (
                          <div
                            key={id}
                            className={`subscription-renewal-timeline-item ${subscription.renewalInfo.className}`}
                          >
                            <div className="subscription-renewal-timeline-date">
                              <strong>
                                {new Date(
                                  subscription.nextPayment
                                ).getDate()}
                              </strong>

                              <span>
                                {new Date(
                                  subscription.nextPayment
                                ).toLocaleDateString(
                                  "en-IN",
                                  {
                                    month:
                                      "short",
                                  }
                                )}
                              </span>
                            </div>

                            <div className="subscription-renewal-timeline-info">
                              <strong>
                                {
                                  subscription.name
                                }
                              </strong>

                              <span>
                                {
                                  subscription.category
                                }{" "}
                                •{" "}
                                {
                                  subscription.paymentMethod
                                }
                              </span>
                            </div>

                            <div className="subscription-renewal-timeline-status">
                              <span>
                                {
                                  subscription
                                    .renewalInfo
                                    .icon
                                }

                                {
                                  subscription
                                    .renewalInfo
                                    .label
                                }
                              </span>

                              <strong>
                                {formatCurrency(
                                  subscription.amount
                                )}
                              </strong>
                            </div>

                            {subscription.autoRenew && (
                              <div className="subscription-renewal-auto-badge">
                                <FaSyncAlt />
                                Auto-renew
                              </div>
                            )}

                            <div className="subscription-renewal-timeline-actions">
                              <button
                                type="button"
                                title={
                                  subscription.autoRenew
                                    ? "Disable auto-renew"
                                    : "Enable auto-renew"
                                }
                                onClick={() =>
                                  toggleAutoRenew(
                                    id
                                  )
                                }
                              >
                                <FaSyncAlt />
                              </button>

                              <button
                                type="button"
                                title="Edit"
                                onClick={() =>
                                  editSubscription(
                                    subscription
                                  )
                                }
                              >
                                <FaEdit />
                              </button>
                            </div>
                          </div>
                        );
                      }
                    )}
                </div>
              )}
            </div>
          </section>

          <section className="subscription-toolbar">
            <div className="subscription-search">
              <FaSearch />

              <input
                type="text"
                placeholder="Search subscriptions..."
                value={search}
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="subscription-filters">
              {[
                "All",
                "Active",
                "Paused",
                "Cancelled",
              ].map(
                (item) => (
                  <button
                    type="button"
                    key={item}
                    className={
                      filter ===
                      item
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setFilter(
                        item
                      )
                    }
                  >
                    {item}
                  </button>
                )
              )}
            </div>
          </section>

          <section className="subscription-layout">
            <div className="subscription-list-panel">
              <div className="subscription-section-header">
                <div>
                  <h2>
                    My Subscriptions
                  </h2>

                  <p>
                    {
                      filteredSubscriptions.length
                    }{" "}
                    subscription
                    {filteredSubscriptions.length !==
                    1
                      ? "s"
                      : ""}{" "}
                    shown
                  </p>
                </div>

                <FaCreditCard />
              </div>

              {loading ? (
                <div className="subscription-empty">
                  <div>
                    <FaCreditCard />
                  </div>

                  <h3>
                    Loading subscriptions...
                  </h3>

                  <p>
                    Getting your subscriptions from MongoDB.
                  </p>
                </div>
              ) : filteredSubscriptions.length ===
                0 ? (
                <div className="subscription-empty">
                  <div>
                    <FaCreditCard />
                  </div>

                  <h3>
                    No subscriptions found
                  </h3>

                  <p>
                    Add a subscription or change your search/filter.
                  </p>

                  <button
                    type="button"
                    onClick={
                      openAddModal
                    }
                  >
                    <FaPlus />
                    Add Subscription
                  </button>
                </div>
              ) : (
                <div className="subscription-list">
                  {filteredSubscriptions.map(
                    (
                      subscription
                    ) => {
                      const type =
                        (
                          subscription.status ||
                          "Active"
                        ).toLowerCase();

                      const renewal =
                        getRenewalInfo(
                          subscription.nextPayment
                        );

                      const id =
                        subscription._id ||
                        subscription.id;

                      const isNextPayment =
                        nextPayment &&
                        (nextPayment._id ||
                          nextPayment.id) ===
                          id;

                      return (
                        <article
                          key={id}
                          className={`subscription-card ${type} ${
                            isNextPayment
                              ? "next-payment-card"
                              : ""
                          }`}
                        >
                          <div className="subscription-card-icon">
                            <FaCreditCard />
                          </div>

                          <div className="subscription-card-content">
                            <div className="subscription-card-title">
                              <div>
                                <h3>
                                  {
                                    subscription.name
                                  }
                                </h3>

                                <span>
                                  {
                                    subscription.category
                                  }
                                </span>
                              </div>

                              <div
                                className={`subscription-status ${type}`}
                              >
                                <span />

                                {
                                  subscription.status
                                }
                              </div>
                            </div>

                            <div className="subscription-card-details">
                              <div>
                                <span>
                                  AMOUNT
                                </span>

                                <strong>
                                  {formatCurrency(
                                    subscription.amount
                                  )}
                                </strong>
                              </div>

                              <div>
                                <span>
                                  BILLING
                                </span>

                                <strong>
                                  {
                                    subscription.cycle
                                  }
                                </strong>
                              </div>

                              <div>
                                <span>
                                  NEXT PAYMENT
                                </span>

                                <strong>
                                  {formatDate(
                                    subscription.nextPayment
                                  )}
                                </strong>
                              </div>

                              <div>
                                <span>
                                  PAYMENT
                                </span>

                                <strong>
                                  {
                                    subscription.paymentMethod
                                  }
                                </strong>
                              </div>
                            </div>

                            <div className="subscription-card-bottom">
                              <div className="subscription-renewal-info">
                                <span
                                  className={`subscription-days ${renewal.className}`}
                                >
                                  {
                                    renewal.icon
                                  }

                                  {
                                    renewal.label
                                  }
                                </span>

                                <button
                                  type="button"
                                  className={`subscription-auto-label ${
                                    subscription.autoRenew
                                      ? "enabled"
                                      : "disabled"
                                  }`}
                                  onClick={() =>
                                    toggleAutoRenew(
                                      id
                                    )
                                  }
                                  disabled={
                                    subscription.status !==
                                    "Active"
                                  }
                                >
                                  <FaSyncAlt />

                                  {subscription.autoRenew
                                    ? "Auto-renew enabled"
                                    : "Manual renewal"}
                                </button>
                              </div>

                              <div className="subscription-card-actions">
                                {subscription.status !==
                                  "Cancelled" && (
                                  <button
                                    type="button"
                                    title={
                                      subscription.status ===
                                      "Active"
                                        ? "Pause"
                                        : "Resume"
                                    }
                                    onClick={() =>
                                      toggleStatus(
                                        id
                                      )
                                    }
                                  >
                                    {subscription.status ===
                                    "Active" ? (
                                      <FaPause />
                                    ) : (
                                      <FaPlay />
                                    )}
                                  </button>
                                )}

                                <button
                                  type="button"
                                  title="Edit"
                                  onClick={() =>
                                    editSubscription(
                                      subscription
                                    )
                                  }
                                >
                                  <FaEdit />
                                </button>

                                <button
                                  type="button"
                                  className="danger"
                                  title="Delete"
                                  onClick={() =>
                                    deleteSubscription(
                                      id
                                    )
                                  }
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    }
                  )}
                </div>
              )}
            </div>

            <aside className="subscription-upcoming-panel">
              <div className="subscription-section-header">
                <div>
                  <h2>
                    Upcoming Payments
                  </h2>

                  <p>
                    Your next recurring payments
                  </p>
                </div>

                <FaCalendarAlt />
              </div>

              {upcomingPayments.length ===
              0 ? (
                <div className="subscription-upcoming-empty">
                  <FaCalendarAlt />

                  <p>
                    No upcoming payments.
                  </p>
                </div>
              ) : (
                <div className="upcoming-payment-list">
                  {upcomingPayments
                    .slice(0, 5)
                    .map(
                      (
                        subscription
                      ) => {
                        const paymentDate =
                          new Date(
                            subscription.nextPayment
                          );

                        const renewal =
                          getRenewalInfo(
                            subscription.nextPayment
                          );

                        const id =
                          subscription._id ||
                          subscription.id;

                        const isNext =
                          nextPayment &&
                          (nextPayment._id ||
                            nextPayment.id) ===
                            id;

                        return (
                          <div
                            className={`upcoming-payment ${
                              isNext
                                ? "next-payment"
                                : ""
                            }`}
                            key={id}
                          >
                            <div className="upcoming-payment-date">
                              <strong>
                                {paymentDate.getDate()}
                              </strong>

                              <span>
                                {paymentDate.toLocaleDateString(
                                  "en-IN",
                                  {
                                    month:
                                      "short",
                                  }
                                )}
                              </span>
                            </div>

                            <div className="upcoming-payment-info">
                              <strong>
                                {
                                  subscription.name
                                }
                              </strong>

                              <span
                                className={`upcoming-renewal-status ${renewal.className}`}
                              >
                                {
                                  renewal.label
                                }
                              </span>
                            </div>

                            <strong className="upcoming-payment-amount">
                              {formatCurrency(
                                subscription.amount
                              )}
                            </strong>
                          </div>
                        );
                      }
                    )}
                </div>
              )}
            </aside>
          </section>
        </main>
      </div>

      {showModal && (
        <div
          className="subscription-modal-overlay"
          onMouseDown={(
            event
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <form
            className="subscription-modal"
            onSubmit={
              saveSubscription
            }
          >
            <div className="subscription-modal-header">
              <div>
                <h2>
                  {editingId
                    ? "Edit Subscription"
                    : "Add Subscription"}
                </h2>

                <p>
                  Add your recurring payment details.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeModal
                }
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            <div className="subscription-form-grid">
              <label>
                <span>
                  Subscription Name
                </span>

                <input
                  name="name"
                  type="text"
                  placeholder="e.g. Netflix"
                  value={form.name}
                  onChange={
                    handleChange
                  }
                  required
                />
              </label>

              <label>
                <span>
                  Category
                </span>

                <select
                  name="category"
                  value={
                    form.category
                  }
                  onChange={
                    handleChange
                  }
                >
                  <option>
                    Entertainment
                  </option>

                  <option>
                    Education
                  </option>

                  <option>
                    Software
                  </option>

                  <option>
                    Health
                  </option>

                  <option>
                    Shopping
                  </option>

                  <option>
                    Gaming
                  </option>

                  <option>
                    Other
                  </option>
                </select>
              </label>

              <label>
                <span>
                  Amount
                </span>

                <input
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="₹ 0"
                  value={
                    form.amount
                  }
                  onChange={
                    handleChange
                  }
                  required
                />
              </label>

              <label>
                <span>
                  Billing Cycle
                </span>

                <select
                  name="cycle"
                  value={
                    form.cycle
                  }
                  onChange={
                    handleChange
                  }
                >
                  <option>
                    Weekly
                  </option>

                  <option>
                    Monthly
                  </option>

                  <option>
                    Yearly
                  </option>
                </select>
              </label>

              <label>
                <span>
                  Start Date
                </span>

                <input
                  name="startDate"
                  type="date"
                  value={
                    form.startDate
                  }
                  onChange={
                    handleChange
                  }
                  required
                />
              </label>

              <label>
                <span>
                  Next Payment Date
                </span>

                <input
                  name="nextPayment"
                  type="date"
                  value={
                    form.nextPayment
                  }
                  onChange={
                    handleChange
                  }
                  required
                />
              </label>

              <label>
                <span>
                  Payment Method
                </span>

                <select
                  name="paymentMethod"
                  value={
                    form.paymentMethod
                  }
                  onChange={
                    handleChange
                  }
                >
                  <option>
                    UPI
                  </option>

                  <option>
                    Card
                  </option>

                  <option>
                    Net Banking
                  </option>

                  <option>
                    Cash
                  </option>

                  <option>
                    Other
                  </option>
                </select>
              </label>

              <label>
                <span>
                  Status
                </span>

                <select
                  name="status"
                  value={
                    form.status
                  }
                  onChange={
                    handleChange
                  }
                >
                  <option>
                    Active
                  </option>

                  <option>
                    Paused
                  </option>

                  <option>
                    Cancelled
                  </option>
                </select>
              </label>
            </div>

            <label className="subscription-auto-renew">
              <input
                name="autoRenew"
                type="checkbox"
                checked={
                  form.autoRenew
                }
                onChange={
                  handleChange
                }
              />

              <span>
                Auto-renew this subscription
              </span>
            </label>

            <div className="subscription-modal-actions">
              <button
                type="button"
                className="subscription-cancel-btn"
                onClick={
                  closeModal
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                className="subscription-save-btn"
              >
                <FaSave />

                {editingId
                  ? "Save Changes"
                  : "Add Subscription"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default SubscriptionTracker;