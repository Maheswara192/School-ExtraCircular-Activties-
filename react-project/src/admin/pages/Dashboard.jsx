
import React, { useEffect, useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import adminApi from '../utils/api';
import '../admin.css';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalEvents: 0,
        totalApplications: 0,
        pendingApplications: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log("Dashboard Mounted. Fetching stats...");
        const fetchStats = async () => {
            try {
                // Fetch events and applications in parallel
                const [eventsRes, appsRes] = await Promise.all([
                    adminApi.get('/events'),
                    adminApi.get('/applications')
                ]);

                // Handle potential response structures
                const events = Array.isArray(eventsRes.data) ? eventsRes.data : (eventsRes.data.data || []);
                const applications = Array.isArray(appsRes.data) ? appsRes.data : (appsRes.data.data || []);

                const pending = applications.filter(app =>
                    (app.status && app.status.toLowerCase() === 'pending')
                ).length;

                setStats({
                    totalEvents: events.length,
                    totalApplications: applications.length,
                    pendingApplications: pending
                });
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
                setError("Failed to load dashboard statistics.");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Real-Time Updates
    const socket = useSocket();
    useEffect(() => {
        if (!socket) return;

        const handleNewApp = () => {
            // Simple increment for better UX without full re-fetch overhead
            setStats(prev => ({
                ...prev,
                totalApplications: prev.totalApplications + 1,
                pendingApplications: prev.pendingApplications + 1
            }));
        };

        socket.on('new_application', handleNewApp);

        return () => {
            socket.off('new_application', handleNewApp);
        };
    }, [socket]);

    return (
        <div>
            <header style={{ marginBottom: '2rem' }}>
                <h1>Dashboard</h1>
                <p style={{ color: 'var(--admin-text-light)' }}>Welcome to the admin overview.</p>
            </header>

            {loading ? (
                <div>Loading stats...</div>
            ) : error ? (
                <div className="error-alert">{error}</div>
            ) : (
                <div className="dashboard-grid">
                    <div className="stat-card">
                        <span className="stat-label">Total Events</span>
                        <span className="stat-value">{stats.totalEvents}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Total Applications</span>
                        <span className="stat-value">{stats.totalApplications}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Pending Applications</span>
                        <span className="stat-value" style={{ color: 'var(--admin-warning)' }}>
                            {stats.pendingApplications}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
