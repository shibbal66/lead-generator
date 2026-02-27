import { CreateDealPayload, DealRecord, GetDealsParams } from "../store/slices/dealSlice";
import { request } from "./apiClient";

type DealApiResponse = {
  success?: boolean;
  message?: string;
  deal?: DealRecord;
  deals?: DealRecord[];
  total?: number;
  page?: number;
  limit?: number;
};

const parseJsonSafe = async (response: Response): Promise<DealApiResponse> => {
  try {
    return (await response.json()) as DealApiResponse;
  } catch {
    return {};
  }
};

const toFormBody = (payload: Record<string, string | undefined>) => {
  const params = new URLSearchParams();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined) params.append(key, value);
  });
  return params;
};

const apiRequest = async (path: string, init?: RequestInit): Promise<DealApiResponse> => {
  const res = await request(path, init);
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw new Error(data.message || "Deal request failed");
  }
  return data;
};

export const dealApi = {
  createDeal: async (payload: CreateDealPayload): Promise<{ deal: DealRecord; message: string }> => {
    const response = await apiRequest("/deal", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: toFormBody({
        name: payload.name,
        leadId: payload.leadId,
        ownerId: payload.ownerId,
        projectId: payload.projectId,
        dealType: payload.dealType,
        currency: payload.currency,
        totalAmount: payload.totalAmount !== undefined ? String(payload.totalAmount) : undefined,
        startDate: payload.startDate,
        endDate: payload.endDate,
        description: payload.description
      })
    });

    if (!response.deal) {
      throw new Error("Created deal payload missing");
    }

    return {
      deal: response.deal,
      message: response.message || "Deal created successfully"
    };
  },

  getDeals: async (params?: GetDealsParams): Promise<{ deals: DealRecord[]; total: number; page: number; limit: number }> => {
    const query = new URLSearchParams();
    if (params?.leadId) query.set("leadId", params.leadId);
    if (params?.ownerId) query.set("ownerId", params.ownerId);
    if (params?.projectId) query.set("projectId", params.projectId);
    if (typeof params?.page === "number") query.set("page", String(params.page));
    if (typeof params?.limit === "number") query.set("limit", String(params.limit));

    const path = query.toString() ? `/deal?${query.toString()}` : "/deal";
    const response = await apiRequest(path, { method: "GET" });

    return {
      deals: response.deals || [],
      total: response.total || 0,
      page: response.page || params?.page || 1,
      limit: response.limit || params?.limit || 10
    };
  },

  deleteDeal: async (dealId: string): Promise<{ message: string }> => {
    const response = await apiRequest(`/deal/${dealId}`, { method: "DELETE" });

    return {
      message: response.message || "Deal deleted successfully"
    };
  }
};
