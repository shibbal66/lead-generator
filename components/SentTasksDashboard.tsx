import React, { useState, useEffect, useMemo } from "react";
import { Send, Clock, User, ClipboardList, Loader2, ArrowRight } from "lucide-react";
import { Task, Owner } from "../types";
import { api } from "../services/api";
import { translations, Language } from "../translations";

interface SentTasksDashboardProps {
  lang: Language;
}

const SentTasksDashboard: React.FC<SentTasksDashboardProps> = ({ lang }) => {
  const [sentTasks, setSentTasks] = useState<Task[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);

  const t = useMemo(() => translations[lang], [lang]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [tasks, ownersData] = await Promise.all([api.getTasks(), api.getOwners()]);
    const filtered = tasks
      .filter((t) => t.senderName === "M. Nutzer")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setSentTasks(filtered);
    setOwners(ownersData);
    setLoading(false);
  };

  const getOwnerName = (id: string) => {
    return owners.find((o) => o.id === id)?.name || "Unbekannt";
  };

  return (
    <div className="flex-1 flex flex-col p-8 bg-white/50 backdrop-blur-sm rounded-3xl m-4 shadow-inner overflow-hidden">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t.sentTasks.title}</h2>
        <p className="text-gray-500 mt-1">{t.sentTasks.subtitle}</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : sentTasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-200">
              <Send size={32} />
            </div>
            <h3 className="text-gray-900 font-bold">{t.sentTasks.noTasks}</h3>
            <p className="text-gray-400 text-sm max-w-[240px]">{t.sentTasks.noTasksDesc}</p>
          </div>
        ) : (
          sentTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-blue-200 transition-all flex items-start gap-4"
            >
              <div className="w-10 h-10 shrink-0 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <ClipboardList size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 bg-blue-50 px-2 py-0.5 rounded">
                    {t.sentTasks.delegatedTo}
                  </span>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-gray-900">
                    <User size={14} className="text-gray-400" />
                    {getOwnerName(task.ownerId)}
                  </div>
                </div>
                <p className="text-sm text-gray-700 font-medium mb-3">{task.text}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(task.createdAt).toLocaleString(lang === "de" ? "de-DE" : "en-US")}
                  </div>
                  {task.deadline && (
                    <div className="flex items-center gap-1 text-blue-500">
                      <Clock size={12} />
                      {t.todos.due} {new Date(task.deadline).toLocaleDateString(lang === "de" ? "de-DE" : "en-US")}
                    </div>
                  )}
                  <div className={`flex items-center gap-1 ${task.isRead ? "text-emerald-500" : "text-amber-500"}`}>
                    {task.isRead ? t.sentTasks.read : t.sentTasks.pending}
                  </div>
                </div>
              </div>
              <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 text-gray-300">
                <ArrowRight size={16} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SentTasksDashboard;
