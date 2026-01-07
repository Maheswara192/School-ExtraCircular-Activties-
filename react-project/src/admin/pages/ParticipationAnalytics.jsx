import React, { useEffect, useState } from 'react';
import adminApi from '../utils/api';
import '../admin.css';
// Reusing some icons or importing new ones
import { FaUserGraduate, FaClipboardList, FaUsers, FaSearch, FaDownload, FaChartBar } from 'react-icons/fa';

const ParticipationAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('class'); // 'class', 'activity', 'student'

    // Data State
    const [classStats, setClassStats] = useState([]);
    const [activityStats, setActivityStats] = useState([]);
    const [studentStats, setStudentStats] = useState([]);

    // Drill-down State
    const [drillDownData, setDrillDownData] = useState(null); // If set, show drill-down modal/view
    const [drillDownType, setDrillDownType] = useState(null); // 'class_details'

    useEffect(() => {
        fetchAllStats();
    }, []);

    const fetchAllStats = async () => {
        try {
            setLoading(true);
            const [classRes, activityRes, studentRes] = await Promise.all([
                adminApi.get('/admin/participation/class-wise'),
                adminApi.get('/admin/participation/activity-wise'),
                adminApi.get('/admin/participation/student-wise')
            ]);
            setClassStats(classRes.data);
            setActivityStats(activityRes.data);
            setStudentStats(studentRes.data);
        } catch (error) {
            console.error("Failed to fetch analytics", error);
        } finally {
            setLoading(false);
        }
    };

    // --- Components ---

    const SummaryCards = () => {
        // Calculate Totals locally for immediate feedback
        const totalStudents = studentStats.length; // Actually distict students from student-wise endpoint
        // Sum of all participants in activities (duplicate allowed across activities)
        const totalParticipations = activityStats.reduce((acc, curr) => acc + curr.participantCount, 0);
        const totalActivities = activityStats.length;

        return (
            <div className="grid-3" style={{ marginBottom: '2rem' }}>
                <div className="card-stat">
                    <div className="stat-icon" style={{ background: '#e0e7ff', color: '#4338ca' }}><FaUserGraduate /></div>
                    <div className="stat-info">
                        <h3>{totalStudents}</h3>
                        <p>Total Participating Students</p>
                    </div>
                </div>
                <div className="card-stat">
                    <div className="stat-icon" style={{ background: '#dcfce7', color: '#15803d' }}><FaClipboardList /></div>
                    <div className="stat-info">
                        <h3>{totalParticipations}</h3>
                        <p>Total Participation Entries</p>
                    </div>
                </div>
                <div className="card-stat">
                    <div className="stat-icon" style={{ background: '#ffedd5', color: '#c2410c' }}><FaChartBar /></div>
                    <div className="stat-info">
                        <h3>{totalActivities}</h3>
                        <p>Active Activities</p>
                    </div>
                </div>
            </div>
        );
    };

    const ClassTable = () => (
        <div className="table-container fade-in">
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Class Name</th>
                        <th>Participating Students</th>
                        <th>Total Activities</th>
                        <th>Unique Activities</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {classStats.map((cls, idx) => (
                        <tr key={idx}>
                            <td style={{ fontWeight: 'bold' }}>{cls.className}</td>
                            <td>{cls.studentCount}</td>
                            <td>{cls.activityCount}</td>
                            <td>{cls.uniqueActivitiesCount}</td>
                            <td>
                                <button className="btn btn-sm" onClick={() => handleDrillDown('class_details', cls)}>View Students</button>
                            </td>
                        </tr>
                    ))}
                    {classStats.length === 0 && <tr><td colSpan="5" className="text-center">No data available</td></tr>}
                </tbody>
            </table>
        </div>
    );

    const ActivityTable = () => (
        <div className="table-container fade-in">
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Activity Name</th>
                        <th>Total Participants</th>
                        <th>Classes Involved</th>
                    </tr>
                </thead>
                <tbody>
                    {activityStats.map((act, idx) => (
                        <tr key={idx}>
                            <td style={{ fontWeight: '600' }}>{act.activityName}</td>
                            <td>
                                <span className="badge badge-success" style={{ fontSize: '0.9rem' }}>{act.participantCount}</span>
                            </td>
                            <td>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {act.classesInvolved.sort().map(c => (
                                        <span key={c} style={{ background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem', border: '1px solid #e2e8f0' }}>{c}</span>
                                    ))}
                                </div>
                            </td>
                        </tr>
                    ))}
                    {activityStats.length === 0 && <tr><td colSpan="3" className="text-center">No data available</td></tr>}
                </tbody>
            </table>
        </div>
    );

    // Student list with basic client-side search
    const StudentTable = () => {
        const [searchTerm, setSearchTerm] = useState('');
        const filtered = studentStats.filter(s =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return (
            <div className="fade-in">
                <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative', maxWidth: '300px', width: '100%' }}>
                        <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Search by Name or Roll No..."
                            style={{ paddingLeft: '2.5rem' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Roll No</th>
                                <th>Name</th>
                                <th>Class</th>
                                <th>Participation Count</th>
                                <th>Activities</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((stu, idx) => (
                                <tr key={idx}>
                                    <td>{stu.rollNumber}</td>
                                    <td>{stu.name}</td>
                                    <td>{stu.class} {stu.section}</td>
                                    <td>{stu.activityCount}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            {stu.activities.map((act, i) => (
                                                <span key={i} className="badge badge-promoted" style={{ fontSize: '0.8rem' }}>{act}</span>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && <tr><td colSpan="5" className="text-center">No students found</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    // Drill Down Modal
    const handleDrillDown = (type, data) => {
        setDrillDownType(type);
        setDrillDownData(data);
    };

    const closeDrillDown = () => {
        setDrillDownType(null);
        setDrillDownData(null);
    };

    const DrillDownView = () => {
        if (!drillDownData) return null;

        // Filter students for this specific class
        const studentsInClass = studentStats.filter(s => s.class === drillDownData.className);

        return (
            <div className="modal-overlay">
                <div className="modal-content" style={{ maxWidth: '800px', width: '95%', maxHeight: '85vh', overflowY: 'auto' }}>
                    <div className="modal-header">
                        <span>Details for Class: {drillDownData.className}</span>
                        <button onClick={closeDrillDown} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                    </div>
                    <div style={{ padding: '1rem 0' }}>
                        <h4>Participating Students ({studentsInClass.length})</h4>
                        <div className="table-container" style={{ marginTop: '1rem' }}>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Roll No</th>
                                        <th>Name</th>
                                        <th>Activities</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentsInClass.map((s, i) => (
                                        <tr key={i}>
                                            <td>{s.rollNumber}</td>
                                            <td>{s.name}</td>
                                            <td>{s.activities.join(', ')}</td>
                                        </tr>
                                    ))}
                                    {studentsInClass.length === 0 && <tr><td colSpan="3">No students found</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const exportData = () => {
        // Simple CSV Export Logic for current view
        let csvContent = "data:text/csv;charset=utf-8,";
        if (activeTab === 'class') {
            csvContent += "Class,Total Students,Total Activities\n";
            classStats.forEach(row => {
                csvContent += `${row.className},${row.studentCount},${row.activityCount}\n`;
            });
        } else if (activeTab === 'activity') {
            csvContent += "Activity,Participants,Classes\n";
            activityStats.forEach(row => {
                csvContent += `${row.activityName},${row.participantCount},${row.classesInvolved.join(';')}\n`;
            });
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `analytics_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Participation Analytics</h1>
                <button className="btn btn-secondary" onClick={exportData}><FaDownload style={{ marginRight: '0.5rem' }} /> Export Report</button>
            </div>

            {loading ? <div className="text-center">Loading Analytics...</div> : (
                <>
                    <SummaryCards />

                    {/* Tabs */}
                    <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', gap: '2rem' }}>
                        {['class', 'activity', 'student'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '0 0 0.75rem 0',
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                                    color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                                    fontWeight: activeTab === tab ? '600' : '500',
                                    cursor: 'pointer',
                                    textTransform: 'capitalize',
                                    fontSize: '1rem'
                                }}
                            >
                                {tab}-wise View
                            </button>
                        ))}
                    </div>

                    {activeTab === 'class' && <ClassTable />}
                    {activeTab === 'activity' && <ActivityTable />}
                    {activeTab === 'student' && <StudentTable />}
                </>
            )}

            {drillDownType && <DrillDownView />}
        </div>
    );
};

export default ParticipationAnalytics;
