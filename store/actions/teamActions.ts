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
      console.log("[Team Action] getTeamMembers params", params);
      const result = await teamApi.getTeamMembers(params);
      console.log("[Team Action] getTeamMembers result", result);
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
      console.log("[Team Action] inviteTeamMember payload", payload);
      const result = await teamApi.inviteTeamMember(payload);
      console.log("[Team Action] inviteTeamMember result", result);
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
      console.log("[Team Action] getInvitationById — invitationId", invitationId);
      const result = await teamApi.getInvitationById(invitationId);
      console.log("[Team Action] getInvitationById result — invitationId", result?.id ?? result?.invitationId ?? invitationId, result);
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
      console.log("[Team Action] deleteTeamMember payload", payload);
      const result = await teamApi.deleteTeamMember(payload);
      console.log("[Team Action] deleteTeamMember result", result);
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
      console.log("[Team Action] cancelTeamInvitation id", invitationId);
      const result = await teamApi.cancelInvitation(invitationId);
      console.log("[Team Action] cancelTeamInvitation result", result);
      return result;
    } catch (error) {
      console.error("[Team Action] cancelTeamInvitation error", error);
      return rejectWithValue(error instanceof Error ? error.message : "Failed to cancel invitation");
    }
  }
);
