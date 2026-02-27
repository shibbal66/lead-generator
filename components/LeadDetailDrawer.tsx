import React, { useState, useEffect, useRef, useMemo } from "react";
import { Lead, Comment, PipelineStage, LeadFile, Deal, Project, Todo } from "../types";
import { useFormik } from "formik";
import * as Yup from "yup";
import
  {
    X,
    Phone,
    Mail,
    Calendar,
    Linkedin,
    MessageSquare,
    Send,
    Save,
    Trash2,
    Edit2,
    Building,
    Trash,
    Check,
    Facebook,
    Instagram,
    Twitter,
    Music,
    Search,
    Loader2,
    Paperclip,
    File,
    Download,
    Upload,
    DollarSign,
    Briefcase,
    Award,
    FolderKanban,
    CheckCircle2,
    Circle,
    Clock,
    ChevronLeft
  } from "lucide-react";
import { FORM_MAX_LENGTH, STAGE_COLORS, STAGES } from "../constants";
import { api } from "../services/api";
import { dealApi } from "../services/dealApi";
import { translations, Language } from "../translations";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { useAppDispatch } from "../store/hooks";
import { updateTask } from "../store/actions/taskActions";
interface LeadDetailDrawerProps
{
  lead: Lead | null;
  projects: Project[];
  owners: Array<{ id: string; name: string; }>;
  onClose: () => void;
  onUpdate: (updates: Partial<Lead>) => void;
  onAddComment: (text: string) => void;
  onUpdateComment?: (commentId: string, text: string) => void;
  onDeleteComment?: (commentId: string) => void;
  onAddFile?: (file: Omit<LeadFile, "id" | "uploadedAt">) => void;
  onDeleteFile?: (fileId: string) => void;
  onDelete?: (id: string) => void | Promise<void>;
  lang: Language;
}

const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({
  lead,
  projects,
  owners,
  onClose,
  onUpdate,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onAddFile,
  onDeleteFile,
  onDelete,
  lang
}) =>
{
  if (!lead) return null;

  const dispatch = useAppDispatch();
  const t = useMemo(() => translations[lang], [lang]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [commentText, setCommentText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCommentDeleteModalOpen, setIsCommentDeleteModalOpen] = useState(false);
  const [commentToDeleteId, setCommentToDeleteId] = useState<string | null>(null);
  const [isSearchingSocial, setIsSearchingSocial] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [leadDeals, setLeadDeals] = useState<Deal[]>([]);
  const [leadTodos, setLeadTodos] = useState<Todo[]>([]);
  const [updatingTodoId, setUpdatingTodoId] = useState<string | null>(null);
  const [deletingDealId, setDeletingDealId] = useState<string | null>(null);

  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  useEffect(() =>
  {
    setLeadDeals(lead.deals || []);
    setLeadTodos(lead.linkedTodos || []);
  }, [lead.deals, lead.linkedTodos]);

  const lettersOnlyPattern = /^[\p{L}\s'-]+$/u;
  const noDigitsPattern = /^\D+$/;
  const companyNamePattern = /^[\p{L}\p{N}\s]+$/u;
  const isValidLinkedInUrl = (value?: string) =>
  {
    if (!value) return true;
    try
    {
      const url = new URL(value);
      const host = url.hostname.toLowerCase();
      return host === "linkedin.com" || host === "www.linkedin.com" || host.endsWith(".linkedin.com");
    } catch
    {
      return false;
    }
  };

  const isValidFacebookUrl = (value?: string) =>
  {
    if (!value) return true;
    try
    {
      const url = new URL(value);
      const host = url.hostname.toLowerCase();
      return host === "facebook.com" || host === "www.facebook.com" || host === "fb.com" || host === "www.fb.com" || host.endsWith(".facebook.com");
    } catch
    {
      return false;
    }
  };

  const isValidInstagramUrl = (value?: string) =>
  {
    if (!value) return true;
    try
    {
      const url = new URL(value);
      const host = url.hostname.toLowerCase();
      return host === "instagram.com" || host === "www.instagram.com" || host.endsWith(".instagram.com");
    } catch
    {
      return false;
    }
  };

  const isValidTikTokUrl = (value?: string) =>
  {
    if (!value) return true;
    try
    {
      const url = new URL(value);
      const host = url.hostname.toLowerCase();
      return host === "tiktok.com" || host === "www.tiktok.com" || host.endsWith(".tiktok.com");
    } catch
    {
      return false;
    }
  };

  const isValidTwitterUrl = (value?: string) =>
  {
    if (!value) return true;
    try
    {
      const url = new URL(value);
      const host = url.hostname.toLowerCase();
      return host === "twitter.com" || host === "www.twitter.com" || host === "x.com" || host === "www.x.com" || host.endsWith(".twitter.com") || host.endsWith(".x.com");
    } catch
    {
      return false;
    }
  };

  const validatePhone = (value: string | undefined): boolean =>
  {
    const normalized = typeof value === "string" ? value.trim() : "";
    if (!normalized) return true;
    if (!/^\+?[\d\s\-()]+$/.test(normalized)) return false;
    if (/^[\s\-()]+$/.test(normalized) || normalized === "+") return false;
    const digitsOnly = normalized.replace(/\D/g, "");
    return digitsOnly.length >= 5 && digitsOnly.length <= 15;
  };

  const validationSchema = useMemo(
    () =>
      Yup.object({
        firstName: Yup.string()
          .trim()
          .required(lang === "de" ? "Vorname ist erforderlich" : "First name is required")
          .max(FORM_MAX_LENGTH.leadFirstName, lang === "de" ? `Max. ${ FORM_MAX_LENGTH.leadFirstName } Zeichen` : `Max. ${ FORM_MAX_LENGTH.leadFirstName } characters`)
          .matches(noDigitsPattern, lang === "de" ? "Vorname darf keine Zahlen enthalten" : "First name cannot contain numbers")
          .matches(lettersOnlyPattern, lang === "de" ? "Vorname enthält ungültige Zeichen" : "First name contains invalid characters"),
        lastName: Yup.string()
          .trim()
          .required(lang === "de" ? "Nachname ist erforderlich" : "Last name is required")
          .max(FORM_MAX_LENGTH.leadLastName, lang === "de" ? `Max. ${ FORM_MAX_LENGTH.leadLastName } Zeichen` : `Max. ${ FORM_MAX_LENGTH.leadLastName } characters`)
          .matches(noDigitsPattern, lang === "de" ? "Nachname darf keine Zahlen enthalten" : "Last name cannot contain numbers")
          .matches(lettersOnlyPattern, lang === "de" ? "Nachname enthält ungültige Zeichen" : "Last name contains invalid characters"),
        currentPosition: Yup.string()
          .trim()
          .required(lang === "de" ? "Position ist erforderlich" : "Position is required")
          .max(FORM_MAX_LENGTH.leadPosition, lang === "de" ? `Max. ${ FORM_MAX_LENGTH.leadPosition } Zeichen` : `Max. ${ FORM_MAX_LENGTH.leadPosition } characters`),
        company: Yup.string()
          .trim()
          .max(FORM_MAX_LENGTH.leadCompany, lang === "de" ? `Max. ${ FORM_MAX_LENGTH.leadCompany } Zeichen` : `Max. ${ FORM_MAX_LENGTH.leadCompany } characters`),
        ownerName: Yup.string().trim().required(lang === "de" ? "Betreuer ist erforderlich" : "Owner is required"),
        email: Yup.string()
          .transform((value) => (typeof value === "string" ? value.trim() : value))
          .max(FORM_MAX_LENGTH.leadEmail, lang === "de" ? `Max. ${ FORM_MAX_LENGTH.leadEmail } Zeichen` : `Max. ${ FORM_MAX_LENGTH.leadEmail } characters`)
          .test("email-or-empty", lang === "de" ? "Ungültige E-Mail-Adresse" : "Invalid email address", (value) =>
          {
            const normalized = typeof value === "string" ? value.trim() : "";
            if (!normalized || normalized === "Not found" || normalized === "Nicht gefunden") return true;
            return Yup.string().email().isValidSync(normalized);
          }),
        phone: Yup.string()
          .transform((value) => (typeof value === "string" ? value.trim() : value))
          .max(FORM_MAX_LENGTH.leadPhone, lang === "de" ? `Max. ${ FORM_MAX_LENGTH.leadPhone } Zeichen` : `Max. ${ FORM_MAX_LENGTH.leadPhone } characters`)
          .test("phone-valid", lang === "de" ? "Ungültige Telefonnummer (5–15 Ziffern)" : "Invalid phone (5–15 digits)", (value) =>
          {
            const normalized = typeof value === "string" ? value.trim() : "";
            if (!normalized || normalized === "Not found" || normalized === "Nicht gefunden") return true;
            return validatePhone(value);
          }),
        linkedinUrl: Yup.string()
          .transform((value) => (typeof value === "string" ? value.trim() : value))
          .max(FORM_MAX_LENGTH.leadUrl, lang === "de" ? `Max. ${ FORM_MAX_LENGTH.leadUrl } Zeichen` : `Max. ${ FORM_MAX_LENGTH.leadUrl } characters`)
          .test("linkedin-domain", t.leadDetail.errorUrlLinkedIn, (value) =>
          {
            const normalized = typeof value === "string" ? value.trim() : "";
            if (!normalized) return true;
            return Yup.string().url().isValidSync(normalized) && isValidLinkedInUrl(normalized);
          }),
        facebookUrl: Yup.string()
          .transform((value) => (typeof value === "string" ? value.trim() : value))
          .max(FORM_MAX_LENGTH.leadUrl, lang === "de" ? `Max. ${ FORM_MAX_LENGTH.leadUrl } Zeichen` : `Max. ${ FORM_MAX_LENGTH.leadUrl } characters`)
          .test("facebook-domain", t.leadDetail.errorUrlFacebook, (value) =>
          {
            const normalized = typeof value === "string" ? value.trim() : "";
            if (!normalized) return true;
            return Yup.string().url().isValidSync(normalized) && isValidFacebookUrl(normalized);
          }),
        instagramUrl: Yup.string()
          .transform((value) => (typeof value === "string" ? value.trim() : value))
          .max(FORM_MAX_LENGTH.leadUrl, lang === "de" ? `Max. ${ FORM_MAX_LENGTH.leadUrl } Zeichen` : `Max. ${ FORM_MAX_LENGTH.leadUrl } characters`)
          .test("instagram-domain", t.leadDetail.errorUrlInstagram, (value) =>
          {
            const normalized = typeof value === "string" ? value.trim() : "";
            if (!normalized) return true;
            return Yup.string().url().isValidSync(normalized) && isValidInstagramUrl(normalized);
          }),
        tiktokUrl: Yup.string()
          .transform((value) => (typeof value === "string" ? value.trim() : value))
          .max(FORM_MAX_LENGTH.leadUrl, lang === "de" ? `Max. ${ FORM_MAX_LENGTH.leadUrl } Zeichen` : `Max. ${ FORM_MAX_LENGTH.leadUrl } characters`)
          .test("tiktok-domain", t.leadDetail.errorUrlTikTok, (value) =>
          {
            const normalized = typeof value === "string" ? value.trim() : "";
            if (!normalized) return true;
            return Yup.string().url().isValidSync(normalized) && isValidTikTokUrl(normalized);
          }),
        twitterUrl: Yup.string()
          .transform((value) => (typeof value === "string" ? value.trim() : value))
          .max(FORM_MAX_LENGTH.leadUrl, lang === "de" ? `Max. ${ FORM_MAX_LENGTH.leadUrl } Zeichen` : `Max. ${ FORM_MAX_LENGTH.leadUrl } characters`)
          .test("twitter-domain", t.leadDetail.errorUrlTwitter, (value) =>
          {
            const normalized = typeof value === "string" ? value.trim() : "";
            if (!normalized) return true;
            return Yup.string().url().isValidSync(normalized) && isValidTwitterUrl(normalized);
          })
      }),
    [companyNamePattern, lang, lettersOnlyPattern, noDigitsPattern, t]
  );

  const notFoundPlaceholders = useMemo(
    () => new Set(["Not found", "Nicht gefunden", "Not specified", "Keine Angabe"]),
    []
  );
  const emptyIfNotFound = (value?: string) =>
  {
    if (!value) return "";
    const t = value.trim();
    return notFoundPlaceholders.has(t) ? "" : t;
  };

  const formik = useFormik<Lead>({
    enableReinitialize: true,
    initialValues: {
      ...lead,
      company: emptyIfNotFound(lead.company),
      phone: emptyIfNotFound(lead.phone),
      email: emptyIfNotFound(lead.email),
      birthday: lead.birthday ? String(lead.birthday).slice(0, 10) : "",
      linkedinUrl: lead.linkedinUrl || "",
      facebookUrl: lead.facebookUrl || "",
      instagramUrl: lead.instagramUrl || "",
      tiktokUrl: lead.tiktokUrl || "",
      twitterUrl: lead.twitterUrl || ""
    },
    validationSchema,
    onSubmit: async (values) =>
    {
      await onUpdate(values);
      setIsEditing(false);
    }
  });

  const currentProject = useMemo(() =>
  {
    return projects.find((p) => p.id === lead.projectId);
  }, [projects, lead.projectId]);
  const leadProjectTitles = useMemo(() =>
  {
    const titles = (lead.availableProjects || [])
      .map((project) => project.title?.trim())
      .filter((title): title is string => !!title);
    return Array.from(new Set(titles));
  }, [lead.availableProjects]);
  const projectDisplayItems = useMemo(() =>
  {
    if (leadProjectTitles.length > 0) return leadProjectTitles;
    if (currentProject?.title) return [currentProject.title];
    return [];
  }, [currentProject?.title, leadProjectTitles]);

  const totalDealSumByCurrency = useMemo(() =>
  {
    const sums: Record<string, number> = {};
    leadDeals.forEach((d) =>
    {
      const curr = d.currency || "EUR";
      sums[curr] = (sums[curr] || 0) + d.totalAmount;
    });
    return sums;
  }, [leadDeals]);

  const handleSave = () =>
  {
    formik.handleSubmit();
  };

  const handleDelete = () =>
  {
    if (!lead || !onDelete) return;
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () =>
  {
    if (!lead || !onDelete) return;
    await onDelete(lead.id);
    setIsDeleteModalOpen(false);
    onClose();
  };

  const handleConfirmDeleteComment = () =>
  {
    if (!commentToDeleteId) return;
    onDeleteComment?.(commentToDeleteId);
    setCommentToDeleteId(null);
    setIsCommentDeleteModalOpen(false);
  };

  const handleToggleTodo = async (id: string) =>
  {
    const targetTodo = leadTodos.find((todo) => todo.id === id);
    if (!targetTodo) return;
    const nextCompleted = !targetTodo.isCompleted;

    setLeadTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, isCompleted: nextCompleted } : todo)));
    setUpdatingTodoId(id);

    try
    {
      const result = await dispatch(
        updateTask({
          taskId: id,
          data: { completed: nextCompleted }
        })
      );

      if (!updateTask.fulfilled.match(result))
      {
        console.error("[LeadDetailDrawer] update task rejected", result);
        setLeadTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, isCompleted: targetTodo.isCompleted } : todo)));
        return;
      }
      // Task completed notifications are shown only when received from Firebase (no local push).
    } catch (error)
    {
      console.error("[LeadDetailDrawer] update task failed", error);
      setLeadTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, isCompleted: targetTodo.isCompleted } : todo)));
    } finally
    {
      setUpdatingTodoId(null);
    }
  };

  const handleSocialSearch = async () =>
  {
    setIsSearchingSocial(true);
    try
    {
      const results = await api.searchSocialMedia(lead.firstName, lead.lastName);
      const updates = {
        ...formik.values,
        ...results
      };
      formik.setValues(updates as Lead);
    } finally
    {
      setIsSearchingSocial(false);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) =>
  {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(commentText);
    setCommentText("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) =>
  {
    const file = e.target.files?.[0];
    if (!file || !onAddFile) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) =>
    {
      const data = event.target?.result as string;
      await onAddFile({
        name: file.name,
        size: file.size,
        mimeType: file.type,
        data
      });
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteDeal = async (dealId: string) =>
  {
    const confirmed = window.confirm(
      lang === "de"
        ? "Möchten Sie diesen Abschluss wirklich löschen?"
        : "Are you sure you want to delete this deal?"
    );
    if (!confirmed) return;

    setDeletingDealId(dealId);
    try
    {
      await dealApi.deleteDeal(dealId);
      setLeadDeals((prev) => prev.filter((deal) => deal.id !== dealId));
    } catch (error)
    {
      console.error("[LeadDetailDrawer] delete deal failed", error);
    } finally
    {
      setDeletingDealId(null);
    }
  };

  const downloadFile = (file: LeadFile) =>
  {
    const link = document.createElement("a");
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) =>
  {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const locale = lang === "de" ? "de-DE" : "en-US";
  const notFoundText = lang === "de" ? "Nicht gefunden" : "Not found";
  const formatDateOrFallback = (value?: string) =>
  {
    if (!value) return notFoundText;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return notFoundText;
    return parsed.toLocaleDateString(locale);
  };
  const formatDateTimeOrFallback = (value?: string) =>
  {
    if (!value) return notFoundText;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return notFoundText;
    return parsed.toLocaleString(locale);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-black/20 pointer-events-auto transition-opacity" onClick={ onClose } />
      <div className="absolute inset-y-0 right-0 max-w-xl w-full bg-white shadow-2xl pointer-events-auto transform transition-transform duration-300">
        <div className="h-full flex flex-col">
          <div className="p-6 border-b flex justify-between items-center bg-gray-50 gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-gray-900 line-clamp-2 break-words">
                { lead.firstName } { lead.lastName }
              </h2>
              <div className="flex flex-col gap-1 mt-1">
                <div className="flex flex-wrap gap-2">
                  { Object.entries(totalDealSumByCurrency).map(([curr, sum]) => (
                    <div
                      key={ curr }
                      className="flex items-center bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold"
                    >
                      <DollarSign size={ 10 } className="mr-1" />
                      { t.deal.totalSum }: { Number(sum).toLocaleString(locale) } { curr === "USD" ? "$" : "€" }
                    </div>
                  )) }
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              { isEditing ? (
                <button
                  type="button"
                  onClick={ () => setIsEditing(false) }
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors"
                  title={ t.common.cancel }
                >
                  <ChevronLeft size={ 20 } />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={ () => setIsEditing(true) }
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-white rounded-lg transition-colors"
                  title={ t.common.edit }
                >
                  <Edit2 size={ 20 } />
                </button>
              ) }
              { onDelete && (
                <button
                  type="button"
                  onClick={ handleDelete }
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title={ t.common.delete }
                >
                  <Trash2 size={ 20 } />
                </button>
              ) }
              <button
                type="button"
                onClick={ onClose }
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors"
                title={ t.common.cancel }
              >
                <X size={ 20 } />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-8">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                { t.leadDetail.currentStatus }
              </label>
              <div className="flex items-center space-x-3">
                <select
                  value={ formik.values.pipelineStage }
                  onChange={ (e) => formik.setFieldValue("pipelineStage", e.target.value as PipelineStage) }
                  disabled={ !isEditing }
                  className={ `px-3 py-1.5 rounded-full text-xs font-bold border-none cursor-pointer focus:ring-2 focus:ring-blue-500 disabled:cursor-default ${ STAGE_COLORS[formik.values.pipelineStage] }` }
                >
                  { STAGES.map((s) => (
                    <option key={ s } value={ s }>
                      { s === PipelineStage.IDENTIFIED
                        ? t.pipeline.stages.IDENTIFIED
                        : s === PipelineStage.CONTACTED
                          ? t.pipeline.stages.CONTACTED
                          : s === PipelineStage.QUALIFIED
                            ? t.pipeline.stages.QUALIFIED
                            : s === PipelineStage.NEGOTIATION
                              ? t.pipeline.stages.NEGOTIATION
                              : s === PipelineStage.CLOSED
                                ? t.pipeline.stages.CLOSED
                                : s }
                    </option>
                  )) }
                </select>
                <span className="text-xs text-gray-400 italic">
                  { t.leadDetail.createdAt }: { formatDateTimeOrFallback(lead.createdAt) }
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                    { t.leadModal.firstName }
                  </label>
                  { isEditing ? (
                    <input
                      name="firstName"
                      maxLength={ FORM_MAX_LENGTH.leadFirstName }
                      className="w-full text-sm font-medium border-gray-200 rounded-lg p-2"
                      value={ formik.values.firstName }
                      onChange={ formik.handleChange }
                      onBlur={ formik.handleBlur }
                    />
                  ) : (
                    <p className="text-gray-900 font-medium line-clamp-2 break-words">{ lead.firstName }</p>
                  ) }
                  { isEditing && formik.touched.firstName && formik.errors.firstName && (
                    <p className="text-[10px] text-red-500 mt-1 line-clamp-2 break-words">{ formik.errors.firstName }</p>
                  ) }
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                    { t.leadModal.position }
                  </label>
                  { isEditing ? (
                    <input
                      name="currentPosition"
                      maxLength={ FORM_MAX_LENGTH.leadPosition }
                      className="w-full text-sm font-medium border-gray-200 rounded-lg p-2"
                      value={ formik.values.currentPosition }
                      onChange={ formik.handleChange }
                      onBlur={ formik.handleBlur }
                    />
                  ) : (
                    <p className="text-gray-900 font-medium line-clamp-2 break-words">{ lead.currentPosition }</p>
                  ) }
                  { isEditing && formik.touched.currentPosition && formik.errors.currentPosition && (
                    <p className="text-[10px] text-red-500 mt-1 line-clamp-2 break-words">{ formik.errors.currentPosition }</p>
                  ) }
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                    { t.leadModal.company }
                  </label>
                  { isEditing ? (
                    <input
                      name="company"
                      maxLength={ FORM_MAX_LENGTH.leadCompany }
                      className="w-full text-sm font-medium border-gray-200 rounded-lg p-2"
                      value={ formik.values.company || "" }
                      onChange={ formik.handleChange }
                      onBlur={ formik.handleBlur }
                    />
                  ) : (
                    <p className="text-gray-900 font-medium line-clamp-2 break-words">
                      <Building size={ 14 } className="inline mr-2 shrink-0" />
                      { emptyIfNotFound(lead.company) || t.leadDetail.notSpecified }
                    </p>
                  ) }
                  { isEditing && formik.touched.company && formik.errors.company && (
                    <p className="text-[10px] text-red-500 mt-1 line-clamp-2 break-words">{ formik.errors.company }</p>
                  ) }
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                    { t.leadModal.lastName }
                  </label>
                  { isEditing ? (
                    <input
                      name="lastName"
                      maxLength={ FORM_MAX_LENGTH.leadLastName }
                      className="w-full text-sm font-medium border-gray-200 rounded-lg p-2"
                      value={ formik.values.lastName }
                      onChange={ formik.handleChange }
                      onBlur={ formik.handleBlur }
                    />
                  ) : (
                    <p className="text-gray-900 font-medium line-clamp-2 break-words">{ lead.lastName }</p>
                  ) }
                  { isEditing && formik.touched.lastName && formik.errors.lastName && (
                    <p className="text-[10px] text-red-500 mt-1 line-clamp-2 break-words">{ formik.errors.lastName }</p>
                  ) }
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                    { t.leadModal.owner }
                  </label>
                  { isEditing ? (
                    <select
                      name="ownerName"
                      className="w-full text-sm font-medium border-gray-200 rounded-lg p-2 bg-white"
                      value={ formik.values.ownerName }
                      onChange={ formik.handleChange }
                      onBlur={ formik.handleBlur }
                    >
                      <option value="" disabled>
                        { t.leadModal.selectOwner }
                      </option>
                      { owners.map((owner) => (
                        <option key={ owner.id } value={ owner.name }>
                          { owner.name }
                        </option>
                      )) }
                    </select>
                  ) : (
                    <p className="text-gray-900 font-medium line-clamp-2 break-words">{ lead.ownerName }</p>
                  ) }
                  { isEditing && formik.touched.ownerName && formik.errors.ownerName && (
                    <p className="text-[10px] text-red-500 mt-1 line-clamp-2 break-words">{ formik.errors.ownerName }</p>
                  ) }
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                    { t.header.projects }
                  </label>
                  <div className="text-gray-900 font-medium flex items-start">
                    { projectDisplayItems.length > 0 ? (
                      <div className="text-[13px] leading-5 space-y-1 min-w-0 overflow-hidden">
                        { projectDisplayItems.map((projectTitle) => (
                          <div key={ projectTitle } className="flex items-center text-gray-700 min-w-0">
                            <FolderKanban size={ 13 } className="mr-2 text-blue-500 shrink-0" />
                            <span className="truncate">{ projectTitle }</span>
                          </div>
                        )) }
                      </div>
                    ) : (
                      <span className="text-[13px] text-gray-500 flex items-center">
                        <FolderKanban size={ 13 } className="mr-2 text-blue-500 shrink-0" />
                        { t.leadDetail.noProjectAssigned }
                      </span>
                    ) }
                  </div>
                </div>
              </div>
            </div>

            {/* To-Dos Section - NEW */ }
            <div className="mb-8 p-5 bg-indigo-50 rounded-xl border border-indigo-100">
              <h3 className="text-sm font-bold text-indigo-800 mb-4 flex items-center">
                <CheckCircle2 size={ 16 } className="mr-2" /> { t.common.linkedTodos } ({ leadTodos.length })
              </h3>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                { leadTodos.length > 0 ? (
                  leadTodos.map((todo) => (
                    <div
                      key={ todo.id }
                      onClick={ () => handleToggleTodo(todo.id) }
                      className={ `flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border cursor-pointer transition-all hover:border-indigo-200 ${ todo.isCompleted ? "opacity-60" : "" } ${ updatingTodoId === todo.id ? "pointer-events-none" : "" }` }
                    >
                      { updatingTodoId === todo.id ? (
                        <Loader2 size={ 18 } className="text-indigo-500 animate-spin" />
                      ) : todo.isCompleted ? (
                        <CheckCircle2 size={ 18 } className="text-emerald-500" />
                      ) : (
                        <Circle size={ 18 } className="text-gray-300" />
                      ) }
                      <div className="flex-1 min-w-0">
                        <p
                          className={ `text-xs font-bold ${ todo.isCompleted ? "text-gray-400 line-through" : "text-gray-800" }` }
                        >
                          { todo.text }
                        </p>
                        { todo.deadline && (
                          <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
                            <Clock size={ 10 } />
                            <span>{ new Date(todo.deadline).toLocaleDateString(locale) }</span>
                          </div>
                        ) }
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic text-center py-2">{ t.leadDetail.noLinkedTasks }</p>
                ) }
              </div>
            </div>

            <div className="mb-8 p-5 bg-emerald-50 rounded-xl border border-emerald-100">
              <h3 className="text-sm font-bold text-emerald-800 mb-4 flex items-center">
                <Award size={ 16 } className="mr-2" /> { t.deal.overview } ({ leadDeals.length })
              </h3>
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                { leadDeals.length > 0 ? (
                  leadDeals.map((deal) => (
                    <div
                      key={ deal.id }
                      className="bg-white p-3 rounded-lg shadow-sm border border-emerald-100 flex items-start justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{ deal.name }</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                            { deal.type }
                          </span>
                          <span className="text-[10px] text-gray-400 flex items-center">
                            <Calendar size={ 10 } className="mr-1" />
                            { new Date(deal.startDate).toLocaleDateString(locale) } -{ " " }
                            { new Date(deal.endDate).toLocaleDateString(locale) }
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="text-right">
                          <p className="text-sm font-extrabold text-emerald-600">
                            { deal.totalAmount.toLocaleString(locale) } { deal.currency === "USD" ? "$" : "€" }
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={ () => handleDeleteDeal(deal.id) }
                          disabled={ deletingDealId === deal.id }
                          className="p-1.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title={ t.common.delete }
                        >
                          { deletingDealId === deal.id ? (
                            <Loader2 size={ 14 } className="animate-spin" />
                          ) : (
                            <Trash size={ 14 } />
                          ) }
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic text-center py-2">{ t.deal.noDeals }</p>
                ) }
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-gray-700 flex items-center">
                  <Calendar size={ 16 } className="mr-2" /> { t.leadDetail.moreInfo }
                </h3>
                <button
                  onClick={ handleSocialSearch }
                  disabled={ isSearchingSocial }
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center bg-white px-2 py-1 rounded border border-blue-100 shadow-sm disabled:opacity-50"
                >
                  { isSearchingSocial ? (
                    <Loader2 size={ 12 } className="animate-spin mr-1" />
                  ) : (
                    <Search size={ 12 } className="mr-1" />
                  ) }
                  { t.leadDetail.socialMediaSearch }
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center text-sm">
                  <Calendar size={ 16 } className="text-gray-400 mr-3 w-5" />
                  <span className="text-gray-400 w-24">{ t.leadModal.birthday }:</span>
                  { isEditing ? (
                    <input
                      type="date"
                      name="birthday"
                      className="flex-1 text-sm p-1"
                      value={ formik.values.birthday ? String(formik.values.birthday).slice(0, 10) : "" }
                      onChange={ formik.handleChange }
                    />
                  ) : (
                    <span className="text-gray-900 font-medium line-clamp-2 break-words">
                      { formatDateOrFallback(lead.birthday) }
                    </span>
                  ) }
                </div>
                <div className="flex items-center text-sm">
                  <Mail size={ 16 } className="text-gray-400 mr-3 w-5" />
                  <span className="text-gray-400 w-24">{ t.leadModal.email }:</span>
                  { isEditing ? (
                    <input
                      type="email"
                      name="email"
                      maxLength={ FORM_MAX_LENGTH.leadEmail }
                      className="flex-1 text-sm p-1"
                      value={ formik.values.email || "" }
                      onChange={ formik.handleChange }
                      onBlur={ formik.handleBlur }
                    />
                  ) : (
                    <span className="text-gray-900 font-medium line-clamp-2 break-words">{ emptyIfNotFound(lead.email) || t.leadDetail.notSpecified }</span>
                  ) }
                  { isEditing && formik.touched.email && formik.errors.email && (
                    <p className="text-[10px] text-red-500 ml-2 line-clamp-2 break-words">{ formik.errors.email }</p>
                  ) }
                </div>

                <div className="pt-2 border-t border-gray-100 mt-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">
                    { t.leadDetail.socialMediaProfile }
                  </label>
                  { isEditing ? (
                    <div className="space-y-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Linkedin size={ 18 } className="text-blue-700" />
                          <input
                            name="linkedinUrl"
                            maxLength={ FORM_MAX_LENGTH.leadUrl }
                            className="flex-1 text-xs border rounded p-1"
                            value={ formik.values.linkedinUrl || "" }
                            placeholder="LinkedIn URL"
                            onChange={ formik.handleChange }
                            onBlur={ formik.handleBlur }
                          />
                        </div>
                        { formik.touched.linkedinUrl && formik.errors.linkedinUrl && (
                          <p className="text-[10px] text-red-500 mt-1 ml-6 line-clamp-2 break-words">{ formik.errors.linkedinUrl }</p>
                        ) }
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Facebook size={ 18 } className="text-blue-600" />
                          <input
                            name="facebookUrl"
                            maxLength={ FORM_MAX_LENGTH.leadUrl }
                            className="flex-1 text-xs border rounded p-1"
                            value={ formik.values.facebookUrl || "" }
                            placeholder="Facebook URL"
                            onChange={ formik.handleChange }
                            onBlur={ formik.handleBlur }
                          />
                        </div>
                        { formik.touched.facebookUrl && formik.errors.facebookUrl && (
                          <p className="text-[10px] text-red-500 mt-1 ml-6 line-clamp-2 break-words">{ formik.errors.facebookUrl }</p>
                        ) }
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Instagram size={ 18 } className="text-pink-600" />
                          <input
                            name="instagramUrl"
                            maxLength={ FORM_MAX_LENGTH.leadUrl }
                            className="flex-1 text-xs border rounded p-1"
                            value={ formik.values.instagramUrl || "" }
                            placeholder="Instagram URL"
                            onChange={ formik.handleChange }
                            onBlur={ formik.handleBlur }
                          />
                        </div>
                        { formik.touched.instagramUrl && formik.errors.instagramUrl && (
                          <p className="text-[10px] text-red-500 mt-1 ml-6 line-clamp-2 break-words">{ formik.errors.instagramUrl }</p>
                        ) }
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Music size={ 18 } className="text-black" />
                          <input
                            name="tiktokUrl"
                            maxLength={ FORM_MAX_LENGTH.leadUrl }
                            className="flex-1 text-xs border rounded p-1"
                            value={ formik.values.tiktokUrl || "" }
                            placeholder="TikTok URL"
                            onChange={ formik.handleChange }
                            onBlur={ formik.handleBlur }
                          />
                        </div>
                        { formik.touched.tiktokUrl && formik.errors.tiktokUrl && (
                          <p className="text-[10px] text-red-500 mt-1 ml-6 line-clamp-2 break-words">{ formik.errors.tiktokUrl }</p>
                        ) }
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Twitter size={ 18 } className="text-blue-400" />
                          <input
                            name="twitterUrl"
                            maxLength={ FORM_MAX_LENGTH.leadUrl }
                            className="flex-1 text-xs border rounded p-1"
                            value={ formik.values.twitterUrl || "" }
                            placeholder="X URL"
                            onChange={ formik.handleChange }
                            onBlur={ formik.handleBlur }
                          />
                        </div>
                        { formik.touched.twitterUrl && formik.errors.twitterUrl && (
                          <p className="text-[10px] text-red-500 mt-1 ml-6 line-clamp-2 break-words">{ formik.errors.twitterUrl }</p>
                        ) }
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center space-x-2">
                        <Linkedin size={ 18 } className={ lead.linkedinUrl ? "text-blue-700" : "text-gray-300" } />
                        { lead.linkedinUrl && (
                          <a href={ lead.linkedinUrl } target="_blank" className="text-xs text-blue-600 hover:underline">
                            { t.leadDetail.profileLink }
                          </a>
                        ) }
                      </div>
                      <div className="flex items-center space-x-2">
                        <Facebook size={ 18 } className={ lead.facebookUrl ? "text-blue-600" : "text-gray-300" } />
                        { lead.facebookUrl && (
                          <a href={ lead.facebookUrl } target="_blank" className="text-xs text-blue-600 hover:underline">
                            { t.leadDetail.profileLink }
                          </a>
                        ) }
                      </div>
                      <div className="flex items-center space-x-2">
                        <Instagram size={ 18 } className={ lead.instagramUrl ? "text-pink-600" : "text-gray-300" } />
                        { lead.instagramUrl && (
                          <a href={ lead.instagramUrl } target="_blank" className="text-xs text-blue-600 hover:underline">
                            { t.leadDetail.profileLink }
                          </a>
                        ) }
                      </div>
                      <div className="flex items-center space-x-2">
                        <Music size={ 18 } className={ lead.tiktokUrl ? "text-black" : "text-gray-300" } />
                        { lead.tiktokUrl && (
                          <a href={ lead.tiktokUrl } target="_blank" className="text-xs text-blue-600 hover:underline">
                            { t.leadDetail.profileLink }
                          </a>
                        ) }
                      </div>
                      <div className="flex items-center space-x-2">
                        <Twitter size={ 18 } className={ lead.twitterUrl ? "text-blue-400" : "text-gray-300" } />
                        { lead.twitterUrl && (
                          <a href={ lead.twitterUrl } target="_blank" className="text-xs text-blue-600 hover:underline">
                            { t.leadDetail.profileLink }
                          </a>
                        ) }
                      </div>
                    </div>
                  ) }
                </div>
              </div>
            </div>

            {/* Comments Section */ }
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center">
                <MessageSquare size={ 16 } className="mr-2" /> { t.common.comments } ({ lead.comments.length })
              </h3>
              <form onSubmit={ handleCommentSubmit } className="mb-6">
                <div className="relative">
                  <textarea
                    value={ commentText }
                    maxLength={ FORM_MAX_LENGTH.comment }
                    onChange={ (e) => setCommentText(e.target.value) }
                    placeholder={ t.leadDetail.addCommentPlaceholder }
                    className="w-full border border-gray-200 rounded-xl p-3 pr-12 text-sm outline-none focus:border-gray-400 focus:ring-0 resize-none h-20"
                  />
                  <button
                    type="submit"
                    className="absolute bottom-3 right-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Send size={ 16 } />
                  </button>
                </div>
              </form>
              <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                { [...lead.comments].reverse().map((comment) => (
                  <div
                    key={ comment.id }
                    className="group bg-white border border-gray-100 rounded-lg p-3 shadow-sm relative"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-700">{ comment.author }</span>
                        <span className="text-[10px] text-gray-400">
                          { new Date(comment.createdAt).toLocaleString(locale) }
                        </span>
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={ () =>
                          {
                            setEditingCommentId(comment.id);
                            setEditingCommentText(comment.text);
                          } }
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <Edit2 size={ 12 } />
                        </button>
                        <button
                          type="button"
                          onClick={ () =>
                          {
                            setCommentToDeleteId(comment.id);
                            setIsCommentDeleteModalOpen(true);
                          } }
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <Trash size={ 12 } />
                        </button>
                      </div>
                    </div>
                    {/* Fixed: removed Scalar call and used direct comparison */ }
                    { editingCommentId === comment.id ? (
                      <div className="mt-2">
                        <textarea
                          className="w-full text-sm p-2 border rounded"
                          maxLength={ FORM_MAX_LENGTH.comment }
                          value={ editingCommentText }
                          onChange={ (e) => setEditingCommentText(e.target.value) }
                        />
                        <div className="flex justify-end space-x-2 mt-2">
                          <button type="button" onClick={ () => setEditingCommentId(null) } className="text-xs text-gray-400">
                            { t.common.cancel }
                          </button>
                          <button
                            type="button"
                            onClick={ () =>
                            {
                              onUpdateComment?.(comment.id, editingCommentText);
                              setEditingCommentId(null);
                            } }
                            className="text-xs font-bold text-blue-600"
                          >
                            { t.common.save }
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{ comment.text }</p>
                    ) }
                  </div>
                )) }
              </div>
            </div>

            {/* Files Section */ }
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-gray-700 flex items-center">
                  <Paperclip size={ 16 } className="mr-2" /> { t.common.files } ({ (lead.files || []).length })
                </h3>
                <input type="file" ref={ fileInputRef } onChange={ handleFileUpload } className="hidden" />
                <button
                  onClick={ () => fileInputRef.current?.click() }
                  disabled={ isUploading }
                  className="flex items-center text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  { isUploading ? (
                    <Loader2 size={ 14 } className="animate-spin mr-2" />
                  ) : (
                    <Upload size={ 14 } className="mr-2" />
                  ) }
                  { t.leadDetail.uploadFile }
                </button>
              </div>

              <div className="space-y-2">
                { (lead.files || []).map((file) => (
                  <div
                    key={ file.id }
                    className="group flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:border-blue-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="p-2 bg-gray-50 text-gray-400 rounded group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                        <File size={ 20 } />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium text-gray-900 truncate" title={ file.name }>
                          { file.name }
                        </p>
                        <p className="text-[10px] text-gray-400">
                          { formatFileSize(file.size) } • { new Date(file.uploadedAt).toLocaleDateString(locale) }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={ () => downloadFile(file) }
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors"
                        title={ t.leadDetail.download }
                      >
                        <Download size={ 16 } />
                      </button>
                      <button
                        onClick={ () =>
                        {
                          if (window.confirm(t.leadDetail.deleteFileConfirm)) onDeleteFile?.(file.id);
                        } }
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors"
                        title={ t.common.delete }
                      >
                        <Trash size={ 16 } />
                      </button>
                    </div>
                  </div>
                )) }
                { (!lead.files || lead.files.length === 0) && !isUploading && (
                  <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-xl">
                    <p className="text-gray-400 text-sm italic">{ t.leadDetail.noFilesUploaded }</p>
                  </div>
                ) }
              </div>
            </div>
          </div>

          <div className="p-4 border-t flex justify-end bg-gray-50/50">
            { isEditing ? (
              <button
                type="button"
                onClick={ handleSave }
                className="flex items-center text-sm text-white bg-blue-600 hover:bg-blue-700 font-semibold px-5 py-2.5 rounded-lg transition-colors"
              >
                <Save size={ 16 } className="mr-2" /> { t.common.save }
              </button>
            ) : null }
          </div>
        </div>
      </div>
      <ConfirmDeleteModal
        isOpen={ isDeleteModalOpen }
        title={ lang === "de" ? "Lead löschen" : "Delete lead" }
        description={
          lang === "de"
            ? "Möchten Sie diesen Lead wirklich löschen? Dieser Vorgang kann nicht rückgängig gemacht werden."
            : "Are you sure you want to delete this lead? This action cannot be undone."
        }
        confirmLabel={ t.common.delete }
        cancelLabel={ t.common.cancel }
        onConfirm={ handleConfirmDelete }
        onCancel={ () => setIsDeleteModalOpen(false) }
      />
      <ConfirmDeleteModal
        isOpen={ isCommentDeleteModalOpen }
        title={ lang === "de" ? "Kommentar löschen" : "Delete comment" }
        description={
          lang === "de"
            ? "Möchten Sie diesen Kommentar wirklich löschen?"
            : "Are you sure you want to delete this comment?"
        }
        confirmLabel={ t.common.delete }
        cancelLabel={ t.common.cancel }
        onConfirm={ handleConfirmDeleteComment }
        onCancel={ () =>
        {
          setCommentToDeleteId(null);
          setIsCommentDeleteModalOpen(false);
        } }
      />
    </div>
  );
};

export default LeadDetailDrawer;
