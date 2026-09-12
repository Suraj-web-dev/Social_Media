import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { dummyConnectionsData, dummyPostsData, dummyUserData } from '../assets'
import { BadgeCheck, Calendar, Edit, Heart, Image as ImageIcon, MapPin, MessageSquare, UserCheck, UserPlus } from 'lucide-react'
import moment from 'moment'
import PostCard from './PostCard'
import EditProfileModal from '../components/EditProfileModal'

const Profile = () => {
  const { profileId } = useParams()
  const [activeTab, setActiveTab] = useState('posts')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)

  // Find user by profileId or fallback to dummyUserData
  const initialUser = profileId
    ? dummyConnectionsData.find(u => u._id === profileId) || dummyUserData
    : dummyUserData

  const [user, setUser] = useState(initialUser)
  const isCurrentUser = !profileId || profileId === dummyUserData._id

  // Filter user posts
  const posts = dummyPostsData.filter(post =>
    isCurrentUser ? true : post.user?._id === user._id
  )

  // Filter media posts
  const mediaPosts = posts.filter(post => post.image_urls && post.image_urls.length > 0)

  // Liked posts
  const likedPosts = posts.slice(0, 2)

  const handleSaveProfile = (updatedUser) => {
    setUser(updatedUser)
  }

  return (
    <div className='min-h-full pb-16 max-w-4xl mx-auto px-3 sm:px-6'>
      {/* Profile Header Card */}
      <div className='bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden mt-4'>
        {/* Cover Photo / Banner */}
        <div className='h-40 sm:h-56 w-full bg-gradient-to-r from-blue-200 via-indigo-100 to-pink-200 dark:from-slate-800 dark:to-slate-700 relative overflow-hidden'>
          {user.cover_photo && (
            <img
              src={user.cover_photo}
              alt="Cover"
              className='w-full h-full object-cover'
            />
          )}
        </div>

        {/* Profile Details Container */}
        <div className='px-4 sm:px-8 pb-6'>
          {/* Avatar & Action Button Row */}
          <div className='flex justify-between items-end relative -mt-14 sm:-mt-16 mb-4'>
            <img
              src={user.profile_picture}
              alt={user.full_name}
              className='w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white dark:border-slate-900 shadow-md bg-white dark:bg-slate-800'
            />

            {/* Action Buttons */}
            <div>
              {isCurrentUser ? (
                <button
                  type='button'
                  onClick={() => setIsEditModalOpen(true)}
                  className='flex items-center gap-1.5 px-4 py-2 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 transition cursor-pointer shadow-xs'
                >
                  <Edit className='w-4 h-4 text-gray-500 dark:text-gray-400' />
                  <span>Edit</span>
                </button>
              ) : (
                <div className='flex items-center gap-2'>
                  <button
                    type='button'
                    onClick={() => setIsFollowing(!isFollowing)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition cursor-pointer shadow-xs ${
                      isFollowing
                        ? 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700'
                        : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className='w-4 h-4' />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className='w-4 h-4' />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                  <button className='p-2 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl text-gray-700 dark:text-gray-200 cursor-pointer transition'>
                    <MessageSquare className='w-4 h-4' />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* User Name & Bio */}
          <div className='space-y-2'>
            <div className='flex items-center gap-1.5'>
              <h1 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100'>
                {user.full_name}
              </h1>
              {user.is_verified && (
                <BadgeCheck className='w-5 h-5 text-blue-500 fill-blue-50' />
              )}
            </div>

            <p className='text-gray-500 dark:text-gray-400 text-sm font-medium'>
              @{user.username}
            </p>

            <p className='text-gray-700 dark:text-gray-300 text-sm leading-relaxed max-w-2xl whitespace-pre-line'>
              {user.bio}
            </p>

            {/* Metadata (Location & Joined) */}
            <div className='flex items-center gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 pt-1 flex-wrap'>
              {user.location && (
                <div className='flex items-center gap-1'>
                  <MapPin className='w-4 h-4 text-gray-400' />
                  <span>{user.location}</span>
                </div>
              )}
              <div className='flex items-center gap-1'>
                <Calendar className='w-4 h-4 text-gray-400' />
                <span>
                  Joined {user.createdAt ? moment(user.createdAt).fromNow() : '16 days ago'}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className='flex items-center gap-6 pt-5 mt-5 border-t border-gray-100 dark:border-slate-800 text-sm'>
            <div className='flex items-center gap-1.5'>
              <span className='font-bold text-gray-900 dark:text-gray-100'>{posts.length || 6}</span>
              <span className='text-gray-500 dark:text-gray-400'>Posts</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <span className='font-bold text-gray-900 dark:text-gray-100'>{user.followers?.length || 2}</span>
              <span className='text-gray-500 dark:text-gray-400'>Followers</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <span className='font-bold text-gray-900 dark:text-gray-100'>{user.following?.length || 2}</span>
              <span className='text-gray-500 dark:text-gray-400'>Following</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Filter */}
      <div className='flex items-center justify-center my-6'>
        <div className='bg-white dark:bg-slate-900 shadow-sm border border-gray-100 dark:border-slate-800 rounded-xl p-1.5 flex items-center gap-1 max-w-xs sm:max-w-md w-full justify-around'>
          <button
            type='button'
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer text-center ${
              activeTab === 'posts'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800'
            }`}
          >
            Posts
          </button>
          <button
            type='button'
            onClick={() => setActiveTab('media')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer text-center ${
              activeTab === 'media'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800'
            }`}
          >
            Media
          </button>
          <button
            type='button'
            onClick={() => setActiveTab('likes')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer text-center ${
              activeTab === 'likes'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800'
            }`}
          >
            Likes
          </button>
        </div>
      </div>

      {/* Tab Content Section */}
      <div className='space-y-6 flex flex-col items-center'>
        {activeTab === 'posts' && (
          posts.length > 0 ? (
            posts.map((post, idx) => (
              <PostCard key={post._id || idx} post={{ ...post, user }} />
            ))
          ) : (
            <div className='text-center py-12 text-gray-500 dark:text-gray-400 text-sm'>
              No posts yet
            </div>
          )
        )}

        {activeTab === 'media' && (
          mediaPosts.length > 0 ? (
            <div className='grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-2xl'>
              {mediaPosts.map((post, idx) => (
                <div
                  key={post._id || idx}
                  className='rounded-xl overflow-hidden aspect-square bg-gray-100 dark:bg-slate-800 shadow-sm border border-gray-100 dark:border-slate-800 group relative cursor-pointer'
                >
                  <img
                    src={post.image_urls[0]}
                    alt="Media post"
                    className='w-full h-full object-cover group-hover:scale-105 transition duration-300'
                  />
                  <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white gap-2'>
                    <Heart className='w-5 h-5 fill-white' />
                    <span className='text-sm font-semibold'>{post.likes_count?.length || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-12 text-gray-500 dark:text-gray-400 text-sm'>
              No media uploads yet
            </div>
          )
        )}

        {activeTab === 'likes' && (
          likedPosts.length > 0 ? (
            likedPosts.map((post, idx) => (
              <PostCard key={post._id || idx} post={post} />
            ))
          ) : (
            <div className='text-center py-12 text-gray-500 dark:text-gray-400 text-sm'>
              No liked posts yet
            </div>
          )
        )}
      </div>

      {/* Edit Profile Modal with Image Upload Support */}
      <EditProfileModal
        user={user}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveProfile}
      />
    </div>
  )
}

export default Profile
