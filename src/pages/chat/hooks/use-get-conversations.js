import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/hooks";
import { QUERY } from "@/constants";

import apis from "../../home/apis";

const useGetConversations = () => {
  const { authToken } = useAuth();
  const {
    refetch,
    isPending,
    data: response,
  } = useQuery({
    queryKey: [QUERY.AI_CONVERSATION.GET_CONVERSATIONS],
    queryFn: () =>
      apis.getConversations({ authToken, params: { limit: 100, page: 1 } }),
    throwOnError: (error) => {
      toast.error(error?.response?.data?.message);
    },
    retry: false,
  });
  return {
    refetchConversations: refetch,
    isPending,
    aiConversations: response?.data?.data?.chats?.aiConversations || [],
  };
};

export default useGetConversations;
