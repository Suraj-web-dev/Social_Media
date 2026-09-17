import React, { useEffect, useState, useRef, useCallback } from 'react'
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
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import moment from 'moment'
import { useDispatch, useSelector } from 'react-redux'
import { deleteExistingStory } from '../redux/slices/storySlice'
import { showToast } from '../utils/toast'

const STORY_DURATION = 5000 // 5 seconds for photo/text story

const Storyviewers = ({ userGroups = [], initialUserIndex = 0, onClose }) => {
  const dispatch = useDispatch()
  const { user: currentUser } = useSelector((state) => state.auth)

  const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex)
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

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

  // Reset progress when story or user changes
  useEffect(() => {
    setProgress(0)
    setIsPaused(false)
    setShowOptions(false)
    wasHeldRef.current = false
  }, [currentUserIndex, currentStoryIndex])

  // Sync video play/pause with isPaused state
  useEffect(() => {
    if (videoRef.current) {
      if (isPaused) {
        videoRef.current.pause()
      } else {
        videoRef.current.play().catch(() => {})
      }
    }
  }, [isPaused, currentStoryIndex])

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
      // First story of first user -> restart progress
      setProgress(0)
      if (videoRef.current) {
        videoRef.current.currentTime = 0
      }
    }
  }, [currentStoryIndex, currentUserIndex, userGroups])

  // Auto-progress timer for Image and Text stories
  useEffect(() => {
    if (!currentStory || isPaused || showOptions || isDeleting) return

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
  }, [currentStory, isPaused, showOptions, isDeleting, handleNextStory])

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

  // Hold-to-pause pointer handlers
  const handlePointerDown = () => {
    wasHeldRef.current = false
    holdTimerRef.current = setTimeout(() => {
      wasHeldRef.current = true
      setIsPaused(true)
    }, 250)
  }

  const handlePointerUp = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current)
    }
    if (wasHeldRef.current) {
      setIsPaused(false)
      wasHeldRef.current = false
    }
  }

  // Delete story
  const handleDeleteStory = async () => {
    if (!currentStory?._id || isDeleting) return

    setIsDeleting(true)
    try {
      await dispatch(deleteExistingStory(currentStory._id)).unwrap()
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='fixed inset-0 z-110 h-screen w-screen bg-black flex items-center justify-center select-none overflow-hidden'
      style={{
        backgroundColor: isText
          ? currentStory.background_color || '#0f172a'
          : '#000000',
      }}
    >
      {/* Ambient background blur */}
      {!isText && currentStory.media_url && (
        <div
          className='absolute inset-0 bg-cover bg-center filter blur-3xl opacity-30 scale-125 pointer-events-none'
          style={{ backgroundImage: `url(${currentStory.media_url})` }}
        />
      )}

      {/* Main Story Card Frame */}
      <div
        className='relative w-full h-full max-w-md max-h-[100vh] sm:max-h-[92vh] sm:rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl bg-black'
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* ================= TOP CONTROLS & HEADER ================= */}
        <div className='absolute top-0 inset-x-0 z-50 p-3 sm:p-4 space-y-2.5 bg-gradient-to-b from-black/85 via-black/50 to-transparent pointer-events-auto'>
          {/* Segmented Progress Bars */}
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
                  className='h-1 flex-1 bg-white/35 rounded-full overflow-hidden'
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
            {/* User Info */}
            <div className='flex items-center gap-2.5 min-w-0'>
              <img
                src={author.profile_picture || '/sample_profile.jpg'}
                alt={author.full_name || 'Author'}
                className='w-9 h-9 rounded-full object-cover border-2 border-white/90 shadow-sm shrink-0'
              />
              <div className='min-w-0'>
                <div className='flex items-center gap-1.5'>
                  <span className='text-white text-xs sm:text-sm font-bold truncate drop-shadow-md'>
                    {author.full_name || 'User'}
                  </span>
                  {author.is_verified && (
                    <BadgeCheck className='w-4 h-4 text-blue-400 fill-blue-50 shrink-0' />
                  )}
                </div>
                <div className='flex items-center gap-1.5 text-[11px] text-white/80 drop-shadow-xs'>
                  <span>
                    {currentStory.createdAt
                      ? moment(currentStory.createdAt).fromNow()
                      : 'just now'}
                  </span>
                  {currentStories.length > 1 && (
                    <>
                      <span>•</span>
                      <span>
                        {currentStoryIndex + 1}/{currentStories.length}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Top Right Controls (Pause/Play, Sound, Delete menu, Close) */}
            <div className='flex items-center gap-1 text-white'>
              {/* Top Explicit Pause / Play Button */}
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

              {/* Delete Story Button (For Author) */}
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

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {showOptions && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -5 }}
                        className='absolute right-0 top-10 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-1.5 z-60 min-w-40'
                        onClick={(e) => e.stopPropagation()}
                      >
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

          {/* ================= DEDICATED TAP NAVIGATION ZONES ================= */}
          {/* Left Tap Zone (Previous Story) */}
          <div
            onClick={(e) => {
              e.stopPropagation()
              if (!wasHeldRef.current) {
                handlePrevStory()
              }
            }}
            className='absolute left-0 top-16 bottom-14 w-[40%] z-30 cursor-pointer'
            title='Previous Story'
          />

          {/* Right Tap Zone (Next Story) */}
          <div
            onClick={(e) => {
              e.stopPropagation()
              if (!wasHeldRef.current) {
                handleNextStory()
              }
            }}
            className='absolute right-0 top-16 bottom-14 w-[60%] z-30 cursor-pointer'
            title='Next Story'
          />

          {/* Floating On-Screen Previous Story Button */}
          {(currentStoryIndex > 0 || currentUserIndex > 0) && (
            <button
              type='button'
              onClick={(e) => {
                e.stopPropagation()
                handlePrevStory()
              }}
              className='absolute left-3 top-1/2 -translate-y-1/2 z-40 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs transition cursor-pointer'
              title='Previous Story'
            >
              <ChevronLeft className='w-5 h-5' />
            </button>
          )}

          {/* Floating On-Screen Next Story Button */}
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation()
              handleNextStory()
            }}
            className='absolute right-3 top-1/2 -translate-y-1/2 z-40 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs transition cursor-pointer'
            title='Next Story'
          >
            <ChevronRight className='w-5 h-5' />
          </button>

          {/* Large Pause Indicator Overlay */}
          <AnimatePresence>
            {isPaused && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className='absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none z-20'
              >
                <div className='p-4 rounded-full bg-black/70 text-white backdrop-blur-xs shadow-xl flex items-center gap-2'>
                  <Pause className='w-7 h-7 text-amber-400 fill-amber-400' />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Hint Bar */}
        <div className='absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between text-white/70 text-[11px] pointer-events-none z-40'>
          <span>👈 Tap left for prev</span>
          <span>⏸️ Hold / Top button to pause</span>
          <span>Tap right for next 👉</span>
        </div>
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
          className='hidden lg:flex absolute left-8 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md transition cursor-pointer z-50'
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
          className='hidden lg:flex absolute right-8 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md transition cursor-pointer z-50'
          title='Next User'
        >
          <ChevronRight className='w-6 h-6' />
        </button>
      )}
    </motion.div>
  )
}

export default Storyviewers
