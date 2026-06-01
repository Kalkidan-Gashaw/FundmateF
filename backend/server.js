import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import {
  sequelize,
  User,
  StartupProfile,
  InvestorProfile,
  Document,
  NDA,
  MentorProfile,
  MentorshipRequest,
  Message,
} from "./models/index.js";
import authRoutes from "./Routes/authRoutes.js";
import entrepreneurRoutes from "./Routes/entrepreneurRoutes.js";
import investorRoutes from "./Routes/investorRoutes.js";
import ndaRoutes from "./Routes/ndaRoutes.js";
import mentorRoutes from "./Routes/mentorRoutes.js";
import chatRoutes from "./Routes/chatRoutes.js";

import resourceRoutes from "./Routes/resourceRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import adminRoutes from "./Routes/adminRoutes.js";
import aiRoutes from "./Routes/aiRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Socket.IO setup for real-time chat
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
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

  // Handle sending message via socket by notifying receiver only
  socket.on("send-message", (data) => {
    const { senderId, receiverId, message, id, createdAt } = data;
    console.log(`Socket message from ${senderId} to ${receiverId}: ${message}`);

    const receiverSocketId = connectedUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("new-message", {
        id,
        senderId,
        receiverId,
        message,
        createdAt,
      });
      console.log(`Message delivered to ${receiverId}`);
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
  socket.on("mark-read", async (data) => {
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
        },
      );

      // Notify sender that messages were read
      const senderSocketId = connectedUsers.get(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messages-read", { byUser: receiverId });
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
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

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/entrepreneur", entrepreneurRoutes);
app.use("/api/investor", investorRoutes);
app.use("/api/nda", ndaRoutes);
app.use("/api/mentor", mentorRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/admin", adminRoutes);
import notificationRoutes from "./Routes/notificationRoutes.js";

app.use("/api/notifications", notificationRoutes);
app.use("/api/ai", aiRoutes);
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
