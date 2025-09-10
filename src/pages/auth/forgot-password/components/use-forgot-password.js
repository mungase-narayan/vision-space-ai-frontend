import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import apis from "../../apis";

const useForgotPassword = () => {
  const navigate = useNavigate();
  const { isPending, mutate, data } = useMutation({
    mutationFn: ({ data }) => apis.forgotPassword({ data }),
    onSuccess: ({ data }) => {
      toast(data?.message);
      navigate(`/guidance/verification?email=${data?.data?.email}`);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message);
    },
    retry: false,
  });

  return { isLoading: isPending, mutate, data };
};

export default useForgotPassword;
