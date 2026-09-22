import Story from "../models/Story.model.js";
import Message from "../models/Message.model.js";
import Notification from "../models/Notification.model.js";
import imagekit from "../../configs/imagekit.js";

// Helper function to upload a buffer to ImageKit with Data URI fallback
const uploadBufferToMedia = async (buffer, originalname, mimetype, userId) => {
  const isVideo = mimetype?.startsWith("video/");
  const detectedType = isVideo ? "video" : "image";

  if (imagekit) {
    try {
      const uploadRes = await imagekit.upload({
        file: buffer,
        fileName: `story_${userId}_${Date.now()}_${originalname || "media"}`,
        folder: isVideo ? "/stories/videos" : "/stories/images",
      });
      if (uploadRes && uploadRes.url) {
        return {
          url: uploadRes.url,
          type: detectedType,
        };
      }
    } catch (err) {
      console.warn("ImageKit story upload warning, fallback to Data URI:", err.message);
    }
  }

  // Fallback to Data URI
  const base64 = buffer.toString("base64");
  const dataUri = `data:${mimetype || (isVideo ? "video/mp4" : "image/jpeg")};base64,${base64}`;
  return {
    url: dataUri,
    type: detectedType,
  };
};

// @desc    Create new story (supports single or multiple media, filters, captions, stickers, text mode)
// @route   POST /api/story/create
// @access  Private
export const createStory = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      content,
      caption,
      background_color,
      font_style,
      filter,
      music,
      location,
      target_circle,
      media_type,
    } = req.body || {};

    const files = req.files || (req.file ? [req.file] : []);
    const createdStories = [];

    // Parse music if sent as JSON string
    let parsedMusic = { title: "", artist: "" };
    if (music) {
      try {
        parsedMusic = typeof music === "string" ? JSON.parse(music) : music;
      } catch (e) {
        parsedMusic = { title: String(music), artist: "" };
      }
    }

    if (files && files.length > 0) {
      // Multiple or single media upload
      for (const file of files) {
        try {
          const uploadResult = await uploadBufferToMedia(
            file.buffer,
            file.originalname,
            file.mimetype,
            userId
          );

          if (uploadResult?.url) {
            const newStory = await Story.create({
              user: userId,
              media_url: uploadResult.url,
              media_type: uploadResult.type,
              caption: caption ? caption.trim() : "",
              filter: filter || "normal",
              music: parsedMusic,
              location: location || "",
              target_circle: target_circle || "all",
              background_color: background_color || "#4f46e5",
              views: [],
              likes: [],
            });

            const populated = await Story.findById(newStory._id)
              .populate("user", "full_name username profile_picture is_verified")
              .populate("views.user", "full_name username profile_picture is_verified")
              .populate("likes", "full_name username profile_picture is_verified");

            createdStories.push(populated);
          }
        } catch (uploadErr) {
          console.error("Story file processing error:", uploadErr);
        }
      }
    } else if (content && content.trim()) {
      // Text story
      const newStory = await Story.create({
        user: userId,
        content: content.trim(),
        media_type: "text",
        background_color: background_color || "#4f46e5",
        font_style: font_style || "modern",
        music: parsedMusic,
        location: location || "",
        target_circle: target_circle || "all",
        views: [],
        likes: [],
      });

      const populated = await Story.findById(newStory._id)
        .populate("user", "full_name username profile_picture is_verified")
        .populate("views.user", "full_name username profile_picture is_verified")
        .populate("likes", "full_name username profile_picture is_verified");

      createdStories.push(populated);
    } else {
      return res.status(400).json({
        success: false,
        message: "Story must contain text or at least one photo/video.",
      });
    }

    if (createdStories.length === 0) {
      return res.status(500).json({
        success: false,
        message: "Failed to process story.",
      });
    }

    return res.status(201).json({
      success: true,
      message: `${createdStories.length} ${createdStories.length > 1 ? "stories" : "story"} shared successfully.`,
      story: createdStories[0],
      stories: createdStories,
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
      .populate("user", "full_name username profile_picture is_verified")
      .populate("views.user", "full_name username profile_picture is_verified")
      .populate("likes", "full_name username profile_picture is_verified");

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

// @desc    Record story view (Mark as seen by user)
// @route   POST /api/story/:id/view
// @access  Private
export const viewStory = async (req, res) => {
  try {
    const userId = req.user._id;
    const storyId = req.params.id;

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found or expired.",
      });
    }

    const alreadyViewed = story.views.some(
      (v) => (v.user ? v.user.toString() : v.toString()) === userId.toString()
    );

    if (!alreadyViewed) {
      story.views.push({
        user: userId,
        viewedAt: new Date(),
      });
      await story.save();
    }

    return res.status(200).json({
      success: true,
      storyId,
      viewsCount: story.views.length,
    });
  } catch (error) {
    console.error("viewStory error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to record story view.",
    });
  }
};

// @desc    Toggle like on story
// @route   POST /api/story/:id/like
// @access  Private
export const likeStory = async (req, res) => {
  try {
    const userId = req.user._id;
    const storyId = req.params.id;

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found or expired.",
      });
    }

    const likeIndex = story.likes.findIndex(
      (uid) => (uid._id ? uid._id.toString() : uid.toString()) === userId.toString()
    );

    let isLiked = false;
    if (likeIndex > -1) {
      story.likes.splice(likeIndex, 1);
      isLiked = false;
    } else {
      story.likes.push(userId);
      isLiked = true;

      if (story.user.toString() !== userId.toString()) {
        try {
          await Notification.create({
            sender: userId,
            receiver: story.user,
            type: "like",
            text: "liked your story.",
          });
        } catch (notifErr) {
          console.error("Story like notification error:", notifErr);
        }
      }
    }

    await story.save();

    return res.status(200).json({
      success: true,
      storyId,
      isLiked,
      likesCount: story.likes.length,
    });
  } catch (error) {
    console.error("likeStory error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to like story.",
    });
  }
};

// @desc    Reply to a story via direct message (DM)
// @route   POST /api/story/:id/reply
// @access  Private
export const replyToStory = async (req, res) => {
  try {
    const senderId = req.user._id;
    const storyId = req.params.id;
    const { text, emoji } = req.body;

    const story = await Story.findById(storyId).populate("user");
    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found or expired.",
      });
    }

    const receiverId = story.user._id;
    const messageContent = emoji
      ? `Reacted ${emoji} to your story`
      : `Replying to your story: ${text || ""}`;

    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      text: messageContent,
      media_url: story.media_url || "",
      message_type: story.media_url ? "image" : "text",
    });

    return res.status(201).json({
      success: true,
      message: "Reply sent directly to creator.",
      chatMessage: newMessage,
    });
  } catch (error) {
    console.error("replyToStory error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send story reply.",
    });
  }
};

// @desc    Get viewers list of own story
// @route   GET /api/story/:id/viewers
// @access  Private
export const getStoryViewers = async (req, res) => {
  try {
    const userId = req.user._id;
    const storyId = req.params.id;

    const story = await Story.findById(storyId).populate(
      "views.user",
      "full_name username profile_picture is_verified"
    );

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found or expired.",
      });
    }

    if (story.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the story author can see the viewers list.",
      });
    }

    return res.status(200).json({
      success: true,
      storyId,
      viewers: story.views || [],
      likes: story.likes || [],
    });
  } catch (error) {
    console.error("getStoryViewers error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load viewers list.",
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
