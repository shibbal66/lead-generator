import { createAsyncThunk } from "@reduxjs/toolkit";

import { leadApi } from "../../services/leadApi";
import { CreateLeadPayload, GetLeadsParams, UpdateLeadPayload } from "../slices/leadSlice";

export const createLead = createAsyncThunk("leads/createLead", async (payload: CreateLeadPayload, { rejectWithValue }) => {
  try {
    return await leadApi.createLead(payload);
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to create lead");
  }
});

export const updateLead = createAsyncThunk("leads/updateLead", async (payload: UpdateLeadPayload, { rejectWithValue }) => {
  try {
    return await leadApi.updateLead(payload);
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to update lead");
  }
});

export const getLeads = createAsyncThunk("leads/getLeads", async (params: GetLeadsParams | undefined, { rejectWithValue }) => {
  try {
    return await leadApi.getLeads(params);
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch leads");
  }
});

/** Fetches leads with status DELETED for the trash modal. */
export const getDeletedLeads = createAsyncThunk("leads/getDeletedLeads", async (_, { rejectWithValue }) => {
  try {
    return await leadApi.getLeads({ status: "DELETED", page: 1, limit: 200 });
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch deleted leads");
  }
});

export const getLeadById = createAsyncThunk("leads/getLeadById", async (leadId: string, { rejectWithValue }) => {
  try {
    return await leadApi.getLeadById(leadId);
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch lead");
  }
});

export const softDeleteLead = createAsyncThunk("leads/softDeleteLead", async (leadId: string, { rejectWithValue }) => {
  try {
    return await leadApi.softDeleteLead(leadId);
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to move lead to trash");
  }
});

export const restoreLead = createAsyncThunk("leads/restoreLead", async (leadId: string, { rejectWithValue }) => {
  try {
    return await leadApi.restoreLead(leadId);
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to restore lead");
  }
});

export const hardDeleteLead = createAsyncThunk("leads/hardDeleteLead", async (leadId: string, { rejectWithValue }) => {
  try {
    return await leadApi.hardDeleteLead(leadId);
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to permanently delete lead");
  }
});
