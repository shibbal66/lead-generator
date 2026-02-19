import { PipelineStage } from "./types";

export const FORM_MAX_LENGTH = {
  leadFirstName: 30,
  leadLastName: 30,
  leadPosition: 30,
  leadCompany: 30,
  leadEmail: 254,
  leadPhone: 25,
  leadUrl: 500,
  projectTitle: 30,
  projectDescription: 50,
  userName: 30,
  todoDescription: 50,
  comment: 100
} as const;

export const STAGES: PipelineStage[] = [
  PipelineStage.IDENTIFIED,
  PipelineStage.CONTACTED,
  PipelineStage.QUALIFIED,
  PipelineStage.NEGOTIATION,
  PipelineStage.CLOSED
];

export const STAGE_COLORS: Record<PipelineStage, string> = {
  [PipelineStage.IDENTIFIED]: "bg-gray-100 text-gray-700",
  [PipelineStage.CONTACTED]: "bg-blue-100 text-blue-700",
  [PipelineStage.QUALIFIED]: "bg-indigo-100 text-indigo-700",
  [PipelineStage.NEGOTIATION]: "bg-amber-100 text-amber-700",
  [PipelineStage.CLOSED]: "bg-emerald-100 text-emerald-700",
  [PipelineStage.TRASH]: "bg-red-100 text-red-700"
};
