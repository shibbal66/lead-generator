import { BACKEND_URL } from "../config/env";
import type {
  AnalyticsDealsData,
  AnalyticsPipelineData,
  DashboardAnalyticsParams
} from "../types";

type DealsApiResponse = { success?: boolean; message?: string; data?: AnalyticsDealsData };
type PipelineApiResponse = { success?: boolean; message?: string; data?: AnalyticsPipelineData };

function buildQuery(params?: DashboardAnalyticsParams): string {
  if (!params) return "";
  const q = new URLSearchParams();
  if (params.ownerId) q.set("ownerId", params.ownerId);
  if (params.projectId) q.set("projectId", params.projectId);
  if (params.startDate) q.set("startDate", params.startDate);
  if (params.endDate) q.set("endDate", params.endDate);
  const s = q.toString();
  return s ? `?${s}` : "";
}

async function requestDeals(path: string): Promise<AnalyticsDealsData> {
  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}${path}`, { credentials: "include" });
  } catch {
    throw new Error("Network/CORS error: unable to reach dashboard service.");
  }
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
  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}${path}`, { credentials: "include" });
  } catch {
    throw new Error("Network/CORS error: unable to reach dashboard service.");
  }
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
  }
};
