import express from "express";
import {
  getUserData,
  updateUserData,
  followUnfollowUser,
  getDiscoverUsers,
  getUserConnections,
} from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import upload from "../../configs/multer.js";

const router = express.Router();

// Get logged-in user connections, followers, following
router.get("/connections/all", protect, getUserConnections);

// Get logged-in user data
router.get("/data", protect, getUserData);
router.get("/me", protect, getUserData);

// Update user profile data (supports profile_picture and cover_photo file uploads)
router.put(
  "/update",
  protect,
  upload.fields([
    { name: "profile_picture", maxCount: 1 },
    { name: "cover_photo", maxCount: 1 },
  ]),
  updateUserData
);

// Discover suggested users
router.get("/discover", protect, getDiscoverUsers);

// Follow / Unfollow user by ID
router.post("/follow/:id", protect, followUnfollowUser);

// Get user data by ID or username
router.get("/:id", protect, getUserData);

export default router;
