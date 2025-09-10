import { Outlet } from "react-router-dom";

import { useGetConfig } from "@/hooks";
import { AppContext } from "@/providers/app-provider";

const AppWrapper = () => {
  const { config, refetch: refetchConfig } = useGetConfig();
  return (
    <AppContext.Provider value={{ refetchConfig, ...config }}>
      <Outlet />
    </AppContext.Provider>
  );
};

export default AppWrapper;
