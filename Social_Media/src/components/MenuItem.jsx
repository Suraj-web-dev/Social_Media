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
    <div className='px-6 text-gray-600 dark:text-gray-300 space-y-1 font-medium'>
      {/* Feed */}
      <NavLink
        to='/'
        end
        onClick={() => setsidebarOpen?.(false)}
        className={({ isActive }) =>
          `px-3.5 py-2.5 flex items-center gap-3 rounded-2xl transition-all duration-200 ${
            isActive
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 font-semibold shadow-xs'
              : 'hover:bg-gray-50 dark:hover:bg-slate-800/60 dark:hover:text-white'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <motion.div
              whileHover={{ scale: 1.15, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              {FeedIcon && <FeedIcon className='w-5 h-5' />}
            </motion.div>
            <span>Feed</span>
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
        className='w-full px-3.5 py-2.5 flex items-center justify-between rounded-2xl transition-all duration-200 hover:bg-gray-50 dark:hover:bg-slate-800/60 dark:hover:text-white cursor-pointer text-left'
      >
        <div className='flex items-center gap-3'>
          <motion.div
            whileHover={{ scale: 1.15, rotate: 12 }}
            whileTap={{ scale: 0.9 }}
          >
            <Bell className='w-5 h-5' />
          </motion.div>
          <span>Notifications</span>
        </div>
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className='px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white shadow-sm ring-2 ring-rose-500/20'
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
            `px-3.5 py-2.5 flex items-center justify-between rounded-2xl transition-all duration-200 ${
              isActive
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 font-semibold shadow-xs'
                : 'hover:bg-gray-50 dark:hover:bg-slate-800/60 dark:hover:text-white'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className='flex items-center gap-3'>
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 6 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon className='w-5 h-5' />
                </motion.div>
                <span>{label}</span>
              </div>

              {/* Unread Counter Badge for Messages */}
              {to === '/messages' && totalUnreadMessages > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className='px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-500/20'
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