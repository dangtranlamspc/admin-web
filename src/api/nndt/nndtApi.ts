import axiosClient from "../axiosClient";


const token = () => localStorage.getItem("token") ?? "";

interface ProductUpdateData {
  name: string;
  description?: string;
  categorynndt?: string;
}

const authHeaders = (isMultipart = false) => ({
  Authorization: `Bearer ${token()}`,
  ...(isMultipart ? { "Content-Type": "multipart/form-data" } : {}),
});

export type PagedProducts = {
  products: any[];
  total: number;
  page?: number;
};

export async function getProducts(
  page: number,
  pageSize: number,
  searchText?: string,
  categorynndtId: string | null = null,
) {
  const params: any = {
    page,
    pageSize
  };

  if (searchText) params.searchText = searchText;
  if (categorynndtId) params.categorynndt = categorynndtId; // ✅ thêm filter category

  const res = await axiosClient.get("/nndt", { params });
  return res.data;
}

export const getCategories = async (): Promise<any[]> => {
  const res = await axiosClient.get('/categoryNNDT/', { headers: authHeaders() });
  return res.data;
};

export const getProductById = async (id: string): Promise<any> => {
  const res = await axiosClient.get(`/nndt/${id}`, { headers: authHeaders() });
  return res.data;
};

export const createProduct = async (formData: FormData): Promise<any> => {
  const res = await axiosClient.post('/nndt/', formData, { headers: authHeaders(true) });
  return res.data;
};

// <-- CHÚ Ý: formData có thể là null => hàm xử lý cập nhật khi không thay đổi ảnh
export const updateProduct = async (id: string, data: FormData | ProductUpdateData): Promise<any> => {
  if (data === null) {
    // Gọi API PUT không multipart (không gửi ảnh mới) — backend giữ ảnh cũ theo logic của bạn
    const res = await axiosClient.put(`/nndt/${id}`, {}, { headers: authHeaders(false) });
    return res.data;
  } else {
    const res = await axiosClient.put(`/nndt/${id}`, data, { headers: authHeaders(true) });
    return res.data;
  }
};

export const deleteProduct = async (id: string): Promise<any> => {
  const res = await axiosClient.delete(`/nndt/${id}`, { headers: authHeaders() });
  return res.data;
};
