import request from "@/lib/request";
import urls from "./urls";

const apis = {
  get: ({ params, authToken }) =>
    request({
      method: "GET",
      authToken,
      url: urls.aiModelBaseUrl,
      params,
    }),
  create: ({ data, authToken }) =>
    request({
      method: "POST",
      authToken,
      url: urls.aiModelBaseUrl,
      data,
    }),
  update: ({ data, authToken }) =>
    request({
      method: "PUT",
      authToken,
      url: urls.aiModelBaseUrl,
      data,
    }),
  delete: ({ data, authToken }) =>
    request({
      method: "DELETE",
      authToken,
      url: urls.aiModelBaseUrl,
      data,
    }),
  getModels: ({ authToken }) =>
    request({
      method: "GET",
      url: urls.getAllModels,
      authToken,
    }),
  getConfig: () =>
    request({
      method: "GET",
      url: urls.configBaseUrl,
    }),
  updateConfig: ({ data, authToken }) =>
    request({
      method: "PUT",
      url: urls.configBaseUrl,
      data,
      authToken,
    }),
};

export default apis;
