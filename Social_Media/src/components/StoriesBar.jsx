import React, { useEffect, useState } from "react";
import { dummyStoriesData } from "../assets";
import { Plus } from "lucide-react";
import StoryModal from "./StoryModal";
import Storyviewers from "./Storyviewers";

const StoriesBar = () => {
  const [stories, setStories] = useState([]);
  const [showModal, setshowModal] = useState(false);
  const [viewStory, setviewStory] = useState(null);
  const fetchStories = () => {
    setStories(dummyStoriesData);
  };

  useEffect(() => {
    fetchStories();
  }, []);

  return (
    <div className="w-screen sm:w-[calc(100vw-240px)] lg:max-w-2xl no-scrollbar overflow-x-auto px-4 py-2">
      <div className="flex items-center gap-3">
        {/* Add story card */}
        
        <div
          onClick={() => setshowModal(true)}
          className="relative rounded-lg shadow-sm min-w-30 max-w-30 h-40 shrink-0 cursor-pointer hover:shadow-lg hover:border-indigo-400 active:scale-95 transition-all duration-200 border-2 border-dashed border-indigo-300 bg-linear-to-b from-indigo-50 to-white flex flex-col items-center justify-center p-3"
        >
          <div className="size-10 bg-indigo-500 rounded-full flex items-center justify-center mb-3 shadow">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-700 text-center">
            Create Story
          </p>
        </div>

        {/* Story Cards */}
        {stories.map((story, i) => (
          <div onClick={()=>setviewStory(story)}
            key={i}
            className="relative rounded-lg shadow min-w-30 max-w-30 h-40 aspect-3/4 shrink-0 cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden bg-gradient-to-b from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95"
          >
            {/* Media preview (Image / Video) */}
            {story.media_type === "image" && story.media_url ? (
              <img
                src={story.media_url}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : story.media_type === "video" && story.media_url ? (
              <video
                src={story.media_url}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : null}

            {/* Overlay for text readability */}
            <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/70 pointer-events-none" />

            {/* Profile image */}
            <img
              src={story.user?.profile_picture}
              alt=""
              className="absolute size-8 top-2.5 left-2.5 z-10 rounded-full ring-2 ring-white shadow object-cover"
            />

            {/* Text content preview */}
            {story.content && (
              <p className="absolute top-12 left-2.5 right-2.5 z-10 text-white text-xs line-clamp-3">
                {story.content}
              </p>
            )}

            {/* User name / caption */}
            <p className="text-white absolute bottom-2 left-2.5 right-2.5 z-10 text-[11px] font-medium truncate">
              {story.user?.full_name || "Story"}
            </p>
          </div>
        ))}
      </div>
      {/* Add story Modal */}
      {showModal && (
        <StoryModal fetchStories={fetchStories} setShowModal={setshowModal} />
        
      )}
      {viewStory && <Storyviewers viewStory={viewStory} setviewStory={setviewStory} />}
    </div>
  );
};

export default StoriesBar;
