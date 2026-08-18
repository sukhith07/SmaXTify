import { useState, useRef, useEffect } from "react";
import {
  FaRobot,
  FaPaperPlane,
  FaTimes,
} from "react-icons/fa";

import API from "../services/api";
import "./styles/aiAdvisor.css";

function AIAdvisorModal({
  isOpen,
  onClose,
  expenses = [],
}) {

  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "👋 Hi! I'm your AI Expense Advisor powered by Google Gemini.\nAsk me anything about your expenses, savings, budgeting or investments.",
    },
  ]);

  const [input, setInput] = useState("");

  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);

  useEffect(() => {

    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [messages]);

  useEffect(() => {

    if (!isOpen) {
      setInput("");
      setLoading(false);
    }

  }, [isOpen]);

  if (!isOpen) return null;

  const sendMessage = async () => {

    if (!input.trim() || loading) return;

    const question = input.trim();

    const userMessage = {
      sender: "user",
      text: question,
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);

    setInput("");

    setLoading(true);

    try {

      const res = await API.post("/ai/chat", {
        message: question,
        expenses,
      });

      const aiMessage = {
        sender: "ai",
        text:
          res.data.reply ||
          "Sorry, I couldn't generate a response.",
      };

      setMessages((prev) => [
        ...prev,
        aiMessage,
      ]);

    } catch (err) {

      console.error(err);

      let errorMessage =
        "❌ Unable to contact Gemini AI.";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: errorMessage,
        },
      ]);

    } finally {

      setLoading(false);

    }

  };

  const handleKeyDown = (e) => {

    if (e.key === "Enter") {
      sendMessage();
    }

  };
    return (
    <div className="ai-overlay">

      <div className="ai-modal">

        {/* Header */}

        <div className="ai-header">

          <div className="ai-title">
            <FaRobot />
            <h2>Gemini AI Advisor</h2>
          </div>

          <button
            className="close-ai"
            onClick={onClose}
          >
            <FaTimes />
          </button>

        </div>

        {/* Chat */}

        <div className="ai-body">

          {messages.map((msg, index) => (

            <div
              key={index}
              className={
                msg.sender === "user"
                  ? "user-message"
                  : "ai-message"
              }
            >
              {msg.text}
            </div>

          ))}

          {loading && (

            <div className="ai-message">
              🤖 Gemini is thinking...
            </div>

          )}

          <div ref={bottomRef}></div>

        </div>

        {/* Footer */}

        <div className="ai-footer">

          <input
            type="text"
            placeholder="Ask Gemini about your expenses..."
            value={input}
            onChange={(e) =>
              setInput(e.target.value)
            }
            onKeyDown={handleKeyDown}
            disabled={loading}
          />

          <button
            onClick={sendMessage}
            disabled={loading}
          >
            <FaPaperPlane />
          </button>

        </div>

      </div>

    </div>
  );
}

export default AIAdvisorModal;