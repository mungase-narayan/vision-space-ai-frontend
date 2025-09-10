import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/hooks";
import { QUERY } from "@/constants";

import apis from "../apis";

const useGetChats = () => {
  const { authToken } = useAuth();

  const {
    refetch,
    isPending,
    data: response,
  } = useQuery({
    queryKey: [QUERY.AI_CONVERSATION.GET_CONVERSATIONS],
    queryFn: () =>
      apis.getChats({
        authToken,
        params: { limit: 100, page: 1 },
      }),
    throwOnError: (error) => {
      toast.error(error?.response?.data?.message);
    },
    retry: false,
  });

  return {
    refetchChats: refetch,
    isPending,
    chats: response?.data?.data?.chats?.aiConversations || [],
    statics: response?.data?.data?.conversationCount || {},
    totalChats: response?.data?.data?.chats?.total || 0,
    messageCount: response?.data?.data?.messageCount || 0,
    chatsCount: response?.data?.data?.chatsCount || 0,
    pinnedConversations:
      response?.data?.data?.pinnedConversations?.aiConversations || [],
  };
};

export default useGetChats;
