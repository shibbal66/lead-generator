import React, { useEffect, useMemo } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { X, CheckCircle, DollarSign, Calendar, Type, FileText, ChevronRight, FolderKanban, User } from "lucide-react";
import { Lead, Deal, Project } from "../types";
import { translations, Language } from "../translations";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { getProjects } from "../store/actions/projectActions";

export type DealModalSubmitPayload = Omit<Deal, "id" | "createdAt" | "type"> & {
  dealType: "CONSULTING" | "ONLINE_TRADING" | "OFF_SITE";
  ownerId: string;
};

type DealModalFormState = {
  name: string;
  dealType: DealModalSubmitPayload["dealType"];
  totalAmount: number;
  currency: string;
  startDate: string;
  endDate: string;
  description: string;
  projectId: string;
  ownerId: string;
};

interface DealModalProps {
  lead: Lead;
  projects: Project[];
  owners: Array<{ id: string; name: string }>;
  lang: Language;
  onClose: () => void;
  onSave: (dealData: DealModalSubmitPayload) => void;
}

const DealModal: React.FC<DealModalProps> = ({ lead, projects, owners, lang, onClose, onSave }) => {
  const dispatch = useAppDispatch();
  const apiProjects = useAppSelector((state) => state.projects.projects);
  const projectsStatus = useAppSelector((state) => state.projects.listStatus);
  const t = useMemo(() => translations[lang], [lang]);
  const defaultOwnerId = useMemo(() => owners.find((owner) => owner.name === lead.ownerName)?.id || "", [lead.ownerName, owners]);
  const projectOptions = apiProjects.length > 0 ? apiProjects : projects;

  useEffect(() => {
    void dispatch(getProjects({ page: 1, limit: 200 }));
  }, [dispatch]);

  const validationSchema = useMemo(
    () =>
      Yup.object({
        name: Yup.string().trim().required(lang === "de" ? "Deal-Name ist erforderlich" : "Deal name is required"),
        projectId: Yup.string().optional(),
        ownerId: Yup.string().required(lang === "de" ? "Betreuer ist erforderlich" : "Owner is required"),
        dealType: Yup.mixed<DealModalSubmitPayload["dealType"]>()
          .oneOf(["CONSULTING", "ONLINE_TRADING", "OFF_SITE"])
          .required(),
        currency: Yup.string().oneOf(["EUR", "USD"]).required(),
        totalAmount: Yup.number()
          .typeError(lang === "de" ? "Betrag ist erforderlich" : "Amount is required")
          .required(lang === "de" ? "Betrag ist erforderlich" : "Amount is required")
          .min(0, lang === "de" ? "Betrag darf nicht negativ sein" : "Amount cannot be negative"),
        startDate: Yup.string().required(lang === "de" ? "Startdatum ist erforderlich" : "Start date is required"),
        endDate: Yup.string()
          .required(lang === "de" ? "Enddatum ist erforderlich" : "End date is required")
          .test(
            "end-after-start",
            lang === "de" ? "Enddatum muss nach Startdatum liegen" : "End date must be on or after start date",
            function (value) {
              const { startDate } = this.parent as DealModalFormState;
              if (!startDate || !value) return true;
              return new Date(value) >= new Date(startDate);
            }
          ),
        description: Yup.string().max(1000)
      }),
    [lang]
  );

  const formik = useFormik<DealModalFormState>({
    enableReinitialize: true,
    initialValues: {
      name: "",
      dealType: "CONSULTING",
      totalAmount: 0,
      currency: "EUR",
      startDate: "",
      endDate: "",
      description: "",
      projectId: lead.projectId || "",
      ownerId: defaultOwnerId
    },
    validationSchema,
    onSubmit: (values) => {
      onSave({
        ...values,
        leadId: lead.id
      });
    }
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col my-auto">
        <div className="shrink-0 px-6 sm:px-8 py-4 sm:py-6 border-b flex justify-between items-center bg-emerald-50/50">
          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="text-emerald-600 shrink-0" size={20} />
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight truncate">{t.deal.modalTitle}</h2>
            </div>
            <p className="text-xs text-emerald-700 font-medium truncate">
              {lead.firstName} {lead.lastName} • {lead.company}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl transition-colors shrink-0" type="button" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={formik.handleSubmit} className="flex flex-col min-h-0 flex-1 overflow-y-auto">
          <div className="p-6 sm:p-8 space-y-6">
          <p className="text-sm text-gray-500">{t.deal.modalSubtitle}</p>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              {t.deal.nameLabel}
            </label>
            <div className="relative">
              <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                <input
                name="name"
                autoFocus
                type="text"
                placeholder={t.deal.namePlaceholder}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-blue-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-0 text-sm font-medium"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
            {formik.touched.name && formik.errors.name && <p className="mt-1 text-xs text-red-500">{formik.errors.name}</p>}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              {t.header.projects} (optional)
            </label>
            <div className="relative">
              <FolderKanban className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              <select
                name="projectId"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-blue-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-0 text-sm font-bold text-gray-700 appearance-none"
                value={formik.values.projectId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value="">
                  {lang === "de" ? "Kein Projekt" : "No project"}
                </option>
                {projectOptions.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title || project.id}
                  </option>
                ))}
                {projectsStatus === "loading" && <option value="" disabled>{lang === "de" ? "Lade Projekte..." : "Loading projects..."}</option>}
              </select>
            </div>
            {formik.touched.projectId && formik.errors.projectId && (
              <p className="mt-1 text-xs text-red-500">{formik.errors.projectId}</p>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              {lang === "de" ? "Betreuer" : "Owner"}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              <select
                name="ownerId"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-blue-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-0 text-sm font-bold text-gray-700 appearance-none"
                value={formik.values.ownerId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value="" disabled>
                  {lang === "de" ? "Bitte wählen..." : "Please select..."}
                </option>
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name}
                  </option>
                ))}
              </select>
            </div>
            {formik.touched.ownerId && formik.errors.ownerId && (
              <p className="mt-1 text-xs text-red-500">{formik.errors.ownerId}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                {t.deal.typeLabel}
              </label>
              <select
                name="dealType"
                className="w-full px-4 py-3 bg-gray-50 border border-blue-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-0 text-sm font-bold text-gray-700"
                value={formik.values.dealType}
                onChange={formik.handleChange}
              >
                <option value="CONSULTING">CONSULTING</option>
                <option value="ONLINE_TRADING">ONLINE_TRADING</option>
                <option value="OFF_SITE">OFF_SITE</option>
              </select>
            </div>
            <div className="grid grid-cols-[1fr_2fr] gap-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  {t.deal.currencyLabel}
                </label>
                <select
                  name="currency"
                  className="w-full px-2 py-3 bg-gray-50 border border-blue-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-0 text-sm font-bold text-gray-700"
                  value={formik.values.currency}
                  onChange={formik.handleChange}
                >
                  <option value="EUR">€</option>
                  <option value="USD">$</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  {t.deal.amountLabel}
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  <input
                    name="totalAmount"
                    type="number"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-blue-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-0 text-sm font-bold"
                    value={formik.values.totalAmount}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
                {formik.touched.totalAmount && formik.errors.totalAmount && (
                  <p className="mt-1 text-xs text-red-500">{formik.errors.totalAmount}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              {t.deal.periodLabel}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                <input
                  name="startDate"
                  type="date"
                  className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-blue-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-0 text-[10px] font-bold text-gray-600"
                  value={formik.values.startDate}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                <input
                  name="endDate"
                  type="date"
                  className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-blue-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-0 text-[10px] font-bold text-gray-600"
                  value={formik.values.endDate}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
            </div>
            {(formik.touched.startDate && formik.errors.startDate) || (formik.touched.endDate && formik.errors.endDate) ? (
              <p className="mt-1 text-xs text-red-500">{formik.errors.startDate || formik.errors.endDate}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              {t.deal.descLabel}
            </label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 text-gray-300" size={16} />
              <textarea
                name="description"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-blue-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-0 text-sm font-medium resize-none min-h-[100px]"
                placeholder="..."
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all flex items-center justify-center gap-2"
          >
            {t.deal.saveButton}
            <ChevronRight size={18} />
          </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DealModal;
