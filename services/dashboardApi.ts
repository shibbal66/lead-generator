import type {
  AnalyticsDealsData,
  AnalyticsPipelineData,
  DashboardAnalyticsParams
} from "../types";
import { request } from "./apiClient";

type DealsApiResponse = { success?: boolean; message?: string; data?: AnalyticsDealsData };
type PipelineApiResponse = { success?: boolean; message?: string; data?: AnalyticsPipelineData };

/** Normalize to YYYY-MM-DD for API (e.g. startDate=2026-02-22&endDate=2026-02-23). */
function toISODateString(value: string | undefined): string | undefined {
  if (!value || typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return undefined;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildQuery(params?: DashboardAnalyticsParams): string {
  if (!params) return "";
  const q = new URLSearchParams();
  if (params.ownerId) q.set("ownerId", params.ownerId);
  if (params.projectId) q.set("projectId", params.projectId);
  const startDate = toISODateString(params.startDate);
  const endDate = toISODateString(params.endDate);
  if (startDate) q.set("startDate", startDate);
  if (endDate) q.set("endDate", endDate);
  const s = q.toString();
  return s ? `?${s}` : "";
}

async function requestDeals(path: string): Promise<AnalyticsDealsData> {
  const response = await request(path);
  let data: DealsApiResponse = {};
  try {
    data = (await response.json()) as DealsApiResponse;
  } catch {
    throw new Error("Invalid response from dashboard service.");
  }
  if (!response.ok) {
    throw new Error(data.message || "Dashboard request failed");
  }
  if (data.success === false || data.data == null) {
    throw new Error(data.message || "Dashboard analytics-deals failed");
  }
  return data.data;
}

async function requestPipeline(path: string): Promise<AnalyticsPipelineData> {
  const response = await request(path);
  let data: PipelineApiResponse = {};
  try {
    data = (await response.json()) as PipelineApiResponse;
  } catch {
    throw new Error("Invalid response from dashboard service.");
  }
  if (!response.ok) {
    throw new Error(data.message || "Dashboard request failed");
  }
  if (data.success === false || data.data == null) {
    throw new Error(data.message || "Dashboard analytics-pipeline failed");
  }
  return data.data;
}

export const dashboardApi = {
  getAnalyticsDeals: async (params?: DashboardAnalyticsParams): Promise<AnalyticsDealsData> => {
    const query = buildQuery(params);
    return requestDeals(`/dashboard/analytics-deals${query}`);
  },

  getAnalyticsPipeline: async (params?: DashboardAnalyticsParams): Promise<AnalyticsPipelineData> => {
    const query = buildQuery(params);
    return requestPipeline(`/dashboard/analytics-pipeline${query}`);
  },

  exportLeadsCsv: async (params?: DashboardAnalyticsParams): Promise<string> => {
    const query = buildQuery(params);
    const response = await request(`/dashboard/export/leads${query}`);
    if (!response.ok) {
      throw new Error("Failed to export leads CSV.");
    }
    return response.text();
  },

  exportDealsCsv: async (params?: DashboardAnalyticsParams): Promise<string> => {
    const query = buildQuery(params);
    const response = await request(`/dashboard/export/deals${query}`);
    if (!response.ok) {
      throw new Error("Failed to export deals CSV.");
    }
    return response.text();
  }
};
