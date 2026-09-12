import React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const ThemeToggle = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type='button'
      onClick={toggleTheme}
      title={isDark ? 'Switch to Day mode' : 'Switch to Night mode'}
      className={`p-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-2 ${
        isDark
          ? 'bg-slate-800 text-amber-400 hover:bg-slate-700 border border-slate-700 shadow-xs'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 shadow-xs'
      } ${className}`}
    >
      {isDark ? (
        <Sun className='w-4.5 h-4.5 transition-transform rotate-0 hover:rotate-45' />
      ) : (
        <Moon className='w-4.5 h-4.5 transition-transform rotate-0 hover:-rotate-12' />
      )}
      {showLabel && (
        <span className='text-xs font-medium'>
          {isDark ? 'Day Mode' : 'Night Mode'}
        </span>
      )}
    </button>
  )
}

export default ThemeToggle

