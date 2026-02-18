import React, { useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Lead, PipelineStage } from "../types";
import { STAGES } from "../constants";
import LeadCard from "./LeadCard";
import { translations, Language } from "../translations";

interface KanbanBoardProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onAddDeal?: (lead: Lead) => void;
  lang: Language;
}

const KanbanColumn: React.FC<{
  stage: PipelineStage;
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onAddDeal?: (lead: Lead) => void;
  displayTitle: string;
  lang: Language;
}> = ({ stage, leads, onLeadClick, onAddDeal, displayTitle, lang }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[280px] bg-gray-50/50 rounded-xl p-3 flex flex-col h-full border transition-colors ${isOver ? "border-blue-300 bg-blue-50/20" : "border-transparent"}`}
    >
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wider">{displayTitle}</h2>
        <span className="bg-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-medium">
          {leads.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} onClick={onLeadClick} onAddDeal={onAddDeal} lang={lang} />
        ))}
      </div>
    </div>
  );
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ leads, onLeadClick, onAddDeal, lang }) => {
  const t = useMemo(() => translations[lang], [lang]);

  const getStageTitle = (stage: PipelineStage) => {
    switch (stage) {
      case PipelineStage.IDENTIFIED:
        return t.pipeline.stages.IDENTIFIED;
      case PipelineStage.CONTACTED:
        return t.pipeline.stages.CONTACTED;
      case PipelineStage.QUALIFIED:
        return t.pipeline.stages.QUALIFIED;
      case PipelineStage.NEGOTIATION:
        return t.pipeline.stages.NEGOTIATION;
      case PipelineStage.CLOSED:
        return t.pipeline.stages.CLOSED;
      default:
        return stage;
    }
  };

  return (
    <div className="flex space-x-4 h-[calc(100vh-180px)] overflow-x-auto pb-4 px-2">
      {STAGES.map((stage) => (
        <KanbanColumn
          key={stage}
          stage={stage}
          displayTitle={getStageTitle(stage)}
          leads={leads.filter((l) => l.pipelineStage === stage)}
          onLeadClick={onLeadClick}
          onAddDeal={onAddDeal}
          lang={lang}
        />
      ))}
    </div>
  );
};

export default KanbanBoard;
