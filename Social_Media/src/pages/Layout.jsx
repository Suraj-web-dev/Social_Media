import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Menu, Home, Compass, Film, MessageCircle, User, Plus } from 'lucide-react'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'

const Layout = () => {
  const { user } = useSelector((state) => state.auth)
  const { unreadCount } = useSelector((state) => state.notification)
  const { conversations } = useSelector((state) => state.message)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const totalUnreadMessages = (conversations || []).reduce(
    (sum, c) => sum + (c.unreadCount || 0),
    0
  )

  return user ? (
    <div className='w-full min-h-screen bg-[#e7ebf3] dark:bg-[#070a12] flex items-center justify-center p-0 sm:p-2.5 lg:p-5'>
      {/* Floating Modern Dashboard Outer Frame */}
      <div className='w-full max-w-[1580px] h-screen sm:h-[95vh] bg-white dark:bg-[#0c101d] rounded-none sm:rounded-[36px] shadow-2xl flex overflow-hidden border-0 sm:border border-slate-200/70 dark:border-white/[0.08] relative'>
        
        {/* Desktop Sidebar & Mobile Drawer */}
        <Sidebar sidebarOpen={sidebarOpen} setsidebarOpen={setSidebarOpen} />

        {/* Main Viewport */}
        <main className='flex-1 overflow-y-auto no-scrollbar bg-[#f8fafc] dark:bg-[#0a0e19] flex flex-col min-w-0 relative pb-20 sm:pb-0'>
          <Outlet />
        </main>

        {/* Floating Hamburger Menu Button on Mobile */}
        {!sidebarOpen && (
          <button
            type='button'
            onClick={() => setSidebarOpen(true)}
            aria-label='Open navigation menu'
            className='fixed top-3 right-3 p-2.5 z-[70] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/80 dark:border-white/10 w-11 h-11 text-gray-700 dark:text-gray-200 sm:hidden flex items-center justify-center cursor-pointer transition active:scale-90 hover:shadow-rose-500/10'
          >
            <Menu className='w-5 h-5' />
            {unreadCount > 0 && (
              <span className='absolute -top-1 -right-1 size-3 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse' />
            )}
          </button>
        )}

        {/* Trendy Mobile Floating Bottom Dock */}
        <nav className='fixed bottom-3 inset-x-4 h-15 z-[80] sm:hidden glass-dock rounded-3xl flex items-center justify-around px-2 shadow-2xl'>
          <NavLink
            to='/'
            end
            className={({ isActive }) =>
              `p-2.5 rounded-2xl transition flex flex-col items-center justify-center relative ${
                isActive
                  ? 'text-rose-500 font-bold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Home className='w-5 h-5' />
                {isActive && (
                  <motion.div
                    layoutId='activeDock'
                    className='absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-rose-500'
                  />
                )}
              </>
            )}
          </NavLink>

          <NavLink
            to='/discover'
            className={({ isActive }) =>
              `p-2.5 rounded-2xl transition flex flex-col items-center justify-center relative ${
                isActive
                  ? 'text-rose-500 font-bold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Compass className='w-5 h-5' />
                {isActive && (
                  <motion.div
                    layoutId='activeDock'
                    className='absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-rose-500'
                  />
                )}
              </>
            )}
          </NavLink>

          {/* Highlighted Center Create Post Action Button */}
          <NavLink
            to='/create-post'
            className='relative flex items-center justify-center p-1 group'
            title='Create New Post'
          >
            {({ isActive }) => (
              <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.9 }}
                className='w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md bg-gradient-to-tr from-amber-500 via-rose-500 to-pink-500 text-white shadow-rose-500/30'
              >
                <Plus className='w-5.5 h-5.5 stroke-[2.8] text-white drop-shadow-sm' />
              </motion.div>
            )}
          </NavLink>

          <NavLink
            to='/reels'
            className={({ isActive }) =>
              `p-2.5 rounded-2xl transition flex flex-col items-center justify-center relative ${
                isActive
                  ? 'text-rose-500 font-bold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Film className='w-5 h-5' />
                {isActive && (
                  <motion.div
                    layoutId='activeDock'
                    className='absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-rose-500'
                  />
                )}
              </>
            )}
          </NavLink>

          <NavLink
            to='/messages'
            className={({ isActive }) =>
              `p-2.5 rounded-2xl transition flex flex-col items-center justify-center relative ${
                isActive
                  ? 'text-rose-500 font-bold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <MessageCircle className='w-5 h-5' />
                {totalUnreadMessages > 0 && (
                  <span className='absolute top-1.5 right-1.5 size-2 bg-rose-500 rounded-full ring-1 ring-white dark:ring-slate-900' />
                )}
                {isActive && (
                  <motion.div
                    layoutId='activeDock'
                    className='absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-rose-500'
                  />
                )}
              </>
            )}
          </NavLink>

          <NavLink
            to='/profile'
            className={({ isActive }) =>
              `p-2.5 rounded-2xl transition flex flex-col items-center justify-center relative ${
                isActive
                  ? 'text-rose-500 font-bold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <img
                  src={user?.profile_picture || '/sample_profile.jpg'}
                  alt='Profile'
                  className={`size-6 rounded-full object-cover border-2 ${
                    isActive
                      ? 'border-rose-500'
                      : 'border-transparent'
                  }`}
                />
                {isActive && (
                  <motion.div
                    layoutId='activeDock'
                    className='absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-rose-500'
                  />
                )}
              </>
            )}
          </NavLink>
        </nav>
      </div>
    </div>
  ) : (
    <div className='h-screen flex items-center justify-center bg-[#e7ebf3] dark:bg-[#070a12] text-gray-900 dark:text-gray-100'>
      <h1 className='text-xl font-medium'>Loading Instagram...</h1>
    </div>
  )
}

export default Layout
