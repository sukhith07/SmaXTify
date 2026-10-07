import {
  useState,
  useEffect,
  useRef,
} from "react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import {
  Line,
  Bar,
  Doughnut,
} from "react-chartjs-2";

import {
  Menu,
  X,
} from "lucide-react";

import API from "../../services/api";

import ChatSidebar from "./ChatSidebar";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

import ".././styles/smaxtifyAI.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

function AIChart({ chart }) {
  if (
    !chart ||
    !Array.isArray(chart.labels) ||
    !Array.isArray(chart.datasets)
  ) {
    return null;
  }

  const chartType = chart.chartType || "line";

  const chartData = {
    labels: chart.labels,
    datasets: chart.datasets.map((dataset) => ({
      ...dataset,
      borderWidth: 2,
      tension: 0.35,
      pointRadius:
        chartType === "line" ? 3 : undefined,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context) => {
            const value = Number(context.raw || 0);

            return ` ${
              context.dataset?.label || ""
            }: ₹${value.toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })}`;
          },
        },
      },
    },
    scales:
      chartType === "doughnut"
        ? undefined
        : {
            x: {
              ticks: {
                maxRotation: 45,
                minRotation: 0,
              },
            },
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) =>
                  `₹${Number(value).toLocaleString("en-IN")}`,
              },
            },
          },
  };

  return (
    <div className="smaxtify-ai-chart-card">
      {chart.title && <h3>{chart.title}</h3>}

      <div className="smaxtify-ai-chart-container">
        {chartType === "line" && (
          <Line data={chartData} options={options} />
        )}

        {chartType === "bar" && (
          <Bar data={chartData} options={options} />
        )}

        {chartType === "doughnut" && (
          <Doughnut data={chartData} options={options} />
        )}
      </div>

      <div className="smaxtify-chart-summary">
        {typeof chart.totalIncome === "number" && (
          <span>
            Total income:{" "}
            <strong>
              ₹
              {chart.totalIncome.toLocaleString("en-IN")}
            </strong>
          </span>
        )}

        {typeof chart.totalExpense === "number" && (
          <span>
            Total expenses:{" "}
            <strong>
              ₹
              {chart.totalExpense.toLocaleString("en-IN")}
            </strong>
          </span>
        )}

        {typeof chart.netBalance === "number" && (
          <span>
            Net balance:{" "}
            <strong>
              ₹
              {chart.netBalance.toLocaleString("en-IN")}
            </strong>
          </span>
        )}
      </div>
    </div>
  );
}

export default function SmaXTifyAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [greetingVisible, setGreetingVisible] = useState(true);
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [currentChart, setCurrentChart] = useState(null);
  const [userName, setUserName] = useState("");

  const bottomRef = useRef(null);
  const scrollEndRef = useRef(null);

  const currentChat =
    chats.find((chat) => chat._id === currentChatId) || null;

  useEffect(() => {
    let isMounted = true;

    const loadCurrentUser = async () => {
      try {
        const response = await API.get("/auth/me");
        const user = response.data?.user || response.data;

        if (isMounted) {
          setUserName(
            user?.name?.trim()?.split(/\s+/)[0] || ""
          );
        }
      } catch (error) {
        console.error("Load AI Greeting User Error:", error);
      }
    };

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const openAI = () => {
    setIsSidebarOpen(false);
    setIsOpen(true);
  };

  const closeAI = () => {
    setIsOpen(false);
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timer = setTimeout(() => {
      if (scrollEndRef.current) {
        scrollEndRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      } else if (bottomRef.current) {
        bottomRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    }, 80);

    return () => clearTimeout(timer);
  }, [
    currentChat?.messages,
    loading,
    currentChart,
    isOpen,
  ]);

  useEffect(() => {
    if (!isOpen || chats.length > 0) {
      return;
    }

    const loadChats = async () => {
      try {
        setInitializing(true);

        const response = await API.get("/chats");
        const data =
          response.data?.chats ||
          response.data ||
          [];

        if (Array.isArray(data) && data.length > 0) {
          setChats(data);
          setCurrentChatId(data[0]._id);
        } else {
          const createResponse = await API.post("/chats");
          const chat =
            createResponse.data?.chat ||
            createResponse.data;

          if (chat?._id) {
            setChats([chat]);
            setCurrentChatId(chat._id);
          }
        }
      } catch (error) {
        console.error("Load Chats Error:", error);
      } finally {
        setInitializing(false);
      }
    };

    loadChats();
  }, [isOpen, chats.length]);

  const createNewChat = async () => {
    try {
      const response = await API.post("/chats");
      const chat =
        response.data?.chat ||
        response.data;

      if (!chat?._id) {
        throw new Error("Invalid chat response.");
      }

      setChats((previous) => [chat, ...previous]);
      setCurrentChatId(chat._id);
      setInput("");
      setPendingAction(null);
      setCurrentChart(null);
    } catch (error) {
      console.error("Create Chat Error:", error);
    }
  };

  const selectChat = (id) => {
    setCurrentChatId(id);
    setInput("");
    setPendingAction(null);
    setCurrentChart(null);
    setIsSidebarOpen(false);
  };

  const deleteChat = async (id) => {
    if (chats.length === 1) {
      return;
    }

    try {
      await API.delete(`/chats/${id}`);

      const updatedChats = chats.filter(
        (chat) => chat._id !== id
      );

      setChats(updatedChats);

      if (currentChatId === id) {
        setCurrentChatId(updatedChats[0]?._id || null);
        setCurrentChart(null);
      }

      setPendingAction(null);
    } catch (error) {
      console.error("Delete Chat Error:", error);
    }
  };

  const clearChat = () => {
    setChats((previous) =>
      previous.map((chat) =>
        chat._id === currentChatId
          ? {
              ...chat,
              messages: [],
            }
          : chat
      )
    );

    setPendingAction(null);
    setCurrentChart(null);
  };

  const addLocalMessage = (chatId, message) => {
    setChats((previous) =>
      previous.map((chat) =>
        chat._id === chatId
          ? {
              ...chat,
              messages: [
                ...(chat.messages || []),
                message,
              ],
            }
          : chat
      )
    );
  };

  const updateLocalTitle = (chatId, title) => {
    if (!title) {
      return;
    }

    setChats((previous) =>
      previous.map((chat) =>
        chat._id === chatId
          ? {
              ...chat,
              title,
            }
          : chat
      )
    );
  };

  const sendMessage = async (confirmation = false) => {
    if (!currentChatId) {
      return;
    }

    const question = input.trim();

    if (!confirmation && !question) {
      return;
    }

    if (loading) {
      return;
    }

    const messageToSend = confirmation
      ? pendingAction?.originalMessage
      : question;

    if (!messageToSend) {
      return;
    }

    if (!confirmation) {
      setCurrentChart(null);

      addLocalMessage(currentChatId, {
        role: "user",
        text: question,
        time: new Date(),
      });

      setInput("");
    }

    setLoading(true);

    try {
      const response = await API.post("/ai/chat", {
        chatId: currentChatId,
        message: messageToSend,
        confirmed: confirmation,
      });

      const data = response.data;

      if (
        data.action?.requiresConfirmation &&
        data.executed === false
      ) {
        setPendingAction({
          action: data.action,
          originalMessage: messageToSend,
          confirmationText: data.reply,
        });

        addLocalMessage(currentChatId, {
          role: "assistant",
          text:
            data.reply ||
            "Please confirm this action.",
          time: new Date(),
        });

        return;
      }

      if (data.executed === true) {
        setPendingAction(null);

        const actionName = data.action?.name;

        const chartActions = [
          "get_income_chart",
          "get_expense_chart",
          "get_income_vs_expense_chart",
          "get_category_breakdown",
          "get_monthly_financial_chart",
        ];

        if (
          chartActions.includes(actionName) &&
          data.result
        ) {
          setCurrentChart(data.result);
        }

        addLocalMessage(currentChatId, {
          role: "assistant",
          text:
            data.reply ||
            "Action completed successfully.",
          time: new Date(),
        });

        return;
      }

      addLocalMessage(currentChatId, {
        role: "assistant",
        text:
          data.reply ||
          "Sorry, I couldn't generate a response.",
        time: new Date(),
      });

      if (data.title) {
        updateLocalTitle(currentChatId, data.title);
      }
    } catch (error) {
      console.error("SmaXTify.AI Error:", error);

      addLocalMessage(currentChatId, {
        role: "assistant",
        text: error.response?.data?.message
          ? `❌ ${error.response.data.message}`
          : "❌ Unable to contact SmaXTify.AI.",
        time: new Date(),
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmAction = async () => {
    if (!pendingAction) {
      return;
    }

    await sendMessage(true);
  };

  const cancelAction = () => {
    setPendingAction(null);

    addLocalMessage(currentChatId, {
      role: "assistant",
      text: "Action cancelled.",
      time: new Date(),
    });
  };

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      
      {!isOpen && (
        <>
          {greetingVisible && (
            <div
              className="smaxtify-ai-greeting"
              role="status"
              aria-live="polite"
            >
              <div className="smaxtify-ai-greeting-content">
                <div className="smaxtify-ai-greeting-title">
                  Hello, {userName || "there"}!{" "}
                  <span className="smaxtify-ai-greeting-emoji">
                    👋
                  </span>
                </div>

                <div className="smaxtify-ai-greeting-brand">
                  I'm SmaXTify.AI
                </div>

                <div className="smaxtify-ai-greeting-question">
                  What's on your mind..?
                </div>
              </div>

              <button
                type="button"
                className="smaxtify-ai-greeting-close"
                onClick={() => setGreetingVisible(false)}
                aria-label="Close greeting message"
                title="Close message"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <button
            type="button"
            className="smaxtify-ai-fab"
            onClick={openAI}
            aria-label="Open SmaXTify AI"
          >
            🤖
          </button>
        </>
      )}

      {isOpen && (
        <div className="smaxtify-ai-overlay">
          <div className="smaxtify-ai-window">
            <ChatHeader clearChat={clearChat} />

            <div className="smaxtify-layout">
              <ChatSidebar
                chats={chats}
                currentChatId={currentChatId}
                createNewChat={createNewChat}
                selectChat={selectChat}
                deleteChat={deleteChat}
                isOpen={isSidebarOpen}
                onToggleSidebar={() =>
                  setIsSidebarOpen((previous) => !previous)
                }
              />

              <div className="smaxtify-container">
                <div className="smaxtify-chat-toolbar">
                  <button
                    type="button"
                    className="smaxtify-sidebar-toggle"
                    onClick={() =>
                      setIsSidebarOpen((previous) => !previous)
                    }
                    title={
                      isSidebarOpen
                        ? "Close Recent Chats"
                        : "Open Recent Chats"
                    }
                    aria-label={
                      isSidebarOpen
                        ? "Close Recent Chats"
                        : "Open Recent Chats"
                    }
                  >
                    <Menu size={19} />
                  </button>

                  <div className="smaxtify-toolbar-info">
                    <span className="smaxtify-toolbar-title">
                      {currentChat?.title ||
                        "SmaXTify AI Personal Finance"}
                    </span>

                    <span className="smaxtify-toolbar-status">
                      SMAXTIFY.AI
                    </span>
                  </div>

                  <button
                    type="button"
                    className="smaxtify-inner-close"
                    onClick={closeAI}
                    title="Close SmaXTify AI"
                    aria-label="Close SmaXTify AI"
                  >
                    <X size={18} />
                  </button>
                </div>

                {initializing ? (
                  <div className="smaxtify-loading">
                    <div className="smaxtify-loading-icon">
                      ✨
                    </div>
                    <p>Loading SmaXTify.AI...</p>
                  </div>
                ) : currentChat ? (
                  <>
                    <div className="smaxtify-scroll-area">
                      <ChatMessages
                        messages={currentChat.messages || []}
                        loading={loading}
                        bottomRef={bottomRef}
                      />

                      {currentChart && (
                        <AIChart chart={currentChart} />
                      )}

                      <div
                        ref={scrollEndRef}
                        className="smaxtify-scroll-anchor"
                      />
                    </div>

                    <div className="smaxtify-bottom-area">
                      <ChatInput
                        input={input}
                        setInput={setInput}
                        sendMessage={() => sendMessage(false)}
                        handleKeyDown={handleKeyDown}
                        loading={loading}
                      />

                      {pendingAction && (
                        <div className="smaxtify-ai-confirmation">
                          <div>
                            <strong>Confirm action</strong>
                            <p>
                              {pendingAction.confirmationText ||
                                "Do you want to continue?"}
                            </p>
                          </div>

                          <div className="smaxtify-ai-confirmation-actions">
                            <button
                              type="button"
                              onClick={confirmAction}
                              disabled={loading}
                            >
                              Confirm
                            </button>

                            <button
                              type="button"
                              onClick={cancelAction}
                              disabled={loading}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="smaxtify-empty-state">
                    <h2>
                      Hello, {userName || "there"}! 👋
                    </h2>
                    <p>
                      Welcome to SmaXTify.AI. How can I help you
                      manage your finances today?
                    </p>
                    <p>
                      Select a chat or create a new conversation.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}