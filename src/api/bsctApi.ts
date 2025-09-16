import axiosClient from "./axiosClient";

export interface BSCT {
  _id?: string;
  title: string;
  summary: string;
  description: string; // HTML từ CKEditor
  images?: string; // URL (1 ảnh)
  categoryBSCT?: string | { _id: string; name: string };
  createdAt?: string;
  creatorId?: string;
  isActive?: boolean;
  isMoi?: boolean;
}

// export const getListBSCT = async (
//   page:number,
//   pageSize:number,
//   searchText?: string,
//   categoryBSCTId: string | null = null,
// ): Promise<{ page: number; total: number; bscts: BSCT[] }> => {
//     const params: any = {
//     page,
//     pageSize
//   };
//   if (searchText) params.searchText = searchText;
//   if (categoryBSCTId) params.categoryBSCT = categoryBSCTId;
//   // const { data } = await axiosClient.get('/bsct', { params: { page, limit, search } });
//   const res = await axiosClient.get("/bsct", { params });
//   return res.data;
// };

export async function getListBSCT(
  page: number,
  pageSize: number,
  searchTerm?: string,
  categoryBSCTId: string | null = null
) {
  const params: any = {
    page,
    pageSize,
  };
  if (searchTerm && searchTerm.trim()) {
    params.search = searchTerm.trim();
  }
  if (categoryBSCTId) params.categoryBSCT = categoryBSCTId;
  // const { data } = await axiosClient.get('/bsct', { params: { page, limit, search } });
  const res = await axiosClient.get("/bsct", { params });
  return res.data;
}

export const getListBSCTById = async (id: string): Promise<BSCT> => {
  const { data } = await axiosClient.get(`/bsct/${id}`);
  return data;
};

export const createListBSCT = async (payload: FormData): Promise<any> => {
  const { data } = await axiosClient.post(`/bsct`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updateListBSCT = async (
  id: string,
  payload: FormData | Partial<BSCT>
): Promise<BSCT> => {
  // nếu là FormData, axios sẽ tự set multipart
  if (payload instanceof FormData) {
    const { data } = await axiosClient.put(`/bsct/${id}`, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } else {
    const { data } = await axiosClient.put(`/bsct/${id}`, payload);
    return data;
  }
};

export const deleteListBSCT = async (id: string): Promise<void> => {
  await axiosClient.delete(`/bsct/${id}`);
};

export const getCategoriesBSCT = async () => {
  const res = await axiosClient.get("/categoriesBSCT/");
  return res.data;
};
