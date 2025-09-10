import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";

import apis from "../apis";

import { toast } from "sonner";
import Loader from "@/components/shared/loader";
import { setAuth } from "@/store/slices/auth-slice";

const VerifyUser = () => {
  const [search] = useSearchParams();
  const token = search.get("token");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data: response, error } = useQuery({
    queryFn: () => apis.getSelf({ data: { token } }),
  });

  if (response?.status === 200) {
    toast("User verified successfully");
    dispatch(
      setAuth({
        user: response?.data?.data?.user,
        authToken: response?.data?.data?.token,
      })
    );
  }

  if (error) {
    toast.error("Error while verifying user");
    navigate("/auth/sign-up");
  }

  return (
    <div className="min-h-screen flex items-center gap-2 justify-center">
      <Loader /> <span>Wait Verifing User!</span>
    </div>
  );
};

export default VerifyUser;
