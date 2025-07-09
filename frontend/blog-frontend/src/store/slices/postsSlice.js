import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import postsService from '../../services/postsService';

const initialState = {
  posts: [],
  currentPost: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalPosts: 0,
    hasNext: false,
    hasPrev: false,
  },
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
  lastOperation: null, // Track the last successful operation
};

// Get all posts
export const getPosts = createAsyncThunk(
  'posts/getPosts',
  async ({ page = 1, limit = 10, sort = '-createdAt', search = '' }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      return await postsService.getPosts({ page, limit, sort, search }, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get single post
export const getPost = createAsyncThunk(
  'posts/getPost',
  async (postId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      return await postsService.getPost(postId, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create post
export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      return await postsService.createPost(postData, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update post
export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({ postId, postData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      return await postsService.updatePost(postId, postData, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete post
export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (postId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      await postsService.deletePost(postId, token);
      return postId;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Like/unlike post
export const toggleLike = createAsyncThunk(
  'posts/toggleLike',
  async (postId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      return await postsService.toggleLike(postId, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
      state.lastOperation = null;
    },
    clearCurrentPost: (state) => {
      state.currentPost = null;
    },
    clearError: (state) => {
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPosts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = action.payload.posts;
        state.pagination = action.payload.pagination;
        state.lastOperation = 'getPosts';
      })
      .addCase(getPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getPost.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPost = action.payload;
        state.lastOperation = 'getPost';
      })
      .addCase(getPost.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createPost.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.posts.unshift(action.payload);
        state.lastOperation = 'createPost';
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updatePost.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentPost = action.payload;
        state.lastOperation = 'updatePost';
        const index = state.posts.findIndex(post => post._id === action.payload._id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deletePost.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.posts = state.posts.filter(post => post._id !== action.payload);
        state.currentPost = null;
        state.lastOperation = 'deletePost';
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { postId, liked, likesCount } = action.payload;
        
        // Update in posts array
        const postIndex = state.posts.findIndex(post => post._id === postId);
        if (postIndex !== -1) {
          state.posts[postIndex].isLiked = liked;
          state.posts[postIndex].likesCount = likesCount;
        }
        
        // Update current post if it's the same
        if (state.currentPost && state.currentPost._id === postId) {
          state.currentPost.isLiked = liked;
          state.currentPost.likesCount = likesCount;
        }
      })
      .addCase(toggleLike.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearCurrentPost, clearError } = postsSlice.actions;
export default postsSlice.reducer;

