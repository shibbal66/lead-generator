import { createAsyncThunk } from "@reduxjs/toolkit";

import { userApi } from "../../services/userApi";
import { GetUsersParams, UpdateUserPasswordPayload, UpdateUserPayload } from "../slices/userSlice";

export const getUsers = createAsyncThunk("users/getUsers", async (params: GetUsersParams | undefined, { rejectWithValue }) => {
  try {
    return await userApi.getUsers(params);
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch users");
  }
});

export const getUserById = createAsyncThunk("users/getUserById", async (userId: string, { rejectWithValue }) => {
  try {
    return await userApi.getUserById(userId);
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch user");
  }
});

export const updateUser = createAsyncThunk("users/updateUser", async (payload: UpdateUserPayload, { rejectWithValue }) => {
  try {
    return await userApi.updateUser(payload);
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to update user");
  }
});

export const updateUserPassword = createAsyncThunk(
  "users/updateUserPassword",
  async (payload: UpdateUserPasswordPayload, { rejectWithValue }) => {
    try {
      return await userApi.updateUserPassword(payload);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to update password");
    }
  }
);

export const deleteUser = createAsyncThunk("users/deleteUser", async (userId: string, { rejectWithValue }) => {
  try {
    const response = await userApi.deleteUser(userId);
    return { userId, message: response.message };
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to delete user");
  }
});
