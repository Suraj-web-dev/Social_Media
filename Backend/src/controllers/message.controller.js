import Message from "../models/Message.model.js";
import User from "../models/User.model.js";
import imagekit from "../../configs/imagekit.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

// @desc    Send a message to a user
// @route   POST /api/message/send/:userId
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { userId } = req.params;
    const { text } = req.body || {};

    let targetUserId = userId;

    // Support both Mongo ObjectId and username
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      const targetUser = await User.findOne({ username: userId.toLowerCase() });
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }
      targetUserId = targetUser._id;
    }

    let mediaUrl = "";
    let messageType = "text";

    // Handle image upload via Multer to ImageKit
    if (req.file) {
      if (imagekit) {
        try {
          const uploadRes = await imagekit.upload({
            file: req.file.buffer,
            fileName: `chat_${senderId}_${Date.now()}_${req.file.originalname}`,
            folder: "/chat/images",
          });
          mediaUrl = uploadRes.url;
          messageType = "image";
        } catch (imgErr) {
          console.error("ImageKit chat image upload error:", imgErr.message);
        }
      }
    }

    if (!text?.trim() && !mediaUrl) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty.",
      });
    }

    const newMessage = await Message.create({
      sender: senderId,
      receiver: targetUserId,
      text: text ? text.trim() : "",
      media_url: mediaUrl,
      message_type: mediaUrl ? "image" : "text",
      seen: false,
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "full_name username profile_picture")
      .populate("receiver", "full_name username profile_picture");

    // Real-Time Socket.io Delivery
    const receiverSocketId = getReceiverSocketId(targetUserId.toString());
    if (receiverSocketId && io) {
      io.to(receiverSocketId).emit("receiveMessage", populatedMessage);
    }

    return res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    console.error("sendMessage error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send message.",
    });
  }
};

// @desc    Get all messages in a conversation
// @route   GET /api/message/:userId
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { userId } = req.params;

    let targetUserId = userId;

    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      const targetUser = await User.findOne({ username: userId.toLowerCase() });
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }
      targetUserId = targetUser._id;
    }

    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: targetUserId },
        { sender: targetUserId, receiver: senderId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "full_name username profile_picture")
      .populate("receiver", "full_name username profile_picture");

    // Mark unread messages sent by the other user as seen
    await Message.updateMany(
      { sender: targetUserId, receiver: senderId, seen: false },
      { $set: { seen: true } }
    );

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("getMessages error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch messages.",
    });
  }
};

// @desc    Get recent chat conversations
// @route   GET /api/message/conversations/recent
// @access  Private
export const getRecentConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Find all messages involving the current user
    const messages = await Message.find({
      $or: [{ sender: currentUserId }, { receiver: currentUserId }],
    })
      .sort({ createdAt: -1 })
      .populate("sender", "full_name username profile_picture")
      .populate("receiver", "full_name username profile_picture");

    const conversationUsers = new Map();

    messages.forEach((msg) => {
      const isSender = msg.sender._id.toString() === currentUserId.toString();
      const otherUser = isSender ? msg.receiver : msg.sender;

      if (otherUser && !conversationUsers.has(otherUser._id.toString())) {
        conversationUsers.set(otherUser._id.toString(), {
          user: otherUser,
          lastMessage: msg,
        });
      }
    });

    const conversations = [];

    for (const [otherUserId, conv] of conversationUsers.entries()) {
      const unreadCount = await Message.countDocuments({
        sender: otherUserId,
        receiver: currentUserId,
        seen: false,
      });

      conversations.push({
        user: conv.user,
        lastMessage: conv.lastMessage,
        unreadCount,
      });
    }

    return res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error("getRecentConversations error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get recent conversations.",
    });
  }
};
