import { createSlice } from "@reduxjs/toolkit";

import {
  cancelTeamInvitation,
  deleteTeamMember,
  getInvitationById,
  getTeamMembers,
  inviteTeamMember
} from "../actions/teamActions";

export type TeamRole = "ADMIN" | "EDITOR" | "VIEWER" | string;
export type TeamStatus = "ACTIVE" | "INACTIVE" | string;

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  jobTitle: string | null;
  role: TeamRole;
  status: TeamStatus;
  notificationEnabled: boolean;
  teamId: string;
};

export type TeamInvitation = {
  id: string;
  invitationId?: string;
  email: string;
  role: TeamRole;
  status?: string;
  name?: string;
  createdAt?: string;
  invitedAt?: string;
  expiresAt?: string;
  teamId?: string;
};

export type GetTeamMembersParams = {
  teamId?: string;
  page?: number;
  limit?: number;
  search?: string;
};

export type InviteTeamMemberPayload = {
  email: string;
  role: TeamRole;
};

export type DeleteTeamMemberPayload = {
  userId: string;
};

type AsyncStatus = "idle" | "loading" | "succeeded" | "failed";

type TeamState = {
  members: TeamMember[];
  invitations: TeamInvitation[];
  invitation: TeamInvitation | null;
  total: number;
  page: number;
  limit: number;
  listStatus: AsyncStatus;
  inviteStatus: AsyncStatus;
  invitationStatus: AsyncStatus;
  deleteStatus: AsyncStatus;
  cancelInvitationStatus: AsyncStatus;
  error: string | null;
  successMessage: string | null;
};

const initialState: TeamState = {
  members: [],
  invitations: [],
  invitation: null,
  total: 0,
  page: 1,
  limit: 10,
  listStatus: "idle",
  inviteStatus: "idle",
  invitationStatus: "idle",
  deleteStatus: "idle",
  cancelInvitationStatus: "idle",
  error: null,
  successMessage: null
};

const teamSlice = createSlice({
  name: "team",
  initialState,
  reducers: {
    clearTeamMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    clearInvitation: (state) => {
      state.invitation = null;
      state.invitationStatus = "idle";
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTeamMembers.pending, (state) => {
        state.listStatus = "loading";
        state.error = null;
      })
      .addCase(getTeamMembers.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.members = action.payload.users;
        state.invitations = action.payload.invitations || [];
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(getTeamMembers.rejected, (state, action) => {
        state.listStatus = "failed";
        state.error = (action.payload as string) || "Failed to fetch team members";
      })
      .addCase(inviteTeamMember.pending, (state) => {
        state.inviteStatus = "loading";
        state.error = null;
        state.successMessage = null;
      })
      .addCase(inviteTeamMember.fulfilled, (state, action) => {
        state.inviteStatus = "succeeded";
        state.successMessage = action.payload.message;
      })
      .addCase(inviteTeamMember.rejected, (state, action) => {
        state.inviteStatus = "failed";
        state.error = (action.payload as string) || "Failed to invite team member";
      })
      .addCase(getInvitationById.pending, (state) => {
        state.invitationStatus = "loading";
        state.error = null;
      })
      .addCase(getInvitationById.fulfilled, (state, action) => {
        state.invitationStatus = "succeeded";
        state.invitation = action.payload;
      })
      .addCase(getInvitationById.rejected, (state, action) => {
        state.invitationStatus = "failed";
        state.error = (action.payload as string) || "Failed to fetch invitation";
      })
      .addCase(deleteTeamMember.pending, (state) => {
        state.deleteStatus = "loading";
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteTeamMember.fulfilled, (state, action) => {
        state.deleteStatus = "succeeded";
        state.successMessage = action.payload.message;
        state.members = state.members.filter((member) => member.id !== action.payload.userId);
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(deleteTeamMember.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.error = (action.payload as string) || "Failed to delete team member";
      })
      .addCase(cancelTeamInvitation.pending, (state) => {
        state.cancelInvitationStatus = "loading";
        state.error = null;
        state.successMessage = null;
      })
      .addCase(cancelTeamInvitation.fulfilled, (state, action) => {
        state.cancelInvitationStatus = "succeeded";
        state.successMessage = action.payload.message;
        state.invitations = state.invitations.filter(
          (invitation) => invitation.id !== action.payload.invitationId
        );
      })
      .addCase(cancelTeamInvitation.rejected, (state, action) => {
        state.cancelInvitationStatus = "failed";
        state.error = (action.payload as string) || "Failed to cancel invitation";
      });
  }
});

export const { clearTeamMessages, clearInvitation } = teamSlice.actions;
export default teamSlice.reducer;
