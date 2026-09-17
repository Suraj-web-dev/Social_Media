import React from 'react'
import { ArrowLeft, BadgeCheck, Phone, User, Video } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const ChatHeader = ({ recipient }) => {
  const navigate = useNavigate()
  const { onlineUsers } = useSelector((state) => state.message)

  const recipientId = (typeof recipient === 'object' ? recipient._id : recipient) || ''
  const isOnline = onlineUsers.includes(recipientId.toString())

  return (
    <div className='p-3 sm:p-4 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between shadow-xs sticky top-0 z-10'>
      {/* Left: Back button & User details */}
      <div className='flex items-center gap-3'>
        <button
          onClick={() => navigate('/messages')}
          className='p-1.5 -ml-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-600 dark:text-gray-300 transition cursor-pointer'
          title='Back to messages'
        >
          <ArrowLeft className='w-5 h-5' />
        </button>

        <div
          onClick={() => navigate(`/profile/${recipient._id}`)}
          className='relative cursor-pointer'
        >
          <img
            src={recipient.profile_picture || '/sample_profile.jpg'}
            alt={recipient.full_name || 'User'}
            className='w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-gray-100 dark:border-slate-800 shadow-xs'
          />
          {/* Online green / offline indicator */}
          <span
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
              isOnline ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          />
        </div>

        <div>
          <div
            onClick={() => navigate(`/profile/${recipient._id}`)}
            className='flex items-center gap-1.5 cursor-pointer group'
          >
            <h3 className='font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition'>
              {recipient.full_name || 'User'}
            </h3>
            {recipient.is_verified && (
              <BadgeCheck className='w-4 h-4 text-blue-500 fill-blue-50' />
            )}
          </div>
          <p
            className={`text-[11px] sm:text-xs font-medium ${
              isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'
            }`}
          >
            {isOnline ? 'Active now' : 'Offline'}
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className='flex items-center gap-1 sm:gap-2 text-gray-500 dark:text-gray-400'>
        <button
          title='View profile'
          onClick={() => navigate(`/profile/${recipient._id}`)}
          className='p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer'
        >
          <User className='w-4 h-4 sm:w-5 sm:h-5' />
        </button>
      </div>
    </div>
  )
}

export default ChatHeader
