
import React, { useState } from 'react';
import { X, Mail, Send, Check, Users, Shield, Loader2 } from 'lucide-react';

interface ShareModalProps {
  onClose: () => void;
  // Added onInvite to props interface to fix TS error in UserManagementDashboard.tsx
  onInvite?: () => void;
}

// Destructure onInvite from props
const ShareModal: React.FC<ShareModalProps> = ({ onClose, onInvite }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Editor' | 'Admin'>('Editor');
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSending(true);
    // Simulate API call
    setTimeout(() => {
      setIsSending(false);
      setIsSuccess(true);
      // In a real app, this would call POST /api/team/invite
      // Notify parent of successful invite to refresh team data
      onInvite?.();
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 text-center animate-in fade-in zoom-in duration-200">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Einladung gesendet!</h2>
          <p className="text-gray-500 mb-8">
            Eine Einladung wurde an <span className="font-semibold text-gray-900">{email}</span> gesendet. 
            Sobald der Mitarbeiter bestätigt, hat er vollen Zugriff auf alle Leads.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all"
          >
            Fertig
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <div className="flex items-center space-x-2">
            <Users className="text-blue-600" size={20} />
            <h2 className="text-lg font-bold text-gray-900">Team einladen</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          <p className="text-sm text-gray-500 mb-6">
            Laden Sie Kollegen ein, um gemeinsam an der Lead-Pipeline zu arbeiten. Eingeladene Personen können Leads sehen, bearbeiten und neue hinzufügen.
          </p>

          <form onSubmit={handleInvite} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">E-Mail Adresse des Mitarbeiters</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kollege@unternehmen.de"
                  className="w-full pl-10 pr-4 py-3 border-gray-200 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Berechtigungsstufe</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('Editor')}
                  className={`p-3 rounded-xl border text-left transition-all ${role === 'Editor' ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-gray-900">Editor</span>
                    {role === 'Editor' && <Check size={14} className="text-blue-600" />}
                  </div>
                  <p className="text-[10px] text-gray-500">Kann Leads bearbeiten & erstellen</p>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('Admin')}
                  className={`p-3 rounded-xl border text-left transition-all ${role === 'Admin' ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-gray-900">Admin</span>
                    {role === 'Admin' && <Check size={14} className="text-blue-600" />}
                  </div>
                  <p className="text-[10px] text-gray-500">Vollzugriff & Teamverwaltung</p>
                </button>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl flex items-start space-x-3">
              <Shield className="text-blue-600 shrink-0 mt-0.5" size={16} />
              <p className="text-[11px] text-blue-700 leading-relaxed">
                Der Zugriff ist uneingeschränkt. Neue Mitglieder können alle vorhandenen Lead-Daten einsehen und die Pipeline verwalten.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSending || !email}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Einladung wird gesendet...
                </>
              ) : (
                <>
                  <Send className="mr-2" size={18} />
                  Einladung senden
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
