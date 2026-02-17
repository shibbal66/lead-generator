import { createSlice } from "@reduxjs/toolkit";

import { AnalyticsDealsData, AnalyticsPipelineData } from "../../types";
import {
  exportDealsCsv,
  exportLeadsCsv,
  getAnalyticsDeals,
  getAnalyticsPipeline
} from "../actions/dashboardActions";

type AsyncStatus = "idle" | "loading" | "succeeded" | "failed";

type DashboardState = {
  dealsData: AnalyticsDealsData | null;
  pipelineData: AnalyticsPipelineData | null;
  dealsStatus: AsyncStatus;
  pipelineStatus: AsyncStatus;
  exportLeadsStatus: AsyncStatus;
  exportDealsStatus: AsyncStatus;
  error: string | null;
};

const initialState: DashboardState = {
  dealsData: null,
  pipelineData: null,
  dealsStatus: "idle",
  pipelineStatus: "idle",
  exportLeadsStatus: "idle",
  exportDealsStatus: "idle",
  error: null
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAnalyticsDeals.pending, (state) => {
        state.dealsStatus = "loading";
        state.error = null;
      })
      .addCase(getAnalyticsDeals.fulfilled, (state, action) => {
        state.dealsStatus = "succeeded";
        state.dealsData = action.payload;
      })
      .addCase(getAnalyticsDeals.rejected, (state, action) => {
        state.dealsStatus = "failed";
        state.error = (action.payload as string) || "Failed to fetch deals analytics";
      })
      .addCase(getAnalyticsPipeline.pending, (state) => {
        state.pipelineStatus = "loading";
        state.error = null;
      })
      .addCase(getAnalyticsPipeline.fulfilled, (state, action) => {
        state.pipelineStatus = "succeeded";
        state.pipelineData = action.payload;
      })
      .addCase(getAnalyticsPipeline.rejected, (state, action) => {
        state.pipelineStatus = "failed";
        state.error = (action.payload as string) || "Failed to fetch pipeline analytics";
      })
      .addCase(exportLeadsCsv.pending, (state) => {
        state.exportLeadsStatus = "loading";
        state.error = null;
      })
      .addCase(exportLeadsCsv.fulfilled, (state) => {
        state.exportLeadsStatus = "succeeded";
      })
      .addCase(exportLeadsCsv.rejected, (state, action) => {
        state.exportLeadsStatus = "failed";
        state.error = (action.payload as string) || "Failed to export leads CSV";
      })
      .addCase(exportDealsCsv.pending, (state) => {
        state.exportDealsStatus = "loading";
        state.error = null;
      })
      .addCase(exportDealsCsv.fulfilled, (state) => {
        state.exportDealsStatus = "succeeded";
      })
      .addCase(exportDealsCsv.rejected, (state, action) => {
        state.exportDealsStatus = "failed";
        state.error = (action.payload as string) || "Failed to export deals CSV";
      });
  }
});

export const { clearDashboardError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
