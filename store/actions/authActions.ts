import { createAsyncThunk } from "@reduxjs/toolkit";

import { authApi } from "../../services/authApi";
import { isManualSignOut } from "../storage";
import {
  ForgotPasswordPayload,
  ResetPasswordPayload,
  SignInPayload,
  SignUpPayload,
  VerifyAccountPayload
} from "../slices/authTypes";

export const signIn = createAsyncThunk("auth/signIn", async (payload: SignInPayload, { rejectWithValue }) => {
  try {
    await authApi.login(payload);
    return await authApi.getMe();
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Sign in failed");
  }
});

export const signUp = createAsyncThunk("auth/signUp", async (payload: SignUpPayload, { rejectWithValue }) => {
  try {
    return await authApi.signup(payload);
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Sign up failed");
  }
});

export const verifyAccount = createAsyncThunk(
  "auth/verifyAccount",
  async (payload: VerifyAccountPayload, { rejectWithValue }) => {
    try {
      return await authApi.verifyAccount(payload);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Account verification failed");
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (payload: ForgotPasswordPayload, { rejectWithValue }) => {
    try {
      return await authApi.forgotPassword(payload);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Forgot password failed");
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (payload: ResetPasswordPayload, { rejectWithValue }) => {
    try {
      return await authApi.resetPassword(payload);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Reset password failed");
    }
  }
);

export const bootstrapAuth = createAsyncThunk("auth/bootstrapAuth", async (_, { rejectWithValue }) => {
  const path = window.location.pathname.toLowerCase();
  const publicAuthPaths = ["/sign-in", "/signin", "/login", "/signup", "/forgot-password", "/reset-password"];
  if (publicAuthPaths.some((publicPath) => path.startsWith(publicPath))) {
    return rejectWithValue("Public auth route");
  }

  if (isManualSignOut()) {
    return rejectWithValue("Signed out");
  }

  try {
    return await authApi.getMe();
  } catch {
    try {
      await authApi.refreshToken();
      return await authApi.getMe();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Authentication check failed");
    }
  }
});

export const logout = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await authApi.logout();
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Logout failed");
  }
});
