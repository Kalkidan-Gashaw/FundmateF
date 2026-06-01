import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  signNDA,
  checkAccess,
  getMySignedNDAs,
  checkNDAStatus,
  getAllNDAs,
  getEntrepreneurRequests,
  approveRequest,
  rejectRequest,
} from "../controllers/ndaController.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Investor NDA routes
router.post("/sign", signNDA);
router.get("/check/:startupId", checkAccess);
router.get("/my-ndas", getMySignedNDAs);
router.get("/status/:startupId", checkNDAStatus);

// Entrepreneur NDA routes
router.get("/entrepreneur/requests", authorize("entrepreneur"), getEntrepreneurRequests);
router.put("/entrepreneur/approve/:ndaId", authorize("entrepreneur"), approveRequest);
router.put("/entrepreneur/reject/:ndaId", authorize("entrepreneur"), rejectRequest);

// Admin/debug route
router.get("/all", getAllNDAs);

export default router;