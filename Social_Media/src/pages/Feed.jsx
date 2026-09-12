import React, { useEffect, useState } from "react";
import { dummyPostsData } from "../assets";
import StoriesBar from "../components/StoriesBar";
import PostCard from "./PostCard";
import RecentMessages from "../components/RecentMessages";

const Feed = () => {
  const [feeds, setfeeds] = useState([]);
  const [loading, setloading] = useState(true);

  const fetchFeeds = async () => {
    setfeeds(dummyPostsData);
    setloading(false);
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  return !loading ? (
    <div className="h-full overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8">
      {/* stories & posts */}
      <div>
        <StoriesBar />
        <div className="p-4 space-y-6">
          {feeds.map((post, id) => (
            <PostCard key={id} post={post} />
          ))}
        </div>
      </div>

      {/* Rightside */}
      <div className="max-xl:hidden sticky top-0">
        <div className="max-w-xs bg-white text-xs p-4 rounded-md inline-flex flex-col gap-2 shadow">
          <h3 className="text-slate-800 font-semibold">Sponsored</h3>
          <img
            src="/sponsored_img.png"
            className="w-75 h-50 rounded-md"
            alt=""
          />
          <p className="text-slate-600">Email marketing</p>
          <p className="text-slate-400">
            Supercharge your marketing with a powerful, easy-to-use platform
            built for results.
          </p>
        </div>
        <h1>Recent messages</h1>
        <RecentMessages/>
      </div>
    </div>
  ) : (
    <h1 className="p-6 text-xl">Loading...</h1>
  );
};

export default Feed;
