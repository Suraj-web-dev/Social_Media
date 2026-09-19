import React, { useEffect, Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { checkAuth } from '../redux/slices/authSlice'
import { fetchNotifications } from '../redux/slices/notificationSlice'
import { initializeSocket, disconnectSocket } from '../api/socket'
import Layout from '../pages/Layout'
import { Loader2 } from 'lucide-react'

// Code-split pages using dynamic imports (React.lazy)
const Login = lazy(() => import('../pages/Login'))
const Feed = lazy(() => import('../pages/Feed'))
const Reels = lazy(() => import('../pages/Reels'))
const Messages = lazy(() => import('../pages/Messages'))
const ChatBox = lazy(() => import('../pages/ChatBox'))
const Connections = lazy(() => import('../pages/Connections'))
const Discover = lazy(() => import('../pages/Discover'))
const Profile = lazy(() => import('../pages/Profile'))
const CreatePost = lazy(() => import('../pages/CreatePost'))
const SinglePost = lazy(() => import('../pages/SinglePost'))

// Lightweight page suspense fallback
const PageLoader = () => (
  <div className='w-full min-h-[60vh] flex flex-col items-center justify-center text-indigo-600 dark:text-indigo-400 gap-3'>
    <Loader2 className='w-7 h-7 animate-spin' />
    <span className='text-xs font-medium text-gray-500 dark:text-gray-400 animate-pulse'>
      Loading...
    </span>
  </div>
)

const AppRoutes = () => {
  const dispatch = useDispatch()
  const { user, loading } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch])

  // Initialize Socket.io connection & fetch notifications when user is authenticated
  useEffect(() => {
    if (user?._id) {
      initializeSocket(user._id)
      dispatch(fetchNotifications())
    } else {
      disconnectSocket()
    }
  }, [user?._id, dispatch])

  if (loading) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-indigo-600 gap-3'>
        <Loader2 className='w-8 h-8 animate-spin' />
        <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>Loading PingUp...</p>
      </div>
    )
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path='/' element={!user ? <Login /> : <Layout />}>
          <Route index element={<Feed />} />
          <Route path='reels' element={<Reels />} />
          <Route path='reels/:reelId' element={<SinglePost />} />
          <Route path='post/:postId' element={<SinglePost />} />
          <Route path='messages' element={<Messages />} />
          <Route path='messages/:userId' element={<ChatBox />} />
          <Route path='connections' element={<Connections />} />
          <Route path='discover' element={<Discover />} />
          <Route path='profile' element={<Profile />} />
          <Route path='profile/:profileId' element={<Profile />} />
          <Route path='create-post' element={<CreatePost />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default AppRoutes
