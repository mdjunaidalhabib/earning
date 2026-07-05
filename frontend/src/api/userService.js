import axiosInstance from "./axiosInstance";

export const userService = {
  getDashboardSummary: () => axiosInstance.get("/users/dashboard-summary"),
  getTransactions: (params) => axiosInstance.get("/users/transactions", { params }),
  getReferrals: () => axiosInstance.get("/users/referrals"),
  updateProfile: (payload) => axiosInstance.patch("/users/profile", payload),
};
