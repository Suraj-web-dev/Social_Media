import React, { useState, useEffect } from 'react'
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  Search,
  Users,
  ShieldCheck,
  Sparkles,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchUserCircles,
  createCircle,
  updateCircle,
  deleteCircle,
  toggleCircleMember,
} from '../redux/slices/circleSlice'
import { fetchConnectionsData } from '../redux/slices/userSlice'
import { showToast } from '../utils/toast'

const EMOJI_OPTIONS = ['⭐', '👨‍💻', '👨‍👩‍👧', '🎓', '🏏', '🚀', '🎨', '🔥', '💼', '🎮', '🍕', '✈️']
const COLOR_OPTIONS = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#ef4444', // Red
  '#3b82f6', // Blue
]

const CirclesManagerModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch()
  const { circles, loading, saving } = useSelector((state) => state.circle)
  const { connectionsData } = useSelector((state) => state.user)

  const [activeCircle, setActiveCircle] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newCircleName, setNewCircleName] = useState('')
  const [newCircleIcon, setNewCircleIcon] = useState('⭐')
  const [newCircleColor, setNewCircleColor] = useState('#6366f1')
  const [newCircleDesc, setNewCircleDesc] = useState('')
  const [memberSearchQuery, setMemberSearchQuery] = useState('')

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchUserCircles())
      dispatch(fetchConnectionsData())
    }
  }, [isOpen, dispatch])

  // Select first circle by default when opened
  useEffect(() => {
    if (circles.length > 0 && !activeCircle && !isCreating) {
      setActiveCircle(circles[0])
    }
  }, [circles, activeCircle, isCreating])

  // Keep activeCircle in sync with redux state updates
  useEffect(() => {
    if (activeCircle) {
      const updated = circles.find((c) => c._id === activeCircle._id)
      if (updated) setActiveCircle(updated)
    }
  }, [circles])

  if (!isOpen) return null

  // Combined friends list for adding to circles
  const allFriends = [
    ...(connectionsData?.connections || []),
    ...(connectionsData?.following || []),
    ...(connectionsData?.followers || []),
  ].reduce((acc, user) => {
    const u = user?.user || user
    if (u && u._id && !acc.some((x) => x._id === u._id)) {
      acc.push(u)
    }
    return acc
  }, [])

  const filteredFriends = allFriends.filter((f) => {
    const name = f.full_name || ''
    const username = f.username || ''
    const q = memberSearchQuery.toLowerCase().trim()
    return name.toLowerCase().includes(q) || username.toLowerCase().includes(q)
  })

  // Handle Create Circle
  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    if (!newCircleName.trim()) {
      showToast.error('Please enter a circle name.')
      return
    }

    try {
      const res = await dispatch(
        createCircle({
          name: newCircleName.trim(),
          icon: newCircleIcon,
          color: newCircleColor,
          description: newCircleDesc.trim(),
          members: [],
        })
      ).unwrap()

      showToast.success(`Circle "${res.name}" created!`)
      setNewCircleName('')
      setNewCircleDesc('')
      setIsCreating(false)
      setActiveCircle(res)
    } catch (err) {
      showToast.error(err || 'Failed to create circle.')
    }
  }

  // Handle Delete Circle
  const handleDeleteCircle = async (circleId, circleName) => {
    if (window.confirm(`Are you sure you want to delete "${circleName}"?`)) {
      try {
        await dispatch(deleteCircle(circleId)).unwrap()
        showToast.success('Circle deleted.')
        if (activeCircle?._id === circleId) {
          const remaining = circles.filter((c) => c._id !== circleId)
          setActiveCircle(remaining[0] || null)
        }
      } catch (err) {
        showToast.error(err || 'Failed to delete circle.')
      }
    }
  }

  // Handle Toggle Member in Circle
  const handleToggleMember = async (memberId) => {
    if (!activeCircle?._id) return

    try {
      await dispatch(
        toggleCircleMember({
          circleId: activeCircle._id,
          memberId,
        })
      ).unwrap()
    } catch (err) {
      showToast.error(err || 'Failed to update member.')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs'
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className='relative w-full max-w-3xl h-[88vh] max-h-[680px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 dark:border-slate-800'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800 shrink-0'>
          <div className='flex items-center gap-3'>
            <div className='p-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'>
              <Sparkles className='w-5 h-5' />
            </div>
            <div>
              <h2 className='text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2'>
                <span>My Circles</span>
                <span className='text-xs font-semibold px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-full'>
                  {circles.length}
                </span>
              </h2>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                Organize friends into custom audience circles for targeted posts
              </p>
            </div>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* 2-Column Body Layout */}
        <div className='flex-1 flex flex-col md:flex-row overflow-hidden min-h-0'>
          {/* LEFT SIDEBAR: Circles List + Create Button */}
          <div className='w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-100 dark:border-slate-800 p-3 space-y-2 overflow-y-auto custom-scrollbar shrink-0'>
            <button
              type='button'
              onClick={() => {
                setIsCreating(true)
                setActiveCircle(null)
              }}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                isCreating
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
              }`}
            >
              <Plus className='w-4 h-4' />
              <span>Create New Circle</span>
            </button>

            <div className='space-y-1.5 pt-1'>
              {circles.map((c) => {
                const isSelected = activeCircle?._id === c._id && !isCreating
                const memberCount = c.members?.length || 0

                return (
                  <div
                    key={c._id}
                    onClick={() => {
                      setIsCreating(false)
                      setActiveCircle(c)
                    }}
                    className={`group flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-gray-100 dark:bg-slate-800 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'hover:bg-gray-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className='flex items-center gap-2.5 min-w-0'>
                      <div
                        className='w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-xs shrink-0'
                        style={{
                          backgroundColor: `${c.color}20`,
                          color: c.color,
                        }}
                      >
                        {c.icon || '⭐'}
                      </div>
                      <div className='min-w-0'>
                        <p className='text-xs font-bold text-gray-900 dark:text-white truncate'>
                          {c.name}
                        </p>
                        <p className='text-[11px] text-gray-400'>
                          {memberCount} {memberCount === 1 ? 'member' : 'members'}
                        </p>
                      </div>
                    </div>

                    <button
                      type='button'
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteCircle(c._id, c.name)
                      }}
                      className='opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-rose-500 transition cursor-pointer'
                      title='Delete Circle'
                    >
                      <Trash2 className='w-3.5 h-3.5' />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* RIGHT PANEL: Circle Members Manager OR Create Form */}
          <div className='flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto custom-scrollbar min-h-0'>
            {isCreating ? (
              // ================= CREATE NEW CIRCLE FORM =================
              <form onSubmit={handleCreateSubmit} className='space-y-4 max-w-lg'>
                <div>
                  <h3 className='text-base font-bold text-gray-900 dark:text-white'>
                    Create a New Circle
                  </h3>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    Choose an icon, name, and color theme for your audience circle
                  </p>
                </div>

                {/* Circle Name */}
                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-gray-700 dark:text-gray-300'>
                    Circle Name
                  </label>
                  <input
                    type='text'
                    value={newCircleName}
                    onChange={(e) => setNewCircleName(e.target.value)}
                    placeholder='e.g. Cricket Friends, Designers, Besties...'
                    className='w-full text-xs sm:text-sm bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 rounded-xl px-3.5 py-2.5 border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                    required
                  />
                </div>

                {/* Icon Selection */}
                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-gray-700 dark:text-gray-300'>
                    Choose Icon
                  </label>
                  <div className='flex flex-wrap gap-2'>
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type='button'
                        onClick={() => setNewCircleIcon(emoji)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-base cursor-pointer transition ${
                          newCircleIcon === emoji
                            ? 'bg-indigo-600 text-white scale-110 shadow-md ring-2 ring-indigo-300'
                            : 'bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-gray-700 dark:text-gray-300'>
                    Accent Color
                  </label>
                  <div className='flex flex-wrap gap-2.5'>
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c}
                        type='button'
                        onClick={() => setNewCircleColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-7 h-7 rounded-full cursor-pointer transition-transform active:scale-90 ${
                          newCircleColor === c
                            ? 'ring-3 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900 scale-110'
                            : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-gray-700 dark:text-gray-300'>
                    Description (optional)
                  </label>
                  <input
                    type='text'
                    value={newCircleDesc}
                    onChange={(e) => setNewCircleDesc(e.target.value)}
                    placeholder='Briefly describe who belongs to this circle...'
                    className='w-full text-xs sm:text-sm bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 rounded-xl px-3.5 py-2.5 border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                  />
                </div>

                {/* Buttons */}
                <div className='flex items-center gap-2 pt-2'>
                  <button
                    type='submit'
                    disabled={saving}
                    className='px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold transition cursor-pointer shadow-md disabled:opacity-50'
                  >
                    {saving ? 'Creating...' : 'Create Circle'}
                  </button>
                  <button
                    type='button'
                    onClick={() => {
                      setIsCreating(false)
                      if (circles.length > 0) setActiveCircle(circles[0])
                    }}
                    className='px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-semibold transition cursor-pointer'
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : activeCircle ? (
              // ================= ACTIVE CIRCLE MEMBERS MANAGER =================
              <div className='space-y-4 flex-1 flex flex-col min-h-0'>
                {/* Active Circle Header Banner */}
                <div
                  className='p-4 rounded-2xl flex items-center justify-between border'
                  style={{
                    backgroundColor: `${activeCircle.color}10`,
                    borderColor: `${activeCircle.color}30`,
                  }}
                >
                  <div className='flex items-center gap-3'>
                    <div
                      className='w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs'
                      style={{
                        backgroundColor: `${activeCircle.color}25`,
                        color: activeCircle.color,
                      }}
                    >
                      {activeCircle.icon}
                    </div>
                    <div>
                      <h3 className='text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight'>
                        {activeCircle.name}
                      </h3>
                      <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
                        {activeCircle.description ||
                          'Manage who can see posts shared with this circle'}
                      </p>
                    </div>
                  </div>

                  <div className='text-right'>
                    <span
                      className='px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs'
                      style={{ backgroundColor: activeCircle.color }}
                    >
                      {activeCircle.members?.length || 0} Members
                    </span>
                  </div>
                </div>

                {/* Member Search Bar */}
                <div className='relative'>
                  <Search className='w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2' />
                  <input
                    type='text'
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    placeholder='Search friends to add or remove...'
                    className='w-full text-xs sm:text-sm bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 rounded-xl pl-9 pr-3.5 py-2 border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                  />
                </div>

                {/* Friends List with Add/Remove Checkbox Toggle */}
                <div className='flex-1 overflow-y-auto custom-scrollbar space-y-1.5 pr-1 min-h-0'>
                  {filteredFriends.length === 0 ? (
                    <div className='text-center py-12 text-xs text-gray-400 space-y-1'>
                      <p className='font-semibold text-gray-600 dark:text-gray-300'>
                        {allFriends.length === 0
                          ? 'No connections found yet.'
                          : 'No matching people found.'}
                      </p>
                      <p className='text-[11px]'>
                        Follow or connect with users from the Discover tab to add them to your circles!
                      </p>
                    </div>
                  ) : (
                    filteredFriends.map((friend) => {
                      const isMember = (activeCircle.members || []).some(
                        (m) =>
                          (typeof m === 'object' ? m._id : m)?.toString() ===
                          friend._id?.toString()
                      )

                      return (
                        <div
                          key={friend._id}
                          onClick={() => handleToggleMember(friend._id)}
                          className={`flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition ${
                            isMember
                              ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40'
                              : 'hover:bg-gray-50 dark:hover:bg-slate-800/60 border border-transparent'
                          }`}
                        >
                          <div className='flex items-center gap-3 min-w-0'>
                            <img
                              src={
                                friend.profile_picture || '/sample_profile.jpg'
                              }
                              alt={friend.full_name}
                              className='w-10 h-10 rounded-full object-cover border border-gray-100 dark:border-slate-800 shrink-0'
                            />
                            <div className='min-w-0'>
                              <p className='text-xs font-bold text-gray-900 dark:text-white truncate'>
                                {friend.full_name}
                              </p>
                              <p className='text-[11px] text-gray-400 truncate'>
                                @{friend.username}
                              </p>
                            </div>
                          </div>

                          <button
                            type='button'
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleMember(friend._id)
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                              isMember
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                            }`}
                          >
                            {isMember ? (
                              <>
                                <CheckCircle2 className='w-3.5 h-3.5' />
                                <span>In Circle</span>
                              </>
                            ) : (
                              <>
                                <Plus className='w-3.5 h-3.5' />
                                <span>Add</span>
                              </>
                            )}
                          </button>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center py-20 text-center text-gray-400 space-y-2'>
                <Users className='w-10 h-10 text-gray-300 dark:text-gray-600' />
                <p className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                  No Circles Selected
                </p>
                <p className='text-xs max-w-xs'>
                  Select a circle from the left menu or click Create New Circle to start organizing friends.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default CirclesManagerModal

