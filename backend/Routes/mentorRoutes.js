import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  saveMentorProfile,
  getMentorProfile,
  getAllMentors,
  getMentorById,
  requestMentorship,
  getMyRequests,
  getPendingRequests,
  getActiveMentees,
  acceptRequest,
  rejectRequest,
  completeSession,
  getMentorByUserId
} from "../controllers/mentorController.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// ============ Mentor Profile Routes ============
router.post("/profile", authorize("mentor"), saveMentorProfile);
router.get("/profile", authorize("mentor"), getMentorProfile);
// Add this route - get mentor by user ID (not profile ID)
router.get("/user/:userId", getMentorByUserId);

// ============ Public Mentor Routes (for entrepreneurs) ============
router.get("/all", getAllMentors);

// IMPORTANT: Specific routes MUST come before parameterized routes
router.get("/pending-requests", authorize("mentor"), getPendingRequests);
router.get("/active-mentees", authorize("mentor"), getActiveMentees);
router.get("/my-requests", authorize("entrepreneur"), getMyRequests);

// Parameterized route - MUST be LAST
router.get("/:id", getMentorById);

// ============ Mentorship Request Routes ============
router.post("/request", authorize("entrepreneur"), requestMentorship);
router.put("/accept/:requestId", authorize("mentor"), acceptRequest);
router.put("/reject/:requestId", authorize("mentor"), rejectRequest);
router.put("/complete/:requestId", completeSession);

export default router;