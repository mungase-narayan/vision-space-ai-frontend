import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/hooks";
import { QUERY } from "@/constants";

import apis from "../../home/apis";
import { useSearchParams } from "react-router-dom";

const useGetConversation = ({ aiConversationId }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { authToken } = useAuth();

  const {
    refetch,
    isPending,
    data: response,
  } = useQuery({
    queryKey: [QUERY.AI_CONVERSATION.GET_CONVERSATION, aiConversationId],
    queryFn: () => {
      if (searchParams.get("forCreating") === "true") return null;
      return apis.getConversation({ authToken, params: { aiConversationId } });
    },
    throwOnError: (error) => {
      toast.error(error?.response?.data?.message);
    },
    retry: false,
  });

  return {
    refetchConversation: refetch,
    isPending,
    aiConversation: response?.data?.data,
  };
};

export default useGetConversation;
