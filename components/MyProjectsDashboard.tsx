
import React, { useState, useEffect, useMemo } from 'react';
import { 
  FolderKanban, Clock, Users, ChevronRight, 
  Briefcase, Loader2, Calendar, Target, User
} from 'lucide-react';
import { Project, Lead } from '../types';
import { api } from '../services/api';
import { translations, Language } from '../translations';

// Define props to accept lang from App.tsx
interface MyProjectsDashboardProps {
  lang: Language;
}

const MyProjectsDashboard: React.FC<MyProjectsDashboardProps> = ({ lang }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Use translations based on the provided lang prop
  const t = useMemo(() => translations[lang], [lang]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [projectsData, leadsData] = await Promise.all([
      api.getProjects(),
      api.getLeads()
    ]);
    setProjects(projectsData);
    setLeads(leadsData);
    setLoading(false);
  };

  // Filter projects where "M. Nutzer" is a participant (owner of at least one lead) OR manager
  const myProjects = useMemo(() => {
    const currentUser = 'M. Nutzer';
    return projects.filter(project => {
      return project.managerName === currentUser || leads.some(lead => lead.projectId === project.id && lead.ownerName === currentUser);
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [projects, leads]);

  const getLeadsForProject = (projectId: string) => {
    return leads.filter(l => l.projectId === projectId && l.ownerName === 'M. Nutzer');
  };

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
        ) : myProjects.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-200">
              <FolderKanban size={32} />
            </div>
            <h3 className="text-gray-900 font-bold">{t.myProjects.noProjects}</h3>
            <p className="text-gray-400 text-sm max-w-[240px]">{t.myProjects.noProjectsDesc}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myProjects.map(project => {
              const projectLeads = getLeadsForProject(project.id);
              return (
                <div key={project.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Briefcase size={22} />
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <Calendar size={12} />
                      {new Date(project.createdAt).toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US')}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{project.title}</h3>
                  <div className="flex items-center gap-2 mb-4 text-xs font-bold text-indigo-600">
                    <User size={14} />
                    <span>{t.myProjects.manager}: {project.managerName}</span>
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
                        {projectLeads.length}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {projectLeads.slice(0, 3).map(lead => (
                        <div key={lead.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-[8px] font-bold shrink-0">
                              {lead.firstName[0]}{lead.lastName[0]}
                            </div>
                            <span className="text-xs font-semibold text-gray-800 truncate">
                              {lead.firstName} {lead.lastName}
                            </span>
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-white text-gray-400 rounded-md border border-gray-100">
                            {lead.pipelineStage}
                          </span>
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
    </div>
  );
};

export default MyProjectsDashboard;
