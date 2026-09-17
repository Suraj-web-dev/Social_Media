import Story from "../models/Story.model.js";
import imagekit from "../../configs/imagekit.js";

// @desc    Create a new story
// @route   POST /api/story/create
// @access  Private
export const createStory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { content, background_color, media_type } = req.body || {};

    let mediaUrl = "";
    let detectedType = media_type || "text";

    // Handle single media file upload via Multer to ImageKit
    if (req.file) {
      if (imagekit) {
        try {
          const isVideo = req.file.mimetype.startsWith("video/");
          detectedType = isVideo ? "video" : "image";

          const uploadRes = await imagekit.upload({
            file: req.file.buffer,
            fileName: `story_${userId}_${Date.now()}_${req.file.originalname}`,
            folder: isVideo ? "/stories/videos" : "/stories/images",
          });

          mediaUrl = uploadRes.url;
        } catch (imgErr) {
          console.error("ImageKit story upload error:", imgErr.message);
        }
      }
    }

    // Validation: must have either text content or media
    if (!content?.trim() && !mediaUrl) {
      return res.status(400).json({
        success: false,
        message: "Story must contain text or a photo/video.",
      });
    }

    const story = await Story.create({
      user: userId,
      content: content ? content.trim() : "",
      media_url: mediaUrl,
      media_type: mediaUrl ? detectedType : "text",
      background_color: background_color || "#4f46e5",
      views: [],
    });

    const populatedStory = await Story.findById(story._id).populate(
      "user",
      "full_name username profile_picture"
    );

    return res.status(201).json({
      success: true,
      message: "Story shared successfully.",
      story: populatedStory,
    });
  } catch (error) {
    console.error("createStory error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create story.",
    });
  }
};

// @desc    Get active feed stories (last 24 hours)
// @route   GET /api/story/feed
// @access  Private
export const getFeedStories = async (req, res) => {
  try {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const stories = await Story.find({
      createdAt: { $gte: last24Hours },
    })
      .sort({ createdAt: -1 })
      .populate("user", "full_name username profile_picture");

    return res.status(200).json({
      success: true,
      stories,
    });
  } catch (error) {
    console.error("getFeedStories error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch stories.",
    });
  }
};

// @desc    Delete story
// @route   DELETE /api/story/:id
// @access  Private
export const deleteStory = async (req, res) => {
  try {
    const userId = req.user._id;
    const storyId = req.params.id;

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found.",
      });
    }

    if (story.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this story.",
      });
    }

    await Story.findByIdAndDelete(storyId);

    return res.status(200).json({
      success: true,
      message: "Story deleted successfully.",
      storyId,
    });
  } catch (error) {
    console.error("deleteStory error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete story.",
    });
  }
};

