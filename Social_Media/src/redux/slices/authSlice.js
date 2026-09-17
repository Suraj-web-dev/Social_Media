import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import API from '../../api/axios'

// 1. Check current authenticated user session
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/auth/me')
      return res.data.user
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Session expired')
    }
  }
)

// 2. Register user
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await API.post('/auth/register', formData)
      return res.data.user
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Registration failed. Please try again.'
      )
    }
  }
)

// 3. Login user
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await API.post('/auth/login', credentials)
      return res.data.user
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Invalid email or password.'
      )
    }
  }
)

// 4. Logout user
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await API.post('/auth/logout')
      return null
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to log out.'
      )
    }
  }
)

// 5. Delete user account permanently
export const deleteAccount = createAsyncThunk(
  'auth/deleteAccount',
  async (_, { rejectWithValue }) => {
    try {
      await API.delete('/auth/delete')
      return null
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to delete account.'
      )
    }
  }
)

// 6. Update user profile (handles Multer FormData or JSON)
export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await API.put('/user/update', formData, {
        headers:
          formData instanceof FormData
            ? { 'Content-Type': 'multipart/form-data' }
            : { 'Content-Type': 'application/json' },
      })
      return res.data.user
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to update profile.'
      )
    }
  }
)

const initialState = {
  user: null,
  loading: true,
  actionLoading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null
    },
    setUser: (state, action) => {
      state.user = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // checkAuth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.error = null
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false
        state.user = null
      })

      // registerUser
      .addCase(registerUser.pending, (state) => {
        state.actionLoading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.actionLoading = false
        state.user = action.payload
        state.error = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload
      })

      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.actionLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.actionLoading = false
        state.user = action.payload
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload
      })

      // logoutUser
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.error = null
      })

      // deleteAccount
      .addCase(deleteAccount.fulfilled, (state) => {
        state.user = null
        state.error = null
      })

      // updateUserProfile
      .addCase(updateUserProfile.pending, (state) => {
        state.actionLoading = true
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.actionLoading = false
        state.user = action.payload
        state.error = null
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload
      })

      // Synchronize follow/unfollow with logged-in user following list
      .addCase('user/toggleFollowUser/fulfilled', (state, action) => {
        const { targetUserId, isFollowing } = action.payload || {}
        if (state.user && targetUserId) {
          state.user.following = state.user.following || []
          if (isFollowing) {
            const alreadyFollowing = state.user.following.some(
              (id) =>
                (typeof id === 'object'
                  ? id._id.toString()
                  : id.toString()) === targetUserId.toString()
            )
            if (!alreadyFollowing) {
              state.user.following.push(targetUserId)
            }
          } else {
            state.user.following = state.user.following.filter(
              (id) =>
                (typeof id === 'object'
                  ? id._id.toString()
                  : id.toString()) !== targetUserId.toString()
            )
          }
        }
      })

      // Synchronize saved/bookmarked posts in logged-in user state
      .addCase('post/bookmarkPost/fulfilled', (state, action) => {
        const { saved_posts, postId, isBookmarked } = action.payload || {}
        if (state.user) {
          if (saved_posts) {
            state.user.saved_posts = saved_posts
          } else if (postId) {
            state.user.saved_posts = state.user.saved_posts || []
            if (isBookmarked) {
              if (!state.user.saved_posts.includes(postId)) {
                state.user.saved_posts.push(postId)
              }
            } else {
              state.user.saved_posts = state.user.saved_posts.filter(
                (id) => (typeof id === 'object' ? id._id : id) !== postId
              )
            }
          }
        }
      })
  },
})

export const { clearAuthError, setUser } = authSlice.actions
export default authSlice.reducer
