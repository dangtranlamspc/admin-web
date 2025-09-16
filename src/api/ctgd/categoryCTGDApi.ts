import axiosClient from "../axiosClient";

export const getCategory = (params?: any) => axiosClient.get("/categoryCTGD", {params})

export const createCategory = (data : {name : string, description?: string}) => axiosClient.post("/categoryCTGD", data);

export const updateCategory = (id : string, data : {name : string; description?: string}) => axiosClient.put(`/categoryCTGD/${id}`, data);

export const deleteCategory = (id : string) => axiosClient.delete(`/categoryCTGD/${id}`);