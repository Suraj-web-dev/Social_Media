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
} from '../redux/slices/postSlice'
import PostOptionsMenu from '../components/PostOptionsMenu'
import LikesModal from '../components/LikesModal'
import PostDetailModal from '../components/PostDetailModal'
import SharePostModal from '../components/SharePostModal'
import { showToast } from '../utils/toast'

const PostCard = ({ post }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user: currentUser } = useSelector((state) => state.auth)

  const [showHeartAnim, setShowHeartAnim] = useState(false)
  const [showLikesModal, setShowLikesModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
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
    if (currentPost._id) {
      dispatch(likeUnlikePost(currentPost._id))
    }
  }

  // Instagram-style double click on media
  const handleDoubleTapMedia = () => {
    setShowHeartAnim(true)
    setTimeout(() => {
      setShowHeartAnim(false)
    }, 850)

    if (!isLiked && currentPost._id) {
      dispatch(likeUnlikePost(currentPost._id))
    }
  }

  const handleShare = () => {
    setShowShareModal(true)
  }

  const handleBookmark = async () => {
    if (currentPost._id) {
      try {
        const res = await dispatch(bookmarkPost(currentPost._id)).unwrap()
        if (res.isBookmarked) {
          showToast.success('Post saved to bookmarks!')
        } else {
          showToast.info('Post removed from bookmarks.')
        }
      } catch (err) {
        showToast.error(err || 'Failed to update bookmark.')
      }
    }
  }

  // Handle Quick Comment from PostCard
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
        '<span class="text-indigo-600 dark:text-indigo-400 font-medium">$1</span>'
      )
    : ''

  // Likers info for Instagram-style "Liked by" text
  const populatedLikers = likesList.filter(
    (u) => typeof u === 'object' && u._id
  )
  const firstLiker =
    populatedLikers[0] || (likesList.length > 0 ? { full_name: 'someone' } : null)
  const totalLikes = likesList.length
  const commentsList = currentPost.comments || []

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className='bg-white dark:bg-slate-900 rounded-3xl shadow-sm hover:shadow-md p-4 sm:p-5 space-y-3.5 w-full max-w-2xl border border-gray-100 dark:border-slate-800 transition-shadow'
    >
      {/* Header (Author Info + Tags + 3-Dots Menu) */}
      <div className='flex items-center justify-between'>
        <div
          onClick={() => navigate('/profile/' + authorId)}
          className='inline-flex items-center gap-3 cursor-pointer group'
        >
          <motion.img
            whileHover={{ scale: 1.05 }}
            src={authorPic}
            alt={authorName}
            className='w-10 h-10 rounded-full object-cover border border-gray-100 dark:border-slate-800 shadow-xs'
          />
          <div>
            <div className='flex items-center space-x-1.5'>
              <span className='font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition'>
                {authorName}
              </span>
              {author.is_verified && (
                <BadgeCheck className='w-4 h-4 text-blue-500 fill-blue-50' />
              )}
            </div>
            <div className='text-gray-500 dark:text-gray-400 text-xs flex items-center gap-1.5'>
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

        {/* Right Header Options (Circle Badge, Tags & Instagram-style 3-Dots Menu) */}
        <div className='flex items-center gap-2 flex-wrap justify-end'>
          {/* Custom Circle Audience Badge */}
          {currentPost.target_circle && (
            <span
              className='px-2.5 py-0.5 rounded-full flex items-center gap-1 text-[11px] font-bold shadow-2xs border'
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
            <span className='px-2.5 py-0.5 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 rounded-full flex items-center gap-1 text-[11px] font-medium'>
              <Smile className='w-3 h-3 text-amber-500' />
              <span>{currentPost.feeling}</span>
            </span>
          )}
          {currentPost.location && (
            <span className='px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 rounded-full flex items-center gap-1 text-[11px] font-medium'>
              <MapPin className='w-3 h-3 text-rose-500' />
              <span>{currentPost.location}</span>
            </span>
          )}

          {/* Instagram-style 3-dots Menu Component */}
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

      {/* Post Image(s) with Double Tap Support */}
      {currentPost.image_urls && currentPost.image_urls.length > 0 && (
        <div
          onDoubleClick={handleDoubleTapMedia}
          onClick={() => setShowDetailModal(true)}
          className='relative rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 flex items-center justify-center max-h-120 cursor-pointer select-none group'
        >
          <img
            src={currentPost.image_urls[0]}
            alt='Post media'
            className='w-full h-auto max-h-120 object-contain rounded-2xl'
          />

          {/* Instagram-Style Bouncing Heart Animation on Double Click */}
          <AnimatePresence>
            {showHeartAnim && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.35, 1], opacity: 1 }}
                exit={{ scale: 1.4, opacity: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className='absolute inset-0 flex items-center justify-center pointer-events-none'
              >
                <div className='relative'>
                  <Heart className='w-24 h-24 text-white fill-red-500 stroke-white stroke-2 drop-shadow-[0_0_25px_rgba(239,68,68,0.7)]' />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Post Video(s) with Double Tap Support */}
      {currentPost.video_urls && currentPost.video_urls.length > 0 && (
        <div
          onDoubleClick={handleDoubleTapMedia}
          className='relative rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800 bg-black flex items-center justify-center max-h-120 select-none'
        >
          <video
            src={currentPost.video_urls[0]}
            controls
            className='w-full h-auto max-h-120 object-contain rounded-2xl'
          />

          {/* Instagram-Style Bouncing Heart Animation on Double Click */}
          <AnimatePresence>
            {showHeartAnim && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.35, 1], opacity: 1 }}
                exit={{ scale: 1.4, opacity: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className='absolute inset-0 flex items-center justify-center pointer-events-none'
              >
                <Heart className='w-24 h-24 text-white fill-red-500 stroke-white stroke-2 drop-shadow-[0_0_25px_rgba(239,68,68,0.7)]' />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Action Buttons (Like, Comment, Share, Bookmark) */}
      <div className='flex items-center justify-between pt-2.5 border-t border-gray-100 dark:border-slate-800 text-gray-600 dark:text-gray-400 text-xs sm:text-sm'>
        <div className='flex items-center gap-1 sm:gap-2'>
          <motion.button
            type='button'
            whileTap={{ scale: 0.8 }}
            onClick={handleLike}
            className={`flex items-center gap-1.5 cursor-pointer transition py-1 px-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 ${
              isLiked
                ? 'text-red-600 font-semibold'
                : 'hover:text-red-600'
            }`}
          >
            <Heart
              className={`w-4 h-4 sm:w-5 sm:h-5 transition transform ${
                isLiked ? 'fill-red-600 text-red-600' : ''
              }`}
            />
            <span>
              {totalLikes} {totalLikes === 1 ? 'Like' : 'Likes'}
            </span>
          </motion.button>

          <motion.button
            type='button'
            whileTap={{ scale: 0.85 }}
            onClick={() => setShowDetailModal(true)}
            className='flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition py-1 px-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800'
          >
            <MessageCircle className='w-4 h-4 sm:w-5 sm:h-5' />
            <span>
              {commentsList.length}{' '}
              {commentsList.length === 1 ? 'Comment' : 'Comments'}
            </span>
          </motion.button>

          <motion.button
            type='button'
            whileTap={{ scale: 0.85 }}
            onClick={handleShare}
            className='flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition py-1 px-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800'
          >
            <Share2 className='w-4 h-4 sm:w-5 sm:h-5' />
            <span>Share</span>
          </motion.button>
        </div>

        <motion.button
          type='button'
          whileTap={{ scale: 0.85 }}
          onClick={handleBookmark}
          className={`p-1.5 rounded-xl transition cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 ${
            isBookmarked
              ? 'text-indigo-600 dark:text-indigo-400'
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

      {/* Instagram-Style "Liked by [User] and [X] others" + Stacked Avatars */}
      {totalLikes > 0 && (
        <div
          onClick={() => setShowLikesModal(true)}
          className='flex items-center gap-2.5 pt-0.5 cursor-pointer group select-none'
        >
          {/* Stacked Likers Avatars */}
          <div className='flex items-center -space-x-2 shrink-0'>
            {populatedLikers.slice(0, 3).map((liker, i) => (
              <img
                key={liker._id || i}
                src={liker.profile_picture || '/sample_profile.jpg'}
                alt={liker.full_name || 'Liker'}
                className='w-7 h-7 rounded-full object-cover border-2 border-white dark:border-slate-900 shadow-xs'
              />
            ))}
          </div>

          {/* Liked by Text */}
          <p className='text-sm text-gray-600 dark:text-gray-300 font-normal leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition'>
            {totalLikes === 1 ? (
              <span>
                Liked by{' '}
                <strong className='font-semibold text-gray-900 dark:text-white'>
                  {firstLiker?.full_name || '1 person'}
                </strong>
              </span>
            ) : (
              <span>
                Liked by{' '}
                <strong className='font-semibold text-gray-900 dark:text-white'>
                  {firstLiker?.full_name || 'someone'}
                </strong>{' '}
                and{' '}
                <strong className='font-semibold text-gray-900 dark:text-white'>
                  {totalLikes - 1} {totalLikes - 1 === 1 ? 'other' : 'others'}
                </strong>
              </span>
            )}
          </p>
        </div>
      )}

      {/* Instagram-Style "View all X comments" prompt */}
      {commentsList.length > 0 && (
        <button
          type='button'
          onClick={() => setShowDetailModal(true)}
          className='text-xs sm:text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer text-left block font-medium transition'
        >
          View all {commentsList.length}{' '}
          {commentsList.length === 1 ? 'comment' : 'comments'}
        </button>
      )}

      {/* Quick Add Comment Bar below post */}
      <form
        onSubmit={handleAddQuickComment}
        className='flex items-center gap-2 pt-1 border-t border-gray-100 dark:border-slate-800/60'
      >
        <input
          type='text'
          value={quickCommentText}
          onChange={(e) => setQuickCommentText(e.target.value)}
          placeholder='Add a comment...'
          className='flex-1 text-xs sm:text-sm bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none py-1'
        />
        {quickCommentText.trim() && (
          <motion.button
            type='submit'
            whileTap={{ scale: 0.9 }}
            disabled={isSubmittingQuickComment}
            className='text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 cursor-pointer transition'
          >
            {isSubmittingQuickComment ? (
              <Loader2 className='w-3.5 h-3.5 animate-spin' />
            ) : (
              'Post'
            )}
          </motion.button>
        )}
      </form>

      {/* Full Likers Modal Popup */}
      <LikesModal
        isOpen={showLikesModal}
        onClose={() => setShowLikesModal(false)}
        likes={populatedLikers.length > 0 ? populatedLikers : likesList}
      />

      {/* Instagram-Style Post & Comments Detail Modal */}
      <PostDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        post={currentPost}
      />

      {/* Share Post Modal */}
      <SharePostModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        post={currentPost}
      />
    </motion.div>
  )
}

export default PostCard