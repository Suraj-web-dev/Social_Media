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

  // Group stories by creator and evaluate seen vs unseen status
  const { myStoryGroup, otherStoryGroups, allUserGroups } = useMemo(() => {
    const map = new Map()
    const currentId = currentUser?._id?.toString()

    const now = Date.now()

    stories.forEach((story) => {
      // Check 24-hour expiration
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

      // Check if current user has viewed this specific story
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

    // Sort others: unviewed stories first, then viewed
    others.sort((a, b) => (b.hasUnseen ? 1 : 0) - (a.hasUnseen ? 1 : 0))

    const allOrdered = myGroup ? [myGroup, ...others] : others

    return {
      myStoryGroup: myGroup,
      otherStoryGroups: others,
      allUserGroups: allOrdered,
    }
  }, [stories, currentUser])

  const userAvatar = currentUser?.profile_picture || '/sample_profile.jpg'

  // Check scroll buttons visibility
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
    <div className='relative w-full group/tray select-none py-2 px-1'>
      {/* Left Scroll Button (Desktop) */}
      {canScrollLeft && (
        <button
          type='button'
          onClick={() => handleScroll('left')}
          className='hidden sm:flex absolute left-1 top-1/2 -translate-y-1/2 z-20 size-7 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 rounded-full shadow-md border border-slate-200 dark:border-slate-800 items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all duration-150'
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
          className='hidden sm:flex absolute right-1 top-1/2 -translate-y-1/2 z-20 size-7 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 rounded-full shadow-md border border-slate-200 dark:border-slate-800 items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all duration-150'
          aria-label='Scroll right'
        >
          <ChevronRight className='w-4 h-4' />
        </button>
      )}

      {/* Horizontal Story Tray */}
      <div
        ref={scrollRef}
        className='flex items-center gap-3.5 sm:gap-4.5 overflow-x-auto no-scrollbar scroll-smooth px-2 py-1'
      >
        {/* ================= 1. LOGGED-IN USER STORY ================= */}
        <div className='flex flex-col items-center shrink-0 cursor-pointer group'>
          {myStoryGroup && myStoryGroup.stories.length > 0 ? (
            /* User HAS active stories -> Instagram gradient ring */
            <div className='relative' onClick={handleOpenMyStories}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                className='p-[2.5px] rounded-full bg-[linear-gradient(45deg,#f09433_0%,#e6683c_25%,#dc2743_50%,#cc2366_75%,#bc1888_100%)] shadow-xs'
              >
                <div className='p-[2px] rounded-full bg-white dark:bg-[#0B0F19]'>
                  <img
                    src={userAvatar}
                    alt='Your story'
                    loading='lazy'
                    decoding='async'
                    className='size-14 sm:size-16 rounded-full object-cover'
                  />
                </div>
              </motion.div>

              {/* Plus Badge to Add Another Story */}
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation()
                  setShowModal(true)
                }}
                className='absolute -bottom-0.5 -right-0.5 size-5 sm:size-5.5 rounded-full bg-blue-600 text-white flex items-center justify-center border-2 border-white dark:border-[#0B0F19] shadow-xs cursor-pointer hover:scale-115 active:scale-95 transition-transform'
                title='Add another story'
              >
                <Plus className='w-3 h-3 stroke-[3]' />
              </button>
            </div>
          ) : (
            /* User has NO active story */
            <div className='relative' onClick={() => setShowModal(true)}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                className='p-[2px] rounded-full border border-slate-300 dark:border-slate-700 hover:border-blue-500 transition-colors'
              >
                <img
                  src={userAvatar}
                  alt='Your story'
                  loading='lazy'
                  decoding='async'
                  className='size-14 sm:size-16 rounded-full object-cover'
                />
              </motion.div>

              {/* Blue Plus Icon Badge */}
              <div className='absolute -bottom-0.5 -right-0.5 size-5 sm:size-5.5 rounded-full bg-blue-500 text-white flex items-center justify-center border-2 border-white dark:border-[#0B0F19] shadow-xs'>
                <Plus className='w-3 h-3 stroke-[3]' />
              </div>
            </div>
          )}

          <span className='text-[11px] sm:text-[12px] text-gray-800 dark:text-gray-200 mt-1.5 truncate max-w-[68px] sm:max-w-[76px] text-center font-normal tracking-tight'>
            Your story
          </span>
        </div>

        {/* ================= 2. OTHER CREATORS' STORIES ================= */}
        {otherStoryGroups.map((group, idx) => {
          const author = group.user || {}
          const authorPic = author.profile_picture || '/sample_profile.jpg'
          const username = author.username || author.full_name || 'creator'
          const hasCircleStory = group.stories.some(
            (s) => s.target_circle === 'close_friends'
          )
          const hasUnseen = group.hasUnseen

          return (
            <motion.div
              key={author._id || idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: idx * 0.02 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => handleOpenOtherUserStories(group)}
              className='flex flex-col items-center shrink-0 cursor-pointer group'
            >
              <div className='relative'>
                {/* Official Instagram Ring */}
                <div
                  className={`p-[2.5px] rounded-full shadow-xs transition-all ${
                    hasUnseen
                      ? hasCircleStory
                        ? 'bg-[linear-gradient(45deg,#10b981_0%,#059669_50%,#047857_100%)]'
                        : 'bg-[linear-gradient(45deg,#f09433_0%,#e6683c_25%,#dc2743_50%,#cc2366_75%,#bc1888_100%)]'
                      : 'bg-slate-300 dark:bg-slate-700/80 opacity-75'
                  }`}
                >
                  <div className='p-[2px] rounded-full bg-white dark:bg-[#0B0F19]'>
                    <img
                      src={authorPic}
                      alt={username}
                      loading='lazy'
                      decoding='async'
                      className='size-14 sm:size-16 rounded-full object-cover'
                    />
                  </div>
                </div>
              </div>

              {/* Exact Instagram Username Truncation */}
              <span
                className={`text-[11px] sm:text-[12px] mt-1.5 truncate max-w-[68px] sm:max-w-[76px] text-center font-normal tracking-tight transition-colors ${
                  hasUnseen
                    ? 'text-gray-900 dark:text-gray-100 font-medium'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {username}
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
