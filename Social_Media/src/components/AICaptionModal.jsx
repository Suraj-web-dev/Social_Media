import React, { useState } from 'react'
import {
  Sparkles,
  X,
  Loader2,
  Copy,
  Check,
  Hash,
  Send,
  Wand2,
  Image as ImageIcon,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import API from '../api/axios'
import { showToast } from '../utils/toast'

const MOODS = [
  { id: 'Aesthetic', label: '✨ Aesthetic', desc: 'Minimalist & stylish' },
  { id: 'Viral', label: '🔥 Viral & Trending', desc: 'High engagement' },
  { id: 'Funny', label: '😂 Funny & Witty', desc: 'Relatable humor' },
  { id: 'Motivational', label: '💡 Motivational', desc: 'Inspirational vibes' },
  { id: 'Short', label: '⚡ Short & Punchy', desc: 'Under 10 words' },
  { id: 'Poetic', label: '🌙 Deep & Poetic', desc: 'Thoughtful reflections' },
]

const AICaptionModal = ({
  isOpen,
  onClose,
  currentText = '',
  mediaFile = null,
  onApplyCaption,
  onApplyHashtags,
}) => {
  const [prompt, setPrompt] = useState(currentText || '')
  const [selectedMood, setSelectedMood] = useState('Aesthetic')
  const [includeImage, setIncludeImage] = useState(Boolean(mediaFile))
  const [loading, setLoading] = useState(false)
  const [generatedData, setGeneratedData] = useState(null)
  const [copiedIndex, setCopiedIndex] = useState(null)

  if (!isOpen) return null

  const handleGenerate = async () => {
    setLoading(true)
    try {
      let res
      if (includeImage && mediaFile && mediaFile.type?.startsWith('image/')) {
        const formData = new FormData()
        formData.append('prompt', prompt)
        formData.append('mood', selectedMood)
        formData.append('image', mediaFile)
        res = await API.post('/ai/caption', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      } else {
        res = await API.post('/ai/caption', {
          prompt,
          mood: selectedMood,
        })
      }

      if (res.data?.success && res.data?.data) {
        setGeneratedData(res.data.data)
        showToast.success('Generated AI captions & hashtags!')
      } else {
        throw new Error(res.data?.message || 'Could not generate content')
      }
    } catch (err) {
      console.error('AI Caption generation error:', err)
      showToast.error(
        err.response?.data?.message || err.message || 'Failed to generate with AI'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCaption = (text, idx) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(idx)
    showToast.success('Caption copied!')
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleUseCaption = (text) => {
    onApplyCaption(text)
    showToast.success('Caption applied to post!')
    onClose()
  }

  const handleAddHashtag = (tag) => {
    onApplyHashtags(tag)
    showToast.success(`Added ${tag}`)
  }

  const handleAddAllHashtags = () => {
    if (generatedData?.hashtags?.length) {
      const allTags = generatedData.hashtags.join(' ')
      onApplyHashtags(allTags)
      showToast.success('All hashtags added!')
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm'>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className='bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden'
      >
        {/* Header */}
        <div className='p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 via-purple-50/30 to-transparent dark:from-indigo-950/20 dark:via-purple-950/10'>
          <div className='flex items-center gap-2.5'>
            <div className='w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20'>
              <Sparkles className='w-5 h-5 animate-pulse' />
            </div>
            <div>
              <div className='flex items-center gap-1.5'>
                <h3 className='font-bold text-gray-900 dark:text-gray-100 text-base'>
                  AI Caption & Hashtag Generator
                </h3>
                <span className='text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white'>
                  Gemini
                </span>
              </div>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                Turn your photo or ideas into viral captions in one tap
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Content Body */}
        <div className='p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar'>
          {/* Tone / Mood Pills */}
          <div>
            <label className='block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2'>
              Select Mood & Tone:
            </label>
            <div className='grid grid-cols-2 sm:grid-cols-3 gap-2'>
              {MOODS.map((m) => {
                const active = selectedMood === m.id
                return (
                  <button
                    key={m.id}
                    type='button'
                    onClick={() => setSelectedMood(m.id)}
                    className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                      active
                        ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold ring-1 ring-indigo-500'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-gray-600 dark:text-gray-400 bg-slate-50/50 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className='text-xs'>{m.label}</div>
                    <div className='text-[10px] text-gray-400 dark:text-gray-500 mt-0.5'>
                      {m.desc}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* User Prompt / Context Input */}
          <div>
            <label className='block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5'>
              Topic or Context (Optional):
            </label>
            <input
              type='text'
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='e.g., Weekend trip to the mountains with friends...'
              className='w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition'
            />
          </div>

          {/* Attached Image Indicator if available */}
          {mediaFile && mediaFile.type?.startsWith('image/') && (
            <div className='flex items-center justify-between p-2.5 bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40 rounded-xl'>
              <div className='flex items-center gap-2'>
                <ImageIcon className='w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0' />
                <span className='text-xs text-purple-900 dark:text-purple-200 font-medium'>
                  Photo attached: {mediaFile.name}
                </span>
              </div>
              <label className='flex items-center gap-1.5 text-xs text-purple-700 dark:text-purple-300 cursor-pointer font-medium select-none'>
                <input
                  type='checkbox'
                  checked={includeImage}
                  onChange={(e) => setIncludeImage(e.target.checked)}
                  className='rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5'
                />
                AI Vision Scan
              </label>
            </div>
          )}

          {/* Generate Button */}
          <button
            type='button'
            disabled={loading}
            onClick={handleGenerate}
            className='w-full py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]'
          >
            {loading ? (
              <>
                <Loader2 className='w-4 h-4 animate-spin' />
                <span>Crafting AI magic with Gemini...</span>
              </>
            ) : (
              <>
                <Wand2 className='w-4 h-4' />
                <span>{generatedData ? 'Regenerate Ideas' : 'Generate Captions & Tags'}</span>
              </>
            )}
          </button>

          {/* Results Area */}
          {generatedData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className='space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800'
            >
              {/* Captions */}
              <div>
                <h4 className='text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5'>
                  <Sparkles className='w-3.5 h-3.5 text-indigo-500' />
                  Suggested Captions (Tap to Use):
                </h4>
                <div className='space-y-2'>
                  {generatedData.captions?.map((cap, idx) => (
                    <div
                      key={idx}
                      className='p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-indigo-400 dark:hover:border-indigo-600 transition flex items-start justify-between gap-2.5 group'
                    >
                      <p className='text-xs sm:text-sm text-gray-800 dark:text-gray-200 leading-relaxed flex-1'>
                        {cap}
                      </p>
                      <div className='flex items-center gap-1 shrink-0'>
                        <button
                          type='button'
                          onClick={() => handleCopyCaption(cap, idx)}
                          title='Copy'
                          className='p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer'
                        >
                          {copiedIndex === idx ? (
                            <Check className='w-3.5 h-3.5 text-emerald-500' />
                          ) : (
                            <Copy className='w-3.5 h-3.5' />
                          )}
                        </button>
                        <button
                          type='button'
                          onClick={() => handleUseCaption(cap)}
                          className='px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition cursor-pointer flex items-center gap-1 shadow-xs'
                        >
                          <Send className='w-3 h-3' />
                          <span>Use</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hashtags */}
              {generatedData.hashtags?.length > 0 && (
                <div>
                  <div className='flex items-center justify-between mb-2'>
                    <h4 className='text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5'>
                      <Hash className='w-3.5 h-3.5 text-purple-500' />
                      Trending Hashtags:
                    </h4>
                    <button
                      type='button'
                      onClick={handleAddAllHashtags}
                      className='text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer'
                    >
                      + Add All Tags
                    </button>
                  </div>
                  <div className='flex flex-wrap gap-1.5'>
                    {generatedData.hashtags.map((tag, idx) => (
                      <button
                        key={idx}
                        type='button'
                        onClick={() => handleAddHashtag(tag)}
                        className='px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition cursor-pointer flex items-center gap-1'
                      >
                        <span>{tag}</span>
                        <span className='text-[10px] opacity-60'>+</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default AICaptionModal
