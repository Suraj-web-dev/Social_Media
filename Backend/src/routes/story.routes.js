import express from "express";
import {
  createStory,
  getFeedStories,
  deleteStory,
} from "../controllers/story.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import upload from "../../configs/multer.js";

const router = express.Router();

// Get active stories (24h)
router.get("/feed", protect, getFeedStories);

// Create new story (supports text mode or photo/video file upload)
router.post("/create", protect, upload.single("media"), createStory);

// Delete story
router.delete("/:id", protect, deleteStory);

export default router;

