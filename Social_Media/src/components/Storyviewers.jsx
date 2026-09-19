import React, { useEffect, useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  BadgeCheck,
  X,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Loader2,
  Pause,
  Play,
  Volume2,
  VolumeX,
  Heart,
  Send,
  Eye,
  Music,
  MapPin,
  Clock,
  Smile,
  Plus,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import moment from 'moment'
import { useDispatch, useSelector } from 'react-redux'
import {
  deleteExistingStory,
  viewStory,
  likeStory,
  replyToStory,
  fetchStoryViewers,
  toggleStoryLikeOptimistic,
} from '../redux/slices/storySlice'
import { showToast } from '../utils/toast'

const STORY_DURATION = 5000 // 5 seconds for photo or text stories

const FILTERS_MAP = {
  normal: '',
  vintage: 'sepia(40%) contrast(110%) brightness(95%)',
  noir: 'grayscale(100%) contrast(125%)',
  sunset: 'hue-rotate(-15deg) saturate(140%) contrast(105%)',
  warm: 'sepia(25%) saturate(130%) brightness(105%)',
  cyberpunk: 'hue-rotate(180deg) saturate(160%)',
}

const QUICK_EMOJIS = ['❤️', '🔥', '😂', '😮', '😍', '👏', '🎉', '💯']

const Storyviewers = ({ userGroups = [], initialUserIndex = 0, onClose, onAddStory }) => {
  const dispatch = useDispatch()
  const { user: currentUser } = useSelector((state) => state.auth)

  const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex)
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  // Interactions State
  const [replyText, setReplyText] = useState('')
  const [isSendingReply, setIsSendingReply] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showViewersSheet, setShowViewersSheet] = useState(false)
  const [viewersData, setViewersData] = useState([])
  const [loadingViewers, setLoadingViewers] = useState(false)
  const [floatingHeart, setFloatingHeart] = useState(false)

  const videoRef = useRef(null)
  const holdTimerRef = useRef(null)
  const wasHeldRef = useRef(false)

  // Current active user group and story
  const currentUserGroup = userGroups[currentUserIndex] || null
  const currentStories = currentUserGroup?.stories || []
  const currentStory = currentStories[currentStoryIndex] || null

  const author = currentUserGroup?.user || {}
  const authorId = author._id || author
  const isAuthor =
    currentUser?._id && authorId?.toString() === currentUser._id?.toString()

  const isLiked = currentStory?.likes?.some(
    (uid) => (uid._id || uid)?.toString() === currentUser?._id?.toString()
  )

  // Calculate 24-hour remaining time
  const getRemainingTime = (createdAt) => {
    if (!createdAt) return '24h left'
    const expiresAt = moment(createdAt).add(24, 'hours')
    const diffHours = expiresAt.diff(moment(), 'hours')
    if (diffHours > 0) return `${diffHours}h left`
    const diffMinutes = expiresAt.diff(moment(), 'minutes')
    return `${Math.max(1, diffMinutes)}m left`
  }

  // Reset progress and record view on story/user change
  useEffect(() => {
    setProgress(0)
    setIsPaused(false)
    setShowOptions(false)
    setShowViewersSheet(false)
    wasHeldRef.current = false

    if (currentStory?._id && currentUser?._id) {
      dispatch(
        viewStory({
          storyId: currentStory._id,
          currentUserId: currentUser._id,
        })
      )
    }
  }, [currentUserIndex, currentStoryIndex, currentStory?._id, currentUser?._id, dispatch])

  // Sync video play/pause with isPaused
  useEffect(() => {
    if (videoRef.current) {
      if (isPaused || showViewersSheet) {
        videoRef.current.pause()
      } else {
        videoRef.current.play().catch(() => {})
      }
    }
  }, [isPaused, currentStoryIndex, showViewersSheet])

  // Next Story navigation
  const handleNextStory = useCallback(() => {
    if (!currentUserGroup) {
      onClose()
      return
    }

    if (currentStoryIndex < currentStories.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1)
      setProgress(0)
    } else if (currentUserIndex < userGroups.length - 1) {
      setCurrentUserIndex((prev) => prev + 1)
      setCurrentStoryIndex(0)
      setProgress(0)
    } else {
      onClose()
    }
  }, [
    currentStoryIndex,
    currentStories.length,
    currentUserIndex,
    userGroups.length,
    currentUserGroup,
    onClose,
  ])

  // Previous Story navigation
  const handlePrevStory = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1)
      setProgress(0)
    } else if (currentUserIndex > 0) {
      const prevUserIndex = currentUserIndex - 1
      const prevUserStories = userGroups[prevUserIndex]?.stories || []
      setCurrentUserIndex(prevUserIndex)
      setCurrentStoryIndex(Math.max(0, prevUserStories.length - 1))
      setProgress(0)
    } else {
      setProgress(0)
      if (videoRef.current) {
        videoRef.current.currentTime = 0
      }
    }
  }, [currentStoryIndex, currentUserIndex, userGroups])

  // Auto-progress timer for Image and Text stories
  useEffect(() => {
    if (!currentStory || isPaused || showOptions || isDeleting || showViewersSheet) return

    if (currentStory.media_type !== 'video') {
      const step = 50
      const increment = (step / STORY_DURATION) * 100

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            handleNextStory()
            return 100
          }
          return prev + increment
        })
      }, step)

      return () => clearInterval(interval)
    }
  }, [currentStory, isPaused, showOptions, isDeleting, showViewersSheet, handleNextStory])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowRight') {
        handleNextStory()
      } else if (e.key === 'ArrowLeft') {
        handlePrevStory()
      } else if (e.key === ' ') {
        e.preventDefault()
        setIsPaused((p) => !p)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNextStory, handlePrevStory, onClose])

  // Hold-to-pause pointer handlers (Prevents click bubbling on long press release)
  const handlePointerDown = () => {
    wasHeldRef.current = false
    holdTimerRef.current = setTimeout(() => {
      wasHeldRef.current = true
      setIsPaused(true)
    }, 180)
  }

  const handlePointerUp = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current)
    }
    if (wasHeldRef.current) {
      setIsPaused(false)
      // Keep wasHeldRef true for a short duration to suppress following click event
      setTimeout(() => {
        wasHeldRef.current = false
      }, 120)
    }
  }

  const handleTapLeft = (e) => {
    e?.stopPropagation()
    if (!wasHeldRef.current) {
      handlePrevStory()
    }
  }

  const handleTapRight = (e) => {
    e?.stopPropagation()
    if (!wasHeldRef.current) {
      handleNextStory()
    }
  }

  // Like Story Handler
  const handleToggleLike = async (e) => {
    e?.stopPropagation()
    if (!currentStory?._id || !currentUser?._id) return

    if (!isLiked) {
      setFloatingHeart(true)
      setTimeout(() => setFloatingHeart(false), 900)
    }

    dispatch(
      toggleStoryLikeOptimistic({
        storyId: currentStory._id,
        currentUserId: currentUser._id,
      })
    )

    dispatch(
      likeStory({
        storyId: currentStory._id,
        currentUserId: currentUser._id,
      })
    ).unwrap().catch(() => {
      dispatch(
        toggleStoryLikeOptimistic({
          storyId: currentStory._id,
          currentUserId: currentUser._id,
        })
      )
    })
  }

  // Quick Emoji Reaction Handler
  const handleSendEmoji = async (emoji, e) => {
    e?.stopPropagation()
    if (!currentStory?._id) return

    try {
      await dispatch(
        replyToStory({
          storyId: currentStory._id,
          emoji,
        })
      ).unwrap()
      showToast.success(`Sent ${emoji} reaction!`)
      setShowEmojiPicker(false)
    } catch (err) {
      showToast.error(err || 'Failed to send reaction.')
    }
  }

  // Send Direct Message Reply
  const handleSendReply = async (e) => {
    e?.preventDefault()
    if (!replyText.trim() || !currentStory?._id || isSendingReply) return

    setIsSendingReply(true)
    try {
      await dispatch(
        replyToStory({
          storyId: currentStory._id,
          text: replyText.trim(),
        })
      ).unwrap()
      showToast.success('Reply sent as direct message!')
      setReplyText('')
      setIsPaused(false)
    } catch (err) {
      showToast.error(err || 'Failed to send reply.')
    } finally {
      setIsSendingReply(false)
    }
  }

  // Fetch Viewers Sheet (For Author)
  const handleOpenViewersSheet = async (e) => {
    e?.stopPropagation()
    if (!currentStory?._id || !isAuthor) return

    setShowViewersSheet(true)
    setIsPaused(true)
    setLoadingViewers(true)
    try {
      const res = await dispatch(fetchStoryViewers(currentStory._id)).unwrap()
      setViewersData(res.viewers || [])
    } catch (err) {
      setViewersData(currentStory.views || [])
    } finally {
      setLoadingViewers(false)
    }
  }

  // Delete story
  const handleDeleteStory = async () => {
    if (!currentStory?._id || isDeleting) return

    setIsDeleting(true)
    try {
      await dispatch(deleteExistingStory(currentStory._id)).unwrap()
      dispatch(fetchFeedStories())
      showToast.success('Story deleted successfully!')
      setShowOptions(false)

      if (currentStories.length > 1) {
        if (currentStoryIndex >= currentStories.length - 1) {
          setCurrentStoryIndex(Math.max(0, currentStories.length - 2))
        }
        setProgress(0)
      } else if (userGroups.length > 1) {
        if (currentUserIndex >= userGroups.length - 1) {
          setCurrentUserIndex(Math.max(0, userGroups.length - 2))
        }
        setCurrentStoryIndex(0)
        setProgress(0)
      } else {
        onClose()
      }
    } catch (err) {
      showToast.error(err || 'Failed to delete story.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (!currentUserGroup || !currentStory) return null

  const isText = currentStory.media_type === 'text'
  const isVideo = currentStory.media_type === 'video'
  const isImage = currentStory.media_type === 'image'
  const activeFilterStyle = FILTERS_MAP[currentStory.filter] || ''

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='fixed inset-0 z-[100] h-screen w-screen bg-black/95 flex items-center justify-center select-none overflow-hidden backdrop-blur-lg'
      style={{
        backgroundColor: isText
          ? currentStory.background_color || '#0f172a'
          : '#000000',
      }}
    >
      {/* Ambient background blur */}
      {!isText && currentStory.media_url && (
        <div
          className='absolute inset-0 bg-cover bg-center filter blur-3xl opacity-25 scale-125 pointer-events-none'
          style={{ backgroundImage: `url(${currentStory.media_url})` }}
        />
      )}

      {/* Main Story Card Frame */}
      <div
        className='relative w-full h-full max-w-md max-h-[100vh] sm:max-h-[94vh] sm:rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl bg-black border border-white/10'
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* ================= TOP CONTROLS & HEADER ================= */}
        <div className='absolute top-0 inset-x-0 z-50 p-3 sm:p-4 space-y-2.5 bg-gradient-to-b from-black/90 via-black/50 to-transparent pointer-events-auto'>
          {/* Segmented Clickable Progress Bars */}
          <div className='flex items-center gap-1.5 w-full'>
            {currentStories.map((s, idx) => {
              let fillWidth = '0%'
              if (idx < currentStoryIndex) {
                fillWidth = '100%'
              } else if (idx === currentStoryIndex) {
                fillWidth = `${progress}%`
              }

              return (
                <div
                  key={s._id || idx}
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentStoryIndex(idx)
                    setProgress(0)
                  }}
                  className='h-1 flex-1 bg-white/35 hover:bg-white/50 rounded-full overflow-hidden cursor-pointer transition-colors'
                  title={`Jump to story ${idx + 1}`}
                >
                  <div
                    className='h-full bg-white transition-[width] duration-75 ease-linear rounded-full'
                    style={{ width: fillWidth }}
                  />
                </div>
              )
            })}
          </div>

          {/* User Info Bar + Top Action Buttons */}
          <div className='flex items-center justify-between'>
            {/* Author Info */}
            <div className='flex items-center gap-2.5 min-w-0'>
              <img
                src={author.profile_picture || '/sample_profile.jpg'}
                alt={author.full_name || 'Author'}
                className='size-9 rounded-full object-cover border-2 border-white/90 shadow-sm shrink-0'
              />
              <div className='min-w-0'>
                <div className='flex items-center gap-1.5'>
                  <span className='text-white text-xs sm:text-sm font-bold truncate drop-shadow-md'>
                    {author.username || author.full_name || 'User'}
                  </span>
                  {author.is_verified && (
                    <BadgeCheck className='w-4 h-4 text-blue-400 fill-blue-50 shrink-0' />
                  )}
                  {currentStory.target_circle === 'close_friends' && (
                    <span className='size-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30' title='Close Friends Story' />
                  )}
                </div>
                <div className='flex items-center gap-1.5 text-[11px] text-white/80 drop-shadow-xs'>
                  <span>
                    {currentStory.createdAt
                      ? moment(currentStory.createdAt).fromNow(true)
                      : 'just now'}
                  </span>
                  <span>•</span>
                  <span className='flex items-center gap-0.5 text-amber-300 font-medium'>
                    <Clock className='w-3 h-3' />
                    {getRemainingTime(currentStory.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Top Right Controls */}
            <div className='flex items-center gap-1 text-white'>
              {/* Pause / Play Button */}
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation()
                  setIsPaused((prev) => !prev)
                }}
                className='p-1.5 rounded-full hover:bg-white/20 transition cursor-pointer text-white'
                title={isPaused ? 'Resume story' : 'Pause story'}
              >
                {isPaused ? (
                  <Play className='w-5 h-5 text-amber-400 fill-amber-400' />
                ) : (
                  <Pause className='w-5 h-5' />
                )}
              </button>

              {/* Video Audio Mute Toggle */}
              {isVideo && (
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsMuted(!isMuted)
                    if (videoRef.current) {
                      videoRef.current.muted = !isMuted
                    }
                  }}
                  className='p-1.5 rounded-full hover:bg-white/20 transition cursor-pointer'
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <VolumeX className='w-5 h-5' />
                  ) : (
                    <Volume2 className='w-5 h-5' />
                  )}
                </button>
              )}

              {/* Add Story Button (Author Only) */}
              {isAuthor && onAddStory && (
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsPaused(true)
                    onAddStory()
                  }}
                  className='p-1.5 rounded-full hover:bg-white/20 transition cursor-pointer text-white flex items-center gap-1 text-xs font-semibold'
                  title='Add another story'
                >
                  <Plus className='w-5 h-5' />
                </button>
              )}

              {/* Delete Menu (Author Only) */}
              {isAuthor && (
                <div className='relative'>
                  <button
                    type='button'
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowOptions((prev) => !prev)
                    }}
                    className='p-1.5 rounded-full hover:bg-white/20 transition cursor-pointer text-white'
                    title='Story options'
                  >
                    <MoreVertical className='w-5 h-5' />
                  </button>

                  <AnimatePresence>
                    {showOptions && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -5 }}
                        className='absolute right-0 top-10 bg-slate-900/95 border border-slate-700 rounded-2xl shadow-2xl p-1.5 z-60 min-w-40 backdrop-blur-md'
                        onClick={(e) => e.stopPropagation()}
                      >
                        {onAddStory && (
                          <button
                            type='button'
                            onClick={() => {
                              setShowOptions(false)
                              setIsPaused(true)
                              onAddStory()
                            }}
                            className='w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition cursor-pointer'
                          >
                            <Plus className='w-4 h-4 text-indigo-400' />
                            <span>Add to Story</span>
                          </button>
                        )}
                        <button
                          type='button'
                          onClick={handleDeleteStory}
                          disabled={isDeleting}
                          className='w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer disabled:opacity-50'
                        >
                          {isDeleting ? (
                            <Loader2 className='w-4 h-4 animate-spin' />
                          ) : (
                            <Trash2 className='w-4 h-4 text-rose-500' />
                          )}
                          <span>Delete Story</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Close Button */}
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation()
                  onClose()
                }}
                className='p-1.5 rounded-full hover:bg-white/20 transition cursor-pointer'
                title='Close'
              >
                <X className='w-6 h-6' />
              </button>
            </div>
          </div>
        </div>

        {/* ================= STORY MEDIA CONTENT ================= */}
        <div className='w-full h-full flex items-center justify-center relative overflow-hidden bg-black'>
          {isImage && (
            <img
              src={currentStory.media_url}
              alt='Story media'
              className='w-full h-full object-contain'
              style={{ filter: activeFilterStyle }}
            />
          )}

          {isVideo && (
            <video
              ref={videoRef}
              src={currentStory.media_url}
              className='w-full h-full object-contain'
              autoPlay
              playsInline
              muted={isMuted}
              style={{ filter: activeFilterStyle }}
              onTimeUpdate={(e) => {
                if (e.target.duration && !isPaused) {
                  setProgress(
                    (e.target.currentTime / e.target.duration) * 100
                  )
                }
              }}
              onEnded={handleNextStory}
            />
          )}

          {isText && (
            <div
              className='w-full h-full flex items-center justify-center p-8 text-white text-xl sm:text-2xl md:text-3xl font-bold text-center leading-relaxed max-w-sm select-text'
              style={{
                backgroundColor: currentStory.background_color || '#4f46e5',
              }}
            >
              {currentStory.content}
            </div>
          )}

          {/* Caption Overlay */}
          {currentStory.caption && (
            <div className='absolute bottom-20 inset-x-4 flex justify-center pointer-events-none z-35'>
              <span className='px-4 py-2 rounded-full bg-black/65 backdrop-blur-md text-white text-xs sm:text-sm font-medium border border-white/10 shadow-lg text-center max-w-xs'>
                {currentStory.caption}
              </span>
            </div>
          )}

          {/* Music / Location Overlay Badges */}
          <div className='absolute top-24 left-3 flex flex-col gap-1.5 pointer-events-none z-35'>
            {currentStory.music?.title && (
              <span className='flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur text-xs font-semibold text-white border border-white/10 shadow-md'>
                <Music className='w-3.5 h-3.5 text-pink-400' />
                <span>{currentStory.music.title}</span>
              </span>
            )}
            {currentStory.location && (
              <span className='flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur text-xs font-semibold text-white border border-white/10 shadow-md'>
                <MapPin className='w-3.5 h-3.5 text-rose-400' />
                <span>{currentStory.location}</span>
              </span>
            )}
          </div>

          {/* Floating Big Heart on Like */}
          <AnimatePresence>
            {floatingHeart && (
              <motion.div
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: 1, scale: 1.4, y: -40 }}
                exit={{ opacity: 0, scale: 1.8 }}
                transition={{ duration: 0.6 }}
                className='absolute inset-0 flex items-center justify-center pointer-events-none z-45'
              >
                <Heart className='w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-2xl' />
              </motion.div>
            )}
          </AnimatePresence>

          {/* TAP NAVIGATION ZONES */}
          {/* Left Tap Zone (Previous Story) */}
          <div
            onClick={handleTapLeft}
            className='absolute left-0 top-16 bottom-20 w-[35%] z-30 cursor-pointer'
            title='Previous Story'
          />

          {/* Right Tap Zone (Next Story) */}
          <div
            onClick={handleTapRight}
            className='absolute right-0 top-16 bottom-20 w-[65%] z-30 cursor-pointer'
            title='Next Story'
          />

          {/* Large Pause Indicator Overlay */}
          <AnimatePresence>
            {isPaused && !showViewersSheet && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className='absolute inset-0 flex items-center justify-center bg-black/35 pointer-events-none z-20'
              >
                <div className='p-4 rounded-full bg-black/75 text-white backdrop-blur-xs shadow-xl flex items-center gap-2'>
                  <Pause className='w-7 h-7 text-amber-400 fill-amber-400' />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ================= BOTTOM BAR (REPLY / VIEWS / LIKES) ================= */}
        <div className='absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/95 via-black/70 to-transparent pointer-events-auto z-40 space-y-2'>
          {/* Quick Emoji Reaction Strip (Popdown) */}
          <AnimatePresence>
            {showEmojiPicker && !isAuthor && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className='flex items-center justify-between gap-1 p-2 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-700 shadow-xl'
                onClick={(e) => e.stopPropagation()}
              >
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type='button'
                    onClick={(e) => handleSendEmoji(emoji, e)}
                    className='text-xl hover:scale-130 active:scale-95 transition-transform cursor-pointer p-1'
                  >
                    {emoji}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {isAuthor ? (
            /* CREATOR VIEW: View Count & Viewers Sheet Button */
            <div className='flex items-center justify-between px-2 py-1'>
              <button
                type='button'
                onClick={handleOpenViewersSheet}
                className='flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur cursor-pointer transition'
              >
                <Eye className='w-4 h-4 text-white' />
                <span>{currentStory.views?.length || 0} Views</span>
              </button>

              <div className='flex items-center gap-1.5 text-xs text-white/80'>
                <Heart className='w-4 h-4 text-rose-500 fill-rose-500' />
                <span>{currentStory.likes?.length || 0}</span>
              </div>
            </div>
          ) : (
            /* VIEWER VIEW: Reply Input + Emoji Picker + Like Button */
            <form
              onSubmit={handleSendReply}
              className='flex items-center gap-2'
              onClick={(e) => e.stopPropagation()}
            >
              {/* Reply text input */}
              <div className='relative flex-1 flex items-center'>
                <input
                  type='text'
                  placeholder={`Reply to ${author.username || 'creator'}...`}
                  value={replyText}
                  onFocus={() => setIsPaused(true)}
                  onChange={(e) => setReplyText(e.target.value)}
                  className='w-full pl-3.5 pr-9 py-2.5 rounded-full bg-white/10 hover:bg-white/15 focus:bg-black/60 text-white placeholder-white/60 text-xs sm:text-sm border border-white/20 focus:border-white focus:outline-none backdrop-blur-md transition'
                />
                {/* Emoji toggle inside input */}
                <button
                  type='button'
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className='absolute right-2.5 p-1 text-white/70 hover:text-white transition cursor-pointer'
                  title='Quick reactions'
                >
                  <Smile className='w-4 h-4' />
                </button>
              </div>

              {/* Send reply button */}
              {replyText.trim() ? (
                <button
                  type='submit'
                  disabled={isSendingReply}
                  className='p-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md cursor-pointer transition active:scale-95 disabled:opacity-50'
                >
                  {isSendingReply ? (
                    <Loader2 className='w-4 h-4 animate-spin' />
                  ) : (
                    <Send className='w-4 h-4' />
                  )}
                </button>
              ) : (
                /* Heart Like Button */
                <button
                  type='button'
                  onClick={handleToggleLike}
                  className='p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur transition cursor-pointer active:scale-90'
                  title={isLiked ? 'Unlike' : 'Like'}
                >
                  <Heart
                    className={`w-5 h-5 transition-colors ${
                      isLiked ? 'text-rose-500 fill-rose-500' : 'text-white'
                    }`}
                  />
                </button>
              )}
            </form>
          )}
        </div>

        {/* ================= VIEWERS BOTTOM SHEET MODAL (FOR AUTHOR) ================= */}
        <AnimatePresence>
          {showViewersSheet && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: '0%' }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className='absolute inset-x-0 bottom-0 max-h-[70%] bg-slate-900/98 backdrop-blur-xl border-t border-slate-700 rounded-t-3xl p-4 z-70 flex flex-col shadow-2xl'
              onClick={(e) => e.stopPropagation()}
            >
              <div className='flex items-center justify-between pb-3 border-b border-slate-800'>
                <div className='flex items-center gap-2'>
                  <Eye className='w-4 h-4 text-indigo-400' />
                  <h3 className='text-sm font-bold text-white'>
                    Story Viewers ({viewersData.length})
                  </h3>
                </div>
                <button
                  type='button'
                  onClick={() => {
                    setShowViewersSheet(false)
                    setIsPaused(false)
                  }}
                  className='p-1 text-gray-400 hover:text-white rounded-lg'
                >
                  <X className='w-5 h-5' />
                </button>
              </div>

              {/* Viewers List */}
              <div className='flex-1 overflow-y-auto no-scrollbar py-2 space-y-2 mt-1'>
                {loadingViewers ? (
                  <div className='flex items-center justify-center py-8 text-gray-400 gap-2 text-xs'>
                    <Loader2 className='w-4 h-4 animate-spin text-indigo-400' />
                    <span>Loading viewers...</span>
                  </div>
                ) : viewersData.length === 0 ? (
                  <div className='text-center py-8 text-xs text-gray-400'>
                    No views yet. Share your story with friends!
                  </div>
                ) : (
                  viewersData.map((v, idx) => {
                    const viewerUser = v.user || v
                    return (
                      <div
                        key={viewerUser._id || idx}
                        className='flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/60 transition'
                      >
                        <div className='flex items-center gap-2.5 min-w-0'>
                          <img
                            src={
                              viewerUser.profile_picture ||
                              '/sample_profile.jpg'
                            }
                            alt={viewerUser.username || 'User'}
                            className='size-8 rounded-full object-cover border border-slate-700'
                          />
                          <div className='min-w-0'>
                            <p className='text-xs font-semibold text-white truncate'>
                              {viewerUser.username || viewerUser.full_name || 'User'}
                            </p>
                            <p className='text-[10px] text-gray-400 truncate'>
                              {v.viewedAt
                                ? moment(v.viewedAt).fromNow()
                                : 'viewed'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop Side Navigation Arrows */}
      {currentUserIndex > 0 && (
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation()
            setCurrentUserIndex((prev) => prev - 1)
            setCurrentStoryIndex(0)
            setProgress(0)
          }}
          className='hidden lg:flex absolute left-8 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md transition cursor-pointer z-50 shadow-lg'
          title='Previous User'
        >
          <ChevronLeft className='w-6 h-6' />
        </button>
      )}

      {currentUserIndex < userGroups.length - 1 && (
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation()
            setCurrentUserIndex((prev) => prev + 1)
            setCurrentStoryIndex(0)
            setProgress(0)
          }}
          className='hidden lg:flex absolute right-8 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md transition cursor-pointer z-50 shadow-lg'
          title='Next User'
        >
          <ChevronRight className='w-6 h-6' />
        </button>
      )}
    </motion.div>,
    document.body
  )
}

export default Storyviewers
