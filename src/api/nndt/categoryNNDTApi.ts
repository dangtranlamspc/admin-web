import axiosClient from "../axiosClient";

export const getCategoryNNDT = (params?: any) => axiosClient.get("/categoryNNDT", {params})

export const createCategoryNNDT = (data : {name : string, description?: string}) => axiosClient.post("/categoryNNDT", data);

export const updateCategoryNNDT = (id : string, data : {name : string; description?: string}) => axiosClient.put(`/categoryNNDT/${id}`, data);

export const deleteCategoryNNDT = (id : string) => axiosClient.delete(`/categoryNNDT/${id}`);