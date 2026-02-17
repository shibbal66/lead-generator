import { createSlice } from "@reduxjs/toolkit";

import { createComment, deleteComment, getComments, updateComment } from "../actions/commentActions";

export type CommentRecord = {
  id: string;
  userId: string;
  leadId: string;
  text: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateCommentPayload = {
  userId: string;
  leadId: string;
  text: string;
};

export type GetCommentsParams = {
  userId?: string;
  leadId?: string;
  page?: number;
  limit?: number;
};

export type UpdateCommentPayload = {
  commentId: string;
  text: string;
};

export type DeleteCommentPayload = {
  commentId: string;
};

type AsyncStatus = "idle" | "loading" | "succeeded" | "failed";

type CommentsState = {
  comments: CommentRecord[];
  total: number;
  page: number;
  limit: number;
  listStatus: AsyncStatus;
  createStatus: AsyncStatus;
  updateStatus: AsyncStatus;
  deleteStatus: AsyncStatus;
  error: string | null;
  successMessage: string | null;
};

const initialState: CommentsState = {
  comments: [],
  total: 0,
  page: 1,
  limit: 10,
  listStatus: "idle",
  createStatus: "idle",
  updateStatus: "idle",
  deleteStatus: "idle",
  error: null,
  successMessage: null
};

const commentSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    clearCommentMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getComments.pending, (state) => {
        state.listStatus = "loading";
        state.error = null;
      })
      .addCase(getComments.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.comments = action.payload.comments;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(getComments.rejected, (state, action) => {
        state.listStatus = "failed";
        state.error = (action.payload as string) || "Failed to fetch comments";
      })
      .addCase(createComment.pending, (state) => {
        state.createStatus = "loading";
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        state.successMessage = action.payload.message;
        state.comments = [action.payload.comment, ...state.comments];
        state.total += 1;
      })
      .addCase(createComment.rejected, (state, action) => {
        state.createStatus = "failed";
        state.error = (action.payload as string) || "Failed to create comment";
      })
      .addCase(updateComment.pending, (state) => {
        state.updateStatus = "loading";
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        state.successMessage = action.payload.message;
        state.comments = state.comments.map((comment) => (comment.id === action.payload.comment.id ? action.payload.comment : comment));
      })
      .addCase(updateComment.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.error = (action.payload as string) || "Failed to update comment";
      })
      .addCase(deleteComment.pending, (state) => {
        state.deleteStatus = "loading";
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.deleteStatus = "succeeded";
        state.successMessage = action.payload.message;
        state.comments = state.comments.filter((comment) => comment.id !== action.payload.commentId);
        if (state.total > 0) state.total -= 1;
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.error = (action.payload as string) || "Failed to delete comment";
      });
  }
});

export const { clearCommentMessages } = commentSlice.actions;
export default commentSlice.reducer;
