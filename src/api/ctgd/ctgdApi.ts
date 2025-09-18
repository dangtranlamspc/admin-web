import axiosClient from "../axiosClient";


const token = () => localStorage.getItem("token") ?? "";

interface ProductUpdateData {
  name: string;
  description?: string;
  categoryctgd?: string;
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
  categoryctgdId: string | null = null,
) {
  const params: any = {
    page,
    pageSize
  };

  if (searchText) params.search = searchText;
  if (categoryctgdId) params.categoryctgd = categoryctgdId; // ✅ thêm filter category

  const res = await axiosClient.get("/ctgds", { params });
  return res.data;
}

export const getCategories = async (): Promise<any[]> => {
  const res = await axiosClient.get('/categoryCTGD', { headers: authHeaders() });
  return res.data;
};

export const getProductById = async (id: string): Promise<any> => {
  const res = await axiosClient.get(`/ctgds/${id}`, { headers: authHeaders() });
  return res.data;
};

export const createProduct = async (formData: FormData): Promise<any> => {
  const res = await axiosClient.post('/ctgds', formData, { headers: authHeaders(true) });
  return res.data;
};

// <-- CHÚ Ý: formData có thể là null => hàm xử lý cập nhật khi không thay đổi ảnh
export const updateProduct = async (id: string, data: FormData | ProductUpdateData): Promise<any> => {
  if (data === null) {
    // Gọi API PUT không multipart (không gửi ảnh mới) — backend giữ ảnh cũ theo logic của bạn
    const res = await axiosClient.put(`/ctgds/${id}`, {}, { headers: authHeaders(false) });
    return res.data;
  } else {
    const res = await axiosClient.put(`/ctgds/${id}`, data, { headers: authHeaders(true) });
    return res.data;
  }
};

export const deleteProduct = async (id: string): Promise<any> => {
  const res = await axiosClient.delete(`/ctgds/${id}`, { headers: authHeaders() });
  return res.data;
};
