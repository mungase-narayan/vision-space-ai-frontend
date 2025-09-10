import React from "react";
import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/hooks";

const ChatLayout = () => {
  const { isAuth } = useAuth();
  if (!isAuth) return <Navigate to="/" />;

  return <Outlet />;
};

export default ChatLayout;
