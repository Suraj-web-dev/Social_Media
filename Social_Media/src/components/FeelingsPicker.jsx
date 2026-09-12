import React from 'react'
import { X } from 'lucide-react'

const feelingsList = [
  { emoji: '🚀', label: 'Excited' },
  { emoji: '💡', label: 'Inspired' },
  { emoji: '🎯', label: 'Focused' },
  { emoji: '☕', label: 'Relaxing' },
  { emoji: '✨', label: 'Grateful' },
  { emoji: '🔥', label: 'Productive' }
]

const FeelingsPicker = ({ onSelectFeeling, onClose }) => {
  return (
    <div className='p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2 animate-in fade-in duration-150'>
      <div className='flex items-center justify-between'>
        <span className='text-xs font-medium text-gray-600'>How are you feeling?</span>
        <button
          onClick={onClose}
          type='button'
          className='text-gray-400 hover:text-gray-600 cursor-pointer'
        >
          <X className='w-3.5 h-3.5' />
        </button>
      </div>

      <div className='grid grid-cols-3 sm:grid-cols-6 gap-2'>
        {feelingsList.map((f) => (
          <button
            key={f.label}
            type='button'
            onClick={() => onSelectFeeling(`${f.emoji} ${f.label}`)}
            className='p-2 rounded-lg bg-white border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer'
          >
            <span>{f.emoji}</span>
            <span className='text-gray-700'>{f.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default FeelingsPicker

