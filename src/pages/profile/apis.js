import request from "@/lib/request";

import urls from "./urls";

const apis = {
  getSummary: ({ authToken }) =>
    request({
      method: "GET",
      url: urls.summaryBaseUrl,
      authToken,
    }),
  updateSummary: ({ authToken, data }) =>
    request({
      method: "PUT",
      url: urls.summaryBaseUrl,
      authToken,
      data,
    }),
};

export default apis;
