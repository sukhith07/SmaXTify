const Chat = require("../models/Chat");

// Get all chats
exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user.id }).sort({
      updatedAt: -1,
    });

    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create chat
exports.createChat = async (req, res) => {
  try {
    const chat = await Chat.create({
      user: req.user.id,
      title: "New Chat",
      messages: [
        {
          role: "assistant",
          text: "👋 Hello! I'm SmaXTify.AI.",
        },
      ],
    });

    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete chat
exports.deleteChat = async (req, res) => {
  try {
    await Chat.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Save message
exports.addMessage = async (req, res) => {
  try {
    const { role, text } = req.body;

    const chat = await Chat.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!chat) {
      return res.status(404).json({
        message: "Chat not found",
      });
    }

    chat.messages.push({
      role,
      text,
    });

    await chat.save();

    res.json(chat);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Update chat title
exports.updateTitle = async (req, res) => {
  try {
    const { title } = req.body;

    const chat = await Chat.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id,
      },
      {
        title,
      },
      {
        new: true,
      }
    );

    if (!chat) {
      return res.status(404).json({
        message: "Chat not found",
      });
    }

    res.json(chat);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};