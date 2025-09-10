import request from "@/lib/request";
import urls from "./urls";

const apis = {
  getUsers: ({ authToken, params }) =>
    request({ method: "GET", params, url: urls.getUsers, authToken }),
  inviteUser: ({ authToken, data }) =>
    request({ method: "POST", data, url: urls.inviteUser, authToken }),
  changeStatus: ({ authToken, data }) =>
    request({ method: "PATCH", data, url: urls.changeStatus, authToken }),
  deleteUser: ({ authToken, data }) =>
    request({ method: "DELETE", data, url: urls.deleteUser, authToken }),
  getUserHistory: ({ authToken, params }) =>
    request({ method: "GET", params, url: urls.adminUrls, authToken }),
};

export default apis;
