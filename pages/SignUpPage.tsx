import { useFormik } from "formik";
import React, { useEffect, useMemo, useState } from "react";
import * as Yup from "yup";

import AuthInput from "../components/AuthInput";
import AuthLayout from "../components/AuthLayout";
import Toast from "../components/Toast";

type SignUpPageProps = {
  onSubmit: (data: { fullName: string; email: string; password: string; invitation?: string }) => void;
  onSwitchToSignIn: () => void;
  isLoading?: boolean;
  errorMessage?: string | null;
  successMessage?: string | null;
  initialEmail?: string;
  invitationId?: string | null;
  invitationEmail?: string;
  invitationRole?: string;
  invitationLoading?: boolean;
  invitationError?: string | null;
};

const SignUpPage: React.FC<SignUpPageProps> = ({
  onSubmit,
  onSwitchToSignIn,
  isLoading = false,
  errorMessage,
  successMessage,
  initialEmail = "",
  invitationId,
  invitationEmail,
  invitationRole,
  invitationLoading = false,
  invitationError
}) => {
  const [toastState, setToastState] = useState<{ open: boolean; type: "success" | "error" | "info"; message: string }>({
    open: false,
    type: "info",
    message: ""
  });

  const schema = useMemo(
    () =>
      Yup.object({
        fullName: Yup.string()
          .min(2, "Full name must be at least 2 characters.")
          .required("Full name is required."),
        email: Yup.string().email("Please enter a valid email address.").required("Email is required."),
        password: Yup.string()
          .min(8, "Password must be at least 8 characters.")
          .matches(/[A-Z]/, "Password must include at least one uppercase letter.")
          .matches(/[a-z]/, "Password must include at least one lowercase letter.")
          .matches(/[0-9]/, "Password must include at least one number.")
          .required("Password is required.")
      }),
    []
  );

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      fullName: "",
      email: invitationEmail || initialEmail,
      password: ""
    },
    validationSchema: schema,
    onSubmit: (values) => {
      onSubmit({ ...values, invitation: invitationId || undefined });
    }
  });

  useEffect(() => {
    if (!errorMessage) return;
    console.error("[SignUp] API error", errorMessage);
    setToastState({ open: true, type: "error", message: errorMessage });
  }, [errorMessage]);

  useEffect(() => {
    if (!invitationError) return;
    console.error("[SignUp] invitation error", invitationError);
    setToastState({ open: true, type: "error", message: invitationError });
  }, [invitationError]);

  useEffect(() => {
    if (!successMessage) return;
    setToastState({ open: true, type: "success", message: successMessage });
  }, [successMessage]);

  useEffect(() => {
    if (formik.submitCount < 1) return;
    const entries = Object.entries(formik.errors);
    if (entries.length === 0) return;
    const firstError = String(entries[0][1]);
    console.warn("[SignUp] validation errors", formik.errors);
    setToastState({ open: true, type: "error", message: firstError });
  }, [formik.errors, formik.submitCount]);

  return (
    <>
      <Toast
        isOpen={toastState.open}
        type={toastState.type}
        message={toastState.message}
        onClose={() => setToastState((prev) => ({ ...prev, open: false }))}
      />
      <AuthLayout
        title="Create account"
        subtitle="Set up your workspace access in less than a minute."
        footerText="Already have an account?"
        footerActionText="Sign in"
        onFooterAction={onSwitchToSignIn}
      >
        {invitationId && (
          <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-800">
            {invitationLoading
              ? "Validating invitation..."
              : invitationError
                ? "Invitation is invalid or expired."
                : `Invitation detected${invitationRole ? ` (${invitationRole})` : ""}${invitationEmail ? ` for ${invitationEmail}` : ""}.`}
          </div>
        )}
        <form onSubmit={formik.handleSubmit} className="space-y-4" noValidate>
          <AuthInput
            id="sign-up-name"
            type="text"
            label="Full name"
            placeholder="Alex Morgan"
            value={formik.values.fullName}
            onChange={(value) => formik.setFieldValue("fullName", value)}
            onBlur={() => formik.setFieldTouched("fullName", true)}
            error={formik.errors.fullName}
            touched={formik.touched.fullName}
          />

          <AuthInput
            id="sign-up-email"
            type="email"
            label="Work email"
            placeholder="you@company.com"
            value={formik.values.email}
            onChange={(value) => formik.setFieldValue("email", value)}
            onBlur={() => formik.setFieldTouched("email", true)}
            error={formik.errors.email}
            touched={formik.touched.email}
            disabled={Boolean(invitationEmail)}
          />

          <AuthInput
            id="sign-up-password"
            type="password"
            label="Password"
            placeholder="Choose a secure password"
            value={formik.values.password}
            onChange={(value) => formik.setFieldValue("password", value)}
            onBlur={() => formik.setFieldTouched("password", true)}
            error={formik.errors.password}
            touched={formik.touched.password}
          />

          <button
            type="submit"
            disabled={isLoading || (Boolean(invitationId) && (invitationLoading || Boolean(invitationError)))}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-sm rounded-xl py-3.5 transition-all shadow-lg shadow-blue-100"
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>
      </AuthLayout>
    </>
  );
};

export default SignUpPage;
