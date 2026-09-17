import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import API from '../../api/axios'

// 1. Fetch user notifications
export const fetchNotifications = createAsyncThunk(
  'notification/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/notifications')
      return {
        notifications: res.data.notifications || [],
        unreadCount: res.data.unreadCount || 0,
      }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch notifications.'
      )
    }
  }
)

// 2. Mark single notification as read
export const markNotificationAsRead = createAsyncThunk(
  'notification/markNotificationAsRead',
  async (id, { rejectWithValue }) => {
    try {
      const res = await API.put(`/notifications/read/${id}`)
      return {
        notification: res.data.notification,
        unreadCount: res.data.unreadCount,
      }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to update notification.'
      )
    }
  }
)

// 3. Mark all notifications as read
export const markAllNotificationsAsRead = createAsyncThunk(
  'notification/markAllNotificationsAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await API.put('/notifications/read-all')
      return true
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to mark all notifications as read.'
      )
    }
  }
)

// 4. Delete notification
export const deleteNotification = createAsyncThunk(
  'notification/deleteNotification',
  async (id, { rejectWithValue }) => {
    try {
      const res = await API.delete(`/notifications/${id}`)
      return {
        deletedId: id,
        unreadCount: res.data.unreadCount,
      }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to delete notification.'
      )
    }
  }
)

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
}

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    // Real-time notification received via socket
    receiveNotification: (state, action) => {
      const newNotif = action.payload
      if (!newNotif) return
      // Prevent duplicate
      const exists = state.notifications.some((n) => n._id === newNotif._id)
      if (!exists) {
        state.notifications.unshift(newNotif)
        state.unreadCount += 1
      }
    },
    clearNotifications: (state) => {
      state.notifications = []
      state.unreadCount = 0
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchNotifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false
        state.notifications = action.payload.notifications
        state.unreadCount = action.payload.unreadCount
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // markNotificationAsRead
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const { notification, unreadCount } = action.payload
        const index = state.notifications.findIndex(
          (n) => n._id === notification._id
        )
        if (index !== -1) {
          state.notifications[index].isRead = true
        }
        state.unreadCount = unreadCount
      })

      // markAllNotificationsAsRead
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach((n) => {
          n.isRead = true
        })
        state.unreadCount = 0
      })

      // deleteNotification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const { deletedId, unreadCount } = action.payload
        state.notifications = state.notifications.filter(
          (n) => n._id !== deletedId
        )
        state.unreadCount = unreadCount
      })
  },
})

export const { receiveNotification, clearNotifications } =
  notificationSlice.actions
export default notificationSlice.reducer

