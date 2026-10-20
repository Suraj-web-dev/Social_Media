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
  Sparkles,
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

  // Default sample posts matching the reference image layout if DB has few posts
  const samplePosts = [
    {
      _id: 'sample-1',
      user: {
        _id: 'user-sonya',
        full_name: 'Sonya Leena',
        username: 'sonya_leena',
        profile_picture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        location: 'Dubai, UAE',
      },
      content: 'You can never dull my sparkle ✨',
      location: 'Dubai, UAE',
      image_urls: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
      ],
      likes_count: Array(360).fill({ _id: 'liker-1', full_name: 'Andrew' }),
      comments: [
        { text: 'Stunning capture!' },
        { text: 'Love this vibe ✨' },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'sample-2',
      user: {
        _id: 'user-adam',
        full_name: 'Adam Addisin',
        username: 'adam_addisin',
        profile_picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        location: 'Oklahoma, US',
      },
      content: 'In photography, there is a reality so subtle that it becomes more real than reality 📷',
      location: 'Oklahoma, US',
      image_urls: [
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
      ],
      likes_count: Array(360).fill({ _id: 'liker-2', full_name: 'Andrew' }),
      comments: [{ text: 'Awesome perspective!' }],
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'sample-3',
      user: {
        _id: 'user-andrew',
        full_name: 'Andrew Dewitt',
        username: 'andrew_dewitt',
        profile_picture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        location: 'Overland Park, KS',
      },
      content: 'The unexpected moment is always sweeter! Exploring the streets today.',
      location: 'Overland Park, KS',
      image_urls: [
        'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop&q=80',
      ],
      likes_count: Array(360).fill({ _id: 'liker-3', full_name: 'Sonya' }),
      comments: [{ text: 'Great photo Andrew!' }],
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'sample-4',
      user: {
        _id: 'user-nicole',
        full_name: 'Nicole Segall',
        username: 'nicole_segall',
        profile_picture: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        location: 'New Delhi, India',
      },
      content: 'Colorful streets and beautiful memories ❤️',
      location: 'New Delhi, India',
      image_urls: [
        'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=800&auto=format&fit=crop&q=80',
      ],
      likes_count: Array(285).fill({ _id: 'liker-4', full_name: 'Michael' }),
      comments: [{ text: 'So colorful!' }],
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'sample-5',
      user: {
        _id: 'user-michael',
        full_name: 'Michael Gilmore',
        username: 'michael_gilmore',
        profile_picture: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        location: 'Lawrence, KS',
      },
      content: 'Chasing the golden sunset vibes 🌇',
      location: 'Lawrence, KS',
      image_urls: [
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
      ],
      likes_count: Array(412).fill({ _id: 'liker-5', full_name: 'Damian' }),
      comments: [{ text: 'Pure magic!' }],
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'sample-6',
      user: {
        _id: 'user-damian',
        full_name: 'Damian Efron',
        username: 'damian_efron',
        profile_picture: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
        location: 'Birmingham, UK',
      },
      content: 'Weekend adventures in the countryside 🍂',
      location: 'Birmingham, UK',
      image_urls: [
        'https://images.unsplash.com/photo-1511497584788-87676104235f?w=800&auto=format&fit=crop&q=80',
      ],
      likes_count: Array(190).fill({ _id: 'liker-6', full_name: 'Ashley' }),
      comments: [{ text: 'Looks so peaceful!' }],
      createdAt: new Date().toISOString(),
    },
  ]

  // Combine real posts from backend + sample posts if posts are few
  const allDisplayPosts = posts && posts.length > 0 ? [...posts, ...samplePosts] : samplePosts

  // Filter posts based on search query
  const filteredPosts = allDisplayPosts.filter((p) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    const authorName = (p.user?.full_name || '').toLowerCase()
    const content = (p.content || '').toLowerCase()
    const location = (p.location || '').toLowerCase()
    return authorName.includes(q) || content.includes(q) || location.includes(q)
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
        ) : (
          /* 3-Column Modern Grid (matching screenshot) */
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
            {filteredPosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
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
