import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
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
} from 'lucide-react'
import moment from 'moment'
import PostCard from './PostCard'
import EditProfileModal from '../components/EditProfileModal'

const Profile = () => {
  const { profileId } = useParams()
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

  // Check if viewing logged-in user profile
  const isCurrentUser =
    !profileId ||
    profileId === currentUser?._id ||
    profileId === currentUser?.username

  // Target user profile object
  const user = isCurrentUser ? currentUser : profileUser

  const targetUserId = isCurrentUser
    ? currentUser?._id
    : profileUser?._id || profileId

  // Fetch target profile if viewing other user
  useEffect(() => {
    if (profileId && !isCurrentUser) {
      dispatch(fetchUserProfile(profileId))
    }
  }, [profileId, isCurrentUser, dispatch])

  // Fetch user posts
  useEffect(() => {
    if (targetUserId) {
      dispatch(fetchUserPosts(targetUserId))
    }
  }, [targetUserId, dispatch])

  // Fetch saved/bookmarked posts when switching to saved tab
  useEffect(() => {
    if (activeTab === 'saved' && isCurrentUser) {
      dispatch(fetchSavedPosts())
    }
  }, [activeTab, isCurrentUser, dispatch])

  const isFollowing =
    user?.followers?.some((f) =>
      (typeof f === 'object' ? f._id : f) === currentUser?._id
    ) || false

  const handleFollowToggle = () => {
    if (user?._id) {
      dispatch(toggleFollowUser(user._id))
    }
  }

  // Filter media posts
  const mediaPosts = (userPosts || []).filter(
    (post) => post.image_urls && post.image_urls.length > 0
  )

  if (userLoading && !user) {
    return (
      <div className='min-h-[50vh] flex flex-col items-center justify-center text-indigo-600 gap-2'>
        <Loader2 className='w-7 h-7 animate-spin' />
        <p className='text-sm text-gray-500 dark:text-gray-400'>
          Loading profile...
        </p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className='text-center py-20 text-gray-500 dark:text-gray-400'>
        User profile not found.
      </div>
    )
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
              alt='Cover'
              className='w-full h-full object-cover'
            />
          )}
        </div>

        {/* Profile Details Container */}
        <div className='px-4 sm:px-8 pb-6'>
          {/* Avatar & Action Button Row */}
          <div className='flex justify-between items-end relative -mt-14 sm:-mt-16 mb-4'>
            <img
              src={user.profile_picture || '/sample_profile.jpg'}
              alt={user.full_name || 'User'}
              loading='lazy'
              decoding='async'
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
                    onClick={handleFollowToggle}
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

            {user.bio && (
              <p className='text-gray-700 dark:text-gray-300 text-sm leading-relaxed max-w-2xl whitespace-pre-line'>
                {user.bio}
              </p>
            )}

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
                  Joined{' '}
                  {user.createdAt
                    ? moment(user.createdAt).fromNow()
                    : 'recently'}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className='flex items-center gap-6 pt-5 mt-5 border-t border-gray-100 dark:border-slate-800 text-sm'>
            <div className='flex items-center gap-1.5'>
              <span className='font-bold text-gray-900 dark:text-gray-100'>
                {userPosts?.length || 0}
              </span>
              <span className='text-gray-500 dark:text-gray-400'>Posts</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <span className='font-bold text-gray-900 dark:text-gray-100'>
                {user.followers?.length || 0}
              </span>
              <span className='text-gray-500 dark:text-gray-400'>
                Followers
              </span>
            </div>
            <div className='flex items-center gap-1.5'>
              <span className='font-bold text-gray-900 dark:text-gray-100'>
                {user.following?.length || 0}
              </span>
              <span className='text-gray-500 dark:text-gray-400'>
                Following
              </span>
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
          {isCurrentUser && (
            <button
              type='button'
              onClick={() => setActiveTab('saved')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer text-center ${
                activeTab === 'saved'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
            >
              Saved
            </button>
          )}
        </div>
      </div>

      {/* Tab Content Section */}
      <div className='space-y-6 flex flex-col items-center w-full'>
        {activeTab === 'posts' && (
          postsLoading ? (
            <div className='py-12 flex items-center justify-center text-indigo-600'>
              <Loader2 className='w-6 h-6 animate-spin' />
            </div>
          ) : userPosts && userPosts.length > 0 ? (
            userPosts.map((post) => (
              <PostCard key={post._id} post={post} />
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
              {mediaPosts.map((post) => (
                <div
                  key={post._id}
                  className='rounded-xl overflow-hidden aspect-square bg-gray-100 dark:bg-slate-800 shadow-sm border border-gray-100 dark:border-slate-800 group relative cursor-pointer'
                >
                  <img
                    src={post.image_urls[0]}
                    alt='Media post'
                    loading='lazy'
                    decoding='async'
                    className='w-full h-full object-cover group-hover:scale-105 transition duration-300'
                  />
                  <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white gap-2'>
                    <Heart className='w-5 h-5 fill-white' />
                    <span className='text-sm font-semibold'>
                      {post.likes_count?.length || 0}
                    </span>
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

        {activeTab === 'saved' && (
          savedLoading ? (
            <div className='py-12 flex items-center justify-center text-indigo-600'>
              <Loader2 className='w-6 h-6 animate-spin' />
            </div>
          ) : savedPosts && savedPosts.length > 0 ? (
            savedPosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))
          ) : (
            <div className='bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-8 text-center space-y-2 max-w-md w-full'>
              <div className='w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 rounded-full flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400'>
                <Bookmark className='w-6 h-6' />
              </div>
              <p className='text-gray-800 dark:text-gray-100 font-semibold text-sm pt-1'>
                No saved posts yet
              </p>
              <p className='text-gray-500 dark:text-gray-400 text-xs leading-relaxed'>
                Bookmark posts by tapping the 3-dots menu on any post in your feed or explore page to easily view them later.
              </p>
            </div>
          )
        )}
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        user={user}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  )
}

export default Profile
