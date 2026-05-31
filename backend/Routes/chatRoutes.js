import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  sendMessage,
  getConversation,
  getConversations,
  markAsRead,
  getUnreadCount,
  markMessagesAsRead
} from '../controllers/chatController.js';

const router = express.Router();

// All chat routes require authentication
router.use(protect);

// Send a message
router.post('/send', sendMessage);

// Get all conversations for current user
router.get('/conversations', getConversations);

// Get conversation with a specific user
router.get('/conversation/:userId', getConversation);

// Mark message as read
router.put('/read/:messageId', markAsRead);

// Get unread message count
router.get('/unread-count', getUnreadCount);
router.put('/mark-read/:userId', markMessagesAsRead);

export default router;