import React, { useState } from 'react'
import { dummyConnectionsData } from '../assets'
import { Eye, MessageSquare, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Messages = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [connections] = useState(dummyConnectionsData || [])

  const filteredConnections = connections.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className='min-h-full p-4 sm:p-6 lg:p-10 max-w-4xl'>
      {/* Header */}
      <div className='mb-6'>
        <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>Messages</h1>
        <p className='text-gray-500 text-sm sm:text-base mt-1'>
          Talk to your friends and family
        </p>
      </div>

      {/* Search Bar */}
      <div className='relative mb-6 max-w-xl'>
        <Search className='w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2' />
        <input
          type='text'
          placeholder='Search conversations...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-sm'
        />
      </div>

      {/* Users / Connections List */}
      <div className='space-y-3.5 max-w-xl'>
        {filteredConnections.length > 0 ? (
          filteredConnections.map((user) => (
            <div
              key={user._id}
              className='bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-4 border border-gray-100 flex items-start justify-between gap-4'
            >
              {/* User Avatar & Info */}
              <div
                onClick={() => navigate(`/messages/${user._id}`)}
                className='flex items-start gap-3.5 cursor-pointer flex-1 min-w-0'
              >
                <img
                  src={user.profile_picture}
                  alt={user.full_name}
                  className='w-12 h-12 rounded-full object-cover shrink-0 border border-gray-100 shadow-sm'
                />
                <div className='flex-1 min-w-0'>
                  <h3 className='font-semibold text-gray-900 text-sm sm:text-base leading-snug hover:text-indigo-600 transition truncate'>
                    {user.full_name}
                  </h3>
                  <p className='text-xs text-gray-500 font-medium'>
                    @{user.username}
                  </p>
                  <p className='text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed'>
                    {user.bio}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex flex-col items-center gap-2 shrink-0'>
                {/* Chat Button */}
                <button
                  title="Open Chat"
                  onClick={() => navigate(`/messages/${user._id}`)}
                  className='p-2 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-gray-600 cursor-pointer transition shadow-xs'
                >
                  <MessageSquare className='w-4 h-4' />
                </button>

                {/* View Profile Button */}
                <button
                  title="View Profile"
                  onClick={() => navigate(`/profile/${user._id}`)}
                  className='p-2 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-gray-600 cursor-pointer transition shadow-xs'
                >
                  <Eye className='w-4 h-4' />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className='text-center py-12 bg-white rounded-xl border border-gray-100 text-gray-500 text-sm'>
            No conversations found matching "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  )
}

export default Messages
