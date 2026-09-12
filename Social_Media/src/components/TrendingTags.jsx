import React from 'react'

const popularTags = ['#Motivation', '#Tech', '#Community', '#Design', '#Growth', '#Coding']

const TrendingTags = ({ onSelectTag }) => {
  return (
    <div>
      <p className='text-xs font-medium text-gray-500 mb-2'>Trending Topics:</p>
      <div className='flex items-center gap-2 flex-wrap'>
        {popularTags.map((tag) => (
          <button
            key={tag}
            type='button'
            onClick={() => onSelectTag(tag)}
            className='text-xs px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-gray-600 transition cursor-pointer font-medium'
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  )
}

export default TrendingTags

