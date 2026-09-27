import React from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

const ChatMessages = ({
  messages,
  loading,
  bottomRef,
}) => {
  const hasMessages =
    Array.isArray(messages) && messages.length > 0;

  return (
    <div className="chat-messages">

      {!hasMessages ? (
        <div className="empty-chat">

          <div className="empty-chat-icon">
            👋
          </div>

          <h2>
            Welcome to SmaXTify.AI
          </h2>

          <p>
            Ask me anything about coding, technology,
            finance, budgeting, investments, or general knowledge.
          </p>

          <div className="suggestion-grid">

            <button
              type="button"
              className="suggestion-card"
            >
              <span className="suggestion-icon">
                💰
              </span>

              <span>
                Analyze my monthly expenses
              </span>
            </button>

            <button
              type="button"
              className="suggestion-card"
            >
              <span className="suggestion-icon">
                📈
              </span>

              <span>
                Give me saving tips
              </span>
            </button>

            <button
              type="button"
              className="suggestion-card"
            >
              <span className="suggestion-icon">
                💻
              </span>

              <span>
                Help me with React
              </span>
            </button>

            <button
              type="button"
              className="suggestion-card"
            >
              <span className="suggestion-icon">
                🤖
              </span>

              <span>
                Explain Artificial Intelligence
              </span>
            </button>

          </div>
        </div>
      ) : (
        messages.map((message, index) => (
          <MessageBubble
            key={`${message.time || "message"}-${index}`}
            message={message}
          />
        ))
      )}

      {loading && <TypingIndicator />}

      <div
        ref={bottomRef}
        className="chat-bottom-anchor"
      />
    </div>
  );
};

export default ChatMessages;