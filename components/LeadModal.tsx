import React, { useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import { X, Linkedin, Loader2, ChevronRight, Check } from "lucide-react";
import * as Yup from "yup";
import { Lead, PipelineStage } from "../types";
import { api } from "../services/api";
import { FORM_MAX_LENGTH } from "../constants";
import { translations, Language } from "../translations";

interface LeadModalProps
{
  onClose: () => void;
  onSave: (lead: Partial<Lead>) => void;
  owners: Array<{ id: string; name: string; }>;
  lang: Language;
  apiError?: string | null;
}

const LeadModal: React.FC<LeadModalProps> = ({ onClose, onSave, owners, lang, apiError }) =>
{
  const t = useMemo(() => translations[lang], [lang]);
  const isDe = lang === "de";
  const lettersOnlyPattern = /^[\p{L}\s'-]+$/u;
  const noDigitsPattern = /^\D+$/;
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
          .required(isDe ? "Vorname ist erforderlich" : "First name is required")
          .min(3, isDe ? "Vorname muss mindestens 3 Zeichen haben" : "First name must be at least 3 characters")
          .max(
            FORM_MAX_LENGTH.leadFirstName,
            isDe ? `Max. ${ FORM_MAX_LENGTH.leadFirstName } Zeichen` : `Max. ${ FORM_MAX_LENGTH.leadFirstName } characters`
          )
          .matches(noDigitsPattern, isDe ? "Vorname darf keine Zahlen enthalten" : "First name cannot contain numbers")
          .matches(
            lettersOnlyPattern,
            isDe ? "Vorname enthält ungültige Zeichen" : "First name contains invalid characters"
          ),
        lastName: Yup.string()
          .trim()
          .required(isDe ? "Nachname ist erforderlich" : "Last name is required")
          .max(
            FORM_MAX_LENGTH.leadLastName,
            isDe ? `Max. ${ FORM_MAX_LENGTH.leadLastName } Zeichen` : `Max. ${ FORM_MAX_LENGTH.leadLastName } characters`
          )
          .matches(noDigitsPattern, isDe ? "Nachname darf keine Zahlen enthalten" : "Last name cannot contain numbers")
          .matches(
            lettersOnlyPattern,
            isDe ? "Nachname enthält ungültige Zeichen" : "Last name contains invalid characters"
          ),
        currentPosition: Yup.string()
          .trim()
          .required(isDe ? "Position ist erforderlich" : "Position is required")
          .max(
            FORM_MAX_LENGTH.leadPosition,
            isDe ? `Max. ${ FORM_MAX_LENGTH.leadPosition } Zeichen` : `Max. ${ FORM_MAX_LENGTH.leadPosition } characters`
          ),
        company: Yup.string()
          .trim()
          .max(
            FORM_MAX_LENGTH.leadCompany,
            isDe ? `Max. ${ FORM_MAX_LENGTH.leadCompany } Zeichen` : `Max. ${ FORM_MAX_LENGTH.leadCompany } characters`
          ),
        ownerName: Yup.string()
          .trim()
          .required(isDe ? "Betreuer ist erforderlich" : "Owner is required"),
        email: Yup.string()
          .transform((value) => (typeof value === "string" ? value.trim() : value))
          .max(
            FORM_MAX_LENGTH.leadEmail,
            isDe ? `Max. ${ FORM_MAX_LENGTH.leadEmail } Zeichen` : `Max. ${ FORM_MAX_LENGTH.leadEmail } characters`
          )
          .test("email-format", isDe ? "Ungültige E-Mail-Adresse" : "Email must be a valid email address", (value) =>
          {
            const normalized = typeof value === "string" ? value.trim() : "";
            if (!normalized) return true;
            return Yup.string().email().isValidSync(normalized);
          }),
        phone: Yup.string()
          .transform((value) => (typeof value === "string" ? value.trim() : value))
          .max(
            FORM_MAX_LENGTH.leadPhone,
            isDe ? `Max. ${ FORM_MAX_LENGTH.leadPhone } Zeichen` : `Max. ${ FORM_MAX_LENGTH.leadPhone } characters`
          )
          .test(
            "phone-valid",
            isDe
              ? "Ungültige Telefonnummer (5–15 Ziffern, nur + - ( ) und Leerzeichen)"
              : "Invalid phone (5–15 digits; only +, spaces, dashes, parentheses)",
            (value) => validatePhone(value)
          ),
        linkedinUrl: Yup.string()
          .transform((value) => (typeof value === "string" ? value.trim() : value))
          .max(
            FORM_MAX_LENGTH.leadUrl,
            isDe ? `Max. ${ FORM_MAX_LENGTH.leadUrl } Zeichen` : `Max. ${ FORM_MAX_LENGTH.leadUrl } characters`
          )
          .test("valid-linkedin-url", isDe ? "Ungültige LinkedIn URL" : "Invalid LinkedIn URL", (value) =>
          {
            const normalized = typeof value === "string" ? value.trim() : "";
            if (!normalized) return true;
            return Yup.string().url().isValidSync(normalized) && isValidLinkedInUrl(normalized);
          }),
        birthday: Yup.string().test("valid-date", isDe ? "Ungültiges Datum" : "Invalid date", (value) =>
        {
          if (!value) return true;
          return !Number.isNaN(new Date(value).getTime());
        })
      }),
    [isDe]
  );

  const formik = useFormik<Partial<Lead>>({
    initialValues: {
      firstName: "",
      lastName: "",
      currentPosition: "",
      company: "",
      linkedinUrl: "",
      ownerName: "",
      pipelineStage: PipelineStage.IDENTIFIED,
      email: "",
      phone: "",
      birthday: ""
    },
    validationSchema,
    onSubmit: (values) =>
    {
      onSave(values);
    }
  });

  useEffect(() =>
  {
    if (!apiError || !formik.setFieldError) return;
    const msg = apiError.trim();
    const parts = msg
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    let mapped = false;
    for (const part of parts)
    {
      if (/company/i.test(part))
      {
        formik.setFieldError("company", part);
        mapped = true;
      } else if (/email/i.test(part))
      {
        formik.setFieldError("email", part);
        mapped = true;
      } else if (/phone/i.test(part))
      {
        formik.setFieldError("phone", part);
        mapped = true;
      }
    }
    if (mapped)
    {
      formik.setTouched({ company: true, email: true, phone: true }, false);
    }
  }, [apiError]);


  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={ onClose } />
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">{ t.leadModal.title }</h2>
          <button onClick={ onClose } className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
            <X size={ 20 } />
          </button>
        </div>

        <div className="p-8 h-[75vh] overflow-y-auto custom-scrollbar">
          <form onSubmit={ formik.handleSubmit } className="space-y-4 pb-4" noValidate>
            { apiError && !formik.errors.company && !formik.errors.email && !formik.errors.phone && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                <p className="text-sm font-medium text-red-700">{ apiError }</p>
              </div>
            ) }
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  { t.leadModal.firstName } *
                </label>
                <input
                  name="firstName"
                  type="text"
                  maxLength={ FORM_MAX_LENGTH.leadFirstName }
                  placeholder={ t.leadModal.firstNamePlaceholder }
                  value={ formik.values.firstName || "" }
                  onChange={ formik.handleChange }
                  onBlur={ formik.handleBlur }
                  className="w-full px-4 py-2.5 border border-blue-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-0"
                />
                { formik.touched.firstName && formik.errors.firstName && (
                  <p className="mt-1 text-xs text-red-500">{ formik.errors.firstName }</p>
                ) }
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  { t.leadModal.lastName } *
                </label>
                <input
                  name="lastName"
                  type="text"
                  maxLength={ FORM_MAX_LENGTH.leadLastName }
                  placeholder={ t.leadModal.lastNamePlaceholder }
                  value={ formik.values.lastName || "" }
                  onChange={ formik.handleChange }
                  onBlur={ formik.handleBlur }
                  className="w-full px-4 py-2.5 border border-blue-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-0"
                />
                { formik.touched.lastName && formik.errors.lastName && (
                  <p className="mt-1 text-xs text-red-500">{ formik.errors.lastName }</p>
                ) }
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  { t.leadModal.position } *
                </label>
                <input
                  name="currentPosition"
                  type="text"
                  maxLength={ FORM_MAX_LENGTH.leadPosition }
                  placeholder={ t.leadModal.positionPlaceholder }
                  value={ formik.values.currentPosition || "" }
                  onChange={ formik.handleChange }
                  onBlur={ formik.handleBlur }
                  className="w-full px-4 py-2.5 border border-blue-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-0"
                />
                { formik.touched.currentPosition && formik.errors.currentPosition && (
                  <p className="mt-1 text-xs text-red-500">{ formik.errors.currentPosition }</p>
                ) }
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{ t.leadModal.company }</label>
                <input
                  name="company"
                  type="text"
                  maxLength={ FORM_MAX_LENGTH.leadCompany }
                  placeholder={ t.leadModal.companyPlaceholder }
                  value={ formik.values.company || "" }
                  onChange={ formik.handleChange }
                  onBlur={ formik.handleBlur }
                  className="w-full px-4 py-2.5 border border-blue-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-0"
                />
                { (formik.touched.company || formik.errors.company) && formik.errors.company && (
                  <p className="mt-1 text-xs text-red-500">{ formik.errors.company }</p>
                ) }
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{ t.leadModal.owner } *</label>
              <select
                name="ownerName"
                value={ formik.values.ownerName || "" }
                onChange={ formik.handleChange }
                onBlur={ formik.handleBlur }
                className="w-full px-4 py-2.5 border border-blue-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-0 bg-white"
              >
                <option value="" disabled>
                  { t.leadModal.selectOwner }
                </option>
                { owners.map((o) => (
                  <option key={ o.id } value={ o.name }>
                    { o.name }
                  </option>
                )) }
              </select>
              { formik.touched.ownerName && formik.errors.ownerName && (
                <p className="mt-1 text-xs text-red-500">{ formik.errors.ownerName }</p>
              ) }
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{ t.leadModal.email }</label>
                <input
                  name="email"
                  type="email"
                  maxLength={ FORM_MAX_LENGTH.leadEmail }
                  placeholder={ t.leadModal.emailPlaceholder }
                  value={ formik.values.email || "" }
                  onChange={ formik.handleChange }
                  onBlur={ formik.handleBlur }
                  className="w-full px-4 py-2.5 border border-blue-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-0"
                />
                { formik.touched.email && formik.errors.email && (
                  <p className="mt-1 text-xs text-red-500">{ formik.errors.email }</p>
                ) }
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{ t.leadModal.phone }</label>
                <input
                  name="phone"
                  type="tel"
                  maxLength={ FORM_MAX_LENGTH.leadPhone }
                  placeholder={ t.leadModal.phonePlaceholder }
                  value={ formik.values.phone || "" }
                  onChange={ formik.handleChange }
                  onBlur={ formik.handleBlur }
                  className="w-full px-4 py-2.5 border border-blue-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-0"
                />
                { formik.touched.phone && formik.errors.phone && (
                  <p className="mt-1 text-xs text-red-500">{ formik.errors.phone }</p>
                ) }
              </div>
            </div>

            {/* LinkedIn URL field added to manual step */ }
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                { t.leadModal.linkedinLabel }
              </label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={ 16 } />
                <input
                  name="linkedinUrl"
                  type="text"
                  maxLength={ FORM_MAX_LENGTH.leadUrl }
                  value={ formik.values.linkedinUrl || "" }
                  onChange={ formik.handleChange }
                  onBlur={ formik.handleBlur }
                  placeholder={ t.leadModal.linkedinPlaceholderShort }
                  className="w-full pl-10 pr-4 py-2.5 border border-blue-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-0"
                />
              </div>
              { formik.touched.linkedinUrl && formik.errors.linkedinUrl && (
                <p className="mt-1 text-xs text-red-500">{ formik.errors.linkedinUrl }</p>
              ) }
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{ t.leadModal.birthday }</label>
              <input
                name="birthday"
                type="date"
                value={ formik.values.birthday || "" }
                onChange={ formik.handleChange }
                onBlur={ formik.handleBlur }
                className="w-full px-4 py-2.5 border border-blue-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-0"
              />
              { formik.touched.birthday && formik.errors.birthday && (
                <p className="mt-1 text-xs text-red-500">{ formik.errors.birthday }</p>
              ) }
            </div>

            <div className="pt-4 flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
              >
                { t.leadModal.save }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LeadModal;
