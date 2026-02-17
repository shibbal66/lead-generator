import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { Lead, PipelineStage, SortField, SortOrder, LeadFile, Owner, Task, Todo, Project, UserSettings, Deal, DealType } from "./types";
import { api } from "./services/api";
import { leadApi } from "./services/leadApi";
import KanbanBoard from "./components/KanbanBoard";
import LeadDetailDrawer from "./components/LeadDetailDrawer";
import LeadModal from "./components/LeadModal";
import ProjectModal from "./components/ProjectModal";
import ShareModal from "./components/ShareModal";
import TrashBin from "./components/TrashBin";
import TaskModal from "./components/TaskModal";
import DealModal from "./components/DealModal";
import { DealModalSubmitPayload } from "./components/DealModal";
import TodoDashboard from "./components/TodoDashboard";
import SentTasksDashboard from "./components/SentTasksDashboard";
import MyProjectsDashboard from "./components/MyProjectsDashboard";
import SettingsDashboard from "./components/SettingsDashboard";
import EmailSettingsDashboard from "./components/EmailSettingsDashboard";
import UserManagementDashboard from "./components/UserManagementDashboard";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import TrashModal from "./components/TrashModal";
import Toast from "./components/Toast";
import { translations, Language } from "./translations";
import {
  Plus,
  Search,
  Filter,
  BarChart3,
  Users,
  LayoutDashboard,
  Settings,
  Loader2,
  UserPlus,
  Download,
  Bell,
  Send,
  CheckSquare,
  ClipboardList,
  Briefcase,
  Share2,
  FolderKanban,
  PieChart,
  ShieldCheck,
  FolderPlus,
  LogOut
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { signOutLocal } from "./store/slices/authSlice";
import {
  createLead as createLeadAction,
  deleteLead as deleteLeadAction,
  getLeadById as getLeadByIdAction,
  getLeads as getLeadsAction,
  updateLead as updateLeadAction
} from "./store/actions/leadActions";
import { getUsers } from "./store/actions/userActions";
import { createDeal as createDealApiAction } from "./store/actions/dealActions";
import { createProject as createProjectApiAction, getProjects as getProjectsAction } from "./store/actions/projectActions";
import { CreateProjectPayload } from "./store/slices/projectSlice";
import type { LeadRecord } from "./store/slices/leadSlice";
import {
  createComment as createCommentAction,
  deleteComment as deleteCommentAction,
  updateComment as updateCommentAction
} from "./store/actions/commentActions";


type ViewType =
  | "pipeline"
  | "analytics"
  | "todos"
  | "sent_tasks"
  | "my_projects"
  | "settings"
  | "user_mgmt";

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const hasBootstrappedRef = useRef(false);
  const [activeView, setActiveView] = useState<ViewType>("pipeline");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [deletedLeads, setDeletedLeads] = useState<Lead[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);
  const [toastState, setToastState] = useState<{ open: boolean; type: "success" | "error" | "info"; message: string }>({
    open: false,
    type: "info",
    message: ""
  });

  const [closingLead, setClosingLead] = useState<Lead | null>(null);
  const [taskingOwner, setTaskingOwner] = useState<Owner | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const [search, setSearch] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("All");
  const [projectFilter, setProjectFilter] = useState("All");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const users = useAppSelector((state) => state.users.users);
  const projectRecords = useAppSelector((state) => state.projects.projects);
  const authUser = useAppSelector((state) => state.auth.user);
  const usersListStatus = useAppSelector((state) => state.users.listStatus);
  const usersError = useAppSelector((state) => state.users.error);
  const leadRecords = useAppSelector((state) => state.leads.leads);
  const leadsListStatus = useAppSelector((state) => state.leads.listStatus);
  const leadsError = useAppSelector((state) => state.leads.error);
  const currentLang = useMemo(() => userSettings?.language || "de", [userSettings]);
  const t = useMemo(() => translations[currentLang], [currentLang]);

  const mapStatusToPipeline = (status?: string): PipelineStage => {
    if (status === "DELETED") return PipelineStage.TRASH;
    if (status === "CONTACTED") return PipelineStage.CONTACTED;
    if (status === "QUALIFIED") return PipelineStage.QUALIFIED;
    if (status === "NEGOTIATION") return PipelineStage.NEGOTIATION;
    if (status === "CLOSED") return PipelineStage.CLOSED;
    return PipelineStage.IDENTIFIED;
  };

  const mapLeadRecordToUi = useCallback(
    (record: LeadRecord): Lead => {
      const notFoundText = currentLang === "de" ? "Nicht gefunden" : "Not found";
      const commentCount =
        typeof record.commentCount === "number"
          ? record.commentCount
          : typeof record.commentCount === "string"
            ? Number(record.commentCount) || 0
            : 0;

      return {
        id: record.id,
        firstName: record.firstName || notFoundText,
        lastName: record.lastName || notFoundText,
        currentPosition: record.position || notFoundText,
        company: record.company || notFoundText,
        linkedinUrl: record.socialLinks?.linkedin || "",
        facebookUrl: record.socialLinks?.facebook || "",
        instagramUrl: record.socialLinks?.instagram || "",
        tiktokUrl: record.socialLinks?.tiktok || "",
        twitterUrl: record.socialLinks?.twitter || "",
        ownerName: users.find((user) => user.id === record.ownerId)?.name || record.ownerName || notFoundText,
        phone: record.phone || notFoundText,
        email: record.email || notFoundText,
        birthday: record.birthday || "",
        pipelineStage: mapStatusToPipeline(record.status),
        projectId: record.projectId,
        createdAt: record.createdAt || "",
        updatedAt: record.updatedAt || record.createdAt || "",
        commentCount,
        comments: [],
        files: []
      };
    },
    [currentLang, users]
  );

  const refreshActiveLeads = useCallback(() => {
    if (activeView !== "pipeline") return;
    const ownerId = ownerFilter === "All" ? undefined : users.find((user) => user.name === ownerFilter)?.id;
    const params = {
      search: search.trim() || undefined,
      ownerId,
      projectId: projectFilter === "All" ? undefined : projectFilter,
      orderBy: sortField,
      page: 1,
      limit: 200
    };
    console.log("[Dashboard] getLeads params", params);
    dispatch(getLeadsAction(params));
  }, [activeView, dispatch, ownerFilter, projectFilter, search, sortField, users]);

  const fetchDeletedLeads = useCallback(async () => {
    try {
      const response = await leadApi.getLeads({ status: "DELETED", page: 1, limit: 200 });
      console.log("[Trash] fetched deleted leads", response.leads.length);
      setDeletedLeads(response.leads.map(mapLeadRecordToUi));
    } catch (error) {
      console.error("[Trash] failed to fetch deleted leads", error);
    }
  }, [mapLeadRecordToUi]);

  useEffect(() => {
    if (hasBootstrappedRef.current) return;
    hasBootstrappedRef.current = true;

    fetchData();
    dispatch(getUsers({ page: 1, limit: 200 }));
    dispatch(getProjectsAction({ page: 1, limit: 200 }));
    fetchDeletedLeads();
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, [dispatch, fetchDeletedLeads]);

  useEffect(() => {
    refreshActiveLeads();
  }, [refreshActiveLeads]);

  useEffect(() => {
    if (!isModalOpen) return;
    console.log("[LeadModal] fetching owners from users API for dropdown");
    dispatch(getUsers({ page: 1, limit: 100 }));
  }, [dispatch, isModalOpen]);

  useEffect(() => {
    if (!isProjectModalOpen) return;
    console.log("[ProjectModal] fetching users API for project manager dropdown");
    dispatch(getUsers({ page: 1, limit: 200 }));
  }, [dispatch, isProjectModalOpen]);

  useEffect(() => {
    if (!closingLead) return;
    console.log("[DealModal] fetching owners from users API for dropdown");
    dispatch(getUsers({ page: 1, limit: 200 }));
  }, [closingLead, dispatch]);

  useEffect(() => {
    if (usersError) {
      console.error("[LeadModal] users fetch error", usersError);
    }
  }, [usersError]);

  useEffect(() => {
    if (leadsError) {
      console.error("[Dashboard] leads fetch error", leadsError);
    }
  }, [leadsError]);

  useEffect(() => {
    if (usersListStatus === "loading") console.log("[LeadModal] users loading");
    if (usersListStatus === "succeeded") console.log("[LeadModal] users loaded", users.length);
  }, [users.length, usersListStatus]);

  useEffect(() => {
    if (leadsListStatus === "loading") console.log("[Dashboard] leads loading");
    if (leadsListStatus === "succeeded") console.log("[Dashboard] leads loaded", leadRecords.length);
  }, [leadRecords.length, leadsListStatus]);

  useEffect(() => {
    setLeads(leadRecords.map(mapLeadRecordToUi));
  }, [leadRecords, mapLeadRecordToUi]);

  const buildUiLeadFromRecord = useCallback(
    (
      record: {
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
        status: string;
        projectId?: string;
        createdAt?: string;
        updatedAt?: string;
        commentCount?: number | string;
        comments?: unknown[];
      },
      fallback?: Lead
    ): Lead => {
      const notFoundText = currentLang === "de" ? "Nicht gefunden" : "Not found";
      const ownerName = users.find((user) => user.id === record.ownerId)?.name || fallback?.ownerName || notFoundText;
      return {
        id: record.id,
        firstName: record.firstName || notFoundText,
        lastName: record.lastName || notFoundText,
        currentPosition: record.position || notFoundText,
        company: record.company || notFoundText,
        linkedinUrl: record.socialLinks?.linkedin || "",
        facebookUrl: record.socialLinks?.facebook || "",
        instagramUrl: record.socialLinks?.instagram || "",
        tiktokUrl: record.socialLinks?.tiktok || "",
        twitterUrl: record.socialLinks?.twitter || "",
        ownerName,
        phone: record.phone || notFoundText,
        email: record.email || notFoundText,
        birthday: record.birthday || "",
        pipelineStage: mapStatusToPipeline(record.status),
        projectId: record.projectId,
        createdAt: record.createdAt || "",
        updatedAt: record.updatedAt || record.createdAt || "",
        commentCount:
          typeof record.commentCount === "number"
            ? record.commentCount
            : typeof record.commentCount === "string"
              ? Number(record.commentCount) || 0
              : Array.isArray(record.comments)
                ? record.comments.length
                : fallback?.commentCount || fallback?.comments.length || 0,
        comments: fallback?.comments || [],
        files: fallback?.files || []
      };
    },
    [currentLang, users]
  );

  const mapApiCommentToUi = useCallback(
    (comment: { id: string; leadId: string; userId: string; text: string; createdAt?: string }) => {
      const authorName = users.find((user) => user.id === comment.userId)?.name || authUser?.name || "Unknown";
      return {
        id: comment.id,
        leadId: comment.leadId,
        author: authorName,
        text: comment.text,
        createdAt: comment.createdAt || comment.date || new Date().toISOString()
      };
    },
    [authUser?.name, users]
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ownersData, todosData, tasksData, projectsData, settingsData, dealsData] = await Promise.all([
        api.getOwners(),
        api.getTodos(),
        api.getTasks(),
        api.getProjects(),
        api.getSettings(),
        api.getDeals()
      ]);
      setOwners(ownersData);
      setTodos(todosData);
      setTasks(tasksData);
      setProjects(projectsData);
      setUserSettings(settingsData);
      setDeals(dealsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const uniqueOwners = useMemo(() => {
    return Array.from(new Set(users.map((u) => u.name))).sort();
  }, [users]);

  const projectOptions = useMemo(() => {
    return projectRecords.map((project) => ({
      id: project.id,
      title: project.title,
      description: project.description || "",
      managerName:
        project.projectManagerName || users.find((user) => user.id === project.projectManagerId)?.name || "",
      createdAt: project.createdAt || ""
    }));
  }, [projectRecords, users]);

  useEffect(() => {
    if (projectFilter === "All") return;
    const selectedProject = projectOptions.find((project) => project.id === projectFilter);
    console.log("[Dashboard] selected project filter", {
      projectId: projectFilter,
      projectTitle: selectedProject?.title || null
    });
  }, [projectFilter, projectOptions]);

  const trashedLeadsCount = useMemo(() => deletedLeads.length, [deletedLeads]);

  const handleExport = () => {
    if (leads.length === 0) return;
    const notFoundText = currentLang === "de" ? "Nicht gefunden" : "Not found";
    const safeDate = (value?: string) => {
      if (!value) return notFoundText;
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? notFoundText : parsed.toLocaleDateString();
    };
    const exportData = leads.map((l) => ({
      ID: l.id,
      Vorname: l.firstName,
      Nachname: l.lastName,
      Position: l.currentPosition,
      Firma: l.company || "",
      Betreuer: l.ownerName,
      Status: l.pipelineStage,
      Projekt:
        projectOptions.find((p) => p.id === l.projectId)?.title || (currentLang === "de" ? "Kein Projekt" : "No Project"),
      Datum: safeDate(l.createdAt)
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
    XLSX.writeFile(workbook, `LeadGenerator_Leads_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const sendPushNotification = useCallback(async (title: string, body: string) => {
    const settings = await api.getSettings();
    if (!settings.pushNotificationsEnabled) return;
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body });
    }
  }, []);

  const handleSaveDeal = async (dealData: DealModalSubmitPayload) => {
    const currency = dealData.currency === "USD" ? "DOLLAR" : "EURO";
    const payload = {
      name: dealData.name,
      leadId: dealData.leadId,
      ownerId: dealData.ownerId,
      projectId: dealData.projectId,
      dealType: dealData.dealType,
      currency,
      totalAmount: dealData.totalAmount,
      startDate: dealData.startDate,
      endDate: dealData.endDate,
      description: dealData.description
    };

    try {
      console.log("[Deal] create payload", payload);
      const result = await dispatch(createDealApiAction(payload));
      if (!createDealApiAction.fulfilled.match(result)) {
        console.error("[Deal] create rejected", result);
        setToastState({
          open: true,
          type: "error",
          message:
            (result.payload as string) ||
            (currentLang === "de" ? "Abschluss konnte nicht erstellt werden." : "Failed to create deal.")
        });
        return;
      }
      console.log("[Deal] create success", result.payload);
      setToastState({
        open: true,
        type: "success",
        message: result.payload.message || (currentLang === "de" ? "Abschluss erfolgreich erstellt." : "Deal created successfully.")
      });

      const created = result.payload.deal;
      const mapDealTypeToLocal = (value?: string): DealType => {
        if (value === "ONLINE_TRADING") return DealType.ONLINE_TRAINING;
        if (value === "OFF_SITE") return DealType.OFFSITE;
        return DealType.CONSULTING;
      };
      const localDeal: Deal = {
        id: created.id,
        leadId: created.leadId,
        projectId: created.projectId,
        name: created.name,
        type: mapDealTypeToLocal(created.dealType),
        totalAmount: created.totalAmount,
        currency: created.currency === "DOLLAR" ? "USD" : "EUR",
        startDate: created.startDate,
        endDate: created.endDate,
        description: created.description || "",
        createdAt: created.createdAt || new Date().toISOString()
      };
      setDeals((prev) => [localDeal, ...prev]);

      const currencySymbol = dealData.currency === "USD" ? "$" : "€";
      const notificationTitle = t.deal.notificationTitle;
      const notificationBody = t.deal.notificationBody
        .replace("{owner}", closingLead?.ownerName || "Jemand")
        .replace("{name}", dealData.name)
        .replace("{amount}", dealData.totalAmount.toString())
        .replace("{currency}", currencySymbol);
      sendPushNotification(notificationTitle, notificationBody);
      setClosingLead(null);
    } catch (error) {
      console.error("Failed to save deal:", error);
      setToastState({
        open: true,
        type: "error",
        message: error instanceof Error ? error.message : currentLang === "de" ? "Abschluss konnte nicht erstellt werden." : "Failed to create deal."
      });
    }
  };

  const handleAssignTask = async (text: string, deadline?: string) => {
    if (!taskingOwner) return;
    try {
      await api.assignTask(taskingOwner.id, "M. Nutzer", text, deadline);
      sendPushNotification(
        currentLang === "de" ? "Neue Aufgabe zugewiesen" : "New Task Assigned",
        `${taskingOwner.name} ${currentLang === "de" ? "hat eine neue Aufgabe erhalten" : "received a new task"}: ${text}`
      );
      fetchData();
    } catch (error) {
      console.error("Failed to assign task:", error);
    }
  };

  const handleCreateProject = async (projectPayload: CreateProjectPayload) => {
    try {
      console.log("[Project] create payload", projectPayload);
      const result = await dispatch(createProjectApiAction(projectPayload));
      if (!createProjectApiAction.fulfilled.match(result)) {
        console.error("[Project] create rejected", result);
        setToastState({
          open: true,
          type: "error",
          message:
            (result.payload as string) ||
            (currentLang === "de" ? "Projekt konnte nicht erstellt werden." : "Failed to create project.")
        });
        return;
      }
      console.log("[Project] create success", result.payload);
      const created = result.payload.project;
      const managerName = users.find((user) => user.id === created.projectManagerId)?.name || created.projectManagerName || "";
      const localProject: Project = {
        id: created.id,
        title: created.title,
        description: created.description || "",
        managerName,
        createdAt: created.createdAt || new Date().toISOString()
      };
      setProjects((prev) => [localProject, ...prev]);
      setToastState({
        open: true,
        type: "success",
        message: result.payload.message || (currentLang === "de" ? "Projekt erfolgreich erstellt." : "Project created successfully.")
      });
      setIsProjectModalOpen(false);
    } catch (error) {
      console.error("Failed to create project:", error);
      setToastState({
        open: true,
        type: "error",
        message: error instanceof Error ? error.message : currentLang === "de" ? "Projekt konnte nicht erstellt werden." : "Failed to create project."
      });
    }
  };

  const handleDeleteLead = useCallback(async (id: string) => {
    console.log("[Lead] delete request", id);
    try {
      const result = await dispatch(deleteLeadAction(id));
      if (deleteLeadAction.fulfilled.match(result)) {
        console.log("[Lead] delete success", result.payload);
        setLeads((prev) => prev.filter((lead) => lead.id !== id));
        setSelectedLead((prev) => (prev?.id === id ? null : prev));
        await fetchDeletedLeads();
      } else {
        console.error("[Lead] delete rejected", result);
      }
    } catch (error) {
      console.error("[Lead] delete failed", error);
    }
  }, [dispatch, fetchDeletedLeads]);

  const handleOpenTrashModal = useCallback(async () => {
    setIsTrashModalOpen(true);
    await fetchDeletedLeads();
  }, [fetchDeletedLeads]);

  const handleRestoreDeletedLead = useCallback(
    async (id: string) => {
      try {
        const result = await dispatch(
          updateLeadAction({
            leadId: id,
            data: { status: "IDENTIFIED" }
          })
        );
        if (!updateLeadAction.fulfilled.match(result)) {
          console.error("[Trash] restore rejected", result);
          return;
        }
        console.log("[Trash] restore success", result.payload);
        await Promise.all([fetchDeletedLeads(), Promise.resolve(refreshActiveLeads())]);
      } catch (error) {
        console.error("[Trash] restore failed", error);
      }
    },
    [dispatch, fetchDeletedLeads, refreshActiveLeads]
  );

  const handlePermanentDeleteLead = useCallback(
    async (id: string) => {
      try {
        const result = await dispatch(deleteLeadAction(id));
        if (!deleteLeadAction.fulfilled.match(result)) {
          console.error("[Trash] permanent delete rejected", result);
          return;
        }
        console.log("[Trash] permanent delete success", result.payload);
        await fetchDeletedLeads();
      } catch (error) {
        console.error("[Trash] permanent delete failed", error);
      }
    },
    [dispatch, fetchDeletedLeads]
  );

  const handleLeadClick = useCallback(
    async (lead: Lead) => {
      console.log("[Lead] getLeadById request", lead.id);
      try {
        const result = await dispatch(getLeadByIdAction(lead.id));
        if (getLeadByIdAction.fulfilled.match(result)) {
          console.log("[Lead] getLeadById success", result.payload);
          const detailedLead = buildUiLeadFromRecord(result.payload.lead, lead);
          detailedLead.ownerName =
            result.payload.owner?.name || users.find((user) => user.id === result.payload.lead.ownerId)?.name || detailedLead.ownerName;
          detailedLead.availableProjects = (result.payload.projects || []).map((project) => ({
            id: project.id,
            title: project.title,
            description: project.description || "",
            managerName: users.find((user) => user.id === project.projectManagerId)?.name || "",
            createdAt: ""
          }));
          detailedLead.deals = (result.payload.deals || []).map((deal) => ({
            id: deal.id,
            leadId: deal.leadId,
            projectId: deal.projectId || undefined,
            name: deal.name,
            type:
              deal.dealType === "ONLINE_TRADING"
                ? DealType.ONLINE_TRAINING
                : deal.dealType === "OFF_SITE"
                  ? DealType.OFFSITE
                  : DealType.CONSULTING,
            totalAmount: Number(deal.totalAmount || 0),
            currency: deal.currency === "DOLLAR" ? "USD" : deal.currency === "EURO" ? "EUR" : deal.currency,
            startDate: deal.startDate,
            endDate: deal.endDate,
            description: deal.description || "",
            createdAt: deal.createdAt || new Date().toISOString()
          }));
          detailedLead.linkedTodos = (result.payload.tasks || []).map((task) => ({
            id: task.id,
            text: task.description,
            deadline: task.deadline,
            isCompleted: !!task.completed,
            createdAt: task.createdAt || new Date().toISOString(),
            leadId: task.leadId,
            assignedToOwnerId: task.assignedTo
          }));
          detailedLead.comments = (result.payload.comments || []).map((comment) => mapApiCommentToUi(comment));
          detailedLead.commentCount = detailedLead.comments.length;
          setSelectedLead(detailedLead);
          setLeads((prev) => prev.map((item) => (item.id === detailedLead.id ? detailedLead : item)));
          return;
        }
        console.error("[Lead] getLeadById rejected", result);
      } catch (error) {
        console.error("[Lead] getLeadById failed", error);
      }
      setSelectedLead(lead);
    },
    [buildUiLeadFromRecord, dispatch, mapApiCommentToUi]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const leadId = active.id as string;
    if (over.id === "trash") {
      const lead = leads.find((l) => l.id === leadId);
      if (lead && window.confirm(t.trash.confirmMove)) handleDeleteLead(leadId);
    } else {
      const newStage = over.id as PipelineStage;
      handleMoveLead(leadId, newStage);
    }
  };

  const handleMoveLead = async (leadId: string, newStage: PipelineStage) => {
    try {
      const leadBeforeUpdate = leads.find((l) => l.id === leadId);
      let movedLead: Lead | null = null;
      const statusMap: Record<PipelineStage, string> = {
        [PipelineStage.IDENTIFIED]: "IDENTIFIED",
        [PipelineStage.CONTACTED]: "CONTACTED",
        [PipelineStage.QUALIFIED]: "QUALIFIED",
        [PipelineStage.NEGOTIATION]: "NEGOTIATION",
        [PipelineStage.CLOSED]: "CLOSED",
        [PipelineStage.TRASH]: "IDENTIFIED"
      };
      const payload = {
        leadId,
        data: {
          status: statusMap[newStage]
        }
      };
      console.log("[Lead] drag update payload", payload);
      const result = await dispatch(updateLeadAction(payload));
      if (updateLeadAction.fulfilled.match(result)) {
        console.log("[Lead] drag update success", result.payload);
        const fallbackLead = leads.find((l) => l.id === leadId);
        const updatedLead = buildUiLeadFromRecord(result.payload.lead, fallbackLead || undefined);
        movedLead = updatedLead;
        setLeads((prev) => prev.map((l) => (l.id === leadId ? updatedLead : l)));
        setSelectedLead((prev) => (prev?.id === leadId ? updatedLead : prev));
      } else {
        console.error("[Lead] drag update rejected", result);
        return;
      }
      if (newStage === PipelineStage.CLOSED && leadBeforeUpdate?.pipelineStage !== PipelineStage.CLOSED) {
        setClosingLead(movedLead || leadBeforeUpdate || null);
      }
    } catch (error) {
      console.error("[Lead] drag update failed", error);
    }
  };

  const handleUpdateLead = async (updates: Partial<Lead>) => {
    if (!selectedLead) return;
    const notFoundTokens = new Set(["Not found", "Nicht gefunden"]);
    const clean = (value?: string) => {
      if (!value) return undefined;
      const trimmed = value.trim();
      if (!trimmed || notFoundTokens.has(trimmed)) return undefined;
      return trimmed;
    };
    const mergedLead = { ...selectedLead, ...updates };
    const statusMap: Record<PipelineStage, string> = {
      [PipelineStage.IDENTIFIED]: "IDENTIFIED",
      [PipelineStage.CONTACTED]: "CONTACTED",
      [PipelineStage.QUALIFIED]: "QUALIFIED",
      [PipelineStage.NEGOTIATION]: "NEGOTIATION",
      [PipelineStage.CLOSED]: "CLOSED",
      [PipelineStage.TRASH]: "IDENTIFIED"
    };

    const ownerIdFromName = users.find((user) => user.name === mergedLead.ownerName)?.id;
    const payload = {
      leadId: selectedLead.id,
      data: {
        ownerId: ownerIdFromName,
        firstName: clean(mergedLead.firstName),
        lastName: clean(mergedLead.lastName),
        position: clean(mergedLead.currentPosition),
        company: clean(mergedLead.company),
        email: clean(mergedLead.email),
        phone: clean(mergedLead.phone),
        birthday: clean(mergedLead.birthday),
        socialLinks: {
          ...(clean(mergedLead.linkedinUrl) ? { linkedin: clean(mergedLead.linkedinUrl) as string } : {}),
          ...(clean(mergedLead.facebookUrl) ? { facebook: clean(mergedLead.facebookUrl) as string } : {}),
          ...(clean(mergedLead.instagramUrl) ? { instagram: clean(mergedLead.instagramUrl) as string } : {}),
          ...(clean(mergedLead.twitterUrl) ? { twitter: clean(mergedLead.twitterUrl) as string } : {}),
          ...(clean(mergedLead.tiktokUrl) ? { tiktok: clean(mergedLead.tiktokUrl) as string } : {})
        },
        status: statusMap[mergedLead.pipelineStage || PipelineStage.IDENTIFIED],
        projectId: mergedLead.projectId
      }
    };

    if (Object.keys(payload.data.socialLinks).length === 0) {
      delete payload.data.socialLinks;
    }

    console.log("[Lead] update payload", payload);
    try {
      const result = await dispatch(updateLeadAction(payload));
      if (updateLeadAction.fulfilled.match(result)) {
        console.log("[Lead] update success", result.payload);
        const updatedLead = buildUiLeadFromRecord(result.payload.lead, mergedLead);
        setLeads((prev) => prev.map((lead) => (lead.id === selectedLead.id ? updatedLead : lead)));
        setSelectedLead(updatedLead);
      } else {
        console.error("[Lead] update rejected", result);
      }
    } catch (error) {
      console.error("[Lead] update failed", error);
    }
  };

  const handleAddComment = async (text: string) => {
    if (!selectedLead) return;
    if (!authUser?.userId) {
      console.error("[Comment] create failed: missing auth user id");
      return;
    }
    try {
      const result = await dispatch(
        createCommentAction({
          userId: authUser.userId,
          leadId: selectedLead.id,
          text: text.trim()
        })
      );
      if (!createCommentAction.fulfilled.match(result)) {
        console.error("[Comment] create rejected", result);
        return;
      }

      const newComment = mapApiCommentToUi(result.payload.comment);
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === selectedLead.id
            ? {
                ...lead,
                comments: [...lead.comments, newComment],
                commentCount: (lead.commentCount ?? lead.comments.length) + 1
              }
            : lead
        )
      );
      setSelectedLead((prev) =>
        prev
          ? {
              ...prev,
              comments: [...prev.comments, newComment],
              commentCount: (prev.commentCount ?? prev.comments.length) + 1
            }
          : null
      );
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleUpdateComment = async (commentId: string, text: string) => {
    if (!selectedLead) return;
    const trimmedText = text.trim();
    if (!trimmedText) return;

    try {
      console.log("[Comment] update payload", { commentId, textLength: trimmedText.length });
      const result = await dispatch(
        updateCommentAction({
          commentId,
          text: trimmedText
        })
      );

      if (!updateCommentAction.fulfilled.match(result)) {
        console.error("[Comment] update rejected", result);
        setToastState({
          open: true,
          type: "error",
          message:
            (result.payload as string) ||
            (currentLang === "de" ? "Kommentar konnte nicht aktualisiert werden." : "Failed to update comment.")
        });
        return;
      }

      const updatedComment = mapApiCommentToUi(result.payload.comment);
      console.log("[Comment] update success", updatedComment);
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === selectedLead.id
            ? {
                ...lead,
                comments: lead.comments.map((comment) => (comment.id === commentId ? updatedComment : comment))
              }
            : lead
        )
      );
      setSelectedLead((prev) =>
        prev
          ? {
              ...prev,
              comments: prev.comments.map((comment) => (comment.id === commentId ? updatedComment : comment))
            }
          : null
      );
      setToastState({
        open: true,
        type: "success",
        message: currentLang === "de" ? "Kommentar aktualisiert." : "Comment updated successfully."
      });
    } catch (error) {
      console.error("[Comment] update failed", error);
      setToastState({
        open: true,
        type: "error",
        message: error instanceof Error ? error.message : currentLang === "de" ? "Kommentar konnte nicht aktualisiert werden." : "Failed to update comment."
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!selectedLead) return;

    try {
      console.log("[Comment] delete payload", { commentId });
      const result = await dispatch(
        deleteCommentAction({
          commentId
        })
      );

      if (!deleteCommentAction.fulfilled.match(result)) {
        console.error("[Comment] delete rejected", result);
        setToastState({
          open: true,
          type: "error",
          message:
            (result.payload as string) ||
            (currentLang === "de" ? "Kommentar konnte nicht gelöscht werden." : "Failed to delete comment.")
        });
        return;
      }

      console.log("[Comment] delete success", result.payload);
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === selectedLead.id
            ? {
                ...lead,
                comments: lead.comments.filter((comment) => comment.id !== commentId),
                commentCount: Math.max((lead.commentCount ?? lead.comments.length) - 1, 0)
              }
            : lead
        )
      );
      setSelectedLead((prev) =>
        prev
          ? {
              ...prev,
              comments: prev.comments.filter((comment) => comment.id !== commentId),
              commentCount: Math.max((prev.commentCount ?? prev.comments.length) - 1, 0)
            }
          : null
      );
      setToastState({
        open: true,
        type: "success",
        message: currentLang === "de" ? "Kommentar gelöscht." : "Comment deleted successfully."
      });
    } catch (error) {
      console.error("[Comment] delete failed", error);
      setToastState({
        open: true,
        type: "error",
        message: error instanceof Error ? error.message : currentLang === "de" ? "Kommentar konnte nicht gelöscht werden." : "Failed to delete comment."
      });
    }
  };

  const handleCreateLead = async (leadData: Partial<Lead>) => {
    try {
      const owner = users.find((u) => u.name === leadData.ownerName);
      const statusMap: Record<PipelineStage, string> = {
        [PipelineStage.IDENTIFIED]: "IDENTIFIED",
        [PipelineStage.CONTACTED]: "CONTACTED",
        [PipelineStage.QUALIFIED]: "QUALIFIED",
        [PipelineStage.NEGOTIATION]: "NEGOTIATION",
        [PipelineStage.CLOSED]: "CLOSED",
        [PipelineStage.TRASH]: "IDENTIFIED"
      };

      const payload = {
        ownerId: owner?.id || "",
        firstName: leadData.firstName || "",
        lastName: leadData.lastName || "",
        position: leadData.currentPosition || "",
        company: leadData.company || "",
        email: leadData.email || "",
        phone: leadData.phone || "",
        birthday: leadData.birthday || undefined,
        socialLinks: leadData.linkedinUrl ? { linkedin: leadData.linkedinUrl } : undefined,
        status: statusMap[leadData.pipelineStage || PipelineStage.IDENTIFIED]
      };

      console.log("[Lead] create payload", payload);
      const result = await dispatch(createLeadAction(payload));

      if (createLeadAction.fulfilled.match(result)) {
        console.log("[Lead] create success", result.payload);
        setToastState({
          open: true,
          type: "success",
          message: result.payload.message || (currentLang === "de" ? "Lead erfolgreich erstellt." : "Lead created successfully.")
        });
        const created = result.payload.lead;
        const mapStatusToPipeline = (status?: string): PipelineStage => {
          if (status === "CONTACTED") return PipelineStage.CONTACTED;
          if (status === "QUALIFIED") return PipelineStage.QUALIFIED;
          if (status === "NEGOTIATION") return PipelineStage.NEGOTIATION;
          if (status === "CLOSED") return PipelineStage.CLOSED;
          return PipelineStage.IDENTIFIED;
        };

        const localLead: Lead = {
          id: created.id,
          firstName: created.firstName || payload.firstName,
          lastName: created.lastName || payload.lastName,
          currentPosition: created.position || payload.position,
          company: created.company || payload.company,
          linkedinUrl: created.socialLinks?.linkedin || leadData.linkedinUrl || "",
          ownerName: owner?.name || leadData.ownerName || "",
          phone: created.phone || payload.phone,
          email: created.email || payload.email,
          birthday: created.birthday || payload.birthday,
          pipelineStage: mapStatusToPipeline(created.status),
          createdAt: created.createdAt || new Date().toISOString(),
          updatedAt: created.updatedAt || new Date().toISOString(),
          comments: [],
          files: []
        };

        setLeads((prev) => [localLead, ...prev]);
      } else {
        console.error("[Lead] create rejected", result);
        setToastState({
          open: true,
          type: "error",
          message:
            (result.payload as string) ||
            (currentLang === "de" ? "Lead konnte nicht erstellt werden." : "Failed to create lead.")
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create lead:", error);
      setToastState({
        open: true,
        type: "error",
        message: error instanceof Error ? error.message : currentLang === "de" ? "Lead konnte nicht erstellt werden." : "Failed to create lead."
      });
    }
  };

  const filteredLeads = useMemo(() => {
    return leads
      .filter((l) => {
        if (l.pipelineStage === PipelineStage.TRASH) return false;
        const matchesSearch =
          `${l.firstName} ${l.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
          l.currentPosition.toLowerCase().includes(search.toLowerCase());
        const matchesOwner = ownerFilter === "All" || l.ownerName === ownerFilter;
        // Project filtering is performed at API level via getLeads params.
        // Some API responses may omit projectId in list items, so avoid re-filtering client-side by projectId.
        return matchesSearch && matchesOwner;
      })
      .sort((a, b) => {
        const valA = a[sortField] || "";
        const valB = b[sortField] || "";
        return sortOrder === "asc" ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
      });
  }, [leads, search, ownerFilter, sortField, sortOrder]);

  const drawerProjects = useMemo(() => {
    const merged = new Map<string, Project>();
    projectOptions.forEach((project) => merged.set(project.id, project));
    (selectedLead?.availableProjects || []).forEach((project) => merged.set(project.id, project));
    return Array.from(merged.values());
  }, [projectOptions, selectedLead?.availableProjects]);

  const renderMainView = () => {
    if (activeView === "analytics")
      return <AnalyticsDashboard deals={deals} leads={leads} owners={owners} projects={projects} lang={currentLang} />;
    if (activeView === "todos") return <TodoDashboard lang={currentLang} />;
    if (activeView === "sent_tasks") return <SentTasksDashboard lang={currentLang} />;
    if (activeView === "my_projects") return <MyProjectsDashboard lang={currentLang} />;
    if (activeView === "settings") return <SettingsDashboard lang={currentLang} onSettingsUpdate={fetchData} />;
    if (activeView === "user_mgmt") return <UserManagementDashboard lang={currentLang} />;

    return (
      <div className="flex-1 p-8 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold text-gray-900">{t.pipeline.title}</h2>
          <div className="text-sm text-gray-500">
            {t.pipeline.total}: <span className="font-bold text-gray-900">{filteredLeads.length}</span> Leads
          </div>
        </div>
        {loading || leadsListStatus === "loading" ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-600" size={48} />
          </div>
        ) : (
          <KanbanBoard
            leads={filteredLeads}
            onLeadClick={handleLeadClick}
            onAddDeal={setClosingLead}
            lang={currentLang}
          />
        )}
      </div>
    );
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col">
          <div className="p-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="text-white" size={18} />
              </div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">LeadGen Pro</h1>
            </div>
          </div>

          <nav className="flex-1 px-4 overflow-y-auto space-y-6">
            <div className="space-y-1">
              <button
                onClick={() => setActiveView("pipeline")}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-all ${activeView === "pipeline" ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-50"}`}
              >
                <LayoutDashboard size={20} /> <span>Dashboard</span>
              </button>
              <button
                onClick={() => setActiveView("analytics")}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-all ${activeView === "analytics" ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-50"}`}
              >
                <PieChart size={20} /> <span>Analytics</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-3">
                <div className="flex items-center space-x-2 text-gray-400">
                  <Users size={16} />
                  {/* Fixed: replaced 'lang' with 'currentLang' to fix find name 'lang' error */}
                  <span className="text-xs font-bold uppercase tracking-widest">
                    {currentLang === "de" ? "Admin Bereich" : "Admin Area"}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveView("user_mgmt")}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-all ${activeView === "user_mgmt" ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-50"}`}
                >
                  <ShieldCheck size={18} /> <span className="text-xs font-bold">{t.userMgmt.title}</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-3">
                <div className="flex items-center space-x-2 text-gray-400">
                  <Briefcase size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest">{t.sidebar.myArea}</span>
                </div>
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveView("todos")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${activeView === "todos" ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-50"}`}
                >
                  <div className="flex items-center space-x-3">
                    <CheckSquare size={18} /> <span className="text-xs font-bold">{t.sidebar.myTodos}</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveView("my_projects")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${activeView === "my_projects" ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-50"}`}
                >
                  <div className="flex items-center space-x-3">
                    <FolderKanban size={18} /> <span className="text-xs font-bold">{t.sidebar.myProjects}</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveView("settings")}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-all ${activeView === "settings" ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-50"}`}
                >
                  <Settings size={18} /> <span className="text-xs font-bold">{t.sidebar.settings}</span>
                </button>
              </div>
            </div>
          </nav>
        </aside>

        <main className="flex-1 flex flex-col min-w-0">
          <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-40">
            {/* Search and Filters */}
            <div className="flex items-center flex-1 max-w-3xl space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder={t.header.searchPlaceholder}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Advanced Header Filters */}
              <div className="flex items-center space-x-2 bg-gray-50 p-1 rounded-xl">
                <div className="px-2 text-gray-400">
                  <Filter size={14} />
                </div>
                <select
                  className="bg-transparent text-xs font-semibold text-gray-600 border-none focus:ring-0 py-1"
                  value={ownerFilter}
                  onChange={(e) => setOwnerFilter(e.target.value)}
                >
                  <option value="All">{t.header.allOwners}</option>
                  {uniqueOwners.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                <div className="w-[1px] h-4 bg-gray-200 mx-1" />
                <select
                  className="bg-transparent text-xs font-semibold text-gray-600 border-none focus:ring-0 py-1 max-w-[120px]"
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                >
                  <option value="All">{t.header.allProjects}</option>
                  {projectOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions: Download, Trash, Projects, Create Lead */}
            <div className="flex items-center space-x-3 ml-6">
              <div className="flex items-center space-x-2 mr-2">
                <span className="text-xs text-gray-400 font-medium">{t.header.sortBy}</span>
                <button
                  onClick={() => setSortField(sortField === "lastName" ? "createdAt" : "lastName")}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  {sortField === "lastName" ? t.header.lastName : t.header.date}
                </button>
              </div>

              <button
                onClick={handleExport}
                className="p-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center shadow-sm group"
                title={t.header.exportTitle}
              >
                <Download size={20} className="text-emerald-600 group-hover:scale-110 transition-transform" />
              </button>

              <TrashBin onClick={handleOpenTrashModal} count={trashedLeadsCount} />

              <button
                onClick={() => setIsProjectModalOpen(true)}
                className="bg-white text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all flex items-center shadow-sm"
              >
                {/* Fixed: replaced 'lang' with 'currentLang' to fix find name 'lang' error */}
                <FolderPlus size={18} className="mr-2 text-indigo-600" />{" "}
                {currentLang === "de" ? "Projekt anlegen" : "Create Project"}
              </button>

              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center"
              >
                <Plus size={18} className="mr-2" /> {t.header.captureLead}
              </button>

              <button
                onClick={() => {
                  dispatch(signOutLocal());
                  navigate("/sign-in?signedOut=1", { replace: true });
                }}
                className="bg-white text-gray-700 border border-gray-200 px-3 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all flex items-center shadow-sm"
                title="Sign out"
              >
                <LogOut size={16} className="mr-2 text-gray-500" />
                Sign out
              </button>
            </div>
          </header>
          {renderMainView()}
        </main>

        <LeadDetailDrawer
          lead={selectedLead}
          projects={drawerProjects}
          owners={users.map((u) => ({ id: u.id, name: u.name }))}
          onClose={() => setSelectedLead(null)}
          onUpdate={handleUpdateLead}
          onAddComment={handleAddComment}
          onUpdateComment={handleUpdateComment}
          onDeleteComment={handleDeleteComment}
          onDelete={handleDeleteLead}
          lang={currentLang}
        />
        {isModalOpen && (
          <LeadModal
            owners={users.map((u) => ({ id: u.id, name: u.name }))}
            onClose={() => setIsModalOpen(false)}
            onSave={handleCreateLead}
            lang={currentLang}
          />
        )}
        {isProjectModalOpen && (
          <ProjectModal
            leads={leads}
            owners={users.map((u) => ({ id: u.id, name: u.name, role: u.role }))}
            lang={currentLang}
            onClose={() => setIsProjectModalOpen(false)}
            onSave={handleCreateProject}
          />
        )}
        {isTrashModalOpen && (
          <TrashModal
            leads={deletedLeads}
            lang={currentLang}
            onClose={() => setIsTrashModalOpen(false)}
            onRestore={handleRestoreDeletedLead}
            onPermanentDelete={handlePermanentDeleteLead}
          />
        )}
        {taskingOwner && (
          <TaskModal
            owner={taskingOwner}
            onClose={() => setTaskingOwner(null)}
            onAssign={handleAssignTask}
            lang={currentLang}
          />
        )}
        {closingLead && (
          <DealModal
            lead={closingLead}
            projects={projects}
            owners={users.map((u) => ({ id: u.id, name: u.name }))}
            lang={currentLang}
            onClose={() => setClosingLead(null)}
            onSave={handleSaveDeal}
          />
        )}
        <Toast
          isOpen={toastState.open}
          type={toastState.type}
          message={toastState.message}
          onClose={() => setToastState((prev) => ({ ...prev, open: false, message: "" }))}
        />
      </div>
    </DndContext>
  );
};

export default App;
