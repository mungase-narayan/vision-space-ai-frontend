import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

import { useAuth } from "@/hooks";

import apis from "../../home/apis";

const useUpdateConversation = ({ callAfterSuccess }) => {
  const { authToken } = useAuth();
  const { mutate, isPending } = useMutation({
    mutationFn: ({ data }) => apis.updateConversation({ authToken, data }),
    onError: (error) => {
      toast.error(error?.response?.data?.message);
    },
    onSuccess: () => {
      callAfterSuccess();
    },
    retry: false,
  });

  return {
    updateConversation: mutate,
    isPending,
  };
};

export default useUpdateConversation;
