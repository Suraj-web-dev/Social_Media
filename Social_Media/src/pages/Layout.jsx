import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import { Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useSelector } from 'react-redux'

const Layout = () => {
  const { user } = useSelector((state) => state.auth)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return user ? (
    <div className='w-full h-screen flex bg-slate-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 overflow-hidden'>
      <Sidebar sidebarOpen={sidebarOpen} setsidebarOpen={setSidebarOpen} />
      <div className='flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950'>
        <Outlet />
      </div>

      {/* Mobile Toggle Button */}
      {sidebarOpen ? (
        <button
          onClick={() => setSidebarOpen(false)}
          className='absolute top-3 right-3 p-2 z-100 bg-white dark:bg-slate-800 rounded-xl shadow border border-gray-100 dark:border-slate-700 w-10 h-10 text-gray-600 dark:text-gray-300 sm:hidden flex items-center justify-center cursor-pointer'
        >
          <X className='w-6 h-6' />
        </button>
      ) : (
        <button
          onClick={() => setSidebarOpen(true)}
          className='absolute top-3 right-3 p-2 z-100 bg-white dark:bg-slate-800 rounded-xl shadow border border-gray-100 dark:border-slate-700 w-10 h-10 text-gray-600 dark:text-gray-300 sm:hidden flex items-center justify-center cursor-pointer'
        >
          <Menu className='w-6 h-6' />
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
