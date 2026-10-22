import React, { useRef, useState, useEffect } from 'react'
import {
  Image as ImageIcon,
  Send,
  Smile,
  ThumbsUp,
  X,
  Sparkles,
  RotateCw,
  Loader2,
} from 'lucide-react'

const quickEmojis = ['😊', '😂', '🔥', '❤️', '👍', '🎉', '🚀', '🙌']

const ChatInput = ({
  onSendMessage,
  smartReplies = [],
  loadingSmartReplies = false,
  onRefreshSmartReplies,
  externalText = '',
}) => {
  const [text, setText] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (externalText) {
      setText(externalText)
    }
  }, [externalText])

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSend = () => {
    if (!text.trim() && !imageFile) return

    onSendMessage({
      text: text.trim(),
      file: imageFile,
    })

    setText('')
    setImageFile(null)
    setImagePreview(null)
    setShowEmojiPicker(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSendQuickLike = () => {
    onSendMessage({
      text: '👍',
      file: null,
    })
  }

  return (
    <div className='p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 relative'>
      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <div className='absolute bottom-full left-4 mb-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-xl rounded-2xl p-3 z-30 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-100'>
          {quickEmojis.map((emoji) => (
            <button
              key={emoji}
              type='button'
              onClick={() => {
                setText((prev) => prev + emoji)
                setShowEmojiPicker(false)
              }}
              className='text-xl hover:scale-125 transition-transform p-1 cursor-pointer'
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Image Preview Banner */}
      {imagePreview && (
        <div className='mb-3 relative inline-block rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 shadow-xs'>
          <img
            src={imagePreview}
            alt='Preview'
            className='h-20 w-auto object-cover rounded-xl'
          />
          <button
            type='button'
            onClick={() => {
              setImagePreview(null)
              setImageFile(null)
            }}
            className='absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full transition cursor-pointer'
          >
            <X className='w-3.5 h-3.5' />
          </button>
        </div>
      )}

      {/* 1-Tap AI Smart Replies Bar */}
      {smartReplies && smartReplies.length > 0 && (
        <div className='mb-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 animate-in fade-in slide-in-from-bottom-1 duration-200'>
          <div className='flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold shrink-0 border border-indigo-100 dark:border-indigo-900/40'>
            <Sparkles className='w-3 h-3 text-indigo-500 animate-pulse' />
            <span>AI Replies</span>
          </div>

          {smartReplies.map((reply, idx) => (
            <button
              key={idx}
              type='button'
              onClick={() => {
                setText(reply)
              }}
              className='px-3 py-1 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-300 rounded-full text-xs font-medium border border-slate-200 dark:border-slate-700 transition cursor-pointer shrink-0 whitespace-nowrap active:scale-95 shadow-2xs'
            >
              {reply}
            </button>
          ))}

          {onRefreshSmartReplies && (
            <button
              type='button'
              onClick={onRefreshSmartReplies}
              disabled={loadingSmartReplies}
              title='Generate new AI suggestions'
              className='p-1 rounded-full text-gray-400 hover:text-indigo-600 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0'
            >
              {loadingSmartReplies ? (
                <Loader2 className='w-3.5 h-3.5 animate-spin text-indigo-500' />
              ) : (
                <RotateCw className='w-3.5 h-3.5' />
              )}
            </button>
          )}
        </div>
      )}

      {/* Input Row */}
      <div className='flex items-center gap-2'>
        {/* Hidden File input */}
        <input
          type='file'
          ref={fileInputRef}
          onChange={handleFileChange}
          accept='image/*'
          className='hidden'
        />

        {/* Attachment Button */}
        <button
          type='button'
          onClick={() => fileInputRef.current?.click()}
          title='Attach image'
          className='p-2.5 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-full transition cursor-pointer shrink-0'
        >
          <ImageIcon className='w-5 h-5' />
        </button>

        {/* Emoji Button */}
        <button
          type='button'
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          title='Insert emoji'
          className='p-2.5 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-full transition cursor-pointer shrink-0'
        >
          <Smile className='w-5 h-5' />
        </button>

        {/* Text Input */}
        <div className='flex-1 relative'>
          <input
            type='text'
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Type a message...'
            className='w-full py-2.5 px-4 bg-gray-100 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 text-sm sm:text-base rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 border border-transparent focus:border-indigo-400 transition'
          />
        </div>

        {/* Send / Like Button */}
        {text.trim() || imageFile ? (
          <button
            type='button'
            onClick={handleSend}
            className='p-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full shadow-md transition active:scale-95 cursor-pointer shrink-0'
          >
            <Send className='w-5 h-5' />
          </button>
        ) : (
          <button
            type='button'
            onClick={handleSendQuickLike}
            title='Send thumbs up'
            className='p-2.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-full transition active:scale-95 cursor-pointer shrink-0'
          >
            <ThumbsUp className='w-5 h-5' />
          </button>
        )}
      </div>
    </div>
  )
}

export default ChatInput
