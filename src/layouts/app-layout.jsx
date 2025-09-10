import { Navigate, Outlet } from "react-router-dom";
import { SiteHeader } from "@/components";
// import { useAuth } from "@/hooks";

const AppLayout = () => {
  // const { isAuth } = useAuth();

  // if (!isAuth) return <Navigate to="/" />;
  return (
    <div className="border-grid flex flex-1 flex-col min-h-screen">
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;
