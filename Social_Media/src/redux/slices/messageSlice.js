import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import API from '../../api/axios'

// 1. Fetch messages for a conversation
export const fetchMessages = createAsyncThunk(
  'message/fetchMessages',
  async (userId, { rejectWithValue }) => {
    try {
      const res = await API.get(`/message/${userId}`)
      return res.data.messages
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch messages.'
      )
    }
  }
)

// 2. Send message to user
export const sendMessage = createAsyncThunk(
  'message/sendMessage',
  async (args, { rejectWithValue }) => {
    try {
      const targetUserId = args?.userId || args?.receiverId
      if (!targetUserId) {
        throw new Error('Recipient ID is missing.')
      }

      let payload = args.formData || args.messageData
      if (!payload) {
        if (args.text || args.file) {
          const fd = new FormData()
          if (args.text) fd.append('text', args.text)
          if (args.file) fd.append('media', args.file)
          payload = fd
        } else {
          payload = { text: '' }
        }
      }

      // If messageData is passed as an object { text: '...' }
      if (!(payload instanceof FormData) && typeof payload === 'object') {
        const fd = new FormData()
        if (payload.text) fd.append('text', payload.text)
        if (payload.file || payload.media)
          fd.append('media', payload.file || payload.media)
        payload = fd
      }

      const isFormData = payload instanceof FormData
      const res = await API.post(`/message/send/${targetUserId}`, payload, {
        headers: isFormData
          ? { 'Content-Type': 'multipart/form-data' }
          : { 'Content-Type': 'application/json' },
      })
      return res.data.message
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Failed to send message.'
      )
    }
  }
)

// 3. Fetch recent conversations
export const fetchRecentConversations = createAsyncThunk(
  'message/fetchRecentConversations',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/message/conversations/recent')
      return res.data.conversations
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch conversations.'
      )
    }
  }
)

const initialState = {
  messages: [],
  conversations: [],
  onlineUsers: [],
  loading: false,
  sending: false,
  error: null,
}

const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    addRealtimeMessage: (state, action) => {
      const message = action.payload
      // Check for duplicates in active message thread
      const exists = state.messages.some((m) => m._id === message._id)
      if (!exists) {
        state.messages.push(message)
      }

      // Update conversations list and unread count
      const senderId =
        typeof message.sender === 'object' ? message.sender._id : message.sender

      const convIndex = state.conversations.findIndex((c) => {
        const convUserId =
          typeof c.user === 'object' ? c.user._id : c.user
        return convUserId?.toString() === senderId?.toString()
      })

      if (convIndex !== -1) {
        state.conversations[convIndex].lastMessage = message
        state.conversations[convIndex].unreadCount =
          (state.conversations[convIndex].unreadCount || 0) + 1
      } else if (typeof message.sender === 'object') {
        state.conversations.unshift({
          user: message.sender,
          lastMessage: message,
          unreadCount: 1,
        })
      }
    },
    clearConversationUnread: (state, action) => {
      const userId = action.payload
      const conv = state.conversations.find((c) => {
        const convUserId =
          typeof c.user === 'object' ? c.user._id : c.user
        return convUserId?.toString() === userId?.toString()
      })
      if (conv) {
        conv.unreadCount = 0
      }
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload || []
    },
    clearMessages: (state) => {
      state.messages = []
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchMessages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false
        state.messages = action.payload || []
        state.error = null
        // Mark conversation unread count as 0 when thread is fetched
        const targetUserId = action.meta.arg
        if (targetUserId) {
          const conv = state.conversations.find((c) => {
            const convUserId =
              typeof c.user === 'object' ? c.user._id : c.user
            return convUserId?.toString() === targetUserId?.toString()
          })
          if (conv) {
            conv.unreadCount = 0
          }
        }
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // sendMessage
      .addCase(sendMessage.pending, (state) => {
        state.sending = true
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sending = false
        if (action.payload) {
          const exists = state.messages.some((m) => m._id === action.payload._id)
          if (!exists) {
            state.messages.push(action.payload)
          }

          // Update last message in conversations list
          const targetUserId =
            action.meta.arg?.userId || action.meta.arg?.receiverId
          const conv = state.conversations.find((c) => {
            const convUserId =
              typeof c.user === 'object' ? c.user._id : c.user
            return convUserId?.toString() === targetUserId?.toString()
          })
          if (conv) {
            conv.lastMessage = action.payload
          }
        }
      })
      .addCase(sendMessage.rejected, (state) => {
        state.sending = false
      })

      // fetchRecentConversations
      .addCase(fetchRecentConversations.fulfilled, (state, action) => {
        state.conversations = action.payload || []
      })
  },
})

export const {
  addRealtimeMessage,
  clearConversationUnread,
  setOnlineUsers,
  clearMessages,
} = messageSlice.actions
export default messageSlice.reducer

