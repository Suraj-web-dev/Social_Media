import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { useSelector } from 'react-redux'

const Layout = () => {
  const { user } = useSelector((state) => state.auth)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return user ? (
    <div className='w-full h-screen flex bg-slate-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 overflow-hidden relative'>
      <Sidebar sidebarOpen={sidebarOpen} setsidebarOpen={setSidebarOpen} />
      
      <main className='flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 flex flex-col min-w-0 relative'>
        <Outlet />
      </main>

      {/* Floating Hamburger Menu Button on Mobile (Only visible when sidebar is closed) */}
      {!sidebarOpen && (
        <button
          type='button'
          onClick={() => setSidebarOpen(true)}
          aria-label='Open navigation menu'
          className='fixed top-3 right-3 p-2 z-[70] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-md border border-gray-100 dark:border-slate-800 w-10 h-10 text-gray-700 dark:text-gray-200 sm:hidden flex items-center justify-center cursor-pointer transition active:scale-95'
        >
          <Menu className='w-5 h-5' />
        </button>
      )}
    </div>
  ) : (
    <div className='h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100'>
      <h1 className='text-xl font-medium'>Loading PingUp...</h1>
    </div>
  )
}

export default Layout
