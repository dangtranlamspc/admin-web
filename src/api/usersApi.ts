import axiosClient from "./axiosClient";
import type { User } from '../types/user';

export const userApi = {
  getAll(params?: { search?: string }) {
    return axiosClient.get<{ data: User[] }>('/auth/', { params })
      .then(res => res.data.data)
  },
  create(data: any) {
    return axiosClient.post("/auth", data, {
      headers: { "Content-Type": "application/json" },
    });
  },
  update(id: string, data: any) {
    return axiosClient.put(`/auth/${id}`, data, {
      headers: { "Content-Type": "application/json" },
    });
  },
  delete(id: string) {
    return axiosClient.delete(`/auth/${id}`);
  },
};