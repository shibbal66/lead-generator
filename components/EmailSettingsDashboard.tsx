
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Mail, Settings, ShieldCheck, ShieldAlert, Loader2, Send, 
  CheckCircle2, AlertCircle, Info, Database, Globe
} from 'lucide-react';
import { EmailSettings, EmailProvider } from '../types';
import { api } from '../services/api';
import { translations, Language } from '../translations';

interface EmailSettingsDashboardProps {
  lang: Language;
}

const EmailSettingsDashboard: React.FC<EmailSettingsDashboardProps> = ({ lang }) => {
  const [settings, setSettings] = useState<EmailSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const t = useMemo(() => translations[lang], [lang]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const data = await api.getEmailSettings();
    setSettings(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setLoading(true);
    await api.updateEmailSettings(settings);
    setLoading(false);
    setFeedback({ type: 'success', message: t.common.save + ' ' + (lang === 'de' ? 'erfolgreich' : 'successful') });
  };

  const checkConnection = async () => {
    if (!settings) return;
    setChecking(true);
    setFeedback(null);
    try {
      const result = await api.checkSendAsPermission();
      setSettings({ 
        ...settings, 
        lastCheckStatus: result.ok ? 'ok' : 'error', 
        lastCheckMessage: result.message 
      });
      if (result.ok) {
        setFeedback({ type: 'success', message: result.message });
      } else {
        setFeedback({ type: 'error', message: result.message });
      }
    } catch (e) {
      setFeedback({ type: 'error', message: lang === 'de' ? 'Verbindungsprüfung fehlgeschlagen.' : 'Connection check failed.' });
    } finally {
      setChecking(false);
    }
  };

  const sendTest = async () => {
    if (!testEmail) return;
    setTesting(true);
    setFeedback(null);
    try {
      await api.sendTestEmail(testEmail);
      setFeedback({ type: 'success', message: lang === 'de' ? `Testmail wurde erfolgreich an ${testEmail} gesendet.` : `Test mail successfully sent to ${testEmail}.` });
    } catch (e) {
      setFeedback({ type: 'error', message: (e as Error).message });
    } finally {
      setTesting(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-8 bg-white/50 backdrop-blur-sm rounded-3xl m-4 shadow-inner overflow-hidden">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t.emailConfig.title}</h2>
        <p className="text-gray-500 mt-1">{t.emailConfig.subtitle}</p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8">
        {feedback && (
          <div className={`p-4 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4 ${
            feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <p className="text-sm font-medium">{feedback.message}</p>
          </div>
        )}

        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Config */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Database size={14} /> {t.emailConfig.authSection}
              </h3>
              
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2">{t.emailConfig.mode}</label>
                <select 
                  className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  value={settings.provider}
                  onChange={e => setSettings({ ...settings, provider: e.target.value as EmailProvider })}
                >
                  <option value={EmailProvider.WORKSPACE_GMAIL_API}>Google Workspace Gmail API (DWD)</option>
                  <option value={EmailProvider.SMTP_RELAY}>SMTP Relay (Fallback)</option>
                </select>
              </div>

              {settings.provider === EmailProvider.WORKSPACE_GMAIL_API && (
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2">{t.emailConfig.saJson}</label>
                  <textarea 
                    className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-xs font-mono h-24 focus:ring-2 focus:ring-blue-500"
                    placeholder='{"type": "service_account", ...}'
                    value={settings.googleSAJson || ''}
                    onChange={e => setSettings({ ...settings, googleSAJson: e.target.value })}
                  />
                  <p className="text-[10px] text-gray-400 mt-2">{lang === 'de' ? 'Stellen Sie sicher, dass Domain-Wide Delegation für den Scope' : 'Ensure Domain-Wide Delegation is enabled for scope'} <code className="bg-gray-100 px-1 rounded">gmail.send</code> {lang === 'de' ? 'aktiviert ist.' : 'activated.'}</p>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Mail size={14} /> {t.emailConfig.identitySection}
              </h3>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2">{t.emailConfig.serviceMailbox}</label>
                  <input 
                    type="email"
                    className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-blue-500"
                    placeholder="mailer@deinefirma.de"
                    value={settings.serviceMailboxEmail}
                    onChange={e => setSettings({ ...settings, serviceMailboxEmail: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2">{t.emailConfig.brandSender}</label>
                  <input 
                    type="email"
                    className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-blue-500"
                    placeholder="sales@deinefirma.de"
                    value={settings.brandFromEmail}
                    onChange={e => setSettings({ ...settings, brandFromEmail: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2">{t.emailConfig.senderName}</label>
                  <input 
                    type="text"
                    className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-blue-500"
                    placeholder="Lead Generator Team"
                    value={settings.fromName}
                    onChange={e => setSettings({ ...settings, fromName: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-2"
            >
              {t.emailConfig.save}
            </button>
          </div>

          {/* Verification & Test */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={14} /> {t.emailConfig.statusSection}
              </h3>

              <div className={`p-4 rounded-xl border flex items-start gap-4 ${
                settings.lastCheckStatus === 'ok' ? 'bg-emerald-50 border-emerald-200' : 
                settings.lastCheckStatus === 'error' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className={`shrink-0 mt-0.5 ${
                  settings.lastCheckStatus === 'ok' ? 'text-emerald-600' : 
                  settings.lastCheckStatus === 'error' ? 'text-red-600' : 'text-gray-400'
                }`}>
                  {settings.lastCheckStatus === 'ok' ? <ShieldCheck /> : settings.lastCheckStatus === 'error' ? <ShieldAlert /> : <Info />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{t.emailConfig.connectionStatus}</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {settings.lastCheckMessage || (lang === 'de' ? 'Noch keine Prüfung durchgeführt.' : 'No checks performed yet.')}
                  </p>
                  <button 
                    type="button"
                    onClick={checkConnection}
                    disabled={checking}
                    className="mt-4 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-2"
                  >
                    {checking ? <Loader2 size={12} className="animate-spin" /> : <Globe size={12} />}
                    {t.emailConfig.checkNow}
                  </button>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-50">
                <h4 className="text-sm font-bold text-gray-900">{t.emailConfig.sendTest}</h4>
                <div className="flex gap-2">
                  <input 
                    type="email"
                    className="flex-1 bg-gray-50 border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-blue-500"
                    placeholder={t.emailConfig.testPlaceholder}
                    value={testEmail}
                    onChange={e => setTestEmail(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={sendTest}
                    disabled={testing || !testEmail}
                    className="bg-gray-900 text-white px-5 rounded-xl font-bold text-sm hover:bg-black transition-all disabled:opacity-50"
                  >
                    {testing ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
              <h3 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                <Info size={16} /> {t.emailConfig.checklist}
              </h3>
              <ul className="text-xs text-blue-700 space-y-3">
                <li className="flex gap-2">
                  <span className="w-4 h-4 rounded-full bg-blue-200 flex items-center justify-center shrink-0 font-bold">1</span>
                  <span>{t.emailConfig.step1}</span>
                </li>
                <li className="flex gap-2">
                  <span className="w-4 h-4 rounded-full bg-blue-200 flex items-center justify-center shrink-0 font-bold">2</span>
                  <span>{t.emailConfig.step2}</span>
                </li>
                <li className="flex gap-2">
                  <span className="w-4 h-4 rounded-full bg-blue-200 flex items-center justify-center shrink-0 font-bold">3</span>
                  <span>{t.emailConfig.step3}</span>
                </li>
              </ul>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailSettingsDashboard;
