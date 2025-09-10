import request, { aiRequest } from "@/lib/request";

import urls from "./urls";

const apis = {
  conversation: ({ data }) =>
    aiRequest({
      method: "POST",
      url: urls.conversation,
      data,
    }),
  stopConversation: ({ data }) =>
    aiRequest({
      method: "POST",
      url: urls.stopConversation,
      data,
    }),
  getModelList: () =>
    aiRequest({
      method: "GET",
      url: urls.getModelList,
    }),
  getChats: ({ authToken, params }) =>
    request({
      authToken,
      method: "GET",
      url: urls.allConversations,
      params,
    }),
  getChat: ({ authToken, params }) =>
    request({
      params,
      authToken,
      method: "GET",
      url: urls.aiConversationBaseUrl,
    }),
  createChat: ({ authToken, data }) =>
    request({
      data,
      authToken,
      method: "POST",
      url: urls.aiConversationBaseUrl,
    }),
  updateChat: ({ authToken, data }) =>
    request({
      data,
      authToken,
      method: "PUT",
      url: urls.aiConversationBaseUrl,
    }),
  deleteChat: ({ authToken, data }) =>
    request({
      data,
      authToken,
      method: "DELETE",
      url: urls.aiConversationBaseUrl,
    }),
  uploadFile: ({ authToken, data }) =>
    request({
      data,
      authToken,
      method: "POST",
      url: urls.uploadFile,
      isFormData: true,
    }),
  pinUnpinChat: ({ authToken, data }) =>
    request({
      data,
      authToken,
      method: "POST",
      url: urls.pinUnpinChat,
    }),
  generateTabName: ({ authToken, data }) =>
    aiRequest({
      data,
      authToken,
      method: "POST",
      url: urls.generateTabName,
    }),
  getImageModelList: () =>
    aiRequest({
      method: "GET",
      url: urls.getImageModelList,
    }),
  getProject: ({ params, authToken }) =>
    request({ method: "GET", authToken, params, url: urls.projectBaseUrl }),
  createProject: ({ data, authToken }) =>
    request({ method: "POST", authToken, data, url: urls.projectBaseUrl }),
  updateProject: ({ data, authToken }) =>
    request({ method: "PATCH", authToken, data, url: urls.projectBaseUrl }),
  deleteProject: ({ data, authToken }) =>
    request({ method: "DELETE", authToken, data, url: urls.projectBaseUrl }),
  getAllProjects: ({ authToken }) =>
    request({ method: "GET", authToken, url: urls.getAllProjects }),
  shareProject: ({ authToken, data }) =>
    request({ method: "POST", authToken, url: urls.shareProject, data }),

  shareChat: ({ authToken, data }) =>
    request({ method: "POST", authToken, url: urls.shareChat, data }),
  getStats: ({ authToken }) =>
    request({ method: "GET", authToken, url: urls.getStatistics }),
};

export default apis;
