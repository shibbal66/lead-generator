export enum PipelineStage {
  IDENTIFIED = "Lead identifiziert",
  CONTACTED = "Kontakt aufgenommen",
  QUALIFIED = "Qualifiziert",
  NEGOTIATION = "Angebot / Verhandlung",
  CLOSED = "Erfolgreicher Abschluss",
  TRASH = "Papierkorb"
}

export enum DealType {
  CONSULTING = "Beratung",
  ONLINE_TRAINING = "Online Training",
  OFFSITE = "Offsite"
}

export enum UserStatus {
  INVITED = "Eingeladen",
  ACTIVE = "Aktiv",
  DISABLED = "Deaktiviert"
}

export enum EmailProvider {
  WORKSPACE_GMAIL_API = "workspace_gmail_api",
  SMTP_RELAY = "smtp_relay"
}

export interface EmailSettings {
  provider: EmailProvider;
  serviceMailboxEmail: string; // Real mailbox (mailer@...)
  brandFromEmail: string; // Alias/Group (sales@...)
  fromName: string;
  replyToEmail?: string;
  googleSAJson?: string; // Service Account JSON string
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  lastCheckStatus?: "ok" | "error";
  lastCheckMessage?: string;
}

export interface UserSettings {
  pushNotificationsEnabled: boolean;
  theme: "light" | "dark";
  language: "de" | "en";
}

export interface Comment {
  id: string;
  leadId: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface LeadFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  data: string;
  uploadedAt: string;
}

export interface Owner {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  status: UserStatus;
  invitedAt?: string;
  inviteError?: string;
  inviteToken?: string;
  tokenExpiresAt?: string;
}

export interface Task {
  id: string;
  ownerId: string;
  senderName: string;
  text: string;
  createdAt: string;
  deadline?: string;
  isRead: boolean;
}

export interface Todo {
  id: string;
  text: string;
  deadline?: string;
  isCompleted: boolean;
  createdAt: string;
  leadId?: string;
  assignedToOwnerId?: string;
  assignedByOwnerId?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  managerName: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  currentPosition: string;
  company?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  twitterUrl?: string;
  ownerName: string;
  phone?: string;
  email?: string;
  birthday?: string;
  pipelineStage: PipelineStage;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
  commentCount?: number;
  files: LeadFile[];
  deals?: Deal[];
  linkedTodos?: Todo[];
  availableProjects?: Project[];
}

export interface Deal {
  id: string;
  leadId: string;
  projectId?: string;
  name: string;
  type: DealType;
  totalAmount: number;
  currency: string;
  startDate: string;
  endDate: string;
  description: string;
  createdAt: string;
}

export interface EnrichmentData {
  firstName: string;
  lastName: string;
  currentPosition: string;
  company?: string;
  email?: string;
  phone?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  twitterUrl?: string;
}

export type SortField = "lastName" | "createdAt";
export type SortOrder = "asc" | "desc";

// Dashboard analytics API response types
export interface AnalyticsDealsDealTypeRow {
  dealType: string;
  totalValue: number;
}

export interface AnalyticsDealsLeadRow {
  leadName: string;
  count: number;
}

export interface AnalyticsDealsOwnerRow {
  ownerName: string;
  totalValue: number;
}

export interface AnalyticsDealsData {
  totalValueOfDeals: number;
  dealsValueByType?: AnalyticsDealsDealTypeRow[];
  countDealsPerLead?: AnalyticsDealsLeadRow[];
  dealValueByOwner?: AnalyticsDealsOwnerRow[];
}

export interface AnalyticsPipelineOwnerRow {
  ownerName: string;
  count: number;
}

export interface AnalyticsPipelineStatusRow {
  status: string;
  count: number;
}

export interface AnalyticsPipelineData {
  activeLeads: number;
  conversionRate: number;
  countLeadsPerOwner?: AnalyticsPipelineOwnerRow[];
  leadsGroupByStatus?: AnalyticsPipelineStatusRow[];
}

export interface DashboardAnalyticsParams {
  ownerId?: string;
  projectId?: string;
  startDate?: string;
  endDate?: string;
}
