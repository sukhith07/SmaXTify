import React from "react";
import { Bot, User, Copy } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

const MessageBubble = ({ message }) => {

  const isUser = message.role === "user";

  const copyText = () => {
    navigator.clipboard.writeText(message.text);
  };

  const formatTime = (time) => {
    if (!time) return "";

    return new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`message-row ${
        isUser ? "user-message" : "assistant-message"
      }`}
    >
      {!isUser && (
        <div className="message-avatar ai-avatar">
          <Bot size={20} />
        </div>
      )}

      <div className="message-content">

        <div className="message-bubble">

          {!isUser && (
            <button
              className="copy-button"
              onClick={copyText}
            >
              <Copy size={15} />
            </button>
          )}

          {isUser ? (
            <p className="message-text">
              {message.text}
            </p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {message.text}
            </ReactMarkdown>
          )}

        </div>

        <span className="message-time">
          {formatTime(message.time)}
        </span>

      </div>

      {isUser && (
        <div className="message-avatar user-avatar">
          <User size={20} />
        </div>
      )}
    </div>
  );

};

export default MessageBubble;