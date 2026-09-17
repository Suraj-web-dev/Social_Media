import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import API from '../../api/axios'

// 1. Fetch user circles
export const fetchUserCircles = createAsyncThunk(
  'circle/fetchUserCircles',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/circle/my')
      return res.data.circles
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to load circles.'
      )
    }
  }
)

// 2. Create circle
export const createCircle = createAsyncThunk(
  'circle/createCircle',
  async (circleData, { rejectWithValue }) => {
    try {
      const res = await API.post('/circle/create', circleData)
      return res.data.circle
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to create circle.'
      )
    }
  }
)

// 3. Update circle
export const updateCircle = createAsyncThunk(
  'circle/updateCircle',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await API.put(`/circle/${id}`, data)
      return res.data.circle
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to update circle.'
      )
    }
  }
)

// 4. Delete circle
export const deleteCircle = createAsyncThunk(
  'circle/deleteCircle',
  async (circleId, { rejectWithValue }) => {
    try {
      await API.delete(`/circle/${circleId}`)
      return circleId
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to delete circle.'
      )
    }
  }
)

// 5. Toggle member in circle
export const toggleCircleMember = createAsyncThunk(
  'circle/toggleCircleMember',
  async ({ circleId, memberId }, { rejectWithValue }) => {
    try {
      const res = await API.post(`/circle/${circleId}/toggle-member`, {
        memberId,
      })
      return res.data.circle
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to update circle member.'
      )
    }
  }
)

const initialState = {
  circles: [],
  loading: false,
  saving: false,
  error: null,
}

const circleSlice = createSlice({
  name: 'circle',
  initialState,
  reducers: {
    clearCircleError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUserCircles
      .addCase(fetchUserCircles.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserCircles.fulfilled, (state, action) => {
        state.loading = false
        state.circles = action.payload || []
        state.error = null
      })
      .addCase(fetchUserCircles.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // createCircle
      .addCase(createCircle.pending, (state) => {
        state.saving = true
      })
      .addCase(createCircle.fulfilled, (state, action) => {
        state.saving = false
        if (action.payload) {
          state.circles.push(action.payload)
        }
      })
      .addCase(createCircle.rejected, (state, action) => {
        state.saving = false
        state.error = action.payload
      })

      // updateCircle
      .addCase(updateCircle.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.circles.findIndex(
            (c) => c._id === action.payload._id
          )
          if (index !== -1) {
            state.circles[index] = action.payload
          }
        }
      })

      // deleteCircle
      .addCase(deleteCircle.fulfilled, (state, action) => {
        state.circles = state.circles.filter((c) => c._id !== action.payload)
      })

      // toggleCircleMember
      .addCase(toggleCircleMember.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.circles.findIndex(
            (c) => c._id === action.payload._id
          )
          if (index !== -1) {
            state.circles[index] = action.payload
          }
        }
      })
  },
})

export const { clearCircleError } = circleSlice.actions
export default circleSlice.reducer

