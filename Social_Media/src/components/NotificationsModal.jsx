import React, { useEffect } from 'react'
import {
  X,
  Heart,
  MessageCircle,
  UserPlus,
  CheckCheck,
  Trash2,
  Bell,
  Loader2,
  BadgeCheck,
} from 'lucide-react'
import { motion } from 'framer-motion'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../redux/slices/notificationSlice'

const NotificationsModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { notifications, unreadCount, loading } = useSelector(
    (state) => state.notification
  )

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchNotifications())
    }
  }, [isOpen, dispatch])

  if (!isOpen) return null

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) {
      dispatch(markNotificationAsRead(notif._id))
    }

    onClose()

    if (notif.type === 'follow') {
      navigate('/profile/' + (notif.sender?._id || notif.sender))
    } else if (notif.post?._id || notif.post) {
      navigate('/profile/' + (notif.sender?._id || notif.sender))
    }
  }

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsAsRead())
  }

  const handleDelete = (e, notifId) => {
    e.stopPropagation()
    dispatch(deleteNotification(notifId))
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs'
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className='relative w-full max-w-lg max-h-[85vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 dark:border-slate-800'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-800 shrink-0'>
          <div className='flex items-center gap-2.5'>
            <div className='p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'>
              <Bell className='w-5 h-5' />
            </div>
            <div>
              <h2 className='text-base sm:text-lg font-bold text-gray-900 dark:text-white'>
                Notifications
              </h2>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                {unreadCount > 0
                  ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
                  : 'All caught up!'}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-1.5'>
            {unreadCount > 0 && (
              <button
                type='button'
                onClick={handleMarkAllRead}
                className='flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition cursor-pointer'
                title='Mark all as read'
              >
                <CheckCheck className='w-3.5 h-3.5' />
                <span className='hidden sm:inline'>Mark all read</span>
              </button>
            )}
            <button
              type='button'
              onClick={onClose}
              className='p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer'
            >
              <X className='w-5 h-5' />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className='flex-1 overflow-y-auto p-2 sm:p-3 space-y-1.5 custom-scrollbar min-h-0'>
          {loading && notifications.length === 0 ? (
            <div className='py-16 flex flex-col items-center justify-center text-indigo-600 gap-2'>
              <Loader2 className='w-7 h-7 animate-spin' />
              <p className='text-xs text-gray-400'>Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className='py-16 text-center space-y-2 text-gray-500 dark:text-gray-400'>
              <div className='w-12 h-12 mx-auto rounded-2xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400'>
                <Bell className='w-6 h-6' />
              </div>
              <p className='font-semibold text-sm text-gray-700 dark:text-gray-300'>
                No notifications yet
              </p>
              <p className='text-xs'>
                When someone likes, comments, or follows you, you'll see it here.
              </p>
            </div>
          ) : (
            notifications.map((notif) => {
              const sender = notif.sender || {}
              const senderName = sender.full_name || 'Someone'
              const senderPic = sender.profile_picture || '/sample_profile.jpg'
              const isVerified = sender.is_verified

              let TypeIcon = Heart
              let badgeBg = 'bg-red-500'
              let actionText = 'liked your post'

              if (notif.type === 'comment_post') {
                TypeIcon = MessageCircle
                badgeBg = 'bg-indigo-500'
                actionText = notif.text
                  ? `commented: "${notif.text}"`
                  : 'commented on your post'
              } else if (notif.type === 'like_comment') {
                TypeIcon = Heart
                badgeBg = 'bg-pink-500'
                actionText = 'liked your comment'
              } else if (notif.type === 'follow') {
                TypeIcon = UserPlus
                badgeBg = 'bg-blue-500'
                actionText = 'started following you'
              }

              const postThumbnail =
                notif.post?.image_urls && notif.post?.image_urls[0]

              return (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`flex items-center justify-between gap-3 p-3 rounded-2xl cursor-pointer transition ${
                    !notif.isRead
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40'
                      : 'hover:bg-gray-50 dark:hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  {/* Left Avatar with Type Badge */}
                  <div className='relative shrink-0'>
                    <img
                      src={senderPic}
                      alt={senderName}
                      className='w-11 h-11 rounded-full object-cover border border-gray-100 dark:border-slate-800 shadow-2xs'
                    />
                    <div
                      className={`absolute -bottom-1 -right-1 p-1 rounded-full text-white ${badgeBg} shadow-xs`}
                    >
                      <TypeIcon className='w-2.5 h-2.5' />
                    </div>
                  </div>

                  {/* Middle Text */}
                  <div className='flex-1 min-w-0'>
                    <p className='text-xs sm:text-sm text-gray-800 dark:text-gray-200 leading-snug line-clamp-2'>
                      <strong className='font-semibold text-gray-900 dark:text-white mr-1'>
                        {senderName}
                      </strong>
                      {isVerified && (
                        <BadgeCheck className='w-3.5 h-3.5 text-blue-500 fill-blue-50 inline-block mr-1 -mt-0.5' />
                      )}
                      <span>{actionText}</span>
                    </p>
                    <p className='text-[11px] text-gray-400 dark:text-gray-500 pt-0.5'>
                      {notif.createdAt
                        ? moment(notif.createdAt).fromNow()
                        : 'just now'}
                    </p>
                  </div>

                  {/* Right Thumbnail & Delete */}
                  <div className='flex items-center gap-2 shrink-0'>
                    {postThumbnail && (
                      <img
                        src={postThumbnail}
                        alt='Post'
                        className='w-10 h-10 rounded-xl object-cover border border-gray-200 dark:border-slate-700'
                      />
                    )}

                    {!notif.isRead && (
                      <div className='w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400' />
                    )}

                    <button
                      type='button'
                      onClick={(e) => handleDelete(e, notif._id)}
                      className='p-1 text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition cursor-pointer rounded'
                      title='Delete notification'
                    >
                      <Trash2 className='w-3.5 h-3.5' />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default NotificationsModal
