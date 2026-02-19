import { createSlice } from "@reduxjs/toolkit";

import { deleteUser, getUserById, getUsers, updateUser, updateUserPassword } from "../actions/userActions";

export type UserStatus = "ACTIVE" | "INACTIVE" | string;

export type UserRole = "ADMIN" | "EDITOR" | "VIEWER" | string;

export type AppUser = {
  id: string;
  name: string;
  email: string;
  jobTitle: string | null;
  role: UserRole;
  status: UserStatus;
  notificationEnabled: boolean;
  teamId: string;
};

export type GetUsersParams = {
  page?: number;
  limit?: number;
};

export type UpdateUserBody = {
  name?: string;
  email?: string;
  jobTitle?: string | null;
  role?: UserRole;
  status?: UserStatus;
  notificationEnabled?: boolean;
  fcmToken?: string;
};

export type UpdateUserPayload = {
  userId: string;
  data: UpdateUserBody;
};

export type UpdateUserPasswordPayload = {
  oldPassword: string;
  newPassword: string;
};

type AsyncStatus = "idle" | "loading" | "succeeded" | "failed";

type UsersState = {
  users: AppUser[];
  selectedUser: AppUser | null;
  total: number;
  page: number;
  limit: number;
  listStatus: AsyncStatus;
  detailStatus: AsyncStatus;
  updateStatus: AsyncStatus;
  updatePasswordStatus: AsyncStatus;
  deleteStatus: AsyncStatus;
  error: string | null;
  successMessage: string | null;
};

const initialState: UsersState = {
  users: [],
  selectedUser: null,
  total: 0,
  page: 1,
  limit: 10,
  listStatus: "idle",
  detailStatus: "idle",
  updateStatus: "idle",
  updatePasswordStatus: "idle",
  deleteStatus: "idle",
  error: null,
  successMessage: null
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUsersMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
      state.detailStatus = "idle";
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUsers.pending, (state) => {
        state.listStatus = "loading";
        state.error = null;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.users = action.payload.users;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.listStatus = "failed";
        state.error = (action.payload as string) || "Failed to fetch users";
      })
      .addCase(getUserById.pending, (state) => {
        state.detailStatus = "loading";
        state.error = null;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.detailStatus = "succeeded";
        state.selectedUser = action.payload;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.detailStatus = "failed";
        state.error = (action.payload as string) || "Failed to fetch user";
      })
      .addCase(updateUser.pending, (state) => {
        state.updateStatus = "loading";
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        state.successMessage = action.payload.message;
        state.selectedUser = action.payload.user;
        state.users = state.users.map((user) => (user.id === action.payload.user.id ? action.payload.user : user));
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.error = (action.payload as string) || "Failed to update user";
      })
      .addCase(updateUserPassword.pending, (state) => {
        state.updatePasswordStatus = "loading";
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateUserPassword.fulfilled, (state, action) => {
        state.updatePasswordStatus = "succeeded";
        state.successMessage = action.payload.message;
        if (action.payload.user) {
          state.selectedUser = action.payload.user;
          state.users = state.users.map((user) => (user.id === action.payload.user!.id ? action.payload.user! : user));
        }
      })
      .addCase(updateUserPassword.rejected, (state, action) => {
        state.updatePasswordStatus = "failed";
        state.error = (action.payload as string) || "Failed to update password";
      })
      .addCase(deleteUser.pending, (state) => {
        state.deleteStatus = "loading";
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.deleteStatus = "succeeded";
        state.successMessage = action.payload.message;
        state.users = state.users.filter((user) => user.id !== action.payload.userId);
        if (state.selectedUser?.id === action.payload.userId) {
          state.selectedUser = null;
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.error = (action.payload as string) || "Failed to delete user";
      });
  }
});

export const { clearUsersMessages, clearSelectedUser } = userSlice.actions;

export default userSlice.reducer;
