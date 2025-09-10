import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

import { useAuth } from "@/hooks";

import apis from "../../home/apis";

const useDeleteConversation = ({ callAfterSuccess }) => {
  const { authToken } = useAuth();
  const { mutate, isPending } = useMutation({
    mutationFn: ({ data }) => apis.deleteConversation({ authToken, data }),
    onSuccess: () => {
      toast.success("Conversation deleted successfully");
      callAfterSuccess();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message);
    },
    retry: false,
  });

  return {
    deleteConversation: mutate,
    isPending,
  };
};

export default useDeleteConversation;
