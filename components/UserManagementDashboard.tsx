import React, { useState, useEffect, useMemo } from "react";
import {
  UserPlus,
  Shield,
  CheckCircle2,
  Clock,
  Trash2,
  Search,
  Loader2,
  AlertCircle
} from "lucide-react";
import { translations, Language } from "../translations";
import ShareModal from "./ShareModal";
import Toast from "./Toast";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { deleteTeamMember, getTeamMembers, inviteTeamMember } from "../store/actions/teamActions";
import { getUserById } from "../store/actions/userActions";

interface UserManagementDashboardProps {
  lang: Language;
}

const UserManagementDashboard: React.FC<UserManagementDashboardProps> = ({ lang }) => {
  const dispatch = useAppDispatch();
  const { members, listStatus, total, limit: apiLimit } = useAppSelector((state) => state.team);
  const authUserTeamId = useAppSelector((state) => state.auth.user?.teamId);
  const currentUserId = useAppSelector((state) => state.auth.user?.userId);
  const selectedUser = useAppSelector((state) => state.users.selectedUser);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDeleteUser, setPendingDeleteUser] = useState<{ id: string; name: string } | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [resolvedTeamId, setResolvedTeamId] = useState<string | undefined>(authUserTeamId);
  const [toastState, setToastState] = useState<{ open: boolean; type: "success" | "error"; message: string }>({
    open: false,
    type: "success",
    message: ""
  });

  const t = useMemo(() => translations[lang], [lang]);
  const loading = listStatus === "loading";
  const totalPages = Math.max(1, Math.ceil(total / (apiLimit || limit)));

  useEffect(() => {
    if (authUserTeamId) {
      setResolvedTeamId(authUserTeamId);
    }
  }, [authUserTeamId]);

  useEffect(() => {
    if (resolvedTeamId || !currentUserId) return;
    console.log("[Team] resolving teamId from getUserById", { currentUserId });
    void dispatch(getUserById(currentUserId));
  }, [currentUserId, dispatch, resolvedTeamId]);

  useEffect(() => {
    if (!selectedUser || selectedUser.id !== currentUserId || !selectedUser.teamId) return;
    setResolvedTeamId(selectedUser.teamId);
  }, [currentUserId, selectedUser]);

  useEffect(() => {
    if (!resolvedTeamId) return;
    setError(null);
    const params = { teamId: resolvedTeamId, page, limit, search: search.trim() || undefined };
    console.log("[Team] get members params", params);
    void dispatch(getTeamMembers(params));
  }, [dispatch, limit, page, resolvedTeamId, search]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleDeleteUser = async (userId: string) => {
    setDeletingId(userId);
    setError(null);
    console.log("[Team] delete member requested", { teamId: resolvedTeamId, userId });
    const action = await dispatch(deleteTeamMember({ userId }));
    if (deleteTeamMember.fulfilled.match(action)) {
      console.log("[Team] delete member success", action.payload);
      setToastState({
        open: true,
        type: "success",
        message: action.payload.message || "Team member deleted successfully"
      });
    } else {
      const message = (action.payload as string) || "Failed to delete team member";
      console.error("[Team] delete member failed", action);
      setError(message);
      setToastState({
        open: true,
        type: "error",
        message
      });
    }
    setDeletingId(null);
  };

  return (
    <div className="flex-1 flex flex-col p-8 bg-white/50 backdrop-blur-sm rounded-3xl m-4 shadow-inner overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t.userMgmt.title}</h2>
          <p className="text-gray-500 mt-1">{t.userMgmt.subtitle}</p>
        </div>
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <UserPlus size={18} /> {t.userMgmt.inviteBtn}
        </button>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder={t.userMgmt.searchPlaceholder}
          className="w-full pl-12 pr-4 py-3 bg-white border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-100 rounded-2xl flex items-start gap-3 animate-in fade-in">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="flex-1 overflow-hidden bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {t.userMgmt.colEmployee}
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {t.userMgmt.colRole}
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {t.userMgmt.colStatus}
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {t.userMgmt.colLastInvited}
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">
                  {t.userMgmt.colActions}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <Loader2 className="animate-spin text-blue-600 mx-auto" size={32} />
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center italic text-gray-400 text-sm">
                    {t.userMgmt.noUsers}
                  </td>
                </tr>
              ) : (
                members.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                          {user.name
                            .split(" ")
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((part) => part[0]?.toUpperCase() || "")
                            .join("")}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                        <Shield size={14} className="text-gray-300" />
                        {user.role}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          user.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-gray-50 text-gray-500 border-gray-100"
                        }`}
                      >
                        {user.status === "ACTIVE" ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {user.status}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] text-gray-300">-</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setPendingDeleteUser({ id: user.id, name: user.name })}
                          disabled={deletingId === user.id}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-all"
                          title={t.common.delete}
                        >
                          {deletingId === user.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isInviteModalOpen && (
        <ShareModal
          onClose={() => setIsInviteModalOpen(false)}
          onInvite={async ({ email, role }) => {
            const inviteAction = await dispatch(inviteTeamMember({ email, role }));
            if (!inviteTeamMember.fulfilled.match(inviteAction)) {
              throw new Error((inviteAction.payload as string) || "Failed to invite team member");
            }
            setToastState({
              open: true,
              type: "success",
              message: inviteAction.payload.message || "Invitation sent"
            });
            if (!resolvedTeamId) return;
            void dispatch(getTeamMembers({ teamId: resolvedTeamId, page, limit, search: search.trim() || undefined }));
          }}
        />
      )}
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
        <p className="text-xs font-semibold text-gray-500">
          {lang === "de" ? `Seite ${page} von ${totalPages}` : `Page ${page} of ${totalPages}`}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1 || loading}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 disabled:opacity-40"
          >
            {lang === "de" ? "Zuruck" : "Previous"}
          </button>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page >= totalPages || loading}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 disabled:opacity-40"
          >
            {lang === "de" ? "Weiter" : "Next"}
          </button>
        </div>
      </div>
      <Toast
        isOpen={toastState.open}
        type={toastState.type}
        message={toastState.message}
        onClose={() => setToastState((prev) => ({ ...prev, open: false, message: "" }))}
      />
      <ConfirmDeleteModal
        isOpen={Boolean(pendingDeleteUser)}
        title={lang === "de" ? "Nutzer löschen?" : "Delete user?"}
        description={
          pendingDeleteUser
            ? lang === "de"
              ? `Möchten Sie ${pendingDeleteUser.name} wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`
              : `Are you sure you want to delete ${pendingDeleteUser.name}? This action cannot be undone.`
            : ""
        }
        confirmLabel={lang === "de" ? "Löschen" : "Delete"}
        cancelLabel={lang === "de" ? "Abbrechen" : "Cancel"}
        onCancel={() => {
          if (deletingId) return;
          setPendingDeleteUser(null);
        }}
        onConfirm={async () => {
          if (!pendingDeleteUser) return;
          await handleDeleteUser(pendingDeleteUser.id);
          setPendingDeleteUser(null);
        }}
      />
    </div>
  );
};

export default UserManagementDashboard;
