import { createSlice } from "@reduxjs/toolkit";
import {
  bootstrapAuth,
  forgotPassword,
  logout,
  resetPassword,
  signIn,
  signUp,
  verifyAccount
} from "../actions/authActions";
import {
  clearAuthUser,
  clearManualSignOut,
  loadAuthUser,
  saveAuthUser,
  setManualSignOut
} from "../storage";
import { AuthUser } from "./authTypes";

const persistedUser = loadAuthUser();

type AsyncStatus = "idle" | "loading" | "succeeded" | "failed";

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  bootstrapStatus: AsyncStatus;
  signInStatus: AsyncStatus;
  signUpStatus: AsyncStatus;
  verifyStatus: AsyncStatus;
  forgotStatus: AsyncStatus;
  resetStatus: AsyncStatus;
  error: string | null;
  signUpMessage: string | null;
  verifyMessage: string | null;
  forgotMessage: string | null;
  resetMessage: string | null;
};

const initialState: AuthState = {
  user: persistedUser,
  isAuthenticated: Boolean(persistedUser),
  bootstrapStatus: "idle",
  signInStatus: "idle",
  signUpStatus: "idle",
  verifyStatus: "idle",
  forgotStatus: "idle",
  resetStatus: "idle",
  error: null,
  signUpMessage: null,
  verifyMessage: null,
  forgotMessage: null,
  resetMessage: null
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateAuthUserLocal: (state, action: { payload: Partial<AuthUser> }) => {
      if (!state.user) return;
      state.user = { ...state.user, ...action.payload };
      saveAuthUser(state.user);
    },
    signOutLocal: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.signInStatus = "idle";
      state.signUpStatus = "idle";
      state.verifyStatus = "idle";
      state.forgotStatus = "idle";
      state.resetStatus = "idle";
      state.signUpMessage = null;
      state.verifyMessage = null;
      state.forgotMessage = null;
      state.resetMessage = null;
      clearAuthUser();
      setManualSignOut();
    },
    clearAuthMessages: (state) => {
      state.error = null;
      state.signUpMessage = null;
      state.verifyMessage = null;
      state.forgotMessage = null;
      state.resetMessage = null;
      state.signUpStatus = "idle";
      state.verifyStatus = "idle";
      state.forgotStatus = "idle";
      state.resetStatus = "idle";
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(signIn.pending, (state) => {
        state.signInStatus = "loading";
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.signInStatus = "succeeded";
        state.user = action.payload;
        state.isAuthenticated = true;
        saveAuthUser(action.payload);
        clearManualSignOut();
      })
      .addCase(signIn.rejected, (state, action) => {
        state.signInStatus = "failed";
        state.error = (action.payload as string) || "Sign in failed";
        state.isAuthenticated = false;
      })
      .addCase(signUp.pending, (state) => {
        state.signUpStatus = "loading";
        state.error = null;
        state.signUpMessage = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.signUpStatus = "succeeded";
        state.signUpMessage = action.payload;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.signUpStatus = "failed";
        state.error = (action.payload as string) || "Sign up failed";
      })
      .addCase(verifyAccount.pending, (state) => {
        state.verifyStatus = "loading";
        state.error = null;
        state.verifyMessage = null;
      })
      .addCase(verifyAccount.fulfilled, (state, action) => {
        state.verifyStatus = "succeeded";
        state.verifyMessage = action.payload;
      })
      .addCase(verifyAccount.rejected, (state, action) => {
        state.verifyStatus = "failed";
        state.error = (action.payload as string) || "Account verification failed";
      })
      .addCase(forgotPassword.pending, (state) => {
        state.forgotStatus = "loading";
        state.error = null;
        state.forgotMessage = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.forgotStatus = "succeeded";
        state.forgotMessage = action.payload;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.forgotStatus = "failed";
        state.error = (action.payload as string) || "Forgot password failed";
      })
      .addCase(resetPassword.pending, (state) => {
        state.resetStatus = "loading";
        state.error = null;
        state.resetMessage = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.resetStatus = "succeeded";
        state.resetMessage = action.payload;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.resetStatus = "failed";
        state.error = (action.payload as string) || "Reset password failed";
      })
      .addCase(bootstrapAuth.pending, (state) => {
        state.bootstrapStatus = "loading";
      })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.bootstrapStatus = "succeeded";
        state.user = action.payload;
        state.isAuthenticated = true;
        saveAuthUser(action.payload);
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.bootstrapStatus = "failed";
        state.user = null;
        state.isAuthenticated = false;
        clearAuthUser();
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        state.signInStatus = "idle";
        state.signUpStatus = "idle";
        state.verifyStatus = "idle";
        state.forgotStatus = "idle";
        state.resetStatus = "idle";
        state.signUpMessage = null;
        state.verifyMessage = null;
        state.forgotMessage = null;
        state.resetMessage = null;
        clearAuthUser();
        setManualSignOut();
      })
      .addCase(logout.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        state.signInStatus = "idle";
        state.signUpStatus = "idle";
        state.verifyStatus = "idle";
        state.forgotStatus = "idle";
        state.resetStatus = "idle";
        state.signUpMessage = null;
        state.verifyMessage = null;
        state.forgotMessage = null;
        state.resetMessage = null;
        clearAuthUser();
        setManualSignOut();
      });
  }
});

export const { signOutLocal, clearAuthMessages, updateAuthUserLocal } = authSlice.actions;

export default authSlice.reducer;
