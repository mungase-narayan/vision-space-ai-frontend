import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

import { useAuth } from "@/hooks";
import apis from "../../home/apis";

const useMutedGetConversation = () => {
  const { authToken } = useAuth();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({ aiConversationId }) =>
      apis.getConversation({ authToken, params: { aiConversationId } }),
    onError: (error) => toast.error(error?.response?.data?.message),
    retry: false,
  });

  return {
    getConversation: mutateAsync,
    isPending,
  };
};

export default useMutedGetConversation;
