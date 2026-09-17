import React, { useState, useRef, useEffect } from 'react'
import {
  MoreHorizontal,
  Trash2,
  UserMinus,
  UserPlus,
  Copy,
  Check,
  Bookmark,
  Share2,
  Loader2,
} from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { deleteExistingPost, bookmarkPost } from '../redux/slices/postSlice'
import { toggleFollowUser } from '../redux/slices/userSlice'
import { showToast } from '../utils/toast'

const PostOptionsMenu = ({ post }) => {
  const dispatch = useDispatch()
  const menuRef = useRef(null)

  const { user: currentUser } = useSelector((state) => state.auth)

  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const author = post.user || {}
  const authorId = (typeof author === 'object' ? author._id : author) || ''
  const isOwner = currentUser?._id && authorId.toString() === currentUser._id.toString()

  const isFollowing = (currentUser?.following || []).some(
    (id) => (typeof id === 'object' ? id._id : id) === authorId
  )

  const isSaved = (currentUser?.saved_posts || []).some(
    (id) =>
      (typeof id === 'object' ? id._id.toString() : id.toString()) ===
      post._id?.toString()
  )

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Handle Delete Post
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      setIsDeleting(true)
      const res = await dispatch(deleteExistingPost(post._id))
      setIsDeleting(false)
      setIsOpen(false)
      if (deleteExistingPost.fulfilled.match(res)) {
        showToast.success('Post deleted successfully')
      } else {
        showToast.error(res.payload || 'Failed to delete post')
      }
    }
  }

  // Handle Copy Post Link
  const handleCopyLink = () => {
    const isReel = Boolean(
      post.is_reel ||
        (post.video_urls && post.video_urls.length > 0 && !post.image_urls?.length) ||
        (post.video_url && !post.image_urls?.length)
    )
    const postUrl = `${window.location.origin}/${isReel ? 'reels' : 'post'}/${post._id}`
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(postUrl)
    } else {
      const textArea = document.createElement('textarea')
      textArea.value = postUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
    setCopied(true)
    showToast.success('Link copied to clipboard')
    setTimeout(() => {
      setCopied(false)
      setIsOpen(false)
    }, 1200)
  }

  // Handle Follow / Unfollow Author (no toast as requested)
  const handleFollowToggle = () => {
    if (authorId) {
      dispatch(toggleFollowUser(authorId))
      setIsOpen(false)
    }
  }

  // Handle Bookmark / Save
  const handleToggleSave = async () => {
    if (post?._id) {
      const res = await dispatch(bookmarkPost(post._id))
      if (bookmarkPost.fulfilled.match(res)) {
        showToast.success(
          res.payload.isBookmarked
            ? 'Post saved to bookmarks'
            : 'Removed from bookmarks'
        )
      }
    }
    setIsOpen(false)
  }

  return (
    <div className='relative' ref={menuRef}>
      {/* 3-Dots Trigger Button */}
      <button
        type='button'
        onClick={() => setIsOpen(!isOpen)}
        className='p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition cursor-pointer'
        title='More options'
      >
        <MoreHorizontal className='w-5 h-5' />
      </button>

      {/* Dropdown Popup Menu */}
      {isOpen && (
        <div className='absolute right-0 top-8 z-50 w-48 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl py-1.5 text-xs sm:text-sm font-medium animate-in fade-in zoom-in-95 duration-150 overflow-hidden'>
          {/* Copy Link Option */}
          <button
            type='button'
            onClick={handleCopyLink}
            className='w-full px-3.5 py-2.5 flex items-center gap-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800/80 transition text-left cursor-pointer'
          >
            {copied ? (
              <>
                <Check className='w-4 h-4 text-emerald-500' />
                <span className='text-emerald-600 dark:text-emerald-400 font-semibold'>
                  Link Copied!
                </span>
              </>
            ) : (
              <>
                <Copy className='w-4 h-4 text-gray-400' />
                <span>Copy Link</span>
              </>
            )}
          </button>

          {/* Bookmark / Save Post */}
          <button
            type='button'
            onClick={handleToggleSave}
            className='w-full px-3.5 py-2.5 flex items-center gap-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800/80 transition text-left cursor-pointer'
          >
            <Bookmark
              className={`w-4 h-4 ${
                isSaved ? 'text-indigo-600 fill-indigo-600' : 'text-gray-400'
              }`}
            />
            <span>{isSaved ? 'Saved' : 'Save Post'}</span>
          </button>

          {/* Follow / Unfollow Option (if not post owner) */}
          {!isOwner && authorId && (
            <button
              type='button'
              onClick={handleFollowToggle}
              className='w-full px-3.5 py-2.5 flex items-center gap-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800/80 transition text-left cursor-pointer'
            >
              {isFollowing ? (
                <>
                  <UserMinus className='w-4 h-4 text-amber-500' />
                  <span>Unfollow @{author.username || 'user'}</span>
                </>
              ) : (
                <>
                  <UserPlus className='w-4 h-4 text-indigo-500' />
                  <span>Follow @{author.username || 'user'}</span>
                </>
              )}
            </button>
          )}

          {/* Delete Option (if author of the post) */}
          {isOwner && (
            <>
              <div className='border-t border-gray-100 dark:border-slate-800 my-1' />
              <button
                type='button'
                disabled={isDeleting}
                onClick={handleDelete}
                className='w-full px-3.5 py-2.5 flex items-center gap-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-left cursor-pointer disabled:opacity-50 font-semibold'
              >
                {isDeleting ? (
                  <>
                    <Loader2 className='w-4 h-4 animate-spin text-red-500' />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className='w-4 h-4' />
                    <span>Delete Post</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default PostOptionsMenu

