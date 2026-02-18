import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { X, Mail, Send, Check, Users, Shield, Loader2 } from "lucide-react";
import { Language, translations } from "../translations";

interface ShareModalProps {
  lang: Language;
  onClose: () => void;
  onInvite?: (payload: { email: string; role: "EDITOR" | "ADMIN" }) => Promise<void> | void;
}

const ShareModal: React.FC<ShareModalProps> = ({ lang, onClose, onInvite }) => {
  const t = translations[lang];
  const [role, setRole] = useState<"Editor" | "Admin">("Editor");
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [invitedEmail, setInvitedEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const formik = useFormik<{ email: string }>({
    initialValues: {
      email: ""
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .trim()
        .required(t.userMgmt.inviteModalEmailRequired)
        .email(t.userMgmt.inviteModalEmailInvalid)
    }),
    onSubmit: async (values) => {
      setErrorMessage("");
      setIsSending(true);
      try {
        const apiRole: "EDITOR" | "ADMIN" = role === "Admin" ? "ADMIN" : "EDITOR";
        const normalizedEmail = values.email.trim();
        await onInvite?.({ email: normalizedEmail, role: apiRole });
        setInvitedEmail(normalizedEmail);
        setIsSuccess(true);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Failed to send invitation");
      } finally {
        setIsSending(false);
      }
    }
  });

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 text-center animate-in fade-in zoom-in duration-200">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.userMgmt.inviteModalSuccessTitle}</h2>
          <p className="text-gray-500 mb-8">
            {t.userMgmt.inviteModalSuccessBody.replace("{email}", invitedEmail)}
          </p>
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all"
          >
            {t.userMgmt.inviteModalDone}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <div className="flex items-center space-x-2">
            <Users className="text-blue-600" size={20} />
            <h2 className="text-lg font-bold text-gray-900">{t.userMgmt.inviteModalTitle}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          <p className="text-sm text-gray-500 mb-6">{t.userMgmt.inviteModalDesc}</p>

          <form onSubmit={formik.handleSubmit} className="space-y-6" noValidate>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{t.userMgmt.inviteModalEmailLabel}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  name="email"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder={lang === "de" ? "kollege@unternehmen.de" : "colleague@company.com"}
                  className="w-full pl-10 pr-4 py-3 border-gray-200 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm outline-none"
                />
              </div>
              {formik.touched.email && formik.errors.email && (
                <p className="mt-1 text-xs font-semibold text-red-500">{formik.errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{t.userMgmt.inviteModalRoleLabel}</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("Editor")}
                  className={`p-3 rounded-xl border text-left transition-all ${role === "Editor" ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600" : "border-gray-200 hover:bg-gray-50"}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-gray-900">Editor</span>
                    {role === "Editor" && <Check size={14} className="text-blue-600" />}
                  </div>
                  <p className="text-[10px] text-gray-500">{t.userMgmt.inviteModalRoleEditorDesc}</p>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("Admin")}
                  className={`p-3 rounded-xl border text-left transition-all ${role === "Admin" ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600" : "border-gray-200 hover:bg-gray-50"}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-gray-900">Admin</span>
                    {role === "Admin" && <Check size={14} className="text-blue-600" />}
                  </div>
                  <p className="text-[10px] text-gray-500">{t.userMgmt.inviteModalRoleAdminDesc}</p>
                </button>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl flex items-start space-x-3">
              <Shield className="text-blue-600 shrink-0 mt-0.5" size={16} />
              <p className="text-[11px] text-blue-700 leading-relaxed">{t.userMgmt.inviteModalNotice}</p>
            </div>

            {errorMessage && <p className="text-xs font-semibold text-red-500">{errorMessage}</p>}

            <button
              type="submit"
              disabled={isSending || !formik.isValid || !formik.values.email.trim()}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  {t.userMgmt.inviteModalSending}
                </>
              ) : (
                <>
                  <Send className="mr-2" size={18} />
                  {t.userMgmt.inviteModalSend}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
