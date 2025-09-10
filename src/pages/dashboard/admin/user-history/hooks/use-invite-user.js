import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAuth } from "@/hooks";
import apis from "../apis";

const useInviteUser = ({ fn }) => {
  const { authToken } = useAuth();

  const { mutate: inviteUser, isPending } = useMutation({
    mutationFn: ({ data }) => apis.inviteUser({ authToken, data }),
    onSuccess: () => {
      toast.success("User invited successfully");
      fn();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message);
    },
    retry: false,
  });

  return { inviteUser, isPending };
};

export default useInviteUser;
