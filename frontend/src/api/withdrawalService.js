import axiosInstance from "./axiosInstance";

export const withdrawalService = {
  create: (payload) => axiosInstance.post("/withdrawals", payload),
  getMine: (params) => axiosInstance.get("/withdrawals", { params }),
  cancel: (id) => axiosInstance.patch(`/withdrawals/${id}/cancel`),
};
