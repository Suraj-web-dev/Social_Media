import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchFeedPosts } from '../redux/slices/postSlice'
import StoriesBar from '../components/StoriesBar'
import PostCard from './PostCard'
import RecentMessages from '../components/RecentMessages'
import { Loader2, Sparkles, Flame, Users, PlusCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const Feed = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { posts, loading } = useSelector((state) => state.post)
  const { user } = useSelector((state) => state.auth)
  const [activeFilter, setActiveFilter] = useState('all') // 'all' | 'following' | 'trending'

  useEffect(() => {
    dispatch(fetchFeedPosts())
  }, [dispatch])

  const filteredPosts = posts.filter((post) => {
    if (activeFilter === 'following') {
      const followingIds = (user?.following || []).map((f) =>
        typeof f === 'object' ? f._id : f
      )
      const authorId = post.user?._id || post.user
      return followingIds.includes(authorId)
    }
    if (activeFilter === 'trending') {
      return (post.likes_count?.length || 0) > 0
    }
    return true
  })

  return (
    <div className='h-full overflow-y-scroll no-scrollbar py-6 sm:py-8 px-2 sm:px-4 xl:pr-6 flex items-start justify-center xl:gap-8'>
      {/* Main Feed Column */}
      <div className='w-full max-w-2xl space-y-5'>
        {/* Stories Section Bar */}
        <div className='glass-card rounded-3xl p-1.5 shadow-sm border border-slate-200/80 dark:border-white/[0.08] overflow-hidden'>
          <StoriesBar />
        </div>

        {/* Trendy Feed Filter Pills Bar */}
        <div className='flex items-center justify-between px-2'>
          <div className='flex items-center gap-1.5 p-1 glass-card rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs'>
            <button
              type='button'
              onClick={() => setActiveFilter('all')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className='w-3.5 h-3.5' />
              <span>For You</span>
            </button>

            <button
              type='button'
              onClick={() => setActiveFilter('following')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === 'following'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Users className='w-3.5 h-3.5' />
              <span>Following</span>
            </button>

            <button
              type='button'
              onClick={() => setActiveFilter('trending')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === 'trending'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Flame className='w-3.5 h-3.5 text-amber-400' />
              <span>Trending</span>
            </button>
          </div>

          <button
            type='button'
            onClick={() => navigate('/create-post')}
            className='flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 active:scale-95 transition cursor-pointer shadow-xs shrink-0'
          >
            <PlusCircle className='w-3.5 h-3.5' />
            <span className='hidden sm:inline'>Create</span>
            <span className='sm:hidden'>Post</span>
          </button>
        </div>

        {/* Posts Stream */}
        {loading && posts.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-24 gap-3 text-indigo-600'>
            <Loader2 className='w-8 h-8 animate-spin' />
            <p className='text-xs font-semibold text-gray-500 animate-pulse'>
              Curating your feed...
            </p>
          </div>
        ) : (
          <div className='space-y-5'>
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className='glass-card rounded-3xl p-10 text-center space-y-3 border border-slate-200/80 dark:border-white/[0.08] shadow-sm'
              >
                <div className='size-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-xs'>
                  <Sparkles className='w-6 h-6' />
                </div>
                <h3 className='font-bold text-gray-900 dark:text-white text-base'>
                  No posts found
                </h3>
                <p className='text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed'>
                  {activeFilter === 'following'
                    ? "People you follow haven't posted yet. Discover more creators in the Discover tab!"
                    : 'Be the first to share your thoughts, photos, or updates with the community.'}
                </p>
                <button
                  type='button'
                  onClick={() => navigate('/create-post')}
                  className='px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold hover:opacity-90 transition shadow-sm'
                >
                  Create First Post
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Right-Rail Widgets on Desktop (Sticky) */}
      <aside className='max-xl:hidden sticky top-6 w-80 shrink-0 space-y-5'>
        {/* Quick Creator Card */}
        <div className='glass-card p-5 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-sm space-y-3'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-bold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase'>
              Trending Space
            </span>
            <span className='px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'>
              LIVE
            </span>
          </div>
          <div className='space-y-1'>
            <h4 className='font-bold text-sm text-gray-900 dark:text-white'>
              Explore Creator Circles
            </h4>
            <p className='text-xs text-gray-500 dark:text-gray-400 leading-relaxed'>
              Connect with people sharing your exact interests and customize audience privacy.
            </p>
          </div>
          <button
            type='button'
            onClick={() => navigate('/connections')}
            className='w-full py-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-semibold transition cursor-pointer'
          >
            Manage Circles →
          </button>
        </div>

        {/* Recent Messages Drawer */}
        <div className='glass-card p-5 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-sm space-y-3'>
          <div className='flex items-center justify-between'>
            <h3 className='font-bold text-sm text-gray-900 dark:text-white'>
              Recent Messages
            </h3>
            <button
              type='button'
              onClick={() => navigate('/messages')}
              className='text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer'
            >
              View All
            </button>
          </div>
          <RecentMessages />
        </div>
      </aside>
    </div>
  )
}

export default Feed
