import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

import { useAuth } from "@/hooks";

import apis from "../../home/apis";

const useUpdateConversation = ({ fn }) => {
  const { authToken } = useAuth();
  const { mutate, mutateAsync, isPending } = useMutation({
    mutationFn: ({ data }) => apis.updateConversation({ authToken, data }),
    onError: (error) => {
      toast.error(error?.response?.data?.message);
    },
    onSuccess: () => fn(),
    retry: false,
  });

  return {
    updateConversation: mutate,
    updateConversationAsync: mutateAsync,
    isPending,
  };
};

export default useUpdateConversation;
