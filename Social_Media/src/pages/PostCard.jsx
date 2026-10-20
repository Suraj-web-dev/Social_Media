import React, { useState } from 'react'
import {
  BadgeCheck,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  likeUnlikePost,
  bookmarkPost,
  toggleLikeOptimistic,
} from '../redux/slices/postSlice'
import { toggleBookmarkOptimistic } from '../redux/slices/authSlice'
import PostOptionsMenu from '../components/PostOptionsMenu'
import LikesModal from '../components/LikesModal'
import PostDetailModal from '../components/PostDetailModal'
import InstagramCommentsModal from '../components/InstagramCommentsModal'
import SharePostModal from '../components/SharePostModal'
import { showToast } from '../utils/toast'

const PostCard = ({ post }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user: currentUser } = useSelector((state) => state.auth)

  const [showHeartAnim, setShowHeartAnim] = useState(false)
  const [showLikesModal, setShowLikesModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showCommentsModal, setShowCommentsModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  // Sync post from redux store
  const reduxPost = useSelector(
    (state) =>
      state.post.posts.find((p) => p._id === post?._id) ||
      state.post.userPosts.find((p) => p._id === post?._id) ||
      state.post.savedPosts.find((p) => p._id === post?._id)
  )
  const currentPost = reduxPost || post

  const author = currentPost.user || {}
  const authorId = author._id || author
  const authorName = author.full_name || 'Creator'
  const authorPic = author.profile_picture || '/sample_profile.jpg'
  const location = currentPost.location || author.location || 'Dubai, UAE'

  const likesList = currentPost.likes_count || []
  const isLiked = likesList.some(
    (id) => (typeof id === 'object' ? id._id : id) === currentUser?._id
  )
  const isBookmarked = currentUser?.saved_posts?.includes(currentPost._id)

  const handleLike = (e) => {
    e?.stopPropagation()
    if (currentPost._id && currentUser?._id) {
      dispatch(
        toggleLikeOptimistic({
          postId: currentPost._id,
          currentUserId: currentUser._id,
          currentUser,
        })
      )
      dispatch(likeUnlikePost(currentPost._id)).unwrap().catch(() => {
        dispatch(
          toggleLikeOptimistic({
            postId: currentPost._id,
            currentUserId: currentUser._id,
            currentUser,
          })
        )
        showToast.error('Network error. Like could not be saved.')
      })
    }
  }

  const handleDoubleTapMedia = () => {
    setShowHeartAnim(true)
    setTimeout(() => {
      setShowHeartAnim(false)
    }, 700)

    if (!isLiked && currentPost._id && currentUser?._id) {
      dispatch(
        toggleLikeOptimistic({
          postId: currentPost._id,
          currentUserId: currentUser._id,
          currentUser,
        })
      )
      dispatch(likeUnlikePost(currentPost._id)).unwrap().catch(() => {
        dispatch(
          toggleLikeOptimistic({
            postId: currentPost._id,
            currentUserId: currentUser._id,
            currentUser,
          })
        )
      })
    }
  }

  const handleBookmark = async (e) => {
    e?.stopPropagation()
    if (currentPost._id) {
      dispatch(toggleBookmarkOptimistic({ postId: currentPost._id }))
      try {
        const res = await dispatch(bookmarkPost(currentPost._id)).unwrap()
        if (res.isBookmarked) {
          showToast.success('Saved to bookmarks!')
        } else {
          showToast.info('Removed from bookmarks.')
        }
      } catch (err) {
        dispatch(toggleBookmarkOptimistic({ postId: currentPost._id }))
        showToast.error(err || 'Failed to update bookmark.')
      }
    }
  }

  const populatedLikers = likesList.filter(
    (u) => typeof u === 'object' && u._id
  )
  const firstLiker =
    populatedLikers[0] || (likesList.length > 0 ? { full_name: 'Andrew' } : null)
  const totalLikes = likesList.length || 360

  const hasMedia = currentPost.image_urls && currentPost.image_urls.length > 0
  const mediaUrl = hasMedia ? currentPost.image_urls[0] : null

  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className='bg-white dark:bg-[#111625] rounded-[24px] p-3.5 sm:p-4 shadow-[0_2px_14px_rgba(0,0,0,0.03)] border border-slate-100 dark:border-white/[0.06] flex flex-col justify-between space-y-3 select-none hover:shadow-lg transition-all duration-300'
    >
      {/* 1. Header: Avatar + Full Name + Location + Options */}
      <div className='flex items-center justify-between'>
        <div
          onClick={() => navigate('/profile/' + authorId)}
          className='flex items-center gap-2.5 cursor-pointer group'
        >
          <img
            src={authorPic}
            alt={authorName}
            className='size-9 sm:size-10 rounded-full object-cover ring-1 ring-slate-200 dark:ring-white/10 group-hover:ring-rose-400 transition-all'
          />
          <div>
            <div className='flex items-center gap-1'>
              <h3 className='font-bold text-xs sm:text-sm text-gray-900 dark:text-white group-hover:text-rose-500 transition truncate max-w-[140px]'>
                {authorName}
              </h3>
              {author.is_verified && (
                <BadgeCheck className='w-3.5 h-3.5 text-blue-500 fill-blue-50' />
              )}
            </div>
            <p className='text-[11px] text-gray-400 font-normal leading-tight truncate max-w-[140px]'>
              {location}
            </p>
          </div>
        </div>

        <PostOptionsMenu post={currentPost} />
      </div>

      {/* 2. Media Image Container */}
      {mediaUrl ? (
        <div
          onDoubleClick={handleDoubleTapMedia}
          onClick={() => setShowDetailModal(true)}
          className='relative w-full aspect-[4/3] rounded-[18px] overflow-hidden bg-slate-100 dark:bg-black/30 cursor-pointer group select-none shadow-2xs'
        >
          <img
            src={mediaUrl}
            alt='Post media'
            className='w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300'
          />

          {/* Bouncing Double-tap Heart Effect */}
          <AnimatePresence>
            {showHeartAnim && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.4, 1.1], opacity: [0, 1, 1] }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className='absolute inset-0 flex items-center justify-center pointer-events-none drop-shadow-2xl'
              >
                <div className='p-3.5 rounded-full bg-black/40 backdrop-blur-md'>
                  <Heart className='w-14 h-14 fill-rose-500 text-rose-500 animate-pulse' />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : currentPost.content ? (
        <div
          onClick={() => setShowDetailModal(true)}
          className='w-full p-4 rounded-[18px] bg-slate-50 dark:bg-white/[0.03] text-gray-800 dark:text-gray-200 text-xs sm:text-sm leading-relaxed cursor-pointer font-medium'
        >
          {currentPost.content}
        </div>
      ) : null}

      {/* 3. Action Buttons Row (Like, Comment, Share, Bookmark) */}
      <div className='flex items-center justify-between text-gray-700 dark:text-gray-300 pt-0.5'>
        <div className='flex items-center gap-3.5'>
          {/* Like Heart Icon */}
          <button
            type='button'
            onClick={handleLike}
            className='transition active:scale-75 cursor-pointer'
            title={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart
              className={`w-5 h-5 transition-transform ${
                isLiked
                  ? 'fill-rose-500 text-rose-500 scale-110'
                  : 'hover:text-rose-500'
              }`}
            />
          </button>

          {/* Comment Speech Bubble Icon */}
          <button
            type='button'
            onClick={() => setShowCommentsModal(true)}
            className='hover:text-gray-900 dark:hover:text-white transition active:scale-75 cursor-pointer'
            title='Comments'
          >
            <MessageCircle className='w-5 h-5' />
          </button>

          {/* Share Paper Plane Icon */}
          <button
            type='button'
            onClick={() => setShowShareModal(true)}
            className='hover:text-gray-900 dark:hover:text-white transition active:scale-75 cursor-pointer'
            title='Share'
          >
            <Send className='w-5 h-5 -rotate-12' />
          </button>
        </div>

        {/* Bookmark Icon */}
        <button
          type='button'
          onClick={handleBookmark}
          className='hover:text-gray-900 dark:hover:text-white transition active:scale-75 cursor-pointer'
          title={isBookmarked ? 'Saved' : 'Save'}
        >
          <Bookmark
            className={`w-5 h-5 ${
              isBookmarked ? 'fill-gray-900 dark:fill-white text-gray-900 dark:text-white' : ''
            }`}
          />
        </button>
      </div>

      {/* 4. Likes & Caption */}
      <div className='space-y-1 text-xs'>
        <p
          onClick={() => setShowLikesModal(true)}
          className='text-gray-800 dark:text-gray-200 cursor-pointer font-semibold'
        >
          Liked by{' '}
          <strong className='font-bold text-gray-900 dark:text-white'>
            {firstLiker?.full_name?.split(' ')[0] || 'Andrew'}
          </strong>{' '}
          and{' '}
          <strong className='font-bold text-gray-900 dark:text-white'>
            {totalLikes} others
          </strong>
        </p>

        {currentPost.content && hasMedia && (
          <p className='text-gray-600 dark:text-gray-400 font-normal leading-relaxed line-clamp-2'>
            <span
              onClick={() => navigate('/profile/' + authorId)}
              className='font-bold text-gray-900 dark:text-white mr-1 cursor-pointer hover:underline'
            >
              {authorName}
            </span>
            {currentPost.content}
          </p>
        )}
      </div>

      {/* Modals */}
      <LikesModal
        isOpen={showLikesModal}
        onClose={() => setShowLikesModal(false)}
        postId={currentPost._id}
      />
      <PostDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        post={currentPost}
      />
      <InstagramCommentsModal
        isOpen={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
        post={currentPost}
      />
      <SharePostModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        post={currentPost}
      />
    </motion.article>
  )
}

export default PostCard