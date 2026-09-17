import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import API from '../../api/axios'

// 1. Fetch active feed stories (last 24 hours)
export const fetchFeedStories = createAsyncThunk(
  'story/fetchFeedStories',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/story/feed')
      return res.data.stories
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to load stories.'
      )
    }
  }
)

// 2. Create a new story (supports text or photo/video file via FormData)
export const createNewStory = createAsyncThunk(
  'story/createNewStory',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await API.post('/story/create', formData)
      return res.data.story
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to share story.'
      )
    }
  }
)

// 3. Delete story
export const deleteExistingStory = createAsyncThunk(
  'story/deleteExistingStory',
  async (storyId, { rejectWithValue }) => {
    try {
      await API.delete(`/story/${storyId}`)
      return storyId
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to delete story.'
      )
    }
  }
)

const initialState = {
  stories: [],
  loading: false,
  uploading: false,
  error: null,
}

const storySlice = createSlice({
  name: 'story',
  initialState,
  reducers: {
    clearStoryError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchFeedStories
      .addCase(fetchFeedStories.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchFeedStories.fulfilled, (state, action) => {
        state.loading = false
        state.stories = action.payload || []
        state.error = null
      })
      .addCase(fetchFeedStories.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // createNewStory (instantly prepend new story)
      .addCase(createNewStory.pending, (state) => {
        state.uploading = true
        state.error = null
      })
      .addCase(createNewStory.fulfilled, (state, action) => {
        state.uploading = false
        if (action.payload) {
          state.stories.unshift(action.payload)
        }
        state.error = null
      })
      .addCase(createNewStory.rejected, (state, action) => {
        state.uploading = false
        state.error = action.payload
      })

      // deleteExistingStory
      .addCase(deleteExistingStory.fulfilled, (state, action) => {
        state.stories = state.stories.filter((s) => s._id !== action.payload)
      })
  },
})

export const { clearStoryError } = storySlice.actions
export default storySlice.reducer

