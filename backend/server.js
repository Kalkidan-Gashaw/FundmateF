import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import { sequelize, User, StartupProfile, InvestorProfile, Document, NDA, MentorProfile, MentorshipRequest, Message } from "./models/index.js";
import authRoutes from "./routes/authRoutes.js";
import entrepreneurRoutes from "./routes/entrepreneurRoutes.js";
import investorRoutes from "./routes/investorRoutes.js";
import ndaRoutes from "./routes/ndaRoutes.js";
import mentorRoutes from "./routes/mentorRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Socket.IO setup for real-time chat
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  },
});

// Store connected users
const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // User joins with their user ID
  socket.on("user-connected", (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} connected with socket ${socket.id}`);
    console.log("Connected users:", Array.from(connectedUsers.keys()));
  });

  // Handle sending message
  socket.on("send-message", async (data) => {
    const { senderId, receiverId, message } = data;
    console.log(`Message from ${senderId} to ${receiverId}: ${message}`);

    try {
      // Store message in database
      const newMessage = await Message.create({
        senderId,
        receiverId,
        message,
        isRead: false,
      });

      // Send real-time to receiver if online
      const receiverSocketId = connectedUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("new-message", {
          id: newMessage.id,
          senderId,
          message,
          createdAt: newMessage.createdAt,
        });
        console.log(`Message delivered to ${receiverId}`);
      }

      // Confirm to sender
      socket.emit("message-sent", {
        success: true,
        data: newMessage,
      });
    } catch (error) {
      console.error("Error saving message:", error);
      socket.emit("message-error", { error: error.message });
    }
  });

  // Handle typing indicator
  socket.on("typing", (data) => {
    const { receiverId, senderId, isTyping } = data;
    const receiverSocketId = connectedUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("user-typing", {
        userId: senderId,
        isTyping,
      });
    }
  });

  // Handle mark as read
 socket.on('mark-read', async (data) => {
  const { senderId, receiverId } = data;
  try {
    await Message.update(
      { isRead: true },
      {
        where: {
          senderId: senderId,
          receiverId: receiverId,
          isRead: false,
        },
      }
    );
    
    // Notify sender that messages were read
    const senderSocketId = connectedUsers.get(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit('messages-read', { byUser: receiverId });
    }
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
});

  // Handle disconnect
  socket.on("disconnect", () => {
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/entrepreneur", entrepreneurRoutes);
app.use("/api/investor", investorRoutes);
app.use("/api/nda", ndaRoutes);
app.use("/api/mentor", mentorRoutes);
app.use("/api/chat", chatRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "FundMate API is running" });
});

// Sync database
const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected");
    
    await sequelize.sync({ alter: true });
    console.log("Database synced");
  } catch (error) {
    console.error("Database error:", error);
  }
};

syncDatabase();

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO server is ready for real-time chat`);
});