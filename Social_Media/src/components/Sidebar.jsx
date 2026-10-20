import React, { useState } from 'react'
import ThemeToggle from './ThemeToggle'
import AccountSettingsModal from './AccountSettingsModal'
import NotificationsModal from './NotificationsModal'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  Home,
  Compass,
  Film,
  Settings,
  LogOut,
  Plus,
  Camera,
  X,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../redux/slices/authSlice'

const Sidebar = ({ sidebarOpen, setsidebarOpen }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { posts } = useSelector((state) => state.post)

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  // Real Database User Details
  const displayName = user?.full_name || 'User'
  const displayUsername = user?.username || 'user'
  const profilePic = user?.profile_picture || '/sample_profile.jpg'
  const bio = user?.bio || ''

  // Real Dynamic stats from Database
  const userPostsCount = posts.filter(
    (p) => (p.user?._id || p.user) === user?._id
  ).length
  const followersCount = user?.followers?.length || 0
  const followingCount = user?.following?.length || 0

  const formatCount = (count) => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K'
    }
    return count
  }

  const handleLogout = () => {
    dispatch(logoutUser())
  }

  return (
    <>
      {/* Dark Backdrop Overlay on Mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setsidebarOpen?.(false)}
            className='fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] sm:hidden'
          />
        )}
      </AnimatePresence>

      {/* Main Instagram Style Sidebar */}
      <aside
        className={`fixed sm:static inset-y-0 left-0 z-[100] w-72 sm:w-64 lg:w-[275px] shrink-0 bg-white dark:bg-[#0c101d] border-r border-slate-100 dark:border-white/[0.06] flex flex-col justify-between overflow-y-auto no-scrollbar shadow-2xl sm:shadow-none transition-transform duration-300 ease-out select-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
        }`}
      >
        <div className='w-full p-5 lg:p-6 space-y-6'>
          {/* 1. Header with Instagram Branding */}
          <div className='flex items-center justify-between'>
            <div
              onClick={() => {
                navigate('/')
                setsidebarOpen?.(false)
              }}
              className='flex items-center gap-2 cursor-pointer group'
            >
              <div className='size-8 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-fuchsia-600 p-[1.5px] shadow-sm'>
                <div className='w-full h-full bg-white dark:bg-[#0c101d] rounded-[10px] flex items-center justify-center text-rose-500'>
                  <Camera className='w-4.5 h-4.5 stroke-[2.2]' />
                </div>
              </div>
              <span className='font-bold text-xl tracking-tight text-gray-900 dark:text-white font-serif italic'>
                Instagram
              </span>
            </div>

            <div className='flex items-center gap-1'>
              <ThemeToggle />
              <button
                type='button'
                onClick={() => setsidebarOpen?.(false)}
                className='p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 sm:hidden cursor-pointer'
              >
                <X className='w-5 h-5' />
              </button>
            </div>
          </div>

          {/* 2. User Profile Snippet (Real Database Info) */}
          <div className='flex flex-col items-center text-center pt-1'>
            <div
              onClick={() => {
                navigate('/profile')
                setsidebarOpen?.(false)
              }}
              className='relative cursor-pointer group'
            >
              <div className='size-20 rounded-full p-[2px] ring-2 ring-slate-100 dark:ring-slate-800 group-hover:ring-rose-400 transition-all duration-300 shadow-sm'>
                <img
                  src={profilePic}
                  alt={displayName}
                  className='w-full h-full rounded-full object-cover'
                />
              </div>
            </div>

            <h2
              onClick={() => {
                navigate('/profile')
                setsidebarOpen?.(false)
              }}
              className='mt-3 font-bold text-gray-900 dark:text-white text-base hover:text-rose-500 transition cursor-pointer'
            >
              {displayName}
            </h2>
            <p className='text-xs text-gray-400 font-medium'>@{displayUsername}</p>

            {/* Real Stats Row */}
            <div className='flex items-center justify-center gap-4 mt-3 w-full py-2 border-y border-slate-100 dark:border-white/[0.06] text-center'>
              <div
                onClick={() => navigate('/profile')}
                className='cursor-pointer group flex-1'
              >
                <span className='block font-bold text-sm text-gray-900 dark:text-white group-hover:text-rose-500 transition'>
                  {userPostsCount}
                </span>
                <span className='text-[11px] text-gray-400 font-medium'>Posts</span>
              </div>
              <div className='w-[1px] h-6 bg-slate-200 dark:bg-white/[0.08]' />
              <div
                onClick={() => navigate('/connections')}
                className='cursor-pointer group flex-1'
              >
                <span className='block font-bold text-sm text-gray-900 dark:text-white group-hover:text-rose-500 transition'>
                  {formatCount(followersCount)}
                </span>
                <span className='text-[11px] text-gray-400 font-medium'>Followers</span>
              </div>
              <div className='w-[1px] h-6 bg-slate-200 dark:bg-white/[0.08]' />
              <div
                onClick={() => navigate('/connections')}
                className='cursor-pointer group flex-1'
              >
                <span className='block font-bold text-sm text-gray-900 dark:text-white group-hover:text-rose-500 transition'>
                  {formatCount(followingCount)}
                </span>
                <span className='text-[11px] text-gray-400 font-medium'>Following</span>
              </div>
            </div>

            {/* Real Bio snippet if present */}
            {bio && (
              <div className='mt-2.5 text-left w-full px-1'>
                <p className='text-xs font-bold text-gray-800 dark:text-gray-200'>{displayName}</p>
                <p className='text-[11px] text-gray-400 font-normal mt-0.5 leading-relaxed'>
                  {bio}
                </p>
              </div>
            )}
          </div>

          {/* 3. Story Highlights Section */}
          <div className='pt-1'>
            <div className='flex items-center justify-between mb-2.5 px-1'>
              <span className='text-xs font-bold text-gray-800 dark:text-gray-200'>
                Story Highlights
              </span>
            </div>

            <div className='flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1 px-1'>
              {/* New Highlight Button */}
              <button
                type='button'
                onClick={() => navigate('/create-post')}
                className='flex flex-col items-center gap-1 shrink-0 group cursor-pointer'
              >
                <div className='size-11 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center text-gray-500 group-hover:text-rose-500 group-hover:border-rose-400 transition-colors shadow-2xs'>
                  <Plus className='w-4 h-4' />
                </div>
                <span className='text-[10px] text-gray-500 dark:text-gray-400 font-medium'>
                  New
                </span>
              </button>
            </div>
          </div>

          {/* 4. Navigation Menu */}
          <nav className='pt-2 space-y-1'>
            <NavLink
              to='/'
              end
              onClick={() => setsidebarOpen?.(false)}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'text-gray-900 dark:text-white font-bold'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Home
                    className={`w-4.5 h-4.5 ${
                      isActive ? 'stroke-[2.5] text-gray-900 dark:text-white' : 'stroke-[1.8]'
                    }`}
                  />
                  <span>Feed</span>
                </>
              )}
            </NavLink>

            <NavLink
              to='/discover'
              onClick={() => setsidebarOpen?.(false)}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'text-gray-900 dark:text-white font-bold'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Compass
                    className={`w-4.5 h-4.5 ${
                      isActive ? 'stroke-[2.5] text-gray-900 dark:text-white' : 'stroke-[1.8]'
                    }`}
                  />
                  <span>Explore</span>
                </>
              )}
            </NavLink>

            <NavLink
              to='/reels'
              onClick={() => setsidebarOpen?.(false)}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'text-gray-900 dark:text-white font-bold'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Film
                    className={`w-4.5 h-4.5 ${
                      isActive ? 'stroke-[2.5] text-gray-900 dark:text-white' : 'stroke-[1.8]'
                    }`}
                  />
                  <span>Reels</span>
                </>
              )}
            </NavLink>

            <button
              type='button'
              onClick={() => {
                setIsSettingsOpen(true)
                setsidebarOpen?.(false)
              }}
              className='w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all cursor-pointer text-left'
            >
              <Settings className='w-4.5 h-4.5 stroke-[1.8]' />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* 5. Logout Button at the bottom */}
        <div className='p-5 lg:p-6 pt-0'>
          <button
            type='button'
            onClick={handleLogout}
            className='w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer'
          >
            <LogOut className='w-4.5 h-4.5 stroke-[1.8]' />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Account Settings & Delete Modal */}
      <AccountSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </>
  )
}

export default Sidebar