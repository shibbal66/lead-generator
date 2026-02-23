import {
  DeleteTeamMemberPayload,
  GetTeamMembersParams,
  InviteTeamMemberPayload,
  TeamInvitation,
  TeamMember
} from "../store/slices/teamSlice";
import { request, requestPublic } from "./apiClient";

type TeamApiResponse = {
  success?: boolean;
  message?: string;
  id?: string;
  invitationId?: string;
  invitationID?: string;
  users?: TeamMember[];
  members?: TeamMember[];
  teamMembers?: TeamMember[];
  user?: TeamMember;
  invitations?: TeamInvitation[];
  pendingInvitations?: TeamInvitation[];
  invites?: TeamInvitation[];
  teamInvitations?: TeamInvitation[];
  total?: number;
  page?: number;
  limit?: number;
  invitation?: TeamInvitation;
  role?: string;
  email?: string;
  expiresAt?: string;
  status?: string;
  data?: {
    users?: TeamMember[];
    members?: TeamMember[];
    teamMembers?: TeamMember[];
    invitations?: TeamInvitation[];
    pendingInvitations?: TeamInvitation[];
    invites?: TeamInvitation[];
    teamInvitations?: TeamInvitation[];
    total?: number;
    page?: number;
    limit?: number;
  };
};

const parseJsonSafe = async (response: Response): Promise<TeamApiResponse> => {
  try {
    return (await response.json()) as TeamApiResponse;
  } catch {
    return {};
  }
};

const apiRequest = async (path: string, init?: RequestInit): Promise<TeamApiResponse> => {
  const res = await request(path, init);
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw new Error(data.message || "Team request failed");
  }
  return data;
};

export const teamApi = {
  getTeamMembers: async (
    params: GetTeamMembersParams
  ): Promise<{ users: TeamMember[]; invitations: TeamInvitation[]; total: number; page: number; limit: number }> => {
    const query = new URLSearchParams();
    if (params.teamId) query.set("teamId", params.teamId);
    if (params.search) query.set("search", params.search);
    if (typeof params.page === "number") query.set("page", String(params.page));
    if (typeof params.limit === "number") query.set("limit", String(params.limit));

    const path = query.toString() ? `/team?${query.toString()}` : "/team";
    const response = await apiRequest(path, { method: "GET" });
    const data = response.data || {};

    const users = response.users || response.members || response.teamMembers || data.users || data.members || data.teamMembers || [];
    const invitationRows =
      response.invitations ||
      response.pendingInvitations ||
      response.invites ||
      response.teamInvitations ||
      data.invitations ||
      data.pendingInvitations ||
      data.invites ||
      data.teamInvitations ||
      [];

    const invitations = invitationRows.map((invitation) => {
      const inv = invitation as TeamInvitation & {
        invitationID?: string;
        _id?: string;
        invitationExpiresAt?: string;
        expiresOn?: string;
        invitedUserName?: string;
      };
      const resolvedId = inv.id || inv.invitationId || inv.invitationID || inv._id || "";
      return {
        ...invitation,
        id: resolvedId,
        invitationId: resolvedId,
        name: inv.name || inv.invitedUserName || undefined,
        expiresAt: inv.expiresAt || inv.invitationExpiresAt || inv.expiresOn || undefined
      };
    });

    return {
      users,
      invitations,
      total: response.total || data.total || users.length + invitations.length,
      page: response.page || data.page || params.page || 1,
      limit: response.limit || data.limit || params.limit || 10
    };
  },

  inviteTeamMember: async (payload: InviteTeamMemberPayload): Promise<{ message: string }> => {
    const body = new URLSearchParams();
    body.append("email", payload.email);
    body.append("role", payload.role);

    const response = await apiRequest("/team/invite", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body
    });

    const invitationId =
      (response as { invitationId?: string }).invitationId ??
      (response as { invitation?: { id?: string } }).invitation?.id ??
      (response as { id?: string }).id;

    return {
      message: response.message || "Invitation sent successfully"
    };
  },

  getInvitationById: async (invitationId: string): Promise<TeamInvitation> => {
    const path = `/team/invitation/${encodeURIComponent(invitationId)}`;

    const res = await requestPublic(path, { method: "GET" });
    const response = await parseJsonSafe(res);
    if (!res.ok) {
      const rawMessage = (response as { message?: string }).message || "";
      const isAuthError = res.status === 401 || /not authenticated/i.test(rawMessage);
      const message = isAuthError
        ? "Invitation link could not be loaded. Please check the link or request a new invitation."
        : rawMessage || "Invitation is invalid or expired.";
      throw new Error(message);
    }

    if (response.invitation) {
      return {
        ...response.invitation,
        id: response.invitation.id || response.invitation.invitationId || invitationId,
        invitationId: response.invitation.invitationId || response.invitation.id || invitationId
      };
    }

    return {
      id: invitationId,
      invitationId,
      email: response.email || "",
      role: response.role || "",
      expiresAt: response.expiresAt,
      status: response.status
    };
  },

  cancelInvitation: async (invitationId: string): Promise<{ invitationId: string; message: string }> => {
    const response = await apiRequest(`/team/invitation/${invitationId}`, { method: "DELETE" });
    const responseInvitationId =
      (response as { invitationId?: string; invitationID?: string; id?: string }).invitationId ||
      (response as { invitationId?: string; invitationID?: string; id?: string }).invitationID ||
      (response as { invitationId?: string; invitationID?: string; id?: string }).id ||
      invitationId;

    return {
      invitationId: responseInvitationId,
      message: response.message || "Invitation canceled successfully"
    };
  },

  deleteTeamMember: async ({ userId }: DeleteTeamMemberPayload): Promise<{ userId: string; message: string }> => {
    const response = await apiRequest(`/user/${userId}`, { method: "DELETE" });

    return {
      userId,
      message: response.message || "Team member deleted successfully"
    };
  }
};
