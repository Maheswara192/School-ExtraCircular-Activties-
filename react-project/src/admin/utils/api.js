
import axios from 'axios';

const adminApi = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Request interceptor to add the admin token to the header
adminApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle 401 Unauthorized responses
adminApi.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error Response:", error.response);
        if (error.response && error.response.status === 401) {
            console.warn("Received 401 Unauthorized. Token might be invalid or expired.");
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            window.location.href = '/admin/login';
        }
        return Promise.reject(error);
    }
);

export default adminApi;
