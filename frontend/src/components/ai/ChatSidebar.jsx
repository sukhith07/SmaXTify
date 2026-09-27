import React from "react";

import {
  Plus,
  MessageSquare,
  Trash2,
  Sparkles,
  Menu,
} from "lucide-react";


const ChatSidebar = ({
  chats,
  currentChatId,
  createNewChat,
  selectChat,
  deleteChat,
  isOpen,
  onToggleSidebar,
}) => {

  return (
    <aside
      className={`smaxtify-ai-sidebar ${
        isOpen
          ? "smaxtify-ai-sidebar-open"
          : "smaxtify-ai-sidebar-closed"
      }`}
    >

      <div className="smaxtify-ai-sidebar-inner">

        {/* ================================
            SIDEBAR HEADER
            ================================ */}

        <div className="smaxtify-ai-sidebar-header">

          {/* BRAND ROW */}

          <div className="smaxtify-ai-sidebar-brand">

            <div className="smaxtify-ai-sidebar-logo">

              <div className="smaxtify-ai-sidebar-logo-icon">
                <Sparkles size={15} />
              </div>

              <span>
                SmaXTify.AI
              </span>

            </div>


            <button
              type="button"
              className="smaxtify-ai-sidebar-menu"
              onClick={onToggleSidebar}
              title="Close Recent Chats"
              aria-label="Close Recent Chats"
            >
              <Menu size={18} />
            </button>

          </div>


          {/* NEW CHAT */}

          <button
            type="button"
            className="smaxtify-ai-new-chat"
            onClick={createNewChat}
          >
            <Plus size={17} />

            <span>
              New Chat
            </span>
          </button>

        </div>


        {/* ================================
            RECENT CHATS
            ================================ */}

        <div className="smaxtify-ai-recent-title">
          Recent Chats
        </div>


        <div className="smaxtify-ai-chat-list">

          {chats.length === 0 ? (

            <div className="smaxtify-ai-no-chat">
              No conversations yet.
            </div>

          ) : (

            chats.map((chat) => {

              const chatId = chat._id;

              const messageCount =
                Array.isArray(chat.messages)
                  ? chat.messages.length
                  : 0;


              return (
                <div
                  key={chatId}
                  className={`smaxtify-ai-chat-item ${
                    currentChatId === chatId
                      ? "smaxtify-ai-active-chat"
                      : ""
                  }`}
                >

                  {/* CHAT */}

                  <button
                    type="button"
                    className="smaxtify-ai-chat-info"
                    onClick={() =>
                      selectChat(chatId)
                    }
                  >

                    <MessageSquare size={17} />

                    <div className="smaxtify-ai-chat-text">

                      <strong>
                        {chat.title || "New Chat"}
                      </strong>

                      <small>
                        {messageCount} message
                        {messageCount !== 1 ? "s" : ""}
                      </small>

                    </div>

                  </button>


                  {/* DELETE */}

                  <button
                    type="button"
                    className="smaxtify-ai-delete-chat"
                    onClick={() =>
                      deleteChat(chatId)
                    }
                    title="Delete Chat"
                    aria-label="Delete Chat"
                  >
                    <Trash2 size={15} />
                  </button>

                </div>
              );

            })

          )}

        </div>


        {/* ================================
            FOOTER
            ================================ */}

        <div className="smaxtify-ai-sidebar-footer">
          <small>
            SmaXTify.AI
          </small>
        </div>

      </div>

    </aside>
  );
};


export default ChatSidebar;