import { createAsyncThunk } from "@reduxjs/toolkit";

import { teamApi } from "../../services/teamApi";
import {
  DeleteTeamMemberPayload,
  GetTeamMembersParams,
  InviteTeamMemberPayload
} from "../slices/teamSlice";

export const getTeamMembers = createAsyncThunk(
  "team/getTeamMembers",
  async (params: GetTeamMembersParams, { rejectWithValue }) => {
    try {
      const result = await teamApi.getTeamMembers(params);
      return result;
    } catch (error) {
      console.error("[Team Action] getTeamMembers error", error);
      return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch team members");
    }
  }
);

export const inviteTeamMember = createAsyncThunk(
  "team/inviteTeamMember",
  async (payload: InviteTeamMemberPayload, { rejectWithValue }) => {
    try {
      const result = await teamApi.inviteTeamMember(payload);
      return result;
    } catch (error) {
      console.error("[Team Action] inviteTeamMember error", error);
      return rejectWithValue(error instanceof Error ? error.message : "Failed to invite team member");
    }
  }
);

export const getInvitationById = createAsyncThunk(
  "team/getInvitationById",
  async (invitationId: string, { rejectWithValue }) => {
    try {
      const result = await teamApi.getInvitationById(invitationId);
      return result;
    } catch (error) {
      console.error("[Team Action] getInvitationById error", error);
      return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch invitation");
    }
  }
);

export const deleteTeamMember = createAsyncThunk(
  "team/deleteTeamMember",
  async (payload: DeleteTeamMemberPayload, { rejectWithValue }) => {
    try {
      const result = await teamApi.deleteTeamMember(payload);
      return result;
    } catch (error) {
      console.error("[Team Action] deleteTeamMember error", error);
      return rejectWithValue(error instanceof Error ? error.message : "Failed to delete team member");
    }
  }
);

export const cancelTeamInvitation = createAsyncThunk(
  "team/cancelTeamInvitation",
  async (invitationId: string, { rejectWithValue }) => {
    try {
      const result = await teamApi.cancelInvitation(invitationId);
      return result;
    } catch (error) {
      console.error("[Team Action] cancelTeamInvitation error", error);
      return rejectWithValue(error instanceof Error ? error.message : "Failed to cancel invitation");
    }
  }
);
