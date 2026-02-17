import React, { useState, useMemo } from "react";
import { X, Calendar, Download, ChevronRight } from "lucide-react";
import { translations, Language } from "../translations";

interface ExportDealsModalProps {
  lang: Language;
  onClose: () => void;
  onExport: (startDate?: string, endDate?: string) => Promise<void> | void;
  initialStartDate?: string;
  initialEndDate?: string;
}

const ExportDealsModal: React.FC<ExportDealsModalProps> = ({
  lang,
  onClose,
  onExport,
  initialStartDate = "",
  initialEndDate = ""
}) => {
  const t = useMemo(() => translations[lang], [lang]);

  const [dateFrom, setDateFrom] = useState(initialStartDate);
  const [dateTo, setDateTo] = useState(initialEndDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    Promise.resolve(onExport(dateFrom || undefined, dateTo || undefined))
      .then(() => onClose())
      .catch(() => {
        // Error state is shown in dashboard container via API error surface.
      });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="px-8 py-6 border-b flex justify-between items-center bg-blue-50/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="text-blue-600" size={20} />
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">{t.analytics.exportModalTitle}</h2>
            </div>
            <p className="text-xs text-blue-700 font-medium">{t.analytics.exportModalSubtitle}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                {t.analytics.filters.dateFrom}
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                <input
                  type="date"
                  className="w-full pl-9 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 text-[10px] font-bold text-gray-600"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                {t.analytics.filters.dateTo}
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                <input
                  type="date"
                  className="w-full pl-9 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 text-[10px] font-bold text-gray-600"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-2"
          >
            <Download size={18} />
            {t.analytics.downloadButton}
            <ChevronRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ExportDealsModal;
