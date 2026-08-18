import React from "react";
import { SendHorizontal } from "lucide-react";

const ChatInput = ({
  input,
  setInput,
  sendMessage,
  handleKeyDown,
  loading,
}) => {
  return (
    <div className="chat-input-container">

      <div className="chat-input-wrapper">

        <textarea
          className="chat-input"
          placeholder="Message SmaXTify.AI..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={loading}
        />

        <button
          className="send-button"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          title="Send Message"
        >
          <SendHorizontal size={20} />
        </button>

      </div>

      <p className="chat-footer">
        SmaXTify.AI can make mistakes. Verify important information before relying on it.
      </p>

    </div>
  );
};

export default ChatInput;