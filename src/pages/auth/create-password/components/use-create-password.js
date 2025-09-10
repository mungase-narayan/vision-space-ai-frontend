import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";

import { setAuth } from "@/store/slices/auth-slice";

import apis from "../../apis";

const useCreatePassoword = () => {
  const dispatch = useDispatch();

  const { isPending, mutate, data } = useMutation({
    mutationFn: ({ data }) => apis.verifyEmailAndCreatePassword({ data }),
    onSuccess: ({ data: response }) => {
      toast(response?.message);
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

export default useCreatePassoword;
