import { createAsyncThunk } from "@reduxjs/toolkit";

import { commentApi } from "../../services/commentApi";
import { CreateCommentPayload, DeleteCommentPayload, GetCommentsParams, UpdateCommentPayload } from "../slices/commentSlice";

export const createComment = createAsyncThunk(
  "comments/createComment",
  async (payload: CreateCommentPayload, { rejectWithValue }) => {
    try {
      return await commentApi.createComment(payload);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to create comment");
    }
  }
);

export const getComments = createAsyncThunk(
  "comments/getComments",
  async (params: GetCommentsParams, { rejectWithValue }) => {
    try {
      return await commentApi.getComments(params);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch comments");
    }
  }
);

export const updateComment = createAsyncThunk(
  "comments/updateComment",
  async (payload: UpdateCommentPayload, { rejectWithValue }) => {
    try {
      return await commentApi.updateComment(payload);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to update comment");
    }
  }
);

export const deleteComment = createAsyncThunk(
  "comments/deleteComment",
  async (payload: DeleteCommentPayload, { rejectWithValue }) => {
    try {
      return await commentApi.deleteComment(payload);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to delete comment");
    }
  }
);
