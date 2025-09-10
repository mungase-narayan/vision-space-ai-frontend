import { SiteHeader } from "@/components";
import useAuth from "@/hooks/use-auth";
import { Navigate, Outlet } from "react-router-dom";

const AuthLayout = () => {
  const { isAuth } = useAuth();
  if (isAuth) return <Navigate to="/" />;
  return (
    <div className="border-grid flex flex-1 flex-col min-h-screen">
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
