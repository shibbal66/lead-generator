
import React, { useState, useMemo } from 'react';
import { X, Linkedin, Loader2, ChevronRight, Check, User, Building, Calendar, Link as LinkIcon } from 'lucide-react';
import { Lead, PipelineStage, EnrichmentData, Owner } from '../types';
import { STAGES } from '../constants';
import { api } from '../services/api';
import { translations, Language } from '../translations';

interface LeadModalProps {
  onClose: () => void;
  onSave: (lead: Partial<Lead>) => void;
  owners: Owner[];
  lang: Language;
}

const LeadModal: React.FC<LeadModalProps> = ({ onClose, onSave, owners, lang }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [enrichmentError, setEnrichmentError] = useState('');
  
  const t = useMemo(() => translations[lang], [lang]);

  const [formData, setFormData] = useState<Partial<Lead>>({
    firstName: '',
    lastName: '',
    currentPosition: '',
    company: '',
    linkedinUrl: '',
    ownerName: '',
    pipelineStage: PipelineStage.IDENTIFIED,
    email: '',
    phone: '',
    birthday: ''
  });

  const handleEnrich = async () => {
    if (!formData.linkedinUrl?.includes('linkedin.com/')) {
      setEnrichmentError(lang === 'de' ? 'Bitte geben Sie eine gültige LinkedIn URL ein.' : 'Please enter a valid LinkedIn URL.');
      return;
    }

    setLoading(true);
    setEnrichmentError('');
    try {
      const data = await api.enrichLinkedIn(formData.linkedinUrl);
      setFormData(prev => ({ ...prev, ...data }));
      setStep(2);
    } catch (err) {
      setEnrichmentError(lang === 'de' ? 'Enrichment fehlgeschlagen. Bitte manuell ausfüllen.' : 'Enrichment failed. Please fill manually.');
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">{t.leadModal.title}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Stepper */}
          <div className="flex items-center mb-8">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-colors ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
            <div className={`flex-1 h-0.5 mx-3 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-colors ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
          </div>

          {step === 1 ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t.leadModal.linkedinLabel}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Linkedin size={18} />
                  </div>
                  <input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    placeholder="https://www.linkedin.com/in/nutzername"
                    className="w-full pl-10 pr-4 py-3 border-gray-200 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                {enrichmentError && <p className="mt-2 text-xs text-red-500">{enrichmentError}</p>}
                <p className="mt-2 text-xs text-gray-400">{t.leadModal.helpText}</p>
              </div>

              <div className="flex flex-col space-y-3">
                <button
                  onClick={handleEnrich}
                  disabled={loading || !formData.linkedinUrl}
                  className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Check className="mr-2" size={18} />}
                  {t.leadModal.enrichBtn}
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-white text-gray-600 font-bold py-3 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center"
                >
                  {t.leadModal.manualBtn}
                  <ChevronRight className="ml-2" size={18} />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 pb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.leadModal.firstName} *</label>
                  <input
                    required
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.leadModal.lastName} *</label>
                  <input
                    required
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.leadModal.position} *</label>
                  <input
                    required
                    type="text"
                    value={formData.currentPosition}
                    onChange={(e) => setFormData({ ...formData, currentPosition: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.leadModal.company}</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.leadModal.owner} *</label>
                <select
                  required
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="" disabled>{t.leadModal.selectOwner}</option>
                  {owners.map(o => (
                    <option key={o.id} value={o.name}>{o.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.leadModal.email}</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.leadModal.phone}</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* LinkedIn URL field added to manual step */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.leadModal.linkedinLabel}</label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.leadModal.birthday}</label>
                <input
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-200 transition-all"
                >
                  {t.leadModal.back}
                </button>
                <button
                  type="submit"
                  className="flex-[2] bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
                >
                  {t.leadModal.save}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadModal;
