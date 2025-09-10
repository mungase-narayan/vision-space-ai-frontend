import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { setAuth } from "@/store/slices/auth-slice";

import apis from "../../apis";

const useSignIn = () => {
  const dispatch = useDispatch();

  const { isPending, mutate, data } = useMutation({
    mutationFn: ({ data }) => apis.login({ data }),
    onSuccess: ({ data: response }) => {
      toast.success("You have successfully logged in");

      dispatch(
        setAuth({
          user: response.data.user,
          authToken: response.data.token,
        })
      );
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message);
    },
    retry: false,
  });

  return { isLoading: isPending, mutate, data };
};

export default useSignIn;
