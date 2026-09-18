import React, { useState, useEffect, useMemo } from 'react'
import {
  X,
  Copy,
  Check,
  Send,
  Search,
  Loader2,
  Share2,
  Film,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Users,
  ShieldAlert,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import {
  fetchRecentConversations,
  sendMessage,
} from '../redux/slices/messageSlice'
import { fetchConnectionsData, fetchDiscoverUsers } from '../redux/slices/userSlice'
import { fetchUserCircles } from '../redux/slices/circleSlice'
import { showToast } from '../utils/toast'

const SharePostModal = ({ isOpen, onClose, post }) => {
  const dispatch = useDispatch()
  const { user: currentUser } = useSelector((state) => state.auth)
  const { connectionsData, connectionsLoading, discoverUsers } = useSelector(
    (state) => state.user
  )
  const { conversations } = useSelector((state) => state.message)
  const { circles, loading: circlesLoading } = useSelector(
    (state) => state.circle
  )

  const [activeTab, setActiveTab] = useState('all') // 'all' | 'circles' | 'recent'
  const [copied, setCopied] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [customMessage, setCustomMessage] = useState('')
  const [sentMap, setSentMap] = useState({})
  const [sendingId, setSendingId] = useState(null)
  const [sentCircleMap, setSentCircleMap] = useState({})
  const [sendingCircleId, setSendingCircleId] = useState(null)

  // Fetch connections, circles, and chat history when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchConnectionsData())
      dispatch(fetchRecentConversations())
      dispatch(fetchUserCircles())
      dispatch(fetchDiscoverUsers())
    }
  }, [isOpen, dispatch])

  // Escape key support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Combine and deduplicate users from all sources
  const availableUsers = useMemo(() => {
    const userMap = new Map()
    const currentId = currentUser?._id?.toString()

    const addUsers = (list) => {
      if (!Array.isArray(list)) return
      list.forEach((item) => {
        const u = item?.user || item
        if (!u || !u._id) return
        const uid = u._id.toString()
        if (uid !== currentId && !userMap.has(uid)) {
          userMap.set(uid, u)
        }
      })
    }

    addUsers(connectionsData?.connections)
    addUsers(connectionsData?.following)
    addUsers(connectionsData?.followers)
    addUsers(conversations?.map((c) => c?.user))
    addUsers(currentUser?.connections)
    addUsers(currentUser?.following)
    addUsers(discoverUsers)

    return Array.from(userMap.values())
  }, [connectionsData, conversations, currentUser, discoverUsers])

  if (!isOpen || !post) return null

  const postId = post._id || post.id || (typeof post === 'string' ? post : '')
  const isReel = Boolean(
    post.is_reel ||
      (post.video_urls && post.video_urls.length > 0 && !post.image_urls?.length) ||
      (post.video_url && !post.image_urls?.length)
  )
  const postUrl = `${window.location.origin}/${isReel ? 'reels' : 'post'}/${postId}`

  // Filter individual users by search query
  const filteredUsers = availableUsers.filter((user) => {
    const name = (user.full_name || '').toLowerCase()
    const username = (user.username || '').toLowerCase()
    const bio = (user.bio || '').toLowerCase()
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return name.includes(q) || username.includes(q) || bio.includes(q)
  })

  // Filter circles by search query
  const filteredCircles = (circles || []).filter((circle) => {
    const name = (circle.name || '').toLowerCase()
    const desc = (circle.description || '').toLowerCase()
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return name.includes(q) || desc.includes(q)
  })

  const copyToClipboard = (text) => {
    if (navigator?.clipboard?.writeText) {
      return navigator.clipboard.writeText(text)
    }
    return new Promise((resolve, reject) => {
      try {
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.top = '0'
        textArea.style.left = '0'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        const successful = document.execCommand('copy')
        document.body.removeChild(textArea)
        if (successful) {
          resolve()
        } else {
          reject(new Error('Copy command failed'))
        }
      } catch (err) {
        reject(err)
      }
    })
  }

  const handleCopyLink = async () => {
    try {
      await copyToClipboard(postUrl)
      setCopied(true)
      showToast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2500)
    } catch {
      showToast.error('Failed to copy link.')
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: isReel ? 'Reel on PingUp' : 'Post on PingUp',
          text: post.content || 'Check out this post on PingUp!',
          url: postUrl,
        })
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopyLink()
        }
      }
    } else {
      handleCopyLink()
    }
  }

  // Send to single user in DM
  const handleSendToUser = async (targetUser) => {
    const targetUserId = targetUser._id || targetUser
    if (!targetUserId || sendingId) return

    setSendingId(targetUserId)
    try {
      const messageText = customMessage.trim()
        ? `${customMessage.trim()}\n\n🔗 ${postUrl}`
        : `Check out this ${isReel ? 'reel' : 'post'}: ${postUrl}`

      const formData = new FormData()
      formData.append('text', messageText)

      await dispatch(
        sendMessage({
          userId: targetUserId,
          formData,
        })
      ).unwrap()

      setSentMap((prev) => ({ ...prev, [targetUserId]: true }))
      showToast.success(`Sent to ${targetUser.full_name || 'user'}!`)
    } catch (err) {
      showToast.error(
        typeof err === 'string'
          ? err
          : err?.message || 'Failed to send direct message.'
      )
    } finally {
      setSendingId(null)
    }
  }

  // Send to all members in a Circle
  const handleSendToCircle = async (circle) => {
    const circleId = circle._id
    if (!circleId || sendingCircleId) return

    const members = circle.members || []
    if (members.length === 0) {
      showToast.info(`No members in "${circle.name}". Add friends to this circle from Connections!`)
      return
    }

    setSendingCircleId(circleId)
    try {
      const messageText = customMessage.trim()
        ? `${customMessage.trim()}\n\n🔗 ${postUrl}`
        : `Shared to ${circle.icon || '⭐'} ${circle.name}: ${postUrl}`

      // Send direct message to each member concurrently
      const sendPromises = members.map((member) => {
        const memberId = member._id || member
        const formData = new FormData()
        formData.append('text', messageText)
        return dispatch(sendMessage({ userId: memberId, formData })).unwrap()
      })

      await Promise.allSettled(sendPromises)

      setSentCircleMap((prev) => ({ ...prev, [circleId]: true }))
      // Also mark each member as sent in sentMap
      setSentMap((prev) => {
        const next = { ...prev }
        members.forEach((m) => {
          const mid = m._id || m
          next[mid] = true
        })
        return next
      })

      showToast.success(`Sent to all ${members.length} member(s) in "${circle.name}"!`)
    } catch (err) {
      showToast.error(
        typeof err === 'string'
          ? err
          : err?.message || 'Failed to send to circle members.'
      )
    } finally {
      setSendingCircleId(null)
    }
  }

  const postThumbnail =
    (post.image_urls && post.image_urls[0]) ||
    post.thumbnail_url ||
    ''

  const author = post.user || {}
  const authorName = author.full_name || 'Social Post'

  // Social share urls
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `Check this out on PingUp: ${postUrl}`
  )}`
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `Check this out on PingUp: ${postUrl}`
  )}`
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(
    postUrl
  )}&text=${encodeURIComponent('Check this out on PingUp!')}`

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className='fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs'
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className='relative w-full max-w-lg max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 dark:border-slate-800'
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className='flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-800 shrink-0'>
            <div className='flex items-center gap-2.5'>
              <div className='p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'>
                <Share2 className='w-5 h-5' />
              </div>
              <div>
                <h2 className='text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight'>
                  Share {isReel ? 'Reel' : 'Post'}
                </h2>
                <p className='text-[11px] text-gray-400'>
                  Send to friends, circles or copy shareable link
                </p>
              </div>
            </div>
            <button
              type='button'
              onClick={onClose}
              className='p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer'
            >
              <X className='w-5 h-5' />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className='p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar min-h-0'>
            {/* Post Excerpt Preview */}
            <div className='flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/70 rounded-2xl border border-gray-100 dark:border-slate-800'>
              {postThumbnail ? (
                <img
                  src={postThumbnail}
                  alt='Thumbnail'
                  className='w-12 h-12 rounded-xl object-cover shrink-0 border border-gray-200 dark:border-slate-700'
                />
              ) : isReel ? (
                <div className='w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/80 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold shrink-0'>
                  <Film className='w-6 h-6' />
                </div>
              ) : (
                <div className='w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shrink-0 text-sm'>
                  Aa
                </div>
              )}
              <div className='flex-1 min-w-0'>
                <p className='text-xs font-semibold text-gray-900 dark:text-white truncate'>
                  {authorName}
                </p>
                <p className='text-xs text-gray-500 dark:text-gray-400 line-clamp-2'>
                  {post.content || (isReel ? 'Shared Reel Video' : 'Photo Post')}
                </p>
              </div>
            </div>

            {/* Optional Custom Message Field */}
            <div className='space-y-1'>
              <input
                type='text'
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder='Write a message... (optional)'
                className='w-full text-xs bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 rounded-xl px-3.5 py-2.5 border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500'
              />
            </div>

            {/* Quick External Share Buttons */}
            <div className='grid grid-cols-4 gap-2 pt-0.5'>
              <button
                type='button'
                onClick={handleCopyLink}
                className='flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-gray-50 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-gray-100 dark:border-slate-800 transition cursor-pointer group'
              >
                <div className='p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform'>
                  {copied ? (
                    <Check className='w-4 h-4 text-emerald-500' />
                  ) : (
                    <Copy className='w-4 h-4' />
                  )}
                </div>
                <span className='text-[10px] font-medium text-gray-600 dark:text-gray-300'>
                  {copied ? 'Copied!' : 'Copy'}
                </span>
              </button>

              <a
                href={whatsappUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-gray-50 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-gray-100 dark:border-slate-800 transition cursor-pointer group text-center'
              >
                <div className='p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform'>
                  <MessageSquare className='w-4 h-4' />
                </div>
                <span className='text-[10px] font-medium text-gray-600 dark:text-gray-300'>
                  WhatsApp
                </span>
              </a>

              <a
                href={twitterUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-gray-50 dark:bg-slate-800/80 hover:bg-sky-50 dark:hover:bg-sky-950/40 border border-gray-100 dark:border-slate-800 transition cursor-pointer group text-center'
              >
                <div className='p-2 rounded-xl bg-sky-100 dark:bg-sky-900/60 text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform'>
                  <ExternalLink className='w-4 h-4' />
                </div>
                <span className='text-[10px] font-medium text-gray-600 dark:text-gray-300'>
                  X / Twitter
                </span>
              </a>

              <button
                type='button'
                onClick={handleNativeShare}
                className='flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-gray-50 dark:bg-slate-800/80 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-gray-100 dark:border-slate-800 transition cursor-pointer group'
              >
                <div className='p-2 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform'>
                  <Share2 className='w-4 h-4' />
                </div>
                <span className='text-[10px] font-medium text-gray-600 dark:text-gray-300'>
                  More
                </span>
              </button>
            </div>

            {/* Share via Link Bar */}
            <div className='space-y-1.5'>
              <label className='text-xs font-medium text-gray-500 dark:text-gray-400'>
                Direct Post Link
              </label>
              <div className='flex items-center gap-2 p-1.5 pl-3 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700'>
                <input
                  type='text'
                  readOnly
                  value={postUrl}
                  className='flex-1 text-xs bg-transparent text-gray-600 dark:text-gray-300 outline-none truncate'
                />
                <button
                  type='button'
                  onClick={handleCopyLink}
                  className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className='w-3.5 h-3.5' />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className='w-3.5 h-3.5' />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Section Tabs: All Friends vs My Circles */}
            <div className='space-y-2.5 pt-2 border-t border-gray-100 dark:border-slate-800'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-1.5 bg-gray-100 dark:bg-slate-800 p-1 rounded-2xl'>
                  <button
                    type='button'
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      activeTab === 'all'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                  >
                    Friends ({filteredUsers.length})
                  </button>
                  <button
                    type='button'
                    onClick={() => setActiveTab('circles')}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                      activeTab === 'circles'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                  >
                    <span>🏠 My Circles</span>
                    <span className='px-1.5 py-0.2 bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 rounded-full text-[10px]'>
                      {filteredCircles.length}
                    </span>
                  </button>
                </div>
              </div>

              {/* Realtime Search Input with Clear Button */}
              <div className='relative'>
                <Search className='w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
                <input
                  type='text'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    activeTab === 'circles'
                      ? 'Search circles (e.g. Coding, Family, College)...'
                      : 'Search friends by name or @username...'
                  }
                  className='w-full text-xs bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 rounded-xl pl-9 pr-8 py-2.5 border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                />
                {searchQuery && (
                  <button
                    type='button'
                    onClick={() => setSearchQuery('')}
                    className='absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5'
                  >
                    <X className='w-3.5 h-3.5' />
                  </button>
                )}
              </div>

              {/* TAB 1: CIRCLES VIEW */}
              {activeTab === 'circles' && (
                <div className='space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1'>
                  {circlesLoading && filteredCircles.length === 0 ? (
                    <div className='flex items-center justify-center py-8 text-indigo-600 gap-2'>
                      <Loader2 className='w-5 h-5 animate-spin' />
                      <span className='text-xs text-gray-500 dark:text-gray-400'>
                        Loading circles...
                      </span>
                    </div>
                  ) : filteredCircles.length === 0 ? (
                    <div className='text-center py-8 text-xs text-gray-400 space-y-1'>
                      <p className='font-medium text-gray-600 dark:text-gray-300'>
                        {circles.length === 0
                          ? 'No circles created yet.'
                          : 'No matching circles found.'}
                      </p>
                      <p className='text-[11px]'>
                        Create or manage your circles from the Connections page!
                      </p>
                    </div>
                  ) : (
                    filteredCircles.map((circle) => {
                      const circleId = circle._id
                      const memberCount = circle.members?.length || 0
                      const isSent = !!sentCircleMap[circleId]
                      const isSending = sendingCircleId === circleId
                      const circleColor = circle.color || '#6366f1'

                      return (
                        <div
                          key={circleId}
                          className='flex items-center justify-between p-3 rounded-2xl bg-gray-50/70 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 transition'
                        >
                          <div className='flex items-center gap-3 min-w-0'>
                            <div
                              className='w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 shadow-2xs border'
                              style={{
                                backgroundColor: `${circleColor}18`,
                                borderColor: `${circleColor}35`,
                              }}
                            >
                              {circle.icon || '⭐'}
                            </div>

                            <div className='min-w-0'>
                              <div className='flex items-center gap-1.5'>
                                <p className='text-xs font-bold text-gray-900 dark:text-white truncate'>
                                  {circle.name}
                                </p>
                              </div>
                              <p className='text-[11px] text-gray-400 truncate flex items-center gap-1'>
                                <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
                                {circle.description && (
                                  <>
                                    <span>•</span>
                                    <span className='truncate max-w-[140px]'>
                                      {circle.description}
                                    </span>
                                  </>
                                )}
                              </p>
                            </div>
                          </div>

                          <button
                            type='button'
                            onClick={() => handleSendToCircle(circle)}
                            disabled={isSent || isSending || memberCount === 0}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
                              isSent
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 cursor-default'
                                : memberCount === 0
                                ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-500 cursor-not-allowed border border-gray-200 dark:border-slate-700'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs disabled:opacity-50'
                            }`}
                          >
                            {isSending ? (
                              <>
                                <Loader2 className='w-3.5 h-3.5 animate-spin' />
                                <span>Sending...</span>
                              </>
                            ) : isSent ? (
                              <>
                                <Check className='w-3.5 h-3.5 text-emerald-500' />
                                <span>Sent!</span>
                              </>
                            ) : memberCount === 0 ? (
                              <span>Empty</span>
                            ) : (
                              <>
                                <Send className='w-3.5 h-3.5' />
                                <span>Send to All</span>
                              </>
                            )}
                          </button>
                        </div>
                      )
                    })
                  )}
                </div>
              )}

              {/* TAB 2: ALL FRIENDS VIEW */}
              {activeTab === 'all' && (
                <div className='space-y-1 max-h-56 overflow-y-auto custom-scrollbar pr-1'>
                  {connectionsLoading && filteredUsers.length === 0 ? (
                    <div className='flex items-center justify-center py-8 text-indigo-600 gap-2'>
                      <Loader2 className='w-5 h-5 animate-spin' />
                      <span className='text-xs text-gray-500 dark:text-gray-400'>
                        Loading connections...
                      </span>
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className='text-center py-8 text-xs text-gray-400 space-y-1'>
                      <p className='font-medium text-gray-600 dark:text-gray-300'>
                        {availableUsers.length === 0
                          ? 'No connections found.'
                          : 'No matching people found.'}
                      </p>
                      <p className='text-[11px]'>
                        {availableUsers.length === 0
                          ? 'Follow or connect with friends to send direct messages!'
                          : 'Try searching with another name or username.'}
                      </p>
                    </div>
                  ) : (
                    filteredUsers.map((userObj) => {
                      const connId = userObj._id || userObj
                      const connName = userObj.full_name || 'User'
                      const connUsername = userObj.username || 'user'
                      const connPic =
                        userObj.profile_picture || '/sample_profile.jpg'
                      const isSent = !!sentMap[connId]
                      const isSending = sendingId === connId

                      return (
                        <div
                          key={connId}
                          className='flex items-center justify-between p-2 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800/60 transition'
                        >
                          <div className='flex items-center gap-2.5 min-w-0'>
                            <img
                              src={connPic}
                              alt={connName}
                              className='w-9 h-9 rounded-full object-cover border border-gray-100 dark:border-slate-800 shrink-0'
                            />
                            <div className='min-w-0'>
                              <p className='text-xs font-semibold text-gray-900 dark:text-white truncate'>
                                {connName}
                              </p>
                              <p className='text-[11px] text-gray-400 truncate'>
                                @{connUsername}
                              </p>
                            </div>
                          </div>

                          <button
                            type='button'
                            onClick={() => handleSendToUser(userObj)}
                            disabled={isSent || isSending}
                            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                              isSent
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 cursor-default'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs disabled:opacity-50'
                            }`}
                          >
                            {isSending ? (
                              <Loader2 className='w-3.5 h-3.5 animate-spin' />
                            ) : isSent ? (
                              <>
                                <Check className='w-3.5 h-3.5 text-emerald-500' />
                                <span>Sent</span>
                              </>
                            ) : (
                              <>
                                <Send className='w-3.5 h-3.5' />
                                <span>Send</span>
                              </>
                            )}
                          </button>
                        </div>
                      )
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default SharePostModal
