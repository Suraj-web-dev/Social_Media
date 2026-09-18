import { io } from 'socket.io-client'
import { store } from '../redux/store'
import {
  addRealtimeMessage,
  setOnlineUsers,
} from '../redux/slices/messageSlice'
import { receiveNotification } from '../redux/slices/notificationSlice'
import { showToast } from '../utils/toast'

let SOCKET_URL = import.meta.env.VITE_BACKEND_URL
  ? import.meta.env.VITE_BACKEND_URL.replace(/\/api\/?$/, '')
  : (import.meta.env.PROD
      ? 'https://social-media-012l.onrender.com'
      : 'http://localhost:5000')

SOCKET_URL = SOCKET_URL.replace('social-media-0121.onrender.com', 'social-media-012l.onrender.com')

let socket = null
let currentConnectedUserId = null

export const initializeSocket = (userId) => {
  if (!userId) return null

  // If already connected with the same user, reuse existing active socket
  if (socket && currentConnectedUserId === userId && (socket.connected || socket.connecting)) {
    return socket
  }

  if (socket) {
    socket.disconnect()
  }

  currentConnectedUserId = userId

  socket = io(SOCKET_URL, {
    query: { userId },
    withCredentials: true,
    transports: ['polling', 'websocket'], // Starts with HTTP polling and upgrades cleanly to websocket
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    timeout: 20000,
  })

  socket.on('connect', () => {
    console.log('⚡ Socket.io connected:', socket.id)
  })

  socket.on('getOnlineUsers', (users) => {
    store.dispatch(setOnlineUsers(users))
  })

  socket.on('receiveMessage', (message) => {
    store.dispatch(addRealtimeMessage(message))
  })

  socket.on('newNotification', (notification) => {
    store.dispatch(receiveNotification(notification))
    const sender = notification.sender?.full_name || 'Someone'
    let text = `${sender} interacted with your account`
    if (notification.type === 'like_post') text = `${sender} liked your post ❤️`
    else if (notification.type === 'comment_post') text = `${sender} commented on your post 💬`
    else if (notification.type === 'like_comment') text = `${sender} liked your comment ❤️`
    else if (notification.type === 'follow') text = `${sender} started following you 👤`
    showToast.info(text)
  })

  socket.on('connect_error', (err) => {
    console.warn('Socket.io connection warning:', err.message)
  })

  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
    currentConnectedUserId = null
  }
}

export const getSocket = () => socket
