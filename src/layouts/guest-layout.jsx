import React from "react";
import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/hooks";
import { SiteHeader } from "@/components";

const GuestLayout = () => {
  const { isAuth } = useAuth();
  if (isAuth) return <Navigate to={`/chats`} />;

  return (
    <div className="border-grid flex flex-1 flex-col min-h-screen">
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  );
};

export default GuestLayout;
