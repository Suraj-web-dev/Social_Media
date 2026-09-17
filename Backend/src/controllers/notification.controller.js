import Notification from "../models/Notification.model.js";
import { io, getReceiverSocketId } from "../socket/socket.js";

// Helper function to create and emit notification
export const createNotification = async ({
  recipient,
  sender,
  type,
  post = null,
  commentId = null,
  text = "",
}) => {
  try {
    // Don't send notification to self
    if (recipient.toString() === sender.toString()) return null;

    // Check if duplicate unread notification already exists (e.g. repeated likes)
    if (type === "like_post" || type === "follow" || type === "like_comment") {
      const existing = await Notification.findOne({
        recipient,
        sender,
        type,
        post,
        commentId,
        isRead: false,
      });
      if (existing) {
        existing.createdAt = new Date();
        await existing.save();
        return existing;
      }
    }

    const notification = await Notification.create({
      recipient,
      sender,
      type,
      post,
      commentId,
      text,
    });

    const populated = await Notification.findById(notification._id)
      .populate("sender", "full_name username profile_picture is_verified")
      .populate("post", "content image_urls video_urls");

    // Real-time socket dispatch
    const receiverSocketId = getReceiverSocketId(recipient.toString());
    if (receiverSocketId && io) {
      io.to(receiverSocketId).emit("newNotification", populated);
    }

    return populated;
  } catch (error) {
    console.error("createNotification helper error:", error);
    return null;
  }
};

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("sender", "full_name username profile_picture is_verified")
      .populate("post", "content image_urls video_urls");

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("getNotifications error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch notifications.",
    });
  }
};

// @desc    Mark a single notification as read
// @route   PUT /api/notifications/read/:id
// @access  Private
export const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      notification,
      unreadCount,
    });
  } catch (error) {
    console.error("markNotificationAsRead error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to mark notification as read.",
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
      unreadCount: 0,
    });
  } catch (error) {
    console.error("markAllNotificationsAsRead error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to mark all as read.",
    });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient: userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      message: "Notification deleted.",
      deletedId: id,
      unreadCount,
    });
  } catch (error) {
    console.error("deleteNotification error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete notification.",
    });
  }
};

