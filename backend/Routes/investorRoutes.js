import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  savePreferences,
  getPreferences,
  updatePreferences,
  findStartups,
  getStartupById,
  searchStartups,
  signNDA,
  getConnectedStartups,
} from "../controllers/investorController.js";

const router = express.Router();

// All routes require authentication and investor role
router.use(protect);
router.use(authorize("investor"));

// ============ Preferences Routes ============
router.post("/preferences", savePreferences);
router.get("/preferences", getPreferences);
router.put("/preferences", updatePreferences);

// ============ Startup Discovery Routes ============
router.get("/startups", findStartups);
router.get("/startups/search", searchStartups);
router.get("/startups/:id", getStartupById);

// ============ NDA Routes ============
router.post("/nda/sign", signNDA);

// ============ Chat/Connection Routes ============
router.get("/connected-startups", getConnectedStartups);

export default router;