import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { URLS } from "@/constants";

const AuthenticationStrategy = () => {
  const handleOnClick = () => {
    window.open(URLS.GOOGLE_CALLBACK_URL, "_self");
  };

  return (
    <>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button variant="outline" type="button" onClick={() => handleOnClick()}>
        <FcGoogle className="mr-2 size-4" />
        Google
      </Button>
    </>
  );
};

export default AuthenticationStrategy;
