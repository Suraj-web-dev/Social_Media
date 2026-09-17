import React, { useState, useEffect } from 'react'
import { Eye, MessageSquare, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDiscoverUsers } from '../redux/slices/userSlice'
import { fetchRecentConversations } from '../redux/slices/messageSlice'
import moment from 'moment'

const Messages = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { user: currentUser } = useSelector((state) => state.auth)
  const { discoverUsers } = useSelector((state) => state.user)
  const { conversations, onlineUsers } = useSelector((state) => state.message)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    dispatch(fetchRecentConversations())
    dispatch(fetchDiscoverUsers())
  }, [dispatch])

  // Combine conversation users and remaining contacts
  const conversationUserIds = new Set(
    (conversations || []).map((c) =>
      typeof c.user === 'object' ? c.user._id : c.user
    )
  )

  const otherContacts = [
    ...(currentUser?.following || []),
    ...(discoverUsers || []),
  ].filter(
    (user, index, self) =>
      typeof user === 'object' &&
      user._id &&
      !conversationUserIds.has(user._id) &&
      self.findIndex((u) => u._id === user._id) === index
  )

  // Filter conversations & contacts based on search
  const filteredConversations = (conversations || []).filter((conv) => {
    const u = conv.user || {}
    const name = (u.full_name || '').toLowerCase()
    const username = (u.username || '').toLowerCase()
    const query = searchTerm.toLowerCase().trim()
    return name.includes(query) || username.includes(query)
  })

  const filteredOtherContacts = otherContacts.filter((user) => {
    const name = (user.full_name || '').toLowerCase()
    const username = (user.username || '').toLowerCase()
    const query = searchTerm.toLowerCase().trim()
    return name.includes(query) || username.includes(query)
  })

  return (
    <div className='min-h-full p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto'>
      {/* Header */}
      <div className='mb-6'>
        <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100'>
          Messages & Chats
        </h1>
        <p className='text-gray-500 dark:text-gray-400 text-sm sm:text-base mt-1'>
          Connect and chat with your friends in real-time
        </p>
      </div>

      {/* Search Bar */}
      <div className='relative mb-6 max-w-xl'>
        <Search className='w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2' />
        <input
          type='text'
          placeholder='Search conversations or people...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-xs'
        />
      </div>

      {/* Conversations List */}
      <div className='space-y-3 max-w-xl'>
        {filteredConversations.length > 0 && (
          <div className='space-y-2.5'>
            <h3 className='text-xs font-bold uppercase tracking-wider text-gray-400 px-1'>
              Active Chats
            </h3>
            {filteredConversations.map((conv) => {
              const user = conv.user || {}
              const lastMsg = conv.lastMessage || {}
              const unreadCount = conv.unreadCount || 0
              const isOnline = onlineUsers.includes(user._id?.toString())

              return (
                <div
                  key={user._id}
                  onClick={() => navigate(`/messages/${user._id}`)}
                  className='bg-white dark:bg-slate-900 rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 p-4 border border-gray-100 dark:border-slate-800 flex items-center justify-between gap-3 cursor-pointer group'
                >
                  {/* User Avatar & Info */}
                  <div className='flex items-center gap-3.5 flex-1 min-w-0'>
                    <div className='relative shrink-0'>
                      <img
                        src={user.profile_picture || '/sample_profile.jpg'}
                        alt={user.full_name}
                        className='w-12 h-12 rounded-full object-cover border border-gray-100 dark:border-slate-700 shadow-xs'
                      />
                      {isOnline && (
                        <span className='absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full' />
                      )}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between'>
                        <h3 className='font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition truncate'>
                          {user.full_name || 'User'}
                        </h3>
                        {lastMsg.createdAt && (
                          <span className='text-[11px] text-gray-400 shrink-0 ml-2'>
                            {moment(lastMsg.createdAt).fromNow(true)}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs truncate mt-0.5 ${unreadCount > 0 ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                        {lastMsg.message_type === 'image'
                          ? '📷 Photo'
                          : lastMsg.text || `@${user.username}`}
                      </p>
                    </div>
                  </div>

                  {/* WhatsApp-Style Unread Counter Badge */}
                  {unreadCount > 0 && (
                    <div className='shrink-0 flex items-center justify-center min-w-5.5 h-5.5 px-1.5 bg-emerald-500 text-white text-xs font-bold rounded-full shadow-xs animate-pulse'>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Other Suggested Contacts */}
        {filteredOtherContacts.length > 0 && (
          <div className='space-y-2.5 pt-4'>
            <h3 className='text-xs font-bold uppercase tracking-wider text-gray-400 px-1'>
              Start a New Conversation
            </h3>
            {filteredOtherContacts.map((user) => {
              const isOnline = onlineUsers.includes(user._id?.toString())
              return (
                <div
                  key={user._id}
                  className='bg-white dark:bg-slate-900 rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 p-4 border border-gray-100 dark:border-slate-800 flex items-center justify-between gap-4'
                >
                  <div
                    onClick={() => navigate(`/messages/${user._id}`)}
                    className='flex items-center gap-3.5 cursor-pointer flex-1 min-w-0'
                  >
                    <div className='relative shrink-0'>
                      <img
                        src={user.profile_picture || '/sample_profile.jpg'}
                        alt={user.full_name}
                        className='w-11 h-11 rounded-full object-cover border border-gray-100 dark:border-slate-700 shadow-xs'
                      />
                      {isOnline && (
                        <span className='absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full' />
                      )}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <h3 className='font-semibold text-gray-900 dark:text-gray-100 text-sm leading-snug hover:text-indigo-600 dark:hover:text-indigo-400 transition truncate'>
                        {user.full_name}
                      </h3>
                      <p className='text-xs text-gray-500 dark:text-gray-400 font-medium'>
                        @{user.username}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-2 shrink-0'>
                    <button
                      title='Start Chat'
                      onClick={() => navigate(`/messages/${user._id}`)}
                      className='p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:text-indigo-600 text-gray-600 dark:text-gray-300 cursor-pointer transition shadow-xs'
                    >
                      <MessageSquare className='w-4 h-4' />
                    </button>
                    <button
                      title='View Profile'
                      onClick={() => navigate(`/profile/${user._id}`)}
                      className='p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:text-indigo-600 text-gray-600 dark:text-gray-300 cursor-pointer transition shadow-xs'
                    >
                      <Eye className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {filteredConversations.length === 0 &&
          filteredOtherContacts.length === 0 && (
            <div className='text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 text-gray-500 dark:text-gray-400 text-sm'>
              No conversations found
            </div>
          )}
      </div>
    </div>
  )
}

export default Messages
