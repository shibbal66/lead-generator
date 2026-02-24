import { useFormik } from "formik";
import React, { useEffect, useMemo, useState } from "react";
import * as Yup from "yup";

import AuthInput from "../components/AuthInput";
import AuthLayout from "../components/AuthLayout";
import Toast from "../components/Toast";

type ResetPasswordPageProps = {
  idFromUrl?: string;
  isLoading?: boolean;
  errorMessage?: string | null;
  successMessage?: string | null;
  onSubmit: (data: { id: string; newPassword: string }) => void;
  onBackToSignIn: () => void;
};

const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({
  idFromUrl,
  isLoading = false,
  errorMessage,
  successMessage,
  onSubmit,
  onBackToSignIn
}) => {
  const [toastState, setToastState] = useState<{ open: boolean; type: "success" | "error" | "info"; message: string }>({
    open: false,
    type: "info",
    message: ""
  });

  const schema = useMemo(
    () =>
      Yup.object({
        newPassword: Yup.string()
          .min(8, "Password must be at least 8 characters.")
          .matches(/[A-Z]/, "Password must include at least one uppercase letter.")
          .matches(/[a-z]/, "Password must include at least one lowercase letter.")
          .matches(/[0-9]/, "Password must include at least one number.")
          .matches(/[^\w\s]/, "Password must include at least one special character.")
          .required("New password is required."),
        confirmPassword: Yup.string()
          .oneOf([Yup.ref("newPassword")], "Passwords do not match.")
          .required("Confirm password is required.")
      }),
    []
  );

  const formik = useFormik({
    initialValues: {
      newPassword: "",
      confirmPassword: ""
    },
    validationSchema: schema,
    onSubmit: (values) => {
      if (!idFromUrl || !idFromUrl.trim()) {
        setToastState({
          open: true,
          type: "error",
          message: "Reset link is invalid or incomplete (missing verification ID)."
        });
        return;
      }
      onSubmit({ id: idFromUrl.trim(), newPassword: values.newPassword });
    }
  });

  useEffect(() => {
    if (!errorMessage) return;
    setToastState({ open: true, type: "error", message: errorMessage });
  }, [errorMessage]);

  useEffect(() => {
    if (!successMessage) return;
    setToastState({ open: true, type: "success", message: successMessage });
  }, [successMessage]);

  return (
    <>
      <Toast
        isOpen={toastState.open}
        type={toastState.type}
        message={toastState.message}
        onClose={() => setToastState((prev) => ({ ...prev, open: false }))}
      />
      <AuthLayout
        title="Set new password"
        subtitle="Use the reset link from your email and choose a new password."
        footerText="Back to login?"
        footerActionText="Sign in"
        onFooterAction={onBackToSignIn}
      >
        {successMessage ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-700">Password updated</p>
            <p className="text-sm text-emerald-700/90 mt-1">{successMessage}</p>
            <button
              type="button"
              onClick={onBackToSignIn}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl py-3 transition-all shadow-lg shadow-blue-100"
            >
              Continue to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={formik.handleSubmit} className="space-y-4" noValidate>
            <AuthInput
              id="reset-password-new"
              type="password"
              label="New password"
              placeholder="Create a new password"
              value={formik.values.newPassword}
              onChange={(value) => formik.setFieldValue("newPassword", value)}
              onBlur={() => formik.setFieldTouched("newPassword", true)}
              error={formik.errors.newPassword}
              touched={formik.touched.newPassword}
            />

            <AuthInput
              id="reset-password-confirm"
              type="password"
              label="Confirm password"
              placeholder="Re-enter your new password"
              value={formik.values.confirmPassword}
              onChange={(value) => formik.setFieldValue("confirmPassword", value)}
              onBlur={() => formik.setFieldTouched("confirmPassword", true)}
              error={formik.errors.confirmPassword}
              touched={formik.touched.confirmPassword}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-sm rounded-xl py-3.5 transition-all shadow-lg shadow-blue-100"
            >
              {isLoading ? "Updating..." : "Reset password"}
            </button>
          </form>
        )}
      </AuthLayout>
    </>
  );
};

export default ResetPasswordPage;
