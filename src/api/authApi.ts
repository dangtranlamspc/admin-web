import type { User } from '../types/user';
import axiosClient from './axiosClient';

export const authApi = {
  login: async (email: string, password: string) => {
    // try {
    //   const res = await axiosClient.post('/auth/login', { email, password });
    // // Backend trả về { token, user }
    // const { token, user } = res.data || {};

    // // Lưu token + user vào localStorage
    // if (token && user) {
    //   localStorage.setItem("token", token);
    //   localStorage.setItem("user", JSON.stringify(user));
    //   return {token, user}
    // } else {
    //   console.warn("Dữ liệu trả về từ backend không hợp lệ:", res.data);
    //   localStorage.removeItem("token");
    //   localStorage.removeItem("user");
    //   return null;
    // }
    // } catch (error) {
    //   console.error('Lỗi khi login:', error);
    //   return null;
    // }
    // return user as User
    const res = await axiosClient.post('/auth/login', { email, password });
    const { token, user } = res.data || {};

    if (token && user) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      console.warn("Dữ liệu trả về từ backend không hợp lệ:", res.data);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return user as User;
  },

  getCurrentUser: (): User | null => {
    const userData = localStorage.getItem("user");
    if (!userData || userData === "undefined" || userData === "null") {
      return null;
    }

    try {
      return JSON.parse(userData) as User;
    } catch (error) {
      console.error("Lỗi parse user từ localStorage:", error);
      localStorage.removeItem("user");
      return null;
    }

  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};