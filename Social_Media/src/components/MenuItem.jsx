import React from 'react'
import { menuItemsData } from '../assets'
import { NavLink } from 'react-router-dom'

const MenuItem = ({ setsidebarOpen }) => {
  return (
    <div className="px-6 text-gray-600 dark:text-gray-300 space-y-1 font-medium">
      {menuItemsData.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          onClick={() => setsidebarOpen?.(false)}
          className={({ isActive }) =>
            `px-3.5 py-2 flex items-center gap-3 rounded-xl transition ${
              isActive
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 font-semibold"
                : "hover:bg-gray-50 dark:hover:bg-slate-800/60 dark:hover:text-white"
            }`
          }
        >
          <Icon className="w-5 h-5" />
          <span>{label}</span>
        </NavLink>
      ))}
    </div>
  )
}

export default MenuItem