import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/hooks";
import { QUERY } from "@/constants";

import apis from "../apis";

const useGetChat = ({ aiConversationId }) => {
  const { authToken } = useAuth();
  const [searchParams] = useSearchParams();
  const forCreating = searchParams.get("forCreating") === "true";

  const {
    refetch,
    isPending,
    data: response,
  } = useQuery({
    queryKey: [QUERY.AI_CONVERSATION.GET_CONVERSATION, aiConversationId],
    queryFn: () => {
      if (forCreating) return null;
      return apis.getChat({ authToken, params: { aiConversationId } });
    },
    throwOnError: (error) => {
      toast.error(error?.response?.data?.message);
    },
    retry: false,
  });

  return {
    refetchChat: refetch,
    isPending,
    chat: response?.data?.data,
  };
};

export default useGetChat;
