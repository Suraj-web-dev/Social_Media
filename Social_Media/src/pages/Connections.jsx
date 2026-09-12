import React, { useState } from 'react'
import {
  dummyConnectionsData,
  dummyFollowersData,
  dummyFollowingData,
  dummyPendingConnectionsData
} from '../assets'
import { Clock, MessageSquare, UserCheck, UserPlus, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Connections = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('followers')

  // Stats data mapped with their datasets
  const tabs = [
    {
      id: 'followers',
      label: 'Followers',
      count: dummyFollowersData?.length || 0,
      icon: Users,
      data: dummyFollowersData || []
    },
    {
      id: 'following',
      label: 'Following',
      count: dummyFollowingData?.length || 0,
      icon: UserCheck,
      data: dummyFollowingData || []
    },
    {
      id: 'pending',
      label: 'Pending',
      count: dummyPendingConnectionsData?.length || 0,
      icon: Clock,
      data: dummyPendingConnectionsData || []
    },
    {
      id: 'connections',
      label: 'Connections',
      count: dummyConnectionsData?.length || 0,
      icon: UserPlus,
      data: dummyConnectionsData || []
    }
  ]

  const currentTabData = tabs.find(tab => tab.id === activeTab)?.data || []

  return (
    <div className='min-h-full p-4 sm:p-6 lg:p-10 max-w-5xl'>
      {/* Header */}
      <div>
        <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>Connections</h1>
        <p className='text-gray-500 text-sm sm:text-base mt-1'>
          Manage your network and discover new connections
        </p>
      </div>

      {/* Top Stat Summary Cards */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 my-6'>
        {tabs.map(tab => (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`bg-white rounded-xl p-4 sm:p-5 shadow-sm border cursor-pointer transition-all duration-200 text-center hover:shadow-md ${
              activeTab === tab.id
                ? 'border-indigo-400 ring-2 ring-indigo-500/10'
                : 'border-gray-100 hover:border-gray-200'
            }`}
          >
            <h3 className='text-xl sm:text-2xl font-bold text-gray-900'>
              {tab.count}
            </h3>
            <p className='text-xs sm:text-sm text-gray-500 font-medium mt-0.5'>
              {tab.label}
            </p>
          </div>
        ))}
      </div>

      {/* Filter / Tab Bar */}
      <div className='flex items-center gap-2 sm:gap-4 border-b border-gray-200 pb-2 mb-6 overflow-x-auto no-scrollbar'>
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap cursor-pointer transition-all duration-200 ${
                isActive
                  ? 'text-gray-900 border-b-2 border-indigo-600 rounded-b-none font-semibold'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Connection User Cards Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {currentTabData.length > 0 ? (
          currentTabData.map((user, idx) => (
            <div
              key={user._id || idx}
              className='bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-5 border border-gray-100 flex flex-col justify-between'
            >
              {/* User Details */}
              <div className='flex items-start gap-3.5 mb-4'>
                <img
                  src={user.profile_picture}
                  alt={user.full_name}
                  className='w-12 h-12 rounded-full object-cover shrink-0 border border-gray-100 shadow-sm'
                />
                <div className='flex-1 min-w-0'>
                  <h4 className='font-semibold text-gray-900 text-base leading-snug hover:text-indigo-600 transition truncate cursor-pointer'
                    onClick={() => navigate(`/profile/${user._id}`)}
                  >
                    {user.full_name}
                  </h4>
                  <p className='text-xs text-gray-500 font-medium'>
                    @{user.username}
                  </p>
                  <p className='text-xs text-gray-600 mt-1 line-clamp-1 leading-relaxed'>
                    {user.bio}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              {activeTab === 'pending' ? (
                <div className='flex items-center gap-2 pt-1'>
                  <button
                    onClick={() => navigate(`/profile/${user._id}`)}
                    className='flex-1 py-2 px-4 rounded-lg bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-medium cursor-pointer transition shadow-sm active:scale-95 text-center'
                  >
                    Accept
                  </button>
                  <button
                    className='py-2 px-4 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium cursor-pointer transition active:scale-95 text-center'
                  >
                    Decline
                  </button>
                </div>
              ) : (
                <div className='flex items-center gap-2 pt-1'>
                  <button
                    onClick={() => navigate(`/profile/${user._id}`)}
                    className='flex-1 py-2 px-4 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-medium cursor-pointer transition shadow-sm active:scale-95 text-center'
                  >
                    View Profile
                  </button>
                  <button
                    title="Send Message"
                    onClick={() => navigate(`/messages/${user._id}`)}
                    className='p-2 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-gray-600 cursor-pointer transition shadow-xs'
                  >
                    <MessageSquare className='w-4 h-4' />
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className='col-span-full text-center py-12 bg-white rounded-xl border border-gray-100 text-gray-500 text-sm'>
            No {activeTab} found
          </div>
        )}
      </div>
    </div>
  )
}

export default Connections
