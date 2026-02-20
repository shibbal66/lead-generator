import {
  CreateLeadPayload,
  GetLeadsParams,
  LeadCommentDetail,
  LeadDealDetail,
  LeadDetailResponse,
  LeadProjectDetail,
  LeadRecord,
  LeadTaskDetail,
  UpdateLeadPayload
} from "../store/slices/leadSlice";
import { request } from "./apiClient";

type LeadApiResponse = {
  success?: boolean;
  message?: string;
  lead?: LeadRecord;
  leads?: LeadRecord[];
  owner?: LeadDetailResponse["owner"];
  projects?: LeadProjectDetail[];
  deals?: LeadDealDetail[];
  tasks?: LeadTaskDetail[];
  comments?: LeadCommentDetail[];
  total?: number;
  page?: number;
  limit?: number;
};

const parseJsonSafe = async (response: Response): Promise<LeadApiResponse> => {
  try {
    return (await response.json()) as LeadApiResponse;
  } catch {
    return {};
  }
};

const apiRequest = async (path: string, init?: RequestInit): Promise<LeadApiResponse> => {
  const res = await request(path, init);
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw new Error(data.message || "Lead request failed");
  }
  return data;
};

export const leadApi = {
  createLead: async (payload: CreateLeadPayload): Promise<{ lead: LeadRecord; message: string }> => {
    const response = await apiRequest("/lead", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.lead) {
      throw new Error("Created lead payload missing");
    }

    return {
      lead: response.lead,
      message: response.message || "Lead created successfully"
    };
  },

  updateLead: async ({ leadId, data }: UpdateLeadPayload): Promise<{ lead: LeadRecord; message: string }> => {
    const response = await apiRequest(`/lead/${leadId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (!response.lead) {
      throw new Error("Updated lead payload missing");
    }

    return {
      lead: response.lead,
      message: response.message || "Lead updated successfully"
    };
  },

  getLeads: async (params?: GetLeadsParams): Promise<{ leads: LeadRecord[]; total: number; page: number; limit: number }> => {
    const query = new URLSearchParams();
    if (params?.projectId) {
      query.set("projectId", params.projectId);
    }
    if (params?.ownerId) query.set("ownerId", params.ownerId);
    if (params?.status) query.set("status", params.status);
    if (params?.search) query.set("search", params.search);
    if (params?.orderBy) query.set("orderBy", params.orderBy);
    if (typeof params?.page === "number") query.set("page", String(params.page));
    if (typeof params?.limit === "number") query.set("limit", String(params.limit));

    const path = query.toString() ? `/lead?${query.toString()}` : "/lead";
    console.log("[leadApi] getLeads request", path);
    const response = await apiRequest(path, { method: "GET" });

    return {
      leads: response.leads || [],
      total: response.total || 0,
      page: response.page || params?.page || 1,
      limit: response.limit || params?.limit || 10
    };
  },

  getLeadById: async (leadId: string): Promise<LeadDetailResponse> => {
    const response = await apiRequest(`/lead/${leadId}`, { method: "GET" });

    if (!response.lead) {
      throw new Error("Lead not found");
    }

    return {
      lead: response.lead,
      owner: response.owner,
      projects: response.projects || [],
      deals: response.deals || [],
      tasks: response.tasks || [],
      comments: response.comments || []
    };
  },

  /** Soft delete: move lead to trash. PATCH /lead/{leadID} with status DELETED */
  softDeleteLead: async (leadId: string): Promise<{ leadId: string; message: string }> => {
    const response = await apiRequest(`/lead/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "DELETED" })
    });

    return {
      leadId,
      message: response.message || "Lead moved to trash"
    };
  },

  /** Restore a lead from trash. PATCH /lead/{leadID}/restore */
  restoreLead: async (leadId: string): Promise<{ leadId: string; message: string }> => {
    const response = await apiRequest(`/lead/${leadId}/restore`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });

    return {
      leadId,
      message: response.message || "Lead restored"
    };
  },

  /** Permanently delete a lead (e.g. from trash). DELETE /lead/{leadID} */
  hardDeleteLead: async (leadId: string): Promise<{ leadId: string; message: string }> => {
    const response = await apiRequest(`/lead/${leadId}`, { method: "DELETE" });

    return {
      leadId,
      message: response.message || "Lead permanently deleted"
    };
  }
};
