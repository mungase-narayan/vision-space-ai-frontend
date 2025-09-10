import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

import { useAuth } from "@/hooks";
import apis from "../apis";

const useMutedGetChat = () => {
  const { authToken } = useAuth();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({ aiConversationId }) =>
      apis.getChat({ authToken, params: { aiConversationId } }),
    onError: (error) => toast.error(error?.response?.data?.message),
    retry: false,
  });

  return {
    getChat: mutateAsync,
    isPending,
  };
};

export default useMutedGetChat;
