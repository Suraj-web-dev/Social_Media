import React, { useState } from 'react'
import MenuItem from './MenuItem'
import ThemeToggle from './ThemeToggle'
import AccountSettingsModal from './AccountSettingsModal'
import NotificationsModal from './NotificationsModal'
import { Link, useNavigate } from 'react-router-dom'
import { CirclePlus, LogOutIcon, Settings } from 'lucide-react'
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
      <div
        className={`w-60 xl:w-72 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col justify-between items-center max-sm:absolute top-0 bottom-0 z-20 ${
          sidebarOpen ? 'translate-x-0' : 'max-sm:-translate-x-full'
        } transition-all duration-300 ease-in-out`}
      >
        <div className='w-full'>
          {/* Top Logo & Theme Toggle Row */}
          <div className='flex items-center justify-between px-6 py-3 my-1'>
            <img
              onClick={() => navigate('/')}
              src='/logo.svg'
              className='w-24 cursor-pointer'
              alt='logo'
            />
            <ThemeToggle />
          </div>

          <hr className='border-gray-200 dark:border-slate-800 mb-6' />

          {/* Navigation Items */}
          <MenuItem
            setsidebarOpen={setsidebarOpen}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
          />

          {/* Create Post Action Button */}
          <Link
            to='/create-post'
            onClick={() => setsidebarOpen?.(false)}
            className='flex items-center justify-center gap-2 py-2.5 mt-6 mx-6 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white font-medium cursor-pointer shadow-sm'
          >
            <CirclePlus className='w-5 h-5' />
            <span>Create Post</span>
          </Link>
        </div>

        {/* Footer Profile & Settings/Logout Bar */}
        <div className='w-full border-t border-gray-200 dark:border-slate-800 p-4 px-6 flex items-center justify-between'>
          <div
            onClick={() => setIsSettingsOpen(true)}
            className='flex gap-2.5 items-center cursor-pointer min-w-0 flex-1 hover:opacity-80 transition'
          >
            <img
              src={profilePic}
              alt={displayName}
              className='w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-slate-700 shadow-xs'
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

          <div className='flex items-center gap-1'>
            {/* Settings Button */}
            <button
              type='button'
              onClick={() => setIsSettingsOpen(true)}
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
      </div>

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