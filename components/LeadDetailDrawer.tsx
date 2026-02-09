
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Lead, Comment, PipelineStage, LeadFile, Deal, Project, Todo } from '../types';
import { 
  X, Phone, Mail, Calendar, Linkedin, MessageSquare, Send, Save, Trash2, Edit2, 
  Building, Trash, Check, Facebook, Instagram, Twitter, Music, Search, Loader2,
  Paperclip, File, Download, Upload, DollarSign, Briefcase, Award, FolderKanban,
  CheckCircle2, Circle, Clock
} from 'lucide-react';
import { STAGE_COLORS, STAGES } from '../constants';
import { api } from '../services/api';
import { translations, Language } from '../translations';

interface LeadDetailDrawerProps {
  lead: Lead | null;
  projects: Project[];
  onClose: () => void;
  onUpdate: (updates: Partial<Lead>) => void;
  onAddComment: (text: string) => void;
  onUpdateComment?: (commentId: string, text: string) => void;
  onDeleteComment?: (commentId: string) => void;
  onAddFile?: (file: Omit<LeadFile, 'id' | 'uploadedAt'>) => void;
  onDeleteFile?: (fileId: string) => void;
  onDelete?: (id: string) => void;
  lang: Language;
}

const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({ 
  lead, 
  projects,
  onClose, 
  onUpdate, 
  onAddComment, 
  onUpdateComment,
  onDeleteComment,
  onAddFile,
  onDeleteFile,
  onDelete,
  lang
}) => {
  if (!lead) return null;

  const t = useMemo(() => translations[lang], [lang]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [commentText, setCommentText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSearchingSocial, setIsSearchingSocial] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editedLead, setEditedLead] = useState<Lead>(lead);
  const [leadDeals, setLeadDeals] = useState<Deal[]>([]);
  const [leadTodos, setLeadTodos] = useState<Todo[]>([]);
  
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  useEffect(() => {
    if (lead) {
      setEditedLead(lead);
      fetchDeals();
      fetchTodos();
    }
  }, [lead]);

  const fetchDeals = async () => {
    const allDeals = await api.getDeals();
    setLeadDeals(allDeals.filter(d => d.leadId === lead.id));
  };

  const fetchTodos = async () => {
    const allTodos = await api.getTodos();
    setLeadTodos(allTodos.filter(t => t.leadId === lead.id).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  };

  const currentProject = useMemo(() => {
    return projects.find(p => p.id === lead.projectId);
  }, [projects, lead.projectId]);

  const totalDealSumByCurrency = useMemo(() => {
    const sums: Record<string, number> = {};
    leadDeals.forEach(d => {
      const curr = d.currency || 'EUR';
      sums[curr] = (sums[curr] || 0) + d.totalAmount;
    });
    return sums;
  }, [leadDeals]);

  const handleSave = () => {
    onUpdate(editedLead);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!lead || !onDelete) return;
    const confirmed = window.confirm(t.trash.confirmMove);
    if (confirmed) {
      onDelete(lead.id);
      onClose();
    }
  };

  const handleToggleTodo = async (id: string) => {
    await api.toggleTodo(id);
    fetchTodos();
  };

  const handleSocialSearch = async () => {
    setIsSearchingSocial(true);
    try {
      const results = await api.searchSocialMedia(lead.firstName, lead.lastName);
      const updates = {
        ...lead,
        ...results
      };
      onUpdate(updates);
      setEditedLead(updates);
    } finally {
      setIsSearchingSocial(false);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(commentText);
    setCommentText('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onAddFile) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = event.target?.result as string;
      await onAddFile({
        name: file.name,
        size: file.size,
        mimeType: file.type,
        data
      });
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const downloadFile = (file: LeadFile) => {
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const locale = lang === 'de' ? 'de-DE' : 'en-US';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-black/20 pointer-events-auto transition-opacity" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 max-w-xl w-full bg-white shadow-2xl pointer-events-auto transform transition-transform duration-300">
        <div className="h-full flex flex-col">
          <div className="p-6 border-b flex justify-between items-center bg-gray-50">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{lead.firstName} {lead.lastName}</h2>
              <div className="flex flex-col gap-1 mt-1">
                <p className="text-xs text-gray-500">ID: {lead.id}</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(totalDealSumByCurrency).map(([curr, sum]) => (
                    <div key={curr} className="flex items-center bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      <DollarSign size={10} className="mr-1" />
                      {t.deal.totalSum}: {sum.toLocaleString(locale)} {curr === 'USD' ? '$' : '€'}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => {
                  if (isEditing) handleSave();
                  else setIsEditing(true);
                }}
                className={`p-2 rounded-lg transition-colors ${isEditing ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-blue-600 hover:bg-white'}`}
              >
                {isEditing ? <Save size={20} /> : <Edit2 size={20} />}
              </button>
              <button onClick={onClose} className="p-2 text-gray-500 hover:text-red-500 hover:bg-white rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-8">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Aktueller Status</label>
              <div className="flex items-center space-x-3">
                <select 
                  value={editedLead.pipelineStage}
                  onChange={(e) => setEditedLead({ ...editedLead, pipelineStage: e.target.value as PipelineStage })}
                  disabled={!isEditing}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border-none cursor-pointer focus:ring-2 focus:ring-blue-500 disabled:cursor-default ${STAGE_COLORS[editedLead.pipelineStage]}`}
                >
                  {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <span className="text-xs text-gray-400 italic">Zuletzt aktualisiert: {new Date(lead.updatedAt).toLocaleString(locale)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Vorname</label>
                  {isEditing ? <input className="w-full text-sm font-medium border-gray-200 rounded-lg p-2" value={editedLead.firstName} onChange={e => setEditedLead({...editedLead, firstName: e.target.value})} /> : <p className="text-gray-900 font-medium">{lead.firstName}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Position</label>
                  {isEditing ? <input className="w-full text-sm font-medium border-gray-200 rounded-lg p-2" value={editedLead.currentPosition} onChange={e => setEditedLead({...editedLead, currentPosition: e.target.value})} /> : <p className="text-gray-900 font-medium">{lead.currentPosition}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Firma</label>
                  {isEditing ? <input className="w-full text-sm font-medium border-gray-200 rounded-lg p-2" value={editedLead.company || ''} onChange={e => setEditedLead({...editedLead, company: e.target.value})} /> : <p className="text-gray-900 font-medium"><Building size={14} className="inline mr-2" />{lead.company || 'Keine Angabe'}</p>}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Nachname</label>
                  {isEditing ? <input className="w-full text-sm font-medium border-gray-200 rounded-lg p-2" value={editedLead.lastName} onChange={e => setEditedLead({...editedLead, lastName: e.target.value})} /> : <p className="text-gray-900 font-medium">{lead.lastName}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Betreuer</label>
                  {isEditing ? <input className="w-full text-sm font-medium border-gray-200 rounded-lg p-2" value={editedLead.ownerName} onChange={e => setEditedLead({...editedLead, ownerName: e.target.value})} /> : <p className="text-gray-900 font-medium">{lead.ownerName}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">{t.header.projects}</label>
                  <p className="text-gray-900 font-medium flex items-center">
                    <FolderKanban size={14} className="inline mr-2 text-blue-500" />
                    {currentProject ? currentProject.title : 'Kein Projekt zugeordnet'}
                  </p>
                </div>
              </div>
            </div>

            {/* To-Dos Section - NEW */}
            <div className="mb-8 p-5 bg-indigo-50 rounded-xl border border-indigo-100">
              <h3 className="text-sm font-bold text-indigo-800 mb-4 flex items-center">
                <CheckCircle2 size={16} className="mr-2" /> {t.common.linkedTodos} ({leadTodos.length})
              </h3>
              <div className="space-y-2">
                {leadTodos.length > 0 ? (
                  leadTodos.map(todo => (
                    <div 
                      key={todo.id} 
                      onClick={() => handleToggleTodo(todo.id)}
                      className={`flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border cursor-pointer transition-all hover:border-indigo-200 ${todo.isCompleted ? 'opacity-60' : ''}`}
                    >
                      {todo.isCompleted ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Circle size={18} className="text-gray-300" />}
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold ${todo.isCompleted ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{todo.text}</p>
                        {todo.deadline && (
                          <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
                            <Clock size={10} />
                            <span>{new Date(todo.deadline).toLocaleDateString(locale)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic text-center py-2">Keine verknüpften Aufgaben.</p>
                )}
              </div>
            </div>

            <div className="mb-8 p-5 bg-emerald-50 rounded-xl border border-emerald-100">
              <h3 className="text-sm font-bold text-emerald-800 mb-4 flex items-center">
                <Award size={16} className="mr-2" /> {t.deal.overview} ({leadDeals.length})
              </h3>
              <div className="space-y-3">
                {leadDeals.length > 0 ? (
                  leadDeals.map(deal => (
                    <div key={deal.id} className="bg-white p-3 rounded-lg shadow-sm border border-emerald-100 flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{deal.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{deal.type}</span>
                          <span className="text-[10px] text-gray-400 flex items-center">
                            <Calendar size={10} className="mr-1" />
                            {new Date(deal.startDate).toLocaleDateString(locale)} - {new Date(deal.endDate).toLocaleDateString(locale)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-extrabold text-emerald-600">{deal.totalAmount.toLocaleString(locale)} {deal.currency === 'USD' ? '$' : '€'}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic text-center py-2">{t.deal.noDeals}</p>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-gray-700 flex items-center">
                  <Calendar size={16} className="mr-2" /> Weitere Informationen
                </h3>
                <button 
                  onClick={handleSocialSearch}
                  disabled={isSearchingSocial}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center bg-white px-2 py-1 rounded border border-blue-100 shadow-sm disabled:opacity-50"
                >
                  {isSearchingSocial ? <Loader2 size={12} className="animate-spin mr-1" /> : <Search size={12} className="mr-1" />}
                  Social Media Suche
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center text-sm">
                  <Calendar size={16} className="text-gray-400 mr-3 w-5" />
                  <span className="text-gray-400 w-24">Geburtstag:</span>
                  {isEditing ? <input type="date" className="flex-1 text-sm p-1" value={editedLead.birthday || ''} onChange={e => setEditedLead({...editedLead, birthday: e.target.value})} /> : <span className="text-gray-900 font-medium">{lead.birthday ? new Date(lead.birthday).toLocaleDateString(locale) : 'Nicht angegeben'}</span>}
                </div>
                <div className="flex items-center text-sm">
                  <Mail size={16} className="text-gray-400 mr-3 w-5" />
                  <span className="text-gray-400 w-24">E-Mail:</span>
                  {isEditing ? <input type="email" className="flex-1 text-sm p-1" value={editedLead.email || ''} onChange={e => setEditedLead({...editedLead, email: e.target.value})} /> : <span className="text-gray-900 font-medium">{lead.email || 'Nicht angegeben'}</span>}
                </div>
                
                <div className="pt-2 border-t border-gray-100 mt-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Social Media Profile</label>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2">
                      <Linkedin size={18} className={lead.linkedinUrl ? "text-blue-700" : "text-gray-300"} />
                      {isEditing ? (
                        <input className="text-xs border rounded p-1" value={editedLead.linkedinUrl || ''} placeholder="LinkedIn URL" onChange={e => setEditedLead({...editedLead, linkedinUrl: e.target.value})} />
                      ) : lead.linkedinUrl && (
                        <a href={lead.linkedinUrl} target="_blank" className="text-xs text-blue-600 hover:underline">Profil</a>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Facebook size={18} className={lead.facebookUrl ? "text-blue-600" : "text-gray-300"} />
                      {isEditing ? (
                        <input className="text-xs border rounded p-1" value={editedLead.facebookUrl || ''} placeholder="Facebook URL" onChange={e => setEditedLead({...editedLead, facebookUrl: e.target.value})} />
                      ) : lead.facebookUrl && (
                        <a href={lead.facebookUrl} target="_blank" className="text-xs text-blue-600 hover:underline">Profil</a>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Instagram size={18} className={lead.instagramUrl ? "text-pink-600" : "text-gray-300"} />
                      {isEditing ? (
                        <input className="text-xs border rounded p-1" value={editedLead.instagramUrl || ''} placeholder="Instagram URL" onChange={e => setEditedLead({...editedLead, instagramUrl: e.target.value})} />
                      ) : lead.instagramUrl && (
                        <a href={lead.instagramUrl} target="_blank" className="text-xs text-blue-600 hover:underline">Profil</a>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Music size={18} className={lead.tiktokUrl ? "text-black" : "text-gray-300"} />
                      {isEditing ? (
                        <input className="text-xs border rounded p-1" value={editedLead.tiktokUrl || ''} placeholder="TikTok URL" onChange={e => setEditedLead({...editedLead, tiktokUrl: e.target.value})} />
                      ) : lead.tiktokUrl && (
                        <a href={lead.tiktokUrl} target="_blank" className="text-xs text-blue-600 hover:underline">Profil</a>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Twitter size={18} className={lead.twitterUrl ? "text-blue-400" : "text-gray-300"} />
                      {isEditing ? (
                        <input className="text-xs border rounded p-1" value={editedLead.twitterUrl || ''} placeholder="X URL" onChange={e => setEditedLead({...editedLead, twitterUrl: e.target.value})} />
                      ) : lead.twitterUrl && (
                        <a href={lead.twitterUrl} target="_blank" className="text-xs text-blue-600 hover:underline">Profil</a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center">
                <MessageSquare size={16} className="mr-2" /> {t.common.comments} ({lead.comments.length})
              </h3>
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <div className="relative">
                  <textarea value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Neuen Kommentar hinzufügen..." className="w-full border-gray-200 rounded-xl p-3 pr-12 text-sm focus:ring-2 focus:ring-blue-500 resize-none h-20 outline-none" />
                  <button type="submit" className="absolute bottom-3 right-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"><Send size={16} /></button>
                </div>
              </form>
              <div className="space-y-4">
                {[...lead.comments].reverse().map(comment => (
                  <div key={comment.id} className="group bg-white border border-gray-100 rounded-lg p-3 shadow-sm relative">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-700">{comment.author}</span>
                        <span className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleString(locale)}</span>
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingCommentId(comment.id); setEditingCommentText(comment.text); }} className="p-1 text-gray-400 hover:text-blue-600"><Edit2 size={12} /></button>
                        <button onClick={() => { if(window.confirm('Löschen?')) onDeleteComment?.(comment.id); }} className="p-1 text-gray-400 hover:text-red-500"><Trash size={12} /></button>
                      </div>
                    </div>
                    {/* Fixed: removed Scalar call and used direct comparison */}
                    {editingCommentId === comment.id ? (
                      <div className="mt-2">
                        <textarea className="w-full text-sm p-2 border rounded" value={editingCommentText} onChange={e => setEditingCommentText(e.target.value)} />
                        <div className="flex justify-end space-x-2 mt-2">
                          <button onClick={() => setEditingCommentId(null)} className="text-xs text-gray-400">{t.common.cancel}</button>
                          <button onClick={() => { onUpdateComment?.(comment.id, editingCommentText); setEditingCommentId(null); }} className="text-xs font-bold text-blue-600">{t.common.save}</button>
                        </div>
                      </div>
                    ) : <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{comment.text}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Files Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-gray-700 flex items-center">
                  <Paperclip size={16} className="mr-2" /> {t.common.files} ({(lead.files || []).length})
                </h3>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  {isUploading ? <Loader2 size={14} className="animate-spin mr-2" /> : <Upload size={14} className="mr-2" />}
                  Datei hochladen
                </button>
              </div>

              <div className="space-y-2">
                {(lead.files || []).map(file => (
                  <div key={file.id} className="group flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:border-blue-100 transition-colors">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="p-2 bg-gray-50 text-gray-400 rounded group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                        <File size={20} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>{file.name}</p>
                        <p className="text-[10px] text-gray-400">{formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString(locale)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => downloadFile(file)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors"
                        title="Herunterladen"
                      >
                        <Download size={16} />
                      </button>
                      <button 
                        onClick={() => { if(window.confirm('Datei löschen?')) onDeleteFile?.(file.id); }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors"
                        title="Löschen"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {(!lead.files || lead.files.length === 0) && !isUploading && (
                  <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-xl">
                    <p className="text-gray-400 text-sm italic">Noch keine Dateien hochgeladen.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t flex justify-end bg-gray-50/50">
            <button onClick={handleDelete} className="flex items-center text-xs text-red-500 hover:text-red-700 font-semibold px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={14} className="mr-2" /> {t.common.delete}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailDrawer;
