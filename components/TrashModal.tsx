import React, { useMemo, useState } from "react";
import { X, Trash2, RotateCcw, Briefcase, Building } from "lucide-react";
import { Lead } from "../types";
import { translations, Language } from "../translations";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

interface TrashModalProps {
  leads: Lead[];
  lang: Language;
  onClose: () => void;
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
}

const TrashModal: React.FC<TrashModalProps> = ({ leads, lang, onClose, onRestore, onPermanentDelete }) => {
  const t = useMemo(() => translations[lang], [lang]);
  const [leadToPermanentDelete, setLeadToPermanentDelete] = useState<Lead | null>(null);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[80vh]">
        <div className="px-8 py-6 border-b flex justify-between items-center bg-red-50/50 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trash2 className="text-red-600" size={20} />
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">{t.trash.title}</h2>
            </div>
            <p className="text-xs text-red-700 font-medium">{t.trash.subtitle}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-4">
          {leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 italic">
              <Trash2 size={48} className="mb-4 opacity-20" />
              <p>{t.trash.noLeads}</p>
            </div>
          ) : (
            leads.map((lead) => (
              <div
                key={lead.id}
                className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm">
                    {lead.firstName[0]}
                    {lead.lastName[0]}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      {lead.firstName} {lead.lastName}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium mt-0.5">
                      <Briefcase size={10} />
                      <span className="truncate">{lead.currentPosition}</span>
                      {lead.company && (
                        <>
                          <span className="text-gray-300">•</span>
                          <Building size={10} />
                          <span className="truncate">{lead.company}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onRestore(lead.id)}
                    className="p-2 bg-white text-emerald-600 hover:bg-emerald-50 rounded-xl border border-emerald-100 shadow-sm transition-all"
                    title={t.trash.restore}
                  >
                    <RotateCcw size={16} />
                  </button>
                  <button
                    onClick={() => setLeadToPermanentDelete(lead)}
                    className="p-2 bg-white text-red-600 hover:bg-red-50 rounded-xl border border-red-100 shadow-sm transition-all"
                    title={t.trash.permanentDelete}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={leadToPermanentDelete !== null}
        title={lang === "de" ? "Lead endgültig löschen?" : "Permanently delete lead?"}
        description={t.trash.confirmPermanent}
        confirmLabel={t.trash.permanentDelete}
        cancelLabel={t.common.cancel}
        onConfirm={() => {
          if (leadToPermanentDelete) {
            onPermanentDelete(leadToPermanentDelete.id);
            setLeadToPermanentDelete(null);
          }
        }}
        onCancel={() => setLeadToPermanentDelete(null)}
      />
    </div>
  );
};

export default TrashModal;
