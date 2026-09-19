import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Heart,
  Loader2,
  Trash2,
  Edit2,
  Check,
  BadgeCheck,
  Send,
  MessageCircle,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  addCommentToPost,
  deleteCommentFromPost,
  likeUnlikeComment,
  editCommentInPost,
  toggleCommentLikeOptimistic,
} from '../redux/slices/postSlice'
import { showToast } from '../utils/toast'

const QUICK_EMOJIS = ['❤️', '🔥', '👏', '😍', '😂', '🙌', '😮', '💯']

const InstagramCommentsModal = ({ isOpen, onClose, post }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user: currentUser } = useSelector((state) => state.auth)

  const [commentText, setCommentText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingText, setEditingText] = useState('')
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false)
  const [deletingCommentId, setDeletingCommentId] = useState(null)

  const inputRef = useRef(null)
  const commentsEndRef = useRef(null)

  // Sync post from redux store
  const reduxPost = useSelector(
    (state) =>
      state.post.posts.find((p) => p._id === post?._id) ||
      state.post.userPosts.find((p) => p._id === post?._id) ||
      state.post.savedPosts.find((p) => p._id === post?._id)
  )
  const currentPost = reduxPost || post

  useEffect(() => {
    if (isOpen) {
      setCommentText('')
      setEditingCommentId(null)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 200)
    }
  }, [isOpen, post?._id])

  // Escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !currentPost) return null

  const author = currentPost.user || {}
  const authorId = author._id || author
  const authorName = author.full_name || 'User'
  const authorUsername = author.username || 'user'
  const authorPic = author.profile_picture || '/sample_profile.jpg'
  const commentsList = currentPost.comments || []

  // Add Comment
  const handleAddComment = async (e) => {
    e?.preventDefault()
    if (!commentText.trim() || isSubmitting || !currentPost._id) return

    setIsSubmitting(true)
    try {
      await dispatch(
        addCommentToPost({
          postId: currentPost._id,
          text: commentText.trim(),
        })
      ).unwrap()
      setCommentText('')
      showToast.success('Comment posted!')
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (err) {
      showToast.error(err || 'Failed to post comment.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Like / Unlike Comment
  const handleLikeComment = async (commentId) => {
    if (!commentId || !currentPost._id || !currentUser?._id) return
    dispatch(
      toggleCommentLikeOptimistic({
        postId: currentPost._id,
        commentId,
        currentUserId: currentUser._id,
      })
    )
    try {
      await dispatch(
        likeUnlikeComment({ postId: currentPost._id, commentId })
      ).unwrap()
    } catch (err) {
      dispatch(
        toggleCommentLikeOptimistic({
          postId: currentPost._id,
          commentId,
          currentUserId: currentUser._id,
        })
      )
      showToast.error(err || 'Failed to update like.')
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

  // Reply shortcut (adds @username into input)
  const handleReplyToUser = (username) => {
    setCommentText((prev) => `@${username} ${prev}`)
    inputRef.current?.focus()
  }

  const addEmoji = (emoji) => {
    setCommentText((prev) => prev + emoji)
    inputRef.current?.focus()
  }

  return createPortal(
    <div
      className='fixed inset-0 z-[120] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-in fade-in duration-150'
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        onClick={(e) => e.stopPropagation()}
        className='w-full max-w-lg h-[85vh] sm:h-[650px] bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden'
      >
        {/* Mobile Grab Pill */}
        <div className='w-full flex justify-center pt-2.5 pb-1 sm:hidden'>
          <div className='w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full' />
        </div>

        {/* Header Bar */}
        <div className='flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0'>
          <div className='flex items-center gap-2'>
            <MessageCircle className='w-4 h-4 text-indigo-600 dark:text-indigo-400' />
            <h3 className='font-bold text-sm sm:text-base text-gray-900 dark:text-white tracking-tight'>
              Comments ({commentsList.length})
            </h3>
          </div>

          <button
            type='button'
            onClick={onClose}
            className='p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Scrollable Comments Area */}
        <div className='flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar'>
          {/* Post Author Caption Header */}
          {currentPost.content && (
            <div className='flex items-start gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-800/80'>
              <img
                src={authorPic}
                alt={authorName}
                onClick={() => {
                  onClose()
                  navigate('/profile/' + authorId)
                }}
                className='size-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer'
              />
              <div className='flex-1 min-w-0 text-xs sm:text-sm text-gray-900 dark:text-gray-100 leading-relaxed'>
                <div className='flex items-center gap-1.5 flex-wrap'>
                  <span
                    onClick={() => {
                      onClose()
                      navigate('/profile/' + authorId)
                    }}
                    className='font-bold text-gray-900 dark:text-white cursor-pointer hover:underline'
                  >
                    {authorUsername}
                  </span>
                  {author.is_verified && (
                    <BadgeCheck className='w-3.5 h-3.5 text-blue-500 fill-blue-50 shrink-0' />
                  )}
                  <span className='text-[11px] text-gray-400 dark:text-gray-500 font-normal'>
                    •{' '}
                    {currentPost.createdAt
                      ? moment(currentPost.createdAt).fromNow(true)
                      : 'now'}
                  </span>
                </div>
                <p className='text-gray-800 dark:text-gray-200 mt-1 whitespace-pre-line break-words'>
                  {currentPost.content}
                </p>
              </div>
            </div>
          )}

          {/* Comments List */}
          {commentsList.length === 0 ? (
            <div className='py-16 text-center text-gray-400 dark:text-gray-500 space-y-1'>
              <p className='font-bold text-sm text-gray-700 dark:text-gray-300'>
                No comments yet
              </p>
              <p className='text-xs'>Be the first to share your thoughts!</p>
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
                    (typeof id === 'object' ? id._id : id)?.toString() ===
                    currentUser?._id?.toString()
                )
                const commentLikesCount = (comment.likes || []).length

                const isCommentAuthor =
                  currentUser?._id &&
                  commentUserId?.toString() === currentUser._id?.toString()
                const isPostAuthor =
                  currentUser?._id &&
                  authorId?.toString() === currentUser._id?.toString()
                const canDelete = isCommentAuthor || isPostAuthor
                const isEditingThis = editingCommentId === comment._id

                return (
                  <div
                    key={comment._id || index}
                    className='flex items-start gap-3 group/comment select-text'
                  >
                    <img
                      src={commentPic}
                      alt={commentName}
                      onClick={() => {
                        onClose()
                        navigate('/profile/' + commentUserId)
                      }}
                      className='size-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 cursor-pointer shrink-0 mt-0.5'
                    />

                    <div className='flex-1 min-w-0'>
                      {isEditingThis ? (
                        /* Inline Comment Edit Box */
                        <div className='space-y-2 bg-slate-100 dark:bg-slate-800/80 p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-900'>
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
                              className='px-2.5 py-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium cursor-pointer'
                            >
                              Cancel
                            </button>
                            <button
                              type='button'
                              onClick={() => handleSaveEditComment(comment._id)}
                              disabled={!editingText.trim() || isSubmittingEdit}
                              className='flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50 cursor-pointer'
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
                        /* Normal Comment Item */
                        <div>
                          <div className='text-xs sm:text-sm text-gray-900 dark:text-gray-100 leading-snug'>
                            <span
                              onClick={() => {
                                onClose()
                                navigate('/profile/' + commentUserId)
                              }}
                              className='font-bold text-gray-900 dark:text-white cursor-pointer mr-1.5 hover:underline'
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

                          {/* Metadata & Actions */}
                          <div className='flex items-center gap-3 pt-1 text-[11px] text-gray-400 dark:text-gray-500 font-medium'>
                            <span>
                              {comment.createdAt
                                ? moment(comment.createdAt).fromNow(true)
                                : 'now'}
                            </span>

                            {commentLikesCount > 0 && (
                              <span className='font-bold text-gray-600 dark:text-gray-300'>
                                {commentLikesCount}{' '}
                                {commentLikesCount === 1 ? 'like' : 'likes'}
                              </span>
                            )}

                            <button
                              type='button'
                              onClick={() => handleReplyToUser(commentUsername)}
                              className='hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold cursor-pointer'
                            >
                              Reply
                            </button>

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
                                onClick={() => handleDeleteComment(comment._id)}
                                disabled={deletingCommentId === comment._id}
                                className='hover:text-rose-500 cursor-pointer flex items-center gap-1'
                              >
                                {deletingCommentId === comment._id ? (
                                  <Loader2 className='w-2.5 h-2.5 animate-spin' />
                                ) : (
                                  'Delete'
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Comment Like Button */}
                    {!isEditingThis && (
                      <button
                        type='button'
                        onClick={() => handleLikeComment(comment._id)}
                        className='p-1 text-gray-400 hover:text-rose-500 cursor-pointer transition shrink-0'
                        title={isCommentLiked ? 'Unlike' : 'Like'}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 transition-transform active:scale-125 ${
                            isCommentLiked
                              ? 'fill-rose-500 text-rose-500'
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

        {/* Quick Emoji Reactions Bar */}
        <div className='px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex items-center justify-between shrink-0 overflow-x-auto no-scrollbar'>
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type='button'
              onClick={() => addEmoji(emoji)}
              className='text-lg sm:text-xl hover:scale-125 active:scale-95 transition-transform cursor-pointer p-0.5'
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Sticky Comment Input Bar */}
        <div className='p-3 sm:p-3.5 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900'>
          <form
            onSubmit={handleAddComment}
            className='flex items-center gap-2.5'
          >
            <img
              src={currentUser?.profile_picture || '/sample_profile.jpg'}
              alt='Current user'
              className='size-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0'
            />

            <input
              ref={inputRef}
              type='text'
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={`Add a comment for @${authorUsername}...`}
              className='flex-1 text-xs sm:text-sm bg-slate-100/80 dark:bg-white/[0.05] rounded-full px-4 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 border border-transparent focus:border-indigo-500'
            />

            <button
              type='submit'
              disabled={!commentText.trim() || isSubmitting}
              className='px-3.5 py-1.5 rounded-full text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-30 transition cursor-pointer disabled:cursor-not-allowed flex items-center gap-1 shadow-xs'
            >
              {isSubmitting ? (
                <Loader2 className='w-3.5 h-3.5 animate-spin' />
              ) : (
                'Post'
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>,
    document.body
  )
}

export default InstagramCommentsModal

