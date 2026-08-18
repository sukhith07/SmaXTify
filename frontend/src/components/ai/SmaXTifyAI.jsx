import {
  getChats,
  createChat,
  deleteChat as deleteChatAPI,
  addMessage,
  updateTitle,
} from "../../services/chatService";

import { useState, useEffect, useRef } from "react";
import API from "../../services/api";

import ChatSidebar from "./ChatSidebar";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

import "./styles/smaxtifyAI.css";

export default function SmaXTifyAI() {

  const [chats, setChats] = useState([]);

  const [currentChatId, setCurrentChatId] = useState(null);

  const [input, setInput] = useState("");

  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);

  const currentChat =
    chats.find(chat => chat._id === currentChatId) || null;

  /* ==========================
      Auto Scroll
  ========================== */

  useEffect(() => {

    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [currentChat?.messages, loading]);

  /* ==========================
      Load Chats
  ========================== */

  useEffect(() => {

    const loadChats = async () => {

      try {

        const data = await getChats();

        if (data.length > 0) {

          setChats(data);

          setCurrentChatId(data[0]._id);

        } else {

          const chat = await createChat();

          setChats([chat]);

          setCurrentChatId(chat._id);

        }

      } catch (err) {

        console.error("Load Chats Error:", err);

      }

    };

    loadChats();

  }, []);

  /* ==========================
      Create Chat
  ========================== */

  const createNewChat = async () => {

    try {

      const chat = await createChat();

      setChats(prev => [chat, ...prev]);

      setCurrentChatId(chat._id);

      setInput("");

    } catch (err) {

      console.error("Create Chat Error:", err);

    }

  };

  /* ==========================
      Select Chat
  ========================== */

  const selectChat = (id) => {

    setCurrentChatId(id);

    setInput("");

  };

  /* ==========================
      Delete Chat
  ========================== */

  const deleteChat = async (id) => {

    if (chats.length === 1) return;

    try {

      await deleteChatAPI(id);

      const updatedChats =
        chats.filter(chat => chat._id !== id);

      setChats(updatedChats);

      if (currentChatId === id) {

        setCurrentChatId(updatedChats[0]._id);

      }

    } catch (err) {

      console.error("Delete Chat Error:", err);

    }

  };

  /* ==========================
      Clear Chat
  ========================== */

  const clearChat = () => {

    setChats(prev =>
      prev.map(chat =>
        chat._id === currentChatId
          ? {
              ...chat,
              messages: [
                {
                  role: "assistant",
                  text:
                    "👋 Hello! I'm SmaXTify.AI.\n\nHow can I help you today?",
                  time: new Date(),
                },
              ],
            }
          : chat
      )
    );

  };


/* ==========================
    Send Message
========================== */

const sendMessage = async () => {

  if (!currentChatId) return;

  if (!input.trim()) return;

  const question = input.trim();

  const userMessage = {
    role: "user",
    text: question,
    time: new Date(),
  };

  // Show user message immediately
  setChats(prev =>
    prev.map(chat =>
      chat._id === currentChatId
        ? {
            ...chat,
            messages: [...chat.messages, userMessage],
          }
        : chat
    )
  );

  setInput("");
  setLoading(true);

  try {

    // Save user message to MongoDB
    await addMessage(
      currentChatId,
      "user",
      question
    );

    // Ask SmaXTify.AI
    const res = await API.post("/ai/chat", {
      chatId: currentChatId,
      message: question,
    });

    const aiReply =
      res.data.reply ||
      "Sorry, I couldn't generate a response.";

    const aiMessage = {
      role: "assistant",
      text: aiReply,
      time: new Date(),
    };

    // Save AI reply
    await addMessage(
      currentChatId,
      "assistant",
      aiReply
    );

    // Update chat title if generated
    if (res.data.title) {

      await updateTitle(
        currentChatId,
        res.data.title
      );

      setChats(prev =>
        prev.map(chat =>
          chat._id === currentChatId
            ? {
                ...chat,
                title: res.data.title,
              }
            : chat
        )
      );

    }

    // Display AI reply
    setChats(prev =>
      prev.map(chat =>
        chat._id === currentChatId
          ? {
              ...chat,
              messages: [
                ...chat.messages,
                aiMessage,
              ],
            }
          : chat
      )
    );

  } catch (err) {

    console.error("SmaXTify.AI Error:", err);

    let errorText =
      "❌ Unable to contact SmaXTify.AI.";

    if (err.response?.data?.message) {

      errorText = `❌ ${err.response.data.message}`;

    }

    const errorMessage = {
      role: "assistant",
      text: errorText,
      time: new Date(),
    };

    setChats(prev =>
      prev.map(chat =>
        chat._id === currentChatId
          ? {
              ...chat,
              messages: [
                ...chat.messages,
                errorMessage,
              ],
            }
          : chat
      )
    );

  } finally {

    setLoading(false);

  }

};

/* ==========================
    Keyboard
========================== */

const handleKeyDown = (e) => {

  if (e.key === "Enter" && !e.shiftKey) {

    e.preventDefault();

    sendMessage();

  }

};

return (
  <div className="smaxtify-layout">

    <ChatSidebar
      chats={chats}
      currentChatId={currentChatId}
      createNewChat={createNewChat}
      selectChat={selectChat}
      deleteChat={deleteChat}
    />

    <div className="smaxtify-container">

      <ChatHeader
        clearChat={clearChat}
      />

      {currentChat ? (

        <>

          <ChatMessages
            messages={currentChat.messages || []}
            loading={loading}
            bottomRef={bottomRef}
          />

          <ChatInput
            input={input}
            setInput={setInput}
            sendMessage={sendMessage}
            handleKeyDown={handleKeyDown}
            loading={loading}
          />

        </>

      ) : (

        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            color: "#888",
            fontSize: "18px",
            gap: "10px",
          }}
        >

          <h2>SmaXTify.AI</h2>

          <p>Select a chat or create a new conversation.</p>

          <button
            className="new-chat-btn"
            onClick={createNewChat}
          >
            + New Chat
          </button>

        </div>

      )}

    </div>

  </div>
);

}