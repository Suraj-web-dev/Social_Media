import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { checkAuth } from '../redux/slices/authSlice'
import { fetchNotifications } from '../redux/slices/notificationSlice'
import { initializeSocket, disconnectSocket } from '../api/socket'
import Login from '../pages/Login'
import Feed from '../pages/Feed'
import Reels from '../pages/Reels'
import Messages from '../pages/Messages'
import ChatBox from '../pages/ChatBox'
import Connections from '../pages/Connections'
import Discover from '../pages/Discover'
import Profile from '../pages/Profile'
import CreatePost from '../pages/CreatePost'
import SinglePost from '../pages/SinglePost'
import Layout from '../pages/Layout'
import { Loader2 } from 'lucide-react'

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
  )
}

export default AppRoutes
