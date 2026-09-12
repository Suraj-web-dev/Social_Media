import React, { useState } from 'react'
import { dummyConnectionsData } from '../assets'
import { MapPin, MessageSquare, Plus, Search, UserCheck, UserPlus, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Discover = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [users] = useState(dummyConnectionsData || [])
  
  // Track followed users and connection requests
  const [followingIds, setFollowingIds] = useState(['user_2', 'user_3'])
  const [connectionRequestedIds, setConnectionRequestedIds] = useState([])

  const handleFollowToggle = (userId) => {
    setFollowingIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleConnect = (userId) => {
    setConnectionRequestedIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const filteredUsers = users.filter(user => {
    const term = searchTerm.toLowerCase()
    return (
      user.full_name?.toLowerCase().includes(term) ||
      user.username?.toLowerCase().includes(term) ||
      user.bio?.toLowerCase().includes(term) ||
      user.location?.toLowerCase().includes(term)
    )
  })

  return (
    <div className='min-h-full p-4 sm:p-6 lg:p-10 max-w-6xl'>
      {/* Header */}
      <div>
        <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>Discover People</h1>
        <p className='text-gray-500 text-sm sm:text-base mt-1'>
          Connect with amazing people and grow your network
        </p>
      </div>

      {/* Search Bar */}
      <div className='bg-white rounded-xl p-4 shadow-sm border border-gray-100 my-6'>
        <div className='relative'>
          <Search className='w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2' />
          <input
            type='text'
            placeholder='Search people by name, username, bio, or location...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full pl-11 pr-4 py-2.5 bg-transparent rounded-lg text-sm sm:text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 border border-transparent focus:border-indigo-500 transition'
          />
        </div>
      </div>

      {/* Users Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => {
            const isFollowing = followingIds.includes(user._id)
            const isConnectionRequested = connectionRequestedIds.includes(user._id)

            return (
              <div
                key={user._id}
                className='bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-gray-100 flex flex-col items-center text-center justify-between'
              >
                {/* Profile Picture */}
                <img
                  src={user.profile_picture}
                  alt={user.full_name}
                  onClick={() => navigate(`/profile/${user._id}`)}
                  className='w-20 h-20 rounded-full object-cover shadow-sm border border-gray-100 cursor-pointer hover:scale-105 transition-transform duration-200'
                />

                {/* Info */}
                <div className='mt-3 w-full'>
                  <h3
                    onClick={() => navigate(`/profile/${user._id}`)}
                    className='font-bold text-gray-900 text-base hover:text-indigo-600 transition cursor-pointer truncate'
                  >
                    {user.full_name}
                  </h3>
                  <p className='text-xs text-gray-500 font-medium'>
                    @{user.username}
                  </p>
                  <p className='text-xs text-gray-600 mt-2.5 line-clamp-3 leading-relaxed px-1'>
                    {user.bio}
                  </p>
                </div>

                {/* Badges (Location & Followers) */}
                <div className='flex items-center justify-center gap-2 mt-4 flex-wrap'>
                  {user.location && (
                    <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] text-gray-600 bg-gray-50 border border-gray-200'>
                      <MapPin className='w-3 h-3 text-gray-400' />
                      {user.location}
                    </span>
                  )}
                  <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] text-gray-600 bg-gray-50 border border-gray-200'>
                    <Users className='w-3 h-3 text-gray-400' />
                    {user.followers?.length || 2} Followers
                  </span>
                </div>

                {/* Action Buttons */}
                <div className='flex items-center gap-2 w-full mt-6 pt-2'>
                  {/* Follow / Following Button */}
                  <button
                    onClick={() => handleFollowToggle(user._id)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 cursor-pointer transition shadow-sm active:scale-95 ${
                      isFollowing
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700'
                        : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className='w-4 h-4' />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className='w-4 h-4' />
                        <span>Follow</span>
                      </>
                    )}
                  </button>

                  {/* Secondary Action: Message (if following) OR Connect / Plus button */}
                  {isFollowing ? (
                    <button
                      title="Send Message"
                      onClick={() => navigate(`/messages/${user._id}`)}
                      className='p-2.5 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 text-gray-600 cursor-pointer transition shadow-xs'
                    >
                      <MessageSquare className='w-4 h-4' />
                    </button>
                  ) : (
                    <button
                      title={isConnectionRequested ? "Request Sent" : "Connect"}
                      onClick={() => handleConnect(user._id)}
                      className={`p-2.5 rounded-lg border cursor-pointer transition shadow-xs ${
                        isConnectionRequested
                          ? 'border-indigo-400 bg-indigo-50 text-indigo-600'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 text-gray-600'
                      }`}
                    >
                      <Plus className='w-4 h-4' />
                    </button>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div className='col-span-full text-center py-16 bg-white rounded-xl border border-gray-100 text-gray-500 text-sm'>
            No people found matching "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  )
}

export default Discover
