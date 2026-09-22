import express from "express";
import {
  createStory,
  getFeedStories,
  viewStory,
  likeStory,
  replyToStory,
  getStoryViewers,
  deleteStory,
} from "../controllers/story.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import upload from "../../configs/multer.js";

const router = express.Router();

// 1. Get active stories (last 24 hours)
router.get("/feed", protect, getFeedStories);

// 2. Create new story (supports text mode OR single/multiple photo/video uploads up to 10 files)
router.post("/create", protect, upload.array("media", 10), createStory);

// 3. Mark story as viewed
router.post("/:id/view", protect, viewStory);

// 4. Like / Unlike story
router.post("/:id/like", protect, likeStory);

// 5. Reply to story via DM
router.post("/:id/reply", protect, replyToStory);

// 6. Get viewers list (only for story author)
router.get("/:id/viewers", protect, getStoryViewers);

// 7. Delete story
router.delete("/:id", protect, deleteStory);

export default router;
