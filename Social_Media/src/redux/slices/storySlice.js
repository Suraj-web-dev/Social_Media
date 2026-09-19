import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import API from '../../api/axios'

// 1. Fetch active feed stories (last 24 hours)
export const fetchFeedStories = createAsyncThunk(
  'story/fetchFeedStories',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/story/feed')
      return res.data.stories || []
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to load stories.'
      )
    }
  }
)

// 2. Create new story (single or multiple slides)
export const createNewStory = createAsyncThunk(
  'story/createNewStory',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await API.post('/story/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      // Backend returns both story (first) and stories (array)
      return res.data.stories || (res.data.story ? [res.data.story] : [])
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to share story.'
      )
    }
  }
)

// 3. Mark story as viewed
export const viewStory = createAsyncThunk(
  'story/viewStory',
  async ({ storyId, currentUserId }, { rejectWithValue }) => {
    try {
      const res = await API.post(`/story/${storyId}/view`)
      return { storyId, currentUserId, viewsCount: res.data.viewsCount }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to record story view.'
      )
    }
  }
)

// 4. Like / Unlike a story
export const likeStory = createAsyncThunk(
  'story/likeStory',
  async ({ storyId, currentUserId }, { rejectWithValue }) => {
    try {
      const res = await API.post(`/story/${storyId}/like`)
      return {
        storyId,
        currentUserId,
        isLiked: res.data.isLiked,
        likesCount: res.data.likesCount,
      }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to like story.'
      )
    }
  }
)

// 5. Reply to story via DM
export const replyToStory = createAsyncThunk(
  'story/replyToStory',
  async ({ storyId, text, emoji }, { rejectWithValue }) => {
    try {
      const res = await API.post(`/story/${storyId}/reply`, { text, emoji })
      return res.data
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to send story reply.'
      )
    }
  }
)

// 6. Fetch viewers list of author's story
export const fetchStoryViewers = createAsyncThunk(
  'story/fetchStoryViewers',
  async (storyId, { rejectWithValue }) => {
    try {
      const res = await API.get(`/story/${storyId}/viewers`)
      return { storyId, viewers: res.data.viewers, likes: res.data.likes }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to load viewers.'
      )
    }
  }
)

// 7. Delete story
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
  viewersModalData: null, // { storyId, viewers: [], likes: [] }
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
    clearViewersModal: (state) => {
      state.viewersModalData = null
    },
    toggleStoryLikeOptimistic: (state, action) => {
      const { storyId, currentUserId } = action.payload || {}
      if (!storyId || !currentUserId) return
      const story = state.stories.find((s) => s._id === storyId)
      if (story) {
        if (!Array.isArray(story.likes)) story.likes = []
        const index = story.likes.findIndex(
          (l) => (typeof l === 'object' ? l._id?.toString() : l?.toString()) === currentUserId.toString()
        )
        if (index > -1) {
          story.likes.splice(index, 1)
        } else {
          story.likes.push(currentUserId)
        }
      }
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

      // createNewStory
      .addCase(createNewStory.pending, (state) => {
        state.uploading = true
        state.error = null
      })
      .addCase(createNewStory.fulfilled, (state, action) => {
        state.uploading = false
        if (Array.isArray(action.payload)) {
          state.stories.unshift(...action.payload)
        } else if (action.payload) {
          state.stories.unshift(action.payload)
        }
        state.error = null
      })
      .addCase(createNewStory.rejected, (state, action) => {
        state.uploading = false
        state.error = action.payload
      })

      // viewStory (optimistic & sync)
      .addCase(viewStory.fulfilled, (state, action) => {
        const { storyId, currentUserId } = action.payload
        const story = state.stories.find((s) => s._id === storyId)
        if (story) {
          if (!story.views) story.views = []
          const alreadyViewed = story.views.some((v) => {
            const uid = v.user?._id || v.user || v
            return uid?.toString() === currentUserId?.toString()
          })
          if (!alreadyViewed) {
            story.views.push({ user: currentUserId, viewedAt: new Date().toISOString() })
          }
        }
      })

      // likeStory (optimistic & sync)
      .addCase(likeStory.fulfilled, (state, action) => {
        const { storyId, currentUserId, isLiked } = action.payload
        const story = state.stories.find((s) => s._id === storyId)
        if (story) {
          if (!story.likes) story.likes = []
          if (isLiked) {
            if (!story.likes.some((l) => (l._id || l)?.toString() === currentUserId?.toString())) {
              story.likes.push(currentUserId)
            }
          } else {
            story.likes = story.likes.filter(
              (l) => (l._id || l)?.toString() !== currentUserId?.toString()
            )
          }
        }
      })

      // fetchStoryViewers
      .addCase(fetchStoryViewers.fulfilled, (state, action) => {
        state.viewersModalData = action.payload
      })

      // deleteExistingStory
      .addCase(deleteExistingStory.fulfilled, (state, action) => {
        state.stories = state.stories.filter((s) => s._id !== action.payload)
      })
  },
})

export const {
  clearStoryError,
  clearViewersModal,
  toggleStoryLikeOptimistic,
} = storySlice.actions
export default storySlice.reducer
