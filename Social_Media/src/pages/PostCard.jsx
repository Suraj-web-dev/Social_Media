import React, { useState } from 'react'
import {
  BadgeCheck,
  Heart,
  MessageCircle,
  Share2,
  MapPin,
  Smile,
  Send,
  Trash2,
  Loader2,
  Bookmark,
  Sparkles,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  likeUnlikePost,
  addCommentToPost,
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
  const [quickCommentText, setQuickCommentText] = useState('')
  const [isSubmittingQuickComment, setIsSubmittingQuickComment] = useState(false)

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
  const authorName = author.full_name || 'User'
  const authorUsername = author.username || 'user'
  const authorPic = author.profile_picture || '/sample_profile.jpg'

  const likesList = currentPost.likes_count || []
  const isLiked = likesList.some(
    (id) => (typeof id === 'object' ? id._id : id) === currentUser?._id
  )
  const isBookmarked = currentUser?.saved_posts?.includes(currentPost._id)

  const handleLike = () => {
    if (currentPost._id && currentUser?._id) {
      // 1. Instant 0ms UI update
      dispatch(
        toggleLikeOptimistic({
          postId: currentPost._id,
          currentUserId: currentUser._id,
          currentUser,
        })
      )
      // 2. Background Sync
      dispatch(likeUnlikePost(currentPost._id)).unwrap().catch(() => {
        // Revert on network failure
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

  // Double click on media heart animation
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

  const handleShare = () => {
    setShowShareModal(true)
  }

  const handleBookmark = async () => {
    if (currentPost._id) {
      // Instant 0ms toggle
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

  // Quick Comment
  const handleAddQuickComment = async (e) => {
    e?.preventDefault()
    if (!quickCommentText.trim() || isSubmittingQuickComment || !currentPost._id)
      return

    setIsSubmittingQuickComment(true)
    try {
      await dispatch(
        addCommentToPost({
          postId: currentPost._id,
          text: quickCommentText.trim(),
        })
      ).unwrap()
      setQuickCommentText('')
      showToast.success('Comment posted!')
    } catch (err) {
      showToast.error(err || 'Failed to post comment.')
    } finally {
      setIsSubmittingQuickComment(false)
    }
  }

  // Format hashtags
  const formattedContent = currentPost.content
    ? currentPost.content.replace(
        /(#\w+)/g,
        '<span class="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer">$1</span>'
      )
    : ''

  const populatedLikers = likesList.filter(
    (u) => typeof u === 'object' && u._id
  )
  const firstLiker =
    populatedLikers[0] || (likesList.length > 0 ? { full_name: 'someone' } : null)
  const totalLikes = likesList.length
  const commentsList = currentPost.comments || []

  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className='glass-card rounded-3xl p-4 sm:p-5 space-y-4 w-full max-w-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300'
    >
      {/* Post Header */}
      <div className='flex items-center justify-between'>
        <div
          onClick={() => navigate('/profile/' + authorId)}
          className='inline-flex items-center gap-3 cursor-pointer group'
        >
          <div className='relative'>
            <motion.img
              whileHover={{ scale: 1.06 }}
              src={authorPic}
              alt={authorName}
              loading='lazy'
              decoding='async'
              className='w-11 h-11 rounded-full object-cover border-2 border-indigo-500/30 shadow-xs'
            />
          </div>
          <div>
            <div className='flex items-center space-x-1.5'>
              <span className='font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition'>
                {authorName}
              </span>
              {author.is_verified && (
                <BadgeCheck className='w-4 h-4 text-blue-500 fill-blue-50' />
              )}
            </div>
            <div className='text-gray-500 dark:text-gray-400 text-xs flex items-center gap-1.5 font-medium'>
              <span>@{authorUsername}</span>
              <span>•</span>
              <span>
                {currentPost.createdAt
                  ? moment(currentPost.createdAt).fromNow()
                  : 'just now'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Header Badges & 3-Dots Menu */}
        <div className='flex items-center gap-2 flex-wrap justify-end'>
          {currentPost.target_circle && (
            <span
              className='px-2.5 py-0.5 rounded-full flex items-center gap-1 text-[11px] font-bold shadow-2xs border backdrop-blur-xs'
              style={{
                backgroundColor: `${
                  currentPost.target_circle.color || '#6366f1'
                }15`,
                borderColor: `${
                  currentPost.target_circle.color || '#6366f1'
                }40`,
                color: currentPost.target_circle.color || '#6366f1',
              }}
              title={`Shared with ${currentPost.target_circle.name}`}
            >
              <span>{currentPost.target_circle.icon || '⭐'}</span>
              <span className='truncate max-w-[120px]'>
                {currentPost.target_circle.name}
              </span>
            </span>
          )}

          {currentPost.feeling && (
            <span className='px-2.5 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-300 rounded-full flex items-center gap-1 text-[11px] font-semibold border border-purple-500/20'>
              <Smile className='w-3 h-3 text-amber-500' />
              <span>{currentPost.feeling}</span>
            </span>
          )}
          {currentPost.location && (
            <span className='px-2.5 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 rounded-full flex items-center gap-1 text-[11px] font-semibold border border-indigo-500/20'>
              <MapPin className='w-3 h-3 text-rose-500' />
              <span>{currentPost.location}</span>
            </span>
          )}

          <PostOptionsMenu post={currentPost} />
        </div>
      </div>

      {/* Post Text Content */}
      {currentPost.content && (
        <p
          className='text-gray-800 dark:text-gray-200 text-sm sm:text-base leading-relaxed whitespace-pre-line'
          dangerouslySetInnerHTML={{ __html: formattedContent }}
        />
      )}

      {/* Post Image Media Container */}
      {currentPost.image_urls && currentPost.image_urls.length > 0 && (
        <div
          onDoubleClick={handleDoubleTapMedia}
          onClick={() => setShowDetailModal(true)}
          className='relative rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/[0.08] bg-slate-900/5 dark:bg-black/30 flex items-center justify-center max-h-120 cursor-pointer select-none group'
        >
          <img
            src={currentPost.image_urls[0]}
            alt='Post media'
            loading='lazy'
            decoding='async'
            className='w-full h-auto max-h-120 object-contain rounded-2xl group-hover:scale-[1.01] transition-transform duration-300'
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
                <div className='p-4 rounded-full bg-black/40 backdrop-blur-md'>
                  <Heart className='w-16 h-16 fill-rose-500 text-rose-500 animate-pulse' />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Action Bar (Like, Comment, Share, Bookmark) */}
      <div className='flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-white/[0.06] text-gray-600 dark:text-gray-300 text-xs sm:text-sm font-semibold'>
        <div className='flex items-center gap-1.5'>
          {/* Like Button */}
          <motion.button
            type='button'
            whileTap={{ scale: 0.8 }}
            onClick={handleLike}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl transition cursor-pointer ${
              isLiked
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold'
                : 'hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-rose-600'
            }`}
          >
            <Heart
              className={`w-4 h-4 sm:w-5 sm:h-5 transition transform ${
                isLiked ? 'fill-rose-500 text-rose-500 scale-110' : ''
              }`}
            />
            <span>
              {totalLikes} {totalLikes === 1 ? 'Like' : 'Likes'}
            </span>
          </motion.button>

          {/* Comment Button */}
          <motion.button
            type='button'
            whileTap={{ scale: 0.85 }}
            onClick={() => setShowCommentsModal(true)}
            className='flex items-center gap-1.5 py-1.5 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition'
          >
            <MessageCircle className='w-4 h-4 sm:w-5 sm:h-5' />
            <span>
              {commentsList.length}{' '}
              {commentsList.length === 1 ? 'Comment' : 'Comments'}
            </span>
          </motion.button>

          {/* Share Button */}
          <motion.button
            type='button'
            whileTap={{ scale: 0.85 }}
            onClick={handleShare}
            className='flex items-center gap-1.5 py-1.5 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition'
          >
            <Share2 className='w-4 h-4 sm:w-5 sm:h-5' />
            <span>Share</span>
          </motion.button>
        </div>

        {/* Bookmark Button */}
        <motion.button
          type='button'
          whileTap={{ scale: 0.85 }}
          onClick={handleBookmark}
          className={`p-2 rounded-xl transition cursor-pointer hover:bg-slate-100 dark:hover:bg-white/[0.06] ${
            isBookmarked
              ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40'
              : 'hover:text-indigo-600 dark:hover:text-indigo-400'
          }`}
          title={isBookmarked ? 'Saved' : 'Save post'}
        >
          <Bookmark
            className={`w-4 h-4 sm:w-5 sm:h-5 ${
              isBookmarked ? 'fill-indigo-600 text-indigo-600' : ''
            }`}
          />
        </motion.button>
      </div>

      {/* Liked by Stacked Avatars Row */}
      {totalLikes > 0 && (
        <div
          onClick={() => setShowLikesModal(true)}
          className='flex items-center gap-2.5 pt-0.5 cursor-pointer group select-none'
        >
          <div className='flex items-center -space-x-2 shrink-0'>
            {populatedLikers.slice(0, 3).map((liker, i) => (
              <img
                key={liker._id || i}
                src={liker.profile_picture || '/sample_profile.jpg'}
                alt={liker.full_name || 'Liker'}
                loading='lazy'
                decoding='async'
                className='w-6 h-6 rounded-full object-cover border-2 border-white dark:border-slate-900 shadow-xs'
              />
            ))}
          </div>

          <p className='text-xs text-gray-600 dark:text-gray-300 font-normal leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition'>
            {totalLikes === 1 ? (
              <span>
                Liked by{' '}
                <strong className='font-bold text-gray-900 dark:text-white'>
                  {firstLiker?.full_name || '1 person'}
                </strong>
              </span>
            ) : (
              <span>
                Liked by{' '}
                <strong className='font-bold text-gray-900 dark:text-white'>
                  {firstLiker?.full_name || 'someone'}
                </strong>{' '}
                and{' '}
                <strong className='font-bold text-gray-900 dark:text-white'>
                  {totalLikes - 1} {totalLikes - 1 === 1 ? 'other' : 'others'}
                </strong>
              </span>
            )}
          </p>
        </div>
      )}

      {/* View Comments Link */}
      {commentsList.length > 0 && (
        <button
          type='button'
          onClick={() => setShowCommentsModal(true)}
          className='text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer text-left block font-semibold transition'
        >
          View all {commentsList.length}{' '}
          {commentsList.length === 1 ? 'comment' : 'comments'}
        </button>
      )}

      {/* Quick Add Comment Form */}
      <form
        onSubmit={handleAddQuickComment}
        className='flex items-center gap-2 pt-2 border-t border-slate-200/50 dark:border-white/[0.05]'
      >
        <div className='relative flex-1'>
          <input
            type='text'
            value={quickCommentText}
            onChange={(e) => setQuickCommentText(e.target.value)}
            placeholder='Add a comment...'
            className='w-full text-xs sm:text-sm bg-slate-100/70 dark:bg-white/[0.04] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 border border-transparent focus:border-indigo-500/40 transition'
          />
        </div>
        {quickCommentText.trim() && (
          <motion.button
            type='submit'
            whileTap={{ scale: 0.9 }}
            disabled={isSubmittingQuickComment}
            className='px-3 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:opacity-90 cursor-pointer transition shadow-xs'
          >
            {isSubmittingQuickComment ? (
              <Loader2 className='w-3.5 h-3.5 animate-spin' />
            ) : (
              'Post'
            )}
          </motion.button>
        )}
      </form>

      {/* Modals */}
      <LikesModal
        isOpen={showLikesModal}
        onClose={() => setShowLikesModal(false)}
        likes={populatedLikers.length > 0 ? populatedLikers : likesList}
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