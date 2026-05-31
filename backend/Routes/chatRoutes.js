import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../config/upload.js";
import {
  sendMessage,
  sendFile,
  getConversation,
  getConversations,
  markAsRead,
  getUnreadCount,
  markMessagesAsRead,
  downloadFile,
  editMessage,
  deleteMessage,
} from "../controllers/chatController.js";

const router = express.Router();

router.use(protect);

// Message routes
router.post("/send", sendMessage);
router.post("/send-file", upload.single("file"), sendFile);
router.get("/conversations", getConversations);
router.get("/conversation/:userId", getConversation);
router.put("/read/:messageId", markAsRead);
router.put("/mark-read/:userId", markMessagesAsRead);
router.get("/unread-count", getUnreadCount);
router.get("/download/:messageId", downloadFile);
router.put("/message/:messageId", editMessage);
router.delete("/message/:messageId", deleteMessage);

export default router;