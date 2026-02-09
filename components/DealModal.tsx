
import React, { useState, useMemo } from 'react';
import { X, CheckCircle, DollarSign, Calendar, Type, FileText, ChevronRight, FolderKanban } from 'lucide-react';
import { Lead, Deal, DealType, Project } from '../types';
import { translations, Language } from '../translations';

interface DealModalProps {
  lead: Lead;
  projects: Project[];
  lang: Language;
  onClose: () => void;
  onSave: (dealData: Omit<Deal, 'id' | 'createdAt'>) => void;
}

const DealModal: React.FC<DealModalProps> = ({ lead, projects, lang, onClose, onSave }) => {
  const t = useMemo(() => translations[lang], [lang]);

  const [formData, setFormData] = useState({
    name: '',
    type: DealType.CONSULTING,
    totalAmount: 0,
    currency: 'EUR',
    startDate: '',
    endDate: '',
    description: '',
    projectId: lead.projectId || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      leadId: lead.id,
      projectId: formData.projectId || undefined
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="px-8 py-6 border-b flex justify-between items-center bg-emerald-50/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="text-emerald-600" size={20} />
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">{t.deal.modalTitle}</h2>
            </div>
            <p className="text-xs text-emerald-700 font-medium">{lead.firstName} {lead.lastName} • {lead.company}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <p className="text-sm text-gray-500">{t.deal.modalSubtitle}</p>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t.deal.nameLabel}</label>
            <div className="relative">
              <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              <input
                required
                autoFocus
                type="text"
                placeholder={t.deal.namePlaceholder}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t.header.projects}</label>
            <div className="relative">
              <FolderKanban className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              <select
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-gray-700 appearance-none"
                value={formData.projectId}
                onChange={e => setFormData({ ...formData, projectId: e.target.value })}
              >
                <option value="">Keinem Projekt zugeordnet</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t.deal.typeLabel}</label>
              <select
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-gray-700"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as DealType })}
              >
                {Object.values(DealType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-[1fr_2fr] gap-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t.deal.currencyLabel}</label>
                <select
                  className="w-full px-2 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-gray-700"
                  value={formData.currency}
                  onChange={e => setFormData({ ...formData, currency: e.target.value })}
                >
                  <option value="EUR">€</option>
                  <option value="USD">$</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t.deal.amountLabel}</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  <input
                    required
                    type="number"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 text-sm font-bold"
                    value={formData.totalAmount}
                    onChange={e => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t.deal.periodLabel}</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                <input
                  required
                  type="date"
                  className="w-full pl-9 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 text-[10px] font-bold text-gray-600"
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                <input
                  required
                  type="date"
                  className="w-full pl-9 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 text-[10px] font-bold text-gray-600"
                  value={formData.endDate}
                  onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t.deal.descLabel}</label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 text-gray-300" size={16} />
              <textarea
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 text-sm font-medium resize-none min-h-[100px]"
                placeholder="..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all flex items-center justify-center gap-2"
          >
            {t.deal.saveButton}
            <ChevronRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default DealModal;
