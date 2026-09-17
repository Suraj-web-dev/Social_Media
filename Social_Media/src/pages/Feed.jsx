import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFeedPosts } from "../redux/slices/postSlice";
import StoriesBar from "../components/StoriesBar";
import PostCard from "./PostCard";
import RecentMessages from "../components/RecentMessages";
import { Loader2 } from "lucide-react";

const Feed = () => {
  const dispatch = useDispatch();
  const { posts, loading } = useSelector((state) => state.post);

  useEffect(() => {
    dispatch(fetchFeedPosts());
  }, [dispatch]);

  return (
    <div className="h-full overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8">
      {/* Stories & Posts */}
      <div className="w-full max-w-2xl">
        <StoriesBar />

        {loading && posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-indigo-600">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm font-medium text-gray-500">Loading feed...</p>
          </div>
        ) : (
          <div className="p-4 space-y-6">
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-8 text-center space-y-3">
                <p className="text-gray-600 dark:text-gray-300 font-medium">
                  No posts yet! Be the first to share something.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rightside Sponsored & Messages */}
      <div className="max-xl:hidden sticky top-0">
        <div className="max-w-xs bg-white dark:bg-slate-900 text-xs p-4 rounded-xl inline-flex flex-col gap-2 shadow-sm border border-gray-100 dark:border-slate-800 mb-6">
          <h3 className="text-slate-800 dark:text-gray-200 font-semibold">Sponsored</h3>
          <img
            src="/sponsored_img.png"
            className="w-75 h-50 rounded-lg object-cover"
            alt="Sponsored"
          />
          <p className="text-slate-700 dark:text-gray-300 font-medium">Email marketing</p>
          <p className="text-slate-400 dark:text-gray-400">
            Supercharge your marketing with a powerful, easy-to-use platform
            built for results.
          </p>
        </div>
        <h1 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 text-sm">
          Recent messages
        </h1>
        <RecentMessages />
      </div>
    </div>
  );
};

export default Feed;
