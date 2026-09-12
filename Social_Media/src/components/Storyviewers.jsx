import { BadgeCheck, X } from "lucide-react";
import React, { useEffect, useState } from "react";

const Storyviewers = ({ viewStory, setviewStory }) => {
  const [progress, setProgress] = useState(0);

  const handleClose = () => {
    setviewStory(null);
  };

  useEffect(() => {
    let interval;
    setProgress(0);

    // Auto-progress for image and text stories (5 seconds duration)
    if (viewStory && viewStory.media_type !== "video") {
      const duration = 5000;
      const step = 50;
      const increment = (step / duration) * 100;

      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setviewStory(null);
            return 100;
          }
          return prev + increment;
        });
      }, step);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [viewStory, setviewStory]);

  const renderContent = () => {
    switch (viewStory.media_type) {
      case "image":
        return (
          <img
            src={viewStory.media_url}
            alt=""
            className="max-w-full max-h-screen object-contain"
          />
        );
      case "video":
        return (
          <video
            onTimeUpdate={(e) => {
              if (e.target.duration) {
                setProgress((e.target.currentTime / e.target.duration) * 100);
              }
            }}
            onEnded={() => setviewStory(null)}
            src={viewStory.media_url}
            className="max-h-screen max-w-full object-contain"
            controls
            autoPlay
          />
        );
      case "text":
        return (
          <div className="w-full h-full flex items-center justify-center p-8 text-white text-2xl md:text-3xl font-medium text-center max-w-xl">
            {viewStory.content}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 h-screen bg-black/90 z-110 flex items-center justify-center"
      style={{
        backgroundColor:
          viewStory.media_type === "text"
            ? viewStory.background_color
            : "#000000",
      }}
    >
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-white/30 z-50">
        <div
          className="h-full bg-white transition-[width] duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* User Info */}
      <div className="absolute top-4 left-4 flex items-center space-x-3 p-2 px-4 sm:p-4 sm:px-6 backdrop-blur-2xl rounded bg-black/50 z-50">
        <img
          src={viewStory.user?.profile_picture}
          alt=""
          className="size-7 sm:size-8 rounded-full object-cover border border-white"
        />
        <div className="text-white font-medium flex items-center gap-1.5">
          <span>{viewStory.user?.full_name}</span>
          <BadgeCheck size={18} className="text-blue-400" />
        </div>
      </div>

      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-white text-3xl font-bold focus:outline-none z-50"
      >
        <X className="w-8 h-8 hover:scale-110 transition cursor-pointer" />
      </button>

      {/* Content Wrapper */}
      <div className="max-w-[90vw] max-h-[90vh] flex items-center justify-center">
        {renderContent()}
      </div>
    </div>
  );
};

export default Storyviewers;
