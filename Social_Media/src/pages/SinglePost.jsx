import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSinglePost } from '../redux/slices/postSlice'
import PostCard from './PostCard'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

const SinglePost = () => {
  const { postId, reelId } = useParams()
  const targetId = postId || reelId
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reduxPosts = useSelector((state) => [
    ...state.post.posts,
    ...state.post.userPosts,
    ...state.post.savedPosts,
    ...state.post.reels,
  ])

  useEffect(() => {
    if (!targetId) return

    // First check redux cache
    const existing = reduxPosts.find((p) => p._id === targetId)
    if (existing) {
      setPost(existing)
      setLoading(false)
    }

    // Fetch fresh from backend
    dispatch(fetchSinglePost(targetId))
      .unwrap()
      .then((data) => {
        setPost(data)
        setLoading(false)
      })
      .catch((err) => {
        if (!existing) {
          setError(typeof err === 'string' ? err : 'Post not found or has been deleted.')
        }
        setLoading(false)
      })
  }, [targetId, dispatch])

  return (
    <div className='w-full max-w-2xl mx-auto py-4 px-3 sm:px-4 space-y-4'>
      {/* Back button header */}
      <div className='flex items-center gap-3'>
        <motion.button
          whileTap={{ scale: 0.9 }}
          type='button'
          onClick={() => navigate(-1)}
          className='p-2 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-xs flex items-center gap-1.5 text-xs font-semibold'
        >
          <ArrowLeft className='w-4 h-4' />
          <span>Back</span>
        </motion.button>
        <h1 className='text-base font-bold text-gray-900 dark:text-white'>
          Post
        </h1>
      </div>

      {/* Content */}
      {loading && !post ? (
        <div className='flex flex-col items-center justify-center py-24 text-indigo-600 gap-3'>
          <Loader2 className='w-8 h-8 animate-spin' />
          <p className='text-xs text-gray-500 dark:text-gray-400'>Loading post...</p>
        </div>
      ) : error && !post ? (
        <div className='bg-white dark:bg-slate-900 rounded-3xl p-8 text-center space-y-3 border border-gray-100 dark:border-slate-800 shadow-sm'>
          <div className='w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-500 mx-auto flex items-center justify-center'>
            <AlertCircle className='w-6 h-6' />
          </div>
          <h2 className='text-base font-bold text-gray-900 dark:text-white'>
            Post Not Available
          </h2>
          <p className='text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto'>
            {error}
          </p>
          <button
            type='button'
            onClick={() => navigate('/')}
            className='px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer'
          >
            Go to Feed
          </button>
        </div>
      ) : post ? (
        <PostCard post={post} />
      ) : null}
    </div>
  )
}

export default SinglePost

