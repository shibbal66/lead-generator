import React, { useEffect, useMemo, useRef, useState } from "react";
import { useFormik } from "formik";
import { X, Save, FolderPlus, Search, Check, User } from "lucide-react";
import * as Yup from "yup";
import { Lead } from "../types";
import { CreateProjectPayload, ProjectRecord } from "../store/slices/projectSlice";
import { FORM_MAX_LENGTH } from "../constants";
import { translations, Language } from "../translations";

export type UpdateProjectData = { title: string; description?: string | null; projectManagerId: string };
export type UpdateProjectLeadDiff = { leadIdsToAdd: string[]; leadIdsToRemove: string[] };

interface ProjectModalProps {
  leads: Lead[];
  owners: Array<{ id: string; name: string; role?: string }>;
  onClose: () => void;
  onSave: (project: CreateProjectPayload) => void;
  editingProject?: ProjectRecord | null;
  initialSelectedLeadIds?: string[] | null;
  onUpdate?: (projectId: string, data: UpdateProjectData, leadDiff?: UpdateProjectLeadDiff) => void;
  lang?: Language;
}

const ProjectModal: React.FC<ProjectModalProps> = ({
  leads,
  owners,
  onClose,
  onSave,
  editingProject = null,
  initialSelectedLeadIds = null,
  onUpdate,
  lang = "de"
}) => {
  const t = useMemo(() => translations[lang], [lang]);
  const isEdit = Boolean(editingProject?.id);

  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [leadSearch, setLeadSearch] = useState("");
  const initialSelectedLeadIdsRef = useRef<string[]>([]);

  useEffect(() => {
    if (editingProject) {
      const ids =
        Array.isArray(initialSelectedLeadIds)
          ? initialSelectedLeadIds
          : Array.isArray(editingProject.leadIds)
          ? editingProject.leadIds
          : leads.filter((l) => l.projectId === editingProject.id).map((l) => l.id);
      setSelectedLeadIds(ids);
      initialSelectedLeadIdsRef.current = ids;
    } else {
      setSelectedLeadIds([]);
      initialSelectedLeadIdsRef.current = [];
    }
  }, [editingProject, initialSelectedLeadIds, leads]);

  const validationSchema = useMemo(
    () =>
      Yup.object({
        title: Yup.string()
          .trim()
          .required(lang === "de" ? "Projekttitel ist erforderlich" : "Project title is required")
          .max(FORM_MAX_LENGTH.projectTitle, lang === "de" ? `Max. ${FORM_MAX_LENGTH.projectTitle} Zeichen` : `Max. ${FORM_MAX_LENGTH.projectTitle} characters`),
        projectManagerId: Yup.string()
          .trim()
          .required(lang === "de" ? "Projektmanager ist erforderlich" : "Project manager is required"),
        description: Yup.string()
          .trim()
          .max(FORM_MAX_LENGTH.projectDescription, lang === "de" ? `Max. ${FORM_MAX_LENGTH.projectDescription} Zeichen` : `Max. ${FORM_MAX_LENGTH.projectDescription} characters`)
      }),
    [lang]
  );

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: editingProject?.title ?? "",
      description: editingProject?.description ?? "",
      projectManagerId: editingProject?.projectManagerId ?? owners[0]?.id ?? ""
    },
    validationSchema,
    onSubmit: (values) => {
      if (isEdit && editingProject && onUpdate) {
        const initial = initialSelectedLeadIdsRef.current;
        const leadIdsToAdd = selectedLeadIds.filter((id) => !initial.includes(id));
        const leadIdsToRemove = initial.filter((id) => !selectedLeadIds.includes(id));
        onUpdate(
          editingProject.id,
          {
            title: values.title.trim(),
            description: values.description?.trim() ? values.description.trim() : null,
            projectManagerId: values.projectManagerId
          },
          { leadIdsToAdd, leadIdsToRemove }
        );
      } else {
        onSave({
          title: values.title.trim(),
          description: values.description?.trim() || undefined,
          projectManagerId: values.projectManagerId,
          leadIds: selectedLeadIds
        });
      }
    }
  });

  const handleToggleLead = (id: string) => {
    setSelectedLeadIds((prev) => (prev.includes(id) ? prev.filter((lid) => lid !== id) : [...prev, id]));
  };

  const filteredLeads = leads.filter((l) =>
    `${l.firstName} ${l.lastName} ${l.company || ""}`.toLowerCase().includes(leadSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <div className="flex items-center space-x-2">
            <FolderPlus className="text-blue-600" size={20} />
            <h2 className="text-lg font-bold text-gray-900">{t.header.projects}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={formik.handleSubmit} className="p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">
                {lang === "de" ? "Projekttitel *" : "Project Title *"}
              </label>
              <input
                required
                autoFocus
                type="text"
                name="title"
                maxLength={FORM_MAX_LENGTH.projectTitle}
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder={t.myProjects.placeholder}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
              {formik.touched.title && formik.errors.title && (
                <p className="mt-1 text-xs text-red-500">{formik.errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">
                {t.myProjects.managerLabel} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User size={16} />
                </div>
                <select
                  required
                  name="projectManagerId"
                  value={formik.values.projectManagerId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm appearance-none"
                >
                  <option value="" disabled>
                    {lang === "de" ? "Teammitglied wählen" : "Select team member"}
                  </option>
                  {owners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name} {owner.role ? `(${owner.role})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              {formik.touched.projectManagerId && formik.errors.projectManagerId && (
                <p className="mt-1 text-xs text-red-500">{formik.errors.projectManagerId}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">
                {lang === "de" ? "Kurzbeschreibung" : "Short Description"}
              </label>
              <textarea
                name="description"
                maxLength={FORM_MAX_LENGTH.projectDescription}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder={t.myProjects.descPlaceholder}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm min-h-[80px] resize-none"
              />
              {formik.touched.description && formik.errors.description && (
                <p className="mt-1 text-xs text-red-500">{formik.errors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">
                {t.myProjects.assignLeads} ({selectedLeadIds.length})
              </label>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  value={leadSearch}
                  onChange={(e) => setLeadSearch(e.target.value)}
                  placeholder={t.myProjects.searchLeads}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg text-xs focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="border border-gray-100 rounded-xl max-h-48 overflow-y-auto divide-y divide-gray-50 custom-scrollbar">
                {filteredLeads.length === 0 ? (
                  <p className="p-4 text-xs text-gray-400 text-center italic">
                    {lang === "de" ? "Keine Leads gefunden." : "No leads found."}
                  </p>
                ) : (
                  filteredLeads.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => handleToggleLead(lead.id)}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                          {lead.firstName[0]}
                          {lead.lastName[0]}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-gray-900 truncate">
                            {lead.firstName} {lead.lastName}
                          </p>
                          <p className="text-[10px] text-gray-500 truncate">{lead.company || lead.currentPosition}</p>
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          selectedLeadIds.includes(lead.id) ? "bg-blue-600 border-blue-600" : "border-gray-200"
                        }`}
                      >
                        {selectedLeadIds.includes(lead.id) && <Check size={12} className="text-white" />}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-8 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center justify-center"
          >
            <Save size={18} className="mr-2" />
            {isEdit ? t.myProjects.updateBtn : t.myProjects.saveBtn}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
