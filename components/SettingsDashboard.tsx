import React, { useState, useEffect, useMemo } from "react";
import {
  Settings,
  Bell,
  BellOff,
  Shield,
  User,
  Globe,
  Palette,
  Smartphone,
  Info,
  Loader2,
  Save,
  ChevronRight
} from "lucide-react";
import { UserSettings } from "../types";
import { api } from "../services/api";
import { translations, Language } from "../translations";

interface SettingsDashboardProps {
  lang: Language;
  onSettingsUpdate: () => void;
}

const SettingsDashboard: React.FC<SettingsDashboardProps> = ({ lang, onSettingsUpdate }) => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const t = useMemo(() => translations[lang], [lang]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const data = await api.getSettings();
    setSettings(data);
    setLoading(false);
  };

  const handleTogglePush = async () => {
    if (!settings) return;
    setSaving(true);
    const updated = await api.updateSettings({
      pushNotificationsEnabled: !settings.pushNotificationsEnabled
    });
    setSettings(updated);
    setSaving(false);
    onSettingsUpdate();
  };

  const handleLanguageChange = async (newLang: Language) => {
    if (!settings) return;
    setSaving(true);
    const updated = await api.updateSettings({ language: newLang });
    setSettings(updated);
    setSaving(false);
    onSettingsUpdate();
  };

  if (loading || !settings) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 lg:p-8 bg-white/50 backdrop-blur-sm rounded-3xl m-2 lg:m-4 shadow-inner overflow-hidden">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t.settings.title}</h2>
        <p className="text-gray-500 mt-1">{t.settings.subtitle}</p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8">
        <section>
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <Bell size={20} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 tracking-tight">{t.settings.notifications}</h3>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="max-w-md">
                <h4 className="text-sm font-bold text-gray-900 mb-1">{t.settings.pushTitle}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{t.settings.pushDesc}</p>
              </div>
              <button
                onClick={handleTogglePush}
                disabled={saving}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                  settings.pushNotificationsEnabled ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.pushNotificationsEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                {settings.pushNotificationsEnabled ? (
                  <Bell className="text-emerald-500" size={14} />
                ) : (
                  <BellOff className="text-red-400" size={14} />
                )}
                <span>
                  {t.settings.status} {settings.pushNotificationsEnabled ? t.settings.active : t.settings.inactive}
                </span>
              </div>
              {saving && (
                <span className="text-[10px] font-bold text-blue-500 animate-pulse uppercase tracking-wider">
                  {t.settings.saving}
                </span>
              )}
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="p-2 bg-gray-100 text-gray-600 rounded-xl">
              <Globe size={20} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 tracking-tight">{t.settings.languageRegion}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="max-w-md">
                <h4 className="text-sm font-bold text-gray-900 mb-1">{t.settings.systemLanguage}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{t.settings.languageDesc}</p>
              </div>
              <div className="flex w-full sm:w-auto p-1 bg-gray-100 rounded-xl self-start sm:self-auto">
                <button
                  onClick={() => handleLanguageChange("de")}
                  disabled={saving}
                  className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all ${settings.language === "de" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  Deutsch
                </button>
                <button
                  onClick={() => handleLanguageChange("en")}
                  disabled={saving}
                  className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all ${settings.language === "en" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  English
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="opacity-50 grayscale pointer-events-none">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="p-2 bg-gray-100 text-gray-600 rounded-xl">
              <Shield size={20} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 tracking-tight">{t.settings.security}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <User size={18} className="text-gray-400" />
                <span className="text-sm font-semibold">{t.settings.profileDetails}</span>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </div>
          </div>
        </section>

        <section className="opacity-50 grayscale pointer-events-none">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="p-2 bg-gray-100 text-gray-600 rounded-xl">
              <Palette size={20} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 tracking-tight">{t.settings.appearance}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-400 italic text-center">{t.settings.comingSoon}</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsDashboard;
