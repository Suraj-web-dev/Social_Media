import React, { useEffect, useRef } from 'react'
import moment from 'moment'
import { Check, CheckCheck, Film, Sparkles } from 'lucide-react'

const PINGAI_STARTERS = [
  '💡 Brainstorm 3 viral reel ideas for tech lovers',
  '✍️ Write a witty, high-converting bio for my profile',
  '✨ What are current trending topics on PingUp?',
  '🚀 Help me write a cool post about building an AI project',
]

const MessageList = ({
  messages,
  currentUserId,
  recipient,
  isAiThinking = false,
  onSelectStarterPrompt,
}) => {
  const bottomRef = useRef(null)
  const isPingAI = recipient?._id === 'pingai'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isAiThinking])

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

      {/* PingAI Thinking Animation */}
      {isAiThinking && (
        <div className='flex items-end gap-2 justify-start animate-in fade-in duration-200'>
          <img
            src={recipient.profile_picture || '/sample_profile.jpg'}
            alt='PingAI'
            className='w-7 h-7 rounded-full object-cover mb-1 border border-indigo-200 dark:border-indigo-800 shrink-0'
          />
          <div className='bg-white dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 rounded-2xl rounded-bl-xs p-3 shadow-xs flex items-center gap-2'>
            <div className='flex items-center gap-1'>
              <span className='size-2 rounded-full bg-indigo-500 animate-bounce' style={{ animationDelay: '0ms' }} />
              <span className='size-2 rounded-full bg-purple-500 animate-bounce' style={{ animationDelay: '150ms' }} />
              <span className='size-2 rounded-full bg-pink-500 animate-bounce' style={{ animationDelay: '300ms' }} />
            </div>
            <span className='text-xs text-gray-500 dark:text-gray-400 font-medium'>
              PingAI is crafting response...
            </span>
          </div>
        </div>
      )}

      {/* Starter Prompts for PingAI when conversation has 1 message */}
      {isPingAI && messages.length <= 1 && (
        <div className='pt-2 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300'>
          <p className='text-xs font-semibold text-gray-400 dark:text-gray-500 text-center flex items-center justify-center gap-1'>
            <Sparkles className='w-3.5 h-3.5 text-indigo-500' />
            Try asking PingAI:
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl mx-auto'>
            {PINGAI_STARTERS.map((prompt, i) => (
              <button
                key={i}
                type='button'
                onClick={() => onSelectStarterPrompt && onSelectStarterPrompt(prompt)}
                className='text-left p-2.5 rounded-xl border border-indigo-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/50 text-xs font-medium text-gray-700 dark:text-gray-300 transition shadow-xs cursor-pointer flex items-center justify-between group'
              >
                <span>{prompt}</span>
                <span className='text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity ml-1'>
                  →
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}

export default MessageList
