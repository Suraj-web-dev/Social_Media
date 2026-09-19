import React, { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  Type,
  Image as ImageIcon,
  Music,
  MapPin,
  Trash2,
  Plus,
  Star,
  X,
} from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { createNewStory, fetchFeedStories } from '../redux/slices/storySlice'
import { showToast } from '../utils/toast'

const FILTERS = [
  { id: 'normal', name: 'Normal', css: '' },
  { id: 'vintage', name: 'Vintage', css: 'sepia(40%) contrast(110%) brightness(95%)' },
  { id: 'noir', name: 'Noir', css: 'grayscale(100%) contrast(125%)' },
  { id: 'sunset', name: 'Sunset', css: 'hue-rotate(-15deg) saturate(140%) contrast(105%)' },
  { id: 'warm', name: 'Warm', css: 'sepia(25%) saturate(130%) brightness(105%)' },
  { id: 'cyberpunk', name: 'Cyber', css: 'hue-rotate(180deg) saturate(160%)' },
]

const FONT_STYLES = [
  { id: 'modern', name: 'Modern', className: 'font-sans font-bold tracking-tight' },
  { id: 'neon', name: 'Neon', className: 'font-extrabold tracking-wide drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]' },
  { id: 'typewriter', name: 'Typewriter', className: 'font-mono font-medium' },
  { id: 'serif', name: 'Elegant', className: 'font-serif italic font-bold' },
]

const BG_COLORS = [
  'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
  'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
  'linear-gradient(135deg, #f97316 0%, #db2777 100%)',
  'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
  'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  '#0f172a',
  '#000000',
]

const StoryModal = ({ isOpen = true, onClose, setShowModal }) => {
  const dispatch = useDispatch()
  const { uploading } = useSelector((state) => state.story)
  const fileInputRef = useRef(null)

  const resetForm = () => {
    setTextContent('')
    setMediaSlides([])
    setActiveSlideIndex(0)
    setMusicData({ title: '', artist: '' })
    setLocationName('')
    setIsCloseFriends(false)
    setShowMusicInput(false)
    setShowLocationInput(false)
    setMode('media')
  }

  const handleClose = () => {
    resetForm()
    if (onClose) onClose()
    if (setShowModal) setShowModal(false)
  }

  // Story Mode: 'media' or 'text'
  const [mode, setMode] = useState('media')

  // Text Mode States
  const [textContent, setTextContent] = useState('')
  const [background, setBackground] = useState(BG_COLORS[0])
  const [fontStyle, setFontStyle] = useState('modern')

  // Media Mode States (Supports Multiple Slides)
  const [mediaSlides, setMediaSlides] = useState([])
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)

  // Stickers / Add-ons
  const [showMusicInput, setShowMusicInput] = useState(false)
  const [musicData, setMusicData] = useState({ title: '', artist: '' })
  const [showLocationInput, setShowLocationInput] = useState(false)
  const [locationName, setLocationName] = useState('')
  const [isCloseFriends, setIsCloseFriends] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  if (!isOpen) return null

  // Process selected file list
  const processFiles = (files) => {
    if (!files || !files.length) return

    const validSlides = []
    for (const file of files) {
      if (file.size > 50 * 1024 * 1024) {
        showToast.error(`${file.name} exceeds 50MB limit.`)
        continue
      }
      validSlides.push({
        file,
        previewUrl: URL.createObjectURL(file),
        type: file.type.startsWith('video/') ? 'video' : 'image',
        filter: 'normal',
        caption: '',
      })
    }

    if (validSlides.length > 0) {
      setMediaSlides((prev) => [...prev, ...validSlides])
      setMode('media')
    }
  }

  // Handle Multi-file upload via input
  const handleFilesSelect = (e) => {
    const files = Array.from(e.target.files || [])
    processFiles(files)
    if (e.target) e.target.value = ''
  }

  // Handle Drag and Drop
  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files || [])
    processFiles(files)
  }

  const currentSlide = mediaSlides[activeSlideIndex] || null

  const updateCurrentSlide = (key, value) => {
    setMediaSlides((prev) =>
      prev.map((slide, idx) =>
        idx === activeSlideIndex ? { ...slide, [key]: value } : slide
      )
    )
  }

  const removeSlide = (indexToRemove, e) => {
    e?.stopPropagation()
    setMediaSlides((prev) => {
      const next = prev.filter((_, idx) => idx !== indexToRemove)
      if (activeSlideIndex >= next.length) {
        setActiveSlideIndex(Math.max(0, next.length - 1))
      }
      return next
    })
  }

  const handlePublish = async () => {
    if (mode === 'text') {
      if (!textContent.trim()) {
        showToast.error('Please write something for your story.')
        return
      }

      const formData = new FormData()
      formData.append('content', textContent.trim())
      formData.append('background_color', background)
      formData.append('font_style', fontStyle)
      formData.append('target_circle', isCloseFriends ? 'close_friends' : 'all')
      if (locationName.trim()) formData.append('location', locationName.trim())
      if (musicData.title.trim()) formData.append('music', JSON.stringify(musicData))

      const res = await dispatch(createNewStory(formData))
      if (createNewStory.fulfilled.match(res)) {
        dispatch(fetchFeedStories())
        showToast.success('Story shared successfully!')
        handleClose()
      } else {
        showToast.error(res.payload || 'Failed to share story.')
      }
    } else {
      if (mediaSlides.length === 0) {
        showToast.error('Please add at least one photo or video.')
        return
      }

      const formData = new FormData()
      mediaSlides.forEach((slide) => {
        formData.append('media', slide.file)
      })

      formData.append('filter', currentSlide?.filter || 'normal')
      if (currentSlide?.caption?.trim()) {
        formData.append('caption', currentSlide.caption.trim())
      }
      formData.append('target_circle', isCloseFriends ? 'close_friends' : 'all')
      if (locationName.trim()) formData.append('location', locationName.trim())
      if (musicData.title.trim()) formData.append('music', JSON.stringify(musicData))

      const res = await dispatch(createNewStory(formData))
      if (createNewStory.fulfilled.match(res)) {
        dispatch(fetchFeedStories())
        showToast.success(
          `${mediaSlides.length} ${mediaSlides.length > 1 ? 'stories' : 'story'} shared successfully!`
        )
        handleClose()
      } else {
        showToast.error(res.payload || 'Failed to share story.')
      }
    }
  }

  return createPortal(
    <div className='fixed inset-0 z-[120] min-h-screen bg-black/85 backdrop-blur-md text-white flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150'>
      <div className='w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3.5 flex flex-col max-h-[96vh] overflow-y-auto no-scrollbar'>
        {/* Top Header */}
        <div className='flex items-center justify-between pb-2 border-b border-slate-800'>
          <button
            type='button'
            onClick={handleClose}
            className='p-1.5 hover:bg-slate-800 rounded-xl cursor-pointer transition text-gray-400 hover:text-white'
          >
            <ArrowLeft className='w-5 h-5' />
          </button>
          <div className='flex items-center gap-2'>
            <h2 className='text-sm sm:text-base font-bold tracking-tight'>
              Create Story
            </h2>
            {mediaSlides.length > 1 && (
              <span className='px-2 py-0.5 text-[11px] font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-full'>
                {mediaSlides.length} Slides
              </span>
            )}
          </div>

          {/* Close Friends Toggle */}
          <button
            type='button'
            onClick={() => setIsCloseFriends(!isCloseFriends)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition ${
              isCloseFriends
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-slate-800 text-gray-400 hover:text-gray-200'
            }`}
            title='Toggle Close Friends / Target Circle'
          >
            <Star className={`w-3.5 h-3.5 ${isCloseFriends ? 'fill-emerald-400' : ''}`} />
            <span className='hidden sm:inline'>
              {isCloseFriends ? 'Close Friends' : 'Everyone'}
            </span>
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className='flex gap-1.5 p-1 bg-slate-950/60 rounded-2xl border border-slate-800/80'>
          <button
            type='button'
            onClick={() => setMode('media')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer transition ${
              mode === 'media'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ImageIcon className='w-4 h-4' />
            <span>Photo / Video</span>
          </button>
          <button
            type='button'
            onClick={() => setMode('text')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer transition ${
              mode === 'text'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Type className='w-4 h-4' />
            <span>Text Mode</span>
          </button>
        </div>

        {/* Main Canvas / Preview Stage */}
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            setIsDragging(false)
          }}
          onDrop={handleDrop}
          className={`relative rounded-2xl h-80 sm:h-96 flex items-center justify-center overflow-hidden transition-all shadow-inner border bg-black ${
            isDragging
              ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-indigo-950/20'
              : 'border-slate-800'
          }`}
          style={{
            background: mode === 'text' ? background : '#000',
          }}
        >
          {/* TEXT MODE CANVAS */}
          {mode === 'text' && (
            <div className='w-full h-full flex flex-col items-center justify-center p-6 text-center'>
              <textarea
                className={`bg-transparent text-white w-full max-w-xs resize-none focus:outline-none placeholder-white/50 text-center leading-relaxed text-xl sm:text-2xl ${
                  FONT_STYLES.find((f) => f.id === fontStyle)?.className || ''
                }`}
                placeholder="Type your story..."
                rows={4}
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                autoFocus
              />
            </div>
          )}

          {/* MEDIA MODE CANVAS */}
          {mode === 'media' && (
            <>
              {mediaSlides.length === 0 ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-indigo-400 cursor-pointer p-6 text-center w-full h-full border-2 border-dashed rounded-2xl transition-all ${
                    isDragging
                      ? 'border-indigo-400 bg-indigo-500/10 text-indigo-300'
                      : 'border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/30'
                  }`}
                >
                  <div className='p-4 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'>
                    <Plus className='w-8 h-8 stroke-[2.5]' />
                  </div>
                  <div>
                    <p className='text-sm font-bold text-white'>
                      Choose Photos or Videos
                    </p>
                    <p className='text-xs text-gray-400 mt-1 max-w-xs'>
                      Click or drag & drop files here (supports JPG, PNG, MP4, WebM up to 50MB)
                    </p>
                  </div>
                  <button
                    type='button'
                    onClick={(e) => {
                      e.stopPropagation()
                      fileInputRef.current?.click()
                    }}
                    className='mt-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 cursor-pointer transition'
                  >
                    Browse Files
                  </button>
                </div>
              ) : (
                <div className='relative w-full h-full flex items-center justify-center bg-black'>
                  {currentSlide?.type === 'video' ? (
                    <video
                      src={currentSlide.previewUrl}
                      className='w-full h-full object-contain'
                      style={{
                        filter:
                          FILTERS.find((f) => f.id === currentSlide.filter)?.css ||
                          'none',
                      }}
                      autoPlay
                      muted
                      loop
                    />
                  ) : (
                    <img
                      src={currentSlide?.previewUrl}
                      alt='Story preview'
                      className='w-full h-full object-contain'
                      style={{
                        filter:
                          FILTERS.find((f) => f.id === currentSlide?.filter)?.css ||
                          'none',
                      }}
                    />
                  )}

                  {/* Caption Overlay */}
                  {currentSlide?.caption && (
                    <div className='absolute bottom-4 inset-x-4 flex justify-center pointer-events-none'>
                      <span className='px-3.5 py-1.5 rounded-full bg-black/65 backdrop-blur-md text-white text-xs sm:text-sm font-medium border border-white/10 shadow-lg text-center'>
                        {currentSlide.caption}
                      </span>
                    </div>
                  )}

                  {/* Music / Location Overlay Badges */}
                  <div className='absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none'>
                    {musicData.title && (
                      <span className='flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur text-[11px] font-semibold text-white border border-white/10 shadow-sm'>
                        <Music className='w-3 h-3 text-pink-400' />
                        {musicData.title}
                      </span>
                    )}
                    {locationName && (
                      <span className='flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur text-[11px] font-semibold text-white border border-white/10 shadow-sm'>
                        <MapPin className='w-3 h-3 text-rose-400' />
                        {locationName}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          <input
            ref={fileInputRef}
            type='file'
            accept='image/*,video/*'
            multiple
            className='hidden'
            onChange={handleFilesSelect}
          />
        </div>

        {/* MULTI-SLIDE THUMBNAIL STRIP */}
        {mode === 'media' && mediaSlides.length > 0 && (
          <div className='flex items-center gap-2 overflow-x-auto no-scrollbar py-1'>
            {mediaSlides.map((slide, idx) => (
              <div
                key={idx}
                onClick={() => setActiveSlideIndex(idx)}
                className={`relative shrink-0 w-14 h-18 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                  activeSlideIndex === idx
                    ? 'border-indigo-500 scale-105 shadow-md shadow-indigo-500/20'
                    : 'border-slate-800 opacity-60 hover:opacity-100'
                }`}
              >
                {slide.type === 'video' ? (
                  <video
                    src={slide.previewUrl}
                    className='w-full h-full object-cover'
                    muted
                  />
                ) : (
                  <img
                    src={slide.previewUrl}
                    alt={`Slide ${idx + 1}`}
                    className='w-full h-full object-cover'
                  />
                )}
                {/* Delete Slide Button */}
                <button
                  type='button'
                  onClick={(e) => removeSlide(idx, e)}
                  className='absolute top-0.5 right-0.5 size-4 rounded-full bg-black/80 hover:bg-rose-600 text-white flex items-center justify-center cursor-pointer transition'
                  title='Remove slide'
                >
                  <X className='w-2.5 h-2.5' />
                </button>
              </div>
            ))}

            {/* Add More Media Button */}
            {mediaSlides.length < 10 && (
              <button
                type='button'
                onClick={() => fileInputRef.current?.click()}
                className='shrink-0 w-14 h-18 rounded-xl border-2 border-dashed border-slate-700 hover:border-indigo-500 flex flex-col items-center justify-center text-gray-400 hover:text-indigo-400 transition cursor-pointer'
                title='Add another photo/video'
              >
                <Plus className='w-5 h-5' />
                <span className='text-[10px] font-semibold mt-0.5'>Add</span>
              </button>
            )}
          </div>
        )}

        {/* CONTROLS ACCORDING TO ACTIVE MODE */}
        {mode === 'text' ? (
          <div className='space-y-3 pt-1'>
            {/* Font Selectors */}
            <div className='flex items-center gap-1.5 overflow-x-auto no-scrollbar'>
              {FONT_STYLES.map((f) => (
                <button
                  key={f.id}
                  type='button'
                  onClick={() => setFontStyle(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition shrink-0 ${
                    fontStyle === f.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>

            {/* Color Palette */}
            <div className='flex items-center justify-center gap-2 pt-1'>
              {BG_COLORS.map((bg, idx) => (
                <button
                  key={idx}
                  type='button'
                  className={`size-7 rounded-full cursor-pointer transition-transform active:scale-90 ${
                    background === bg ? 'ring-2 ring-white scale-110' : ''
                  }`}
                  style={{ background: bg }}
                  onClick={() => setBackground(bg)}
                />
              ))}
            </div>
          </div>
        ) : (
          mediaSlides.length > 0 && (
            <div className='space-y-2.5 pt-1'>
              {/* Caption Input */}
              <input
                type='text'
                placeholder='Add a caption to this slide...'
                value={currentSlide?.caption || ''}
                onChange={(e) => updateCurrentSlide('caption', e.target.value)}
                className='w-full px-3.5 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 transition'
              />

              {/* Filters Strip */}
              <div className='flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5'>
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type='button'
                    onClick={() => updateCurrentSlide('filter', f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition shrink-0 ${
                      currentSlide?.filter === f.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>
          )
        )}

        {/* STICKERS & METADATA BAR (Music, Location) */}
        <div className='pt-1 flex flex-col gap-2 border-t border-slate-800'>
          <div className='flex items-center gap-2'>
            <button
              type='button'
              onClick={() => setShowMusicInput(!showMusicInput)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition ${
                musicData.title
                  ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                  : 'bg-slate-800 text-gray-400 hover:text-white'
              }`}
            >
              <Music className='w-3.5 h-3.5' />
              <span>{musicData.title ? musicData.title : 'Add Music Tag'}</span>
            </button>

            <button
              type='button'
              onClick={() => setShowLocationInput(!showLocationInput)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition ${
                locationName
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-slate-800 text-gray-400 hover:text-white'
              }`}
            >
              <MapPin className='w-3.5 h-3.5' />
              <span>{locationName ? locationName : 'Add Location'}</span>
            </button>
          </div>

          {showMusicInput && (
            <div className='flex gap-2 animate-in fade-in duration-100'>
              <input
                type='text'
                placeholder='Song title (e.g. Starboy - The Weeknd)'
                value={musicData.title}
                onChange={(e) => setMusicData({ ...musicData, title: e.target.value })}
                className='flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500'
              />
              <button
                type='button'
                onClick={() => setShowMusicInput(false)}
                className='px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs cursor-pointer'
              >
                Done
              </button>
            </div>
          )}

          {showLocationInput && (
            <div className='flex gap-2 animate-in fade-in duration-100'>
              <input
                type='text'
                placeholder='Location (e.g. Mumbai, India)'
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className='flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500'
              />
              <button
                type='button'
                onClick={() => setShowLocationInput(false)}
                className='px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs cursor-pointer'
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* Publish Story Button */}
        <button
          type='button'
          disabled={uploading}
          onClick={handlePublish}
          className='flex items-center justify-center gap-2 text-white py-3 w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-600 hover:to-pink-600 active:scale-95 transition font-bold text-sm shadow-lg shadow-indigo-500/25 cursor-pointer disabled:opacity-50 mt-1'
        >
          {uploading ? (
            <>
              <Loader2 className='w-4 h-4 animate-spin' />
              <span>Publishing Stories...</span>
            </>
          ) : (
            <>
              <Sparkles className='w-4 h-4' />
              <span>
                {mode === 'media' && mediaSlides.length > 1
                  ? `Share ${mediaSlides.length} Stories`
                  : 'Share to Story'}
              </span>
            </>
          )}
        </button>
      </div>
    </div>,
    document.body
  )
}

export default StoryModal
