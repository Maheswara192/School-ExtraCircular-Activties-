
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApi from '../admin/utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('adminToken'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initialize state from local storage on load
        const storedUser = localStorage.getItem('adminUser');
        const storedToken = localStorage.getItem('adminToken');

        if (storedToken && storedUser) {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await adminApi.post('/auth/login', { email, password });
            const { token, role, ...userData } = response.data;

            if (role !== 'admin') {
                throw new Error('Unauthorized Access: Admins only.');
            }

            const adminUser = { ...userData, role };

            // Storage
            localStorage.setItem('adminToken', token);
            localStorage.setItem('adminUser', JSON.stringify(adminUser));

            // State
            setToken(token);
            setUser(adminUser);

            return adminUser;
        } catch (error) {
            throw error.response?.data?.message || 'Login failed';
        }
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setToken(null);
        setUser(null);
        // Note: Navigation might need to be handled by the component calling logout or via useEffect in App
    };

    const isAuthenticated = !!token && user?.role === 'admin';
    console.log("AuthContext: isAuthenticated?", isAuthenticated, "Token:", !!token, "Role:", user?.role);

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
