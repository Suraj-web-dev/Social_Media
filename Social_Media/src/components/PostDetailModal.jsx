import React, { useState, useRef, useEffect } from 'react'
import {
  X,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Smile,
  Send,
  Trash2,
  Edit2,
  Check,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  Loader2,
  MapPin,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  likeUnlikePost,
  addCommentToPost,
  deleteCommentFromPost,
  likeUnlikeComment,
  editCommentInPost,
  bookmarkPost,
} from '../redux/slices/postSlice'
import PostOptionsMenu from './PostOptionsMenu'
import LikesModal from './LikesModal'
import SharePostModal from './SharePostModal'
import { showToast } from '../utils/toast'

const QUICK_EMOJIS = ['❤️', '🙌', '🔥', '👏', '😍', '😂', '😮', '😢']

const PostDetailModal = ({ isOpen, onClose, post }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user: currentUser } = useSelector((state) => state.auth)

  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [showHeartAnim, setShowHeartAnim] = useState(false)
  const [showLikesModal, setShowLikesModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  // Comment state
  const [commentText, setCommentText] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingText, setEditingText] = useState('')
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false)
  const [deletingCommentId, setDeletingCommentId] = useState(null)

  const inputRef = useRef(null)
  const commentsEndRef = useRef(null)

  // Sync post from redux store if it exists
  const reduxPost = useSelector(
    (state) =>
      state.post.posts.find((p) => p._id === post?._id) ||
      state.post.userPosts.find((p) => p._id === post?._id) ||
      state.post.savedPosts.find((p) => p._id === post?._id)
  )
  const currentPost = reduxPost || post

  // Reset indices on open
  useEffect(() => {
    if (isOpen) {
      setCurrentMediaIndex(0)
      setCommentText('')
      setEditingCommentId(null)
      setShowEmojiPicker(false)
    }
  }, [isOpen, post?._id])

  // Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !showLikesModal) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, showLikesModal, onClose])

  if (!isOpen || !currentPost) return null

  const author = currentPost.user || {}
  const authorId = author._id || author
  const authorName = author.full_name || 'User'
  const authorUsername = author.username || 'user'
  const authorPic = author.profile_picture || '/sample_profile.jpg'

  const likesList = currentPost.likes_count || []
  const isPostLiked = likesList.some(
    (id) => (typeof id === 'object' ? id._id : id) === currentUser?._id
  )

  const isBookmarked = currentUser?.saved_posts?.includes(currentPost._id)

  const mediaList = [
    ...(currentPost.image_urls || []).map((url) => ({ type: 'image', url })),
    ...(currentPost.video_urls || []).map((url) => ({ type: 'video', url })),
  ]

  const commentsList = currentPost.comments || []
  const populatedLikers = likesList.filter((u) => typeof u === 'object' && u._id)
  const firstLiker =
    populatedLikers[0] || (likesList.length > 0 ? { full_name: 'someone' } : null)
  const totalLikes = likesList.length

  // Like post toggle
  const handleLikePost = () => {
    if (currentPost._id) {
      dispatch(likeUnlikePost(currentPost._id))
    }
  }

  // Double click on media to like
  const handleDoubleTapMedia = () => {
    setShowHeartAnim(true)
    setTimeout(() => {
      setShowHeartAnim(false)
    }, 900)

    if (!isPostLiked && currentPost._id) {
      dispatch(likeUnlikePost(currentPost._id))
    }
  }

  // Toggle bookmark
  const handleBookmarkPost = async () => {
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

  // Add Comment
  const handleAddComment = async (e) => {
    e?.preventDefault()
    if (!commentText.trim() || isSubmittingComment || !currentPost._id) return

    setIsSubmittingComment(true)
    try {
      await dispatch(
        addCommentToPost({ postId: currentPost._id, text: commentText.trim() })
      ).unwrap()
      setCommentText('')
      setShowEmojiPicker(false)
      showToast.success('Comment posted!')
      // Scroll comments
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (err) {
      showToast.error(err || 'Failed to post comment.')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  // Like / Unlike Comment
  const handleLikeComment = async (commentId) => {
    if (!commentId || !currentPost._id) return
    try {
      await dispatch(
        likeUnlikeComment({ postId: currentPost._id, commentId })
      ).unwrap()
    } catch (err) {
      showToast.error(err || 'Failed to update comment like.')
    }
  }

  // Start Edit Comment
  const handleStartEditComment = (comment) => {
    setEditingCommentId(comment._id)
    setEditingText(comment.text)
  }

  // Save Edit Comment
  const handleSaveEditComment = async (commentId) => {
    if (!editingText.trim() || isSubmittingEdit || !currentPost._id) return

    setIsSubmittingEdit(true)
    try {
      await dispatch(
        editCommentInPost({
          postId: currentPost._id,
          commentId,
          text: editingText.trim(),
        })
      ).unwrap()
      setEditingCommentId(null)
      showToast.success('Comment updated!')
    } catch (err) {
      showToast.error(err || 'Failed to edit comment.')
    } finally {
      setIsSubmittingEdit(false)
    }
  }

  // Delete Comment
  const handleDeleteComment = async (commentId) => {
    if (!commentId || deletingCommentId || !currentPost._id) return

    setDeletingCommentId(commentId)
    try {
      await dispatch(
        deleteCommentFromPost({ postId: currentPost._id, commentId })
      ).unwrap()
      showToast.success('Comment deleted!')
    } catch (err) {
      showToast.error(err || 'Failed to delete comment.')
    } finally {
      setDeletingCommentId(null)
    }
  }

  // Share post link / to connections
  const handleShare = () => {
    setShowShareModal(true)
  }

  // Carousel navigation
  const prevMedia = (e) => {
    e.stopPropagation()
    setCurrentMediaIndex((prev) =>
      prev === 0 ? mediaList.length - 1 : prev - 1
    )
  }

  const nextMedia = (e) => {
    e.stopPropagation()
    setCurrentMediaIndex((prev) =>
      prev === mediaList.length - 1 ? 0 : prev + 1
    )
  }

  const addEmoji = (emoji) => {
    setCommentText((prev) => prev + emoji)
    inputRef.current?.focus()
  }

  // Format hashtags
  const formattedContent = currentPost.content
    ? currentPost.content.replace(
        /(#\w+)/g,
        '<span class="text-indigo-600 dark:text-indigo-400 font-medium">$1</span>'
      )
    : ''

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-sm'
      onClick={onClose}
    >
      {/* Desktop Floating Close Button */}
      <button
        type='button'
        onClick={onClose}
        className='hidden md:flex absolute top-5 right-6 text-white hover:text-gray-300 p-2 rounded-full bg-black/40 hover:bg-black/60 transition cursor-pointer z-60'
      >
        <X className='w-6 h-6' />
      </button>

      {/* Main Modal Container (Instagram 2-Column Split) */}
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className='relative w-full max-w-5xl h-[92vh] max-h-[750px] bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-gray-100 dark:border-slate-800'
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= LEFT COLUMN: MEDIA PANEL ================= */}
        <div className='w-full md:w-[58%] h-64 sm:h-80 md:h-full bg-black flex items-center justify-center relative select-none shrink-0 overflow-hidden group/media'>
          {mediaList.length > 0 ? (
            <div
              onDoubleClick={handleDoubleTapMedia}
              className='w-full h-full flex items-center justify-center relative cursor-pointer'
            >
              {mediaList[currentMediaIndex].type === 'image' ? (
                <img
                  src={mediaList[currentMediaIndex].url}
                  alt='Post media'
                  className='w-full h-full object-contain'
                />
              ) : (
                <video
                  src={mediaList[currentMediaIndex].url}
                  controls
                  className='w-full h-full object-contain'
                />
              )}

              {/* Heart animation on double click */}
              {showHeartAnim && (
                <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                  <div className='animate-ping duration-500'>
                    <Heart className='w-28 h-28 text-white fill-red-500 stroke-white stroke-2 drop-shadow-2xl' />
                  </div>
                </div>
              )}

              {/* Carousel Arrows */}
              {mediaList.length > 1 && (
                <>
                  <button
                    type='button'
                    onClick={prevMedia}
                    className='absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition opacity-90 group-hover/media:opacity-100 cursor-pointer shadow-lg'
                  >
                    <ChevronLeft className='w-5 h-5' />
                  </button>
                  <button
                    type='button'
                    onClick={nextMedia}
                    className='absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition opacity-90 group-hover/media:opacity-100 cursor-pointer shadow-lg'
                  >
                    <ChevronRight className='w-5 h-5' />
                  </button>

                  {/* Carousel Dots */}
                  <div className='absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full'>
                    {mediaList.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          idx === currentMediaIndex
                            ? 'bg-white w-3'
                            : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            // Text-Only Post Aesthetic Gradient Display
            <div
              onDoubleClick={handleDoubleTapMedia}
              className='w-full h-full p-8 flex flex-col justify-center items-center text-center bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white relative cursor-pointer select-none'
            >
              <div className='max-w-md space-y-4'>
                <p className='text-lg sm:text-xl md:text-2xl font-medium leading-relaxed italic'>
                  "{currentPost.content}"
                </p>
                <div className='flex items-center justify-center gap-2 text-xs text-indigo-200'>
                  <span>— {authorName}</span>
                  {currentPost.location && (
                    <>
                      <span>•</span>
                      <span className='flex items-center gap-1'>
                        <MapPin className='w-3 h-3' /> {currentPost.location}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Heart animation on double click */}
              {showHeartAnim && (
                <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                  <div className='animate-ping duration-500'>
                    <Heart className='w-28 h-28 text-white fill-red-500 stroke-white stroke-2 drop-shadow-2xl' />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ================= RIGHT COLUMN: COMMENTS & ENGAGEMENT PANEL ================= */}
        <div className='w-full md:w-[42%] h-full flex flex-col bg-white dark:bg-slate-900 min-h-0'>
          {/* Header (Author Info + Options + Mobile Close) */}
          <div className='flex items-center justify-between p-3.5 sm:p-4 border-b border-gray-100 dark:border-slate-800 shrink-0'>
            <div
              onClick={() => {
                onClose()
                navigate('/profile/' + authorId)
              }}
              className='flex items-center gap-3 cursor-pointer group'
            >
              <img
                src={authorPic}
                alt={authorName}
                className='w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-slate-700 shadow-xs'
              />
              <div>
                <div className='flex items-center space-x-1.5'>
                  <span className='font-semibold text-gray-900 dark:text-gray-100 text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition'>
                    {authorUsername}
                  </span>
                  {author.is_verified && (
                    <BadgeCheck className='w-4 h-4 text-blue-500 fill-blue-50' />
                  )}
                </div>
                {currentPost.location && (
                  <span className='text-[11px] text-gray-500 dark:text-gray-400 block -mt-0.5'>
                    {currentPost.location}
                  </span>
                )}
              </div>
            </div>

            <div className='flex items-center gap-1.5'>
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
                  <span className='truncate max-w-[100px]'>
                    {currentPost.target_circle.name}
                  </span>
                </span>
              )}

              <PostOptionsMenu post={currentPost} />
              <button
                type='button'
                onClick={onClose}
                className='md:hidden p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg'
              >
                <X className='w-5 h-5' />
              </button>
            </div>
          </div>

          {/* Middle Scrollable Section (Caption + Comments List) */}
          <div className='flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar min-h-0'>
            {/* Post Author Caption */}
            {currentPost.content && (
              <div className='flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-slate-800/80'>
                <img
                  src={authorPic}
                  alt={authorName}
                  onClick={() => {
                    onClose()
                    navigate('/profile/' + authorId)
                  }}
                  className='w-8 h-8 rounded-full object-cover border border-gray-100 dark:border-slate-800 shrink-0 cursor-pointer'
                />
                <div className='flex-1 text-xs sm:text-sm text-gray-900 dark:text-gray-100 leading-relaxed space-y-1'>
                  <div>
                    <span
                      onClick={() => {
                        onClose()
                        navigate('/profile/' + authorId)
                      }}
                      className='font-semibold text-gray-900 dark:text-gray-100 cursor-pointer mr-2 hover:underline'
                    >
                      {authorUsername}
                    </span>
                    <span
                      className='text-gray-800 dark:text-gray-200 whitespace-pre-line'
                      dangerouslySetInnerHTML={{ __html: formattedContent }}
                    />
                  </div>
                  <div className='text-[11px] text-gray-400 dark:text-gray-500 pt-0.5'>
                    {currentPost.createdAt
                      ? moment(currentPost.createdAt).fromNow()
                      : 'just now'}
                  </div>
                </div>
              </div>
            )}

            {/* Comments List */}
            {commentsList.length === 0 ? (
              <div className='py-12 text-center text-gray-500 dark:text-gray-400 space-y-1'>
                <p className='font-semibold text-sm text-gray-700 dark:text-gray-300'>
                  No comments yet.
                </p>
                <p className='text-xs'>Start the conversation.</p>
              </div>
            ) : (
              <div className='space-y-4'>
                {commentsList.map((comment, index) => {
                  const commentUser = comment.user || {}
                  const commentUserId = commentUser._id || commentUser
                  const commentName = commentUser.full_name || 'User'
                  const commentUsername = commentUser.username || 'user'
                  const commentPic =
                    commentUser.profile_picture || '/sample_profile.jpg'
                  const isVerified = commentUser.is_verified

                  const isCommentLiked = (comment.likes || []).some(
                    (id) =>
                      (typeof id === 'object' ? id._id : id) === currentUser?._id
                  )
                  const commentLikesCount = (comment.likes || []).length

                  const isCommentAuthor =
                    currentUser?._id && commentUserId === currentUser._id
                  const isPostAuthor =
                    currentUser?._id && authorId === currentUser._id
                  const canDelete = isCommentAuthor || isPostAuthor

                  const isEditingThis = editingCommentId === comment._id

                  return (
                    <div
                      key={comment._id || index}
                      className='flex items-start gap-3 group/comment'
                    >
                      <img
                        src={commentPic}
                        alt={commentName}
                        onClick={() => {
                          onClose()
                          navigate('/profile/' + commentUserId)
                        }}
                        className='w-8 h-8 rounded-full object-cover border border-gray-100 dark:border-slate-800 cursor-pointer shrink-0 mt-0.5'
                      />

                      <div className='flex-1 min-w-0'>
                        {isEditingThis ? (
                          // Inline Comment Editing Box
                          <div className='space-y-2 bg-gray-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-900'>
                            <textarea
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              rows={2}
                              className='w-full text-xs sm:text-sm bg-transparent border-none outline-none resize-none text-gray-900 dark:text-gray-100'
                            />
                            <div className='flex items-center justify-end gap-2'>
                              <button
                                type='button'
                                onClick={() => setEditingCommentId(null)}
                                className='px-2.5 py-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium'
                              >
                                Cancel
                              </button>
                              <button
                                type='button'
                                onClick={() => handleSaveEditComment(comment._id)}
                                disabled={
                                  !editingText.trim() || isSubmittingEdit
                                }
                                className='flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50'
                              >
                                {isSubmittingEdit ? (
                                  <Loader2 className='w-3 h-3 animate-spin' />
                                ) : (
                                  <Check className='w-3 h-3' />
                                )}
                                <span>Save</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Normal Comment Display
                          <div>
                            <div className='text-xs sm:text-sm text-gray-900 dark:text-gray-100 leading-snug'>
                              <span
                                onClick={() => {
                                  onClose()
                                  navigate('/profile/' + commentUserId)
                                }}
                                className='font-semibold text-gray-900 dark:text-gray-100 cursor-pointer mr-1.5 hover:underline'
                              >
                                {commentUsername}
                              </span>
                              {isVerified && (
                                <BadgeCheck className='w-3.5 h-3.5 text-blue-500 fill-blue-50 inline-block mr-1.5 -mt-0.5' />
                              )}
                              <span className='text-gray-800 dark:text-gray-200 break-words whitespace-pre-line'>
                                {comment.text}
                              </span>
                            </div>

                            {/* Comment Metadata & Actions (Timestamp, Likes, Edit, Delete) */}
                            <div className='flex items-center gap-3 pt-1 text-[11px] text-gray-400 dark:text-gray-500 font-medium'>
                              <span>
                                {comment.createdAt
                                  ? moment(comment.createdAt).fromNow(true)
                                  : 'now'}
                              </span>

                              {commentLikesCount > 0 && (
                                <span className='font-semibold text-gray-600 dark:text-gray-300'>
                                  {commentLikesCount}{' '}
                                  {commentLikesCount === 1 ? 'like' : 'likes'}
                                </span>
                              )}

                              {isCommentAuthor && (
                                <button
                                  type='button'
                                  onClick={() => handleStartEditComment(comment)}
                                  className='hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer'
                                >
                                  Edit
                                </button>
                              )}

                              {canDelete && (
                                <button
                                  type='button'
                                  onClick={() =>
                                    handleDeleteComment(comment._id)
                                  }
                                  disabled={deletingCommentId === comment._id}
                                  className='hover:text-red-600 dark:hover:text-red-400 cursor-pointer flex items-center gap-1'
                                >
                                  {deletingCommentId === comment._id ? (
                                    <Loader2 className='w-2.5 h-2.5 animate-spin' />
                                  ) : (
                                    'Delete'
                                  )}
                                </button>
                              )}

                              {comment.updatedAt && (
                                <span className='text-[10px] text-gray-400'>
                                  (edited)
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Comment Like Heart Button (Instagram Right Side) */}
                      {!isEditingThis && (
                        <button
                          type='button'
                          onClick={() => handleLikeComment(comment._id)}
                          className='p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 cursor-pointer transition shrink-0'
                          title={isCommentLiked ? 'Unlike' : 'Like'}
                        >
                          <Heart
                            className={`w-3.5 h-3.5 transition transform active:scale-125 ${
                              isCommentLiked
                                ? 'fill-red-500 text-red-500'
                                : 'text-gray-400'
                            }`}
                          />
                        </button>
                      )}
                    </div>
                  )
                })}
                <div ref={commentsEndRef} />
              </div>
            )}
          </div>

          {/* Bottom Engagement Panel (Likes, Actions, Date) */}
          <div className='p-3.5 sm:p-4 border-t border-gray-100 dark:border-slate-800 shrink-0 space-y-2.5 bg-white dark:bg-slate-900'>
            {/* Action Buttons Row */}
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4 text-gray-700 dark:text-gray-300'>
                <button
                  type='button'
                  onClick={handleLikePost}
                  className={`cursor-pointer transition transform active:scale-125 ${
                    isPostLiked ? 'text-red-600' : 'hover:text-red-600'
                  }`}
                >
                  <Heart
                    className={`w-6 h-6 ${
                      isPostLiked ? 'fill-red-600 text-red-600' : ''
                    }`}
                  />
                </button>

                <button
                  type='button'
                  onClick={() => inputRef.current?.focus()}
                  className='hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition'
                >
                  <MessageCircle className='w-6 h-6' />
                </button>

                <button
                  type='button'
                  onClick={handleShare}
                  className='hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition'
                >
                  <Share2 className='w-6 h-6' />
                </button>
              </div>

              <button
                type='button'
                onClick={handleBookmarkPost}
                className={`cursor-pointer transition ${
                  isBookmarked
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600'
                }`}
              >
                <Bookmark
                  className={`w-6 h-6 ${
                    isBookmarked ? 'fill-indigo-600 text-indigo-600' : ''
                  }`}
                />
              </button>
            </div>

            {/* Likes Count & Modal Trigger */}
            {totalLikes > 0 ? (
              <div
                onClick={() => setShowLikesModal(true)}
                className='flex items-center gap-2 cursor-pointer group'
              >
                {/* Stacked Likers Avatars */}
                <div className='flex items-center -space-x-1.5 shrink-0'>
                  {populatedLikers.slice(0, 3).map((liker, i) => (
                    <img
                      key={liker._id || i}
                      src={liker.profile_picture || '/sample_profile.jpg'}
                      alt={liker.full_name || 'Liker'}
                      className='w-5 h-5 rounded-full object-cover border border-white dark:border-slate-900 shadow-2xs'
                    />
                  ))}
                </div>
                <p className='text-xs sm:text-sm font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition'>
                  {totalLikes === 1
                    ? `Liked by ${firstLiker?.full_name || '1 person'}`
                    : `Liked by ${firstLiker?.full_name || 'someone'} and ${
                        totalLikes - 1
                      } others`}
                </p>
              </div>
            ) : (
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                Be the first to <span className='font-semibold text-gray-700 dark:text-gray-300 cursor-pointer' onClick={handleLikePost}>like this</span>
              </p>
            )}

            {/* Post Date */}
            <div className='text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500'>
              {currentPost.createdAt
                ? moment(currentPost.createdAt).format('MMMM D, YYYY')
                : 'RECENT'}
            </div>
          </div>

          {/* Bottom Sticky Add Comment Bar */}
          <div className='relative p-3 sm:px-4 border-t border-gray-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900'>
            {/* Quick Emoji Strip */}
            {showEmojiPicker && (
              <div className='absolute bottom-full left-0 right-0 p-2 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 flex items-center justify-around animate-in slide-in-from-bottom-2 duration-150'>
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type='button'
                    onClick={() => addEmoji(emoji)}
                    className='text-xl hover:scale-130 transition transform cursor-pointer'
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={handleAddComment}
              className='flex items-center gap-2.5'
            >
              <button
                type='button'
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                className={`p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer transition ${
                  showEmojiPicker ? 'text-indigo-600 dark:text-indigo-400' : ''
                }`}
              >
                <Smile className='w-5 h-5' />
              </button>

              <input
                ref={inputRef}
                type='text'
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder='Add a comment...'
                className='flex-1 text-xs sm:text-sm bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none'
              />

              <button
                type='submit'
                disabled={!commentText.trim() || isSubmittingComment}
                className='text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 disabled:opacity-30 disabled:hover:text-indigo-600 transition cursor-pointer disabled:cursor-not-allowed'
              >
                {isSubmittingComment ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : (
                  'Post'
                )}
              </button>
            </form>
          </div>
        </div>
      </motion.div>

      {/* Nested Likes Modal for Likers list */}
      <LikesModal
        isOpen={showLikesModal}
        onClose={() => setShowLikesModal(false)}
        likes={populatedLikers.length > 0 ? populatedLikers : likesList}
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

export default PostDetailModal

