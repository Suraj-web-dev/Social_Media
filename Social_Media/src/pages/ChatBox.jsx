import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  dummyConnectionsData,
  dummyMessagesData,
  dummyUser2Data,
  dummyUserData
} from '../assets'
import ChatHeader from '../components/chat/ChatHeader'
import MessageList from '../components/chat/MessageList'
import ChatInput from '../components/chat/ChatInput'

const ChatBox = () => {
  const { userId } = useParams()

  // Find recipient based on URL param or fallback
  const recipient =
    dummyConnectionsData.find((u) => u._id === userId) || dummyUser2Data

  // Messages state
  const [messages, setMessages] = useState(dummyMessagesData || [])

  // Send message handler
  const handleSendMessage = ({ text, media_url }) => {
    const newMessage = {
      _id: `msg_${Date.now()}`,
      from_user_id: dummyUserData._id,
      to_user_id: recipient._id,
      text,
      message_type: media_url ? 'image' : 'text',
      media_url: media_url || '',
      createdAt: new Date().toISOString(),
      seen: false
    }

    setMessages((prev) => [...prev, newMessage])

    // Optional subtle simulated response after 1.5s if it's the first test message
    if (messages.length < 6) {
      setTimeout(() => {
        const reply = {
          _id: `msg_${Date.now() + 1}`,
          from_user_id: recipient._id,
          to_user_id: dummyUserData._id,
          text: 'Hey there! Thanks for reaching out. How are you doing today?',
          message_type: 'text',
          media_url: '',
          createdAt: new Date().toISOString(),
          seen: true
        }
        setMessages((prev) => [...prev, reply])
      }, 1500)
    }
  }

  return (
    <div className='h-screen flex flex-col bg-white overflow-hidden max-w-4xl mx-auto border-x border-gray-100 shadow-sm'>
      {/* Top Chat Header */}
      <ChatHeader recipient={recipient} />

      {/* Scrollable Messages Area */}
      <MessageList
        messages={messages}
        currentUserId={dummyUserData._id}
        recipient={recipient}
      />

      {/* Bottom Message Input Bar */}
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  )
}

export default ChatBox
