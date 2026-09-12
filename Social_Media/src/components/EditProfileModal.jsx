import React, { useRef, useState } from 'react'
import { Camera, Image as ImageIcon, X } from 'lucide-react'

const EditProfileModal = ({ user, isOpen, onClose, onSave }) => {
  const avatarInputRef = useRef(null)
  const coverInputRef = useRef(null)

  const [fullName, setFullName] = useState(user.full_name || '')
  const [username, setUsername] = useState(user.username || '')
  const [bio, setBio] = useState(user.bio || '')
  const [location, setLocation] = useState(user.location || '')
  const [profilePicture, setProfilePicture] = useState(user.profile_picture || '')
  const [coverPhoto, setCoverPhoto] = useState(user.cover_photo || '')

  if (!isOpen) return null

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfilePicture(URL.createObjectURL(file))
    }
  }

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverPhoto(URL.createObjectURL(file))
    }
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    onSave({
      ...user,
      full_name: fullName,
      username,
      bio,
      location,
      profile_picture: profilePicture,
      cover_photo: coverPhoto
    })
    onClose()
  }

  return (
    <div className='fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto'>
      <div className='bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 dark:border-slate-800'>
          <h3 className='font-bold text-lg text-gray-900 dark:text-gray-100'>
            Edit Profile
          </h3>
          <button
            type='button'
            onClick={onClose}
            className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition cursor-pointer'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        <form onSubmit={handleFormSubmit}>
          <div className='p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto no-scrollbar'>
            {/* Cover & Avatar Photo Upload Section */}
            <div>
              <label className='block font-semibold text-xs text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide'>
                Profile & Cover Photos
              </label>

              {/* Cover Banner Preview */}
              <div className='relative h-28 sm:h-36 w-full rounded-xl overflow-hidden bg-gradient-to-r from-blue-200 via-indigo-100 to-pink-200 dark:from-slate-800 dark:to-slate-700 border border-gray-200 dark:border-slate-700 group'>
                {coverPhoto && (
                  <img
                    src={coverPhoto}
                    alt='Cover'
                    className='w-full h-full object-cover'
                  />
                )}
                <input
                  type='file'
                  ref={coverInputRef}
                  onChange={handleCoverChange}
                  accept='image/*'
                  className='hidden'
                />
                <button
                  type='button'
                  onClick={() => coverInputRef.current?.click()}
                  className='absolute inset-0 bg-black/40 hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-medium cursor-pointer'
                >
                  <Camera className='w-4 h-4' />
                  <span>Change Cover</span>
                </button>
              </div>

              {/* Avatar Preview */}
              <div className='relative -mt-10 sm:-mt-12 ml-4 flex items-end gap-3'>
                <div className='relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-900 shadow-md bg-white dark:bg-slate-800 group'>
                  <img
                    src={profilePicture}
                    alt='Avatar'
                    className='w-full h-full object-cover'
                  />
                  <input
                    type='file'
                    ref={avatarInputRef}
                    onChange={handleAvatarChange}
                    accept='image/*'
                    className='hidden'
                  />
                  <button
                    type='button'
                    onClick={() => avatarInputRef.current?.click()}
                    className='absolute inset-0 bg-black/50 hover:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-medium cursor-pointer'
                  >
                    <Camera className='w-4 h-4 mb-0.5' />
                    <span>Upload</span>
                  </button>
                </div>

                <div className='mb-2'>
                  <button
                    type='button'
                    onClick={() => avatarInputRef.current?.click()}
                    className='text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline cursor-pointer'
                  >
                    Change photo
                  </button>
                  <p className='text-[10px] text-gray-400'>
                    Recommended 400x400 JPG/PNG
                  </p>
                </div>
              </div>
            </div>

            {/* Input Fields */}
            <div className='space-y-3.5 text-sm'>
              <div>
                <label className='block font-medium text-gray-700 dark:text-gray-300 mb-1 text-xs'>
                  Full Name
                </label>
                <input
                  type='text'
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder='Your full name'
                  required
                  className='w-full p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition'
                />
              </div>

              <div>
                <label className='block font-medium text-gray-700 dark:text-gray-300 mb-1 text-xs'>
                  Username
                </label>
                <div className='relative'>
                  <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm'>
                    @
                  </span>
                  <input
                    type='text'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder='username'
                    className='w-full p-2.5 pl-8 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition'
                  />
                </div>
              </div>

              <div>
                <label className='block font-medium text-gray-700 dark:text-gray-300 mb-1 text-xs'>
                  Bio
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder='Write a short bio about yourself...'
                  className='w-full p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none'
                />
              </div>

              <div>
                <label className='block font-medium text-gray-700 dark:text-gray-300 mb-1 text-xs'>
                  Location
                </label>
                <input
                  type='text'
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder='e.g. New York, NY'
                  className='w-full p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition'
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className='flex items-center justify-end gap-2.5 p-4 sm:p-5 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/40'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-slate-700 rounded-xl cursor-pointer font-medium text-sm transition'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl cursor-pointer font-semibold text-sm shadow-md transition active:scale-95'
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProfileModal

