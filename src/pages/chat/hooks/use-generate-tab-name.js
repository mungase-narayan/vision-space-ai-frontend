import { useAuth } from "@/hooks";
import { useMutation } from "@tanstack/react-query";

import apis from "../apis";

const useGenerateTabName = ({ fn }) => {
  const { authToken } = useAuth();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({ data }) => apis.generateTabName({ data, authToken }),
    onSuccess: () => fn(),
    retry: false,
  });
  return { generateTabName: mutateAsync, isPending };
};

export default useGenerateTabName;
