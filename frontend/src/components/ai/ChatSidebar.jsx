import React from "react";
import {
  Plus,
  MessageSquare,
  Trash2,
  Sparkles,
} from "lucide-react";

const ChatSidebar = ({
  chats,
  currentChatId,
  createNewChat,
  selectChat,
  deleteChat,
}) => {
  return (
    <aside className="chat-sidebar">

      <div className="sidebar-top">

        <div className="sidebar-logo">
          <Sparkles size={22} />
          <span>SmaXTify.AI</span>
        </div>

        <button
          className="new-chat-btn"
          onClick={createNewChat}
        >
          <Plus size={18} />
          <span>New Chat</span>
        </button>

      </div>

      <div className="sidebar-title">
        Conversations
      </div>

      <div className="chat-list">

        {chats.length === 0 ? (

          <div className="no-chat">
            No conversations yet.
          </div>

        ) : (

          chats.map((chat) => (

            <div
              key={chat.id}
              className={`chat-item ${
                currentChatId === chat.id ? "active-chat" : ""
              }`}
            >
              <div
                className="chat-item-info"
                onClick={() => selectChat(chat.id)}
              >
                <MessageSquare size={18} />

                <div className="chat-text">
                  <h4>{chat.title}</h4>

                  <p>
                    {chat.messages.length} message
                    {chat.messages.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <button
                className="delete-chat-btn"
                onClick={() => deleteChat(chat.id)}
                title="Delete Chat"
              >
                <Trash2 size={16} />
              </button>

            </div>

          ))

        )}

      </div>

      <div className="sidebar-footer">
        <small>
          SmaXTify.AI v1.0
        </small>
      </div>

    </aside>
  );
};

export default ChatSidebar;