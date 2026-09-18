import React, { useState } from 'react'
import MenuItem from './MenuItem'
import ThemeToggle from './ThemeToggle'
import AccountSettingsModal from './AccountSettingsModal'
import NotificationsModal from './NotificationsModal'
import { Link, useNavigate } from 'react-router-dom'
import { CirclePlus, LogOutIcon, Settings, X } from 'lucide-react'
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
      {/* Dark Backdrop Overlay on Mobile (Blocks background clicks & hides reel/feed bleed) */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setsidebarOpen(false)}
            className='fixed inset-0 bg-black/80 backdrop-blur-xs z-[90] sm:hidden'
          />
        )}
      </AnimatePresence>

      {/* Main Sidebar Panel */}
      <aside
        className={`fixed sm:static inset-y-0 left-0 z-[100] w-72 sm:w-60 xl:w-72 max-w-[85vw] bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col justify-between items-center shadow-2xl sm:shadow-none transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
        }`}
      >
        <div className='w-full'>
          {/* Top Logo, Theme Toggle, & Mobile Close Button Row */}
          <div className='flex items-center justify-between px-5 sm:px-6 py-3.5 my-1'>
            <img
              onClick={() => {
                navigate('/')
                setsidebarOpen?.(false)
              }}
              src='/logo.svg'
              className='w-24 cursor-pointer'
              alt='logo'
            />
            <div className='flex items-center gap-1'>
              <ThemeToggle />
              {/* Mobile Close Button */}
              <button
                type='button'
                onClick={() => setsidebarOpen?.(false)}
                className='p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition sm:hidden cursor-pointer'
              >
                <X className='w-5 h-5' />
              </button>
            </div>
          </div>

          <hr className='border-gray-200 dark:border-slate-800 mb-5' />

          {/* Navigation Items */}
          <MenuItem
            setsidebarOpen={setsidebarOpen}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
          />

          {/* Create Post Action Button */}
          <Link
            to='/create-post'
            onClick={() => setsidebarOpen?.(false)}
            className='flex items-center justify-center gap-2 py-2.5 mt-6 mx-5 sm:mx-6 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white font-medium cursor-pointer shadow-sm'
          >
            <CirclePlus className='w-5 h-5' />
            <span>Create Post</span>
          </Link>
        </div>

        {/* Footer Profile & Settings/Logout Bar */}
        <div className='w-full border-t border-gray-200 dark:border-slate-800 p-4 px-5 sm:px-6 flex items-center justify-between bg-white dark:bg-slate-900'>
          <div
            onClick={() => {
              setIsSettingsOpen(true)
              setsidebarOpen?.(false)
            }}
            className='flex gap-2.5 items-center cursor-pointer min-w-0 flex-1 hover:opacity-80 transition'
          >
            <img
              src={profilePic}
              alt={displayName}
              className='w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-slate-700 shadow-xs shrink-0'
            />
            <div className='min-w-0'>
              <h1 className='text-sm font-semibold text-gray-800 dark:text-gray-100 truncate'>
                {displayName}
              </h1>
              <p className='text-xs text-gray-500 dark:text-gray-400 truncate'>
                @{displayUsername}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-1 shrink-0'>
            {/* Settings Button */}
            <button
              type='button'
              onClick={() => {
                setIsSettingsOpen(true)
                setsidebarOpen?.(false)
              }}
              title='Account Settings & Delete'
              className='p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer'
            >
              <Settings className='w-4 h-4' />
            </button>

            {/* Quick Sign Out Button */}
            <button
              type='button'
              onClick={handleLogout}
              title='Sign Out'
              className='p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer'
            >
              <LogOutIcon className='w-4 h-4' />
            </button>
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