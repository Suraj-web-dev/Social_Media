import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchFeedPosts } from '../redux/slices/postSlice'
import StoriesBar from '../components/StoriesBar'
import PostCard from './PostCard'
import NotificationsModal from '../components/NotificationsModal'
import {
  Search,
  Bell,
  MessageCircle,
  Plus,
  Loader2,
  ImagePlus,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const Feed = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { posts, loading } = useSelector((state) => state.post)
  const { user } = useSelector((state) => state.auth)
  const { unreadCount } = useSelector((state) => state.notification)
  const { conversations } = useSelector((state) => state.message)

  const [searchQuery, setSearchQuery] = useState('')
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  useEffect(() => {
    dispatch(fetchFeedPosts())
  }, [dispatch])

  const totalUnreadMessages = (conversations || []).reduce(
    (sum, c) => sum + (c.unreadCount || 0),
    0
  )

  // Real posts from backend only (no dummy/mock data)
  const filteredPosts = (posts || []).filter((p) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    const authorName = (p.user?.full_name || '').toLowerCase()
    const authorUsername = (p.user?.username || '').toLowerCase()
    const content = (p.content || '').toLowerCase()
    const location = (p.location || '').toLowerCase()
    return (
      authorName.includes(q) ||
      authorUsername.includes(q) ||
      content.includes(q) ||
      location.includes(q)
    )
  })

  return (
    <div className='w-full h-full overflow-y-auto no-scrollbar p-4 sm:p-6 lg:p-8 space-y-6'>
      {/* ================= 1. TOP HEADER BAR ================= */}
      <div className='flex items-center justify-between gap-4'>
        {/* Search Bar (Pill Shaped) */}
        <div className='relative flex-1 max-w-md'>
          <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
          <input
            type='text'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Search'
            className='w-full pl-11 pr-4 py-2.5 rounded-full bg-slate-100 dark:bg-white/[0.05] border border-transparent focus:border-rose-400 focus:bg-white dark:focus:bg-[#121626] text-sm text-gray-800 dark:text-gray-100 outline-none transition-all duration-200 placeholder:text-gray-400 shadow-2xs'
          />
        </div>

        {/* Right Action Icons & Create Post Button */}
        <div className='flex items-center gap-3 sm:gap-4'>
          {/* Notifications Bell */}
          <button
            type='button'
            onClick={() => setIsNotificationsOpen(true)}
            className='relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/[0.06] text-gray-700 dark:text-gray-200 transition cursor-pointer'
            title='Notifications'
          >
            <Bell className='w-5 h-5 stroke-[1.8]' />
            {unreadCount > 0 && (
              <span className='absolute top-1.5 right-1.5 size-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-[#0c101d] animate-pulse' />
            )}
          </button>

          {/* Messages Icon */}
          <button
            type='button'
            onClick={() => navigate('/messages')}
            className='relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/[0.06] text-gray-700 dark:text-gray-200 transition cursor-pointer'
            title='Messages'
          >
            <MessageCircle className='w-5 h-5 stroke-[1.8]' />
            {totalUnreadMessages > 0 && (
              <span className='absolute top-1.5 right-1.5 size-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-[#0c101d]' />
            )}
          </button>

          {/* "+ Create a post" Vibrant Gradient Button */}
          <button
            type='button'
            onClick={() => navigate('/create-post')}
            className='flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 active:scale-95 text-white font-semibold text-xs sm:text-sm shadow-md shadow-rose-500/25 transition-all cursor-pointer shrink-0'
          >
            <Plus className='w-4 h-4 stroke-[3]' />
            <span>Create a post</span>
          </button>
        </div>
      </div>

      {/* ================= 2. STORIES SECTION ================= */}
      <div className='w-full pt-1'>
        <StoriesBar />
      </div>

      {/* ================= 3. FEED SECTION ================= */}
      <div className='w-full pt-2'>
        <div className='flex items-center justify-between mb-4 px-1'>
          <h2 className='text-lg sm:text-xl font-bold text-gray-900 dark:text-white'>
            Feed
          </h2>
        </div>

        {loading && posts.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-24 gap-3 text-rose-500'>
            <Loader2 className='w-8 h-8 animate-spin' />
            <p className='text-xs font-semibold text-gray-400 animate-pulse'>
              Loading your feed...
            </p>
          </div>
        ) : filteredPosts.length > 0 ? (
          /* 3-Column Modern Grid (matching screenshot) */
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
            {filteredPosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          /* Clean Empty State when no real posts in database */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className='bg-white dark:bg-[#111625] rounded-[28px] p-10 sm:p-14 text-center space-y-4 border border-slate-100 dark:border-white/[0.06] shadow-sm max-w-lg mx-auto'
          >
            <div className='size-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto shadow-xs'>
              <ImagePlus className='w-7 h-7 stroke-[1.8]' />
            </div>
            <h3 className='font-bold text-gray-900 dark:text-white text-base'>
              No posts in your feed yet
            </h3>
            <p className='text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed'>
              Be the first to share your thoughts, photos, or updates with your connections.
            </p>
            <button
              type='button'
              onClick={() => navigate('/create-post')}
              className='px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 text-white text-xs font-semibold shadow-md shadow-rose-500/25 hover:brightness-105 active:scale-95 transition cursor-pointer'
            >
              Create First Post
            </button>
          </motion.div>
        )}
      </div>

      {/* Notifications Center Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  )
}

export default Feed
