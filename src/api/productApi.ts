import axiosClient from "./axiosClient";


const token = () => localStorage.getItem("token") ?? "";

interface ProductUpdateData {
  name: string;
  description?: string;
  category?: string;
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


// export const getProducts = async (page = 1, limit = 10, search = "", categoryId?: string | null): Promise<PagedProducts> => {
//   const res = await axiosClient.get('/product/', {
//     params: { page, limit, search, categoryId},
//       if (categoryId) params.category = categoryId;
//     headers: authHeaders(),
//   });
//   return res.data;
// };

export async function getProducts(
  page: number,
  pageSize: number,
  searchText?: string,
  categoryId: string | null = null,
) {
  const params: any = {
    page,
    pageSize
  };

  if (searchText) params.searchText = searchText;
  if (categoryId) params.category = categoryId; // ✅ thêm filter category

  const res = await axiosClient.get("/product", { params });
  return res.data;
}

export const getCategories = async (): Promise<any[]> => {
  const res = await axiosClient.get('/categories/', { headers: authHeaders() });
  return res.data;
};

export const getProductById = async (id: string): Promise<any> => {
  const res = await axiosClient.get(`/product/${id}`, { headers: authHeaders() });
  return res.data;
};

export const createProduct = async (formData: FormData): Promise<any> => {
  const res = await axiosClient.post('/product/', formData, { headers: authHeaders(true) });
  return res.data;
};

// <-- CHÚ Ý: formData có thể là null => hàm xử lý cập nhật khi không thay đổi ảnh
export const updateProduct = async (id: string, data: FormData | ProductUpdateData): Promise<any> => {
  if (data === null) {
    // Gọi API PUT không multipart (không gửi ảnh mới) — backend giữ ảnh cũ theo logic của bạn
    const res = await axiosClient.put(`/product/${id}`, {}, { headers: authHeaders(false) });
    return res.data;
  } else {
    const res = await axiosClient.put(`/product/${id}`, data, { headers: authHeaders(true) });
    return res.data;
  }
};

export const deleteProduct = async (id: string): Promise<any> => {
  const res = await axiosClient.delete(`/product/${id}`, { headers: authHeaders() });
  return res.data;
};



// export const getProducts = async(page : number = 1, limit: number = 10, search: string = "") => {
//     const res = await axiosClient.get('/product/', {
//         params: {page, limit, search},
//         headers : {Authorization: `Bearer ${token}`},
//     });
//     return res.data;
// }

// export const getCategories = async () => {
//     const res = await axiosClient.get('/categories/', {
//         headers: {Authorization: `Bearer ${token}`}
//     });
//     return res.data
// }


// export const createProduct = async (formData: FormData) => {
//   const res = await axiosClient.post('/product/', formData, {
//     headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
//   });
//   return res.data;
// };

// export const updateProduct = async (id: string, formData: FormData) => {
//   const res = await axiosClient.put(`/product/${id}`, formData, {
//     headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
//   });
//   return res.data;
// };

// export const deleteProduct = async (id: string) => {
//   const res = await axiosClient.delete(`/product/${id}`, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   return res.data;
// };

// export const getProductById = async (id: string) => {
//   const res = await axiosClient.get(`/product/${id}`, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   return res.data;
// };

