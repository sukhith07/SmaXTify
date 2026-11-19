
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
          aria-label="Type your message to SmaXTify.AI"
        />

        <button
          type="button"
          className="send-button"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          title="Send Message"
          aria-label="Send message"
        >
          <SendHorizontal size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
