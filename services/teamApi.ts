import {
  DeleteTeamMemberPayload,
  GetTeamMembersParams,
  InviteTeamMemberPayload,
  TeamInvitation,
  TeamMember
} from "../store/slices/teamSlice";
import { request } from "./apiClient";

type TeamApiResponse = {
  success?: boolean;
  message?: string;
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

    const path = query.toString() ? `/user?${query.toString()}` : "/user";
    const response = await apiRequest(path, { method: "GET" });
    console.log("[Team API] members & invitations response", response);
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
      return {
        ...invitation,
        id: inv.id || inv.invitationId || inv.invitationID || inv._id || "",
        invitationId: inv.invitationId || inv.invitationID || inv.id || inv._id || "",
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

    console.log("[Team API] POST /team/invite — request body", {
      email: payload.email,
      role: payload.role,
      bodyString: body.toString()
    });

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
    console.log("[Team API] POST /team/invite — response", {
      success: response.success,
      message: response.message,
      invitationId: invitationId ?? "(not in response)",
      full: response
    });
    if (invitationId) {
      console.log("[Team API] invitationId (for link/signup)", invitationId);
    }

    return {
      message: response.message || "Invitation sent successfully"
    };
  },

  getInvitationById: async (invitationId: string): Promise<TeamInvitation> => {
    const path = `/team/invitation/${invitationId}`;
    console.log("[Team API] GET invitation by ID — request", { invitationId, path });
    console.log("[Team API] invitationId", invitationId);

    const response = await apiRequest(path, { method: "GET" });

    console.log("[Team API] GET invitation by ID — response", {
      invitationId,
      hasInvitation: Boolean(response.invitation),
      email: response.email ?? response.invitation?.email,
      role: response.role ?? response.invitation?.role,
      full: response
    });
    console.log("[Team API] invitationId (resolved)", response.invitation?.id ?? response.invitationId ?? invitationId);

    if (response.invitation) {
      return response.invitation;
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
    console.log("[Team API] DELETE cancel invitation — request", { invitationId, path: `/team/invitation/${invitationId}` });
    const response = await apiRequest(`/team/invitation/${invitationId}`, { method: "DELETE" });
    console.log("[Team API] DELETE cancel invitation — response", { message: response.message, full: response });
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
    console.log("[Team API] DELETE team member — request", { userId, path: `/user/${userId}` });
    const response = await apiRequest(`/user/${userId}`, { method: "DELETE" });
    console.log("[Team API] DELETE team member — response", { message: response.message, full: response });

    return {
      userId,
      message: response.message || "Team member deleted successfully"
    };
  }
};
