import React, { useState, useEffect, useMemo } from 'react'
import {
  MapPin,
  MessageSquare,
  Search,
  UserCheck,
  UserPlus,
  Users,
  Loader2,
  Sparkles,
  Flame,
  Camera,
  Code,
  Palette,
  Dumbbell,
  BadgeCheck,
  X,
  ArrowUpRight,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchDiscoverUsers,
  toggleFollowUser,
} from '../redux/slices/userSlice'
import { motion } from 'framer-motion'

const CATEGORIES = [
  { id: 'all', label: 'All Creators', icon: Sparkles },
  { id: 'popular', label: 'Popular', icon: Flame },
  { id: 'tech', label: 'Developers & Tech', icon: Code },
  { id: 'design', label: 'Design & Art', icon: Palette },
  { id: 'photo', label: 'Photography', icon: Camera },
  { id: 'fitness', label: 'Fitness & Health', icon: Dumbbell },
]

const COVER_GRADIENTS = [
  'from-indigo-600 via-purple-600 to-pink-500',
  'from-blue-600 via-cyan-500 to-teal-400',
  'from-rose-500 via-pink-500 to-amber-400',
  'from-violet-600 via-indigo-600 to-blue-500',
  'from-emerald-500 via-teal-600 to-cyan-700',
]

const Discover = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { user: currentUser } = useSelector((state) => state.auth)
  const { discoverUsers, loading } = useSelector((state) => state.user)

  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    dispatch(fetchDiscoverUsers())
  }, [dispatch])

  const handleFollowToggle = (userId, e) => {
    e?.stopPropagation()
    if (userId) {
      dispatch(toggleFollowUser(userId))
    }
  }

  const usersList = discoverUsers || []

  // Dynamic Filtering based on Search & Category
  const filteredUsers = useMemo(() => {
    return usersList.filter((user) => {
      const term = searchTerm.toLowerCase().trim()
      const matchesSearch =
        !term ||
        user.full_name?.toLowerCase().includes(term) ||
        user.username?.toLowerCase().includes(term) ||
        user.bio?.toLowerCase().includes(term) ||
        user.location?.toLowerCase().includes(term)

      if (!matchesSearch) return false

      if (activeCategory === 'popular') {
        return (user.followers?.length || 0) >= 1
      }
      if (activeCategory === 'tech') {
        const bio = (user.bio || '').toLowerCase()
        return bio.includes('dev') || bio.includes('code') || bio.includes('tech') || bio.includes('engineer') || bio.includes('software')
      }
      if (activeCategory === 'design') {
        const bio = (user.bio || '').toLowerCase()
        return bio.includes('design') || bio.includes('art') || bio.includes('ui') || bio.includes('ux') || bio.includes('creative')
      }
      if (activeCategory === 'photo') {
        const bio = (user.bio || '').toLowerCase()
        return bio.includes('photo') || bio.includes('camera') || bio.includes('video') || bio.includes('shoot')
      }
      if (activeCategory === 'fitness') {
        const bio = (user.bio || '').toLowerCase()
        return bio.includes('fitness') || bio.includes('gym') || bio.includes('health') || bio.includes('workout')
      }

      return true
    })
  }, [usersList, searchTerm, activeCategory])

  return (
    <div className='w-full max-w-6xl mx-auto p-3 sm:p-5 lg:p-6 space-y-4'>
      {/* Compact Header Banner */}
      <div className='relative overflow-hidden rounded-2xl py-4 px-4 sm:py-5 sm:px-6 glass-card border border-slate-200/80 dark:border-white/[0.08] shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
        <div className='relative z-10 max-w-xl space-y-1'>
          <div className='inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'>
            <Sparkles className='w-3 h-3' />
            <span>DISCOVER CREATORS</span>
          </div>
          <h1 className='text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight'>
            Discover Rising Creators
          </h1>
          <p className='text-gray-500 dark:text-gray-400 text-xs leading-relaxed'>
            Connect with thinkers, creators, and innovators. Follow people to personalize your feed.
          </p>
        </div>

        {/* Search Input inline on desktop */}
        <div className='relative z-10 w-full sm:w-72'>
          <Search className='w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2' />
          <input
            type='text'
            placeholder='Search name, @user, skills...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full pl-8 pr-7 py-1.5 bg-slate-100/90 dark:bg-white/[0.06] rounded-xl text-xs text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 border border-slate-200/60 dark:border-white/[0.06]'
          />
          {searchTerm && (
            <button
              type='button'
              onClick={() => setSearchTerm('')}
              className='absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-white cursor-pointer'
            >
              <X className='w-3 h-3' />
            </button>
          )}
        </div>

        {/* Ambient background glow */}
        <div className='absolute -right-6 -bottom-6 w-40 h-40 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none' />
      </div>

      {/* Category Filter Pills (Tight compact spacing) */}
      <div className='flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5'>
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon
          const isActive = activeCategory === cat.id
          return (
            <button
              key={cat.id}
              type='button'
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs'
                  : 'glass-card text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-slate-200/60 dark:border-white/[0.06]'
              }`}
            >
              <Icon className='w-3.5 h-3.5' />
              <span>{cat.label}</span>
            </button>
          )
        })}
      </div>

      {/* Creators Grid (Laptop 4-col compact bento cards) */}
      {loading && usersList.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-20 gap-2 text-indigo-600'>
          <Loader2 className='w-7 h-7 animate-spin' />
          <p className='text-xs font-semibold text-gray-500 animate-pulse'>
            Curating creators...
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4'>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user, idx) => {
              const isFollowing = (currentUser?.following || []).some(
                (id) => (typeof id === 'object' ? id._id : id)?.toString() === user._id?.toString()
              )
              const gradientBg = COVER_GRADIENTS[idx % COVER_GRADIENTS.length]

              return (
                <motion.div
                  key={user._id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.02 }}
                  whileHover={{ y: -3 }}
                  onClick={() => navigate(`/profile/${user._id}`)}
                  className='glass-card rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-lg hover:border-indigo-500/40 transition-all flex flex-col justify-between cursor-pointer group'
                >
                  <div>
                    {/* Compact Cover Banner */}
                    <div className={`h-14 w-full bg-gradient-to-r ${gradientBg} opacity-85 relative`}>
                      <button
                        type='button'
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/profile/${user._id}`)
                        }}
                        className='absolute top-1.5 right-1.5 size-6 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer'
                        title='View Profile'
                      >
                        <ArrowUpRight className='w-3.5 h-3.5' />
                      </button>
                    </div>

                    {/* Avatar & Info */}
                    <div className='px-3 pb-1.5 -mt-7 flex flex-col items-center text-center'>
                      <div className='relative'>
                        <img
                          src={user.profile_picture || '/sample_profile.jpg'}
                          alt={user.full_name}
                          loading='lazy'
                          decoding='async'
                          className='size-14 rounded-full object-cover shadow-md border-2 border-white dark:border-slate-900 group-hover:scale-105 transition-transform duration-200'
                        />
                        <span className='absolute bottom-0 right-0 size-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900' />
                      </div>

                      <div className='mt-2 w-full'>
                        <div className='flex items-center justify-center gap-1'>
                          <h3 className='font-bold text-gray-900 dark:text-gray-100 text-xs sm:text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition truncate'>
                            {user.full_name || 'Creator'}
                          </h3>
                          {user.is_verified && (
                            <BadgeCheck className='w-3.5 h-3.5 text-blue-500 fill-blue-50 shrink-0' />
                          )}
                        </div>
                        <p className='text-[11px] text-gray-500 dark:text-gray-400 font-medium truncate'>
                          @{user.username}
                        </p>

                        <p className='text-[11px] text-gray-600 dark:text-gray-300 mt-1 line-clamp-1 leading-snug min-h-[16px]'>
                          {user.bio || 'PingUp Creator'}
                        </p>
                      </div>

                      {/* Compact Followers Badge */}
                      <div className='flex items-center justify-center gap-1.5 mt-2'>
                        <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-gray-600 dark:text-gray-300 bg-slate-100 dark:bg-white/[0.05] border border-slate-200/60 dark:border-white/10'>
                          <Users className='w-2.5 h-2.5 text-indigo-500 shrink-0' />
                          <span>{user.followers?.length || 0} Followers</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Compact Actions Footer */}
                  <div className='p-2.5 pt-1.5 border-t border-slate-200/60 dark:border-white/[0.06] flex items-center gap-1.5'>
                    <button
                      type='button'
                      onClick={(e) => handleFollowToggle(user._id, e)}
                      className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all shadow-xs active:scale-95 ${
                        isFollowing
                          ? 'bg-slate-100 dark:bg-white/[0.08] text-gray-700 dark:text-gray-200 hover:bg-slate-200'
                          : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90'
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
                          <span>Follow</span>
                        </>
                      )}
                    </button>

                    <button
                      type='button'
                      title='Send Message'
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/messages/${user._id}`)
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
              <p className='font-bold text-gray-900 dark:text-white text-xs sm:text-sm'>
                No Creators Found
              </p>
              <p className='text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto'>
                {searchTerm
                  ? `No creators matched "${searchTerm}".`
                  : 'Check back soon for new creator recommendations!'}
              </p>
              {searchTerm && (
                <button
                  type='button'
                  onClick={() => setSearchTerm('')}
                  className='px-3 py-1 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition cursor-pointer'
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Discover
