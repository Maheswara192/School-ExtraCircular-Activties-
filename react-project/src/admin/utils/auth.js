
import adminApi from './api';

export const loginAdmin = async (email, password) => {
    try {
        const response = await adminApi.post('/auth/login', { email, password });
        const { token, role, ...user } = response.data;

        if (role !== 'admin') {
            throw new Error('Unauthorized Access: Admins only.');
        }

        if (token) {
            localStorage.setItem('adminToken', token);
            localStorage.setItem('adminUser', JSON.stringify({ ...user, role }));
        }
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || error.message || 'Login failed';
    }
};

export const logoutAdmin = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin/login';
};

export const getAdminUser = () => {
    const user = localStorage.getItem('adminUser');
    return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
    const token = localStorage.getItem('adminToken');
    const user = getAdminUser();
    return !!token && user?.role === 'admin';
};
