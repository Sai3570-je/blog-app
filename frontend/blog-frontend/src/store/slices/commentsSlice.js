import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import commentsService from '../../services/commentsService';

const initialState = {
  comments: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalComments: 0,
    hasNext: false,
    hasPrev: false,
  },
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Get comments for a post
export const getComments = createAsyncThunk(
  'comments/getComments',
  async ({ postId, page = 1, limit = 20, sort = '-createdAt' }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      return await commentsService.getComments({ postId, page, limit, sort }, token);
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

// Create comment
export const createComment = createAsyncThunk(
  'comments/createComment',
  async ({ postId, content }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      return await commentsService.createComment({ postId, content }, token);
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

// Update comment
export const updateComment = createAsyncThunk(
  'comments/updateComment',
  async ({ commentId, content }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      return await commentsService.updateComment({ commentId, content }, token);
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

// Delete comment
export const deleteComment = createAsyncThunk(
  'comments/deleteComment',
  async (commentId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      await commentsService.deleteComment(commentId, token);
      return commentId;
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

export const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearComments: (state) => {
      state.comments = [];
      state.pagination = {
        currentPage: 1,
        totalPages: 1,
        totalComments: 0,
        hasNext: false,
        hasPrev: false,
      };
    },
    clearError: (state) => {
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getComments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getComments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.comments = action.payload.comments;
        state.pagination = action.payload.pagination;
      })
      .addCase(getComments.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createComment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.comments.unshift(action.payload);
        state.pagination.totalComments += 1;
      })
      .addCase(createComment.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateComment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const index = state.comments.findIndex(comment => comment._id === action.payload._id);
        if (index !== -1) {
          state.comments[index] = action.payload;
        }
      })
      .addCase(updateComment.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteComment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.comments = state.comments.filter(comment => comment._id !== action.payload);
        state.pagination.totalComments = Math.max(0, state.pagination.totalComments - 1);
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearComments, clearError } = commentsSlice.actions;
export default commentsSlice.reducer;

