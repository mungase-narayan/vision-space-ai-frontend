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
  getConversations: ({ authToken }) =>
    request({
      authToken,
      method: "GET",
      url: urls.allConversations,
    }),
  getConversation: ({ authToken, params }) =>
    request({
      params,
      authToken,
      method: "GET",
      url: urls.aiConversationBaseUrl,
    }),
  createConversation: ({ authToken, data }) =>
    request({
      data,
      authToken,
      method: "POST",
      url: urls.aiConversationBaseUrl,
    }),
  updateConversation: ({ authToken, data }) =>
    request({
      data,
      authToken,
      method: "PUT",
      url: urls.aiConversationBaseUrl,
    }),
  deleteConversation: ({ authToken, data }) =>
    request({
      data,
      authToken,
      method: "DELETE",
      url: urls.aiConversationBaseUrl,
    }),
};

export default apis;
