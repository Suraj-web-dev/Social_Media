import React, { useState } from 'react'
import { AlertTriangle, Loader2, LogOut, Mail, Settings, Trash2, X } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser, deleteAccount } from '../redux/slices/authSlice'

const AccountSettingsModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!isOpen) return null

  const handleLogout = () => {
    onClose()
    dispatch(logoutUser())
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    const resultAction = await dispatch(deleteAccount())
    setIsDeleting(false)
    if (deleteAccount.fulfilled.match(resultAction)) {
      onClose()
    } else {
      alert(resultAction.payload || 'Failed to delete account.')
    }
  }

  return (
    <div className='fixed inset-0 bg-black/75 backdrop-blur-xs z-[110] flex items-center justify-center p-4 animate-in fade-in duration-150'>
      <div className='bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 dark:border-slate-800'>
          <div className='flex items-center gap-2'>
            <Settings className='w-5 h-5 text-indigo-600 dark:text-indigo-400' />
            <h3 className='font-bold text-lg text-gray-900 dark:text-gray-100'>
              Account Settings
            </h3>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition cursor-pointer'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Content */}
        <div className='p-5 space-y-4 text-sm'>
          {/* User Account Overview Card */}
          <div className='p-4 rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-800/50 space-y-2'>
            <div className='flex items-center gap-3'>
              <img
                src={user?.profile_picture || '/sample_profile.jpg'}
                alt={user?.full_name}
                className='w-12 h-12 rounded-full object-cover border border-white dark:border-slate-700 shadow-xs'
              />
              <div className='min-w-0 flex-1'>
                <p className='font-bold text-gray-900 dark:text-gray-100 truncate'>
                  {user?.full_name || 'User'}
                </p>
                <p className='text-xs text-gray-500 dark:text-gray-400 truncate'>
                  @{user?.username || 'user'}
                </p>
              </div>
            </div>

            <div className='flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200/60 dark:border-slate-700'>
              <Mail className='w-3.5 h-3.5 text-gray-400' />
              <span className='truncate'>{user?.email || 'user@example.com'}</span>
            </div>
          </div>

          {/* Sign Out Option */}
          <div
            onClick={handleLogout}
            className='flex items-center justify-between p-3.5 rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer'
          >
            <div className='flex items-center gap-3'>
              <div className='p-2 rounded-lg bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300'>
                <LogOut className='w-4 h-4' />
              </div>
              <div>
                <p className='font-semibold text-gray-900 dark:text-gray-100'>
                  Sign Out
                </p>
                <p className='text-xs text-gray-500 dark:text-gray-400'>
                  Log out of your current session
                </p>
              </div>
            </div>
          </div>

          {/* Danger Zone: Delete Account */}
          <div className='pt-2 border-t border-gray-100 dark:border-slate-800'>
            <p className='text-xs font-semibold text-red-600 uppercase tracking-wider mb-2'>
              Danger Zone
            </p>

            {!confirmDelete ? (
              <button
                type='button'
                onClick={() => setConfirmDelete(true)}
                className='w-full flex items-center justify-between p-3.5 rounded-xl border border-red-100 dark:border-red-950/50 bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100/50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 transition cursor-pointer'
              >
                <div className='flex items-center gap-3'>
                  <div className='p-2 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300'>
                    <Trash2 className='w-4 h-4' />
                  </div>
                  <div className='text-left'>
                    <p className='font-semibold'>Delete Account</p>
                    <p className='text-xs text-red-500/80 dark:text-red-400/70'>
                      Permanently remove your account and all data
                    </p>
                  </div>
                </div>
              </button>
            ) : (
              <div className='p-4 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 space-y-3 animate-in fade-in duration-150'>
                <div className='flex items-start gap-2 text-red-700 dark:text-red-300 text-xs leading-relaxed'>
                  <AlertTriangle className='w-4 h-4 shrink-0 mt-0.5 text-red-600' />
                  <p>
                    <strong>Are you absolutely sure?</strong> This will permanently delete your account and profile from the database.
                  </p>
                </div>

                <div className='flex items-center justify-end gap-2 pt-1'>
                  <button
                    type='button'
                    disabled={isDeleting}
                    onClick={() => setConfirmDelete(false)}
                    className='px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition cursor-pointer'
                  >
                    Cancel
                  </button>
                  <button
                    type='button'
                    disabled={isDeleting}
                    onClick={handleDeleteAccount}
                    className='flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition cursor-pointer shadow-xs active:scale-95 disabled:opacity-50'
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className='w-3.5 h-3.5 animate-spin' />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className='w-3.5 h-3.5' />
                        <span>Yes, Delete Account</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountSettingsModal
