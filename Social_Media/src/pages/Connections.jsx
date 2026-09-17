import React, { useState, useEffect } from 'react'
import {
  Clock,
  MessageSquare,
  Search,
  UserCheck,
  UserPlus,
  Users,
  Loader2,
  Sparkles,
  Plus,
  Settings2,
  ShieldCheck,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchConnectionsData,
  toggleFollowUser,
} from '../redux/slices/userSlice'
import { fetchUserCircles } from '../redux/slices/circleSlice'
import CirclesManagerModal from '../components/CirclesManagerModal'

const Connections = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { user: currentUser } = useSelector((state) => state.auth)
  const { connectionsData, connectionsLoading } = useSelector(
    (state) => state.user
  )
  const { circles, loading: circlesLoading } = useSelector(
    (state) => state.circle
  )

  const [activeTab, setActiveTab] = useState('followers')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCirclesModal, setShowCirclesModal] = useState(false)

  // Fetch populated connections & circles on mount
  useEffect(() => {
    dispatch(fetchConnectionsData())
    dispatch(fetchUserCircles())
  }, [dispatch])

  const followersList = connectionsData?.followers || []
  const followingList = connectionsData?.following || []
  const connectionsList = connectionsData?.connections || []
  const circlesList = circles || []

  const handleFollowToggle = (userId) => {
    if (userId) {
      dispatch(toggleFollowUser(userId))
    }
  }

  // Stats data mapped with their datasets
  const tabs = [
    {
      id: 'followers',
      label: 'Followers',
      count: followersList.length,
      icon: Users,
      data: followersList,
      description: 'People who follow your updates and posts',
    },
    {
      id: 'following',
      label: 'Following',
      count: followingList.length,
      icon: UserCheck,
      data: followingList,
      description: 'People whose updates appear on your feed',
    },
    {
      id: 'connections',
      label: 'Connections',
      count: connectionsList.length,
      icon: Sparkles,
      data: connectionsList,
      description: 'Mutual connections who follow each other',
    },
    {
      id: 'circles',
      label: 'My Circles',
      count: circlesList.length,
      icon: ShieldCheck,
      data: circlesList,
      description: 'Custom social circles for targeted privacy & posts',
    },
  ]

  const activeTabData = tabs.find((tab) => tab.id === activeTab)?.data || []

  // Filter based on search query
  const filteredData =
    activeTab === 'circles'
      ? circlesList.filter((c) => {
          const name = (c.name || '').toLowerCase()
          const query = searchQuery.toLowerCase().trim()
          return name.includes(query)
        })
      : activeTabData.filter((u) => {
          const name = (u.full_name || '').toLowerCase()
          const username = (u.username || '').toLowerCase()
          const query = searchQuery.toLowerCase().trim()
          return name.includes(query) || username.includes(query)
        })

  return (
    <div className='min-h-full p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100'>
            Network & Social Circles
          </h1>
          <p className='text-gray-500 dark:text-gray-400 text-sm sm:text-base mt-1'>
            Manage your followers, mutual connections, and custom audience circles
          </p>
        </div>

        {/* Action Buttons & Search */}
        <div className='flex items-center gap-2.5'>
          {/* Search Input */}
          <div className='relative w-full sm:w-60'>
            <Search className='w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2' />
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'circles'
                  ? 'Search circles...'
                  : 'Search people...'
              }
              className='w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition'
            />
          </div>

          {/* Manage Circles Quick Button */}
          <button
            type='button'
            onClick={() => setShowCirclesModal(true)}
            className='flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold transition cursor-pointer shrink-0 shadow-sm'
          >
            <Plus className='w-4 h-4' />
            <span className='hidden sm:inline'>Circles</span>
          </button>
        </div>
      </div>

      {/* Top Stat Summary Cards */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 my-6'>
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm border cursor-pointer transition-all duration-200 text-center hover:shadow-md ${
                isActive
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/10'
                  : 'border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700'
              }`}
            >
              <div className='flex items-center justify-center mb-1.5'>
                <Icon
                  className={`w-5 h-5 ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-400'
                  }`}
                />
              </div>
              <h3 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100'>
                {tab.count}
              </h3>
              <p className='text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5'>
                {tab.label}
              </p>
            </div>
          )
        })}
      </div>

      {/* Filter / Tab Bar */}
      <div className='flex items-center gap-2 sm:gap-4 border-b border-gray-200 dark:border-slate-800 pb-2 mb-6 overflow-x-auto no-scrollbar'>
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap cursor-pointer transition-all duration-200 ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 rounded-b-none font-semibold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-400'
                }`}
              />
              <span>{tab.label}</span>
              <span className='px-1.5 py-0.2 bg-gray-100 dark:bg-slate-800 rounded-full text-xs font-semibold text-gray-600 dark:text-gray-300'>
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Content Rendering based on Active Tab */}
      {activeTab === 'circles' ? (
        // ================= CIRCLES TAB VIEW =================
        <div className='space-y-4'>
          {circlesLoading && circlesList.length === 0 ? (
            <div className='py-20 flex flex-col items-center justify-center text-indigo-600 gap-3'>
              <Loader2 className='w-8 h-8 animate-spin' />
              <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                Loading social circles...
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {filteredData.length > 0 ? (
                filteredData.map((circle) => {
                  const memberCount = circle.members?.length || 0
                  const memberPreview = (circle.members || []).slice(0, 4)

                  return (
                    <div
                      key={circle._id}
                      className='bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4'
                    >
                      {/* Top Info */}
                      <div className='flex items-start justify-between gap-3'>
                        <div className='flex items-center gap-3 min-w-0'>
                          <div
                            className='w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs shrink-0'
                            style={{
                              backgroundColor: `${circle.color}20`,
                              color: circle.color,
                            }}
                          >
                            {circle.icon || '⭐'}
                          </div>
                          <div className='min-w-0'>
                            <h3 className='font-bold text-gray-900 dark:text-white text-base truncate'>
                              {circle.name}
                            </h3>
                            <p className='text-xs text-gray-500 dark:text-gray-400 line-clamp-1'>
                              {circle.description || 'Custom audience circle'}
                            </p>
                          </div>
                        </div>

                        <span
                          className='px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs shrink-0'
                          style={{ backgroundColor: circle.color }}
                        >
                          {memberCount} {memberCount === 1 ? 'member' : 'members'}
                        </span>
                      </div>

                      {/* Members Avatar Stack + Manage Button */}
                      <div className='flex items-center justify-between pt-3 border-t border-gray-50 dark:border-slate-800/60'>
                        {/* Avatar Stack */}
                        <div className='flex items-center -space-x-2'>
                          {memberPreview.length > 0 ? (
                            memberPreview.map((m, i) => (
                              <img
                                key={m._id || i}
                                src={
                                  m.profile_picture || '/sample_profile.jpg'
                                }
                                alt={m.full_name || 'Member'}
                                className='w-8 h-8 rounded-full object-cover border-2 border-white dark:border-slate-900 shadow-xs'
                              />
                            ))
                          ) : (
                            <span className='text-xs text-gray-400 italic'>
                              No members yet
                            </span>
                          )}
                          {memberCount > 4 && (
                            <div className='w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300'>
                              +{memberCount - 4}
                            </div>
                          )}
                        </div>

                        {/* Manage Members Button */}
                        <button
                          type='button'
                          onClick={() => setShowCirclesModal(true)}
                          className='flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-semibold transition cursor-pointer'
                        >
                          <Settings2 className='w-3.5 h-3.5' />
                          <span>Manage</span>
                        </button>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className='col-span-full text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 space-y-3'>
                  <ShieldCheck className='w-10 h-10 text-gray-400 mx-auto' />
                  <p className='text-gray-800 dark:text-gray-200 font-semibold text-sm'>
                    No Circles Found
                  </p>
                  <button
                    type='button'
                    onClick={() => setShowCirclesModal(true)}
                    className='px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition cursor-pointer'
                  >
                    Create Your First Circle
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        // ================= USERS TAB VIEW (Followers, Following, Connections) =================
        <div>
          {connectionsLoading && filteredData.length === 0 ? (
            <div className='py-20 flex flex-col items-center justify-center text-indigo-600 gap-3'>
              <Loader2 className='w-8 h-8 animate-spin' />
              <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                Loading network...
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {filteredData.length > 0 ? (
                filteredData.map((userObj, idx) => {
                  const userId = userObj._id || userObj
                  const userName = userObj.full_name || 'User'
                  const userUsername = userObj.username || 'user'
                  const userPic =
                    userObj.profile_picture || '/sample_profile.jpg'
                  const userBio = userObj.bio || ''

                  const isFollowing = (currentUser?.following || []).some(
                    (id) =>
                      (typeof id === 'object'
                        ? id._id.toString()
                        : id.toString()) === userId.toString()
                  )

                  return (
                    <div
                      key={userId || idx}
                      className='bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-5 border border-gray-100 dark:border-slate-800 flex flex-col justify-between gap-4'
                    >
                      {/* User Details */}
                      <div className='flex items-start gap-3.5'>
                        <img
                          src={userPic}
                          alt={userName}
                          onClick={() => navigate(`/profile/${userId}`)}
                          className='w-13 h-13 rounded-full object-cover shrink-0 border border-gray-100 dark:border-slate-800 shadow-xs cursor-pointer hover:opacity-90 transition'
                        />
                        <div className='flex-1 min-w-0'>
                          <h4
                            className='font-semibold text-gray-900 dark:text-gray-100 text-base leading-snug hover:text-indigo-600 dark:hover:text-indigo-400 transition truncate cursor-pointer'
                            onClick={() => navigate(`/profile/${userId}`)}
                          >
                            {userName}
                          </h4>
                          <p className='text-xs text-gray-500 dark:text-gray-400 font-medium'>
                            @{userUsername}
                          </p>
                          {userBio && (
                            <p className='text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-1 leading-relaxed'>
                              {userBio}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className='flex items-center gap-2 pt-1 border-t border-gray-50 dark:border-slate-800/60'>
                        <button
                          type='button'
                          onClick={() => handleFollowToggle(userId)}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer shadow-xs ${
                            isFollowing
                              ? 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700'
                              : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white'
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
                              <span>Follow Back</span>
                            </>
                          )}
                        </button>

                        <button
                          type='button'
                          onClick={() => navigate(`/profile/${userId}`)}
                          className='px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer transition'
                        >
                          Profile
                        </button>

                        <button
                          type='button'
                          title='Send Message'
                          onClick={() => navigate(`/messages/${userId}`)}
                          className='p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:text-indigo-600 text-gray-600 dark:text-gray-300 cursor-pointer transition shadow-xs'
                        >
                          <MessageSquare className='w-4 h-4' />
                        </button>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className='col-span-full text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 space-y-2'>
                  <Users className='w-8 h-8 text-gray-400 mx-auto' />
                  <p className='text-gray-800 dark:text-gray-200 font-semibold text-sm'>
                    {searchQuery
                      ? `No people matching "${searchQuery}"`
                      : `No ${activeTab} yet`}
                  </p>
                  <p className='text-gray-500 dark:text-gray-400 text-xs max-w-sm mx-auto'>
                    {activeTab === 'followers' &&
                      'When people follow your profile, they will appear here.'}
                    {activeTab === 'following' &&
                      'Follow more people from the Discover tab to build your feed.'}
                    {activeTab === 'connections' &&
                      'Mutual connections (people who follow each other) will appear here.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Circles Manager Modal */}
      <CirclesManagerModal
        isOpen={showCirclesModal}
        onClose={() => setShowCirclesModal(false)}
      />
    </div>
  )
}

export default Connections
