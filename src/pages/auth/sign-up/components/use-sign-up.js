import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import apis from "../../apis";

const useSignUp = () => {
  const navigate = useNavigate();

  const { isPending, mutate, data } = useMutation({
    mutationFn: ({ data }) => apis.register({ data }),
    onSuccess: () => {
      toast.success("Regiter successfully");
      navigate('/auth/sign-in');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message);
    },
    retry: false,
  });

  return { isLoading: isPending, mutate, data };
};

export default useSignUp;
