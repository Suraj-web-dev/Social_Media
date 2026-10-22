import express from 'express';
import {
  generateCaption,
  chatWithPingAIHandler,
  getSmartReplies,
} from '../controllers/ai.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import upload from '../../configs/multer.js';

const router = express.Router();

// Generate AI captions & hashtags (supports optional single image)
router.post('/caption', protect, upload.single('image'), generateCaption);

// Chat with PingAI (DM AI Companion)
router.post('/chat', protect, chatWithPingAIHandler);

// Generate 1-Tap AI smart replies for comments & chat
router.post('/smart-replies', protect, getSmartReplies);

export default router;
