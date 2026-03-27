import axios from 'axios';

// ตรวจสอบว่ากำลังรันใน environment ไหน
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
    baseURL,
    withCredentials: true // คุยกับ Backend ให้ส่ง Cookies/Auth Header ไปด้วย
});

// ดักจับทุกๆ Request ขาออกเพื่อแนบ Token ลงไป
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // แนบ Token ใส่ใน Header
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;
