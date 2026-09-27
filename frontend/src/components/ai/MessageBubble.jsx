import React, {
  useState,
} from "react";

import {
  Bot,
  User,
  Copy,
  Check,
} from "lucide-react";

import ReactMarkdown from "react-markdown";

import remarkGfm from "remark-gfm";

import rehypeHighlight from "rehype-highlight";


const MessageBubble = ({
  message,
}) => {

  const isUser =
    message.role === "user";


  const [copied, setCopied] =
    useState(false);


  /* =======================================================
     COPY
     ======================================================= */

  const copyText =
    async () => {

      try {

        await navigator.clipboard.writeText(
          message.text || ""
        );


        setCopied(true);


        setTimeout(() => {

          setCopied(false);

        }, 1500);

      } catch (error) {

        console.error(
          "Copy failed:",
          error
        );

      }
    };


  /* =======================================================
     TIME
     ======================================================= */

  const formatTime =
    (time) => {

      if (!time) {
        return "";
      }


      return new Date(
        time
      ).toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    };


  return (
    <div
      className={
        `message-row ${
          isUser
            ? "user-message"
            : "assistant-message"
        }`
      }
    >


      {/* AI AVATAR */}

      {!isUser && (
        <div className="message-avatar ai-avatar">

          <Bot
            size={18}
          />

        </div>
      )}


      {/* CONTENT */}

      <div className="message-content">

        <div className="message-bubble">


          {/* COPY */}

          {!isUser && (
            <button
              type="button"
              className={
                `message-copy-button ${
                  copied
                    ? "message-copy-success"
                    : ""
                }`
              }
              onClick={
                copyText
              }
              title={
                copied
                  ? "Copied"
                  : "Copy message"
              }
              aria-label={
                copied
                  ? "Copied"
                  : "Copy message"
              }
            >

              {copied ? (
                <Check
                  size={14}
                />
              ) : (
                <Copy
                  size={14}
                />
              )}

            </button>
          )}


          {/* USER TEXT */}

          {isUser ? (

            <p className="message-text">
              {message.text}
            </p>

          ) : (

            <div className="assistant-message-text">

              <ReactMarkdown
                remarkPlugins={[
                  remarkGfm,
                ]}
                rehypePlugins={[
                  rehypeHighlight,
                ]}
              >
                {message.text}
              </ReactMarkdown>

            </div>

          )}

        </div>


        {/* TIME */}

        <span className="message-time">
          {formatTime(
            message.time
          )}
        </span>

      </div>


      {/* USER AVATAR */}

      {isUser && (
        <div className="message-avatar user-avatar">

          <User
            size={18}
          />

        </div>
      )}

    </div>
  );
};


export default MessageBubble;