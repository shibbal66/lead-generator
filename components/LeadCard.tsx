import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { Lead, PipelineStage } from "../types";
import { User, Linkedin, MessageSquare, Briefcase, PlusCircle, DollarSign } from "lucide-react";

interface LeadCardProps {
  lead: Lead;
  onClick: (lead: Lead) => void;
  onAddDeal?: (lead: Lead) => void;
  dealCaptureTitle?: string;
  commentsText?: string;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onClick, onAddDeal, dealCaptureTitle, commentsText }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    data: { lead }
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`
      }
    : undefined;

  const isClosed = lead.pipelineStage === PipelineStage.CLOSED;
  const createdDate = (() => {
    if (!lead.createdAt) return "Not found";
    const parsed = new Date(lead.createdAt);
    if (Number.isNaN(parsed.getTime())) return "Not found";
    return parsed.toLocaleDateString("de-DE");
  })();
  const commentCount = typeof lead.commentCount === "number" ? lead.commentCount : lead.comments.length;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(lead)}
      className={`
        bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer mb-3 relative group
        ${isDragging ? "opacity-50 ring-2 ring-blue-500 z-50" : ""}
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-900 truncate flex-1">
          {lead.firstName} {lead.lastName}
        </h3>
        <div className="flex items-center space-x-2">
          {isClosed && onAddDeal && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddDeal(lead);
              }}
              className="text-emerald-600 hover:text-emerald-800 transition-colors opacity-0 group-hover:opacity-100"
              title={dealCaptureTitle}
            >
              <PlusCircle size={14} />
            </button>
          )}
          {lead.linkedinUrl && (
            <a
              href={lead.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-blue-600 hover:text-blue-800"
            >
              <Linkedin size={14} />
            </a>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center text-xs text-gray-500">
          <Briefcase size={12} className="mr-1.5 shrink-0" />
          <span className="truncate">{lead.currentPosition}</span>
        </div>

        <div className="flex items-center text-xs text-gray-500">
          <User size={12} className="mr-1.5 shrink-0" />
          <span>{lead.ownerName}</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400">
        <div className="flex items-center">
          <MessageSquare size={10} className="mr-1" />
          {commentCount} {commentsText || "Kommentare"}
        </div>
        <div className="flex items-center">
          {isClosed && <DollarSign size={10} className="text-emerald-500 mr-1" />}
          <span>{createdDate}</span>
        </div>
      </div>
    </div>
  );
};

export default LeadCard;
