import React, { useState, useEffect, useLayoutEffect, useMemo, useRef, useCallback } from "react";
import { CheckCircle2, Circle, Calendar, Send, Clock, Loader2, User, Zap, Link as LinkIcon, Users } from "lucide-react";
import { translations, Language } from "../translations";
import { FORM_MAX_LENGTH } from "../constants";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { createTask, getTasks, updateTask } from "../store/actions/taskActions";
import { getLeads } from "../store/actions/leadActions";
import { getUsers } from "../store/actions/userActions";

interface TodoDashboardProps {
  lang: Language;
  refreshKey?: number;
}

const TodoDashboard: React.FC<TodoDashboardProps> = ({ lang, refreshKey = 0 }) => {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector((state) => state.tasks.tasks);
  const tasksStatus = useAppSelector((state) => state.tasks.listStatus);
  const tasksTotal = useAppSelector((state) => state.tasks.total);
  const tasksLimit = useAppSelector((state) => state.tasks.limit);
  const leads = useAppSelector((state) => state.leads.leads);
  const leadsStatus = useAppSelector((state) => state.leads.listStatus);
  const owners = useAppSelector((state) => state.users.users);
  const usersStatus = useAppSelector((state) => state.users.listStatus);
  const currentUserId = useAppSelector((state) => state.auth.user?.userId);

  const [text, setText] = useState("");
  const [deadline, setDeadline] = useState("");
  const [deadlineError, setDeadlineError] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [selectedOwnerId, setSelectedOwnerId] = useState("");
  const [textError, setTextError] = useState("");
  const [ownerError, setOwnerError] = useState("");
  const [leadError, setLeadError] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const DESCRIPTION_CANDIDATE_LENGTH = 20;
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(new Set());
  const [overflowTaskIds, setOverflowTaskIds] = useState<Record<string, boolean>>({});
  const descRefs = useRef<Map<string, HTMLParagraphElement>>(new Map());
  const taskInputRef = useRef<HTMLTextAreaElement | null>(null);

  const measureOverflows = useCallback(() => {
    const next: Record<string, boolean> = {};
    descRefs.current.forEach((el, id) => {
      next[id] = el.scrollWidth > el.clientWidth;
    });
    setOverflowTaskIds((prev) => ({ ...prev, ...next }));
  }, []);

  useLayoutEffect(() => {
    measureOverflows();
  }, [tasks, expandedTaskIds, measureOverflows]);

  useEffect(() => {
    const onResize = () => measureOverflows();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measureOverflows]);

  const toggleTaskExpanded = (taskId: string) => {
    setExpandedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  const t = useMemo(() => translations[lang], [lang]);
  const loading = tasksStatus === "loading" || leadsStatus === "loading" || usersStatus === "loading";
  const today = new Date().toISOString().split("T")[0];
  const totalPages = Math.max(1, Math.ceil(tasksTotal / (tasksLimit || limit)));

  useEffect(() => {
    void dispatch(getTasks({ page, limit }));
  }, [dispatch, page]);

  useEffect(() => {
    void dispatch(getLeads({ page: 1, limit: 500 }));
    void dispatch(getUsers({ page: 1, limit: 200 }));
  }, [dispatch, refreshKey]);

  useEffect(() => {
    const el = taskInputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(44, el.scrollHeight)}px`;
  }, [text]);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    const summary = text.trim();

    setTextError(
      !summary
        ? lang === "de"
          ? "Aufgabe ist erforderlich."
          : "Task is required."
        : summary.length > FORM_MAX_LENGTH.todoDescription
          ? lang === "de"
            ? `Max. ${FORM_MAX_LENGTH.todoDescription} Zeichen`
            : `Max. ${FORM_MAX_LENGTH.todoDescription} characters`
          : ""
    );
    setOwnerError(
      selectedOwnerId ? "" : lang === "de" ? "Verantwortliche Person ist erforderlich." : "Owner is required."
    );
    setLeadError(selectedLeadId ? "" : lang === "de" ? "Lead ist erforderlich." : "Lead is required.");
    setDeadlineError(
      !deadline
        ? lang === "de"
          ? "Deadline ist erforderlich."
          : "Deadline is required."
        : deadline < today
          ? lang === "de"
            ? "Deadline darf nicht in der Vergangenheit liegen."
            : "Deadline cannot be a past date."
          : ""
    );

    if (
      !summary ||
      summary.length > FORM_MAX_LENGTH.todoDescription ||
      !selectedOwnerId ||
      !selectedLeadId ||
      !deadline
    )
      return;
    if (deadline < today) {
      setDeadlineError(
        lang === "de" ? "Deadline darf nicht in der Vergangenheit liegen." : "Deadline cannot be a past date."
      );
      return;
    }

    await dispatch(
      createTask({
        description: summary,
        assignedTo: selectedOwnerId,
        leadId: selectedLeadId,
        deadline,
        completed: false
      })
    );

    setText("");
    setDeadline("");
    setDeadlineError("");
    setSelectedLeadId("");
    setSelectedOwnerId("");
    setPage(1);
    void dispatch(getTasks({ page: 1, limit }));
  };

  const handleToggleTodo = async (taskId: string, completed: boolean) => {
    const nextCompleted = !completed;
    const result = await dispatch(
      updateTask({
        taskId,
        data: { completed: nextCompleted }
      })
    );

    if (!updateTask.fulfilled.match(result)) {
      console.error("[TodoDashboard] update task rejected", result);
      return;
    }
  };

  const getLeadName = (id?: string) => {
    if (!id) return null;
    const lead = leads.find((leadRecord) => leadRecord.id === id);
    return lead ? `${lead.firstName} ${lead.lastName}` : null;
  };

  const getOwnerName = (id?: string) => {
    if (!id) return null;
    const owner = owners.find((o) => o.id === id);
    return owner ? owner.name : null;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-8 bg-white/50 backdrop-blur-sm rounded-3xl m-4 shadow-inner overflow-hidden">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t.todos.title}</h2>
        <p className="text-gray-500 mt-1">{t.todos.subtitle}</p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-10">
        <section>
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
              <Zap size={18} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 tracking-tight">{t.todos.selfCreated}</h3>
            <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
              {tasks.length}
            </span>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-6">
            <form onSubmit={handleAddTodo} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative col-span-1 md:col-span-2">
                  <textarea
                    ref={taskInputRef}
                    value={text}
                    required
                    rows={2}
                    maxLength={FORM_MAX_LENGTH.todoDescription}
                    onChange={(e) => {
                      const value = e.target.value;
                      setText(value);
                      if (value.length >= FORM_MAX_LENGTH.todoDescription) {
                        setTextError(
                          lang === "de"
                            ? `Max. ${FORM_MAX_LENGTH.todoDescription} Zeichen`
                            : `Maximum ${FORM_MAX_LENGTH.todoDescription} characters`
                        );
                      } else {
                        setTextError("");
                      }
                    }}
                    placeholder={t.todos.inputPlaceholder}
                    className="w-full min-h-[44px] px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-gray-400 focus:ring-0 transition-all text-sm font-medium resize-none overflow-y-hidden"
                  />
                  {textError && <p className="mt-1 text-[11px] font-semibold text-red-500">{textError}</p>}
                </div>

                <div className="relative">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">
                    {t.todos.assignTo}
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <select
                      required
                      value={selectedOwnerId}
                      onChange={(e) => {
                        setSelectedOwnerId(e.target.value);
                        if (e.target.value) setOwnerError("");
                      }}
                      className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-gray-400 focus:ring-0 transition-all text-xs font-bold text-gray-600 appearance-none"
                    >
                      <option value="">{t.todos.selectOwner}</option>
                      {owners.map((owner) => (
                        <option key={owner.id} value={owner.id}>
                          {owner.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {ownerError && <p className="mt-1 text-[11px] font-semibold text-red-500">{ownerError}</p>}
                </div>

                <div className="relative">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">
                    {t.todos.linkLead}
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <select
                      required
                      value={selectedLeadId}
                      onChange={(e) => {
                        setSelectedLeadId(e.target.value);
                        if (e.target.value) setLeadError("");
                      }}
                      className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-gray-400 focus:ring-0 transition-all text-xs font-bold text-gray-600 appearance-none"
                    >
                      <option value="">{t.todos.selectLead}</option>
                      {leads.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.firstName} {l.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  {leadError && <p className="mt-1 text-[11px] font-semibold text-red-500">{leadError}</p>}
                </div>

                <div className="relative">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">
                    {t.todos.deadline}
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input
                      type="date"
                      required
                      value={deadline}
                      min={today}
                      onChange={(e) => {
                        const value = e.target.value;
                        setDeadline(value);
                        if (value && value < today) {
                          setDeadlineError(
                            lang === "de"
                              ? "Deadline darf nicht in der Vergangenheit liegen."
                              : "Deadline cannot be a past date."
                          );
                        } else {
                          setDeadlineError("");
                        }
                      }}
                      className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-gray-400 focus:ring-0 transition-all text-xs font-bold text-gray-600"
                    />
                  </div>
                  {deadlineError && <p className="mt-1 text-[11px] font-semibold text-red-500">{deadlineError}</p>}
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={!text.trim() || !selectedOwnerId || !selectedLeadId || !deadline}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm shadow-md hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Send size={16} /> {t.todos.save}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="space-y-3">
            {tasks.length === 0 ? (
              <p className="text-xs text-gray-400 italic px-2">{t.todos.noPersonalTasks}</p>
            ) : (
              tasks.map((task) => {
                const leadName = getLeadName(task.leadId);
                const ownerName = getOwnerName(task.assignedTo);
                const isOverdue = task.deadline && new Date(task.deadline) < new Date() && !task.completed;

                return (
                  <div
                    key={task.id}
                    className={`group flex items-start gap-4 p-4 rounded-2xl border transition-all ${task.completed ? "bg-gray-50 border-transparent opacity-60" : "bg-white border-gray-100 hover:border-gray-200"}`}
                  >
                    <button
                      onClick={() => handleToggleTodo(task.id, task.completed)}
                      className={`shrink-0 transition-colors ${task.completed ? "text-blue-500" : "text-gray-300 hover:text-blue-500"}`}
                    >
                      {task.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      {expandedTaskIds.has(task.id) ? (
                        <>
                          <p
                            role="button"
                            tabIndex={0}
                            onClick={() => toggleTaskExpanded(task.id)}
                            onKeyDown={(e) => e.key === "Enter" && toggleTaskExpanded(task.id)}
                            className={`text-sm font-bold cursor-pointer hover:opacity-80 break-words min-w-0 ${task.completed ? "text-gray-400 line-through" : "text-gray-900"}`}
                          >
                            {task.description}
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTaskExpanded(task.id);
                            }}
                            className="text-[10px] font-semibold text-blue-600 hover:underline mt-0.5"
                          >
                            {t.todos.showLess}
                          </button>
                        </>
                      ) : task.description.length <= DESCRIPTION_CANDIDATE_LENGTH || overflowTaskIds[task.id] === false ? (
                        <p className={`text-sm font-bold break-words min-w-0 ${task.completed ? "text-gray-400 line-through" : "text-gray-900"}`}>
                          {task.description}
                        </p>
                      ) : (
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => toggleTaskExpanded(task.id)}
                          onKeyDown={(e) => e.key === "Enter" && toggleTaskExpanded(task.id)}
                          className="flex items-baseline gap-1 min-w-0 cursor-pointer hover:opacity-80"
                          title={task.description}
                        >
                          <p
                            ref={(el) => {
                              if (el) descRefs.current.set(task.id, el);
                              else descRefs.current.delete(task.id);
                            }}
                            className={`text-sm font-bold truncate min-w-0 ${task.completed ? "text-gray-400 line-through" : "text-gray-900"}`}
                          >
                            {task.description}
                          </p>
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                        {task.deadline && (
                          <div className="flex items-center gap-1.5">
                            <Clock size={12} className={isOverdue ? "text-red-500" : "text-gray-400"} />
                            <span className={`text-[10px] font-bold ${isOverdue ? "text-red-500" : "text-gray-500"}`}>
                              {new Date(task.deadline).toLocaleDateString(lang === "de" ? "de-DE" : "en-US")}
                            </span>
                          </div>
                        )}
                        {leadName && (
                          <div className="flex items-center gap-1 text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded text-[9px] font-bold">
                            <LinkIcon size={10} />
                            {leadName}
                          </div>
                        )}
                        {ownerName && task.assignedTo !== currentUserId && (
                          <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[9px] font-bold">
                            <User size={10} />
                            {ownerName}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
        <p className="text-xs font-semibold text-gray-500">
          {t.common.pageLabel.replace("{page}", String(page)).replace("{total}", String(totalPages))}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1 || loading}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 disabled:opacity-40"
          >
            {t.common.previous}
          </button>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page >= totalPages || loading}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 disabled:opacity-40"
          >
            {t.common.next}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TodoDashboard;
