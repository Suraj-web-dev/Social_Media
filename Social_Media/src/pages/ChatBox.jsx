import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUserProfile } from '../redux/slices/userSlice'
import { fetchMessages, sendMessage } from '../redux/slices/messageSlice'
import ChatHeader from '../components/chat/ChatHeader'
import MessageList from '../components/chat/MessageList'
import ChatInput from '../components/chat/ChatInput'
import { Loader2 } from 'lucide-react'

const ChatBox = () => {
  const { userId } = useParams()
  const dispatch = useDispatch()
  const { user: currentUser } = useSelector((state) => state.auth)
  const { profileUser } = useSelector((state) => state.user)
  const { messages, loading } = useSelector((state) => state.message)

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserProfile(userId))
      dispatch(fetchMessages(userId))
    }
  }, [userId, dispatch])

  const recipient = profileUser || {
    _id: userId,
    full_name: 'User',
    username: 'user',
    profile_picture: '/sample_profile.jpg',
  }

  // Send message handler
  const handleSendMessage = ({ text, file }) => {
    if (!text?.trim() && !file) return

    const formData = new FormData()
    if (text) formData.append('text', text)
    if (file) formData.append('media', file)

    dispatch(sendMessage({ userId, formData }))
  }

  return (
    <div className='h-screen flex flex-col bg-white dark:bg-slate-900 overflow-hidden max-w-4xl mx-auto border-x border-gray-100 dark:border-slate-800 shadow-sm'>
      {/* Top Chat Header */}
      <ChatHeader recipient={recipient} />

      {/* Scrollable Messages Area */}
      {loading && messages.length === 0 ? (
        <div className='flex-1 flex flex-col items-center justify-center text-indigo-600 gap-2'>
          <Loader2 className='w-7 h-7 animate-spin' />
          <p className='text-sm text-gray-500 dark:text-gray-400'>Loading conversation...</p>
        </div>
      ) : (
        <MessageList
          messages={messages}
          currentUserId={currentUser?._id}
          recipient={recipient}
        />
      )}

      {/* Bottom Message Input Bar */}
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  )
}

export default ChatBox
