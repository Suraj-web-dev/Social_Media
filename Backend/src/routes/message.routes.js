import express from "express";
import {
  sendMessage,
  getMessages,
  getRecentConversations,
} from "../controllers/message.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import upload from "../../configs/multer.js";

const router = express.Router();

// Get recent conversations
router.get("/conversations/recent", protect, getRecentConversations);

// Send message to user (with optional image file attachment)
router.post("/send/:userId", protect, upload.single("media"), sendMessage);

// Get messages in a conversation
router.get("/:userId", protect, getMessages);

export default router;

