import { PipelineStage } from "./types";

export const STAGES: PipelineStage[] = [
  PipelineStage.IDENTIFIED,
  PipelineStage.CONTACTED,
  PipelineStage.QUALIFIED,
  PipelineStage.NEGOTIATION,
  PipelineStage.CLOSED
];

/** Used for translated stage labels; order matches STAGES */
export const PIPELINE_STAGE_KEYS = [
  "IDENTIFIED",
  "CONTACTED",
  "QUALIFIED",
  "NEGOTIATION",
  "CLOSED"
] as const;

export const STAGE_COLORS: Record<PipelineStage, string> = {
  [PipelineStage.IDENTIFIED]: "bg-gray-100 text-gray-700",
  [PipelineStage.CONTACTED]: "bg-blue-100 text-blue-700",
  [PipelineStage.QUALIFIED]: "bg-indigo-100 text-indigo-700",
  [PipelineStage.NEGOTIATION]: "bg-amber-100 text-amber-700",
  [PipelineStage.CLOSED]: "bg-emerald-100 text-emerald-700",
  [PipelineStage.TRASH]: "bg-red-100 text-red-700"
};
