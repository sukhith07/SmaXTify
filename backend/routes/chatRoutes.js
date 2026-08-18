const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  getChats,
  createChat,
  deleteChat,
  addMessage,
  updateTitle,
} = require("../controllers/chatController");

router.get("/", protect, getChats);

router.post("/", protect, createChat);

router.post("/:id/message", protect, addMessage);

router.put("/:id/title", protect, updateTitle);

router.delete("/:id", protect, deleteChat);

module.exports = router;