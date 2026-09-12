import React, { useEffect, useRef } from 'react'
import moment from 'moment'
import { Check, CheckCheck } from 'lucide-react'

const MessageList = ({ messages, currentUserId, recipient }) => {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className='flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50 no-scrollbar'>
      {/* Intro info card */}
      <div className='text-center py-6 space-y-2'>
        <img
          src={recipient.profile_picture}
          alt={recipient.full_name}
          className='w-16 h-16 rounded-full object-cover mx-auto shadow-sm border-2 border-white'
        />
        <h4 className='font-bold text-gray-900 text-base'>
          {recipient.full_name}
        </h4>
        <p className='text-xs text-gray-500 max-w-xs mx-auto'>
          {recipient.bio || `@${recipient.username} on Pingup`}
        </p>
        <div className='inline-block px-3 py-1 bg-white border border-gray-200 rounded-full text-[11px] text-gray-400'>
          This conversation is end-to-end encrypted
        </div>
      </div>

      {/* Messages */}
      {messages.map((msg, index) => {
        const isMyMessage =
          msg.from_user_id === currentUserId ||
          msg.from_user_id?._id === currentUserId ||
          msg.from_user_id === 'user_current'

        return (
          <div
            key={msg._id || index}
            className={`flex items-end gap-2 ${
              isMyMessage ? 'justify-end' : 'justify-start'
            }`}
          >
            {/* Recipient avatar for incoming messages */}
            {!isMyMessage && (
              <img
                src={recipient.profile_picture}
                alt=''
                className='w-7 h-7 rounded-full object-cover mb-1 border border-gray-200 shrink-0'
              />
            )}

            {/* Bubble */}
            <div
              className={`max-w-[78%] sm:max-w-[65%] rounded-2xl p-3 shadow-xs space-y-1.5 ${
                isMyMessage
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-xs'
                  : 'bg-white text-gray-800 border border-gray-100 rounded-bl-xs'
              }`}
            >
              {/* Media if image type */}
              {msg.media_url && (
                <div className='rounded-xl overflow-hidden max-h-60 bg-black/10'>
                  <img
                    src={msg.media_url}
                    alt='Attachment'
                    className='w-full h-auto max-h-60 object-cover hover:scale-102 transition duration-200 cursor-pointer'
                  />
                </div>
              )}

              {/* Text content */}
              {msg.text && (
                <p className='text-sm leading-relaxed whitespace-pre-wrap break-words'>
                  {msg.text}
                </p>
              )}

              {/* Timestamp & status */}
              <div
                className={`flex items-center justify-end gap-1 text-[10px] ${
                  isMyMessage ? 'text-white/70' : 'text-gray-400'
                }`}
              >
                <span>
                  {msg.createdAt
                    ? moment(msg.createdAt).format('LT')
                    : moment().format('LT')}
                </span>
                {isMyMessage && (
                  msg.seen ? (
                    <CheckCheck className='w-3.5 h-3.5 text-blue-200' />
                  ) : (
                    <Check className='w-3.5 h-3.5 text-white/60' />
                  )
                )}
              </div>
            </div>
          </div>
        )
      })}

      <div ref={bottomRef} />
    </div>
  )
}

export default MessageList

