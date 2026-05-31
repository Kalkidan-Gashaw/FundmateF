import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  incrementDownloads,
  getMyResources,
} from "../controllers/resourceController.js";

const router = express.Router();

// Public routes (authenticated users can view)
router.get("/", protect, getAllResources);
router.get("/my-resources", protect, getMyResources);
router.get("/:id", protect, getResourceById);
router.put("/:id/download", protect, incrementDownloads);

// Mentor-only routes
router.post("/", protect, authorize("mentor"), createResource);
router.put("/:id", protect, authorize("mentor"), updateResource);
router.delete("/:id", protect, authorize("mentor"), deleteResource);

export default router;