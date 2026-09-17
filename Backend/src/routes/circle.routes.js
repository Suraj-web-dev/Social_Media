import express from "express";
import {
  getUserCircles,
  createCircle,
  updateCircle,
  deleteCircle,
  toggleCircleMember,
} from "../controllers/circle.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/my", protect, getUserCircles);
router.post("/create", protect, createCircle);
router.put("/:id", protect, updateCircle);
router.delete("/:id", protect, deleteCircle);
router.post("/:id/toggle-member", protect, toggleCircleMember);

export default router;

