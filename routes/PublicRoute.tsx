import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";

import { bootstrapAuth } from "../store/actions/authActions";
import { useAppDispatch } from "../store/hooks";
import { useAppSelector } from "../store/hooks";

const PublicRoute: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, bootstrapStatus } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (bootstrapStatus !== "idle") return;
    dispatch(bootstrapAuth());
  }, [bootstrapStatus, dispatch]);

  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  if (bootstrapStatus === "loading" || bootstrapStatus === "idle") {
    return <div className="min-h-screen bg-gray-50" />;
  }

  return <Outlet />;
};

export default PublicRoute;
