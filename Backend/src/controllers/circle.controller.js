import Circle from "../models/Circle.model.js";
import User from "../models/User.model.js";

const DEFAULT_PRESETS = [
  {
    name: "Close Friends",
    icon: "⭐",
    color: "#10b981",
    description: "Your closest inner circle for personal updates",
  },
  {
    name: "Coding Friends",
    icon: "👨‍💻",
    color: "#6366f1",
    description: "Developers, tech buddies, and project collaborators",
  },
  {
    name: "Family",
    icon: "👨‍👩‍👧",
    color: "#ec4899",
    description: "Family members and relatives",
  },
  {
    name: "College",
    icon: "🎓",
    color: "#f59e0b",
    description: "College batchmates, alumni, and campus friends",
  },
];

// @desc    Get all circles of logged-in user (auto-seeds defaults if empty)
// @route   GET /api/circle/my
// @access  Private
export const getUserCircles = async (req, res) => {
  try {
    const userId = req.user._id;

    let circles = await Circle.find({ user: userId })
      .populate("members", "full_name username profile_picture is_verified bio")
      .sort({ createdAt: 1 });

    // Auto-seed default circles for new users
    if (circles.length === 0) {
      const seeded = DEFAULT_PRESETS.map((preset) => ({
        ...preset,
        user: userId,
        members: [],
      }));

      await Circle.insertMany(seeded);

      circles = await Circle.find({ user: userId })
        .populate("members", "full_name username profile_picture is_verified bio")
        .sort({ createdAt: 1 });
    }

    return res.status(200).json({
      success: true,
      circles,
    });
  } catch (error) {
    console.error("getUserCircles error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch circles.",
    });
  }
};

// @desc    Create a new circle
// @route   POST /api/circle/create
// @access  Private
export const createCircle = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, icon, color, description, members } = req.body || {};

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Circle name is required.",
      });
    }

    const newCircle = await Circle.create({
      user: userId,
      name: name.trim(),
      icon: icon || "⭐",
      color: color || "#6366f1",
      description: description ? description.trim() : "",
      members: Array.isArray(members) ? members : [],
    });

    const populatedCircle = await Circle.findById(newCircle._id).populate(
      "members",
      "full_name username profile_picture is_verified bio"
    );

    return res.status(201).json({
      success: true,
      message: `Circle "${name}" created successfully.`,
      circle: populatedCircle,
    });
  } catch (error) {
    console.error("createCircle error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create circle.",
    });
  }
};

// @desc    Update a circle
// @route   PUT /api/circle/:id
// @access  Private
export const updateCircle = async (req, res) => {
  try {
    const userId = req.user._id;
    const circleId = req.params.id;
    const { name, icon, color, description, members } = req.body || {};

    const circle = await Circle.findById(circleId);
    if (!circle) {
      return res.status(404).json({
        success: false,
        message: "Circle not found.",
      });
    }

    if (circle.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to edit this circle.",
      });
    }

    if (name) circle.name = name.trim();
    if (icon) circle.icon = icon;
    if (color) circle.color = color;
    if (description !== undefined) circle.description = description.trim();
    if (Array.isArray(members)) circle.members = members;

    await circle.save();

    const updatedCircle = await Circle.findById(circleId).populate(
      "members",
      "full_name username profile_picture is_verified bio"
    );

    return res.status(200).json({
      success: true,
      message: "Circle updated successfully.",
      circle: updatedCircle,
    });
  } catch (error) {
    console.error("updateCircle error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update circle.",
    });
  }
};

// @desc    Delete a circle
// @route   DELETE /api/circle/:id
// @access  Private
export const deleteCircle = async (req, res) => {
  try {
    const userId = req.user._id;
    const circleId = req.params.id;

    const circle = await Circle.findById(circleId);
    if (!circle) {
      return res.status(404).json({
        success: false,
        message: "Circle not found.",
      });
    }

    if (circle.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this circle.",
      });
    }

    await Circle.findByIdAndDelete(circleId);

    return res.status(200).json({
      success: true,
      message: "Circle deleted successfully.",
      circleId,
    });
  } catch (error) {
    console.error("deleteCircle error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete circle.",
    });
  }
};

// @desc    Toggle member in circle (add or remove)
// @route   POST /api/circle/:id/toggle-member
// @access  Private
export const toggleCircleMember = async (req, res) => {
  try {
    const userId = req.user._id;
    const circleId = req.params.id;
    const { memberId } = req.body || {};

    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: "Member ID is required.",
      });
    }

    const circle = await Circle.findById(circleId);
    if (!circle) {
      return res.status(404).json({
        success: false,
        message: "Circle not found.",
      });
    }

    if (circle.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to manage this circle.",
      });
    }

    const memberIndex = circle.members.findIndex(
      (m) => m.toString() === memberId.toString()
    );

    let isAdded = false;
    if (memberIndex > -1) {
      circle.members.splice(memberIndex, 1);
      isAdded = false;
    } else {
      circle.members.push(memberId);
      isAdded = true;
    }

    await circle.save();

    const updatedCircle = await Circle.findById(circleId).populate(
      "members",
      "full_name username profile_picture is_verified bio"
    );

    return res.status(200).json({
      success: true,
      message: isAdded ? "Added to circle." : "Removed from circle.",
      isAdded,
      circle: updatedCircle,
    });
  } catch (error) {
    console.error("toggleCircleMember error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update circle member.",
    });
  }
};

