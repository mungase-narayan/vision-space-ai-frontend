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
    // Local tab name generation since AI server exposes only /chat
    (async () => {
      const chats = Array.isArray(data?.chat) ? data.chat : [];
      const lastUser = [...chats]
        .reverse()
        .find((c) => c?.role === "user" && typeof c?.content === "string");
      const raw = lastUser?.content || "New Chat";
      const firstSentence = raw.split(/[\.!?\n]/)[0] || raw;
      const words = firstSentence.trim().split(/\s+/).slice(0, 8).join(" ");
      const title = words
        .replace(/\s+/g, " ")
        .trim()
        .replace(/^.{1}/, (c) => c.toUpperCase());
      return { data: { response: title || "New Chat" } };
    })(),
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
