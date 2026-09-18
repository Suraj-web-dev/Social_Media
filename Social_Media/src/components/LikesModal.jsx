import React, { useState } from 'react'
import { BadgeCheck, Search, UserCheck, UserPlus, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toggleFollowUser } from '../redux/slices/userSlice'

const LikesModal = ({ isOpen, onClose, likes = [] }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user: currentUser } = useSelector((state) => state.auth)
  const [searchQuery, setSearchQuery] = useState('')

  if (!isOpen) return null

  // Filter likes based on search
  const filteredLikes = (likes || []).filter((user) => {
    const userObj = typeof user === 'object' ? user : {}
    const name = (userObj.full_name || '').toLowerCase()
    const username = (userObj.username || '').toLowerCase()
    const query = searchQuery.toLowerCase().trim()
    return name.includes(query) || username.includes(query)
  })

  const handleFollowToggle = (e, targetUserId) => {
    e.stopPropagation()
    if (targetUserId) {
      dispatch(toggleFollowUser(targetUserId))
    }
  }

  const handleUserClick = (targetUserId) => {
    if (targetUserId) {
      onClose()
      navigate(`/profile/${targetUserId}`)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='fixed inset-0 bg-black/75 backdrop-blur-xs z-[110] flex items-center justify-center p-3 sm:p-4 overflow-y-auto'
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className='bg-white dark:bg-slate-900 rounded-3xl max-w-sm sm:max-w-md w-full shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-800'>
          <div className='flex items-center gap-2'>
            <h3 className='font-bold text-base sm:text-lg text-gray-900 dark:text-gray-100'>
              Likes
            </h3>
            <span className='px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-full'>
              {likes.length}
            </span>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition cursor-pointer'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Search Bar */}
        {likes.length > 3 && (
          <div className='p-3 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50'>
            <div className='relative'>
              <Search className='w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2' />
              <input
                type='text'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search...'
                className='w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'
              />
            </div>
          </div>
        )}

        {/* Likes List */}
        <div className='max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-slate-800/60 p-2 space-y-1 custom-scrollbar'>
          {filteredLikes.length > 0 ? (
            filteredLikes.map((user, idx) => {
              const userObj = typeof user === 'object' ? user : {}
              const userId = userObj._id || user
              const userName = userObj.full_name || 'User'
              const userUsername = userObj.username || 'user'
              const userPic = userObj.profile_picture || '/sample_profile.jpg'
              const isSelf =
                currentUser?._id &&
                currentUser._id.toString() === userId?.toString()

              const isFollowing = (currentUser?.following || []).some(
                (id) =>
                  (typeof id === 'object' ? id._id.toString() : id.toString()) ===
                  userId?.toString()
              )

              return (
                <div
                  key={userId || idx}
                  onClick={() => handleUserClick(userId)}
                  className='flex items-center justify-between p-2.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800 transition cursor-pointer group'
                >
                  {/* User info */}
                  <div className='flex items-center gap-3 min-w-0 flex-1 mr-3'>
                    <img
                      src={userPic}
                      alt={userName}
                      className='w-10 h-10 rounded-full object-cover border border-gray-100 dark:border-slate-800 shadow-2xs'
                    />
                    <div className='min-w-0 flex-1'>
                      <div className='flex items-center gap-1'>
                        <span className='font-semibold text-xs sm:text-sm text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition truncate'>
                          {userName}
                        </span>
                        {userObj.is_verified && (
                          <BadgeCheck className='w-3.5 h-3.5 text-blue-500 fill-blue-50 shrink-0' />
                        )}
                      </div>
                      <p className='text-gray-500 dark:text-gray-400 text-xs truncate'>
                        @{userUsername}
                      </p>
                    </div>
                  </div>

                  {/* Follow button (if not logged in user) */}
                  {!isSelf && userId && (
                    <button
                      type='button'
                      onClick={(e) => handleFollowToggle(e, userId)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 shadow-2xs ${
                        isFollowing
                          ? 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700'
                          : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white'
                      }`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>
              )
            })
          ) : (
            <div className='text-center py-8 text-gray-400 text-xs'>
              {searchQuery ? 'No users found' : 'No likes yet'}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default LikesModal
