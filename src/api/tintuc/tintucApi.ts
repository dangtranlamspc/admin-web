import axiosClient from "../axiosClient";

export interface TinTuc {
  _id?: string;
  title: string;
  summary: string;
  description: string; // HTML từ CKEditor
  images?: string; // URL (1 ảnh)
  categoryTinTuc?: string | { _id: string; name: string };
  createdAt?: string;
  creatorId?: string;
  isActive?: boolean;
  isMoi?: boolean;
}

export async function getListTinTuc(
  page: number,
  pageSize: number,
  searchTerm?: string,
  categoryTinTucId: string | null = null
) {
  const params: any = {
    page,
    pageSize,
  };
  if (searchTerm && searchTerm.trim()) {
    params.search = searchTerm.trim();
  }
  if (categoryTinTucId) params.categoryTinTuc = categoryTinTucId;
  const res = await axiosClient.get("/tintucs", { params });
  return res.data;
}

export const getListTinTucById = async (id: string): Promise<TinTuc> => {
  const { data } = await axiosClient.get(`/tintucs/${id}`);
  return data;
};

export const createListTinTuc = async (payload: FormData): Promise<any> => {
  const { data } = await axiosClient.post('/tintucs', payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updateListTinTuc = async (
  id: string,
  payload: FormData | Partial<TinTuc>
): Promise<TinTuc> => {
  // nếu là FormData, axios sẽ tự set multipart
  if (payload instanceof FormData) {
    const { data } = await axiosClient.put(`/tintucs/${id}`, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } else {
    const { data } = await axiosClient.put(`/tintucs/${id}`, payload);
    return data;
  }
};

export const deleteListTinTuc = async (id: string): Promise<void> => {
  await axiosClient.delete(`/tintucs/${id}`);
};

export const getCategoriesTinTuc = async () => {
  const res = await axiosClient.get("/categoryTinTuc");
  return res.data;
};
