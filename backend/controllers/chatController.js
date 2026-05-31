import { Op } from 'sequelize';
import User from '../models/User.js';
import Message from '../models/Message.js';

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user.id;

    if (!receiverId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID and message are required',
      });
    }

    // Verify receiver exists
    const receiver = await User.findByPk(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found',
      });
    }

    // Don't allow sending to self
    if (senderId === receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send message to yourself',
      });
    }

    // Create message in database
    const newMessage = await Message.create({
      senderId,
      receiverId,
      message,
      isRead: false,
    });

    // Get sender info
    const sender = await User.findByPk(senderId, {
      attributes: ['id', 'name', 'email', 'role'],
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        id: newMessage.id,
        senderId: newMessage.senderId,
        receiverId: newMessage.receiverId,
        message: newMessage.message,
        isRead: newMessage.isRead,
        createdAt: newMessage.createdAt,
        sender: sender,
      },
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get conversation between two users
export const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;

    // Get messages between the two users
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: currentUserId, receiverId: userId },
          { senderId: userId, receiverId: currentUserId },
        ],
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'role'],
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name', 'email', 'role'],
        },
      ],
      order: [['createdAt', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Mark unread messages as read
    await Message.update(
      { isRead: true },
      {
        where: {
          senderId: userId,
          receiverId: currentUserId,
          isRead: false,
        },
      }
    );

    // Get other user details
    const otherUser = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'role'],
    });

    res.status(200).json({
      success: true,
      data: {
        messages,
        otherUser,
      },
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all conversations for current user
export const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Find all unique users that current user has chatted with
    const sentToUsers = await Message.findAll({
      where: { senderId: currentUserId },
      attributes: ['receiverId'],
      group: ['receiverId'],
    });

    const receivedFromUsers = await Message.findAll({
      where: { receiverId: currentUserId },
      attributes: ['senderId'],
      group: ['senderId'],
    });

    const userIds = new Set();
    sentToUsers.forEach(msg => userIds.add(msg.receiverId));
    receivedFromUsers.forEach(msg => userIds.add(msg.senderId));

    if (userIds.size === 0) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    // Fetch user details
    const users = await User.findAll({
      where: { id: Array.from(userIds) },
      attributes: ['id', 'name', 'email', 'role'],
    });

    // Get last message and unread count for each conversation
    const conversations = [];
    for (const user of users) {
      // Get last message
      const lastMessage = await Message.findOne({
        where: {
          [Op.or]: [
            { senderId: currentUserId, receiverId: user.id },
            { senderId: user.id, receiverId: currentUserId },
          ],
        },
        order: [['createdAt', 'DESC']],
      });

      // Get unread count
      const unreadCount = await Message.count({
        where: {
          senderId: user.id,
          receiverId: currentUserId,
          isRead: false,
        },
      });

      conversations.push({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        lastMessage: lastMessage?.message || '',
        lastMessageTime: lastMessage?.createdAt || null,
        unreadCount,
      });
    }

    // Sort by last message time (most recent first)
    conversations.sort((a, b) => {
      if (!a.lastMessageTime) return 1;
      if (!b.lastMessageTime) return -1;
      return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
    });

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Mark a single message as read
export const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user.id;

    const message = await Message.findByPk(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Only the receiver can mark as read
    if (message.receiverId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'You can only mark your own messages as read',
      });
    }

    await message.update({ isRead: true });

    res.status(200).json({
      success: true,
      message: 'Message marked as read',
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get total unread message count for current user
export const getUnreadCount = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const unreadCount = await Message.count({
      where: {
        receiverId: currentUserId,
        isRead: false,
      },
    });

    res.status(200).json({
      success: true,
      data: { unreadCount },
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Mark all messages from a specific user as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    await Message.update(
      { isRead: true },
      {
        where: {
          senderId: userId,
          receiverId: currentUserId,
          isRead: false,
        },
      }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};