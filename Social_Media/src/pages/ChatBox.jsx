import React, { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUserProfile } from '../redux/slices/userSlice'
import { fetchMessages, sendMessage } from '../redux/slices/messageSlice'
import ChatHeader from '../components/chat/ChatHeader'
import MessageList from '../components/chat/MessageList'
import ChatInput from '../components/chat/ChatInput'
import { Loader2 } from 'lucide-react'
import API from '../api/axios'
import { showToast } from '../utils/toast'

const DEFAULT_PINGAI_RECIPIENT = {
  _id: 'pingai',
  full_name: 'PingAI (AI Companion)',
  username: 'pingai',
  profile_picture: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
  bio: 'Official AI Companion powered by Gemini • Active 24/7 ✨',
  isOnline: true,
}

const INITIAL_PINGAI_MESSAGE = {
  _id: 'intro-msg',
  sender: 'pingai',
  text: 'Hey there! 👋 I am PingAI, your intelligent companion inside PingUp. I can help you brainstorm viral reel ideas, write captions, debug code, or answer questions. What would you like to explore today?',
  createdAt: new Date().toISOString(),
}

const ChatBox = () => {
  const { userId } = useParams()
  const dispatch = useDispatch()
  const { user: currentUser } = useSelector((state) => state.auth)
  const { profileUser } = useSelector((state) => state.user)
  const { messages: reduxMessages, loading } = useSelector((state) => state.message)

  const isPingAI = userId === 'pingai'

  // PingAI local state
  const [pingAiMessages, setPingAiMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('pingai_chat_history')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {
      // Fallback
    }
    return [INITIAL_PINGAI_MESSAGE]
  })
  const [isAiThinking, setIsAiThinking] = useState(false)

  // Smart Replies state
  const [smartReplies, setSmartReplies] = useState([])
  const [loadingSmartReplies, setLoadingSmartReplies] = useState(false)
  const [prefilledText, setPrefilledText] = useState('')

  // Determine current active messages list
  const activeMessages = useMemo(() => {
    return isPingAI ? pingAiMessages : reduxMessages
  }, [isPingAI, pingAiMessages, reduxMessages])

  // Sync human chat data
  useEffect(() => {
    if (userId && !isPingAI) {
      dispatch(fetchUserProfile(userId))
      dispatch(fetchMessages(userId))
    }
  }, [userId, isPingAI, dispatch])

  // Persist PingAI messages
  useEffect(() => {
    if (isPingAI && pingAiMessages.length > 0) {
      try {
        localStorage.setItem('pingai_chat_history', JSON.stringify(pingAiMessages))
      } catch (err) {
        console.warn('Failed to save PingAI chat to localStorage:', err)
      }
    }
  }, [isPingAI, pingAiMessages])

  // Fetch contextual Smart Replies when incoming message changes
  const lastMessage = useMemo(() => {
    if (!activeMessages || activeMessages.length === 0) return null
    return activeMessages[activeMessages.length - 1]
  }, [activeMessages])

  const fetchAiSmartReplies = async (contextText) => {
    if (!contextText || !contextText.trim()) return
    setLoadingSmartReplies(true)
    try {
      const res = await API.post('/ai/smart-replies', {
        context: contextText,
        type: 'chat',
      })
      if (res.data?.success && Array.isArray(res.data.data)) {
        setSmartReplies(res.data.data)
      }
    } catch (err) {
      console.warn('Failed to fetch AI smart replies:', err)
    } finally {
      setLoadingSmartReplies(false)
    }
  }

  useEffect(() => {
    if (!lastMessage) return
    const senderId = typeof lastMessage.sender === 'object' ? lastMessage.sender?._id : lastMessage.sender
    const isFromOther = senderId && currentUser?._id && senderId.toString() !== currentUser._id.toString()

    if (isPingAI || isFromOther) {
      fetchAiSmartReplies(lastMessage.text)
    } else {
      setSmartReplies([])
    }
  }, [lastMessage, isPingAI, currentUser?._id])

  // Send message handler
  const handleSendMessage = async ({ text, file }) => {
    if (!text?.trim() && !file) return

    if (isPingAI) {
      // User message for PingAI
      const userMsg = {
        _id: 'user-' + Date.now(),
        sender: currentUser?._id || 'currentUser',
        text: text.trim(),
        createdAt: new Date().toISOString(),
      }

      const updatedHistory = [...pingAiMessages, userMsg]
      setPingAiMessages(updatedHistory)
      setSmartReplies([])
      setIsAiThinking(true)

      try {
        const res = await API.post('/ai/chat', {
          message: text.trim(),
          history: updatedHistory.map((m) => ({
            sender: m.sender === 'pingai' ? 'pingai' : 'user',
            text: m.text,
          })),
        })

        if (res.data?.success && res.data.data?.reply) {
          const aiMsg = {
            _id: 'pingai-' + Date.now(),
            sender: 'pingai',
            text: res.data.data.reply,
            createdAt: new Date().toISOString(),
          }
          setPingAiMessages((prev) => [...prev, aiMsg])
        } else {
          throw new Error('PingAI did not return a response.')
        }
      } catch (err) {
        console.error('PingAI chat error:', err)
        showToast.error(err.response?.data?.message || 'PingAI is busy. Please try again.')
        const errorMsg = {
          _id: 'err-' + Date.now(),
          sender: 'pingai',
          text: "I'm having a temporary hiccup connecting right now. Please ask me again in a moment! ⚡",
          createdAt: new Date().toISOString(),
        }
        setPingAiMessages((prev) => [...prev, errorMsg])
      } finally {
        setIsAiThinking(false)
      }
    } else {
      // Regular user chat
      const formData = new FormData()
      if (text) formData.append('text', text)
      if (file) formData.append('media', file)

      dispatch(sendMessage({ userId, formData }))
      setSmartReplies([])
    }
  }

  const recipient = isPingAI
    ? DEFAULT_PINGAI_RECIPIENT
    : profileUser || {
        _id: userId,
        full_name: 'User',
        username: 'user',
        profile_picture: '/sample_profile.jpg',
      }

  return (
    <div className='h-[calc(100dvh-5rem)] sm:h-full w-full flex flex-col glass-card overflow-hidden sm:rounded-none border-x-0 border-y-0 shadow-none'>
      {/* Top Chat Header */}
      <ChatHeader recipient={recipient} />

      {/* Scrollable Messages Area */}
      {!isPingAI && loading && activeMessages.length === 0 ? (
        <div className='flex-1 flex flex-col items-center justify-center text-indigo-600 gap-2'>
          <Loader2 className='w-7 h-7 animate-spin' />
          <p className='text-xs font-semibold text-gray-500 animate-pulse'>
            Loading conversation...
          </p>
        </div>
      ) : (
        <MessageList
          messages={activeMessages}
          currentUserId={currentUser?._id}
          recipient={recipient}
          isAiThinking={isAiThinking}
          onSelectStarterPrompt={(promptText) => {
            handleSendMessage({ text: promptText, file: null })
          }}
        />
      )}

      {/* Bottom Message Input Bar */}
      <ChatInput
        onSendMessage={handleSendMessage}
        smartReplies={smartReplies}
        loadingSmartReplies={loadingSmartReplies}
        onRefreshSmartReplies={() => {
          if (lastMessage?.text) fetchAiSmartReplies(lastMessage.text)
        }}
        externalText={prefilledText}
      />
    </div>
  )
}

export default ChatBox
