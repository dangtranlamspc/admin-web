import axiosClient from "./axiosClient";

export const getCategoriesBSCT = (params?: any) => axiosClient.get("/categoriesBSCT/", {params})

export const createCategoryBSCT = (data : {name : string, description?: string}) => axiosClient.post("/categoriesBSCT/", data);

export const updateCategoryBSCT = (id : string, data : {name : string; description?: string}) => axiosClient.put(`/categoriesBSCT/${id}`, data);

export const deleteCategoryBSCT = (id : string) => axiosClient.delete(`/categoriesBSCT/${id}`);