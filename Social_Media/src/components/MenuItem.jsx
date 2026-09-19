import React from 'react'
import { menuItemsData } from '../assets'
import { NavLink } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'

const MenuItem = ({ setsidebarOpen, onOpenNotifications }) => {
  const { unreadCount } = useSelector((state) => state.notification)
  const { conversations } = useSelector((state) => state.message)
  const FeedIcon = menuItemsData[0]?.Icon

  const totalUnreadMessages = (conversations || []).reduce(
    (sum, c) => sum + (c.unreadCount || 0),
    0
  )

  return (
    <div className='px-4 sm:px-5 text-gray-600 dark:text-gray-300 space-y-1.5 font-medium'>
      {/* Feed */}
      <NavLink
        to='/'
        end
        onClick={() => setsidebarOpen?.(false)}
        className={({ isActive }) =>
          `relative px-3.5 py-2.5 flex items-center gap-3.5 rounded-2xl transition-all duration-200 ${
            isActive
              ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/80 dark:bg-indigo-950/50 shadow-xs border border-indigo-100 dark:border-indigo-900/50'
              : 'hover:bg-slate-100/80 dark:hover:bg-white/[0.04] dark:hover:text-white border border-transparent'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <motion.div
              whileHover={{ scale: 1.15, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              className={`p-1.5 rounded-xl ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {FeedIcon && <FeedIcon className='w-4 h-4' />}
            </motion.div>
            <span className='text-sm'>{menuItemsData[0]?.label || 'Feed'}</span>
          </>
        )}
      </NavLink>

      {/* Notifications Button with Live Unread Badge */}
      <button
        type='button'
        onClick={() => {
          setsidebarOpen?.(false)
          onOpenNotifications?.()
        }}
        className='w-full px-3.5 py-2.5 flex items-center justify-between rounded-2xl transition-all duration-200 hover:bg-slate-100/80 dark:hover:bg-white/[0.04] dark:hover:text-white cursor-pointer text-left border border-transparent'
      >
        <div className='flex items-center gap-3.5'>
          <motion.div
            whileHover={{ scale: 1.15, rotate: 12 }}
            whileTap={{ scale: 0.9 }}
            className='p-1.5 rounded-xl text-gray-500 dark:text-gray-400'
          >
            <Bell className='w-4 h-4' />
          </motion.div>
          <span className='text-sm font-medium'>Notifications</span>
        </div>
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className='px-2 py-0.5 text-[11px] font-bold rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm ring-2 ring-rose-500/20'
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Remaining Menu Items (Reels, Messages, Connections, Discover, Profile) */}
      {menuItemsData.slice(1).map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={() => setsidebarOpen?.(false)}
          className={({ isActive }) =>
            `relative px-3.5 py-2.5 flex items-center justify-between rounded-2xl transition-all duration-200 ${
              isActive
                ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/80 dark:bg-indigo-950/50 shadow-xs border border-indigo-100 dark:border-indigo-900/50'
                : 'hover:bg-slate-100/80 dark:hover:bg-white/[0.04] dark:hover:text-white border border-transparent'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className='flex items-center gap-3.5'>
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 6 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-1.5 rounded-xl ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  <Icon className='w-4 h-4' />
                </motion.div>
                <span className='text-sm'>{label}</span>
              </div>

              {/* Unread Counter Badge for Messages */}
              {to === '/messages' && totalUnreadMessages > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className='px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-500/20'
                >
                  {totalUnreadMessages > 99 ? '99+' : totalUnreadMessages}
                </motion.span>
              )}
            </>
          )}
        </NavLink>
      ))}
    </div>
  )
}

export default MenuItem