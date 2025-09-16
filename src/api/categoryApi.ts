import axiosClient from "./axiosClient";

export const getCategories = (params?: any) => axiosClient.get("/categories/", {params})

export const createCategory = (data : {name : string, description?: string}) => axiosClient.post("/categories/", data);

export const updateCategory = (id : string, data : {name : string; description?: string}) => axiosClient.put(`/categories/${id}`, data);

export const deleteCategory = (id : string) => axiosClient.delete(`/categories/${id}`);