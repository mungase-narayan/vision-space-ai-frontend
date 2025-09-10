import { CreatePasswordIcon } from "@/components/icons";
import { URLS } from "@/constants";
import { useUpdateDocumentTitle } from "@/hooks";

import ResetPasswordForm from "./components/reset-password-form";

const ResetPassword = () => {
  useUpdateDocumentTitle({
    title: `Reset Password - ${URLS.LOGO_TEXT}`,
  });

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="container mx-auto pb-8">
        <div className="container relative flex-col items-center justify-center p-0 md:grid lg:max-w-none lg:grid-cols-2">
          <div className="relative hidden h-full flex-col rounded-l-2xl border-r lg:flex lg:p-5">
            <CreatePasswordIcon className="size-full" />
          </div>
          <div className="lg:p-5">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
              <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Reset Password
                </h1>
                <p className="text-sm text-muted-foreground">
                  Enter your secure password below to reset you password
                </p>
              </div>
              <ResetPasswordForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
