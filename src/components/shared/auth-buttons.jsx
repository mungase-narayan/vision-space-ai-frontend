import { useNavigate } from "react-router-dom";

import { useAuth } from "@/hooks";
import { Button } from "@/components/ui/button";

const AuthButtons = () => {
  const { isAuth } = useAuth();
  const navigate = useNavigate();
  const redirect = (url) => navigate(url);

  if (isAuth) return null;

  return (
    <div className="flex items-center justify-center space-x-4">
      <Button
        size="sm"
        variant="outline"
        onClick={() => redirect("/auth/sign-in")}
      >
        Log in
      </Button>
      <Button size="sm" onClick={() => redirect("/auth/sign-up")}>
        Sign up
      </Button>
    </div>
  );
};

export default AuthButtons;
