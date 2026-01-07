import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaChartPie, FaCalendarDay, FaClipboardCheck, FaTrophy, FaHome, FaSignOutAlt } from 'react-icons/fa';

const Sidebar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="admin-sidebar">
            <div className="sidebar-logo">Admin Panel</div>
            <nav className="sidebar-nav">
                <NavLink to="/admin/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                    <FaChartPie /> Dashboard
                </NavLink>
                <NavLink to="/admin/events" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                    <FaCalendarDay /> Manage Events
                </NavLink>
                <NavLink to="/admin/applications" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                    <FaClipboardCheck /> Applications
                </NavLink>
                <NavLink to="/admin/results" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                    <FaTrophy /> Results Entry
                </NavLink>
                <NavLink to="/admin/analytics" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                    <FaChartPie /> Participation
                </NavLink>

                <div style={{ margin: '1rem 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}></div>

                <NavLink to="/" className="sidebar-link" style={{ color: '#60a5fa' }}>
                    <FaHome /> Back to Website
                </NavLink>
            </nav>
            <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                <button
                    onClick={() => {
                        logout();
                        navigate('/admin/login');
                    }}
                    className="sidebar-link"
                    style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', font: 'inherit', color: '#f87171' }}
                >
                    <FaSignOutAlt /> Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
