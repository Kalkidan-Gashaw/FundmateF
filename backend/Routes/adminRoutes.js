import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  getAllUsers,
  getUserById,
  approveUser,
  suspendUser,
  reactivateUser,
  deleteUser,
  getDashboardStats,
  getAllStartups,
  updateStartupStatus,
  getAllNDAs,
  getNDAById,
  revokeNDA,
  getNDAStats,
  getAnalytics,
  getAllMentorships,
  getMentorshipById,
  updateMentorshipStatus,
  deleteMentorship,
  sendBroadcast,
  getAllBroadcasts,
  getBroadcastById,
  deleteBroadcast,
  getSettings,
  createSetting,
  updateSetting,
  deleteSetting,
  getNDATemplate,
  updateNDATemplate,
  initializeSettings,
} from "../controllers/adminController.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize("admin"));

// Dashboard
router.get("/stats", getDashboardStats);
router.get("/analytics", getAnalytics);

// User management
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id/approve", approveUser);
router.put("/users/:id/suspend", suspendUser);
router.put("/users/:id/reactivate", reactivateUser);
router.delete("/users/:id", deleteUser);

// Startup management
router.get("/startups", getAllStartups);
router.put("/startups/:id/status", updateStartupStatus);

// NDA management
router.get("/ndas", getAllNDAs);
router.get("/ndas/stats", getNDAStats);
router.get("/ndas/:id", getNDAById);
router.put("/ndas/:id/revoke", revokeNDA);

// Mentorship management
router.get("/mentorships", getAllMentorships);
router.get("/mentorships/:id", getMentorshipById);
router.put("/mentorships/:id/status", updateMentorshipStatus);
router.delete("/mentorships/:id", deleteMentorship);

// Broadcast management
router.post("/broadcasts", sendBroadcast);
router.get("/broadcasts", getAllBroadcasts);
router.get("/broadcasts/:id", getBroadcastById);
router.delete("/broadcasts/:id", deleteBroadcast);

// Settings management - SPECIFIC ROUTES MUST COME BEFORE PARAMETERIZED ROUTES
router.get("/settings/nda-template", getNDATemplate);
router.put("/settings/nda-template", updateNDATemplate);
router.post("/settings/initialize", initializeSettings);
router.get("/settings", getSettings);
router.post("/settings", createSetting);
router.put("/settings/:id", updateSetting);
router.delete("/settings/:id", deleteSetting);

export default router;