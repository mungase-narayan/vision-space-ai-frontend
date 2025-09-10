import { useSelector } from "react-redux";

const useAuth = () => {
  const auth = useSelector((state) => state.auth);
  return {
    user: auth.user,
    authToken: auth.authToken,
    isAuth: auth.isAuth,
    openAIKey: auth.openAIKey,
  };
};

export default useAuth;
