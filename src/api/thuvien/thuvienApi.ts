import axiosClient from "../axiosClient";

export interface ThuVien {
  _id?: string;
  title: string;
  videoId: string;
  categoryThuVien?: string | { _id: string; name: string };
  createdAt?: string;
  creatorId?: string;
  isActive?: boolean;
  isMoi?: boolean;
}


export async function getListThuVien(
  page: number,
  pageSize: number,
  searchTerm?: string,
  categoryThuVienId: string | null = null
) {
  const params: any = {
    page,
    pageSize,
  };
  if (searchTerm && searchTerm.trim()) {
    params.search = searchTerm.trim();
  }
  if (categoryThuVienId) params.categoryThuVien = categoryThuVienId;
  const res = await axiosClient.get("/thuvien", { params });
  return res.data;
}

export const getListThuVienById = async (id: string): Promise<ThuVien> => {
  const { data } = await axiosClient.get(`/thuvien/${id}`);
  return data;
};

export const createListThuVien = async (payload: ThuVien): Promise<any> => {
  const { data } = await axiosClient.post('/thuvien', payload);
  return data;
};

export const updateListThuVien = async (
  id: string,
  payload: FormData | Partial<ThuVien>
): Promise<ThuVien> => {
  // nếu là FormData, axios sẽ tự set multipart
  const { data } = await axiosClient.put(`/thuvien/${id}`, payload as any);
  return data;
};

export const deleteListThuVien = async (id: string): Promise<void> => {
  await axiosClient.delete(`/thuvien/${id}`);
};

export const getCategoriesThuVien = async () => {
  const res = await axiosClient.get("/catthuvien/");
  return res.data;
};
