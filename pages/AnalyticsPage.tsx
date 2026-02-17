import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAppSelector } from "../store/hooks";
import type { Owner, Project } from "../types";
import type { DashboardFilterParams } from "../components/AnalyticsDashboard";
import { dashboardApi } from "../services/dashboardApi";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import type { Language } from "../translations";

interface AnalyticsPageProps {
  owners: Owner[];
  projects: Project[];
  lang: Language;
}

function defaultDateRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const end = new Date(now.getFullYear(), 11, 31);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10)
  };
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ owners, projects, lang }) => {
  const user = useAppSelector((s) => s.auth.user);
  const userId = user?.userId;
  const filtersTouchedRef = useRef(false);

  const { startDate: defaultStart, endDate: defaultEnd } = defaultDateRange();
  const [filterParams, setFilterParams] = useState<DashboardFilterParams>({
    startDate: defaultStart,
    endDate: defaultEnd
  });
  const [apiDeals, setApiDeals] = useState<Awaited<ReturnType<typeof dashboardApi.getAnalyticsDeals>> | null>(null);
  const [apiPipeline, setApiPipeline] = useState<
    Awaited<ReturnType<typeof dashboardApi.getAnalyticsPipeline>> | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    const ownerId =
      filtersTouchedRef.current ? filterParams.ownerId : (filterParams.ownerId ?? userId ?? undefined);
    const params = {
      ownerId,
      projectId: filterParams.projectId,
      startDate: filterParams.startDate,
      endDate: filterParams.endDate
    };
    try {
      const [dealsData, pipelineData] = await Promise.all([
        dashboardApi.getAnalyticsDeals(params),
        dashboardApi.getAnalyticsPipeline(params)
      ]);
      setApiDeals(dealsData);
      setApiPipeline(pipelineData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load analytics");
      setApiDeals(null);
      setApiPipeline(null);
    } finally {
      setLoading(false);
    }
  }, [filterParams.ownerId, filterParams.projectId, filterParams.startDate, filterParams.endDate, userId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleFiltersChange = useCallback((params: DashboardFilterParams) => {
    filtersTouchedRef.current = true;
    setFilterParams((prev) => ({
      ...prev,
      ...params
    }));
  }, []);

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
    />
  );
};

export default AnalyticsPage;
