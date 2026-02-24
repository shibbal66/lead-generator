import { useFormik } from "formik";
import React, { useEffect, useMemo, useState } from "react";
import * as Yup from "yup";

import AuthInput from "../components/AuthInput";
import AuthLayout from "../components/AuthLayout";
import Toast from "../components/Toast";

type ForgotPasswordPageProps = {
  onSubmit: (data: { email: string }) => void;
  onBackToSignIn: () => void;
  isLoading?: boolean;
  isSubmitted?: boolean;
  successMessage?: string | null;
  errorMessage?: string | null;
  initialEmail?: string;
};

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onSubmit,
  onBackToSignIn,
  isLoading = false,
  isSubmitted = false,
  successMessage,
  errorMessage,
  initialEmail = ""
}) => {
  const [toastState, setToastState] = useState<{ open: boolean; type: "success" | "error" | "info"; message: string }>({
    open: false,
    type: "info",
    message: ""
  });

  const schema = useMemo(
    () =>
      Yup.object({
        email: Yup.string().email("Please enter a valid email address.").required("Email is required.")
      }),
    []
  );

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      email: initialEmail
    },
    validationSchema: schema,
    onSubmit: (values) => {
      onSubmit(values);
    }
  });

  useEffect(() => {
    if (!errorMessage) return;
    console.error("[ForgotPassword] API error", errorMessage);
    const isEmailValidation = /email.*(valid|required|invalid)|(valid|required|invalid).*email/i.test(errorMessage);
    if (isEmailValidation) {
      formik.setFieldError("email", errorMessage);
      return;
    }
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
        title="Reset password"
        subtitle="Enter your account email and we’ll send reset instructions."
        footerText="Remember your password?"
        footerActionText="Sign in"
        onFooterAction={onBackToSignIn}
      >
        {isSubmitted ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-700">Reset link sent</p>
            <p className="text-sm text-emerald-700/90 mt-1">{successMessage || "Check your email for a reset link."}</p>
            <button
              type="button"
              onClick={onBackToSignIn}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl py-3 transition-all shadow-lg shadow-blue-100"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={formik.handleSubmit} className="space-y-4" noValidate>
            <AuthInput
              id="forgot-password-email"
              type="email"
              label="Email"
              placeholder="you@company.com"
              value={formik.values.email}
              onChange={(value) => formik.setFieldValue("email", value)}
              onBlur={() => formik.setFieldTouched("email", true)}
              error={formik.errors.email}
              touched={formik.touched.email}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-sm rounded-xl py-3.5 transition-all shadow-lg shadow-blue-100"
            >
              {isLoading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}
      </AuthLayout>
    </>
  );
};

export default ForgotPasswordPage;
