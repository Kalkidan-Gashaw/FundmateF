import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  createStartupProfile,
  getMyStartup,
  updateStartupProfile,

  findInvestors,
  searchInvestors,
  getInvestorById,
  getInterestedInvestors
} from "../controllers/entrepreneurController.js";

const router = express.Router();

router.use(protect);
router.use(authorize("entrepreneur"));

// Startup routes
router.post("/startup", createStartupProfile);
router.get("/startup", getMyStartup);
router.put("/startup/:id", updateStartupProfile);


// Investor discovery routes
router.get("/investors", findInvestors);
router.get("/investors/search", searchInvestors);
router.get("/investors/:id", getInvestorById);
router.get('/interested-investors', getInterestedInvestors);

export default router;