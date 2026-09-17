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
    views: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Story expires automatically after 24 hours (86400 seconds)
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

const Story = mongoose.model("Story", storySchema);
export default Story;

