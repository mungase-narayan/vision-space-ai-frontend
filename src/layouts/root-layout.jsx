import { Outlet } from "react-router-dom";

const RootLayout = () => {
  return (
    <div data-wrapper="" className="border-border/40 dark:border-border">
      <div className="mx-auto w-full border-border/40 dark:border-border">
        <Outlet />
      </div>
    </div>
  );
};

export default RootLayout;
