import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FolderKanban, Users, Briefcase, Loader2, User, Edit2, Trash2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { translations, Language } from "../translations";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { getProjects, removeLeadFromProject } from "../store/actions/projectActions";
import { getLeads } from "../store/actions/leadActions";
import type { ProjectRecord } from "../store/slices/projectSlice";

interface MyProjectsDashboardProps {
  lang: Language;
  onEditProject?: (project: ProjectRecord) => void;
  onDeleteProject?: (project: ProjectRecord) => void;
}

const MyProjectsDashboard: React.FC<MyProjectsDashboardProps> = ({ lang, onEditProject, onDeleteProject }) => {
  const dispatch = useAppDispatch();
  const projects = useAppSelector((state) => state.projects.projects);
  const projectsStatus = useAppSelector((state) => state.projects.listStatus);
  const projectsTotal = useAppSelector((state) => state.projects.total);
  const projectsLimit = useAppSelector((state) => state.projects.limit);
  const leads = useAppSelector((state) => state.leads.leads);
  const leadsStatus = useAppSelector((state) => state.leads.listStatus);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [removingLeadId, setRemovingLeadId] = useState<string | null>(null);

  const t = useMemo(() => translations[lang], [lang]);
  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()),
    [projects]
  );
  const loading = projectsStatus === "loading" || leadsStatus === "loading";
  const totalPages = Math.max(1, Math.ceil(projectsTotal / (projectsLimit || limit)));

  useEffect(() => {
    void dispatch(getProjects({ page, limit }));
    void dispatch(getLeads({ page: 1, limit: 500 }));
  }, [dispatch, page]);

  const getLeadsForProject = (projectId: string) => {
    return leads.filter((l) => l.projectId === projectId);
  };

  const handleRemoveLeadFromProject = useCallback(
    async (projectId: string, leadId: string) => {
      setRemovingLeadId(leadId);
      try {
        const result = await dispatch(removeLeadFromProject({ projectId, leadId }));
        if (removeLeadFromProject.fulfilled.match(result)) {
          void dispatch(getLeads({ page: 1, limit: 500 }));
        }
      } finally {
        setRemovingLeadId(null);
      }
    },
    [dispatch]
  );

  return (
    <div className="flex-1 flex flex-col p-8 bg-white/50 backdrop-blur-sm rounded-3xl m-4 shadow-inner overflow-hidden">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t.myProjects.title}</h2>
        <p className="text-gray-500 mt-1">{t.myProjects.subtitle}</p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : projects.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-200">
              <FolderKanban size={32} />
            </div>
            <h3 className="text-gray-900 font-bold">{t.myProjects.noProjects}</h3>
            <p className="text-gray-400 text-sm max-w-[240px]">{t.myProjects.noProjectsDesc}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedProjects.map((project) => {
              const projectLeads = getLeadsForProject(project.id);
              const apiLeadCount = Number(project.leadCount ?? projectLeads.length);
              return (
                <div
                  key={project.id}
                  className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Briefcase size={22} />
                    </div>
                    <div className="flex items-center gap-2">
                      {onEditProject && (
                        <button
                          type="button"
                          onClick={() => onEditProject(project)}
                          className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title={lang === "de" ? "Projekt bearbeiten" : "Edit project"}
                        >
                          <Edit2 size={18} />
                        </button>
                      )}
                      {onDeleteProject && (
                        <button
                          type="button"
                          onClick={() => onDeleteProject(project)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title={lang === "de" ? "Projekt löschen" : "Delete project"}
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                      {/* Calendar icon and date display - removed per design
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <Calendar size={18} />
                        {project.createdAt
                          ? new Date(project.createdAt).toLocaleDateString(lang === "de" ? "de-DE" : "en-US")
                          : "-"}
                      </div>
                      */}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{project.title}</h3>
                  <div className="flex items-center gap-2 mb-4 text-xs font-bold text-indigo-600">
                    <User size={14} />
                    <span>
                      {t.myProjects.manager}: {project.projectManagerName || "-"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-6 min-h-[40px]">
                    {project.description || t.myProjects.noDesc}
                  </p>

                  <div className="mt-auto pt-6 border-t border-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-gray-400" />
                        <span className="text-xs font-bold text-gray-700">{t.myProjects.yourLeads}</span>
                      </div>
                      <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                        {Number.isFinite(apiLeadCount) ? apiLeadCount : 0}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {projectLeads.slice(0, 3).map((lead) => (
                        <div
                          key={lead.id}
                          className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-2"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-[8px] font-bold shrink-0">
                              {lead.firstName?.[0] ?? ""}
                              {lead.lastName?.[0] ?? ""}
                            </div>
                            <span className="text-xs font-semibold text-gray-800 truncate">
                              {lead.firstName} {lead.lastName}
                            </span>
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-white text-gray-400 rounded-md border border-gray-100 shrink-0">
                            {lead.status || "IDENTIFIED"}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveLeadFromProject(project.id, lead.id);
                            }}
                            disabled={removingLeadId === lead.id}
                            className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 shrink-0"
                            title={t.myProjects.removeLead}
                          >
                            {removingLeadId === lead.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <X size={14} />
                            )}
                          </button>
                        </div>
                      ))}
                      {projectLeads.length > 3 && (
                        <button className="w-full text-center py-2 text-[10px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors">
                          + {projectLeads.length - 3} {t.myProjects.more}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="mt-8 flex items-center justify-between gap-4 py-4 px-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
        <span className="text-sm font-semibold text-gray-600 bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-100">
          {t.common.pageLabel.replace("{page}", String(page)).replace("{total}", String(totalPages))}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1 || loading}
            className="inline-flex items-center justify-center gap-2 min-w-[100px] px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:border-transparent border border-gray-200 bg-white text-gray-700 hover:bg-blue-600 hover:text-white hover:border-blue-600"
          >
            <ChevronLeft size={18} />
            {t.common.previous}
          </button>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page >= totalPages || loading}
            className="inline-flex items-center justify-center gap-2 min-w-[100px] px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:border-transparent border border-gray-200 bg-white text-gray-700 hover:bg-blue-600 hover:text-white hover:border-blue-600"
          >
            {t.common.next}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyProjectsDashboard;
