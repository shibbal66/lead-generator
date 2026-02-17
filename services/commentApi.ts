import { BACKEND_URL } from "../config/env";
import {
  CommentRecord,
  CreateCommentPayload,
  DeleteCommentPayload,
  GetCommentsParams,
  UpdateCommentPayload
} from "../store/slices/commentSlice";

type CommentApiResponse = {
  success?: boolean;
  message?: string;
  comment?: CommentRecord;
  comments?: CommentRecord[];
  total?: number;
  page?: number;
  limit?: number;
};

const parseJsonSafe = async (response: Response): Promise<CommentApiResponse> => {
  try {
    return (await response.json()) as CommentApiResponse;
  } catch {
    return {};
  }
};

const toFormBody = (payload: Record<string, string | undefined>) => {
  const params = new URLSearchParams();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined) params.append(key, value);
  });
  return params;
};

const request = async (path: string, init?: RequestInit): Promise<CommentApiResponse> => {
  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}${path}`, {
      credentials: "include",
      ...init
    });
  } catch {
    throw new Error("Network/CORS error: unable to reach comment service.");
  }

  const data = await parseJsonSafe(response);

  if (!response.ok) {
    throw new Error(data.message || "Comment request failed");
  }

  return data;
};

export const commentApi = {
  createComment: async (payload: CreateCommentPayload): Promise<{ comment: CommentRecord; message: string }> => {
    const response = await request("/comment", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: toFormBody({
        userId: payload.userId,
        leadId: payload.leadId,
        text: payload.text
      })
    });

    if (!response.comment) {
      throw new Error("Created comment payload missing");
    }

    return {
      comment: response.comment,
      message: response.message || "Comment created successfully"
    };
  },

  getComments: async (params: GetCommentsParams): Promise<{ comments: CommentRecord[]; total: number; page: number; limit: number }> => {
    const query = new URLSearchParams();
    if (params.userId) query.set("userId", params.userId);
    if (params.leadId) query.set("leadId", params.leadId);
    if (typeof params.page === "number") query.set("page", String(params.page));
    if (typeof params.limit === "number") query.set("limit", String(params.limit));

    const path = query.toString() ? `/comment?${query.toString()}` : "/comment";
    const response = await request(path, { method: "GET" });

    return {
      comments: response.comments || [],
      total: response.total || 0,
      page: response.page || params.page || 1,
      limit: response.limit || params.limit || 10
    };
  },

  updateComment: async (payload: UpdateCommentPayload): Promise<{ comment: CommentRecord; message: string }> => {
    const response = await request(`/comment/${payload.commentId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: toFormBody({
        text: payload.text
      })
    });

    if (!response.comment) {
      throw new Error("Updated comment payload missing");
    }

    return {
      comment: response.comment,
      message: response.message || "Comment updated successfully"
    };
  },

  deleteComment: async (payload: DeleteCommentPayload): Promise<{ commentId: string; message: string }> => {
    const response = await request(`/comment/${payload.commentId}`, {
      method: "DELETE"
    });

    return {
      commentId: payload.commentId,
      message: response.message || "Comment deleted successfully"
    };
  }
};
