import React, { useState, useEffect, useCallback } from "react";
import { exportDealsCsv, getAnalyticsDeals, getAnalyticsPipeline } from "../store/actions/dashboardActions";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import type { DashboardFilterParams } from "../components/AnalyticsDashboard";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import type { Language } from "../translations";

interface AnalyticsPageProps {
  owners: Array<{ id: string; name: string }>;
  projects: Array<{ id: string; title: string; description?: string; managerName?: string; createdAt?: string }>;
  lang: Language;
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ owners, projects, lang }) => {
  const dispatch = useAppDispatch();
  const apiDeals = useAppSelector((state) => state.dashboard.dealsData);
  const apiPipeline = useAppSelector((state) => state.dashboard.pipelineData);
  const dealsStatus = useAppSelector((state) => state.dashboard.dealsStatus);
  const pipelineStatus = useAppSelector((state) => state.dashboard.pipelineStatus);
  const error = useAppSelector((state) => state.dashboard.error);

  const [filterParams, setFilterParams] = useState<DashboardFilterParams>({});
  const loading = dealsStatus === "loading" || pipelineStatus === "loading";

  const params = useCallback(() => {
    return {
      ownerId: filterParams.ownerId,
      projectId: filterParams.projectId,
      startDate: filterParams.startDate,
      endDate: filterParams.endDate
    };
  }, [filterParams.endDate, filterParams.ownerId, filterParams.projectId, filterParams.startDate]);

  useEffect(() => {
    const nextParams = params();
    dispatch(getAnalyticsDeals(nextParams));
    dispatch(getAnalyticsPipeline(nextParams));
  }, [dispatch, params]);

  const handleFiltersChange = useCallback((params: DashboardFilterParams) => {
    setFilterParams((prev) => ({
      ...prev,
      ...params
    }));
  }, []);

  const handleExportDealsCsv = useCallback(async (startDate?: string, endDate?: string) => {
    const baseParams = params();
    const exportParams = {
      ...baseParams,
      startDate: startDate || baseParams.startDate,
      endDate: endDate || baseParams.endDate
    };
    const result = await dispatch(exportDealsCsv(exportParams));
    if (!exportDealsCsv.fulfilled.match(result)) {
      throw new Error((result.payload as string) || "Failed to export deals CSV");
    }
    const csv = result.payload;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `deals_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, [dispatch, params]);

  return (
    <AnalyticsDashboard
      deals={[]}
      leads={[]}
      owners={owners}
      projects={projects}
      lang={lang}
      apiDealsData={apiDeals}
      apiPipelineData={apiPipeline}
      apiLoading={loading}
      apiError={error}
      onFiltersChange={handleFiltersChange}
      onApiExportDeals={handleExportDealsCsv}
    />
  );
};

export default AnalyticsPage;
