import React from 'react'
import { Moon, Sun, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

const ThemeToggle = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <motion.button
      type='button'
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.05 }}
      onClick={(e) => toggleTheme(e)}
      title={isDark ? 'Switch to Day mode' : 'Switch to Night mode'}
      className={`relative p-2.5 rounded-2xl transition-all duration-300 cursor-pointer flex items-center gap-2 overflow-hidden ${
        isDark
          ? 'bg-slate-800/90 text-amber-400 hover:bg-slate-700/90 border border-slate-700/80 shadow-md shadow-amber-500/5'
          : 'bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100/80 border border-indigo-100/80 shadow-md shadow-indigo-500/5'
      } ${className}`}
    >
      <AnimatePresence mode='wait' initial={false}>
        {isDark ? (
          <motion.div
            key='sun-icon'
            initial={{ rotate: -90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className='flex items-center justify-center'
          >
            <Sun className='w-4.5 h-4.5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' />
          </motion.div>
        ) : (
          <motion.div
            key='moon-icon'
            initial={{ rotate: 90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className='flex items-center justify-center'
          >
            <Moon className='w-4.5 h-4.5 text-indigo-600 drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]' />
          </motion.div>
        )}
      </AnimatePresence>

      {showLabel && (
        <motion.span
          key={isDark ? 'day-text' : 'night-text'}
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          className='text-xs font-semibold select-none'
        >
          {isDark ? 'Day Mode' : 'Night Mode'}
        </motion.span>
      )}
    </motion.button>
  )
}

export default ThemeToggle
