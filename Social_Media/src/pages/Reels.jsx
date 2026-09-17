import React, { useEffect, useState, useRef } from 'react'
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Volume2,
  VolumeX,
  Play,
  Pause,
  BadgeCheck,
  Music,
  Plus,
  Loader2,
  UserPlus,
  UserCheck,
  Film,
  Camera,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchReels,
  likeUnlikePost,
  bookmarkPost,
} from '../redux/slices/postSlice'
import { toggleFollowUser } from '../redux/slices/userSlice'
import PostDetailModal from '../components/PostDetailModal'
import SharePostModal from '../components/SharePostModal'
import LikesModal from '../components/LikesModal'
import { showToast } from '../utils/toast'

// Subcomponent for a single Reel item
const ReelItem = ({
  reel,
  isActive,
  isMuted,
  onToggleMute,
  onOpenComments,
  onOpenShare,
  onOpenLikes,
}) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user: currentUser } = useSelector((state) => state.auth)

  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showHeartAnim, setShowHeartAnim] = useState(false)
  const [showPlayIcon, setShowPlayIcon] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const author = reel.user || {}
  const authorId = author._id || author
  const authorName = author.full_name || 'Creator'
  const authorUsername = author.username || 'creator'
  const authorPic = author.profile_picture || '/sample_profile.jpg'
  const isVerified = author.is_verified

  const isCurrentUser = currentUser?._id && authorId === currentUser._id

  const isFollowing =
    currentUser?.following?.some((f) =>
      (typeof f === 'object' ? f._id : f) === authorId
    ) || false

  const likesList = reel.likes_count || []
  const isLiked = likesList.some(
    (id) => (typeof id === 'object' ? id._id : id) === currentUser?._id
  )
  const totalLikes = likesList.length
  const commentsCount = reel.comments?.length || 0

  const isBookmarked = currentUser?.saved_posts?.includes(reel._id)

  const videoUrl = reel.video_urls && reel.video_urls[0]

  // Control video play/pause on active change
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (isActive) {
      video.muted = isMuted
      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Autoplay policy fallback: mute and retry
            video.muted = true
            video.play().then(() => setIsPlaying(true)).catch(() => {})
          })
      }
    } else {
      video.pause()
      video.currentTime = 0
      setIsPlaying(false)
    }
  }, [isActive, isMuted])

  // Sync mute state to video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted
    }
  }, [isMuted])

  // Toggle play/pause on click
  const handleVideoClick = () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play()
      setIsPlaying(true)
      setShowPlayIcon(false)
    } else {
      video.pause()
      setIsPlaying(false)
      setShowPlayIcon(true)
      setTimeout(() => setShowPlayIcon(false), 800)
    }
  }

  // Double tap to like
  const handleDoubleTap = (e) => {
    e.stopPropagation()
    setShowHeartAnim(true)
    setTimeout(() => setShowHeartAnim(false), 900)

    if (!isLiked && reel._id) {
      dispatch(likeUnlikePost(reel._id))
    }
  }

  const handleLikeClick = (e) => {
    e.stopPropagation()
    if (reel._id) {
      dispatch(likeUnlikePost(reel._id))
    }
  }

  const handleBookmarkClick = async (e) => {
    e.stopPropagation()
    if (reel._id) {
      try {
        const res = await dispatch(bookmarkPost(reel._id)).unwrap()
        if (res.isBookmarked) {
          showToast.success('Reel saved to bookmarks!')
        } else {
          showToast.info('Reel removed from bookmarks.')
        }
      } catch (err) {
        showToast.error(err || 'Failed to update bookmark.')
      }
    }
  }

  const handleFollowClick = (e) => {
    e.stopPropagation()
    if (authorId) {
      dispatch(toggleFollowUser(authorId))
    }
  }

  return (
    <div className='snap-start snap-always w-full h-full relative flex items-center justify-center bg-black select-none shrink-0 overflow-hidden'>
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        loop
        playsInline
        onClick={handleVideoClick}
        onDoubleClick={handleDoubleTap}
        className='w-full h-full object-cover cursor-pointer'
      />

      {/* Floating Center Heart Animation on Double Click */}
      <AnimatePresence>
        {showHeartAnim && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.4, 1], opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className='absolute inset-0 flex items-center justify-center pointer-events-none z-30'
          >
            <Heart className='w-32 h-32 text-white fill-red-500 stroke-white stroke-2 drop-shadow-[0_0_35px_rgba(239,68,68,0.8)]' />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Pause/Play Icon overlay */}
      {showPlayIcon && (
        <div className='absolute inset-0 flex items-center justify-center pointer-events-none z-20'>
          <div className='p-5 rounded-full bg-black/50 backdrop-blur-xs text-white animate-in zoom-in-75 duration-150'>
            {isPlaying ? <Play className='w-10 h-10' /> : <Pause className='w-10 h-10' />}
          </div>
        </div>
      )}

      {/* Top Floating Bar: "Reels" badge + Mute Toggle */}
      <div className='absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-auto'>
        <div className='flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-xs font-semibold'>
          <Film className='w-3.5 h-3.5 text-indigo-400' />
          <span>Reels</span>
        </div>

        <motion.button
          whileTap={{ scale: 0.85 }}
          type='button'
          onClick={(e) => {
            e.stopPropagation()
            onToggleMute()
          }}
          className='p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition cursor-pointer'
        >
          {isMuted ? <VolumeX className='w-4 h-4' /> : <Volume2 className='w-4 h-4' />}
        </motion.button>
      </div>

      {/* Bottom Left: Author info, Follow, Caption, Music */}
      <div className='absolute bottom-4 left-4 right-16 z-20 text-white space-y-2.5 pointer-events-auto'>
        {/* Author Details + Follow Button */}
        <div className='flex items-center gap-2.5 flex-wrap'>
          <div
            onClick={() => navigate('/profile/' + authorId)}
            className='flex items-center gap-2 cursor-pointer group'
          >
            <img
              src={authorPic}
              alt={authorName}
              className='w-9 h-9 rounded-full object-cover border-2 border-white/80 shadow-md'
            />
            <div className='flex items-center gap-1'>
              <span className='font-bold text-sm drop-shadow-md hover:underline'>
                {authorUsername}
              </span>
              {isVerified && (
                <BadgeCheck className='w-4 h-4 text-blue-400 fill-blue-50' />
              )}
            </div>
          </div>

          {!isCurrentUser && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              type='button'
              onClick={handleFollowClick}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                isFollowing
                  ? 'bg-white/20 hover:bg-white/30 text-white border border-white/40 backdrop-blur-xs'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </motion.button>
          )}
        </div>

        {/* Caption with Expand */}
        {reel.content && (
          <div className='text-xs sm:text-sm text-white/95 leading-snug drop-shadow-md pr-2'>
            <p className={isExpanded ? '' : 'line-clamp-2'}>
              {reel.content}
            </p>
            {reel.content.length > 80 && (
              <button
                type='button'
                onClick={() => setIsExpanded(!isExpanded)}
                className='text-[11px] font-semibold text-white/70 hover:text-white mt-0.5 cursor-pointer'
              >
                {isExpanded ? 'less' : 'more'}
              </button>
            )}
          </div>
        )}

        {/* Audio / Music Ticker */}
        <div className='flex items-center gap-2 text-xs text-white/90 drop-shadow-sm'>
          <Music className='w-3.5 h-3.5 animate-bounce shrink-0 text-indigo-300' />
          <div className='overflow-hidden whitespace-nowrap max-w-[200px]'>
            <span className='text-[11px] font-medium'>
              Original Audio • {authorName}
            </span>
          </div>
        </div>
      </div>

      {/* Right Side: Action Sidebar (Like, Comment, Share, Bookmark, Vinyl Disc) */}
      <div className='absolute bottom-6 right-3 z-20 flex flex-col items-center gap-4 text-white pointer-events-auto'>
        {/* Like Button */}
        <div className='flex flex-col items-center gap-1'>
          <motion.button
            whileTap={{ scale: 0.8 }}
            type='button'
            onClick={handleLikeClick}
            className='p-2.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md transition cursor-pointer'
          >
            <Heart
              className={`w-6 h-6 transition ${
                isLiked ? 'fill-red-500 text-red-500' : 'text-white'
              }`}
            />
          </motion.button>
          <span
            onClick={() => onOpenLikes(reel)}
            className='text-xs font-semibold drop-shadow-md cursor-pointer hover:underline'
          >
            {totalLikes}
          </span>
        </div>

        {/* Comment Button */}
        <div className='flex flex-col items-center gap-1'>
          <motion.button
            whileTap={{ scale: 0.85 }}
            type='button'
            onClick={() => onOpenComments(reel)}
            className='p-2.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md transition cursor-pointer hover:text-indigo-300'
          >
            <MessageCircle className='w-6 h-6' />
          </motion.button>
          <span className='text-xs font-semibold drop-shadow-md'>
            {commentsCount}
          </span>
        </div>

        {/* Share Button */}
        <div className='flex flex-col items-center gap-1'>
          <motion.button
            whileTap={{ scale: 0.85 }}
            type='button'
            onClick={() => onOpenShare(reel)}
            className='p-2.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md transition cursor-pointer hover:text-indigo-300'
          >
            <Share2 className='w-6 h-6' />
          </motion.button>
          <span className='text-[11px] font-semibold drop-shadow-md'>
            Share
          </span>
        </div>

        {/* Bookmark Button */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          type='button'
          onClick={handleBookmarkClick}
          className='p-2.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md transition cursor-pointer hover:text-indigo-300'
          title={isBookmarked ? 'Saved' : 'Save Reel'}
        >
          <Bookmark
            className={`w-6 h-6 ${
              isBookmarked ? 'fill-indigo-500 text-indigo-500' : 'text-white'
            }`}
          />
        </motion.button>

        {/* Spinning Vinyl Music Disc */}
        <div className='pt-1'>
          <div className='w-8 h-8 rounded-full border-2 border-white/80 p-0.5 animate-spin duration-3000 bg-black/50 shadow-md'>
            <img
              src={authorPic}
              alt='Audio artist'
              className='w-full h-full rounded-full object-cover'
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const Reels = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { reels, reelsLoading } = useSelector((state) => state.post)

  const [activeIndex, setActiveIndex] = useState(0)
  const [isMuted, setIsMuted] = useState(true)

  // Modals state
  const [selectedReelForModal, setSelectedReelForModal] = useState(null)
  const [showCommentsModal, setShowCommentsModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showLikesModal, setShowLikesModal] = useState(false)

  const containerRef = useRef(null)

  useEffect(() => {
    dispatch(fetchReels())
  }, [dispatch])

  // IntersectionObserver to detect which reel is in the viewport
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const items = container.querySelectorAll('.snap-start')
    if (items.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Array.from(items).indexOf(entry.target)
            if (index !== -1) {
              setActiveIndex(index)
            }
          }
        })
      },
      {
        root: container,
        threshold: 0.65,
      }
    )

    items.forEach((item) => observer.observe(item))

    return () => {
      items.forEach((item) => observer.unobserve(item))
    }
  }, [reels.length])

  // Keyboard navigation (Up / Down arrow keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showCommentsModal || showShareModal || showLikesModal) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        const nextIndex = Math.min(activeIndex + 1, reels.length - 1)
        scrollToIndex(nextIndex)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        const prevIndex = Math.max(activeIndex - 1, 0)
        scrollToIndex(prevIndex)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeIndex, reels.length, showCommentsModal, showShareModal, showLikesModal])

  const scrollToIndex = (index) => {
    const container = containerRef.current
    if (!container) return
    const items = container.querySelectorAll('.snap-start')
    if (items[index]) {
      items[index].scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleOpenComments = (reel) => {
    setSelectedReelForModal(reel)
    setShowCommentsModal(true)
  }

  const handleOpenShare = (reel) => {
    setSelectedReelForModal(reel)
    setShowShareModal(true)
  }

  const handleOpenLikes = (reel) => {
    setSelectedReelForModal(reel)
    setShowLikesModal(true)
  }

  if (reelsLoading && reels.length === 0) {
    return (
      <div className='w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-indigo-600 gap-3'>
        <Loader2 className='w-8 h-8 animate-spin' />
        <p className='text-sm text-gray-500 dark:text-gray-400 font-medium'>
          Loading Reels...
        </p>
      </div>
    )
  }

  if (reels.length === 0) {
    return (
      <div className='w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-4 bg-slate-50 dark:bg-slate-950'>
        <div className='p-6 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'>
          <Film className='w-12 h-12' />
        </div>
        <div className='space-y-1 max-w-sm'>
          <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
            No Reels Yet
          </h2>
          <p className='text-xs sm:text-sm text-gray-500 dark:text-gray-400'>
            Be the creator to post the very first video reel on PingUp!
          </p>
        </div>
        <button
          type='button'
          onClick={() => navigate('/create-post')}
          className='flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition shadow-sm cursor-pointer'
        >
          <Camera className='w-4 h-4' />
          <span>Create a Reel</span>
        </button>
      </div>
    )
  }

  return (
    <div className='w-full h-full flex justify-center items-center py-2 md:py-4 px-2 bg-slate-100 dark:bg-slate-950'>
      {/* Reels Snap Scroll Viewport */}
      <div
        ref={containerRef}
        className='h-[88vh] md:h-[92vh] max-h-[820px] w-full max-w-[420px] overflow-y-scroll snap-y snap-mandatory rounded-3xl shadow-2xl relative custom-scrollbar bg-black'
      >
        {reels.map((reel, index) => (
          <ReelItem
            key={reel._id || index}
            reel={reel}
            isActive={index === activeIndex}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted(!isMuted)}
            onOpenComments={handleOpenComments}
            onOpenShare={handleOpenShare}
            onOpenLikes={handleOpenLikes}
          />
        ))}
      </div>

      {/* Post & Comments Detail Modal for Reel */}
      {selectedReelForModal && (
        <PostDetailModal
          isOpen={showCommentsModal}
          onClose={() => setShowCommentsModal(false)}
          post={selectedReelForModal}
        />
      )}

      {/* Share Modal */}
      {selectedReelForModal && (
        <SharePostModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          post={selectedReelForModal}
        />
      )}

      {/* Likes Modal */}
      {selectedReelForModal && (
        <LikesModal
          isOpen={showLikesModal}
          onClose={() => setShowLikesModal(false)}
          likes={
            selectedReelForModal.likes_count?.filter((u) => typeof u === 'object' && u._id) ||
            selectedReelForModal.likes_count ||
            []
          }
        />
      )}
    </div>
  )
}

export default Reels

