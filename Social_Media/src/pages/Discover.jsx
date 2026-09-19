import React, { useState, useEffect } from 'react'
import { MapPin, MessageSquare, Search, UserCheck, UserPlus, Users, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDiscoverUsers, toggleFollowUser } from '../redux/slices/userSlice'

const Discover = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { user: currentUser } = useSelector((state) => state.auth)
  const { discoverUsers, loading } = useSelector((state) => state.user)

  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    dispatch(fetchDiscoverUsers())
  }, [dispatch])

  const handleFollowToggle = (userId) => {
    dispatch(toggleFollowUser(userId))
  }

  const usersList = discoverUsers || []

  const filteredUsers = usersList.filter((user) => {
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
        <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100'>
          Discover People
        </h1>
        <p className='text-gray-500 dark:text-gray-400 text-sm sm:text-base mt-1'>
          Connect with amazing people and grow your network
        </p>
      </div>

      {/* Search Bar */}
      <div className='bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-800 my-6'>
        <div className='relative'>
          <Search className='w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2' />
          <input
            type='text'
            placeholder='Search people by name, username, bio, or location...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full pl-11 pr-4 py-2.5 bg-transparent rounded-lg text-sm sm:text-base text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 border border-transparent focus:border-indigo-500 transition'
          />
        </div>
      </div>

      {/* Users Grid */}
      {loading && usersList.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-20 gap-3 text-indigo-600'>
          <Loader2 className='w-8 h-8 animate-spin' />
          <p className='text-sm font-medium text-gray-500'>Finding people...</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => {
              const isFollowing = (currentUser?.following || []).some(
                (id) => (typeof id === 'object' ? id._id : id) === user._id
              )

              return (
                <div
                  key={user._id}
                  className='bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-gray-100 dark:border-slate-800 flex flex-col items-center text-center justify-between'
                >
                  {/* Profile Picture */}
                  <img
                    src={user.profile_picture || '/sample_profile.jpg'}
                    alt={user.full_name}
                    loading='lazy'
                    decoding='async'
                    onClick={() => navigate(`/profile/${user._id}`)}
                    className='w-20 h-20 rounded-full object-cover shadow-sm border border-gray-100 dark:border-slate-700 cursor-pointer hover:scale-105 transition-transform duration-200'
                  />

                  {/* Info */}
                  <div className='mt-3 w-full'>
                    <h3
                      onClick={() => navigate(`/profile/${user._id}`)}
                      className='font-bold text-gray-900 dark:text-gray-100 text-base hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer truncate'
                    >
                      {user.full_name}
                    </h3>
                    <p className='text-xs text-gray-500 dark:text-gray-400 font-medium'>
                      @{user.username}
                    </p>
                    {user.bio && (
                      <p className='text-xs text-gray-600 dark:text-gray-300 mt-2.5 line-clamp-3 leading-relaxed px-1'>
                        {user.bio}
                      </p>
                    )}
                  </div>

                  {/* Badges (Location & Followers) */}
                  <div className='flex items-center justify-center gap-2 mt-4 flex-wrap'>
                    {user.location && (
                      <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700'>
                        <MapPin className='w-3 h-3 text-gray-400' />
                        {user.location}
                      </span>
                    )}
                    <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700'>
                      <Users className='w-3 h-3 text-gray-400' />
                      {user.followers?.length || 0} Followers
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className='flex items-center gap-2 w-full mt-6 pt-2'>
                    {/* Follow / Following Button */}
                    <button
                      onClick={() => handleFollowToggle(user._id)}
                      className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 cursor-pointer transition shadow-xs active:scale-95 ${
                        isFollowing
                          ? 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700'
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

                    <button
                      title="Send Message"
                      onClick={() => navigate(`/messages/${user._id}`)}
                      className='p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 text-gray-600 dark:text-gray-300 cursor-pointer transition shadow-xs'
                    >
                      <MessageSquare className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              )
            })
          ) : (
            <div className='col-span-full text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 text-gray-500 dark:text-gray-400 text-sm'>
              No people found matching "{searchTerm}"
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Discover
