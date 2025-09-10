import { useAuth, useLogout } from "@/hooks";
import { LogOut } from "lucide-react";
import React from "react";

const LogOutButton = ({ isText }) => {
  const { isAuth } = useAuth();
  const { logout } = useLogout();

  if (!isAuth) return null;

  if (!isText)
    return (
      <button
        onClick={logout}
        className="cursor-pointer hover:text-muted-foreground"
      >
        <LogOut className="size-4" />
      </button>
    );

  return (
    <button
      onClick={logout}
      className="hover:text-primary cursor-pointer transition-all space-x-2 flex items-center text-muted-foreground w-full px-3 py-1"
    >
      <LogOut className="size-4" />
      {isText && <span className="text-sm">Logout</span>}
    </button>
  );
};

export default LogOutButton;
