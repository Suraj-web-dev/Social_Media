import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
  waveCoords: null,
})

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) return savedTheme
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      return 'dark'
    }
    return 'light'
  })

  const [waveCoords, setWaveCoords] = useState(null)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = useCallback(
    (event) => {
      const isDark = theme === 'dark'
      const nextTheme = isDark ? 'light' : 'dark'

      // Calculate origin coordinates for the wave
      let x = window.innerWidth / 2
      let y = window.innerHeight / 2

      if (event && event.clientX !== undefined && event.clientY !== undefined) {
        x = event.clientX
        y = event.clientY
      } else if (event?.currentTarget) {
        const rect = event.currentTarget.getBoundingClientRect()
        x = rect.left + rect.width / 2
        y = rect.top + rect.height / 2
      }

      // Trigger wave coordinates for visual ripple overlay
      setWaveCoords({ x, y, theme: nextTheme, timestamp: Date.now() })

      // If browser supports View Transitions API (Chrome, Edge, Safari 18+), run full circular wave clipPath
      if (typeof document !== 'undefined' && document.startViewTransition) {
        const transition = document.startViewTransition(() => {
          setTheme(nextTheme)
        })

        transition.ready.then(() => {
          const endRadius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
          )

          const clipPath = [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ]

          document.documentElement.animate(
            {
              clipPath: isDark ? [...clipPath].reverse() : clipPath,
            },
            {
              duration: 700,
              easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
              pseudoElement: isDark
                ? '::view-transition-old(root)'
                : '::view-transition-new(root)',
            }
          )
        })
      } else {
        // Fallback without View Transitions
        setTheme(nextTheme)
      }
    },
    [theme]
  )

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, waveCoords }}>
      {children}
      {/* Visual Wave Ripple Overlay */}
      {waveCoords && (
        <div
          key={waveCoords.timestamp}
          className='pointer-events-none fixed inset-0 z-[99999] overflow-hidden'
          style={{ mixBlendMode: 'screen' }}
        >
          <div
            className={`absolute rounded-full pointer-events-none ${
              waveCoords.theme === 'dark'
                ? 'bg-gradient-to-r from-indigo-500/30 via-purple-500/20 to-transparent shadow-[0_0_80px_rgba(99,102,241,0.4)]'
                : 'bg-gradient-to-r from-amber-400/30 via-yellow-300/20 to-transparent shadow-[0_0_80px_rgba(251,191,36,0.4)]'
            }`}
            style={{
              left: waveCoords.x,
              top: waveCoords.y,
              width: '10px',
              height: '10px',
              marginLeft: '-5px',
              marginTop: '-5px',
              animation: 'wavePulse 0.75s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
            }}
          />
        </div>
      )}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
