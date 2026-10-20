import React, { useEffect, useState, useMemo, useRef } from 'react'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { fetchFeedStories } from '../redux/slices/storySlice'
import StoryModal from './StoryModal'
import Storyviewers from './Storyviewers'

const StoriesBar = () => {
  const dispatch = useDispatch()
  const scrollRef = useRef(null)
  const { user: currentUser } = useSelector((state) => state.auth)
  const { stories } = useSelector((state) => state.story)

  const [showModal, setShowModal] = useState(false)
  const [activeViewerData, setActiveViewerData] = useState(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    dispatch(fetchFeedStories())
  }, [dispatch])

  // Group real stories from database by creator
  const { myStoryGroup, otherStoryGroups, allUserGroups } = useMemo(() => {
    const map = new Map()
    const currentId = currentUser?._id?.toString()
    const now = Date.now()

    ;(stories || []).forEach((story) => {
      if (story.createdAt) {
        const diff = now - new Date(story.createdAt).getTime()
        if (diff > 24 * 60 * 60 * 1000) return
      }

      const userObj = story.user
      if (!userObj) return
      const uid = (typeof userObj === 'object' && userObj?._id ? userObj._id : userObj)?.toString()
      if (!uid) return

      if (!map.has(uid)) {
        map.set(uid, {
          user: typeof userObj === 'object' ? userObj : { _id: uid },
          stories: [],
          latestStory: story,
          hasUnseen: false,
        })
      }
      const group = map.get(uid)
      group.stories.push(story)

      const isViewed = story.views?.some((v) => {
        const viewerId = v.user?._id || v.user || v
        return viewerId?.toString() === currentId
      })

      if (!isViewed && uid !== currentId) {
        group.hasUnseen = true
      }
    })

    const groups = Array.from(map.values())
    const myGroup = groups.find(
      (g) => (g.user._id || g.user)?.toString() === currentId
    ) || null
    const others = groups.filter(
      (g) => (g.user._id || g.user)?.toString() !== currentId
    )

    others.sort((a, b) => (b.hasUnseen ? 1 : 0) - (a.hasUnseen ? 1 : 0))
    const allOrdered = myGroup ? [myGroup, ...others] : others

    return {
      myStoryGroup: myGroup,
      otherStoryGroups: others,
      allUserGroups: allOrdered,
    }
  }, [stories, currentUser])

  const userAvatar = currentUser?.profile_picture || '/sample_profile.jpg'

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 10)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
    const container = scrollRef.current
    if (container) {
      container.addEventListener('scroll', checkScroll)
      window.addEventListener('resize', checkScroll)
    }
    return () => {
      if (container) container.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [stories.length])

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -280 : 280
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' })
    }
  }

  const handleOpenMyStories = (e) => {
    e?.stopPropagation()
    if (myStoryGroup && myStoryGroup.stories.length > 0) {
      setActiveViewerData({
        userGroups: allUserGroups,
        initialUserIndex: 0,
      })
    } else {
      setShowModal(true)
    }
  }

  const handleOpenOtherUserStories = (targetGroup) => {
    const groupIndex = allUserGroups.findIndex(
      (g) => (g.user._id || g.user)?.toString() === (targetGroup.user._id || targetGroup.user)?.toString()
    )
    setActiveViewerData({
      userGroups: allUserGroups,
      initialUserIndex: Math.max(0, groupIndex),
    })
  }

  return (
    <div className='relative w-full group/tray select-none'>
      {/* Stories Section Header */}
      <div className='flex items-center justify-between mb-3 px-1'>
        <h2 className='text-lg sm:text-xl font-bold text-gray-900 dark:text-white'>
          Stories
        </h2>
      </div>

      {/* Left Scroll Button (Desktop) */}
      {canScrollLeft && (
        <button
          type='button'
          onClick={() => handleScroll('left')}
          className='hidden sm:flex absolute left-0 top-[58%] -translate-y-1/2 z-20 size-7 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 rounded-full shadow-lg border border-slate-200 dark:border-slate-800 items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all'
          aria-label='Scroll left'
        >
          <ChevronLeft className='w-4 h-4' />
        </button>
      )}

      {/* Right Scroll Button (Desktop) */}
      {canScrollRight && (
        <button
          type='button'
          onClick={() => handleScroll('right')}
          className='hidden sm:flex absolute right-0 top-[58%] -translate-y-1/2 z-20 size-7 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 rounded-full shadow-lg border border-slate-200 dark:border-slate-800 items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all'
          aria-label='Scroll right'
        >
          <ChevronRight className='w-4 h-4' />
        </button>
      )}

      {/* Horizontal Story Tray */}
      <div
        ref={scrollRef}
        className='flex items-center gap-4 sm:gap-5 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1'
      >
        {/* 1. Logged-in User Story */}
        <div className='flex flex-col items-center shrink-0 cursor-pointer group'>
          <div className='relative' onClick={handleOpenMyStories}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              className={`p-[2.5px] rounded-full transition-all ${
                myStoryGroup && myStoryGroup.stories.length > 0
                  ? 'bg-gradient-to-tr from-amber-400 via-rose-500 to-fuchsia-600 shadow-sm'
                  : 'border border-slate-200 dark:border-white/10'
              }`}
            >
              <div className='p-[2px] rounded-full bg-white dark:bg-[#0c101d]'>
                <img
                  src={userAvatar}
                  alt='Your story'
                  className='size-14 sm:size-16 rounded-full object-cover'
                />
              </div>
            </motion.div>

            {/* Blue Plus Icon Badge */}
            <button
              type='button'
              onClick={(e) => {
                e.stopPropagation()
                setShowModal(true)
              }}
              className='absolute bottom-0 right-0 size-5 rounded-full bg-sky-500 text-white flex items-center justify-center border-2 border-white dark:border-[#0c101d] shadow-sm cursor-pointer hover:scale-115 active:scale-90 transition-transform'
              title='Add story'
            >
              <Plus className='w-3 h-3 stroke-[3]' />
            </button>
          </div>

          <span className='text-xs text-gray-700 dark:text-gray-300 mt-1.5 truncate max-w-[72px] text-center font-medium'>
            Your story
          </span>
        </div>

        {/* 2. Real Database Stories from Other Users Only */}
        {otherStoryGroups.map((group, idx) => {
          const author = group.user || {}
          const authorPic = author.profile_picture || '/sample_profile.jpg'
          const authorName = author.full_name?.split(' ')[0] || author.username || 'creator'
          const hasUnseen = group.hasUnseen

          return (
            <motion.div
              key={author._id || idx}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => handleOpenOtherUserStories(group)}
              className='flex flex-col items-center shrink-0 cursor-pointer group'
            >
              <div className='relative'>
                <div
                  className={`p-[2.5px] rounded-full shadow-sm transition-all ${
                    hasUnseen
                      ? 'bg-gradient-to-tr from-amber-400 via-rose-500 to-fuchsia-600'
                      : 'border border-slate-300 dark:border-white/20 opacity-80'
                  }`}
                >
                  <div className='p-[2px] rounded-full bg-white dark:bg-[#0c101d]'>
                    <img
                      src={authorPic}
                      alt={authorName}
                      className='size-14 sm:size-16 rounded-full object-cover'
                    />
                  </div>
                </div>
              </div>

              <span className='text-xs text-gray-700 dark:text-gray-300 mt-1.5 truncate max-w-[72px] text-center font-medium'>
                {authorName}
              </span>
            </motion.div>
          )
        })}
      </div>

      {/* Story Creation Studio Modal */}
      <StoryModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        setShowModal={setShowModal}
      />

      {/* Fullscreen Advanced Story Viewer */}
      {activeViewerData && (
        <Storyviewers
          userGroups={activeViewerData.userGroups}
          initialUserIndex={activeViewerData.initialUserIndex}
          onClose={() => setActiveViewerData(null)}
          onAddStory={() => setShowModal(true)}
        />
      )}
    </div>
  )
}

export default StoriesBar
