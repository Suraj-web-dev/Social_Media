import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      default: "",
    },
    caption: {
      type: String,
      default: "",
    },
    media_url: {
      type: String,
      default: "",
    },
    media_type: {
      type: String,
      enum: ["text", "image", "video"],
      default: "text",
    },
    background_color: {
      type: String,
      default: "#4f46e5",
    },
    font_style: {
      type: String,
      default: "modern",
    },
    filter: {
      type: String,
      default: "normal",
    },
    music: {
      title: { type: String, default: "" },
      artist: { type: String, default: "" },
    },
    location: {
      type: String,
      default: "",
    },
    target_circle: {
      type: String,
      default: "all",
    },
    views: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Story expires automatically after 24 hours (86400 seconds) in MongoDB
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 86400,
    },
  },
  {
    timestamps: true,
  }
);

// Add index for fast query of active stories in last 24h
storySchema.index({ createdAt: -1 });

const Story = mongoose.model("Story", storySchema);
export default Story;
