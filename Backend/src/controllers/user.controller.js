import User from "../models/User.model.js";
import imagekit from "../../configs/imagekit.js";
import { createNotification } from "./notification.controller.js";

// @desc    Get user data (current user or by ID/username)
// @route   GET /api/user/data or GET /api/user/:id
// @access  Private
export const getUserData = async (req, res) => {
  try {
    const { id } = req.params;
    let query;

    if (id) {
      // Check if id is a valid Mongo ObjectId or a username
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        query = { _id: id };
      } else {
        query = { username: id.toLowerCase() };
      }
    } else {
      // Default to logged-in user
      query = { _id: req.user._id };
    }

    const user = await User.findOne(query)
      .select("-password")
      .populate("followers", "full_name username profile_picture bio")
      .populate("following", "full_name username profile_picture bio")
      .populate("connections", "full_name username profile_picture bio");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("getUserData error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch user data.",
    });
  }
};

// @desc    Update user profile data (with Multer file uploads for ImageKit)
// @route   PUT /api/user/update
// @access  Private
export const updateUserData = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      full_name,
      username,
      bio,
      location,
      profile_picture,
      cover_photo,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Handle username update & uniqueness check
    if (username && username.trim().toLowerCase() !== user.username) {
      const cleanUsername = username.trim().toLowerCase();
      const existingUser = await User.findOne({
        username: cleanUsername,
        _id: { $ne: userId },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Username is already taken. Please choose another.",
        });
      }
      user.username = cleanUsername;
    }

    // 1. Handle Profile Picture upload via Multer (req.files) to ImageKit
    if (req.files && req.files.profile_picture && req.files.profile_picture[0]) {
      const profileFile = req.files.profile_picture[0];
      if (imagekit) {
        try {
          const uploadRes = await imagekit.upload({
            file: profileFile.buffer, // Binary buffer from multer memoryStorage
            fileName: `avatar_${userId}_${Date.now()}_${profileFile.originalname}`,
            folder: "/avatars",
          });
          user.profile_picture = uploadRes.url;
        } catch (imgErr) {
          console.error("ImageKit avatar upload error:", imgErr.message);
        }
      }
    } else if (profile_picture !== undefined && profile_picture !== "") {
      user.profile_picture = profile_picture;
    }

    // 2. Handle Cover Photo upload via Multer (req.files) to ImageKit
    if (req.files && req.files.cover_photo && req.files.cover_photo[0]) {
      const coverFile = req.files.cover_photo[0];
      if (imagekit) {
        try {
          const uploadRes = await imagekit.upload({
            file: coverFile.buffer, // Binary buffer from multer memoryStorage
            fileName: `cover_${userId}_${Date.now()}_${coverFile.originalname}`,
            folder: "/covers",
          });
          user.cover_photo = uploadRes.url;
        } catch (imgErr) {
          console.error("ImageKit cover photo upload error:", imgErr.message);
        }
      }
    } else if (cover_photo !== undefined && cover_photo !== "") {
      user.cover_photo = cover_photo;
    }

    // Update other text fields if provided
    if (full_name !== undefined && full_name.trim() !== "") {
      user.full_name = full_name.trim();
    }
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;

    await user.save();

    // Fetch updated user without password
    const updatedUser = await User.findById(userId)
      .select("-password")
      .populate("followers", "full_name username profile_picture")
      .populate("following", "full_name username profile_picture")
      .populate("connections", "full_name username profile_picture");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("updateUserData error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile data.",
    });
  }
};

// @desc    Follow / Unfollow a user
// @route   POST /api/user/follow/:id
// @access  Private
export const followUnfollowUser = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.id;

    if (currentUserId.toString() === targetUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow/unfollow yourself.",
      });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User to follow not found.",
      });
    }

    // Check if currently following
    const isFollowing = currentUser.following.some(
      (id) => (typeof id === "object" ? id._id.toString() : id.toString()) === targetUserId.toString()
    );

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        (id) => (typeof id === "object" ? id._id.toString() : id.toString()) !== targetUserId.toString()
      );
      targetUser.followers = targetUser.followers.filter(
        (id) => (typeof id === "object" ? id._id.toString() : id.toString()) !== currentUserId.toString()
      );
      currentUser.connections = (currentUser.connections || []).filter(
        (id) => (typeof id === "object" ? id._id.toString() : id.toString()) !== targetUserId.toString()
      );
      targetUser.connections = (targetUser.connections || []).filter(
        (id) => (typeof id === "object" ? id._id.toString() : id.toString()) !== currentUserId.toString()
      );
      await currentUser.save();
      await targetUser.save();

      return res.status(200).json({
        success: true,
        message: "User unfollowed successfully.",
        isFollowing: false,
        targetUserId,
        following: currentUser.following,
        connections: currentUser.connections,
      });
    } else {
      // Follow
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);

      // Check if targetUser also follows currentUser -> mutual connection!
      const isMutual = (currentUser.followers || []).some(
        (id) => (typeof id === "object" ? id._id.toString() : id.toString()) === targetUserId.toString()
      );
      if (isMutual) {
        if (!currentUser.connections.some((id) => (typeof id === "object" ? id._id.toString() : id.toString()) === targetUserId.toString())) {
          currentUser.connections.push(targetUserId);
        }
        if (!targetUser.connections.some((id) => (typeof id === "object" ? id._id.toString() : id.toString()) === currentUserId.toString())) {
          targetUser.connections.push(currentUserId);
        }
      }

      await currentUser.save();
      await targetUser.save();

      // Trigger follow notification
      createNotification({
        recipient: targetUserId,
        sender: currentUserId,
        type: "follow",
      });

      return res.status(200).json({
        success: true,
        message: "User followed successfully.",
        isFollowing: true,
        targetUserId,
        following: currentUser.following,
        connections: currentUser.connections,
      });
    }
  } catch (error) {
    console.error("followUnfollowUser error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to follow/unfollow user.",
    });
  }
};

// @desc    Get discover users (suggested users to connect/follow - all except self)
// @route   GET /api/user/discover
// @access  Private
export const getDiscoverUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Return all other registered users except the logged in user
    const users = await User.find({ _id: { $ne: currentUserId } })
      .select("full_name username profile_picture bio location followers following")
      .limit(50);

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("getDiscoverUsers error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get discover users.",
    });
  }
};

// @desc    Get populated connections, followers, following for logged-in user
// @route   GET /api/user/connections/all
// @access  Private
export const getUserConnections = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId)
      .populate("followers", "full_name username profile_picture bio location")
      .populate("following", "full_name username profile_picture bio location")
      .populate("connections", "full_name username profile_picture bio location");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      followers: user.followers || [],
      following: user.following || [],
      connections: user.connections || [],
    });
  } catch (error) {
    console.error("getUserConnections error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch connections.",
    });
  }
};
