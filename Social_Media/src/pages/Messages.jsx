import React, { useState, useEffect } from 'react'
import { Eye, MessageSquare, Search, Sparkles, UserPlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDiscoverUsers } from '../redux/slices/userSlice'
import { fetchRecentConversations } from '../redux/slices/messageSlice'
import moment from 'moment'
import { motion } from 'framer-motion'

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
    <div className='w-full max-w-6xl mx-auto p-3 sm:p-5 lg:p-6 pb-24 space-y-6'>
      {/* Header & Search */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-2'>
            <MessageSquare className='w-3.5 h-3.5' />
            <span>REAL-TIME DIRECT CHAT</span>
          </div>
          <h1 className='text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight'>
            Direct Messages
          </h1>
          <p className='text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-0.5'>
            Chat, share media and connect instantly with your friends
          </p>
        </div>

        {/* Search Bar */}
        <div className='relative w-full sm:w-80'>
          <Search className='w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2' />
          <input
            type='text'
            placeholder='Search chats or people...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full pl-10 pr-4 py-2.5 glass-card rounded-2xl text-xs sm:text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 border border-slate-200/80 dark:border-white/10 transition shadow-xs'
          />
        </div>
      </div>

      {/* 2-Column Responsive Workspace */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        {/* Left Column: Active Chats (7 cols) */}
        <div className='lg:col-span-7 space-y-3'>
          <div className='flex items-center justify-between px-1'>
            <h3 className='text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500'>
              Active Conversations ({filteredConversations.length})
            </h3>
          </div>

          <div className='space-y-2.5'>
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const user = conv.user || {}
                const lastMsg = conv.lastMessage || {}
                const unreadCount = conv.unreadCount || 0
                const isOnline = onlineUsers.includes(user._id?.toString())

                return (
                  <motion.div
                    key={user._id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => navigate(`/messages/${user._id}`)}
                    className='glass-card rounded-3xl p-4 border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-md hover:border-indigo-500/40 transition-all flex items-center justify-between gap-3.5 cursor-pointer group'
                  >
                    {/* User Avatar & Info */}
                    <div className='flex items-center gap-3.5 flex-1 min-w-0'>
                      <div className='relative shrink-0'>
                        <img
                          src={user.profile_picture || '/sample_profile.jpg'}
                          alt={user.full_name}
                          loading='lazy'
                          decoding='async'
                          className='w-12 h-12 rounded-full object-cover border-2 border-indigo-500/30 shadow-xs'
                        />
                        {isOnline && (
                          <span className='absolute bottom-0 right-0 size-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full ring-1 ring-emerald-500/40' />
                        )}
                      </div>

                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center justify-between'>
                          <h4 className='font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition truncate'>
                            {user.full_name || 'User'}
                          </h4>
                          {lastMsg.createdAt && (
                            <span className='text-[11px] text-gray-400 shrink-0 ml-2 font-medium'>
                              {moment(lastMsg.createdAt).fromNow(true)}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-xs truncate mt-0.5 ${
                            unreadCount > 0
                              ? 'font-bold text-gray-900 dark:text-gray-100'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {lastMsg.message_type === 'image'
                            ? '📷 Photo'
                            : lastMsg.text || `@${user.username}`}
                        </p>
                      </div>
                    </div>

                    {/* Unread Counter Badge */}
                    {unreadCount > 0 && (
                      <div className='shrink-0 flex items-center justify-center min-w-5.5 h-5.5 px-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[11px] font-bold rounded-full shadow-xs animate-pulse'>
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </div>
                    )}
                  </motion.div>
                )
              })
            ) : (
              <div className='glass-card rounded-3xl p-10 text-center border border-slate-200/80 dark:border-white/[0.08] space-y-2'>
                <MessageSquare className='w-8 h-8 text-indigo-500/60 mx-auto' />
                <p className='text-sm font-bold text-gray-900 dark:text-white'>
                  No active conversations yet
                </p>
                <p className='text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto'>
                  Pick a creator from your network on the right to start your first chat!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Start New Chat with Contacts (5 cols) */}
        <div className='lg:col-span-5 space-y-3'>
          <div className='flex items-center justify-between px-1'>
            <h3 className='text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500'>
              Start New Chat ({filteredOtherContacts.length})
            </h3>
          </div>

          <div className='space-y-2.5 max-h-[600px] overflow-y-auto no-scrollbar'>
            {filteredOtherContacts.length > 0 ? (
              filteredOtherContacts.map((contact) => {
                const isOnline = onlineUsers.includes(contact._id?.toString())

                return (
                  <motion.div
                    key={contact._id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => navigate(`/messages/${contact._id}`)}
                    className='glass-card rounded-2xl p-3.5 border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:border-indigo-500/40 transition-all flex items-center justify-between gap-3 cursor-pointer group'
                  >
                    <div className='flex items-center gap-3 min-w-0'>
                      <div className='relative shrink-0'>
                        <img
                          src={contact.profile_picture || '/sample_profile.jpg'}
                          alt={contact.full_name}
                          loading='lazy'
                          decoding='async'
                          className='w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700'
                        />
                        {isOnline && (
                          <span className='absolute bottom-0 right-0 size-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900' />
                        )}
                      </div>
                      <div className='min-w-0'>
                        <h4 className='font-bold text-gray-900 dark:text-gray-100 text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition truncate'>
                          {contact.full_name}
                        </h4>
                        <p className='text-[11px] text-gray-500 dark:text-gray-400 truncate'>
                          @{contact.username}
                        </p>
                      </div>
                    </div>

                    <button
                      type='button'
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/messages/${contact._id}`)
                      }}
                      className='p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition cursor-pointer shrink-0'
                      title='Message'
                    >
                      <MessageSquare className='w-4 h-4' />
                    </button>
                  </motion.div>
                )
              })
            ) : (
              <div className='glass-card rounded-2xl p-8 text-center border border-slate-200/80 dark:border-white/[0.08] text-xs text-gray-500 dark:text-gray-400'>
                No contacts matching "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Messages
