import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Eye, EyeOff, Loader2, Shield, User, X } from "lucide-react";

import { Language } from "../translations";

type ProfileSettingsModalProps = {
  lang: Language;
  email: string;
  initialName: string;
  isProfileSaving?: boolean;
  isPasswordSaving?: boolean;
  onClose: () => void;
  onUpdateProfile: (payload: { name: string }) => Promise<void>;
  onUpdatePassword: (payload: { oldPassword: string; newPassword: string }) => Promise<void>;
};

const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  lang,
  email,
  initialName,
  isProfileSaving = false,
  isPasswordSaving = false,
  onClose,
  onUpdateProfile,
  onUpdatePassword
}) => {
  const [isOldPasswordVisible, setIsOldPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const copy =
    lang === "de"
      ? {
          title: "Profil & Sicherheit",
          subtitle: "Aktualisieren Sie Ihre Profildaten und Ihr Passwort.",
          profileTitle: "Profil aktualisieren",
          nameLabel: "Name",
          emailLabel: "E-Mail",
          saveProfile: "Profil speichern",
          passwordTitle: "Passwort ändern",
          oldPassword: "Aktuelles Passwort",
          newPassword: "Neues Passwort",
          confirmPassword: "Passwort bestätigen",
          savePassword: "Passwort aktualisieren",
          nameRequired: "Name ist erforderlich.",
          nameInvalid: "Name darf nur Buchstaben, Leerzeichen, Apostroph und Bindestrich enthalten.",
          nameMin: "Name muss mindestens 2 Zeichen haben.",
          nameMax: "Name darf maximal 80 Zeichen haben.",
          oldPasswordRequired: "Aktuelles Passwort ist erforderlich.",
          newPasswordRequired: "Neues Passwort ist erforderlich.",
          passwordMin: "Neues Passwort muss mindestens 8 Zeichen haben.",
          passwordMax: "Neues Passwort darf maximal 64 Zeichen haben.",
          passwordStrength:
            "Passwort muss Groß-/Kleinbuchstaben, Zahl und Sonderzeichen enthalten.",
          passwordDifferent: "Neues Passwort muss sich vom alten Passwort unterscheiden.",
          confirmPasswordRequired: "Bitte bestätigen Sie das neue Passwort.",
          confirmPasswordMismatch: "Passwörter stimmen nicht überein."
        }
      : {
          title: "Profile & Security",
          subtitle: "Update your profile details and password.",
          profileTitle: "Update profile",
          nameLabel: "Name",
          emailLabel: "Email",
          saveProfile: "Save profile",
          passwordTitle: "Change password",
          oldPassword: "Current password",
          newPassword: "New password",
          confirmPassword: "Confirm password",
          savePassword: "Update password",
          nameRequired: "Name is required.",
          nameInvalid: "Name can only contain letters, spaces, apostrophes, and hyphens.",
          nameMin: "Name must be at least 2 characters.",
          nameMax: "Name can be at most 80 characters.",
          oldPasswordRequired: "Current password is required.",
          newPasswordRequired: "New password is required.",
          passwordMin: "New password must be at least 8 characters.",
          passwordMax: "New password can be at most 64 characters.",
          passwordStrength:
            "Password must include uppercase, lowercase, number, and special character.",
          passwordDifferent: "New password must be different from current password.",
          confirmPasswordRequired: "Please confirm your new password.",
          confirmPasswordMismatch: "Passwords must match."
        };

  const profileFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: initialName || ""
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .trim()
        .required(copy.nameRequired)
        .min(2, copy.nameMin)
        .max(80, copy.nameMax)
        .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/, copy.nameInvalid)
    }),
    onSubmit: async (values) => {
      setProfileError("");
      try {
        await onUpdateProfile({ name: values.name.trim() });
      } catch (error) {
        setProfileError(error instanceof Error ? error.message : "Request failed");
      }
    }
  });

  const passwordFormik = useFormik({
    initialValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: ""
    },
    validationSchema: Yup.object({
      oldPassword: Yup.string().required(copy.oldPasswordRequired),
      newPassword: Yup.string()
        .required(copy.newPasswordRequired)
        .min(8, copy.passwordMin)
        .max(64, copy.passwordMax)
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).+$/, copy.passwordStrength)
        .notOneOf([Yup.ref("oldPassword")], copy.passwordDifferent),
      confirmPassword: Yup.string()
        .required(copy.confirmPasswordRequired)
        .oneOf([Yup.ref("newPassword")], copy.confirmPasswordMismatch)
    }),
    onSubmit: async (values, helpers) => {
      setPasswordError("");
      try {
        await onUpdatePassword({
          oldPassword: values.oldPassword,
          newPassword: values.newPassword
        });
        helpers.resetForm();
      } catch (error) {
        setPasswordError(error instanceof Error ? error.message : "Request failed");
      }
    }
  });

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[88vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">{copy.title}</h2>
            <p className="text-sm text-gray-500 mt-1">{copy.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <section className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <User size={18} className="text-blue-600" />
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{copy.profileTitle}</h3>
            </div>
            <form onSubmit={profileFormik.handleSubmit} className="space-y-4" noValidate>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">{copy.nameLabel}</label>
                <input
                  name="name"
                  type="text"
                  maxLength={80}
                  value={profileFormik.values.name}
                  onChange={profileFormik.handleChange}
                  onBlur={profileFormik.handleBlur}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                {profileFormik.touched.name && profileFormik.errors.name && (
                  <p className="mt-1 text-xs font-semibold text-red-500">{profileFormik.errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">{copy.emailLabel}</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-100 text-gray-500"
                />
              </div>

              <button
                type="submit"
                disabled={isProfileSaving || !profileFormik.isValid}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProfileSaving ? <Loader2 size={16} className="animate-spin" /> : null}
                {copy.saveProfile}
              </button>
              {profileError ? <p className="text-xs font-semibold text-red-500">{profileError}</p> : null}
            </form>
          </section>

          <section className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={18} className="text-blue-600" />
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{copy.passwordTitle}</h3>
            </div>
            <form onSubmit={passwordFormik.handleSubmit} className="space-y-4" noValidate>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">{copy.oldPassword}</label>
                <div className="relative">
                  <input
                    name="oldPassword"
                    type={isOldPasswordVisible ? "text" : "password"}
                    value={passwordFormik.values.oldPassword}
                    onChange={passwordFormik.handleChange}
                    onBlur={passwordFormik.handleBlur}
                    className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setIsOldPasswordVisible((prev) => !prev)}
                    className="absolute inset-y-0 right-3 my-auto text-gray-400 hover:text-gray-600"
                  >
                    {isOldPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordFormik.touched.oldPassword && passwordFormik.errors.oldPassword && (
                  <p className="mt-1 text-xs font-semibold text-red-500">{passwordFormik.errors.oldPassword}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">{copy.newPassword}</label>
                <div className="relative">
                  <input
                    name="newPassword"
                    type={isNewPasswordVisible ? "text" : "password"}
                    value={passwordFormik.values.newPassword}
                    onChange={passwordFormik.handleChange}
                    onBlur={passwordFormik.handleBlur}
                    className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setIsNewPasswordVisible((prev) => !prev)}
                    className="absolute inset-y-0 right-3 my-auto text-gray-400 hover:text-gray-600"
                  >
                    {isNewPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordFormik.touched.newPassword && passwordFormik.errors.newPassword && (
                  <p className="mt-1 text-xs font-semibold text-red-500">{passwordFormik.errors.newPassword}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                  {copy.confirmPassword}
                </label>
                <div className="relative">
                  <input
                    name="confirmPassword"
                    type={isConfirmPasswordVisible ? "text" : "password"}
                    value={passwordFormik.values.confirmPassword}
                    onChange={passwordFormik.handleChange}
                    onBlur={passwordFormik.handleBlur}
                    className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setIsConfirmPasswordVisible((prev) => !prev)}
                    className="absolute inset-y-0 right-3 my-auto text-gray-400 hover:text-gray-600"
                  >
                    {isConfirmPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword && (
                  <p className="mt-1 text-xs font-semibold text-red-500">{passwordFormik.errors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isPasswordSaving || !passwordFormik.isValid}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPasswordSaving ? <Loader2 size={16} className="animate-spin" /> : null}
                {copy.savePassword}
              </button>
              {passwordError ? <p className="text-xs font-semibold text-red-500">{passwordError}</p> : null}
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsModal;
