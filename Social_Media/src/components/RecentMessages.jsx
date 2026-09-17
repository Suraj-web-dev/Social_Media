import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { fetchRecentConversations } from '../redux/slices/messageSlice'
import { fetchDiscoverUsers } from '../redux/slices/userSlice'
import moment from 'moment'

const RecentMessages = () => {
  const dispatch = useDispatch()
  const { user: currentUser } = useSelector((state) => state.auth)
  const { conversations } = useSelector((state) => state.message)
  const { discoverUsers } = useSelector((state) => state.user)

  useEffect(() => {
    dispatch(fetchRecentConversations())
    dispatch(fetchDiscoverUsers())
  }, [dispatch])

  // If conversations exist, display them; otherwise fallback to contacts
  const hasConversations = conversations && conversations.length > 0

  const fallbackContacts = [
    ...(currentUser?.following || []),
    ...(discoverUsers || []).slice(0, 3),
  ].filter(
    (u, idx, arr) =>
      typeof u === 'object' &&
      u._id &&
      arr.findIndex((item) => item._id === u._id) === idx
  )

  return (
    <div className='bg-white dark:bg-slate-900 max-w-xs mt-4 p-4 min-h-20 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 text-xs text-slate-800 dark:text-gray-100'>
      <div className='flex items-center justify-between mb-3'>
        <h3 className='font-semibold text-gray-900 dark:text-gray-100 text-sm'>
          Recent Messages
        </h3>
        <Link
          to='/messages'
          className='text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium'
        >
          View all
        </Link>
      </div>

      <div className='flex flex-col max-h-64 overflow-y-scroll no-scrollbar space-y-1'>
        {hasConversations ? (
          conversations.map((conv) => {
            const user = conv.user || {}
            const lastMsg = conv.lastMessage || {}
            const unreadCount = conv.unreadCount || 0

            return (
              <Link
                to={`/messages/${user._id}`}
                key={user._id}
                className='flex items-center justify-between gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition group'
              >
                <div className='flex items-center gap-2.5 min-w-0 flex-1'>
                  <div className='relative shrink-0'>
                    <img
                      src={user.profile_picture || '/sample_profile.jpg'}
                      alt={user.full_name}
                      className='w-9 h-9 rounded-full object-cover border border-gray-100 dark:border-slate-700'
                    />
                  </div>

                  <div className='w-full min-w-0'>
                    <div className='flex items-center justify-between'>
                      <p className='font-semibold text-gray-900 dark:text-gray-100 truncate text-xs group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition'>
                        {user.full_name || 'User'}
                      </p>
                      {lastMsg.createdAt && (
                        <span className='text-[10px] text-gray-400 shrink-0'>
                          {moment(lastMsg.createdAt).fromNow(true)}
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] truncate ${unreadCount > 0 ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                      {lastMsg.message_type === 'image'
                        ? '📷 Photo'
                        : lastMsg.text || `@${user.username}`}
                    </p>
                  </div>
                </div>

                {/* WhatsApp-Style Unread Counter Badge */}
                {unreadCount > 0 && (
                  <div className='shrink-0 flex items-center justify-center min-w-4.5 h-4.5 px-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full shadow-xs animate-pulse'>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </div>
                )}
              </Link>
            )
          })
        ) : fallbackContacts.length > 0 ? (
          fallbackContacts.map((user) => (
            <Link
              to={`/messages/${user._id}`}
              key={user._id}
              className='flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition'
            >
              <img
                src={user.profile_picture || '/sample_profile.jpg'}
                alt={user.full_name}
                className='w-8 h-8 rounded-full object-cover border border-gray-100 dark:border-slate-700'
              />
              <div className='w-full min-w-0'>
                <p className='font-medium text-gray-900 dark:text-gray-100 truncate'>
                  {user.full_name}
                </p>
                <p className='text-gray-500 dark:text-gray-400 text-[11px] truncate'>
                  @{user.username}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <p className='text-gray-400 text-center py-4'>No recent messages</p>
        )}
      </div>
    </div>
  )
}

export default RecentMessages
