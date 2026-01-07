
import React, { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import '../admin.css';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

const AdminLayout = () => {
    const { isAuthenticated, loading } = useAuth();
    const token = localStorage.getItem('adminToken');
    const socket = useSocket();

    useEffect(() => {
        if (socket && isAuthenticated) {
            socket.on('new_application', (data) => {
                toast.success(`New Application from ${data.studentName}!`, {
                    duration: 5000,
                    icon: '🎉'
                });
            });

            return () => {
                socket.off('new_application');
            };
        }
    }, [socket, isAuthenticated]);

    // If context is loading, show loader
    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading Admin Panel...</div>;
    }

    // Double check: If context says NO, but localStorage has token, we might be in a race condition or hydration phase. 
    // However, usually we trust context. 
    // If NOT authenticated, redirect.
    if (!isAuthenticated && !token) {
        return <Navigate to="/admin/login" replace />;
    }

    return (
        <div className="admin-layout">
            <Sidebar />
            <div className="admin-content">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;
