import Post from "../models/Post.model.js";
import User from "../models/User.model.js";
import imagekit from "../../configs/imagekit.js";
import { createNotification } from "./notification.controller.js";

// @desc    Create a new post
// @route   POST /api/post/create
// @access  Private
export const createPost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { content, privacy, location, feeling, target_circle, circleId } =
      req.body || {};

    const imageUrls = [];
    const videoUrls = [];

    // Handle uploaded files via Multer to ImageKit
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        if (imagekit) {
          try {
            const isVideo = file.mimetype.startsWith("video/");
            const uploadRes = await imagekit.upload({
              file: file.buffer,
              fileName: `post_${userId}_${Date.now()}_${file.originalname}`,
              folder: isVideo ? "/posts/videos" : "/posts/images",
            });

            if (isVideo) {
              videoUrls.push(uploadRes.url);
            } else {
              imageUrls.push(uploadRes.url);
            }
          } catch (uploadErr) {
            console.error("ImageKit post media upload error:", uploadErr.message);
          }
        }
      }
    }

    // Check if at least text or media is provided
    if (!content?.trim() && imageUrls.length === 0 && videoUrls.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Post cannot be empty. Please provide text or media.",
      });
    }

    const targetCircleId = target_circle || circleId || null;
    const postPrivacy = targetCircleId ? "Circle" : privacy || "Public";

    const post = await Post.create({
      user: userId,
      content: content ? content.trim() : "",
      image_urls: imageUrls,
      video_urls: videoUrls,
      privacy: postPrivacy,
      target_circle: targetCircleId,
      location: location || "",
      feeling: feeling || "",
      likes_count: [],
      comments: [],
    });

    const populatedPost = await Post.findById(post._id)
      .populate("user", "full_name username profile_picture is_verified")
      .populate("target_circle", "name icon color description members");

    return res.status(201).json({
      success: true,
      message: "Post published successfully.",
      post: populatedPost,
    });
  } catch (error) {
    console.error("createPost error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create post.",
    });
  }
};

// @desc    Get all feed posts (Recent first: createdAt -1)
// @route   GET /api/post/feed
// @access  Private
export const getFeedPosts = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Fetch all posts populated
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("user", "full_name username profile_picture is_verified")
      .populate("target_circle", "name icon color description members")
      .populate("likes_count", "full_name username profile_picture is_verified bio")
      .populate("comments.user", "full_name username profile_picture is_verified");

    // Filter posts for Circle Audience privacy:
    // - Author can always see their own post
    // - If privacy is Public/Connections, anyone/followers can see it
    // - If privacy is Circle, only members of target_circle and the author can see it
    const visiblePosts = posts.filter((post) => {
      const isAuthor =
        post.user?._id?.toString() === currentUserId.toString();
      if (isAuthor) return true;

      if (post.privacy === "Circle" && post.target_circle) {
        const members = post.target_circle.members || [];
        const isMember = members.some(
          (m) =>
            (typeof m === "object" ? m._id?.toString() : m.toString()) ===
            currentUserId.toString()
        );
        return isMember;
      }

      return true;
    });

    return res.status(200).json({
      success: true,
      posts: visiblePosts,
    });
  } catch (error) {
    console.error("getFeedPosts error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch feed posts.",
    });
  }
};

// @desc    Get all video reels (Recent first)
// @route   GET /api/post/reels
// @access  Private
export const getReels = async (req, res) => {
  try {
    const reels = await Post.find({
      video_urls: { $exists: true, $not: { $size: 0 } },
    })
      .sort({ createdAt: -1 })
      .populate("user", "full_name username profile_picture is_verified")
      .populate("likes_count", "full_name username profile_picture is_verified bio")
      .populate("comments.user", "full_name username profile_picture is_verified");

    return res.status(200).json({
      success: true,
      reels,
    });
  } catch (error) {
    console.error("getReels error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch reels.",
    });
  }
};

// @desc    Get posts of a specific user
// @route   GET /api/post/user/:id
// @access  Private
export const getUserPosts = async (req, res) => {
  try {
    const { id } = req.params;
    let targetUserId = id;

    // Check if id is username or ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      const user = await User.findOne({ username: id.toLowerCase() });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }
      targetUserId = user._id;
    }

    const posts = await Post.find({ user: targetUserId })
      .sort({ createdAt: -1 })
      .populate("user", "full_name username profile_picture is_verified")
      .populate("target_circle", "name icon color description members")
      .populate("likes_count", "full_name username profile_picture is_verified bio")
      .populate("comments.user", "full_name username profile_picture is_verified");

    return res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    console.error("getUserPosts error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch user posts.",
    });
  }
};

// @desc    Like / Unlike a post
// @route   POST /api/post/like/:id
// @access  Private
export const likeUnlikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    const isLiked = post.likes_count.some(
      (id) => (typeof id === "object" ? id._id.toString() : id.toString()) === userId.toString()
    );

    if (isLiked) {
      post.likes_count = post.likes_count.filter(
        (id) => (typeof id === "object" ? id._id.toString() : id.toString()) !== userId.toString()
      );
    } else {
      post.likes_count.push(userId);
      // Trigger Notification to Post Owner
      if (post.user) {
        createNotification({
          recipient: post.user,
          sender: userId,
          type: "like_post",
          post: post._id,
        });
      }
    }

    await post.save();

    const populatedPost = await Post.findById(postId).populate(
      "likes_count",
      "full_name username profile_picture is_verified bio"
    );

    return res.status(200).json({
      success: true,
      likes_count: populatedPost.likes_count,
      isLiked: !isLiked,
    });
  } catch (error) {
    console.error("likeUnlikePost error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to toggle like.",
    });
  }
};

// @desc    Get users who liked a post
// @route   GET /api/post/likes/:id
// @access  Private
export const getPostLikes = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id).populate(
      "likes_count",
      "full_name username profile_picture is_verified bio"
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    return res.status(200).json({
      success: true,
      likes: post.likes_count || [],
    });
  } catch (error) {
    console.error("getPostLikes error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch likes.",
    });
  }
};

// @desc    Add comment to a post
// @route   POST /api/post/comment/:id
// @access  Private
export const addComment = async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = req.params.id;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required.",
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    post.comments.push({
      user: userId,
      text: text.trim(),
      createdAt: new Date(),
    });

    await post.save();

    // Trigger Notification to Post Owner
    if (post.user) {
      createNotification({
        recipient: post.user,
        sender: userId,
        type: "comment_post",
        post: post._id,
        text: text.trim(),
      });
    }

    const updatedPost = await Post.findById(postId)
      .populate("user", "full_name username profile_picture is_verified")
      .populate("comments.user", "full_name username profile_picture is_verified");

    return res.status(200).json({
      success: true,
      message: "Comment added successfully.",
      comments: updatedPost.comments,
    });
  } catch (error) {
    console.error("addComment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to add comment.",
    });
  }
};

// @desc    Delete comment from a post
// @route   DELETE /api/post/comment/:postId/:commentId
// @access  Private
export const deleteComment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { postId, commentId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found.",
      });
    }

    // Allow deletion if user is comment creator OR post owner
    const isCommentAuthor = comment.user.toString() === userId.toString();
    const isPostAuthor = post.user.toString() === userId.toString();

    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this comment.",
      });
    }

    post.comments.pull(commentId);
    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate("user", "full_name username profile_picture is_verified")
      .populate("comments.user", "full_name username profile_picture is_verified");

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully.",
      comments: updatedPost.comments,
    });
  } catch (error) {
    console.error("deleteComment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete comment.",
    });
  }
};

// @desc    Like / Unlike a comment
// @route   POST /api/post/comment/like/:postId/:commentId
// @access  Private
export const likeUnlikeComment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { postId, commentId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found.",
      });
    }

    if (!comment.likes) {
      comment.likes = [];
    }

    const alreadyLiked = comment.likes.some(
      (id) => id.toString() === userId.toString()
    );

    if (alreadyLiked) {
      comment.likes = comment.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      comment.likes.push(userId);
      // Trigger Notification to Comment Author
      if (comment.user) {
        createNotification({
          recipient: comment.user,
          sender: userId,
          type: "like_comment",
          post: post._id,
          commentId: comment._id,
        });
      }
    }

    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate("user", "full_name username profile_picture is_verified")
      .populate("comments.user", "full_name username profile_picture is_verified");

    return res.status(200).json({
      success: true,
      isLiked: !alreadyLiked,
      comments: updatedPost.comments,
    });
  } catch (error) {
    console.error("likeUnlikeComment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to like/unlike comment.",
    });
  }
};

// @desc    Edit a comment
// @route   PUT /api/post/comment/:postId/:commentId
// @access  Private
export const editComment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { postId, commentId } = req.params;
    const { text } = req.body || {};

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment text cannot be empty.",
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found.",
      });
    }

    // Only comment author can edit
    if (comment.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own comment.",
      });
    }

    comment.text = text.trim();
    comment.updatedAt = new Date();
    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate("user", "full_name username profile_picture is_verified")
      .populate("comments.user", "full_name username profile_picture is_verified");

    return res.status(200).json({
      success: true,
      message: "Comment updated successfully.",
      comments: updatedPost.comments,
    });
  } catch (error) {
    console.error("editComment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to edit comment.",
    });
  }
};

// @desc    Delete post (only post author can delete)
// @route   DELETE /api/post/:id
// @access  Private
export const deletePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    if (post.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this post.",
      });
    }

    await Post.findByIdAndDelete(postId);

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully.",
      postId,
    });
  } catch (error) {
    console.error("deletePost error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete post.",
    });
  }
};

// @desc    Toggle Bookmark / Save Post
// @route   POST /api/post/bookmark/:id
// @access  Private
export const bookmarkPost = async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.saved_posts) {
      user.saved_posts = [];
    }

    const isBookmarked = user.saved_posts.some(
      (id) => (typeof id === "object" ? id._id.toString() : id.toString()) === postId.toString()
    );

    if (isBookmarked) {
      user.saved_posts = user.saved_posts.filter(
        (id) => (typeof id === "object" ? id._id.toString() : id.toString()) !== postId.toString()
      );
    } else {
      user.saved_posts.push(postId);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      isBookmarked: !isBookmarked,
      saved_posts: user.saved_posts,
      message: !isBookmarked ? "Post bookmarked." : "Bookmark removed.",
    });
  } catch (error) {
    console.error("bookmarkPost error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to toggle bookmark.",
    });
  }
};

// @desc    Get all bookmarked / saved posts of logged-in user
// @route   GET /api/post/saved
// @access  Private
export const getSavedPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate({
      path: "saved_posts",
      options: { sort: { createdAt: -1 } },
      populate: [
        { path: "user", select: "full_name username profile_picture is_verified" },
        { path: "likes_count", select: "full_name username profile_picture is_verified bio" },
        { path: "comments.user", select: "full_name username profile_picture is_verified" },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const validSavedPosts = (user.saved_posts || []).filter((p) => p && p._id);

    return res.status(200).json({
      success: true,
      posts: validSavedPosts,
    });
  } catch (error) {
    console.error("getSavedPosts error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch saved posts.",
    });
  }
};

// @desc    Get a single post/reel by ID
// @route   GET /api/post/single/:id
// @access  Private
export const getPostById = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId)
      .populate("user", "full_name username profile_picture is_verified")
      .populate("likes_count", "full_name username profile_picture is_verified bio")
      .populate("comments.user", "full_name username profile_picture is_verified")
      .populate("target_circle", "name icon color");

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found or has been deleted.",
      });
    }

    return res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    console.error("getPostById error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch post.",
    });
  }
};


