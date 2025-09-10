import request from "@/lib/request";

import urls from "./urls";

const apis = {
  login: ({ data }) =>
    request({
      method: "POST",
      url: urls.login,
      data,
    }),
  register: ({ data }) =>
    request({
      method: "POST",
      url: urls.register,
      data,
    }),
  verifyEmailAndCreatePassword: ({ data }) =>
    request({
      method: "POST",
      url: urls.verifyEmailAndCreatePassword,
      data,
    }),
  forgotPassword: ({ data }) =>
    request({
      method: "POST",
      url: urls.forgotPassword,
      data,
    }),
  resetPassword: ({ data }) =>
    request({
      method: "POST",
      url: urls.resetPassword,
      data,
    }),

  getSelf: ({ data }) =>
    request({
      method: "POST",
      url: urls.getSelf,
      data,
    }),
  verifyEmail: ({ data }) =>
    request({
      method: "POST",
      url: urls.verifyEmail,
      data,
    }),
};

export default apis;
