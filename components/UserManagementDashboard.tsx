
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, UserPlus, Mail, Shield, CheckCircle2, Clock, 
  RotateCcw, Trash2, Search, Loader2, AlertCircle, Send
} from 'lucide-react';
import { Owner, UserStatus } from '../types';
import { api } from '../services/api';
import { translations, Language } from '../translations';
import ShareModal from './ShareModal';

interface UserManagementDashboardProps {
  lang: Language;
}

const UserManagementDashboard: React.FC<UserManagementDashboardProps> = ({ lang }) => {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = useMemo(() => translations[lang], [lang]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await api.getOwners();
      setOwners(data);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (userId: string) => {
    setResendingId(userId);
    setError(null);
    try {
      await api.resendInvitation(userId);
      fetchData();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setResendingId(null);
    }
  };

  const filteredOwners = owners.filter(o => 
    o.name.toLowerCase().includes(search.toLowerCase()) || 
    o.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col p-8 bg-white/50 backdrop-blur-sm rounded-3xl m-4 shadow-inner overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t.userMgmt.title}</h2>
          <p className="text-gray-500 mt-1">{t.userMgmt.subtitle}</p>
        </div>
        <button 
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <UserPlus size={18} /> {t.userMgmt.inviteBtn}
        </button>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder={t.userMgmt.searchPlaceholder}
          className="w-full pl-12 pr-4 py-3 bg-white border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 transition-all"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-100 rounded-2xl flex items-start gap-3 animate-in fade-in">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="flex-1 overflow-hidden bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.userMgmt.colEmployee}</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.userMgmt.colRole}</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.userMgmt.colStatus}</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.userMgmt.colLastInvited}</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">{t.userMgmt.colActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <Loader2 className="animate-spin text-blue-600 mx-auto" size={32} />
                  </td>
                </tr>
              ) : filteredOwners.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center italic text-gray-400 text-sm">{t.userMgmt.noUsers}</td>
                </tr>
              ) : (
                filteredOwners.map(owner => (
                  <tr key={owner.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                          {owner.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{owner.name}</p>
                          <p className="text-xs text-gray-400">{owner.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                        <Shield size={14} className="text-gray-300" />
                        {owner.role}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        owner.status === UserStatus.ACTIVE ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                        owner.status === UserStatus.INVITED ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-gray-50 text-gray-500 border-gray-100'
                      }`}>
                        {owner.status === UserStatus.ACTIVE ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {owner.status}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {owner.invitedAt ? (
                        <div className="space-y-1">
                          <p className="text-[10px] font-medium text-gray-600">{new Date(owner.invitedAt).toLocaleString(lang === 'de' ? 'de-DE' : 'en-US')}</p>
                          {owner.inviteError && (
                            <p className="text-[9px] font-bold text-red-500 flex items-center gap-1">
                              <AlertCircle size={10} /> {lang === 'de' ? 'Versand-Fehler' : 'Sending Error'}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {owner.status === UserStatus.INVITED && (
                          <button 
                            onClick={() => handleResend(owner.id)}
                            disabled={resendingId === owner.id}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all"
                            title={t.userMgmt.resendInvite}
                          >
                            {resendingId === owner.id ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                          </button>
                        )}
                        <button 
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-all" 
                          title={t.userMgmt.disableUser}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isInviteModalOpen && (
        <ShareModal onClose={() => setIsInviteModalOpen(false)} onInvite={() => fetchData()} />
      )}
    </div>
  );
};

export default UserManagementDashboard;
