import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  signNDA,
  checkAccess,
  getMySignedNDAs,
  checkNDAStatus,
  getAllNDAs,
} from "../controllers/ndaController.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Investor NDA routes
router.post("/sign", signNDA);
router.get("/check/:startupId", checkAccess);
router.get("/my-ndas", getMySignedNDAs);
router.get("/status/:startupId", checkNDAStatus);

// Admin/debug route
router.get("/all", getAllNDAs);

export default router;