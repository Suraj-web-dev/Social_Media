import React, { useState } from 'react'
import { ArrowLeft, Loader2, Sparkle, TextIcon, Upload } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { createNewStory } from '../redux/slices/storySlice'
import { showToast } from '../utils/toast'

const StoryModal = ({ setShowModal }) => {
  const dispatch = useDispatch()
  const { uploading, error: storyError } = useSelector((state) => state.story)

  const bgColors = [
    '#4f46e5',
    '#7c3aed',
    '#db2777',
    '#e11d48',
    '#ca8a04',
    '#0d9488',
    '#0f172a',
  ]

  const [mode, setmode] = useState('text')
  const [background, setbackground] = useState(bgColors[0])
  const [text, settext] = useState('')
  const [media, setmedia] = useState(null)
  const [previewUrl, setpreviewUrl] = useState(null)

  const handleMediaUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        showToast.error('Story file must be under 50MB.')
        return
      }
      setmedia(file)
      setpreviewUrl(URL.createObjectURL(file))
      setmode('media')
    }
  }

  const handleCreateStory = async () => {
    if (mode === 'text' && !text.trim()) {
      showToast.error('Please write something for your story.')
      return
    }
    if (mode === 'media' && !media) {
      showToast.error('Please select a photo or video.')
      return
    }

    const formData = new FormData()
    formData.append('background_color', background)

    if (mode === 'text') {
      formData.append('content', text.trim())
      formData.append('media_type', 'text')
    } else {
      formData.append('media', media)
      formData.append(
        'media_type',
        media.type.startsWith('video') ? 'video' : 'image'
      )
    }

    const resultAction = await dispatch(createNewStory(formData))
    if (createNewStory.fulfilled.match(resultAction)) {
      showToast.success('Story shared successfully!')
      setShowModal(false)
    } else {
      showToast.error(resultAction.payload || 'Failed to create story.')
    }
  }

  return (
    <div className='fixed inset-0 z-110 min-h-screen bg-black/80 backdrop-blur text-white flex items-center justify-center p-4 animate-in fade-in duration-150'>
      <div className='w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4'>
        {/* Header */}
        <div className='text-center flex items-center justify-between pb-2 border-b border-slate-800'>
          <button
            onClick={() => setShowModal(false)}
            className='text-white p-1.5 hover:bg-slate-800 rounded-xl cursor-pointer transition'
          >
            <ArrowLeft className='w-5 h-5' />
          </button>
          <h2 className='text-base sm:text-lg font-bold'>Create Story</h2>
          <span className='w-8'></span>
        </div>

        {/* Story Canvas Preview */}
        <div
          className='rounded-2xl h-88 sm:h-96 flex items-center justify-center relative overflow-hidden transition-colors shadow-inner'
          style={{ backgroundColor: background }}
        >
          {mode === 'text' && (
            <textarea
              className='bg-transparent text-white w-full h-full p-6 text-lg font-medium resize-none focus:outline-none placeholder-white/60 text-center flex items-center justify-center'
              placeholder="What's on your mind?"
              onChange={(e) => settext(e.target.value)}
              value={text}
            />
          )}

          {mode === 'media' &&
            previewUrl &&
            (media?.type.startsWith('image') ? (
              <img
                src={previewUrl}
                alt='Story preview'
                className='object-contain max-h-full max-w-full'
              />
            ) : (
              <video
                src={previewUrl}
                className='object-contain max-h-full max-w-full'
                autoPlay
                muted
                loop
              />
            ))}
        </div>

        {/* Color Palette (for text mode) */}
        {mode === 'text' && (
          <div className='flex items-center justify-center gap-2 pt-1'>
            {bgColors.map((color) => (
              <button
                key={color}
                type='button'
                className={`w-7 h-7 rounded-full cursor-pointer transition-transform active:scale-90 ${
                  background === color ? 'ring-2 ring-white scale-110' : ''
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setbackground(color)}
              />
            ))}
          </div>
        )}

        {/* Mode Selector (Text / Media) */}
        <div className='flex gap-2 pt-1'>
          <button
            type='button'
            onClick={() => {
              setmode('text')
              setmedia(null)
              setpreviewUrl(null)
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-xs sm:text-sm cursor-pointer transition ${
              mode === 'text'
                ? 'bg-white text-slate-900 shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <TextIcon className='w-4 h-4' />
            <span>Text</span>
          </button>

          <label
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-xs sm:text-sm cursor-pointer transition ${
              mode === 'media'
                ? 'bg-white text-slate-900 shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <input
              onChange={handleMediaUpload}
              type='file'
              accept='image/*,video/*'
              className='hidden'
            />
            <Upload className='w-4 h-4' />
            <span>Photo / Video</span>
          </label>
        </div>

        {/* Create Story Button */}
        <button
          type='button'
          disabled={uploading}
          onClick={handleCreateStory}
          className='flex items-center justify-center gap-2 text-white py-3 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition font-semibold text-sm shadow-md cursor-pointer disabled:opacity-50'
        >
          {uploading ? (
            <>
              <Loader2 className='w-4 h-4 animate-spin' />
              <span>Publishing Story...</span>
            </>
          ) : (
            <>
              <Sparkle className='w-4 h-4' />
              <span>Share to Story</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default StoryModal
