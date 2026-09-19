import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUserProfile, toggleFollowUser } from '../redux/slices/userSlice'
import { fetchUserPosts, fetchSavedPosts } from '../redux/slices/postSlice'
import {
  BadgeCheck,
  Calendar,
  Edit,
  Heart,
  Bookmark,
  Loader2,
  MapPin,
  MessageSquare,
  UserCheck,
  UserPlus,
  Sparkles,
  Grid,
  Image,
} from 'lucide-react'
import moment from 'moment'
import PostCard from './PostCard'
import EditProfileModal from '../components/EditProfileModal'
import { motion } from 'framer-motion'

const Profile = () => {
  const { profileId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { user: currentUser } = useSelector((state) => state.auth)
  const { profileUser, loading: userLoading } = useSelector(
    (state) => state.user
  )
  const { userPosts, savedPosts, loading: postsLoading, savedLoading } = useSelector(
    (state) => state.post
  )

  const [activeTab, setActiveTab] = useState('posts')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const isCurrentUser =
    !profileId ||
    profileId === currentUser?._id ||
    profileId === currentUser?.username

  const user = isCurrentUser ? currentUser : profileUser
  const targetUserId = isCurrentUser
    ? currentUser?._id
    : profileUser?._id || profileId

  useEffect(() => {
    if (profileId && !isCurrentUser) {
      dispatch(fetchUserProfile(profileId))
    }
  }, [profileId, isCurrentUser, dispatch])

  useEffect(() => {
    if (targetUserId) {
      dispatch(fetchUserPosts(targetUserId))
    }
  }, [targetUserId, dispatch])

  useEffect(() => {
    if (activeTab === 'saved' && isCurrentUser) {
      dispatch(fetchSavedPosts())
    }
  }, [activeTab, isCurrentUser, dispatch])

  const isFollowing =
    (user?.followers || []).some((f) => {
      const fid = (typeof f === 'object' ? f._id : f)?.toString()
      return fid === currentUser?._id?.toString()
    }) ||
    (currentUser?.following || []).some((f) => {
      const fid = (typeof f === 'object' ? f._id : f)?.toString()
      return fid === user?._id?.toString()
    })

  const handleFollowToggle = () => {
    if (user?._id) {
      dispatch(toggleFollowUser(user._id))
    }
  }

  const handleMessageUser = () => {
    if (user?._id) {
      navigate(`/messages/${user._id}`)
    }
  }

  const mediaPosts = (userPosts || []).filter(
    (post) => post.image_urls && post.image_urls.length > 0
  )

  if (userLoading && !user) {
    return (
      <div className='min-h-[60vh] flex flex-col items-center justify-center text-indigo-600 gap-3'>
        <Loader2 className='w-8 h-8 animate-spin' />
        <p className='text-xs font-semibold text-gray-500 animate-pulse'>
          Loading profile...
        </p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className='text-center py-24 text-gray-500 dark:text-gray-400'>
        User profile not found.
      </div>
    )
  }

  return (
    <div className='w-full max-w-5xl mx-auto p-2 sm:p-4 lg:p-6 pb-24 space-y-6'>
      {/* Profile Header Glass Card */}
      <div className='glass-card rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-sm overflow-hidden'>
        {/* Cover Photo / Gradient Banner */}
        <div className='h-48 sm:h-64 lg:h-72 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden'>
          {user.cover_photo && (
            <img
              src={user.cover_photo}
              alt='Cover'
              className='w-full h-full object-cover'
            />
          )}
          <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />
        </div>

        {/* Profile Details Container */}
        <div className='px-5 sm:px-8 pb-6'>
          {/* Avatar & Action Button Row */}
          <div className='flex justify-between items-end relative -mt-14 sm:-mt-18 mb-4'>
            <div className='relative'>
              <img
                src={user.profile_picture || '/sample_profile.jpg'}
                alt={user.full_name || 'User'}
                loading='lazy'
                decoding='async'
                className='w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white dark:border-[#0B0F19] shadow-xl bg-slate-800'
              />
              <span className='absolute bottom-1 right-1 size-4 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900' />
            </div>

            {/* Action Buttons */}
            <div>
              {isCurrentUser ? (
                <button
                  type='button'
                  onClick={() => setIsEditModalOpen(true)}
                  className='flex items-center gap-1.5 px-4 py-2 glass-card hover:bg-slate-100 dark:hover:bg-white/[0.08] rounded-xl text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 transition cursor-pointer shadow-xs border border-slate-200/80 dark:border-white/10'
                >
                  <Edit className='w-4 h-4 text-indigo-500' />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className='flex items-center gap-2'>
                  <button
                    type='button'
                    onClick={handleFollowToggle}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer shadow-xs active:scale-95 ${
                      isFollowing
                        ? 'bg-slate-100 dark:bg-white/[0.08] text-gray-700 dark:text-gray-200'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90'
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
                  <button
                    type='button'
                    title='Send Direct Message'
                    onClick={handleMessageUser}
                    className='p-2.5 glass-card border border-slate-200/80 dark:border-white/10 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 text-gray-700 dark:text-gray-200 rounded-xl cursor-pointer transition shadow-xs active:scale-90 flex items-center justify-center'
                  >
                    <MessageSquare className='w-4 h-4' />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* User Name & Bio */}
          <div className='space-y-2'>
            <div className='flex items-center gap-1.5'>
              <h1 className='text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight'>
                {user.full_name}
              </h1>
              {user.is_verified && (
                <BadgeCheck className='w-5 h-5 text-blue-500 fill-blue-50' />
              )}
            </div>

            <p className='text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-semibold'>
              @{user.username}
            </p>

            {user.bio && (
              <p className='text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed max-w-2xl whitespace-pre-line'>
                {user.bio}
              </p>
            )}

            <div className='flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-1 flex-wrap'>
              {user.location && (
                <div className='flex items-center gap-1'>
                  <MapPin className='w-3.5 h-3.5 text-rose-500' />
                  <span>{user.location}</span>
                </div>
              )}
              <div className='flex items-center gap-1'>
                <Calendar className='w-3.5 h-3.5 text-indigo-500' />
                <span>
                  Joined{' '}
                  {user.createdAt
                    ? moment(user.createdAt).format('MMMM YYYY')
                    : 'recently'}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className='grid grid-cols-3 gap-2 sm:gap-4 pt-5 mt-5 border-t border-slate-200/60 dark:border-white/[0.06]'>
            <div className='p-3 rounded-2xl bg-slate-100/60 dark:bg-white/[0.03] text-center'>
              <span className='block text-lg sm:text-xl font-black text-gray-900 dark:text-white'>
                {userPosts?.length || 0}
              </span>
              <span className='text-xs font-semibold text-gray-500 dark:text-gray-400'>
                Posts
              </span>
            </div>
            <div className='p-3 rounded-2xl bg-slate-100/60 dark:bg-white/[0.03] text-center'>
              <span className='block text-lg sm:text-xl font-black text-gray-900 dark:text-white'>
                {user.followers?.length || 0}
              </span>
              <span className='text-xs font-semibold text-gray-500 dark:text-gray-400'>
                Followers
              </span>
            </div>
            <div className='p-3 rounded-2xl bg-slate-100/60 dark:bg-white/[0.03] text-center'>
              <span className='block text-lg sm:text-xl font-black text-gray-900 dark:text-white'>
                {user.following?.length || 0}
              </span>
              <span className='text-xs font-semibold text-gray-500 dark:text-gray-400'>
                Following
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Filter */}
      <div className='flex items-center justify-center'>
        <div className='glass-card rounded-2xl p-1.5 flex items-center gap-1 max-w-xs sm:max-w-md w-full justify-around border border-slate-200/80 dark:border-white/[0.08] shadow-xs'>
          <button
            type='button'
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'posts'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Grid className='w-4 h-4' />
            <span>Posts</span>
          </button>
          <button
            type='button'
            onClick={() => setActiveTab('media')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'media'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Image className='w-4 h-4' />
            <span>Media</span>
          </button>
          {isCurrentUser && (
            <button
              type='button'
              onClick={() => setActiveTab('saved')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'saved'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Bookmark className='w-4 h-4' />
              <span>Saved</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Content Section */}
      <div className='space-y-5 flex flex-col items-center w-full'>
        {activeTab === 'posts' && (
          postsLoading ? (
            <div className='py-16 flex items-center justify-center text-indigo-600'>
              <Loader2 className='w-7 h-7 animate-spin' />
            </div>
          ) : userPosts && userPosts.length > 0 ? (
            userPosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))
          ) : (
            <div className='glass-card rounded-3xl p-10 text-center text-gray-500 dark:text-gray-400 text-xs sm:text-sm border border-slate-200/80 dark:border-white/[0.08] w-full max-w-md'>
              No posts shared yet
            </div>
          )
        )}

        {activeTab === 'media' && (
          mediaPosts.length > 0 ? (
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 w-full'>
              {mediaPosts.map((post) => (
                <div
                  key={post._id}
                  className='rounded-2xl overflow-hidden aspect-square bg-slate-900/10 dark:bg-slate-800 shadow-sm border border-slate-200/80 dark:border-white/[0.08] group relative cursor-pointer'
                >
                  <img
                    src={post.image_urls[0]}
                    alt='Media post'
                    loading='lazy'
                    decoding='async'
                    className='w-full h-full object-cover group-hover:scale-105 transition duration-300'
                  />
                  <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white gap-2 backdrop-blur-xs'>
                    <Heart className='w-5 h-5 fill-white' />
                    <span className='text-sm font-bold'>
                      {post.likes_count?.length || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='glass-card rounded-3xl p-10 text-center text-gray-500 dark:text-gray-400 text-xs sm:text-sm border border-slate-200/80 dark:border-white/[0.08] w-full max-w-md'>
              No media uploads yet
            </div>
          )
        )}

        {activeTab === 'saved' && (
          savedLoading ? (
            <div className='py-16 flex items-center justify-center text-indigo-600'>
              <Loader2 className='w-7 h-7 animate-spin' />
            </div>
          ) : savedPosts && savedPosts.length > 0 ? (
            savedPosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))
          ) : (
            <div className='glass-card rounded-3xl border border-slate-200/80 dark:border-white/[0.08] p-10 text-center space-y-2 max-w-md w-full'>
              <div className='size-12 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto'>
                <Bookmark className='w-6 h-6' />
              </div>
              <p className='text-gray-900 dark:text-white font-bold text-sm pt-1'>
                No saved posts yet
              </p>
              <p className='text-gray-500 dark:text-gray-400 text-xs leading-relaxed'>
                Bookmark posts across your feed to easily revisit them anytime here.
              </p>
            </div>
          )
        )}
      </div>

      <EditProfileModal
        user={user}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  )
}

export default Profile
