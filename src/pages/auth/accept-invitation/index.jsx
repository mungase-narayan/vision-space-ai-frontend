import { toast } from "sonner";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useMutation } from "@tanstack/react-query";

import { Loader } from "@/components";
import { setAuth } from "@/store/slices/auth-slice";

import apis from "../apis";

const AcceptInvitation = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const dispatch = useDispatch();

  const { mutate } = useMutation({
    mutationFn: ({ data }) => apis.verifyEmail({ data }),
    onSuccess: ({ data }) => {
      dispatch(
        setAuth({
          user: data.data.user,
          authToken: data.data.token,
        })
      );
      toast.success("You have successfully logged in");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message);
    },
    retry: false,
  });

  useEffect(() => {
    if (token) mutate({ data: { token } });
  }, [token]);

  return (
    <div className="flex items-center justify-center h-screen flex-col">
      <Loader />
      <span className="text-sm text-muted-foreground">Verifying email...</span>
    </div>
  );
};

export default AcceptInvitation;
