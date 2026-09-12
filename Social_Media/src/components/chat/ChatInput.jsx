import React, { useRef, useState } from 'react'
import { Image as ImageIcon, Send, Smile, ThumbsUp, X } from 'lucide-react'

const quickEmojis = ['😊', '😂', '🔥', '❤️', '👍', '🎉', '🚀', '🙌']

const ChatInput = ({ onSendMessage }) => {
  const [text, setText] = useState('')
  const [imagePreview, setImagePreview] = useState(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setImagePreview(url)
    }
  }

  const handleSend = () => {
    if (!text.trim() && !imagePreview) return

    onSendMessage({
      text: text.trim(),
      media_url: imagePreview || ''
    })

    setText('')
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
      media_url: ''
    })
  }

  return (
    <div className='p-3 sm:p-4 bg-white border-t border-gray-100 relative'>
      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <div className='absolute bottom-full left-4 mb-2 bg-white border border-gray-200 shadow-xl rounded-2xl p-3 z-30 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-100'>
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
        <div className='mb-3 relative inline-block rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shadow-xs'>
          <img
            src={imagePreview}
            alt='Preview'
            className='h-20 w-auto object-cover rounded-xl'
          />
          <button
            type='button'
            onClick={() => setImagePreview(null)}
            className='absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full transition cursor-pointer'
          >
            <X className='w-3.5 h-3.5' />
          </button>
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
          className='p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition cursor-pointer shrink-0'
        >
          <ImageIcon className='w-5 h-5' />
        </button>

        {/* Emoji Button */}
        <button
          type='button'
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          title='Insert emoji'
          className='p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition cursor-pointer shrink-0'
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
            className='w-full py-2.5 px-4 bg-gray-100 focus:bg-white text-gray-900 placeholder-gray-400 text-sm sm:text-base rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 border border-transparent focus:border-indigo-400 transition'
          />
        </div>

        {/* Send / Like Button */}
        {text.trim() || imagePreview ? (
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
            className='p-2.5 text-indigo-600 hover:bg-indigo-50 rounded-full transition active:scale-95 cursor-pointer shrink-0'
          >
            <ThumbsUp className='w-5 h-5' />
          </button>
        )}
      </div>
    </div>
  )
}

export default ChatInput

