import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setAuth } from '@/store/slices/auth-slice';
import { useAuth } from '@/hooks';
import authApis from '@/pages/auth/apis';

const DEV_CREDENTIALS = {
  email: "user@gmail.com",
  password: "Krishna1"
};

const AutoLogin = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuth } = useAuth();

  useEffect(() => {

    if (!isAuth) {

      authApis.login({ data: DEV_CREDENTIALS })
        .then(({ data: response }) => {

          dispatch(setAuth({
            user: response.data.user,
            authToken: response.data.token,
          }));
        })
        .catch((error) => {
          console.error('❌ Auto-login: Failed -', error?.response?.data?.message || error.message);
        });
    }
  }, [isAuth, dispatch]);

  return children;
};

export default AutoLogin;