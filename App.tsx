import React, { useState, useEffect, useMemo, useCallback } from "react";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import {
  Lead,
  PipelineStage,
  SortField,
  SortOrder,
  LeadFile,
  Owner,
  Task,
  Todo,
  Project,
  UserSettings,
  Deal
} from "./types";
import { api } from "./services/api";
import KanbanBoard from "./components/KanbanBoard";
import LeadDetailDrawer from "./components/LeadDetailDrawer";
import LeadModal from "./components/LeadModal";
import ProjectModal from "./components/ProjectModal";
import ShareModal from "./components/ShareModal";
import TrashBin from "./components/TrashBin";
import TaskModal from "./components/TaskModal";
import DealModal from "./components/DealModal";
import TodoDashboard from "./components/TodoDashboard";
import SentTasksDashboard from "./components/SentTasksDashboard";
import MyProjectsDashboard from "./components/MyProjectsDashboard";
import SettingsDashboard from "./components/SettingsDashboard";
import EmailSettingsDashboard from "./components/EmailSettingsDashboard";
import UserManagementDashboard from "./components/UserManagementDashboard";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import TrashModal from "./components/TrashModal";
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
import { useAppDispatch } from "./store/hooks";
import { signOutLocal } from "./store/slices/authSlice";


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
  const [activeView, setActiveView] = useState<ViewType>("pipeline");
  const [leads, setLeads] = useState<Lead[]>([]);
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

  const [closingLead, setClosingLead] = useState<Lead | null>(null);
  const [taskingOwner, setTaskingOwner] = useState<Owner | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const [search, setSearch] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("All");
  const [projectFilter, setProjectFilter] = useState("All");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  useEffect(() => {
    fetchData();
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leadsData, ownersData, todosData, tasksData, projectsData, settingsData, dealsData] = await Promise.all([
        api.getLeads(),
        api.getOwners(),
        api.getTodos(),
        api.getTasks(),
        api.getProjects(),
        api.getSettings(),
        api.getDeals()
      ]);
      setLeads(leadsData);
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

  const currentLang = useMemo(() => userSettings?.language || "de", [userSettings]);

  const t = useMemo(() => {
    return translations[currentLang];
  }, [currentLang]);

  const uniqueOwners = useMemo(() => {
    return Array.from(new Set(owners.map((o) => o.name))).sort();
  }, [owners]);

  const trashedLeadsCount = useMemo(() => leads.filter((l) => l.pipelineStage === PipelineStage.TRASH).length, [leads]);

  const handleExport = () => {
    if (leads.length === 0) return;
    const exportData = leads.map((l) => ({
      ID: l.id,
      Vorname: l.firstName,
      Nachname: l.lastName,
      Position: l.currentPosition,
      Firma: l.company || "",
      Betreuer: l.ownerName,
      Status: l.pipelineStage,
      Projekt:
        projects.find((p) => p.id === l.projectId)?.title || (currentLang === "de" ? "Kein Projekt" : "No Project"),
      Datum: new Date(l.createdAt).toLocaleDateString()
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

  const handleSaveDeal = async (dealData: Omit<Deal, "id" | "createdAt">) => {
    try {
      await api.saveDeal(dealData);
      const currencySymbol = dealData.currency === "USD" ? "$" : "€";
      const notificationTitle = t.deal.notificationTitle;
      const notificationBody = t.deal.notificationBody
        .replace("{owner}", closingLead?.ownerName || "Jemand")
        .replace("{name}", dealData.name)
        .replace("{amount}", dealData.totalAmount.toString())
        .replace("{currency}", currencySymbol);
      sendPushNotification(notificationTitle, notificationBody);
      setClosingLead(null);
      fetchData();
    } catch (error) {
      console.error("Failed to save deal:", error);
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

  const handleCreateProject = async (projectData: Omit<Project, "id" | "createdAt">, leadIds: string[]) => {
    try {
      await api.createProject(projectData, leadIds);
      fetchData();
      setIsProjectModalOpen(false);
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  const handleDeleteLead = useCallback(
    async (id: string) => {
      try {
        const updatedLead = await api.updateLead(id, { pipelineStage: PipelineStage.TRASH });
        setLeads((prev) => prev.map((l) => (l.id === id ? updatedLead : l)));
        setSelectedLead(null);
      } catch (error) {
        console.error("Failed to move lead to trash:", error);
      }
    },
    [currentLang]
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
      const updatedLead = await api.updateLead(leadId, { pipelineStage: newStage });
      setLeads((prev) => prev.map((l) => (l.id === leadId ? updatedLead : l)));
      setSelectedLead((prev) => (prev?.id === leadId ? updatedLead : prev));
      if (newStage === PipelineStage.CLOSED && leadBeforeUpdate?.pipelineStage !== PipelineStage.CLOSED) {
        setClosingLead(updatedLead);
      }
    } catch (error) {
      console.error("Failed to move lead:", error);
    }
  };

  const handleUpdateLead = async (updates: Partial<Lead>) => {
    if (!selectedLead) return;
    try {
      const updatedLead = await api.updateLead(selectedLead.id, updates);
      setLeads((prev) => prev.map((l) => (l.id === selectedLead.id ? updatedLead : l)));
      setSelectedLead(updatedLead);
    } catch (error) {
      console.error("Failed to update lead:", error);
    }
  };

  const handleAddComment = async (text: string) => {
    if (!selectedLead) return;
    try {
      const newComment = await api.addComment(selectedLead.id, "M. Nutzer", text);
      const updatedLeads = leads.map((l) =>
        l.id === selectedLead.id ? { ...l, comments: [...l.comments, newComment] } : l
      );
      setLeads(updatedLeads);
      setSelectedLead((prev) => (prev ? { ...prev, comments: [...prev.comments, newComment] } : null));
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleCreateLead = async (leadData: Partial<Lead>) => {
    try {
      const newLead = await api.createLead(leadData);
      setLeads((prev) => [...prev, newLead]);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create lead:", error);
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
        const matchesProject = projectFilter === "All" || l.projectId === projectFilter;
        return matchesSearch && matchesOwner && matchesProject;
      })
      .sort((a, b) => {
        const valA = a[sortField] || "";
        const valB = b[sortField] || "";
        return sortOrder === "asc" ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
      });
  }, [leads, search, ownerFilter, projectFilter, sortField, sortOrder]);

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
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-600" size={48} />
          </div>
        ) : (
          <KanbanBoard
            leads={filteredLeads}
            onLeadClick={setSelectedLead}
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
                  {projects.map((p) => (
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

              <TrashBin onClick={() => setIsTrashModalOpen(true)} count={trashedLeadsCount} />

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
          projects={projects}
          onClose={() => setSelectedLead(null)}
          onUpdate={handleUpdateLead}
          onAddComment={handleAddComment}
          lang={currentLang}
        />
        {isModalOpen && (
          <LeadModal
            owners={owners}
            onClose={() => setIsModalOpen(false)}
            onSave={handleCreateLead}
            lang={currentLang}
          />
        )}
        {isProjectModalOpen && (
          <ProjectModal
            leads={leads}
            owners={owners}
            lang={currentLang}
            onClose={() => setIsProjectModalOpen(false)}
            onSave={handleCreateProject}
          />
        )}
        {isTrashModalOpen && (
          <TrashModal
            leads={leads.filter((l) => l.pipelineStage === PipelineStage.TRASH)}
            lang={currentLang}
            onClose={() => setIsTrashModalOpen(false)}
            onRestore={(id) => api.updateLead(id, { pipelineStage: PipelineStage.IDENTIFIED }).then(fetchData)}
            onPermanentDelete={(id) => api.saveLeads(leads.filter((l) => l.id !== id)).then(fetchData)}
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
            lang={currentLang}
            onClose={() => setClosingLead(null)}
            onSave={handleSaveDeal}
          />
        )}
      </div>
    </DndContext>
  );
};

export default App;
