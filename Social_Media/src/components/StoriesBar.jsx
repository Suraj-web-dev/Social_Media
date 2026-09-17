import React, { useEffect, useState, useMemo } from 'react'
import { Plus, Sparkles, Layers } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { fetchFeedStories } from '../redux/slices/storySlice'
import StoryModal from './StoryModal'
import Storyviewers from './Storyviewers'

const StoriesBar = () => {
  const dispatch = useDispatch()
  const { user: currentUser } = useSelector((state) => state.auth)
  const { stories } = useSelector((state) => state.story)

  const [showModal, setShowModal] = useState(false)
  const [activeViewerData, setActiveViewerData] = useState(null) // { userGroups, initialUserIndex }

  useEffect(() => {
    dispatch(fetchFeedStories())
  }, [dispatch])

  // Group multiple stories by user (Instagram-style grouping)
  const { myStoryGroup, otherStoryGroups, allUserGroups } = useMemo(() => {
    const map = new Map()
    const currentId = currentUser?._id?.toString()

    stories.forEach((story) => {
      const userObj = story.user
      if (!userObj || !userObj._id) return
      const uid = userObj._id.toString()

      if (!map.has(uid)) {
        map.set(uid, {
          user: userObj,
          stories: [],
          latestStory: story,
        })
      }
      map.get(uid).stories.push(story)
    })

    const groups = Array.from(map.values())
    const myGroup = groups.find(
      (g) => g.user._id?.toString() === currentId
    ) || null
    const others = groups.filter(
      (g) => g.user._id?.toString() !== currentId
    )

    // Ordered list with logged-in user's active story first if present
    const allOrdered = myGroup ? [myGroup, ...others] : others

    return {
      myStoryGroup: myGroup,
      otherStoryGroups: others,
      allUserGroups: allOrdered,
    }
  }, [stories, currentUser])

  const userAvatar = currentUser?.profile_picture || '/sample_profile.jpg'

  const handleOpenMyStories = (e) => {
    e?.stopPropagation()
    if (myStoryGroup && myStoryGroup.stories.length > 0) {
      setActiveViewerData({
        userGroups: allUserGroups,
        initialUserIndex: 0, // My story is at index 0 in allUserGroups
      })
    } else {
      setShowModal(true)
    }
  }

  const handleOpenOtherUserStories = (targetGroup) => {
    const groupIndex = allUserGroups.findIndex(
      (g) => g.user._id?.toString() === targetGroup.user._id?.toString()
    )
    setActiveViewerData({
      userGroups: allUserGroups,
      initialUserIndex: Math.max(0, groupIndex),
    })
  }

  return (
    <div className='w-screen sm:w-[calc(100vw-240px)] lg:max-w-2xl no-scrollbar overflow-x-auto px-4 py-2'>
      <div className='flex items-center gap-3'>
        {/* ================= 1. CURRENT USER STORY CARD ================= */}
        {myStoryGroup && myStoryGroup.stories.length > 0 ? (
          // Logged-in user HAS active stories
          <motion.div
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleOpenMyStories}
            className='relative rounded-3xl shadow-xs min-w-28 max-w-28 h-40 shrink-0 cursor-pointer hover:shadow-lg overflow-hidden border border-gray-100 dark:border-slate-800 group transition-all'
            style={{
              backgroundColor:
                myStoryGroup.latestStory.media_type === 'text'
                  ? myStoryGroup.latestStory.background_color || '#4f46e5'
                  : '#0f172a',
            }}
          >
            {/* Story Thumbnail / Media */}
            {myStoryGroup.latestStory.media_type === 'image' &&
            myStoryGroup.latestStory.media_url ? (
              <img
                src={myStoryGroup.latestStory.media_url}
                alt=''
                className='absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
              />
            ) : myStoryGroup.latestStory.media_type === 'video' &&
              myStoryGroup.latestStory.media_url ? (
              <video
                src={myStoryGroup.latestStory.media_url}
                className='absolute inset-0 w-full h-full object-cover'
                muted
              />
            ) : null}

            {/* Dark Vignette Overlay */}
            <div className='absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 pointer-events-none' />

            {/* Story Avatar with Instagram Gradient Ring */}
            <div className='absolute top-2.5 left-2.5 z-10'>
              <div className='p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-md'>
                <img
                  src={userAvatar}
                  alt='Your Story'
                  className='size-7 rounded-full object-cover border-2 border-white dark:border-slate-900'
                />
              </div>
            </div>

            {/* Multiple Stories Badge Counter */}
            {myStoryGroup.stories.length > 1 && (
              <div className='absolute top-2.5 right-2.5 z-10 px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1 shadow-sm'>
                <Layers className='w-2.5 h-2.5 text-indigo-400' />
                <span>{myStoryGroup.stories.length}</span>
              </div>
            )}

            {/* Text Preview if text story */}
            {myStoryGroup.latestStory.content && (
              <p className='absolute top-12 left-2.5 right-2.5 z-10 text-white text-xs font-medium line-clamp-3 leading-tight drop-shadow-sm'>
                {myStoryGroup.latestStory.content}
              </p>
            )}

            {/* Bottom Label + Quick Add Button */}
            <div className='absolute bottom-2 left-2.5 right-2.5 z-10 flex items-center justify-between'>
              <p className='text-white text-[11px] font-bold truncate drop-shadow-xs'>
                Your Story
              </p>
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation()
                  setShowModal(true)
                }}
                className='size-5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md cursor-pointer border border-white/80 transition-transform active:scale-90'
                title='Add another story'
              >
                <Plus className='w-3 h-3' />
              </button>
            </div>
          </motion.div>
        ) : (
          // Logged-in user has NO active stories -> Show Create Story card
          <motion.div
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowModal(true)}
            className='relative rounded-3xl shadow-xs min-w-28 max-w-28 h-40 shrink-0 cursor-pointer hover:shadow-md border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-gradient-to-b from-indigo-50/70 to-white dark:from-slate-800/80 dark:to-slate-900 flex flex-col items-center justify-between p-3 overflow-hidden group transition-colors'
          >
            <div className='relative mt-2'>
              <img
                src={userAvatar}
                alt='You'
                className='w-12 h-12 rounded-full object-cover border-2 border-indigo-500 shadow-xs'
              />
              <div className='absolute -bottom-1 -right-1 size-5 bg-indigo-600 rounded-full flex items-center justify-center shadow-xs border-2 border-white dark:border-slate-900 text-white'>
                <Plus className='w-3 h-3' />
              </div>
            </div>
            <p className='text-xs font-semibold text-gray-700 dark:text-gray-200 text-center mb-1'>
              Create Story
            </p>
          </motion.div>
        )}

        {/* ================= 2. OTHER USERS' GROUPED STORY CARDS ================= */}
        {otherStoryGroups.map((group, idx) => {
          const author = group.user || {}
          const authorPic = author.profile_picture || '/sample_profile.jpg'
          const authorName = author.full_name || 'Story'
          const latestStory = group.latestStory || {}
          const storyCount = group.stories.length

          return (
            <motion.div
              key={author._id || idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: idx * 0.04 }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleOpenOtherUserStories(group)}
              className='relative rounded-3xl shadow-xs min-w-28 max-w-28 h-40 shrink-0 cursor-pointer hover:shadow-lg overflow-hidden border border-gray-100 dark:border-slate-800 group transition-all'
              style={{
                backgroundColor:
                  latestStory.media_type === 'text'
                    ? latestStory.background_color || '#4f46e5'
                    : '#0f172a',
              }}
            >
              {/* Media Preview (Image / Video) */}
              {latestStory.media_type === 'image' && latestStory.media_url ? (
                <img
                  src={latestStory.media_url}
                  alt=''
                  className='absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                />
              ) : latestStory.media_type === 'video' &&
                latestStory.media_url ? (
                <video
                  src={latestStory.media_url}
                  className='absolute inset-0 w-full h-full object-cover'
                  muted
                />
              ) : null}

              {/* Dark Vignette Overlay */}
              <div className='absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 pointer-events-none' />

              {/* Author Profile Picture with Instagram Gradient Story Ring */}
              <div className='absolute top-2.5 left-2.5 z-10'>
                <div className='p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-md'>
                  <img
                    src={authorPic}
                    alt={authorName}
                    className='size-7 rounded-full object-cover border-2 border-white dark:border-slate-900'
                  />
                </div>
              </div>

              {/* Multiple Stories Badge (e.g. 2 or 3 stories) */}
              {storyCount > 1 && (
                <div className='absolute top-2.5 right-2.5 z-10 px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1 shadow-sm'>
                  <Layers className='w-2.5 h-2.5 text-indigo-400' />
                  <span>{storyCount}</span>
                </div>
              )}

              {/* Text Content Preview */}
              {latestStory.content && (
                <p className='absolute top-12 left-2.5 right-2.5 z-10 text-white text-xs font-medium line-clamp-3 leading-tight drop-shadow-sm'>
                  {latestStory.content}
                </p>
              )}

              {/* User Full Name */}
              <p className='text-white absolute bottom-2 left-2.5 right-2.5 z-10 text-[11px] font-semibold truncate drop-shadow-xs'>
                {authorName}
              </p>
            </motion.div>
          )
        })}
      </div>

      {/* Add Story Modal */}
      {showModal && <StoryModal setShowModal={setShowModal} />}

      {/* Full Instagram-Style Story Viewer */}
      {activeViewerData && (
        <Storyviewers
          userGroups={activeViewerData.userGroups}
          initialUserIndex={activeViewerData.initialUserIndex}
          onClose={() => setActiveViewerData(null)}
        />
      )}
    </div>
  )
}

export default StoriesBar
