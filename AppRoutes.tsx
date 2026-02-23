import React, { useEffect, useRef, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate, useSearchParams } from "react-router-dom";

import App from "./App";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import LandingPage from "./pages/LandingPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import {
  bootstrapAuth,
  forgotPassword,
  resetPassword,
  signIn,
  signUp,
  verifyAccount
} from "./store/actions/authActions";
import { getInvitationById } from "./store/actions/teamActions";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { clearAuthMessages } from "./store/slices/authSlice";
import { clearInvitation } from "./store/slices/teamSlice";

const buildLoginPathWithEmail = (email?: string) =>
  `/login${email ? `?email=${encodeURIComponent(email)}` : ""}`;

const CatchAllRedirect: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, bootstrapStatus } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (bootstrapStatus !== "idle") return;
    dispatch(bootstrapAuth());
  }, [bootstrapStatus, dispatch]);

  if (bootstrapStatus === "loading" || bootstrapStatus === "idle") {
    return <div className="min-h-screen bg-gray-50" />;
  }

  return <Navigate to={isAuthenticated ? "/app" : "/"} replace />;
};

const SignInRoute: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const signedOut = searchParams.get("signedOut") === "1";
  const verifySent = searchParams.get("verifySent") === "1";
  const verifyFlag = searchParams.get("verify") === "true";
  const email = searchParams.get("email") || "";
  const code = searchParams.get("code") || "";
  const hasVerificationParams = Boolean(email && code);
  const hasTriggeredVerification = useRef(false);
  const { signInStatus, verifyStatus, error } = useAppSelector((state) => state.auth);
  const redirectToVerifiedLogin = () => {
    const query = new URLSearchParams({ verify: "true" });
    if (email) query.set("email", email);
    navigate(`/login?${query.toString()}`, { replace: true });
  };

  useEffect(() => {
    dispatch(clearAuthMessages());
  }, [dispatch]);

  useEffect(() => {
    if (!hasVerificationParams || hasTriggeredVerification.current) return;
    hasTriggeredVerification.current = true;
    dispatch(verifyAccount({ email, code }));
  }, [code, dispatch, email, hasVerificationParams]);

  useEffect(() => {
    if (!hasVerificationParams) return;
    if (verifyStatus !== "succeeded") return;
    redirectToVerifiedLogin();
  }, [hasVerificationParams, verifyStatus]);

  return (
    <SignInPage
      onSubmit={(data) => dispatch(signIn(data))}
      onSwitchToSignUp={() => navigate("/signup")}
      onForgotPassword={() => navigate("/forgot-password")}
      isLoading={signInStatus === "loading" || (hasVerificationParams && verifyStatus === "loading")}
      errorMessage={error}
      initialEmail={email}
      successMessage={
        signedOut
          ? "You have been signed out successfully."
          : verifyFlag
            ? "Account verified successfully. You can sign in now."
            : verifySent
              ? "Verification email sent. Please check your inbox and then sign in."
              : null
      }
    />
  );
};

const SignUpRoute: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const code = searchParams.get("code") || "";
  const invitationId = searchParams.get("invitation") || searchParams.get("invitationId");
  const hasVerificationParams = Boolean(email && code);
  const hasTriggeredVerification = useRef(false);
  const hasTriggeredInvitationLookup = useRef(false);
  const [lastSubmittedEmail, setLastSubmittedEmail] = useState("");

  const { signUpStatus, verifyStatus, signUpMessage, verifyMessage, error } = useAppSelector((state) => state.auth);
  const {
    invitation,
    invitationStatus,
    error: invitationSliceError
  } = useAppSelector((state) => state.team);

  useEffect(() => {
    dispatch(clearAuthMessages());
  }, [dispatch]);

  useEffect(() => {
    if (!hasVerificationParams || hasTriggeredVerification.current) return;
    hasTriggeredVerification.current = true;
    dispatch(verifyAccount({ email, code }));
  }, [code, dispatch, email, hasVerificationParams]);

  useEffect(() => {
    if (!invitationId) {
      hasTriggeredInvitationLookup.current = false;
      dispatch(clearInvitation());
      return;
    }
    if (hasTriggeredInvitationLookup.current) return;
    dispatch(clearInvitation());
    hasTriggeredInvitationLookup.current = true;
    console.log("[SignUp Route] invitationId from URL", invitationId);
    dispatch(getInvitationById(invitationId));
  }, [dispatch, invitationId]);

  useEffect(() => {
    if (signUpStatus !== "succeeded") return;
    const query = new URLSearchParams({ verifySent: "1" });
    if (lastSubmittedEmail) query.set("email", lastSubmittedEmail);
    navigate(`/login?${query.toString()}`, { replace: true });
  }, [lastSubmittedEmail, navigate, signUpStatus]);

  const computedSuccessMessage = verifyMessage || signUpMessage;
  const isLoading = signUpStatus === "loading" || verifyStatus === "loading";

  return (
    <SignUpPage
      onSubmit={(data) => {
        setLastSubmittedEmail(data.email);
        dispatch(signUp(data));
      }}
      onSwitchToSignIn={() => navigate("/login")}
      isLoading={isLoading}
      errorMessage={error}
      successMessage={computedSuccessMessage}
      initialEmail={email}
      invitationId={invitationId}
      invitationEmail={invitation?.email}
      invitationRole={invitation?.role}
      invitationLoading={invitationStatus === "loading"}
      invitationError={invitationStatus === "failed" ? invitationSliceError : null}
    />
  );
};

const ForgotPasswordRoute: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const resetId = searchParams.get("id") || "";
  const [lastForgotEmail, setLastForgotEmail] = useState("");

  const hasResetParams = Boolean(resetId.trim());

  const { forgotStatus, forgotMessage, resetStatus, resetMessage, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearAuthMessages());
  }, [dispatch]);

  if (hasResetParams) {
    return (
      <ResetPasswordPage
        idFromUrl={resetId}
        onSubmit={(data) => dispatch(resetPassword(data))}
        onBackToSignIn={() => navigate("/login")}
        isLoading={resetStatus === "loading"}
        successMessage={resetStatus === "succeeded" ? resetMessage : null}
        errorMessage={error}
      />
    );
  }

  return (
    <ForgotPasswordPage
      onSubmit={(data) => {
        setLastForgotEmail(data.email);
        dispatch(forgotPassword(data));
      }}
      onBackToSignIn={() => {
        const prefillEmail = lastForgotEmail || email;
        navigate(buildLoginPathWithEmail(prefillEmail));
      }}
      isLoading={forgotStatus === "loading"}
      isSubmitted={forgotStatus === "succeeded"}
      successMessage={forgotMessage}
      errorMessage={error}
      initialEmail={email}
    />
  );
};

const ResetPasswordRoute: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id") || "";

  const { resetStatus, resetMessage, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearAuthMessages());
  }, [dispatch]);

  return (
    <ResetPasswordPage
      idFromUrl={id}
      onSubmit={(data) => dispatch(resetPassword(data))}
      onBackToSignIn={() => navigate("/login")}
      isLoading={resetStatus === "loading"}
      successMessage={resetStatus === "succeeded" ? resetMessage : null}
      errorMessage={error}
    />
  );
};

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<SignInRoute />} />
          <Route path="/sign-up" element={<Navigate to="/signup" replace />} />
          <Route path="/signup" element={<SignUpRoute />} />
          <Route path="/forgot-password" element={<ForgotPasswordRoute />} />
          <Route path="/reset-password" element={<ResetPasswordRoute />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<App />} />
        </Route>

        <Route path="*" element={<CatchAllRedirect />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
