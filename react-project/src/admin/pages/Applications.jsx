
import React, { useEffect, useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { toast } from 'react-hot-toast';
import StatusBadge from '../components/StatusBadge';
import adminApi from '../utils/api';
import '../admin.css';

const Applications = () => {
    const [applications, setApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('All');

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentApplication, setCurrentApplication] = useState(null);
    const [editFormData, setEditFormData] = useState({
        studentName: '',
        class: '',
        section: '',
        rollNumber: '',
        phone: '',
        activity: ''
    });

    const openEditModal = (app) => {
        setCurrentApplication(app);
        setEditFormData({
            studentName: app.studentName || '',
            class: app.class || '',
            section: app.section || '',
            rollNumber: app.rollNumber || '',
            phone: app.phone || '',
            activity: app.activity || ''
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await adminApi.put(`/applications/${currentApplication._id}`, editFormData);
            // Update local state
            setApplications(prev => prev.map(app => app._id === currentApplication._id ? res.data : app));
            setIsEditModalOpen(false);
            toast.success("Application updated successfully");
        } catch (error) {
            toast.error("Failed to update application: " + (error.response?.data?.message || "Unknown error"));
        }
    };

    // Fetch apps
    useEffect(() => {
        fetchApplications();
        fetchApplications();
    }, []);

    // Real-Time Updates
    const socket = useSocket();
    useEffect(() => {
        if (!socket) return;

        const handleNewApp = (newApp) => {
            setApplications(prev => [newApp, ...prev]);
            toast.success(`New application received: ${newApp.studentName}`);
        };

        const handleUpdateApp = (updatedApp) => {
            setApplications(prev => prev.map(app => app._id === updatedApp._id ? updatedApp : app));
        };

        socket.on('new_application', handleNewApp);
        socket.on('application_updated', handleUpdateApp);

        return () => {
            socket.off('new_application', handleNewApp);
            socket.off('application_updated', handleUpdateApp);
        };
    }, [socket]);

    // Filter effect
    useEffect(() => {
        if (statusFilter === 'All') {
            setFilteredApplications(applications);
        } else {
            setFilteredApplications(applications.filter(app => app.status && app.status.toLowerCase() === statusFilter.toLowerCase()));
        }
    }, [statusFilter, applications]);

    const fetchApplications = async () => {
        try {
            const res = await adminApi.get('/applications');
            const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
            setApplications(data);
            setFilteredApplications(data);
        } catch (error) {
            console.error("Failed to fetch applications", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await adminApi.put(`/applications/${id}`, { status: newStatus });
            setApplications(prev => prev.map(app => app._id === id ? { ...app, status: newStatus } : app));
        } catch (error) {
            toast.error("Failed to update status: " + (error.response?.data?.message || "Unknown error"));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this application?")) {
            try {
                await adminApi.delete(`/applications/${id}`);
                setApplications(prev => prev.filter(app => app._id !== id));
            } catch (error) {
                toast.error("Failed to delete application");
            }
        }
    };

    const downloadCSV = () => {
        const headers = ["ID,Student Name,Class,Roll Number,Phone,Activity,Status,Date"];
        const rows = filteredApplications.map(app => [
            app._id,
            `"${(app.studentName || '').replace(/"/g, '""')}"`,
            app.class,
            app.rollNumber,
            app.phone,
            `"${(app.activity || '').replace(/"/g, '""')}"`,
            app.status,
            new Date(app.createdAt).toLocaleDateString()
        ].join(','));

        const csvContent = headers.concat(rows).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `applications_export_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Student Applications</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn" onClick={downloadCSV} style={{ backgroundColor: '#6366f1', color: 'white' }}>
                        Export CSV
                    </button>
                    <select
                        className="form-select"
                        style={{ width: '200px' }}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Activity</th>
                            <th>Review Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center' }}>Loading...</td></tr>
                        ) : filteredApplications.map(app => (
                            <tr key={app._id}>
                                <td>
                                    {app.studentName}
                                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)' }}>
                                        {app.class} - {app.rollNumber}
                                    </div>
                                </td>
                                <td>
                                    {app.activity}
                                    {app.eventId && app.eventId.category && (
                                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)' }}>
                                            {app.eventId.category}
                                        </div>
                                    )}
                                </td>
                                <td><StatusBadge status={app.status} /></td>
                                <td>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <button
                                            className="btn btn-sm"
                                            style={{ backgroundColor: '#3b82f6', color: 'white' }}
                                            onClick={() => openEditModal(app)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-sm"
                                            style={{ backgroundColor: '#10b981', color: 'white' }}
                                            onClick={() => handleStatusUpdate(app._id, 'Accepted')}
                                            disabled={app.status === 'Accepted'}
                                        >
                                            Accept
                                        </button>
                                        <button
                                            className="btn btn-sm"
                                            style={{ backgroundColor: '#ef4444', color: 'white' }}
                                            onClick={() => handleStatusUpdate(app._id, 'Rejected')}
                                            disabled={app.status === 'Rejected'}
                                        >
                                            Reject
                                        </button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(app._id)}>Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!loading && filteredApplications.length === 0 && (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', color: 'var(--admin-text-light)' }}>No applications found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit Application Modal */}
            {isEditModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <span>Edit Application</span>
                            <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                        </div>
                        <form onSubmit={handleEditSubmit}>
                            <div className="form-group">
                                <label className="form-label">Student Name</label>
                                <input
                                    className="form-input"
                                    value={editFormData.studentName}
                                    onChange={(e) => setEditFormData({ ...editFormData, studentName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Class</label>
                                <input
                                    className="form-input"
                                    value={editFormData.class}
                                    onChange={(e) => setEditFormData({ ...editFormData, class: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Section</label>
                                <input
                                    className="form-input"
                                    value={editFormData.section}
                                    onChange={(e) => setEditFormData({ ...editFormData, section: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Roll Number</label>
                                <input
                                    className="form-input"
                                    value={editFormData.rollNumber}
                                    onChange={(e) => setEditFormData({ ...editFormData, rollNumber: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone</label>
                                <input
                                    className="form-input"
                                    value={editFormData.phone}
                                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Activity</label>
                                <input
                                    className="form-input"
                                    value={editFormData.activity}
                                    onChange={(e) => setEditFormData({ ...editFormData, activity: e.target.value })}
                                    required
                                />
                                <small style={{ color: '#64748b' }}>Note: Changing activity does not check capacity rules.</small>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Applications;
