import React, { useState, useEffect, useMemo } from 'react'
import {
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
  HeartHandshake,
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchConnectionsData,
  toggleFollowUser,
} from '../redux/slices/userSlice'
import { fetchUserCircles } from '../redux/slices/circleSlice'
import CirclesManagerModal from '../components/CirclesManagerModal'
import { motion } from 'framer-motion'

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

  useEffect(() => {
    dispatch(fetchConnectionsData())
    dispatch(fetchUserCircles())
  }, [dispatch])

  const followersList = connectionsData?.followers || []
  const followingList = connectionsData?.following || []
  const connectionsList = connectionsData?.connections || []
  const circlesList = circles || []

  const handleFollowToggle = (userId, e) => {
    e?.stopPropagation()
    if (userId) {
      dispatch(toggleFollowUser(userId))
    }
  }

  const tabs = [
    {
      id: 'followers',
      label: 'Followers',
      count: followersList.length,
      icon: Users,
      data: followersList,
      description: 'People who follow your profile and view your stories & posts.',
    },
    {
      id: 'following',
      label: 'Following',
      count: followingList.length,
      icon: UserCheck,
      data: followingList,
      description: 'Creators and friends you are actively subscribed to.',
    },
    {
      id: 'connections',
      label: 'Mutuals',
      count: connectionsList.length,
      icon: HeartHandshake,
      data: connectionsList,
      description: 'Mutual connections who follow you and you follow back.',
    },
    {
      id: 'circles',
      label: 'My Circles',
      count: circlesList.length,
      icon: ShieldCheck,
      data: circlesList,
      description: 'Custom private audience groups for targeted stories & posts.',
    },
  ]

  const currentTabInfo = tabs.find((t) => t.id === activeTab)
  const activeTabData = currentTabInfo?.data || []

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return activeTabData

    if (activeTab === 'circles') {
      return circlesList.filter((c) => {
        const name = (c.name || '').toLowerCase()
        const desc = (c.description || '').toLowerCase()
        return name.includes(query) || desc.includes(query)
      })
    }

    return activeTabData.filter((u) => {
      const name = (u.full_name || '').toLowerCase()
      const username = (u.username || '').toLowerCase()
      const bio = (u.bio || '').toLowerCase()
      return name.includes(query) || username.includes(query) || bio.includes(query)
    })
  }, [activeTab, activeTabData, circlesList, searchQuery])

  return (
    <div className='w-full max-w-6xl mx-auto p-3 sm:p-5 lg:p-6 space-y-4'>
      {/* Top Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
        <div className='space-y-0.5'>
          <div className='inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'>
            <ShieldCheck className='w-3 h-3' />
            <span>NETWORK & AUDIENCES</span>
          </div>
          <h1 className='text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight'>
            Network & Relationships
          </h1>
          <p className='text-gray-500 dark:text-gray-400 text-xs'>
            Manage your followers, mutual friends, and custom private circles
          </p>
        </div>

        {/* Action Button: Create Circle */}
        <button
          type='button'
          onClick={() => setShowCirclesModal(true)}
          className='flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-semibold shadow-xs cursor-pointer active:scale-95 transition shrink-0 self-start sm:self-auto'
        >
          <Plus className='w-3.5 h-3.5' />
          <span>Create Circle</span>
        </button>
      </div>

      {/* KPI Stats Overview Cards (Compact 4-column) */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3'>
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <motion.div
              key={tab.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setActiveTab(tab.id)
                setSearchQuery('')
              }}
              className={`glass-card p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer shadow-xs flex flex-col justify-between gap-2 ${
                isActive
                  ? 'border-indigo-500/80 bg-indigo-500/[0.08] dark:bg-indigo-500/[0.12] ring-1 ring-indigo-500/30'
                  : 'border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/20'
              }`}
            >
              <div className='flex items-center justify-between'>
                <div
                  className={`size-8 rounded-xl flex items-center justify-center ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-white/[0.06] text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Icon className='w-4 h-4' />
                </div>
                <span className='text-lg sm:text-xl font-black text-gray-900 dark:text-white'>
                  {tab.count}
                </span>
              </div>
              <div>
                <p className='text-xs font-bold text-gray-800 dark:text-gray-200'>
                  {tab.label}
                </p>
                <p className='text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1'>
                  {tab.id === 'connections' ? 'Follow back' : `Manage ${tab.label.toLowerCase()}`}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Search Bar & Tab Description */}
      <div className='glass-card rounded-2xl p-2 shadow-xs border border-slate-200/80 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-2'>
        <p className='text-[11px] sm:text-xs text-gray-600 dark:text-gray-300 px-2 font-medium'>
          {currentTabInfo?.description}
        </p>

        <div className='relative w-full sm:w-64'>
          <Search className='w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2' />
          <input
            type='text'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'circles'
                ? 'Search circles...'
                : `Search ${activeTab}...`
            }
            className='w-full pl-8 pr-7 py-1.5 bg-slate-100/90 dark:bg-white/[0.06] rounded-xl text-xs text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500'
          />
          {searchQuery && (
            <button
              type='button'
              onClick={() => setSearchQuery('')}
              className='absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-white'
            >
              <X className='w-3 h-3' />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'circles' ? (
        /* CIRCLES GRID VIEW */
        <div>
          {circlesLoading && circlesList.length === 0 ? (
            <div className='py-16 flex flex-col items-center justify-center text-indigo-600 gap-2'>
              <Loader2 className='w-7 h-7 animate-spin' />
              <p className='text-xs font-semibold text-gray-500 animate-pulse'>
                Loading social circles...
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'>
              {filteredData.length > 0 ? (
                filteredData.map((circle) => {
                  const memberCount = circle.members?.length || 0

                  return (
                    <motion.div
                      key={circle._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -2 }}
                      className='glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-lg transition-all flex flex-col justify-between gap-3'
                    >
                      <div className='flex items-start justify-between gap-2.5'>
                        <div className='flex items-center gap-3 min-w-0'>
                          <div
                            className='size-11 rounded-xl flex items-center justify-center text-xl shadow-xs shrink-0 border'
                            style={{
                              backgroundColor: `${circle.color || '#6366f1'}15`,
                              borderColor: `${circle.color || '#6366f1'}35`,
                              color: circle.color || '#6366f1',
                            }}
                          >
                            {circle.icon || '⭐'}
                          </div>
                          <div className='min-w-0'>
                            <h3 className='font-bold text-gray-900 dark:text-white text-sm truncate'>
                              {circle.name}
                            </h3>
                            <p className='text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5'>
                              {circle.description || 'Custom privacy group'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Member Badge & Actions */}
                      <div className='flex items-center justify-between pt-2.5 border-t border-slate-200/60 dark:border-white/[0.06]'>
                        <span
                          className='px-2.5 py-0.5 rounded-full text-[11px] font-bold border'
                          style={{
                            backgroundColor: `${circle.color || '#6366f1'}12`,
                            color: circle.color || '#6366f1',
                            borderColor: `${circle.color || '#6366f1'}35`,
                          }}
                        >
                          {memberCount} {memberCount === 1 ? 'member' : 'members'}
                        </span>

                        <button
                          type='button'
                          onClick={() => setShowCirclesModal(true)}
                          className='flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer'
                        >
                          <Settings2 className='w-3 h-3' />
                          <span>Configure</span>
                        </button>
                      </div>
                    </motion.div>
                  )
                })
              ) : (
                <div className='col-span-full text-center py-12 glass-card rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-2'>
                  <ShieldCheck className='w-8 h-8 text-indigo-500 mx-auto' />
                  <h3 className='font-bold text-gray-900 dark:text-white text-xs sm:text-sm'>
                    No Circles Created Yet
                  </h3>
                  <p className='text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed'>
                    Create custom circles (e.g. Besties, Study Squad) to share targeted stories exclusively.
                  </p>
                  <button
                    type='button'
                    onClick={() => setShowCirclesModal(true)}
                    className='px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold hover:opacity-90 transition cursor-pointer'
                  >
                    Create Your First Circle
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* USERS LIST VIEW (Followers, Following, Mutuals) */
        <div>
          {connectionsLoading && filteredData.length === 0 ? (
            <div className='py-16 flex flex-col items-center justify-center text-indigo-600 gap-2'>
              <Loader2 className='w-7 h-7 animate-spin' />
              <p className='text-xs font-semibold text-gray-500 animate-pulse'>
                Loading network...
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'>
              {filteredData.length > 0 ? (
                filteredData.map((userObj, idx) => {
                  const userId = userObj._id || userObj
                  const userName = userObj.full_name || 'Creator'
                  const userUsername = userObj.username || 'user'
                  const userPic = userObj.profile_picture || '/sample_profile.jpg'
                  const userBio = userObj.bio || ''

                  const isFollowing = (currentUser?.following || []).some(
                    (id) => (typeof id === 'object' ? id._id : id)?.toString() === userId.toString()
                  )

                  const isMutual = connectionsList.some(
                    (c) => (c._id || c)?.toString() === userId.toString()
                  )

                  return (
                    <motion.div
                      key={userId || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.02 }}
                      whileHover={{ y: -2 }}
                      onClick={() => navigate(`/profile/${userId}`)}
                      className='glass-card rounded-2xl p-3.5 border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-lg hover:border-indigo-500/30 transition-all flex flex-col justify-between gap-3 cursor-pointer group'
                    >
                      <div className='flex items-start gap-3'>
                        <div className='relative shrink-0'>
                          <img
                            src={userPic}
                            alt={userName}
                            loading='lazy'
                            decoding='async'
                            className='size-11 sm:size-12 rounded-full object-cover border-2 border-indigo-500/30 shadow-xs group-hover:scale-105 transition-transform'
                          />
                          <span className='absolute bottom-0 right-0 size-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900' />
                        </div>

                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center gap-1.5'>
                            <h4 className='font-bold text-gray-900 dark:text-gray-100 text-xs sm:text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition truncate'>
                              {userName}
                            </h4>
                            {isMutual && (
                              <span
                                className='px-1.5 py-0.2 text-[9px] font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/25 rounded-full shrink-0'
                                title='Mutual Connection'
                              >
                                Mutual
                              </span>
                            )}
                          </div>
                          <p className='text-[11px] text-gray-500 dark:text-gray-400 font-medium'>
                            @{userUsername}
                          </p>

                          <p className='text-[11px] text-gray-600 dark:text-gray-300 mt-0.5 line-clamp-1 leading-snug'>
                            {userBio || 'PingUp Member'}
                          </p>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className='flex items-center gap-1.5 pt-2 border-t border-slate-200/60 dark:border-white/[0.06]'>
                        <button
                          type='button'
                          onClick={(e) => handleFollowToggle(userId, e)}
                          className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs active:scale-95 ${
                            isFollowing
                              ? 'bg-slate-100 dark:bg-white/[0.08] text-gray-700 dark:text-gray-200 hover:bg-slate-200'
                              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white'
                          }`}
                        >
                          {isFollowing ? (
                            <>
                              <UserCheck className='w-3 h-3' />
                              <span>Following</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className='w-3 h-3' />
                              <span>{activeTab === 'followers' ? 'Follow Back' : 'Follow'}</span>
                            </>
                          )}
                        </button>

                        <button
                          type='button'
                          title='Send Message'
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/messages/${userId}`)
                          }}
                          className='p-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 hover:border-indigo-400 hover:text-indigo-600 text-gray-600 dark:text-gray-300 cursor-pointer transition'
                        >
                          <MessageSquare className='w-3.5 h-3.5' />
                        </button>
                      </div>
                    </motion.div>
                  )
                })
              ) : (
                <div className='col-span-full text-center py-12 glass-card rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-2'>
                  <Users className='w-8 h-8 text-gray-400 mx-auto' />
                  <p className='text-gray-900 dark:text-gray-100 font-bold text-xs sm:text-sm'>
                    {searchQuery
                      ? `No results matching "${searchQuery}"`
                      : `No ${activeTab} yet`}
                  </p>
                  <p className='text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto'>
                    Connect with creators to expand your network!
                  </p>
                  <button
                    type='button'
                    onClick={() => navigate('/discover')}
                    className='mt-1 px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition cursor-pointer'
                  >
                    Explore Creators
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Circle Manager Modal */}
      <CirclesManagerModal
        isOpen={showCirclesModal}
        onClose={() => setShowCirclesModal(false)}
      />
    </div>
  )
}

export default Connections
