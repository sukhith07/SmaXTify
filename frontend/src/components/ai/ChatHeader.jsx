import React from "react";
import { Sparkles, Trash2 } from "lucide-react";

const ChatHeader = ({ clearChat }) => {
  return (
    <div className="chat-header">
      <div className="chat-header-left">
        <div className="ai-logo">
          <Sparkles size={22} />
        </div>

        <div>
          <h2>SmaXTify.AI</h2>
          <p>Your Smart AI Assistant</p>
        </div>
      </div>

      <button
        className="clear-chat-btn"
        onClick={clearChat}
        title="Clear Conversation"
      >
        <Trash2 size={18} />
        <span>Clear Chat</span>
      </button>
    </div>
  );
};

export default ChatHeader;