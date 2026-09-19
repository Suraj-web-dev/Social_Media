import React, { useState } from 'react'
import MenuItem from './MenuItem'
import ThemeToggle from './ThemeToggle'
import AccountSettingsModal from './AccountSettingsModal'
import NotificationsModal from './NotificationsModal'
import { Link, useNavigate } from 'react-router-dom'
import { CirclePlus, LogOutIcon, Settings, X, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../redux/slices/authSlice'

const Sidebar = ({ sidebarOpen, setsidebarOpen }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  const displayName = user?.full_name || 'User'
  const displayUsername = user?.username || 'user'
  const profilePic = user?.profile_picture || '/sample_profile.jpg'

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
            onClick={() => setsidebarOpen(false)}
            className='fixed inset-0 bg-black/70 backdrop-blur-md z-[90] sm:hidden'
          />
        )}
      </AnimatePresence>

      {/* Main Glass Sidebar Panel */}
      <aside
        className={`fixed sm:static inset-y-0 left-0 z-[100] w-72 sm:w-64 xl:w-72 max-w-[85vw] glass-nav sm:bg-white/70 sm:dark:bg-[#0B0F19]/80 sm:backdrop-blur-2xl border-r border-slate-200/80 dark:border-white/[0.07] flex flex-col justify-between items-center shadow-2xl sm:shadow-none transition-transform duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
        }`}
      >
        <div className='w-full'>
          {/* Top Logo & Action Controls */}
          <div className='flex items-center justify-between px-5 sm:px-6 py-4'>
            <div
              onClick={() => {
                navigate('/')
                setsidebarOpen?.(false)
              }}
              className='flex items-center gap-2 cursor-pointer group'
            >
              <img
                src='/logo.svg'
                className='w-24 transition-transform group-hover:scale-105'
                alt='logo'
              />
            </div>

            <div className='flex items-center gap-1'>
              <ThemeToggle />
              {/* Mobile Close Button */}
              <button
                type='button'
                onClick={() => setsidebarOpen?.(false)}
                className='p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition sm:hidden cursor-pointer'
              >
                <X className='w-5 h-5' />
              </button>
            </div>
          </div>

          <div className='px-5 mb-4'>
            <div className='h-[1px] bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent' />
          </div>

          {/* Navigation Items */}
          <MenuItem
            setsidebarOpen={setsidebarOpen}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
          />

          {/* Create Post Action Button */}
          <div className='px-5 sm:px-6 mt-6'>
            <Link
              to='/create-post'
              onClick={() => setsidebarOpen?.(false)}
              className='relative group overflow-hidden flex items-center justify-center gap-2.5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-95 transition-all duration-200 text-white font-semibold cursor-pointer shadow-lg shadow-indigo-500/25'
            >
              <CirclePlus className='w-5 h-5 transition-transform group-hover:rotate-90 duration-300' />
              <span>Create Post</span>
              <div className='absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none' />
            </Link>
          </div>
        </div>

        {/* Footer Profile Glass Chip & Controls */}
        <div className='w-full p-3 px-4 sm:px-5'>
          <div className='w-full p-2.5 rounded-2xl glass-card flex items-center justify-between gap-2 shadow-sm border border-slate-200/80 dark:border-white/[0.08] hover:border-indigo-500/40 transition-colors'>
            <div
              onClick={() => {
                navigate('/profile')
                setsidebarOpen?.(false)
              }}
              className='flex gap-2.5 items-center cursor-pointer min-w-0 flex-1 group'
            >
              <div className='relative'>
                <img
                  src={profilePic}
                  alt={displayName}
                  className='w-10 h-10 rounded-full object-cover border-2 border-indigo-500/40 shadow-xs shrink-0'
                />
                <span className='absolute bottom-0 right-0 size-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900' />
              </div>
              <div className='min-w-0'>
                <h1 className='text-sm font-bold text-gray-800 dark:text-gray-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition'>
                  {displayName}
                </h1>
                <p className='text-xs text-gray-500 dark:text-gray-400 truncate font-medium'>
                  @{displayUsername}
                </p>
              </div>
            </div>

            <div className='flex items-center gap-0.5 shrink-0'>
              {/* Settings Button */}
              <button
                type='button'
                onClick={() => {
                  setIsSettingsOpen(true)
                  setsidebarOpen?.(false)
                }}
                title='Account Settings'
                className='p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer'
              >
                <Settings className='w-4 h-4' />
              </button>

              {/* Quick Sign Out Button */}
              <button
                type='button'
                onClick={handleLogout}
                title='Sign Out'
                className='p-2 text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer'
              >
                <LogOutIcon className='w-4 h-4' />
              </button>
            </div>
          </div>
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