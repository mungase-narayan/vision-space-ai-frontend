import React from "react";
import { Navigate } from "react-router-dom";

import { useAuth, useUpdateDocumentTitle } from "@/hooks";
import { URLS } from "@/constants";

import MapsDashboard from "./index";

const MapsLayout = () => {
  useUpdateDocumentTitle({ title: `Maps - ${URLS.LOGO_TEXT}` });
  const { isAuth } = useAuth();

  if (!isAuth) return <Navigate to="/" />;

  return <MapsDashboard />;
};

export default MapsLayout;