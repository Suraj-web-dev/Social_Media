import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
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
    image_urls: [
      {
        type: String,
      },
    ],
    video_urls: [
      {
        type: String,
      },
    ],
    privacy: {
      type: String,
      enum: ["Public", "Connections", "Only me", "Circle"],
      default: "Public",
    },
    target_circle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Circle",
      default: null,
    },
    location: {
      type: String,
      default: "",
    },
    feeling: {
      type: String,
      default: "",
    },
    likes_count: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        text: {
          type: String,
          required: true,
        },
        likes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", postSchema);
export default Post;

