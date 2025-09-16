import axiosClient from "../axiosClient";

export const getCategories = (params?: any) => axiosClient.get("/categoryTinTuc/", {params})

export const createCategory = (data : {name : string, description?: string}) => axiosClient.post("/categoryTinTuc/", data);

export const updateCategory = (id : string, data : {name : string; description?: string}) => axiosClient.put(`/categoryTinTuc/${id}`, data);

export const deleteCategory = (id : string) => axiosClient.delete(`/categoryTinTuc/${id}`);