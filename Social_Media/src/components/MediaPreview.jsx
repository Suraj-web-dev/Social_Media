import React from 'react'
import { X } from 'lucide-react'

const MediaPreview = ({ mediaPreviews, onRemoveMedia, onClearAll }) => {
  if (!mediaPreviews || mediaPreviews.length === 0) return null

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between'>
        <span className='text-xs font-medium text-gray-600'>
          Attached Media ({mediaPreviews.length})
        </span>
        <button
          type='button'
          onClick={onClearAll}
          className='text-xs text-red-500 hover:underline cursor-pointer'
        >
          Clear all
        </button>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
        {mediaPreviews.map((item, idx) => (
          <div
            key={idx}
            className='relative rounded-xl overflow-hidden aspect-video bg-gray-100 border border-gray-200 group'
          >
            {item.type === 'video' ? (
              <video
                src={item.url}
                className='w-full h-full object-cover'
              />
            ) : (
              <img
                src={item.url}
                alt={item.name}
                className='w-full h-full object-cover'
              />
            )}
            <button
              type='button'
              onClick={() => onRemoveMedia(idx)}
              className='absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-600 text-white rounded-full transition cursor-pointer'
            >
              <X className='w-3.5 h-3.5' />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MediaPreview

