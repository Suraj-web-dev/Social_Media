import React, { useRef, useState } from 'react'
import { dummyUserData } from '../assets'
import {
  BadgeCheck,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Send,
  Smile,
  X
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PrivacySelector from '../components/PrivacySelector'
import TrendingTags from '../components/TrendingTags'
import FeelingsPicker from '../components/FeelingsPicker'
import MediaPreview from '../components/MediaPreview'

const CreatePost = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  // State
  const [content, setContent] = useState('')
  const [mediaFiles, setMediaFiles] = useState([])
  const [mediaPreviews, setMediaPreviews] = useState([])
  const [privacy, setPrivacy] = useState('Public')
  const [location, setLocation] = useState('')
  const [showLocationInput, setShowLocationInput] = useState(false)
  const [selectedFeeling, setSelectedFeeling] = useState('')
  const [showFeelings, setShowFeelings] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  // Media upload handler
  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setMediaFiles((prev) => [...prev, ...files])
    const newPreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video') ? 'video' : 'image',
      name: file.name
    }))
    setMediaPreviews((prev) => [...prev, ...newPreviews])
  }

  // Remove single media
  const handleRemoveMedia = (indexToRemove) => {
    setMediaFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove))
    setMediaPreviews((prev) => {
      URL.revokeObjectURL(prev[indexToRemove]?.url)
      return prev.filter((_, idx) => idx !== indexToRemove)
    })
  }

  // Clear all media
  const handleClearAllMedia = () => {
    mediaPreviews.forEach((item) => URL.revokeObjectURL(item.url))
    setMediaFiles([])
    setMediaPreviews([])
  }

  // Add hashtag to textarea
  const handleAddTag = (tag) => {
    if (!content.includes(tag)) {
      setContent((prev) => (prev.trim() ? `${prev} ${tag}` : tag))
    }
  }

  // Publish post
  const handlePublish = () => {
    if (!content.trim() && mediaPreviews.length === 0) return

    setIsPublishing(true)
    setTimeout(() => {
      setIsPublishing(false)
      navigate('/')
    }, 1000)
  }

  return (
    <div className='min-h-full p-4 sm:p-6 lg:p-10 max-w-3xl mx-auto'>
      {/* Header */}
      <div className='mb-6'>
        <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>Create Post</h1>
        <p className='text-gray-500 text-sm sm:text-base mt-1'>
          Share your thoughts, stories, and moments with your network
        </p>
      </div>

      {/* Main Post Form Card */}
      <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-7 space-y-5'>
        {/* User Info Bar & Privacy */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <img
              src={dummyUserData.profile_picture}
              alt={dummyUserData.full_name}
              className='w-12 h-12 rounded-full object-cover shadow-sm border border-gray-100'
            />
            <div>
              <div className='flex items-center gap-1.5'>
                <h3 className='font-semibold text-gray-900 text-base'>
                  {dummyUserData.full_name}
                </h3>
                <BadgeCheck className='w-4 h-4 text-blue-500 fill-blue-50' />
              </div>
              <PrivacySelector privacy={privacy} setPrivacy={setPrivacy} />
            </div>
          </div>

          {/* Active Tags (Feeling / Location) */}
          <div className='flex items-center gap-2 flex-wrap justify-end'>
            {selectedFeeling && (
              <span className='inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 text-xs rounded-full font-medium'>
                feeling {selectedFeeling}
                <X
                  className='w-3 h-3 cursor-pointer hover:text-purple-900'
                  onClick={() => setSelectedFeeling('')}
                />
              </span>
            )}
            {location && (
              <span className='inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full font-medium'>
                <MapPin className='w-3 h-3' />
                {location}
                <X
                  className='w-3 h-3 cursor-pointer hover:text-indigo-900'
                  onClick={() => setLocation('')}
                />
              </span>
            )}
          </div>
        </div>

        {/* Text Area */}
        <div className='relative'>
          <textarea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`What's on your mind, ${dummyUserData.full_name.split(' ')[0]}? Share updates, ideas, or questions...`}
            className='w-full p-3.5 text-gray-800 placeholder-gray-400 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none'
          />
          <span className='text-[11px] text-gray-400 absolute right-3 bottom-3'>
            {content.length}/1000
          </span>
        </div>

        {/* Trending Hashtags Component */}
        <TrendingTags onSelectTag={handleAddTag} />

        {/* Location Input */}
        {showLocationInput && (
          <div className='flex items-center gap-2 p-2 bg-gray-50 rounded-xl border border-gray-200 animate-in fade-in duration-150'>
            <MapPin className='w-4 h-4 text-indigo-500 shrink-0 ml-2' />
            <input
              type='text'
              placeholder='Where are you right now? (e.g. New York, NY)'
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className='w-full bg-transparent text-xs sm:text-sm text-gray-800 focus:outline-none'
            />
            <button
              onClick={() => setShowLocationInput(false)}
              className='text-gray-400 hover:text-gray-600 p-1 cursor-pointer'
            >
              <X className='w-4 h-4' />
            </button>
          </div>
        )}

        {/* Feelings Picker Component */}
        {showFeelings && (
          <FeelingsPicker
            onSelectFeeling={(feeling) => {
              setSelectedFeeling(feeling)
              setShowFeelings(false)
            }}
            onClose={() => setShowFeelings(false)}
          />
        )}

        {/* Attached Media Grid Component */}
        <MediaPreview
          mediaPreviews={mediaPreviews}
          onRemoveMedia={handleRemoveMedia}
          onClearAll={handleClearAllMedia}
        />

        {/* Attachment Options & Publish Footer */}
        <div className='flex items-center justify-between pt-4 border-t border-gray-100 flex-wrap gap-4'>
          {/* File Input & Trigger Buttons */}
          <div className='flex items-center gap-1 sm:gap-2'>
            <input
              type='file'
              ref={fileInputRef}
              onChange={handleMediaUpload}
              multiple
              accept='image/*,video/*'
              className='hidden'
            />

            <button
              type='button'
              onClick={() => fileInputRef.current?.click()}
              className='flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer transition'
            >
              <ImageIcon className='w-4 h-4 text-emerald-500' />
              <span>Media</span>
            </button>

            <button
              type='button'
              onClick={() => setShowLocationInput(!showLocationInput)}
              className='flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer transition'
            >
              <MapPin className='w-4 h-4 text-rose-500' />
              <span>Location</span>
            </button>

            <button
              type='button'
              onClick={() => setShowFeelings(!showFeelings)}
              className='flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer transition'
            >
              <Smile className='w-4 h-4 text-amber-500' />
              <span>Feelings</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className='flex items-center gap-3'>
            <button
              type='button'
              onClick={() => navigate('/')}
              className='px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer transition'
            >
              Cancel
            </button>

            <button
              type='button'
              disabled={(!content.trim() && mediaPreviews.length === 0) || isPublishing}
              onClick={handlePublish}
              className='flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-semibold rounded-xl shadow-md cursor-pointer transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isPublishing ? (
                <>
                  <Loader2 className='w-4 h-4 animate-spin' />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Send className='w-4 h-4' />
                  <span>Publish Post</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreatePost
