import { Op } from "sequelize";
import User from "../models/User.js";
import Message from "../models/Message.js";
import fs from "fs";
import path from "path";

// Send a text message
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user.id;

    console.log("sendMessage - receiverId:", receiverId, "senderId:", senderId);

    if (!receiverId || !message) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID and message are required",
      });
    }

    const receiver = await User.findByPk(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    if (senderId === receiverId) {
      return res.status(400).json({
        success: false,
        message: "Cannot send message to yourself",
      });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      message,
      isRead: false,
    });

    const sender = await User.findByPk(senderId, {
      attributes: ["id", "name", "email", "role"],
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
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
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Send a file message
export const sendFile = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.id;

    console.log("sendFile - receiverId:", receiverId, "senderId:", senderId);

    if (!receiverId || !req.file) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: "Receiver ID and file are required",
      });
    }

    // Make sure receiverId is a string (not an array)
    const receiverIdStr = Array.isArray(receiverId) ? receiverId[0] : receiverId;

    const receiver = await User.findByPk(receiverIdStr);
    if (!receiver) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    if (senderId === receiverIdStr) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: "Cannot send message to yourself",
      });
    }

    const fileUrl = `/uploads/chat/${req.file.filename}`;
    
    const newMessage = await Message.create({
      senderId,
      receiverId: receiverIdStr,
      message: "",
      fileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      isRead: false,
    });

    const sender = await User.findByPk(senderId, {
      attributes: ["id", "name", "email", "role"],
    });

    res.status(201).json({
      success: true,
      message: "File sent successfully",
      data: {
        id: newMessage.id,
        senderId: newMessage.senderId,
        receiverId: newMessage.receiverId,
        message: newMessage.message,
        fileUrl: newMessage.fileUrl,
        fileName: newMessage.fileName,
        fileSize: newMessage.fileSize,
        fileType: newMessage.fileType,
        isRead: newMessage.isRead,
        createdAt: newMessage.createdAt,
        sender: sender,
      },
    });
  } catch (error) {
    console.error("Error sending file:", error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Download file
export const downloadFile = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findByPk(messageId);
    
    if (!message || !message.fileUrl) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Check if user is part of the conversation
    if (message.senderId !== userId && message.receiverId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to download this file",
      });
    }

    const filePath = path.join(process.cwd(), message.fileUrl);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found on server",
      });
    }

    res.download(filePath, message.fileName);
  } catch (error) {
    console.error("Error downloading file:", error);
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
          as: "sender",
          attributes: ["id", "name", "email", "role"],
        },
        {
          model: User,
          as: "receiver",
          attributes: ["id", "name", "email", "role"],
        },
      ],
      order: [["createdAt", "ASC"]],
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

    const otherUser = await User.findByPk(userId, {
      attributes: ["id", "name", "email", "role"],
    });

    res.status(200).json({
      success: true,
      data: {
        messages,
        otherUser,
      },
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);
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
      attributes: ["receiverId"],
      group: ["receiverId"],
    });

    const receivedFromUsers = await Message.findAll({
      where: { receiverId: currentUserId },
      attributes: ["senderId"],
      group: ["senderId"],
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
      attributes: ["id", "name", "email", "role"],
    });

    // Get last message and unread count for each conversation
    const conversations = [];
    for (const user of users) {
      const lastMessage = await Message.findOne({
        where: {
          [Op.or]: [
            { senderId: currentUserId, receiverId: user.id },
            { senderId: user.id, receiverId: currentUserId },
          ],
        },
        order: [["createdAt", "DESC"]],
      });

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
        lastMessage: lastMessage?.message || (lastMessage?.fileName ? `📎 ${lastMessage.fileName}` : ""),
        lastMessageTime: lastMessage?.createdAt || null,
        unreadCount,
      });
    }

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
    console.error("Error fetching conversations:", error);
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
        message: "Message not found",
      });
    }

    if (message.receiverId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: "You can only mark your own messages as read",
      });
    }

    await message.update({ isRead: true });

    res.status(200).json({
      success: true,
      message: "Message marked as read",
    });
  } catch (error) {
    console.error("Error marking message as read:", error);
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

    const result = await Message.update(
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
      message: "Messages marked as read",
      updatedCount: result[0],
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
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
    console.error("Error fetching unread count:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Edit a message
export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    const existingMessage = await Message.findByPk(messageId);
    
    if (!existingMessage) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (existingMessage.senderId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own messages",
      });
    }

    await existingMessage.update({ message, isEdited: true });

    res.status(200).json({
      success: true,
      message: "Message edited successfully",
      data: existingMessage,
    });
  } catch (error) {
    console.error("Error editing message:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const existingMessage = await Message.findByPk(messageId);
    
    if (!existingMessage) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (existingMessage.senderId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own messages",
      });
    }

    await existingMessage.destroy();

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


