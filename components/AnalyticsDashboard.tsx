
import React, { useState, useMemo } from 'react';
import { 
  BarChart3, TrendingUp, PieChart, Users, Calendar, 
  Filter, Award, DollarSign, ArrowUpRight, ArrowDownRight,
  ChevronDown, Search, Target, Download, FolderKanban, Briefcase,
  Layers, Clock, CheckCircle2
} from 'lucide-react';
import { Deal, Lead, Owner, DealType, Project, PipelineStage } from '../types';
import { STAGES, STAGE_COLORS } from '../constants';
import { translations, Language } from '../translations';
import ExportDealsModal from './ExportDealsModal';
import * as XLSX from 'xlsx';

interface AnalyticsDashboardProps {
  deals: Deal[];
  leads: Lead[];
  owners: Owner[];
  projects: Project[];
  lang: Language;
}

type AnalyticsTab = 'deals' | 'pipeline';

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ deals, leads, owners, projects, lang }) => {
  const t = useMemo(() => translations[lang], [lang]);

  // View State
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('deals');

  // Filters State
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [leadFilter, setLeadFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Filtered Data (Deals)
  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      const lead = leads.find(l => l.id === deal.leadId);
      const matchesOwner = ownerFilter === 'all' || (lead && lead.ownerName === owners.find(o => o.id === ownerFilter)?.name);
      const matchesLead = leadFilter === 'all' || deal.leadId === leadFilter;
      const matchesProject = projectFilter === 'all' || (lead && lead.projectId === projectFilter);
      const matchesType = typeFilter === 'all' || deal.type === typeFilter;
      const dealDate = new Date(deal.createdAt);
      const matchesDateFrom = !dateFrom || dealDate >= new Date(dateFrom);
      const matchesDateTo = !dateTo || dealDate <= new Date(dateTo);
      
      return matchesOwner && matchesLead && matchesProject && matchesType && matchesDateFrom && matchesDateTo;
    });
  }, [deals, leads, owners, ownerFilter, leadFilter, projectFilter, typeFilter, dateFrom, dateTo]);

  // Filtered Data (Leads - for Pipeline View)
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      if (l.pipelineStage === PipelineStage.TRASH) return false;
      const matchesOwner = ownerFilter === 'all' || l.ownerName === owners.find(o => o.id === ownerFilter)?.name;
      const matchesProject = projectFilter === 'all' || l.projectId === projectFilter;
      const leadDate = new Date(l.createdAt);
      const matchesDateFrom = !dateFrom || leadDate >= new Date(dateFrom);
      const matchesDateTo = !dateTo || leadDate <= new Date(dateTo);
      return matchesOwner && matchesProject && matchesDateFrom && matchesDateTo;
    });
  }, [leads, owners, ownerFilter, projectFilter, dateFrom, dateTo]);

  // --- Deal KPIs & Charts ---
  const totalVolume = filteredDeals.reduce((sum, d) => sum + d.totalAmount, 0);
  const volumeByType = {
    [DealType.CONSULTING]: filteredDeals.filter(d => d.type === DealType.CONSULTING).reduce((sum, d) => sum + d.totalAmount, 0),
    [DealType.ONLINE_TRAINING]: filteredDeals.filter(d => d.type === DealType.ONLINE_TRAINING).reduce((sum, d) => sum + d.totalAmount, 0),
    [DealType.OFFSITE]: filteredDeals.filter(d => d.type === DealType.OFFSITE).reduce((sum, d) => sum + d.totalAmount, 0),
  };

  const leadDistribution = useMemo(() => {
    const counts: Record<string, { count: number, name: string }> = {};
    filteredDeals.forEach(deal => {
      const lead = leads.find(l => l.id === deal.leadId);
      const leadName = lead ? `${lead.firstName} ${lead.lastName}` : 'Unbekannt';
      if (!counts[deal.leadId]) counts[deal.leadId] = { count: 0, name: leadName };
      counts[deal.leadId].count += 1;
    });
    return Object.values(counts).sort((a, b) => b.count - a.count);
  }, [filteredDeals, leads]);

  const ownerPerformance = useMemo(() => {
    const performance: Record<string, { volume: number, name: string, avatar: string }> = {};
    filteredDeals.forEach(deal => {
      const lead = leads.find(l => l.id === deal.leadId);
      if (lead) {
        const owner = owners.find(o => o.name === lead.ownerName);
        const ownerId = owner?.id || 'unknown';
        if (!performance[ownerId]) {
          performance[ownerId] = { volume: 0, name: lead.ownerName, avatar: owner?.avatar || '?' };
        }
        performance[ownerId].volume += deal.totalAmount;
      }
    });
    return Object.values(performance).sort((a, b) => b.volume - a.volume);
  }, [filteredDeals, leads, owners]);

  // --- Pipeline Metrics ---
  const pipelineFunnel = useMemo(() => {
    return STAGES.map(stage => ({
      stage,
      count: filteredLeads.filter(l => l.pipelineStage === stage).length,
      title: t.pipeline.stages[stage.toUpperCase().replace(/\s/g, '_') as keyof typeof t.pipeline.stages] || stage
    }));
  }, [filteredLeads, t]);

  const avgLeadAge = useMemo(() => {
    if (filteredLeads.length === 0) return 0;
    const now = new Date();
    const totalDays = filteredLeads.reduce((sum, l) => {
      const created = new Date(l.createdAt);
      return sum + (now.getTime() - created.getTime()) / (1000 * 3600 * 24);
    }, 0);
    return Math.round(totalDays / filteredLeads.length);
  }, [filteredLeads]);

  const conversionRate = useMemo(() => {
    if (filteredLeads.length === 0) return 0;
    const closedCount = filteredLeads.filter(l => l.pipelineStage === PipelineStage.CLOSED).length;
    return Math.round((closedCount / filteredLeads.length) * 100);
  }, [filteredLeads]);

  const leadsByOwnerCount = useMemo(() => {
    const counts: Record<string, { count: number, name: string, avatar: string }> = {};
    filteredLeads.forEach(l => {
      const owner = owners.find(o => o.name === l.ownerName);
      if (!counts[l.ownerName]) counts[l.ownerName] = { count: 0, name: l.ownerName, avatar: owner?.avatar || '?' };
      counts[l.ownerName].count += 1;
    });
    return Object.values(counts).sort((a, b) => b.count - a.count);
  }, [filteredLeads, owners]);

  // --- Handlers ---
  const handleExportDeals = (start: string, end: string) => {
    const sDate = new Date(start);
    const eDate = new Date(end);
    const exportData = deals.filter(d => {
      const dDate = new Date(d.createdAt);
      return dDate >= sDate && dDate <= eDate;
    }).map(d => {
      const lead = leads.find(l => l.id === d.leadId);
      const project = projects.find(p => p.id === lead?.projectId);
      return {
        ID: d.id, Bezeichnung: d.name, Lead: lead ? `${lead.firstName} ${lead.lastName}` : 'Unbekannt',
        Firma: lead?.company || '', Projekt: project?.title || 'Kein Projekt', Owner: lead?.ownerName || '',
        Art: d.type, Summe: d.totalAmount, Währung: d.currency || 'EUR', Start: d.startDate, Ende: d.endDate,
        Beschreibung: d.description, Datum: new Date(d.createdAt).toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US')
      };
    });
    if (exportData.length === 0) { alert(t.analytics.noData); return; }
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Abschlüsse");
    XLSX.writeFile(workbook, `Abschluesse_${start}_${end}.xlsx`);
  };

  const locale = lang === 'de' ? 'de-DE' : 'en-US';

  return (
    <div className="flex-1 flex flex-col p-8 bg-white/50 backdrop-blur-sm rounded-3xl m-4 shadow-inner overflow-hidden">
      {/* Header with Switcher and Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div className="flex flex-col">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t.analytics.title}</h2>
          <div className="mt-4 flex p-1 bg-gray-100/50 rounded-2xl w-fit">
            <button 
              onClick={() => setActiveTab('deals')}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'deals' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <DollarSign size={16} /> {t.analytics.tabDeals}
            </button>
            <button 
              onClick={() => setActiveTab('pipeline')}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'pipeline' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Layers size={16} /> {t.analytics.tabPipeline}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {activeTab === 'deals' && (
            <button 
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-2xl font-bold text-sm hover:bg-gray-50 shadow-sm transition-all group"
            >
              <Download size={18} className="text-blue-600 group-hover:scale-110 transition-transform" />
              {t.analytics.exportDeals}
            </button>
          )}

          <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl">
              <Users size={14} className="text-gray-400" />
              <select value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)} className="bg-transparent text-xs font-bold text-gray-700 border-none focus:ring-0 p-0">
                <option value="all">{t.analytics.filters.allOwners}</option>
                {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl">
              <FolderKanban size={14} className="text-gray-400" />
              <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)} className="bg-transparent text-xs font-bold text-gray-700 border-none focus:ring-0 p-0 max-w-[120px]">
                <option value="all">{t.header.allProjects}</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl">
              <Calendar size={14} className="text-gray-400" />
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="bg-transparent text-[10px] font-bold text-gray-600 border-none focus:ring-0 p-0 w-24" />
              <span className="text-gray-300">-</span>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="bg-transparent text-[10px] font-bold text-gray-600 border-none focus:ring-0 p-0 w-24" />
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'deals' ? (
        <>
          {/* Deals KPI Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><TrendingUp size={64} className="text-emerald-600" /></div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{t.analytics.kpiTotal}</p>
              <div className="flex items-baseline gap-2"><h4 className="text-2xl font-black text-emerald-600">{totalVolume.toLocaleString(locale)}</h4><span className="text-sm font-bold text-emerald-500">€</span></div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{t.analytics.kpiConsulting}</p>
              <h4 className="text-xl font-extrabold text-gray-800">{volumeByType[DealType.CONSULTING].toLocaleString(locale)} €</h4>
              <div className="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{ width: `${totalVolume > 0 ? (volumeByType[DealType.CONSULTING]/totalVolume)*100 : 0}%` }} /></div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{t.analytics.kpiTraining}</p>
              <h4 className="text-xl font-extrabold text-gray-800">{volumeByType[DealType.ONLINE_TRAINING].toLocaleString(locale)} €</h4>
              <div className="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-500" style={{ width: `${totalVolume > 0 ? (volumeByType[DealType.ONLINE_TRAINING]/totalVolume)*100 : 0}%` }} /></div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{t.analytics.kpiOffsite}</p>
              <h4 className="text-xl font-extrabold text-gray-800">{volumeByType[DealType.OFFSITE].toLocaleString(locale)} €</h4>
              <div className="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-amber-500" style={{ width: `${totalVolume > 0 ? (volumeByType[DealType.OFFSITE]/totalVolume)*100 : 0}%` }} /></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col">
              <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8 flex items-center gap-3"><PieChart size={20} className="text-emerald-500" /> {t.analytics.chartLeadDistribution}</h3>
              <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                {leadDistribution.slice(0, 10).map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl group hover:bg-emerald-50 transition-all">
                    <span className="text-sm font-bold text-gray-700 truncate max-w-[200px]">{item.name}</span>
                    <span className="text-xs font-black text-emerald-600 bg-white px-2 py-1 rounded-lg border border-emerald-100">{item.count} Deals</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col">
              <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8 flex items-center gap-3"><BarChart3 size={20} className="text-blue-500" /> {t.analytics.chartOwnerPerformance}</h3>
              <div className="flex-1 space-y-6 overflow-y-auto pr-4 custom-scrollbar">
                {ownerPerformance.map((op, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">{op.avatar}</div><span className="text-sm font-bold text-gray-700">{op.name}</span></div>
                      <span className="text-sm font-black text-emerald-600">{op.volume.toLocaleString(locale)} €</span>
                    </div>
                    <div className="h-4 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100 p-0.5">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(op.volume / Math.max(...ownerPerformance.map(o => o.volume))) * 100}%`, background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Pipeline KPI Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{t.analytics.metrics.activeLeads}</p>
              <h4 className="text-2xl font-black text-blue-600">{filteredLeads.length}</h4>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{t.analytics.metrics.conversionRate}</p>
              <div className="flex items-baseline gap-2">
                <h4 className="text-2xl font-black text-emerald-600">{conversionRate}%</h4>
                <ArrowUpRight size={16} className="text-emerald-500" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{t.analytics.metrics.avgLeadAge}</p>
              <h4 className="text-2xl font-black text-gray-800">{avgLeadAge} <span className="text-sm font-bold text-gray-400 uppercase">{t.analytics.metrics.days}</span></h4>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-center">
              <CheckCircle2 size={40} className="text-emerald-500 opacity-20" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col">
              <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8 flex items-center gap-3"><Layers size={20} className="text-indigo-500" /> {t.analytics.chartPipelineFunnel}</h3>
              <div className="flex-1 flex flex-col justify-between py-4">
                {pipelineFunnel.map((item, i) => {
                  const maxCount = Math.max(...pipelineFunnel.map(f => f.count));
                  const width = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                  return (
                    <div key={i} className="group relative flex items-center h-12 w-full">
                      <div 
                        className={`h-full rounded-r-2xl transition-all duration-1000 ease-out flex items-center px-4 ${STAGE_COLORS[item.stage as PipelineStage]}`} 
                        style={{ width: `${Math.max(width, 15)}%` }}
                      >
                        <span className="text-[10px] font-black uppercase tracking-widest truncate">{item.title}</span>
                      </div>
                      <span className="ml-4 text-sm font-black text-gray-900">{item.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col">
              <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8 flex items-center gap-3"><Users size={20} className="text-blue-500" /> {t.analytics.chartLeadsByOwner}</h3>
              <div className="flex-1 space-y-6 overflow-y-auto pr-4 custom-scrollbar">
                {leadsByOwnerCount.map((oc, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">{oc.avatar}</div><span className="text-sm font-bold text-gray-700">{oc.name}</span></div>
                      <span className="text-sm font-black text-blue-600">{oc.count} Leads</span>
                    </div>
                    <div className="h-4 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100 p-0.5">
                      <div className="h-full rounded-full transition-all duration-1000 bg-blue-500" style={{ width: `${(oc.count / Math.max(...leadsByOwnerCount.map(o => o.count))) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {isExportModalOpen && (
        <ExportDealsModal 
          lang={lang} 
          onClose={() => setIsExportModalOpen(false)} 
          onExport={handleExportDeals} 
        />
      )}
    </div>
  );
};

export default AnalyticsDashboard;
