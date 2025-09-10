import React from "react";
import { useAuth } from "@/hooks";
import { Navigate, Outlet } from "react-router-dom";

const CheckUserLayout = () => {
  const { isAuth } = useAuth();
  if (!isAuth) return <Navigate to="/auth/sign-in" replace />;
  return <Outlet />;
};

export default CheckUserLayout;
