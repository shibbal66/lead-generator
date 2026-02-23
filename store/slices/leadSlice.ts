import { createSlice } from "@reduxjs/toolkit";

import { createLead, getDeletedLeads, getLeadById, getLeads, hardDeleteLead, restoreLead, softDeleteLead, updateLead } from "../actions/leadActions";

export type LeadStatus = "IDENTIFIED" | "CONTACTED" | "QUALIFIED" | "NEGOTIATION" | "CLOSED" | string;

export type LeadRecord = {
  id: string;
  ownerId: string;
  firstName: string;
  lastName: string;
  position: string;
  company?: string;
  email?: string;
  phone?: string;
  birthday?: string;
  socialLinks?: Record<string, string>;
  status: LeadStatus;
  projectId?: string;
  ownerName?: string;
  commentCount?: number | string;
  createdAt?: string;
  updatedAt?: string;
};

export type LeadOwnerDetail = {
  name: string;
  email?: string;
  jobTitle?: string | null;
  role?: string;
};

export type LeadProjectDetail = {
  id: string;
  title: string;
  description?: string | null;
  projectManagerId?: string;
  projectManagerName?: string;
};

export type LeadDealDetail = {
  id: string;
  name: string;
  leadId: string;
  ownerId?: string;
  projectId?: string | null;
  dealType: string;
  currency: string;
  totalAmount: string | number;
  startDate: string;
  endDate: string;
  description?: string;
  createdAt?: string;
};

export type LeadTaskDetail = {
  id: string;
  description: string;
  assignedTo?: string;
  leadId?: string;
  deadline?: string;
  completed?: boolean;
  createdAt?: string;
};

export type LeadCommentDetail = {
  id: string;
  userId: string;
  leadId: string;
  text: string;
  date?: string;
  createdAt?: string;
};

export type LeadDetailResponse = {
  lead: LeadRecord;
  owner?: LeadOwnerDetail;
  projects?: LeadProjectDetail[];
  deals?: LeadDealDetail[];
  tasks?: LeadTaskDetail[];
  comments?: LeadCommentDetail[];
};

export type CreateLeadPayload = {
  ownerId: string;
  firstName: string;
  lastName: string;
  position: string;
  company?: string;
  email?: string;
  phone?: string;
  birthday?: string;
  socialLinks?: Record<string, string>;
  status: LeadStatus;
  projectId?: string;
};

export type UpdateLeadPayload = {
  leadId: string;
  data: Partial<CreateLeadPayload>;
};

export type GetLeadsParams = {
  projectId?: string;
  ownerId?: string;
  status?: LeadStatus;
  search?: string;
  orderBy?: string;
  page?: number;
  limit?: number;
};

type AsyncStatus = "idle" | "loading" | "succeeded" | "failed";

type LeadsState = {
  leads: LeadRecord[];
  deletedLeads: LeadRecord[];
  deletedLeadsTotal: number;
  deletedLeadsStatus: AsyncStatus;
  selectedLead: LeadRecord | null;
  total: number;
  page: number;
  limit: number;
  listStatus: AsyncStatus;
  detailStatus: AsyncStatus;
  createStatus: AsyncStatus;
  updateStatus: AsyncStatus;
  deleteStatus: AsyncStatus;
  error: string | null;
  successMessage: string | null;
};

const initialState: LeadsState = {
  leads: [],
  deletedLeads: [],
  deletedLeadsTotal: 0,
  deletedLeadsStatus: "idle",
  selectedLead: null,
  total: 0,
  page: 1,
  limit: 10,
  listStatus: "idle",
  detailStatus: "idle",
  createStatus: "idle",
  updateStatus: "idle",
  deleteStatus: "idle",
  error: null,
  successMessage: null
};

const leadSlice = createSlice({
  name: "leads",
  initialState,
  reducers: {
    clearLeadMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    clearSelectedLead: (state) => {
      state.selectedLead = null;
      state.detailStatus = "idle";
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getLeads.pending, (state) => {
        state.listStatus = "loading";
        state.error = null;
      })
      .addCase(getLeads.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.leads = action.payload.leads;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(getLeads.rejected, (state, action) => {
        state.listStatus = "failed";
        state.error = (action.payload as string) || "Failed to fetch leads";
      })
      .addCase(getDeletedLeads.pending, (state) => {
        state.deletedLeadsStatus = "loading";
      })
      .addCase(getDeletedLeads.fulfilled, (state, action) => {
        state.deletedLeadsStatus = "succeeded";
        state.deletedLeads = action.payload.leads;
        state.deletedLeadsTotal = action.payload.total;
      })
      .addCase(getDeletedLeads.rejected, (state) => {
        state.deletedLeadsStatus = "failed";
      })
      .addCase(getLeadById.pending, (state) => {
        state.detailStatus = "loading";
        state.error = null;
      })
      .addCase(getLeadById.fulfilled, (state, action) => {
        state.detailStatus = "succeeded";
        state.selectedLead = action.payload.lead;
      })
      .addCase(getLeadById.rejected, (state, action) => {
        state.detailStatus = "failed";
        state.error = (action.payload as string) || "Failed to fetch lead";
      })
      .addCase(createLead.pending, (state) => {
        state.createStatus = "loading";
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createLead.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        state.successMessage = action.payload.message;
      })
      .addCase(createLead.rejected, (state, action) => {
        state.createStatus = "failed";
        state.error = (action.payload as string) || "Failed to create lead";
      })
      .addCase(updateLead.pending, (state) => {
        state.updateStatus = "loading";
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateLead.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        state.successMessage = action.payload.message;
        state.selectedLead = action.payload.lead;
        state.leads = state.leads.map((lead) => (lead.id === action.payload.lead.id ? action.payload.lead : lead));
      })
      .addCase(updateLead.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.error = (action.payload as string) || "Failed to update lead";
      })
      .addCase(softDeleteLead.pending, (state) => {
        state.deleteStatus = "loading";
        state.error = null;
        state.successMessage = null;
      })
      .addCase(softDeleteLead.fulfilled, (state, action) => {
        state.deleteStatus = "succeeded";
        state.successMessage = action.payload.message;
        state.leads = state.leads.filter((lead) => lead.id !== action.payload.leadId);
        state.total = Math.max(0, state.total - 1);
        if (state.selectedLead?.id === action.payload.leadId) {
          state.selectedLead = null;
        }
        state.deletedLeadsStatus = "idle";
      })
      .addCase(softDeleteLead.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.error = (action.payload as string) || "Failed to move lead to trash";
      })
      .addCase(restoreLead.fulfilled, (state) => {
        state.error = null;
        state.deletedLeadsStatus = "idle";
      })
      .addCase(restoreLead.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to restore lead";
      })
      .addCase(hardDeleteLead.fulfilled, (state, action) => {
        state.deletedLeads = state.deletedLeads.filter((lead) => lead.id !== action.payload.leadId);
        state.deletedLeadsTotal = Math.max(0, state.deletedLeadsTotal - 1);
      })
      .addCase(hardDeleteLead.rejected, () => {});
  }
});

export const { clearLeadMessages, clearSelectedLead } = leadSlice.actions;

export default leadSlice.reducer;
