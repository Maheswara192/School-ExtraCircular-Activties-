
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

const AdminPrivateRoute = () => {
    return isAuthenticated() ? <Outlet /> : <Navigate to="/admin/login" />;
};

export default AdminPrivateRoute;
