import React, { useEffect, useRef } from 'react'
import moment from 'moment'
import { Check, CheckCheck, Film } from 'lucide-react'

const MessageList = ({ messages, currentUserId, recipient }) => {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className='flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950 no-scrollbar'>
      {/* Intro info card */}
      <div className='text-center py-6 space-y-2'>
        <img
          src={recipient.profile_picture || '/sample_profile.jpg'}
          alt={recipient.full_name || 'User'}
          className='w-16 h-16 rounded-full object-cover mx-auto shadow-sm border-2 border-white dark:border-slate-800'
        />
        <h4 className='font-bold text-gray-900 dark:text-gray-100 text-base'>
          {recipient.full_name || 'User'}
        </h4>
        <p className='text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto'>
          {recipient.bio || `@${recipient.username || 'user'} on PingUp`}
        </p>
        <div className='inline-block px-3 py-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-full text-[11px] text-gray-400'>
          This conversation is real-time & end-to-end encrypted
        </div>
      </div>

      {/* Messages */}
      {messages.map((msg, index) => {
        const senderId =
          typeof msg.sender === 'object' ? msg.sender?._id : msg.sender

        const isMyMessage =
          senderId &&
          currentUserId &&
          senderId.toString() === currentUserId.toString()

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
                src={recipient.profile_picture || '/sample_profile.jpg'}
                alt=''
                className='w-7 h-7 rounded-full object-cover mb-1 border border-gray-200 dark:border-slate-700 shrink-0'
              />
            )}

            {/* Bubble */}
            <div
              className={`max-w-[78%] sm:max-w-[65%] rounded-2xl p-3 shadow-xs space-y-1.5 ${
                isMyMessage
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-xs'
                  : 'bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-slate-800 rounded-bl-xs'
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

              {/* Text content & Rich Reel/Post Embed Preview */}
              {msg.text && (
                <div className='space-y-2'>
                  <p className='text-sm leading-relaxed whitespace-pre-wrap break-words'>
                    {msg.text}
                  </p>

                  {/* If message contains a shared post / reel link */}
                  {(msg.text.includes('/post/') || msg.text.includes('/reels')) && (
                    <div
                      onClick={() => {
                        const match = msg.text.match(/\/post\/([a-fA-F0-9]{24})/)
                        if (match && match[1]) {
                          window.location.href = `/reels`
                        } else {
                          window.location.href = `/reels`
                        }
                      }}
                      className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition ${
                        isMyMessage
                          ? 'bg-black/25 hover:bg-black/35 text-white border border-white/10'
                          : 'bg-indigo-50 dark:bg-slate-800 hover:bg-indigo-100/70 text-indigo-900 dark:text-indigo-200 border border-indigo-100 dark:border-slate-700'
                      }`}
                    >
                      <div className='p-2 rounded-lg bg-indigo-600 text-white shrink-0 shadow-xs'>
                        <Film className='w-4 h-4' />
                      </div>
                      <div className='min-w-0 flex-1'>
                        <p className='text-xs font-bold truncate'>
                          🎬 Shared Video / Reel
                        </p>
                        <p className='text-[11px] opacity-80 truncate'>
                          Tap to watch reel on PingUp
                        </p>
                      </div>
                    </div>
                  )}
                </div>
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
                {isMyMessage &&
                  (msg.seen ? (
                    <CheckCheck className='w-3.5 h-3.5 text-blue-200' />
                  ) : (
                    <Check className='w-3.5 h-3.5 text-white/60' />
                  ))}
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
