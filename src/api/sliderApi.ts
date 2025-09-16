
// import axiosClient from "./axiosClient";

// export interface SliderData {
//     _id?: string;
//     title: string;
//     image: string; // url
//     isActive?: boolean;
//     createdAt?: string;
//     updatedAt?: string;
// }

// const getAuthHeader = () => {
//     const token = localStorage.getItem("token");
//     return {
//         Authorization: `Bearer ${token}`,
//     };
// };


// export const getSliders = () => axiosClient.get("/slider/")

// export const createSlider = (data: FormData) => {
//     axiosClient.post("/slider/", data, { headers: { 
//         // ...getAuthHeader(),
//         "Content-Type": "multipart/form-data", 
//     } })
// }

// export const updateSlider = async (id: string, data: FormData | Record<string, any>) => {
//   const headers = getAuthHeader();
//   if (data instanceof FormData) {
//     return axiosClient.put(`/slider/${id}`, data, {
//       headers: {
//         ...headers,
//         "Content-Type": "multipart/form-data",
//       },
//     });
//   } else {
//     return axiosClient.put(`/slider/${id}`, data, {
//       headers: {
//         ...headers,
//         "Content-Type": "application/json",
//       },
//     });
//   }
// };

// export const deleteSlider = async (id: string) => {
//   return axiosClient.delete(`/slider/${id}`, {
//     headers: getAuthHeader(),
//   });
// };

import axiosClient from "./axiosClient";

export const sliderApi = {
  getAll: () => axiosClient.get("/slider"),
  create: (data: FormData) =>
    axiosClient.post("/slider", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id: string, data: FormData) =>
    axiosClient.put(`/slider/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id: string) => axiosClient.delete(`/slider/${id}`),
};
