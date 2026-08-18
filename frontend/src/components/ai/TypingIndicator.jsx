import React from "react";
import { Bot } from "lucide-react";

const TypingIndicator = () => {
  return (
    <div className="message-row assistant-message">
      <div className="message-avatar ai-avatar">
        <Bot size={20} />
      </div>

      <div className="message-content">
        <div className="typing-bubble">

          <div className="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <p className="typing-text">
            SmaXTify.AI is thinking...
          </p>

        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;