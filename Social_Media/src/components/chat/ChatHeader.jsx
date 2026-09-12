import React from 'react'
import { ArrowLeft, BadgeCheck, MoreVertical, Phone, User, Video } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const ChatHeader = ({ recipient }) => {
  const navigate = useNavigate()

  return (
    <div className='p-3 sm:p-4 bg-white border-b border-gray-100 flex items-center justify-between shadow-xs sticky top-0 z-10'>
      {/* Left: Back button & User details */}
      <div className='flex items-center gap-3'>
        <button
          onClick={() => navigate('/messages')}
          className='p-1.5 -ml-1 hover:bg-gray-100 rounded-full text-gray-600 transition cursor-pointer'
          title='Back to messages'
        >
          <ArrowLeft className='w-5 h-5' />
        </button>

        <div
          onClick={() => navigate(`/profile/${recipient._id}`)}
          className='relative cursor-pointer'
        >
          <img
            src={recipient.profile_picture}
            alt={recipient.full_name}
            className='w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-gray-100 shadow-xs'
          />
          {/* Online green indicator */}
          <span className='absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full' />
        </div>

        <div>
          <div
            onClick={() => navigate(`/profile/${recipient._id}`)}
            className='flex items-center gap-1.5 cursor-pointer group'
          >
            <h3 className='font-semibold text-gray-900 text-sm sm:text-base group-hover:text-indigo-600 transition'>
              {recipient.full_name}
            </h3>
            {recipient.is_verified && (
              <BadgeCheck className='w-4 h-4 text-blue-500 fill-blue-50' />
            )}
          </div>
          <p className='text-[11px] sm:text-xs text-emerald-600 font-medium'>
            Active now
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className='flex items-center gap-1 sm:gap-2 text-gray-500'>
        <button
          title='Voice call'
          className='p-2 hover:bg-gray-100 rounded-full hover:text-indigo-600 transition cursor-pointer'
        >
          <Phone className='w-4 h-4 sm:w-5 sm:h-5' />
        </button>

        <button
          title='Video call'
          className='p-2 hover:bg-gray-100 rounded-full hover:text-indigo-600 transition cursor-pointer'
        >
          <Video className='w-4 h-4 sm:w-5 sm:h-5' />
        </button>

        <button
          title='View profile'
          onClick={() => navigate(`/profile/${recipient._id}`)}
          className='p-2 hover:bg-gray-100 rounded-full hover:text-indigo-600 transition cursor-pointer'
        >
          <User className='w-4 h-4 sm:w-5 sm:h-5' />
        </button>

        <button
          title='More options'
          className='p-2 hover:bg-gray-100 rounded-full hover:text-indigo-600 transition cursor-pointer'
        >
          <MoreVertical className='w-4 h-4 sm:w-5 sm:h-5' />
        </button>
      </div>
    </div>
  )
}

export default ChatHeader

