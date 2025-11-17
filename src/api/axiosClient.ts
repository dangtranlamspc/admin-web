import axios from 'axios';

const axiosClient = axios.create({
    baseURL : import.meta.env.VITE_API_BASE,
    // baseURL : import.meta.env.VITE_LOCAL_API,
    headers: {
        'Content-Type' : 'application/json'
    },
})

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;