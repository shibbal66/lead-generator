import { useFormik } from "formik";
import React, { useEffect, useMemo, useState } from "react";
import * as Yup from "yup";

import AuthInput from "../components/AuthInput";
import AuthLayout from "../components/AuthLayout";
import Toast from "../components/Toast";

type SignInPageProps = {
  onSubmit: (data: { email: string; password: string }) => void;
  onSwitchToSignUp: () => void;
  onForgotPassword: () => void;
  isLoading?: boolean;
  errorMessage?: string | null;
  successMessage?: string | null;
  initialEmail?: string;
};

const SignInPage: React.FC<SignInPageProps> = ({
  onSubmit,
  onSwitchToSignUp,
  onForgotPassword,
  isLoading = false,
  errorMessage,
  successMessage,
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
        email: Yup.string().email("Please enter a valid email address.").required("Email is required."),
        password: Yup.string().required("Password is required.")
      }),
    []
  );

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      email: initialEmail,
      password: ""
    },
    validationSchema: schema,
    onSubmit: (values) => {
      onSubmit(values);
    }
  });

  useEffect(() => {
    if (!errorMessage) return;
    console.error("[SignIn] API error", errorMessage);
    const isEmailValidation = /email.*(valid|required|invalid)|(valid|required|invalid).*email/i.test(errorMessage);
    if (isEmailValidation) {
      formik.setFieldError("email", errorMessage);
      return;
    }
    const isPasswordValidation =
      /lowercase|uppercase|digit|special character|at least \d+ character/i.test(errorMessage);
    const message = isPasswordValidation ? "Invalid email or password." : errorMessage;
    setToastState({ open: true, type: "error", message });
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
        title="Sign in"
        subtitle="Access your lead pipeline and continue where you left off."
        footerText="Don’t have an account?"
        footerActionText="Create one"
        onFooterAction={onSwitchToSignUp}
      >
        <form onSubmit={formik.handleSubmit} className="space-y-4" noValidate>
          <AuthInput
            id="sign-in-email"
            type="email"
            label="Email"
            placeholder="you@company.com"
            value={formik.values.email}
            onChange={(value) => formik.setFieldValue("email", value)}
            onBlur={() => formik.setFieldTouched("email", true)}
            error={formik.errors.email}
            touched={formik.touched.email}
          />

          <AuthInput
            id="sign-in-password"
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={formik.values.password}
            onChange={(value) => formik.setFieldValue("password", value)}
            onBlur={() => formik.setFieldTouched("password", true)}
            error={formik.errors.password}
            touched={formik.touched.password}
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-sm rounded-xl py-3.5 transition-all shadow-lg shadow-blue-100"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </AuthLayout>
    </>
  );
};

export default SignInPage;
