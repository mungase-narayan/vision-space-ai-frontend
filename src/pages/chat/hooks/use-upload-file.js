import { toast } from "sonner";
import { useAuth } from "@/hooks";
import { useMutation } from "@tanstack/react-query";

import apis from "../apis";

const useUploadFile = () => {
  const { authToken } = useAuth();
  const { mutateAsync } = useMutation({
    mutationFn: ({ data }) => apis.uploadFile({ authToken, data }),
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Error while uploading file"
      );
    },
    retry: false,
  });

  return { uploadFile: mutateAsync };
};

export default useUploadFile;
