import React, { useState } from 'react'
import { ChevronDown, Globe, Lock, Users } from 'lucide-react'

const privacyOptions = [
  { label: 'Public', icon: Globe, desc: 'Anyone on the platform' },
  { label: 'Connections', icon: Users, desc: 'Your network only' },
  { label: 'Only Me', icon: Lock, desc: 'Only you can see' }
]

const PrivacySelector = ({ privacy, setPrivacy }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className='relative mt-0.5'>
      <button
        type='button'
        onClick={() => setIsOpen(!isOpen)}
        className='inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-full cursor-pointer transition'
      >
        {privacy === 'Public' && <Globe className='w-3 h-3' />}
        {privacy === 'Connections' && <Users className='w-3 h-3' />}
        {privacy === 'Only Me' && <Lock className='w-3 h-3' />}
        <span>{privacy}</span>
        <ChevronDown className='w-3 h-3 text-gray-400' />
      </button>

      {isOpen && (
        <div className='absolute left-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg p-1.5 z-20 w-44 space-y-0.5 animate-in fade-in zoom-in-95 duration-100'>
          {privacyOptions.map((opt) => {
            const Icon = opt.icon
            return (
              <button
                key={opt.label}
                type='button'
                onClick={() => {
                  setPrivacy(opt.label)
                  setIsOpen(false)
                }}
                className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left text-xs cursor-pointer transition ${
                  privacy === opt.label
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Icon className='w-3.5 h-3.5 mt-0.5 shrink-0' />
                <div>
                  <p className='font-medium'>{opt.label}</p>
                  <p className='text-[10px] text-gray-400'>{opt.desc}</p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default PrivacySelector

