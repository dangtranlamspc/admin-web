import axiosClient from "../axiosClient";

export const getCategoriesThuVien = (params?: any) => axiosClient.get("/catthuvien/", {params})

export const createCategoryThuVien = (data : {name : string, description?: string}) => axiosClient.post("/catthuvien/", data);

export const updateCategoryThuVien = (id : string, data : {name : string; description?: string}) => axiosClient.put(`/catthuvien/${id}`, data);

export const deleteCategoryThuVien = (id : string) => axiosClient.delete(`/catthuvien/${id}`);