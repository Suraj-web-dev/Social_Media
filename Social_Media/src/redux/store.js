import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import userReducer from './slices/userSlice'
import postReducer from './slices/postSlice'
import storyReducer from './slices/storySlice'
import messageReducer from './slices/messageSlice'
import notificationReducer from './slices/notificationSlice'
import circleReducer from './slices/circleSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    post: postReducer,
    story: storyReducer,
    message: messageReducer,
    notification: notificationReducer,
    circle: circleReducer,
  },
})

export default store
