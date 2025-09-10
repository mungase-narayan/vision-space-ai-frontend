import { URLS } from "@/constants";
import axios from "axios";

import store from "@/store";
import { logout } from "@/store/slices/auth-slice";

export const performLogout = () => {
  store.dispatch(logout());
  window.location.href = "/";
};

const axiosInstance = axios.create({
  baseURL: URLS.BASE_URL,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      performLogout();
    }
    return Promise.reject(error);
  }
);

export const aiRequest = ({
  method = "GET",
  authToken = null,
  data = {},
  params = null,
  url,
  isFormData = false,
}) => {
  return axios({
    baseURL: URLS.AI_BASE_URL,
    method,
    headers: {
      "Content-Type": isFormData ? "multipart/form-data" : "application/json",
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
    },
    data,
    params,
    url,
  });
};

const request = ({
  method = "GET",
  authToken = null,
  data = {},
  params = null,
  url,
  isFormData = false,
}) => {
  return axiosInstance({
    baseURL: URLS.BASE_URL,
    method,
    headers: {
      "Content-Type": isFormData ? "multipart/form-data" : "application/json",
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
    },
    data,
    params,
    url,
  });
};

export const validateKey = ({ data }) => {
  return axios({
    baseURL: `${URLS.AI_BASE_URL}/validate-key`,
    method: "POST",
    data,
  });
};

export default request;
