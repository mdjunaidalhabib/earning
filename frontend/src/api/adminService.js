import axiosInstance from "./axiosInstance";

export const adminService = {
  // Dashboard
  getDashboardStats: () => axiosInstance.get("/admin/dashboard-stats"),

  // Users
  getAllUsers: (params) => axiosInstance.get("/admin/users", { params }),
  getUserById: (id) => axiosInstance.get(`/admin/users/${id}`),
  updateUserStatus: (id, isActive) =>
    axiosInstance.patch(`/admin/users/${id}/status`, { isActive }),

  // Submissions (task earning reviews)
  getPendingSubmissions: (params) => axiosInstance.get("/admin/submissions", { params }),
  reviewSubmission: (id, payload) =>
    axiosInstance.patch(`/admin/submissions/${id}/review`, payload),

  // Tasks
  getAllTasks: (params) => axiosInstance.get("/tasks/admin/all", { params }),
  createTask: (payload) => axiosInstance.post("/tasks", payload),
  updateTask: (id, payload) => axiosInstance.patch(`/tasks/${id}`, payload),
  deleteTask: (id) => axiosInstance.delete(`/tasks/${id}`),

  // Withdrawals
  getAllWithdrawals: (params) => axiosInstance.get("/withdrawals/admin/all", { params }),
  updateWithdrawalStatus: (id, payload) =>
    axiosInstance.patch(`/withdrawals/${id}/status`, payload),
};
