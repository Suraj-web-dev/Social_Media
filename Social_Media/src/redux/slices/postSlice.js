import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import API from '../../api/axios'

// 1. Fetch feed posts (recent first)
export const fetchFeedPosts = createAsyncThunk(
  'post/fetchFeedPosts',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/post/feed')
      return res.data.posts
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to load feed posts.'
      )
    }
  }
)

// 2. Fetch posts of a specific user
export const fetchUserPosts = createAsyncThunk(
  'post/fetchUserPosts',
  async (userId, { rejectWithValue }) => {
    try {
      const res = await API.get(`/post/user/${userId}`)
      return res.data.posts
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to load user posts.'
      )
    }
  }
)

// 3. Create a new post (handles media files via FormData)
export const createNewPost = createAsyncThunk(
  'post/createNewPost',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await API.post('/post/create', formData)
      return res.data.post
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to publish post.'
      )
    }
  }
)

// 4. Like / Unlike a post
export const likeUnlikePost = createAsyncThunk(
  'post/likeUnlikePost',
  async (postId, { rejectWithValue }) => {
    try {
      const res = await API.post(`/post/like/${postId}`)
      return { postId, likes_count: res.data.likes_count, isLiked: res.data.isLiked }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to toggle like.'
      )
    }
  }
)

// 5. Add comment to post
export const addCommentToPost = createAsyncThunk(
  'post/addCommentToPost',
  async ({ postId, text }, { rejectWithValue }) => {
    try {
      const res = await API.post(`/post/comment/${postId}`, { text })
      return { postId, comments: res.data.comments }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to add comment.'
      )
    }
  }
)

// 5b. Delete comment from post
export const deleteCommentFromPost = createAsyncThunk(
  'post/deleteCommentFromPost',
  async ({ postId, commentId }, { rejectWithValue }) => {
    try {
      const res = await API.delete(`/post/comment/${postId}/${commentId}`)
      return { postId, comments: res.data.comments }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to delete comment.'
      )
    }
  }
)

// 5c. Like / Unlike comment
export const likeUnlikeComment = createAsyncThunk(
  'post/likeUnlikeComment',
  async ({ postId, commentId }, { rejectWithValue }) => {
    try {
      const res = await API.post(`/post/comment/like/${postId}/${commentId}`)
      return { postId, comments: res.data.comments, isLiked: res.data.isLiked }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to toggle comment like.'
      )
    }
  }
)

// 5d. Edit comment
export const editCommentInPost = createAsyncThunk(
  'post/editCommentInPost',
  async ({ postId, commentId, text }, { rejectWithValue }) => {
    try {
      const res = await API.put(`/post/comment/${postId}/${commentId}`, { text })
      return { postId, comments: res.data.comments }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to edit comment.'
      )
    }
  }
)

// 6. Delete post
export const deleteExistingPost = createAsyncThunk(
  'post/deleteExistingPost',
  async (postId, { rejectWithValue }) => {
    try {
      await API.delete(`/post/${postId}`)
      return postId
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to delete post.'
      )
    }
  }
)

// 7. Toggle Bookmark / Save Post
export const bookmarkPost = createAsyncThunk(
  'post/bookmarkPost',
  async (postId, { rejectWithValue }) => {
    try {
      const res = await API.post(`/post/bookmark/${postId}`)
      return { postId, isBookmarked: res.data.isBookmarked, saved_posts: res.data.saved_posts }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to toggle bookmark.'
      )
    }
  }
)

// 8. Fetch Saved / Bookmarked Posts
export const fetchSavedPosts = createAsyncThunk(
  'post/fetchSavedPosts',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/post/saved')
      return res.data.posts
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to load saved posts.'
      )
    }
  }
)

// 9. Fetch Video Reels
export const fetchReels = createAsyncThunk(
  'post/fetchReels',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/post/reels')
      return res.data.reels || []
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to load reels.'
      )
    }
  }
)

// 10. Fetch Single Post by ID
export const fetchSinglePost = createAsyncThunk(
  'post/fetchSinglePost',
  async (postId, { rejectWithValue }) => {
    try {
      const res = await API.get(`/post/single/${postId}`)
      return res.data.post
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to load post.'
      )
    }
  }
)


const initialState = {
  posts: [],
  userPosts: [],
  savedPosts: [],
  reels: [],
  loading: false,
  savedLoading: false,
  reelsLoading: false,
  publishing: false,
  deleting: false,
  error: null,
}

const postSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    clearPostError: (state) => {
      state.error = null
    },
    clearUserPosts: (state) => {
      state.userPosts = []
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchFeedPosts
      .addCase(fetchFeedPosts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchFeedPosts.fulfilled, (state, action) => {
        state.loading = false
        state.posts = action.payload || []
        state.error = null
      })
      .addCase(fetchFeedPosts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // fetchUserPosts
      .addCase(fetchUserPosts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.loading = false
        state.userPosts = action.payload || []
        state.error = null
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // createNewPost (Recent post instantly added to top!)
      .addCase(createNewPost.pending, (state) => {
        state.publishing = true
        state.error = null
      })
      .addCase(createNewPost.fulfilled, (state, action) => {
        state.publishing = false
        if (action.payload) {
          state.posts.unshift(action.payload)
          state.userPosts.unshift(action.payload)
          if (action.payload.video_urls && action.payload.video_urls.length > 0) {
            state.reels.unshift(action.payload)
          }
        }
        state.error = null
      })
      .addCase(createNewPost.rejected, (state, action) => {
        state.publishing = false
        state.error = action.payload
      })

      // likeUnlikePost
      .addCase(likeUnlikePost.fulfilled, (state, action) => {
        const { postId, likes_count } = action.payload
        const post = state.posts.find((p) => p._id === postId)
        if (post) post.likes_count = likes_count
        const userPost = state.userPosts.find((p) => p._id === postId)
        if (userPost) userPost.likes_count = likes_count
        const reel = state.reels.find((p) => p._id === postId)
        if (reel) reel.likes_count = likes_count
        const savedPost = state.savedPosts.find((p) => p._id === postId)
        if (savedPost) savedPost.likes_count = likes_count
      })

      // addCommentToPost
      .addCase(addCommentToPost.fulfilled, (state, action) => {
        const { postId, comments } = action.payload
        const post = state.posts.find((p) => p._id === postId)
        if (post) post.comments = comments
        const userPost = state.userPosts.find((p) => p._id === postId)
        if (userPost) userPost.comments = comments
        const reel = state.reels.find((p) => p._id === postId)
        if (reel) reel.comments = comments
        const savedPost = state.savedPosts.find((p) => p._id === postId)
        if (savedPost) savedPost.comments = comments
      })

      // deleteCommentFromPost
      .addCase(deleteCommentFromPost.fulfilled, (state, action) => {
        const { postId, comments } = action.payload
        const post = state.posts.find((p) => p._id === postId)
        if (post) post.comments = comments
        const userPost = state.userPosts.find((p) => p._id === postId)
        if (userPost) userPost.comments = comments
        const reel = state.reels.find((p) => p._id === postId)
        if (reel) reel.comments = comments
        const savedPost = state.savedPosts.find((p) => p._id === postId)
        if (savedPost) savedPost.comments = comments
      })

      // likeUnlikeComment
      .addCase(likeUnlikeComment.fulfilled, (state, action) => {
        const { postId, comments } = action.payload
        const post = state.posts.find((p) => p._id === postId)
        if (post) post.comments = comments
        const userPost = state.userPosts.find((p) => p._id === postId)
        if (userPost) userPost.comments = comments
        const reel = state.reels.find((p) => p._id === postId)
        if (reel) reel.comments = comments
        const savedPost = state.savedPosts.find((p) => p._id === postId)
        if (savedPost) savedPost.comments = comments
      })

      // editCommentInPost
      .addCase(editCommentInPost.fulfilled, (state, action) => {
        const { postId, comments } = action.payload
        const post = state.posts.find((p) => p._id === postId)
        if (post) post.comments = comments
        const userPost = state.userPosts.find((p) => p._id === postId)
        if (userPost) userPost.comments = comments
        const reel = state.reels.find((p) => p._id === postId)
        if (reel) reel.comments = comments
        const savedPost = state.savedPosts.find((p) => p._id === postId)
        if (savedPost) savedPost.comments = comments
      })

      // deleteExistingPost
      .addCase(deleteExistingPost.pending, (state) => {
        state.deleting = true
      })
      .addCase(deleteExistingPost.fulfilled, (state, action) => {
        state.deleting = false
        state.posts = state.posts.filter((p) => p._id !== action.payload)
        state.userPosts = state.userPosts.filter((p) => p._id !== action.payload)
        state.savedPosts = state.savedPosts.filter((p) => p._id !== action.payload)
        state.reels = state.reels.filter((p) => p._id !== action.payload)
      })
      .addCase(deleteExistingPost.rejected, (state, action) => {
        state.deleting = false
        state.error = action.payload
      })

      // fetchSavedPosts
      .addCase(fetchSavedPosts.pending, (state) => {
        state.savedLoading = true
      })
      .addCase(fetchSavedPosts.fulfilled, (state, action) => {
        state.savedLoading = false
        state.savedPosts = action.payload || []
      })
      .addCase(fetchSavedPosts.rejected, (state, action) => {
        state.savedLoading = false
        state.error = action.payload
      })

      // fetchReels
      .addCase(fetchReels.pending, (state) => {
        state.reelsLoading = true
      })
      .addCase(fetchReels.fulfilled, (state, action) => {
        state.reelsLoading = false
        state.reels = action.payload || []
      })
      .addCase(fetchReels.rejected, (state, action) => {
        state.reelsLoading = false
        state.error = action.payload
      })

      // bookmarkPost
      .addCase(bookmarkPost.fulfilled, (state, action) => {
        const { postId, isBookmarked } = action.payload
        if (!isBookmarked) {
          // Removed from bookmarks
          state.savedPosts = state.savedPosts.filter((p) => p._id !== postId)
        } else {
          // If the post is currently in feed or userPosts, prepend to savedPosts
          const found =
            state.posts.find((p) => p._id === postId) ||
            state.userPosts.find((p) => p._id === postId)
          if (found && !state.savedPosts.some((p) => p._id === postId)) {
            state.savedPosts.unshift(found)
          }
        }
      })
  },
})

export const { clearPostError, clearUserPosts } = postSlice.actions
export default postSlice.reducer
