import express from "express";
import {
  createPost,
  getFeedPosts,
  getReels,
  getUserPosts,
  likeUnlikePost,
  getPostLikes,
  addComment,
  deleteComment,
  likeUnlikeComment,
  editComment,
  deletePost,
  bookmarkPost,
  getSavedPosts,
  getPostById,
} from "../controllers/post.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import upload from "../../configs/multer.js";

const router = express.Router();

// Get feed posts (recent first)
router.get("/feed", protect, getFeedPosts);

// Get video reels (recent first)
router.get("/reels", protect, getReels);

// Get single post by ID (for shared links)
router.get("/single/:id", protect, getPostById);
router.get("/detail/:id", protect, getPostById);

// Get saved/bookmarked posts of current user
router.get("/saved", protect, getSavedPosts);

// Get users who liked a post
router.get("/likes/:id", protect, getPostLikes);

// Get posts of a specific user
router.get("/user/:id", protect, getUserPosts);

// Create new post (with image/video uploads up to 5 files)
router.post("/create", protect, upload.array("media", 5), createPost);

// Like / Unlike post
router.post("/like/:id", protect, likeUnlikePost);

// Add comment to post
router.post("/comment/:id", protect, addComment);

// Like / Unlike comment
router.post("/comment/like/:postId/:commentId", protect, likeUnlikeComment);

// Edit comment in post
router.put("/comment/:postId/:commentId", protect, editComment);

// Delete comment from post
router.delete("/comment/:postId/:commentId", protect, deleteComment);

// Toggle Bookmark / Save post
router.post("/bookmark/:id", protect, bookmarkPost);

// Delete post (only author)
router.delete("/:id", protect, deletePost);

export default router;
