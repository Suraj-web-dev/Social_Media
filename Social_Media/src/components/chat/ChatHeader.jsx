import React from 'react'
import { ArrowLeft, BadgeCheck, Phone, User, Video } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const ChatHeader = ({ recipient }) => {
  const navigate = useNavigate()
  const { onlineUsers } = useSelector((state) => state.message)

  const recipientId = (typeof recipient === 'object' ? recipient._id : recipient) || ''
  const isPingAI = recipientId === 'pingai'
  const isOnline = isPingAI || onlineUsers.includes(recipientId.toString())

  const handleProfileClick = () => {
    if (!isPingAI && recipient._id) {
      navigate(`/profile/${recipient._id}`)
    }
  }

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
          onClick={handleProfileClick}
          className={`relative ${isPingAI ? 'cursor-default' : 'cursor-pointer'}`}
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
            onClick={handleProfileClick}
            className={`flex items-center gap-1.5 ${isPingAI ? 'cursor-default' : 'cursor-pointer group'}`}
          >
            <h3 className='font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition'>
              {recipient.full_name || 'User'}
            </h3>
            {isPingAI ? (
              <span className='px-1.5 py-0.5 text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-md border border-indigo-500/20'>
                AI BOT
              </span>
            ) : (
              recipient.is_verified && (
                <BadgeCheck className='w-4 h-4 text-blue-500 fill-blue-50' />
              )
            )}
          </div>
          <p
            className={`text-[11px] sm:text-xs font-medium ${
              isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'
            }`}
          >
            {isPingAI ? '⚡ Powered by Gemini AI • Active 24/7' : (isOnline ? 'Active now' : 'Offline')}
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className='flex items-center gap-1 sm:gap-2 text-gray-500 dark:text-gray-400'>
        {!isPingAI && (
          <button
            title='View profile'
            onClick={handleProfileClick}
            className='p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer'
          >
            <User className='w-4 h-4 sm:w-5 sm:h-5' />
          </button>
        )}
      </div>
    </div>
  )
}

export default ChatHeader
