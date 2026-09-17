import React, { useState, useEffect } from 'react'
import {
  ChevronDown,
  Globe,
  Lock,
  Users,
  Sparkles,
  ShieldCheck,
  Plus,
} from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchUserCircles } from '../redux/slices/circleSlice'
import CirclesManagerModal from './CirclesManagerModal'

const standardOptions = [
  { id: 'Public', label: 'Everyone (Public)', icon: Globe, desc: 'Anyone on the platform' },
  { id: 'Connections', label: 'Connections Only', icon: Users, desc: 'Your network & followers' },
  { id: 'Only me', label: 'Only Me', icon: Lock, desc: 'Visible only to you' },
]

const PrivacySelector = ({
  privacy = 'Public',
  setPrivacy,
  targetCircle = null,
  setTargetCircle,
}) => {
  const dispatch = useDispatch()
  const { circles } = useSelector((state) => state.circle)

  const [isOpen, setIsOpen] = useState(false)
  const [showManagerModal, setShowManagerModal] = useState(false)

  useEffect(() => {
    if (circles.length === 0) {
      dispatch(fetchUserCircles())
    }
  }, [dispatch, circles.length])

  // Get selected display info
  const isCircleSelected = privacy === 'Circle' && targetCircle
  const currentCircle = isCircleSelected
    ? circles.find((c) => c._id === (targetCircle._id || targetCircle))
    : null

  return (
    <>
      <div className='relative mt-1'>
        <button
          type='button'
          onClick={() => setIsOpen(!isOpen)}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition shadow-2xs ${
            isCircleSelected && currentCircle
              ? 'text-white border border-white/20'
              : 'bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-700'
          }`}
          style={
            isCircleSelected && currentCircle
              ? { backgroundColor: currentCircle.color }
              : {}
          }
        >
          {isCircleSelected && currentCircle ? (
            <span className='text-xs'>{currentCircle.icon}</span>
          ) : privacy === 'Public' ? (
            <Globe className='w-3 h-3 text-emerald-500' />
          ) : privacy === 'Connections' ? (
            <Users className='w-3 h-3 text-indigo-500' />
          ) : (
            <Lock className='w-3 h-3 text-amber-500' />
          )}

          <span>
            {isCircleSelected && currentCircle
              ? currentCircle.name
              : privacy === 'Public'
              ? 'Public'
              : privacy === 'Connections'
              ? 'Connections'
              : 'Only Me'}
          </span>
          <ChevronDown className='w-3 h-3 opacity-70' />
        </button>

        {isOpen && (
          <div
            className='absolute left-0 top-full mt-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-xl p-2 z-50 w-56 sm:w-64 space-y-1 animate-in fade-in zoom-in-95 duration-100 max-h-80 overflow-y-auto custom-scrollbar'
            onClick={(e) => e.stopPropagation()}
          >
            <p className='text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 pt-1'>
              Who can see this post?
            </p>

            {/* Standard Privacy Options */}
            {standardOptions.map((opt) => {
              const Icon = opt.icon
              const isSelected = privacy === opt.id && !targetCircle

              return (
                <button
                  key={opt.id}
                  type='button'
                  onClick={() => {
                    setPrivacy(opt.id)
                    setTargetCircle(null)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left text-xs cursor-pointer transition ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-semibold'
                      : 'hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  <Icon className='w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-400' />
                  <div className='min-w-0'>
                    <p className='truncate'>{opt.label}</p>
                    <p className='text-[10px] text-gray-400 truncate'>
                      {opt.desc}
                    </p>
                  </div>
                </button>
              )
            })}

            {/* My Circles Section */}
            <div className='pt-1 border-t border-gray-100 dark:border-slate-800'>
              <div className='flex items-center justify-between px-2 py-1'>
                <p className='text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400'>
                  Social Circles
                </p>
                <button
                  type='button'
                  onClick={() => {
                    setIsOpen(false)
                    setShowManagerModal(true)
                  }}
                  className='text-[10px] text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold flex items-center gap-0.5 cursor-pointer'
                >
                  <Plus className='w-2.5 h-2.5' />
                  <span>Manage</span>
                </button>
              </div>

              {circles.map((circle) => {
                const isSelected =
                  privacy === 'Circle' &&
                  (targetCircle?._id || targetCircle) === circle._id
                const memberCount = circle.members?.length || 0

                return (
                  <button
                    key={circle._id}
                    type='button'
                    onClick={() => {
                      setPrivacy('Circle')
                      setTargetCircle(circle)
                      setIsOpen(false)
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs cursor-pointer transition ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 font-semibold'
                        : 'hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    <div className='flex items-center gap-2 min-w-0'>
                      <span className='text-sm shrink-0'>{circle.icon}</span>
                      <span
                        className='truncate'
                        style={isSelected ? { color: circle.color } : {}}
                      >
                        {circle.name}
                      </span>
                    </div>
                    <span className='text-[10px] px-1.5 py-0.2 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 font-medium shrink-0'>
                      {memberCount}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Background click to dismiss */}
      {isOpen && (
        <div
          className='fixed inset-0 z-40'
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Circles Manager Modal */}
      <CirclesManagerModal
        isOpen={showManagerModal}
        onClose={() => setShowManagerModal(false)}
      />
    </>
  )
}

export default PrivacySelector
