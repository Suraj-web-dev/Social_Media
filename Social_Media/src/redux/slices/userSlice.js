import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import API from '../../api/axios'

// 1. Fetch user profile by ID or username
export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (userIdOrUsername, { rejectWithValue }) => {
    try {
      const res = await API.get(`/user/${userIdOrUsername}`)
      return res.data.user
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to load user profile.'
      )
    }
  }
)

// 2. Fetch suggested discover users
export const fetchDiscoverUsers = createAsyncThunk(
  'user/fetchDiscoverUsers',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/user/discover')
      return res.data.users
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to load suggested users.'
      )
    }
  }
)

// 3. Follow / Unfollow user
export const toggleFollowUser = createAsyncThunk(
  'user/toggleFollowUser',
  async (targetUserId, { rejectWithValue }) => {
    try {
      const res = await API.post(`/user/follow/${targetUserId}`)
      return {
        targetUserId,
        isFollowing: res.data.isFollowing,
        following: res.data.following,
      }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to follow/unfollow user.'
      )
    }
  }
)

// 4. Fetch populated connections, followers, and following of current user
export const fetchConnectionsData = createAsyncThunk(
  'user/fetchConnectionsData',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/user/connections/all')
      return res.data
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to load connections.'
      )
    }
  }
)

const initialState = {
  profileUser: null,
  discoverUsers: [],
  connectionsData: {
    followers: [],
    following: [],
    connections: [],
  },
  loading: false,
  connectionsLoading: false,
  error: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearProfileUser: (state) => {
      state.profileUser = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUserProfile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false
        state.profileUser = action.payload
        state.error = null
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // fetchDiscoverUsers
      .addCase(fetchDiscoverUsers.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchDiscoverUsers.fulfilled, (state, action) => {
        state.loading = false
        state.discoverUsers = action.payload || []
      })
      .addCase(fetchDiscoverUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // fetchConnectionsData
      .addCase(fetchConnectionsData.pending, (state) => {
        state.connectionsLoading = true
      })
      .addCase(fetchConnectionsData.fulfilled, (state, action) => {
        state.connectionsLoading = false
        state.connectionsData = {
          followers: action.payload.followers || [],
          following: action.payload.following || [],
          connections: action.payload.connections || [],
        }
      })
      .addCase(fetchConnectionsData.rejected, (state, action) => {
        state.connectionsLoading = false
        state.error = action.payload
      })

      // toggleFollowUser
      .addCase(toggleFollowUser.fulfilled, (state, action) => {
        const { targetUserId, isFollowing } = action.payload
        if (
          state.profileUser &&
          state.profileUser._id.toString() === targetUserId.toString()
        ) {
          state.profileUser.followers = state.profileUser.followers || []
          if (isFollowing) {
            state.profileUser.followers.push(targetUserId)
          } else {
            state.profileUser.followers = state.profileUser.followers.filter(
              (f) =>
                (typeof f === 'object'
                  ? f._id.toString()
                  : f.toString()) !== targetUserId.toString()
            )
          }
        }
      })
  },
})

export const { clearProfileUser } = userSlice.actions
export default userSlice.reducer
