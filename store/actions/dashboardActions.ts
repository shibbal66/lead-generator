import { createAsyncThunk } from "@reduxjs/toolkit";

import { dashboardApi } from "../../services/dashboardApi";
import { DashboardAnalyticsParams } from "../../types";

export const getAnalyticsDeals = createAsyncThunk(
  "dashboard/getAnalyticsDeals",
  async (params: DashboardAnalyticsParams | undefined, { rejectWithValue }) => {
    try {
      return await dashboardApi.getAnalyticsDeals(params);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch deals analytics");
    }
  }
);

export const getAnalyticsPipeline = createAsyncThunk(
  "dashboard/getAnalyticsPipeline",
  async (params: DashboardAnalyticsParams | undefined, { rejectWithValue }) => {
    try {
      return await dashboardApi.getAnalyticsPipeline(params);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch pipeline analytics");
    }
  }
);

export const exportLeadsCsv = createAsyncThunk(
  "dashboard/exportLeadsCsv",
  async (params: DashboardAnalyticsParams | undefined, { rejectWithValue }) => {
    try {
      return await dashboardApi.exportLeadsCsv(params);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to export leads CSV");
    }
  }
);

export const exportDealsCsv = createAsyncThunk(
  "dashboard/exportDealsCsv",
  async (params: DashboardAnalyticsParams | undefined, { rejectWithValue }) => {
    try {
      return await dashboardApi.exportDealsCsv(params);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to export deals CSV");
    }
  }
);
