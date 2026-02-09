
import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, Circle, Trash2, Calendar, Mic, Send, 
  Clock, Loader2, User, ClipboardList, Zap, Link as LinkIcon, Users 
} from 'lucide-react';
import { Todo, Task, Lead, Owner } from '../types';
import { api } from '../services/api';
import { translations, Language } from '../translations';

interface TodoDashboardProps {
  lang: Language;
}

const TodoDashboard: React.FC<TodoDashboardProps> = ({ lang }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  
  const [text, setText] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [selectedOwnerId, setSelectedOwnerId] = useState('');
  
  const [loading, setLoading] = useState(true);

  const t = useMemo(() => translations[lang], [lang]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [todoData, taskData, leadData, ownerData] = await Promise.all([
      api.getTodos(),
      api.getTasks(),
      api.getLeads(),
      api.getOwners()
    ]);
    setTodos(todoData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setLeads(leadData);
    setOwners(ownerData);
    setAssignedTasks(taskData.filter(t => t.ownerId === 'o1').sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
    setLoading(false);
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    await api.addTodo({ 
      text, 
      deadline, 
      leadId: selectedLeadId || undefined,
      assignedToOwnerId: selectedOwnerId || 'o1', // Default to current user
      assignedByOwnerId: 'o1' // Mock current user
    });
    
    setText('');
    setDeadline('');
    setSelectedLeadId('');
    setSelectedOwnerId('');
    fetchData();
  };

  const handleToggleTodo = async (id: string) => {
    const updated = await api.toggleTodo(id);
    setTodos(updated.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  const handleDeleteTodo = async (id: string) => {
    const updated = await api.deleteTodo(id);
    setTodos(updated.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  const getLeadName = (id?: string) => {
    if (!id) return null;
    const lead = leads.find(l => l.id === id);
    return lead ? `${lead.firstName} ${lead.lastName}` : null;
  };

  const getOwnerName = (id?: string) => {
    if (!id) return null;
    const owner = owners.find(o => o.id === id);
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
            <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><Zap size={18} /></div>
            <h3 className="text-lg font-bold text-gray-800 tracking-tight">{t.todos.selfCreated}</h3>
            <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{todos.length}</span>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <form onSubmit={handleAddTodo} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative col-span-1 md:col-span-2">
                  <input 
                    type="text" 
                    value={text} 
                    onChange={(e) => setText(e.target.value)} 
                    placeholder={t.todos.inputPlaceholder} 
                    className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium" 
                  />
                </div>
                
                <div className="relative">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">{t.todos.assignTo}</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <select 
                      value={selectedOwnerId} 
                      onChange={(e) => setSelectedOwnerId(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-xs font-bold text-gray-600 appearance-none"
                    >
                      <option value="">{t.todos.myself}</option>
                      {owners.filter(o => o.id !== 'o1').map(o => (
                        <option key={o.id} value={o.id}>{o.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">{t.todos.linkLead}</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <select 
                      value={selectedLeadId} 
                      onChange={(e) => setSelectedLeadId(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-xs font-bold text-gray-600 appearance-none"
                    >
                      <option value="">{t.todos.noLead}</option>
                      {leads.map(l => (
                        <option key={l.id} value={l.id}>{l.firstName} {l.lastName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">{t.todos.deadline}</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input 
                      type="date" 
                      value={deadline} 
                      onChange={(e) => setDeadline(e.target.value)} 
                      className="w-full pl-9 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-xs font-bold text-gray-600" 
                    />
                  </div>
                </div>

                <div className="flex items-end">
                  <button 
                    type="submit" 
                    disabled={!text.trim()} 
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Send size={16} /> {t.todos.save}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="space-y-3">
            {todos.length === 0 ? (
              <p className="text-xs text-gray-400 italic px-2">{t.todos.noPersonalTasks}</p>
            ) : (
              todos.map(todo => {
                const leadName = getLeadName(todo.leadId);
                const ownerName = getOwnerName(todo.assignedToOwnerId);
                const isOverdue = todo.deadline && new Date(todo.deadline) < new Date() && !todo.isCompleted;

                return (
                  <div key={todo.id} className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all ${todo.isCompleted ? 'bg-gray-50 border-transparent opacity-60' : 'bg-white border-gray-100 hover:border-blue-200'}`}>
                    <button onClick={() => handleToggleTodo(todo.id)} className={`shrink-0 transition-colors ${todo.isCompleted ? 'text-blue-500' : 'text-gray-300 hover:text-blue-500'}`}>
                      {todo.isCompleted ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${todo.isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{todo.text}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                        {todo.deadline && (
                          <div className="flex items-center gap-1.5">
                            <Clock size={12} className={isOverdue ? 'text-red-500' : 'text-gray-400'} />
                            <span className={`text-[10px] font-bold ${isOverdue ? 'text-red-500' : 'text-gray-500'}`}>
                              {new Date(todo.deadline).toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US')}
                            </span>
                          </div>
                        )}
                        {leadName && (
                          <div className="flex items-center gap-1 text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded text-[9px] font-bold">
                            <LinkIcon size={10} />
                            {leadName}
                          </div>
                        )}
                        {ownerName && todo.assignedToOwnerId !== 'o1' && (
                          <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[9px] font-bold">
                            <User size={10} />
                            {ownerName}
                          </div>
                        )}
                      </div>
                    </div>
                    <button onClick={() => handleDeleteTodo(todo.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default TodoDashboard;
