import React from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

const ChatMessages = ({ messages, loading, bottomRef }) => {
  return (
    <div className="chat-messages">

      {messages.length === 0 ? (
        <div className="empty-chat">
          <h2>👋 Welcome to SmaXTify.AI</h2>

          <p>
            Ask me anything about coding, technology, finance,
            budgeting, investments, or general knowledge.
          </p>

          <div className="suggestion-grid">

            <div className="suggestion-card">
              💰 Analyze my monthly expenses
            </div>

            <div className="suggestion-card">
              📈 Give me saving tips
            </div>

            <div className="suggestion-card">
              💻 Help me with React
            </div>

            <div className="suggestion-card">
              🤖 Explain Artificial Intelligence
            </div>

          </div>
        </div>
      ) : (
        messages.map((message, index) => (
          <MessageBubble
            key={index}
            message={message}
          />
        ))
      )}

      {loading && <TypingIndicator />}

      <div ref={bottomRef} />

    </div>
  );
};

export default ChatMessages;