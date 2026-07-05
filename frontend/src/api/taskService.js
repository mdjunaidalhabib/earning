import axiosInstance from "./axiosInstance";

export const taskService = {
  getTasks: (params) => axiosInstance.get("/tasks", { params }),
  getTaskById: (id) => axiosInstance.get(`/tasks/${id}`),
  submitTask: (id, payload) => axiosInstance.post(`/tasks/${id}/submit`, payload),
};
